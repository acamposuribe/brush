/**
 * @fileoverview brush.js - A comprehensive toolset for brush management in vanilla js.
 * @version 0.0.1
 * @license MIT
 * @author Alejandro Campos Uribe
 *
 * @description
 * brush.js is a javascript library dedicated to the creation and management of custom brushes.
 * It extends the drawing capabilities of the canvas api by allowing users to simulate a wide range
 * of brush strokes, vector fields, hatching patterns, and fill textures. These features
 * are essential for emulating the nuanced effects found in traditional sketching and painting.
 * Whether for digital art applications or procedural generation of graphics, brush.js provides
 * a robust framework for artists and developers to create rich, dynamic, and textured visuals.
 *
 * @license
 * MIT License
 *
 * Copyright (c) 2024 Alejandro Campos Uribe
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

// =============================================================================
// Section: Configure and Initiate
// =============================================================================
/**
 * This section contains functions for setting up the drawing system. It allows
 * for configuration with custom options, initialization of the system, preloading
 * necessary assets, and a check to ensure the system is ready before any drawing
 * operation is performed.
 */

const Canvases = {};
let cID, Cwidth, Cheight, Density, isMobile;

/**
 * Flag to indicate if the system is ready for rendering.
 * @type {boolean}
 */
let _isReady = false;

export function load(canvasID, canvas) {
  cID = canvasID;
  if (!Canvases[cID]) {
    // If library has still not been loaded into the canvas, we do so.
    Canvases[cID] = {};
    Canvases[cID].canvas = canvas;
  }
  Cwidth = Canvases[cID].canvas.width;
  Cheight = Canvases[cID].canvas.height;
  if (!_isReady) {
    _isReady = true;
    FF.create(); // Load flowfield system
  }
  Mix.load();
}

/**
 * Preloads necessary assets or configurations.
 * This function should be called before setup to ensure all assets are loaded.
 */
export function preload() {
  // Load custom image tips
  T.load();
}

/**
 * Ensures that the drawing system is ready before any drawing operation.
 * Loads the system if it hasn't been loaded already.
 */
function _ensureReady() {
  if (!_isReady) load();
}

export function setDensity(d) {
  Density = d;
  scaleBrushes(Density);
}

export function setMobile(bool = true) {
  isMobile = bool;
}

if (!HTMLCanvasElement.prototype.transferControlToOffscreen) setMobile();

// =============================================================================
// Section: Randomness and other auxiliary functions
// =============================================================================
/**
 * This section includes utility functions for randomness, mapping values,
 * constraining numbers within a range, and precalculated trigonometric values
 * to optimize performance. Additionally, it provides auxiliary functions for
 * geometric calculations such as translation extraction, line intersection,
 * and angle calculation.
 */

import { createNoise2D } from "simplex-noise";
import { prng_alea } from "esm-seedrandom";

/**
 * The basic sources of randomness for random and noise
 * They can be seeded for determinism.
 */
let rng = prng_alea(Math.random());
export function seed(s) {
  rng = prng_alea(s);
}

let noise_rng = prng_alea(Math.random());
export let noise = createNoise2D(noise_rng);
export function noiseSeed(s) {
  noise = createNoise2D(prng_alea(s));
}

/**
 * Object for random number generation and related utility functions.
 * @property {function} source - Function that returns a random number from the base random generator.
 * @property {function} random - Function to generate a random number within a specified range.
 * @property {function} randInt - Function to generate a random integer within a specified range.
 * @property {function} weightedRand - Function to generate a random value based on weighted probabilities.
 * @property {function} map - Function to remap a number from one range to another.
 * @property {function} constrain - Function to constrain a number within a range.
 * @property {function} cos - Function to get the cosine of an angle from precalculated values.
 * @property {function} sin - Function to get the sine of an angle from precalculated values.
 * @property {boolean} isPrecalculationDone - Flag to check if precalculation of trigonometric values is complete.
 * @property {function} preCalculation - Function to precalculate trigonometric values.
 */
const R = {
  /**
   * Generates a random number within a specified range.
   * @param {number | Array} [min=0] - The lower bound of the range or an Array.
   * @param {number} [max=1] - The upper bound of the range.
   * @returns {number} A random number within the specified range or a random element of an array.
   */
  random(e = 0, r = 1) {
    if (Array.isArray(e)) return e[~~(rng() * e.length)];
    if (arguments.length === 1) return rng() * e;
    return R.rr(...arguments);
  },

  rr: (e = 0, r = 1) => e + rng() * (r - e),

  /**
   * Generates a random integer within a specified range.
   * @param {number} min - The lower bound of the range.
   * @param {number} max - The upper bound of the range.
   * @returns {number} A random integer within the specified range.
   */
  randInt: (e, r) => ~~R.rr(e, r),

  /**
   * Generates a random gaussian.
   * @param {number} mean - Mean.
   * @param {number} stdev - Standard deviation.
   * @returns {number} A random number following a normal distribution.
   */
  gaussian(mean = 0, stdev = 1) {
    const u = 1 - rng();
    const v = rng();
    const z = Math.sqrt(-2.0 * Math.log(u)) * this.cos(360 * v);
    return z * stdev + mean;
  },

  pseudoGaussian(mean = 0, stdev = 1) {
    return mean - stdev * 2 + ((rng() + rng() + rng()) / 3) * stdev * 4;
  },

  /**
   * Generates a random value based on weighted probabilities.
   * @param {Object} weights - An object containing values as keys and their probabilities as values.
   * @returns {string} A key randomly chosen based on its weight.
   */
  weightedRand(e) {
    let r,
      a,
      n = [];
    for (r in e) for (a = 0; a < 10 * e[r]; a++) n.push(r);
    let v = n[Math.floor(rng() * n.length)];
    return isNaN(v) ? v : parseInt(v);
  },

  /**
   * Remaps a number from one range to another.
   * @param {number} value - The number to remap.
   * @param {number} a - The lower bound of the value's current range.
   * @param {number} b- The upper bound of the value's current range.
   * @param {number} c - The lower bound of the value's target range.
   * @param {number} d - The upper bound of the value's target range.
   * @param {boolean} [withinBounds=false] - Whether to constrain the value to the target range.
   * @returns {number} The remapped number.
   */
  map(value, a, b, c, d, withinBounds = false) {
    let r = c + ((value - a) / (b - a)) * (d - c);
    if (!withinBounds) return r;
    if (c < d) {
      return this.constrain(r, c, d);
    } else {
      return this.constrain(r, d, c);
    }
  },

  /**
   * Constrains a number to be within a range.
   * @param {number} n - The number to constrain.
   * @param {number} low - The lower bound of the range.
   * @param {number} high - The upper bound of the range.
   * @returns {number} The constrained number.
   */
  constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
  },

  nAngle(angle) {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  },

  /**
   * Calculates the cosine for a given angle using precalculated values.
   * @param {number} angle - The angle in degrees.
   * @returns {number} The cosine of the angle.
   */
  cos(angle) {
    return this.c[~~(4 * this.nAngle(angle))];
  },

  /**
   * Calculates the sine for a given angle using precalculated values.
   * @param {number} angle - The angle in degrees.
   * @returns {number} The sine of the angle.
   */
  sin(angle) {
    return this.s[~~(4 * this.nAngle(angle))];
  },
  // Flag to indicate if the trigonometric tables have been precalculated
  isPrecalculationDone: false,

  /**
   * Precalculates trigonometric values for improved performance.
   * This function should be called before any trigonometric calculations are performed.
   */
  preCalculation() {
    if (this.isPrecalculationDone) return;
    const totalDegrees = 1440;
    const radiansPerIndex = (2 * Math.PI) / totalDegrees;
    this.c = new Float32Array(totalDegrees);
    this.s = new Float32Array(totalDegrees);
    for (let i = 0; i < totalDegrees; i++) {
      const radians = i * radiansPerIndex;
      R.c[i] = Math.cos(radians);
      R.s[i] = Math.sin(radians);
    }
    this.isPrecalculationDone = true;
  },

  /**
   * Checks if value is numeric
   */
  isNumber: (a) => !isNaN(a),

  /**
   * Changes angles to degrees and between 0-360
   */
  toDegrees: (a) => {
    let angle = ((a * 180) / Math.PI) % 360;
    return angle < 0 ? angle + 360 : angle;
  },

  /**
   * Calculates distance between two 2D points
   */
  dist: (x1, y1, x2, y2) =>
    Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)),

  /**
   * Calculates the angle in degrees between two points in 2D space.
   * The angle is measured in a clockwise direction from the positive X-axis.
   *
   * @param {number} x1 - The x-coordinate of the first point.
   * @param {number} y1 - The y-coordinate of the first point.
   * @param {number} x2 - The x-coordinate of the second point.
   * @param {number} y2 - The y-coordinate of the second point.
   * @returns {number} The angle in degrees between the two points.
   */
  calcAngle: (x1, y1, x2, y2) => R.toDegrees(Math.atan2(-(y2 - y1), x2 - x1)),
};
// Perform the precalculation of trigonometric values for the R object
R.preCalculation();

export const random = R.random;
export const wRand = R.weightedRand;

/**
 * Calculates the intersection point between two line segments if it exists.
 *
 * @param {Object} s1a - The start point of the first line segment.
 * @param {Object} s1b - The end point of the first line segment.
 * @param {Object} s2a - The start point of the second line segment.
 * @param {Object} s2b - The end point of the second line segment.
 * @param {boolean} [includeSegmentExtension=false] - Whether to include points of intersection not lying on the segments.
 * @returns {Object|boolean} The intersection point as an object with 'x' and 'y' properties, or 'false' if there is no intersection.
 */
function _intersectLines(s1a, s1b, s2a, s2b, includeSegmentExtension = false) {
  // Extract coordinates from points
  let x1 = s1a.x,
    y1 = s1a.y;
  let x2 = s1b.x,
    y2 = s1b.y;
  let x3 = s2a.x,
    y3 = s2a.y;
  let x4 = s2b.x,
    y4 = s2b.y;
  // Early return if line segments are points or if the lines are parallel
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false; // Segments are points
  }
  let deltaX1 = x2 - x1,
    deltaY1 = y2 - y1;
  let deltaX2 = x4 - x3,
    deltaY2 = y4 - y3;
  let denominator = deltaY2 * deltaX1 - deltaX2 * deltaY1;
  if (denominator === 0) {
    return false; // Lines are parallel
  }
  // Calculate the intersection point
  let ua = (deltaX2 * (y1 - y3) - deltaY2 * (x1 - x3)) / denominator;
  let ub = (deltaX1 * (y1 - y3) - deltaY1 * (x1 - x3)) / denominator;
  // Check if the intersection is within the bounds of the line segments
  if (!includeSegmentExtension && (ub < 0 || ub > 1)) {
    return false;
  }
  // Calculate the intersection coordinates
  let x = x1 + ua * deltaX1;
  let y = y1 + ua * deltaY1;
  return { x: x, y: y };
}

function _rotate(cx, cy, x, y, angle) {
  let cos = R.cos(angle),
    sin = R.sin(angle),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return { x: nx, y: ny };
}

/**
 * Object that saves the current brush state for push and pop operations
 */
const _saveState = {
  field: {},
  stroke: {},
  hatch: {},
  fill: {},
};

/**
 * Saves current state to object
 */
export function push() {
  Mix.ctx.save();
  // Field
  _saveState.field.isActive = FF.isActive;
  _saveState.field.current = FF.current;

  // Stroke
  _saveState.stroke.isActive = B.isActive;
  _saveState.stroke.name = B.name;
  _saveState.stroke.color = B.c;
  _saveState.stroke.weight = B.w;
  _saveState.stroke.clip = B.cr;

  // Hatch
  _saveState.hatch.isActive = H.isActive;
  _saveState.hatch.hatchingParams = H.hatchingParams;
  _saveState.hatch.hatchingBrush = H.hatchingBrush;

  // Fill
  _saveState.fill.isActive = F.isActive;
  _saveState.fill.color = F.color;
  _saveState.fill.opacity = F.opacity;
  _saveState.fill.bleed_strength = F.bleed_strength;
  _saveState.fill.texture_strength = F.texture_strength;
  _saveState.fill.border_strength = F.border_strength;
}

/**
 * Restores previous state from object
 */
export function pop() {
  Mix.ctx.restore();
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;

  // Field
  FF.isActive = _saveState.field.isActive;
  FF.current = _saveState.field.current;

  // Stroke
  B.isActive = _saveState.stroke.isActive;
  B.name = _saveState.stroke.name;
  B.c = _saveState.stroke.color;
  B.w = _saveState.stroke.weight;
  B.cr = _saveState.stroke.clip;

  // Hatch
  H.isActive = _saveState.hatch.isActive;
  H.hatchingParams = _saveState.hatch.hatchingParams;
  H.hatchingBrush = _saveState.hatch.hatchingBrush;

  // Fill
  F.isActive = _saveState.fill.isActive;
  F.color = _saveState.fill.color;
  F.opacity = _saveState.fill.opacity;
  F.bleed_strength = _saveState.fill.bleed_strength;
  F.texture_strength = _saveState.fill.texture_strength;
  F.border_strength = _saveState.fill.border_strength;
}

// =============================================================================
// Section: Color Blending - Uses spectral.js as a module
// =============================================================================
/**
 * The Mix object is responsible for handling color blending operations within
 * the rendering context. It utilizes WebGL shaders to apply advanced blending
 * effects based on Kubelka-Munk theory. It depends on spectral.js for the
 * blending logic incorporated into its fragment shader.
 */

function RGBr(color) {
  color = new Color(color);
  return isMobile
    ? `rgb(${color.r} ${color.g} ${color.b} / `
    : "rgb(255 0 0 / ";
}

/**
 * Class to deal with colours and their conversion
 */
let colorCanvas = document.createElement("canvas");
colorCanvas.width = 1;
colorCanvas.height = 1;
let colorCtx = colorCanvas.getContext("2d");
class Color {
  constructor(r, g, b) {
    if (!this.g && isNaN(r)) {
      this.hex = this.standardize(r);
      let rgb = this.hexToRgb(this.hex);
      (this.r = rgb.r), (this.g = rgb.g), (this.b = rgb.b);
    } else {
      (this.r = r), (this.g = !g ? r : g), (this.b = !b ? r : b);
      this.hex = this.rgbToHex(this.r, this.g, this.b);
    }
    this.gl = [this.r / 255, this.g / 255, this.b / 255, 1];
  }
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  standardize(str) {
    colorCtx.fillStyle = str;
    return colorCtx.fillStyle;
  }
}

/**
 * The web worker deals with WebGL stuff for clean organisation
 */
import { gl_worker } from "./workers.js";

/**
 * Object handling blending operations with WebGL shaders.
 * @property {boolean} loaded - Flag indicating if the blend shaders have been loaded.
 * @property {boolean} isBlending - Flag indicating if the blending has been initiated.
 * @property {obj} currentColor - Holds color values for shaders.
 * @property {function} load - Loads resources and initializes blend operations.
 * @property {function} blend - Applies blending effects using the initialized shader.
 */
const Mix = {
  loaded: false,
  isBlending: false,
  currentColor: new Color("white").gl,

  /**
   * Loads necessary resources and prepares the mask buffer and shader for colour blending.
   */
  load() {
    if (!isMobile) {
      if (!Canvases[cID].worker) {
        let ca = Canvases[cID];
        // Create 2d offscreen mask
        ca.mask = new OffscreenCanvas(Cwidth, Cheight);
        ca.ctx = ca.mask.getContext("2d");
        ca.ctx.lineWidth = 0;

        // Create offscreen webgl canvas and link to main canvas
        ca.offscreen = Canvases[cID].canvas.transferControlToOffscreen();
        // Init worker
        ca.worker = gl_worker();
        ca.worker.postMessage("init");
        // Send Offscreen webgl canvas to web worker as transferrable object
        ca.worker.postMessage({ canvas: ca.offscreen }, [ca.offscreen]);
      }

      this.mask = Canvases[cID].mask;
      this.ctx = Canvases[cID].ctx;
      this.worker = Canvases[cID].worker;
    } else {
      if (!Canvases[_r].worker) {
        let ca = Canvases[_r];
        ca.ctx = ca.canvas.getContext("2d");
        ca.ctx.lineWidth = 0;
        ca.worker = true;
      }
      (this.mask = false), (this.worker = Canvases[_r].worker);
      this.ctx = Canvases[_r].ctx;
    }
  },

  /**
   * Applies the blend shader to the current rendering context.
   * @param {string} _c - The color used for blending, as a Color object.
   * @param {boolean} _isLast - Indicates if this is the last blend after setup and draw.
   * @param {boolean} _isLast - Indicates if this is the last blend after setup and draw.
   */
  blend(_color = false, _isLast = false, _isImg = false) {
    if (isMobile) return;
    // Check if blending is initialised
    if (!this.isBlending) {
      // If color has been provided, we initialise blending
      if (_color) (this.currentColor = _color.gl), (this.isBlending = true);
    }
    // Checks if newColor is the same than the cadhedColor
    // If it is the same, we wait before applying the shader for color mixing
    // If it's NOT the same, we apply the shader and cache the new color
    let newColor = !_color ? this.currentColor : _color.gl;

    let cond;
    if (_isLast || _isImg) cond = true;
    else cond = newColor.toString() !== this.currentColor.toString();

    if (cond) {
      let imageData = _isImg ? _isImg : this.mask.transferToImageBitmap();
      this.worker.postMessage(
        {
          addColor: this.currentColor,
          mask: imageData,
          isLast: _isLast,
          isErase: Mix.isErase,
          isImage: _isImg ? true : false,
        },
        [imageData]
      );
      this.isErase = false;
      // We cache the new color here
      if (!_isLast) this.currentColor = _color.gl;
      if (_isLast) this.isBlending = false;
    }
  },
};

/**
 * Use this function when you want to composite the final result
 */
export function endFrame() {
  Mix.blend(false, true);
}

/**
 * This function draws the background color
 */
let _bg_Color = new Color("white");
export function background(r, g, b) {
  if (r === "transparent") _bg_Color = new Color(g);
  else _bg_Color = new Color(...arguments);
  if (isMobile) {
    if (r === "transparent") {
      Mix.ctx.clearRect(0, 0, Cwidth, Cheight);
    } else {
      Mix.ctx.beginPath();
      Mix.ctx.fillStyle = _bg_Color.hex;
      Mix.ctx.fillRect(0, 0, Cwidth, Cheight);
    }
  } else {
    Mix.worker.postMessage({
      color: _bg_Color.gl,
      isBG: true,
    });
  }
}

/**
 * This function draws an image into the canvas
 */
export function drawImage(img, x = 0, y = 0, w = img.width, h = img.height) {
  if (
    Object.prototype.toString.call(img) !== "[object ImageBitmap]" ||
    x !== 0
  ) {
    Mix.ctx.drawImage(...arguments);
    img = Mix.mask.transferToImageBitmap();
  }
  Mix.blend(false, false, img);
}

/**
 * This function gets the canvas as an ImageBitmap
 */
export async function getCanvas() {
  let image;
  await new Promise(function (resolve) {
    Mix.worker.postMessage({ get: true });
    Mix.worker.onmessage = function (event) {
      if (event.data !== 0) {
        image = event.data.canvas;
        resolve();
      }
    };
  });
  return image;
}

// =============================================================================
// Section: Matrix transformations, FlowField and Position Class
// =============================================================================
/**
 * This section includes functions and objects for creating and managing vector fields.
 * These fields can guide the motion of particles or brush strokes in a canvas, creating complex and
 * dynamic visual patterns.
 */

/**
 * Object to store matrix translation and rotation operations
 */
const Matrix = { x: 0, y: 0 };

/**
 * Translate function
 */
export function translate(x, y) {
  Mix.ctx.translate(x, y);
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;
}

/**
 * Captures the desired rotation.
 */
export function rotate(a = 0) {
  Mix.ctx.rotate(a);
}

/**
 * Object to perform scale operations
 */
export function scale(a) {
  Mix.ctx.scale(a);
}

/**
 * Activates a specific vector field by name, ensuring it's ready for use.
 * @param {string} a - The name of the vector field to activate.
 */
export function field(a) {
  _ensureReady();
  // Check if field exists
  FF.isActive = true; // Mark the field framework as active
  FF.current = a; // Update the current field
}

/**
 * Deactivates the current vector field.
 */
export function noField() {
  FF.isActive = false;
}

/**
 * Adds a new vector field to the field list with a unique name and a generator function.
 * @param {string} name - The unique name for the new vector field.
 * @param {Function} funct - The function that generates the field values.
 */
export function addField(name, funct) {
  _ensureReady();
  FF.list.set(name, { gen: funct }); // Map the field name to its generator function
  FF.current = name; // Set the newly added field as the current one to be used
  FF.refresh(); // Refresh the field values using the generator function
}

/**
 * Refreshes the current vector field based on the generator function, which can be time-dependent.
 * @param {number} [t=0] - An optional time parameter that can affect field generation.
 */
export function refreshField(t) {
  FF.refresh(t);
}

/**
 * Retrieves a list of all available vector field names.
 * @returns {Iterator<string>} An iterator that provides the names of all the fields.
 */
export function listFields() {
  return Array.from(FF.list.keys());
}

/**
 * Represents a framework for managing vector fields used in dynamic simulations or visualizations.
 * @property {boolean} isActive - Indicates whether any vector field is currently active.
 * @property {Map} list - A map associating field names to their respective generator functions and current states.
 * @property {Array} field - An array representing the current vector field grid with values.
 */
const FF = {
  list: new Map(),

  /**
   * Calculates a relative step length based on the renderer's dimensions, used in field grid calculations.
   * @returns {number} The relative step length value.
   */
  step_length() {
    return Math.min(Cwidth, Cheight) / 1000;
  },

  /**
   * Initializes the field grid and sets up the vector field's structure based on the renderer's dimensions.
   */
  create() {
    this.R = Cwidth * 0.01; // Determine the resolution of the field grid
    this.left_x = -0.5 * Cwidth; // Left boundary of the field
    this.top_y = -0.5 * Cheight; // Top boundary of the field
    this.num_columns = Math.round((2 * Cwidth) / this.R); // Number of columns in the grid
    this.num_rows = Math.round((2 * Cheight) / this.R); // Number of columns in the grid
    this.addStandard(); // Add default vector fields
  },

  /**
   * Retrieves the field values for the current vector field.
   * @returns {Float32Array[]} The current vector field grid.
   */
  flow_field() {
    return this.list.get(this.current).field;
  },

  /**
   * Regenerates the current vector field using its associated generator function.
   * @param {number} [t=0] - An optional time parameter that can affect field generation.
   */
  refresh(t = 0) {
    this.list.get(this.current).field = this.list
      .get(this.current)
      .gen(t, this.genField());
  },

  /**
   * Generates empty field array using its associated generator function.
   * @returns {Float32Array[]} Empty vector field grid.
   */
  genField() {
    let grid = new Array(this.num_columns); // Initialize the field array
    for (let i = 0; i < this.num_columns; i++) {
      grid[i] = new Float32Array(this.num_rows);
    }
    return grid;
  },

  /**
   * Adds standard predefined vector fields to the list with unique behaviors.
   */
  addStandard() {
    addField("curved", function (t, field) {
      let angleRange = R.randInt(-20, -10);
      if (R.randInt(0, 100) % 2 == 0) {
        angleRange = angleRange * -1;
      }
      for (let column = 0; column < FF.num_columns; column++) {
        for (let row = 0; row < FF.num_rows; row++) {
          let noise_val = noise(
            column * 0.01 + t * 0.03,
            row * 0.01 + t * 0.03
          );
          let angle = R.map(noise_val, 0.0, 1.0, -angleRange, angleRange);
          field[column][row] = angle;
        }
      }
      return field;
    });
    addField("handwriting", function (t, field) {
      let baseSize = R.rr(0.2, 0.8);
      let baseAngle = R.randInt(5, 10);

      for (let column = 0; column < FF.num_columns; column++) {
        for (let row = 0; row < FF.num_rows; row++) {
          let addition = R.randInt(15, 25);
          let angle = baseAngle * R.sin(baseSize * row * column + addition);

          let noise_val = noise(column * 0.1 + t, row * 0.1 + t);

          field[column][row] = 0.5 * angle * R.cos(t) + noise_val * angle;
        }
      }
      return field;
    });
    addField("seabed", function (t, field) {
      let baseSize = R.rr(0.4, 0.8);
      let baseAngle = R.randInt(18, 26);
      for (let column = 0; column < FF.num_columns; column++) {
        for (let row = 0; row < FF.num_rows; row++) {
          let addition = R.randInt(15, 20);
          let angle = baseAngle * R.sin(baseSize * row * column + addition);
          field[column][row] = 1.1 * angle * R.cos(t);
        }
      }
      return field;
    });
  },
};

/**
 * The Position class represents a point within a two-dimensional space, which can interact with a vector field.
 * It provides methods to update the position based on the field's flow and to check whether the position is
 * within certain bounds (e.g., within the field or canvas).
 */
export class Position {
  /**
   * Constructs a new Position instance.
   * @param {number} x - The initial x-coordinate.
   * @param {number} y - The initial y-coordinate.
   */
  constructor(x, y) {
    this.update(x, y);
    this.plotted = 0;
  }

  /**
   * Updates the position's coordinates and calculates its offsets and indices within the flow field if active.
   * @param {number} x - The new x-coordinate.
   * @param {number} y - The new y-coordinate.
   */
  update(x, y) {
    (this.x = x), (this.y = y);
    if (FF.isActive) {
      this.x_offset = this.x + Matrix.x - FF.left_x;
      this.y_offset = this.y + Matrix.y - FF.top_y;
      this.column_index = Math.round(this.x_offset / FF.R);
      this.row_index = Math.round(this.y_offset / FF.R);
    }
  }

  /**
   * Resets the 'plotted' property to 0.
   */
  reset() {
    this.plotted = 0;
  }

  /**
   * Checks if the position is within the active flow field's bounds.
   * @returns {boolean} - True if the position is within the flow field, false otherwise.
   */
  isIn() {
    return FF.isActive
      ? this.column_index >= 0 &&
          this.row_index >= 0 &&
          this.column_index < FF.num_columns &&
          this.row_index < FF.num_rows
      : this.isInCanvas();
  }

  /**
   * Checks if the position is within reasonable bounds (+ half canvas on each side).
   * @returns {boolean} - True if the position is within bounds, false otherwise.
   */
  isInCanvas() {
    let w = Cwidth,
      h = Cheight;
    let x = this.x + Matrix.x;
    let y = this.y + Matrix.y;
    return x >= -0.3 * w && x <= 1.3 * w && y >= -0.3 * h && y <= 1.3 * h;
  }

  /**
   * Calculates the angle of the flow field at the position's current coordinates.
   * @returns {number} - The angle in radians, or 0 if the position is not in the flow field or if the flow field is not active.
   */
  angle() {
    return this.isIn() && FF.isActive
      ? FF.flow_field()[this.column_index][this.row_index]
      : 0;
  }

  /**
   * Moves the position along the flow field by a certain length.
   * @param {number} _length - The length to move along the field.
   * @param {number} _dir - The direction of movement.
   * @param {number} _step_length - The length of each step.
   * @param {boolean} isFlow - Whether to use the flow field for movement.
   */
  moveTo(_length, _dir, _step_length = B.spacing(), isFlow = true) {
    if (this.isIn()) {
      let a, b;
      if (!isFlow) {
        a = R.cos(-_dir);
        b = R.sin(-_dir);
      }
      for (let i = 0; i < _length / _step_length; i++) {
        if (isFlow) {
          let angle = this.angle();
          a = R.cos(angle - _dir);
          b = R.sin(angle - _dir);
        }
        let x_step = _step_length * a,
          y_step = _step_length * b;
        this.plotted += _step_length;
        this.update(this.x + x_step, this.y + y_step);
      }
    } else {
      this.plotted += _step_length;
    }
  }

  /**
   * Plots a point to another position within the flow field, following a Plot object
   * @param {Position} _plot - The Plot path object.
   * @param {number} _length - The length to move towards the target position.
   * @param {number} _step_length - The length of each step.
   * @param {number} _scale - The scaling factor for the plotting path.
   */
  plotTo(_plot, _length, _step_length, _scale) {
    if (this.isIn()) {
      const inverse_scale = 1 / _scale;
      for (let i = 0; i < _length / _step_length; i++) {
        let current_angle = this.angle();
        let plot_angle = _plot.angle(this.plotted);
        let x_step = _step_length * R.cos(current_angle - plot_angle);
        let y_step = _step_length * R.sin(current_angle - plot_angle);
        this.plotted += _step_length * inverse_scale;
        this.update(this.x + x_step, this.y + y_step);
      }
    } else {
      this.plotted += _step_length / scale;
    }
  }
}

// =============================================================================
// Section: Brushes
// =============================================================================
/**
 * The Brushes section provides tools for drawing with various brush types. Each brush
 * can simulate different materials and techniques, such as spray, marker, or custom
 * image stamps. The 'B' object is central to this section, storing brush properties
 * and methods for applying brush strokes to the canvas.
 *
 * The 'B' object contains methods to control the brush, including setting the brush
 * type, color, weight, and blending mode. It also handles the application of the brush
 * to draw lines, flow lines, and shapes with specific behaviors defined by the brush type.
 * Additionally, it provides a mechanism to clip the drawing area, ensuring brush strokes
 * only appear within the defined region.
 *
 * Brush tips can vary from basic circles to complex patterns, with support for custom
 * pressure curves, opacity control, and dynamic size adjustments to simulate natural
 * drawing tools. The brush engine can create effects like variable line weight, texture,
 * and color blending, emulating real-world drawing experiences.
 *
 * The brush system is highly customizable, allowing users to define their own brushes
 * with specific behaviors and appearances. By extending the brush types and parameters,
 * one can achieve a wide range of artistic styles and techniques.
 */

/**
 * Adjusts the global scale of standard brushes based on the provided scale factor.
 * This affects the weight, vibration, and spacing of each standard brush.
 *
 * @param {number} _scale - The scaling factor to apply to the brush parameters.
 */
export function scaleBrushes(_scale) {
  for (let s of _standard_brushes) {
    let params = B.list.get(s[0]).param;
    (params.weight *= _scale),
      (params.vibration *= _scale),
      (params.spacing *= _scale);
  }
}

const PI2 = Math.PI * 2;

/**
 * Disables the stroke for subsequent drawing operations.
 * This function sets the brush's `isActive` property to false, indicating that no stroke
 * should be applied to the shapes drawn after this method is called.
 */
export function noStroke() {
  B.isActive = false;
}

/**
 * Retrieves a list of all available brush names from the brush manager.
 * @returns {Array<string>} An array containing the names of all brushes.
 */
export function box() {
  return Array.from(B.list.keys());
}

/**
 * The B object, representing a brush, contains properties and methods to manipulate
 * the brush's appearance and behavior when drawing on the canvas.
 * @type {Object}
 */
const B = {
  isActive: true, // Indicates if the brush is active.
  list: new Map(), // Stores brush definitions by name.
  c: new Color("black"), // Current color of the brush.
  w: 1, // Current weight (size) of the brush.
  cr: null, // Clipping region for brush strokes.
  name: "HB", // Name of the current brush.

  /**
   * Calculates the tip spacing based on the current brush parameters.
   * @returns {number} The calculated spacing value.
   */
  spacing() {
    this.p = this.list.get(this.name).param;
    if (this.p.type === "default" || this.p.type === "spray")
      return this.p.spacing / this.w;
    return this.p.spacing;
  },

  /**
   * Initializes the drawing state with the given parameters.
   * @param {number} x - The x-coordinate of the starting point.
   * @param {number} y - The y-coordinate of the starting point.
   * @param {number} length - The length of the line to draw.
   * @param {boolean} flow - Flag indicating if the line should follow the vector-field.
   * @param {Object|boolean} plot - The shape object to be used for plotting, or false if not plotting a shape.
   */
  initializeDrawingState(x, y, length, flow, plot) {
    this.position = new Position(x, y);
    this.length = length;
    this.flow = flow;
    this.plot = plot;
    if (plot) plot.calcIndex(0);
  },

  /**
   * Executes the drawing operation for lines or shapes.
   * @param {number} angle_scale - The angle or scale to apply during drawing.
   * @param {boolean} isPlot - Flag indicating if the operation is plotting a shape.
   */
  draw(angle_scale, isPlot) {
    if (!isPlot) this.dir = angle_scale;
    this.pushState();
    const st = this.spacing();
    const total_steps = isPlot
      ? Math.round((this.length * angle_scale) / st)
      : Math.round(this.length / st);
    for (let steps = 0; steps < total_steps; steps++) {
      this.tip();
      if (isPlot) {
        this.position.plotTo(this.plot, st, st, angle_scale);
      } else {
        this.position.moveTo(st, angle_scale, st, this.flow);
      }
    }
    this.popState();
  },

  /**
   * Sets up the environment for a brush stroke.
   */
  pushState() {
    this.p = this.list.get(this.name).param;
    // Pressure values for the stroke
    this.a = this.p.pressure.type !== "custom" ? R.rr(-1, 1) : 0;
    this.b = this.p.pressure.type !== "custom" ? R.rr(1, 1.5) : 0;
    this.cp =
      this.p.pressure.type !== "custom" ? R.rr(3, 3.5) : R.rr(-0.2, 0.2);
    const [min, max] = this.p.pressure.min_max;
    this.min = min;
    this.max = max;
    // Blend stuff
    Mix.blend(this.c);
    // Set state
    Mix.ctx.save();
    // IMAGE BRUSHES FIX HERE
    //(this.p.type === "image") ? this.mask.translate(Matrix.translation.x,Matrix.translation.y) : this.mask.translate(Matrix.translation.x + _r.width/2,Matrix.translation.y + _r.height/2);
    this.markerTip();
    this.alpha = this.calculateAlpha(); // Calcula Alpha
    this.applyColor(this.alpha); // Apply Color
    Mix.ctx.beginPath(); // Begin Path
  },

  /**
   * Restores the drawing state after a brush stroke is completed.
   */
  popState() {
    Mix.ctx.fill();
    this.markerTip();
    Mix.ctx.restore();
  },

  /**
   * Draws the tip of the brush based on the current pressure and position.
   * @param {number} pressure - The desired pressure value.
   */
  tip(custom_pressure = false) {
    let pressure = custom_pressure ? custom_pressure : this.calculatePressure(); // Calculate Pressure
    if (this.isInsideClippingArea()) {
      // Check if it's inside clipping area
      switch (
        this.p.type // Draw different tip types
      ) {
        case "spray":
          this.drawSpray(pressure);
          break;
        case "marker":
          this.drawMarker(pressure);
          break;
        case "custom":
        case "image":
          this.drawCustomOrImage(pressure, this.alpha);
          break;
        default:
          this.drawDefault(pressure);
          break;
      }
    }
  },

  /**
   * Calculates the pressure for the current position in the stroke.
   * @returns {number} The calculated pressure value.
   */
  calculatePressure() {
    return this.plot
      ? this.simPressure() * this.plot.pressure(this.position.plotted)
      : this.simPressure();
  },

  /**
   * Simulates brush pressure based on the current position and brush parameters.
   * @returns {number} The simulated pressure value.
   */
  simPressure() {
    if (this.p.pressure.type === "custom") {
      return R.map(
        this.p.pressure.curve(this.position.plotted / this.length) + this.cp,
        0,
        1,
        this.min,
        this.max,
        true
      );
    }
    return this.gauss();
  },

  /**
   * Generates a Gaussian distribution value for the pressure calculation.
   * @param {number} a - Center of the Gaussian bell curve.
   * @param {number} b - Width of the Gaussian bell curve.
   * @param {number} c - Shape of the Gaussian bell curve.
   * @param {number} min - Minimum pressure value.
   * @param {number} max - Maximum pressure value.
   * @returns {number} The calculated Gaussian value.
   */
  gauss(
    a = 0.5 + B.p.pressure.curve[0] * B.a,
    b = 1 - B.p.pressure.curve[1] * B.b,
    c = B.cp,
    min = B.min,
    max = B.max
  ) {
    return R.map(
      1 /
        (1 +
          Math.pow(
            Math.abs(
              (this.position.plotted - a * this.length) /
                ((b * this.length) / 2)
            ),
            2 * c
          )),
      0,
      1,
      min,
      max
    );
  },

  /**
   * Calculates the alpha (opacity) level for the brush stroke based on pressure.
   * @param {number} pressure - The current pressure value.
   * @returns {number} The calculated alpha value.
   */
  calculateAlpha() {
    let opacity =
      this.p.type !== "default" && this.p.type !== "spray"
        ? this.p.opacity / this.w
        : this.p.opacity;
    return opacity;
  },

  /**
   * Applies the current color and alpha to the renderer.
   * @param {number} alpha - The alpha (opacity) level to apply.
   */
  applyColor(alpha) {
    Mix.ctx.fillStyle = RGBr(this.c) + alpha + "%)";
  },

  /**
   * Checks if the current brush position is inside the defined clipping area.
   * @returns {boolean} True if the position is inside the clipping area, false otherwise.
   */
  isInsideClippingArea() {
    if (B.cr)
      return (
        this.position.x >= B.cr[0] &&
        this.position.x <= B.cr[2] &&
        this.position.y >= B.cr[1] &&
        this.position.y <= B.cr[3]
      );
    else {
      let w = Cwidth,
        h = Cheight,
        o = Cwidth * 0.05;
      let x = this.position.x + Matrix.x;
      let y = this.position.y + Matrix.y;
      return x >= -o && x <= w + o && y >= -o && y <= h + o;
    }
  },

  /**
   * Draws a rectangle to the mask.
   */
  rect(x, y, d) {
    d /= 1.2;
    Mix.ctx.rect(x - d / 2, y - d / 2, d, d);
  },

  /**
   * Draws a circle to the mask.
   */
  circle(x, y, d) {
    let radius = d / 2;
    Mix.ctx.moveTo(x + radius, y);
    Mix.ctx.arc(x, y, radius, 0, PI2);
  },

  /**
   * Draws the spray tip of the brush.
   * @param {number} pressure - The current pressure value.
   */
  drawSpray(pressure) {
    let vibration =
      this.w * this.p.vibration * pressure +
      (this.w * R.gaussian() * this.p.vibration) / 3;
    let sw = this.p.weight * R.rr(0.9, 1.1);
    const iterations = this.p.quality / pressure;
    for (let j = 0; j < iterations; j++) {
      let r = R.rr(0.9, 1.1);
      let rX = r * vibration * R.rr(-1, 1);
      let yRandomFactor = R.rr(-1, 1);
      let rVibrationSquared = Math.pow(r * vibration, 2);
      let sqrtPart = Math.sqrt(rVibrationSquared - Math.pow(rX, 2));
      this.rect(
        this.position.x + rX,
        this.position.y + yRandomFactor * sqrtPart,
        sw
      );
    }
  },

  /**
   * Draws the marker tip of the brush.
   * @param {number} pressure - The current pressure value.
   * @param {boolean} [vibrate=true] - Whether to apply vibration effect.
   */
  drawMarker(pressure, vibrate = true) {
    let vibration = vibrate ? this.w * this.p.vibration : 0;
    let rx = vibrate ? vibration * R.rr(-1, 1) : 0;
    let ry = vibrate ? vibration * R.rr(-1, 1) : 0;
    this.circle(
      this.position.x + rx,
      this.position.y + ry,
      this.w * this.p.weight * pressure
    );
  },

  /**
   * Draws the custom or image tip of the brush.
   * @param {number} pressure - The current pressure value.
   * @param {number} alpha - The alpha (opacity) level to apply.
   * @param {boolean} [vibrate=true] - Whether to apply vibration effect.
   */
  drawCustomOrImage(pressure, alpha, vibrate = true) {
    Mix.ctx.save();
    let vibration = vibrate ? this.w * this.p.vibration : 0;
    let rx = vibrate ? vibration * R.rr(-1, 1) : 0;
    let ry = vibrate ? vibration * R.rr(-1, 1) : 0;
    Mix.ctx.translate(this.position.x + rx, this.position.y + ry);
    this.adjustSizeAndRotation(this.w * pressure, alpha);
    this.p.tip(Mix.ctx);
    Mix.ctx.restore();
  },

  /**
   * Draws the default tip of the brush.
   * @param {number} pressure - The current pressure value.
   */
  drawDefault(pressure) {
    let vibration =
      this.w *
      this.p.vibration *
      (this.p.definition +
        ((1 - this.p.definition) *
          R.gaussian() *
          this.gauss(0.5, 0.9, 5, 0.2, 1.2)) /
          pressure);
    if (R.rr(0, this.p.quality * pressure) > 0.4) {
      this.rect(
        this.position.x + 0.7 * vibration * R.rr(-1, 1),
        this.position.y + vibration * R.rr(-1, 1),
        pressure * this.p.weight * R.rr(0.85, 1.15)
      );
    }
  },

  /**
   * Adjusts the size and rotation of the brush tip before drawing.
   * @param {number} pressure - The current pressure value.
   * @param {number} alpha - The alpha (opacity) level to apply.
   */
  adjustSizeAndRotation(pressure, alpha) {
    Mix.ctx.scale(pressure, pressure);

    // TO FIX
    if (this.p.type === "image")
      this.p.blend
        ? this.mask.tint(255, 0, 0, alpha / 2)
        : this.mask.tint(
            this.mask.red(this.c),
            this.mask.green(this.c),
            this.mask.blue(this.c),
            alpha
          );

    if (this.p.rotate === "random") Mix.ctx.rotate(R.randInt(0, PI2));
    else if (this.p.rotate === "natural") {
      let angle =
        (this.plot ? -this.plot.angle(this.position.plotted) : -this.dir) +
        (this.flow ? this.position.angle() : 0);
      Mix.ctx.rotate((angle * Math.PI) / 180);
    }
  },

  /**
   * Draws the marker tip with a blend effect.
   */
  markerTip() {
    if (this.isInsideClippingArea()) {
      let pressure = this.calculatePressure();
      let alpha = this.calculateAlpha(pressure);
      Mix.ctx.fillStyle = RGBr(this.c) + alpha / 3 + "%)";
      if (B.p.type === "marker") {
        for (let s = 1; s < 5; s++) {
          Mix.ctx.beginPath();
          this.drawMarker((pressure * s) / 5, false);
          Mix.ctx.fill();
        }
      } else if (B.p.type === "custom" || B.p.type === "image") {
        for (let s = 1; s < 5; s++) {
          Mix.ctx.beginPath();
          this.drawCustomOrImage((pressure * s) / 5, alpha, false);
          Mix.ctx.fill();
        }
      }
    }
  },
};

/**
 * Adds a new brush with the specified parameters to the brush list.
 * @param {string} name - The unique name for the new brush.
 * @param {BrushParameters} params - The parameters defining the brush behavior and appearance.
 */
export function add(a, b) {
  const isBlendableType =
    b.type === "marker" || b.type === "custom" || b.type === "image";
  if (!isBlendableType && b.type !== "spray") b.type = "default";
  if (b.type === "image") {
    T.add(b.image.src);
    b.tip = () =>
      B.mask.image(
        T.tips.get(B.p.image.src),
        -B.p.weight / 2,
        -B.p.weight / 2,
        B.p.weight,
        B.p.weight
      );
  }
  b.blend = (isBlendableType && b.blend !== false) || b.blend ? true : false;
  B.list.set(a, { param: b, colors: [], buffers: [] });
}

/**
 * Sets the current brush with the specified name, color, and weight.
 * @param {string} brushName - The name of the brush to set as current.
 * @param {string|Color} color - The color to set for the brush.
 * @param {number} weight - The weight (size) to set for the brush.
 */
export function set(brushName, color, weight = 1) {
  pick(brushName);
  B.c = new Color(color);

  B.w = weight;
  B.isActive = true;
}

/**
 * Sets only the current brush type based on the given name.
 * @param {string} brushName - The name of the brush to set as current.
 */
export function pick(brushName) {
  B.name = brushName;
}

/**
 * Sets the color of the current brush.
 * @param {number|string|Color} r - The red component of the color, a CSS color string, or a Color object.
 * @param {number} [g] - The green component of the color.
 * @param {number} [b] - The blue component of the color.
 */
export function stroke(r, g, b) {
  B.c = new Color(...arguments);
  B.isActive = true;
}

/**
 * Sets the weight (size) of the current brush.
 * @param {number} weight - The weight to set for the brush.
 */
export function strokeWeight(weight) {
  B.w = weight;
}

/**
 * Defines a clipping region for the brush strokes.
 * @param {number[]} clippingRegion - An array defining the clipping region as [x1, y1, x2, y2].
 */
export function clip(clippingRegion) {
  B.cr = clippingRegion;
}

/**
 * Disables clipping region.
 */
export function noClip() {
  B.cr = null;
}

/**
 * Draws a line using the current brush from (x1, y1) to (x2, y2).
 * @param {number} x1 - The x-coordinate of the start point.
 * @param {number} y1 - The y-coordinate of the start point.
 * @param {number} x2 - The x-coordinate of the end point.
 * @param {number} y2 - The y-coordinate of the end point.
 */
export function line(x1, y1, x2, y2) {
  _ensureReady();
  let d = R.dist(x1, y1, x2, y2);
  if (d == 0) return;
  B.initializeDrawingState(x1, y1, d, false, false);
  let angle = R.calcAngle(x1, y1, x2, y2);
  B.draw(angle, false);
}

/**
 * Draws a flow line with the current brush from a starting point in a specified direction.
 * @param {number} x - The x-coordinate of the starting point.
 * @param {number} y - The y-coordinate of the starting point.
 * @param {number} length - The length of the line to draw.
 * @param {number} dir - The direction in which to draw the line. Angles measured anticlockwise from the x-axis
 */
export function flowLine(x, y, length, dir) {
  _ensureReady();
  B.initializeDrawingState(x, y, length, true, false);
  B.draw(R.toDegrees(dir), false);
}

/**
 * Draws a predefined shape/plot with a flowing brush stroke.
 * @param {Object} p - An object representing the shape to draw.
 * @param {number} x - The x-coordinate of the starting position to draw the shape.
 * @param {number} y - The y-coordinate of the starting position to draw the shape.
 * @param {number} scale - The scale at which to draw the shape.
 */
export function plot(p, x, y, scale) {
  _ensureReady();
  B.initializeDrawingState(x, y, p.length, true, p);
  B.draw(scale, true);
}

// =============================================================================
// Section: Loading Custom Image Tips
// =============================================================================
/**
 * This section defines the functionality for managing the loading and processing of image tips.
 * Images are loaded from specified source URLs, converted to a white tint for visual effects,
 * and then stored for future use. It includes methods to add new images, convert their color
 * scheme, and integrate them into the js graphics library.
 */

/**
 * A utility object for loading images, converting them to a red tint, and managing their states.
 */
const T = {
  tips: new Map(),

  /**
   * Adds an image to the tips Map and sets up loading and processing.
   *
   * @param {string} src - The source URL of the image to be added and processed.
   */
  add(src) {
    // Initially set the source as not processed
    this.tips.set(src, false);
  },

  /**
   * Converts the given image to a white tint by setting all color channels to white and adjusting the alpha channel.
   *
   * @param {Image} image - The image to be converted.
   */
  imageToWhite(image) {
    image.loadPixels();
    // Modify the image data to create a white tint effect
    for (let i = 0; i < 4 * image.width * image.height; i += 4) {
      // Calculate the average for the grayscale value
      let average =
        (image.pixels[i] + image.pixels[i + 1] + image.pixels[i + 2]) / 3;
      // Set all color channels to white
      image.pixels[i] = image.pixels[i + 1] = image.pixels[i + 2] = 255;
      // Adjust the alpha channel to the inverse of the average, creating the white tint effect
      image.pixels[i + 3] = 255 - average;
    }
    image.updatePixels();
  },
  /**
   * Loads all processed images into the js environment.
   * If no images are in the tips Map, logs a warning message.
   */
  load() {
    for (let key of this.tips.keys()) {
      let _r = _isInstanced ? _inst : window.self;
      let image = _r.loadImage(key, () => T.imageToWhite(image));
      this.tips.set(key, image);
    }
  },
};

// =============================================================================
// Section: Hatching
// =============================================================================
/**
 * The Hatching section of the code is responsible for creating and drawing hatching patterns.
 * Hatching involves drawing closely spaced parallel lines.
 */

/**
 * Activates hatching for subsequent geometries, with the given params.
 * @param {number} dist - The distance between hatching lines.
 * @param {number} angle - The angle at which hatching lines are drawn.
 * @param {Object} options - An object containing optional parameters to affect the hatching style:
 *                           - rand: Introduces randomness to the line placement.
 *                           - continuous: Connects the end of a line with the start of the next.
 *                           - gradient: Changes the distance between lines to create a gradient effect.
 *                           Defaults to {rand: false, continuous: false, gradient: false}.
 */
export function hatch(
  dist = 5,
  angle = 45,
  options = { rand: false, continuous: false, gradient: false }
) {
  H.isActive = true;
  H.hatchingParams = [dist, angle, options];
}

/**
 * Sets the brush type, color, and weight for subsequent hatches.
 * If this function is not called, hatches will use the parameters from stroke operations.
 * @param {string} brushName - The name of the brush to set as current.
 * @param {string|Color} color - The color to set for the brush.
 * @param {number} weight - The weight (size) to set for the brush.
 */
export function setHatch(brush, color = "black", weight = 1) {
  H.hatchingBrush = [brush, color, weight];
}

/**
 * Disables hatching for subsequent shapes
 */
export function noHatch() {
  H.isActive = false;
  H.hatchingBrush = false;
}

// Helper functions for bounding box calculation
function computeBoundingBoxForPolygon(polygon) {
  // If already computed, return the cached bounding box.
  if (polygon._boundingBox) return polygon._boundingBox;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i < polygon.a.length; i++) {
    const [x, y] = polygon.a[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  polygon._boundingBox = { minX, minY, maxX, maxY };
  return polygon._boundingBox;
}

function computeOverallBoundingBox(polygons) {
  let overall = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  for (let poly of polygons) {
    const bb = computeBoundingBoxForPolygon(poly);
    overall.minX = Math.min(overall.minX, bb.minX);
    overall.minY = Math.min(overall.minY, bb.minY);
    overall.maxX = Math.max(overall.maxX, bb.maxX);
    overall.maxY = Math.max(overall.maxY, bb.maxY);
  }
  return overall;
}

/**
 * Object to hold the current hatch state and to perform hatch calculation
 */
const H = {
  isActive: false,
  hatchingParams: [5, 45, {}],
  hatchingBrush: false,

  /**
   * Creates a hatching pattern across the given polygons.
   *
   * @param {Array|Object} polygons - A single polygon or an array of polygons to apply the hatching.
   */
  hatch(polygons) {
    let dist = H.hatchingParams[0];
    let angle = H.hatchingParams[1];
    let options = H.hatchingParams[2];

    // Save current stroke state
    let strokeColor = B.c.hex,
      strokeBrush = B.name,
      strokeWeight = B.w,
      strokeActive = B.isActive;

    // Change state if hatch has been set to different params than stroke
    if (H.hatchingBrush)
      set(H.hatchingBrush[0], H.hatchingBrush[1], H.hatchingBrush[2]);

    // Transform to degrees and between 0-180
    angle = R.toDegrees(angle) % 180;

    // Find Bounding Box ---
    if (!Array.isArray(polygons)) polygons = [polygons];
    const overallBB = computeOverallBoundingBox(polygons);
    // Create a bounding polygon from the overall bounding box.
    let ventana = new Polygon([
      [overallBB.minX, overallBB.minY],
      [overallBB.maxX, overallBB.minY],
      [overallBB.maxX, overallBB.maxY],
      [overallBB.minX, overallBB.maxY],
    ]);

    // Set initial values for line generation
    let startY = angle <= 90 && angle >= 0 ? overallBB.minY : overallBB.maxY;
    let gradient = options.gradient
      ? R.map(options.gradient, 0, 1, 1, 1.1, true)
      : 1;
    let dots = [];
    let i = 0;
    let dist1 = dist;
    let linea = (i) => {
      return {
        point1: {
          x: overallBB.minX + dist1 * i * R.cos(-angle + 90),
          y: startY + dist1 * i * R.sin(-angle + 90),
        },
        point2: {
          x: overallBB.minX + dist1 * i * R.cos(-angle + 90) + R.cos(-angle),
          y: startY + dist1 * i * R.sin(-angle + 90) + R.sin(-angle),
        },
      };
    };

    // Generate lines and calculate intersections with polygons
    // Loop through the lines based on the distance and angle to calculate intersections with the polygons
    // The loop continues until a line does not intersect with the bounding window polygon
    // Each iteration accounts for the gradient effect by adjusting the distance between lines
    while (ventana.intersect(linea(i)).length > 0) {
      let tempArray = [];
      for (let p of polygons) {
        tempArray.push(p.intersect(linea(i)));
      }
      dots[i] = tempArray
        .flat()
        .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
      dist1 *= gradient;
      i++;
    }

    // Filter out empty arrays to avoid drawing unnecessary lines
    let gdots = [];
    for (let dd of dots) {
      if (typeof dd[0] !== "undefined") {
        gdots.push(dd);
      }
    }

    // Draw the hatching lines using the calculated intersections
    // If the 'rand' option is enabled, add randomness to the start and end points of the lines
    // If the 'continuous' option is set, connect the end of one line to the start of the next
    let r = options.rand ? options.rand : 0;
    for (let j = 0; j < gdots.length; j++) {
      let dd = gdots[j];
      let shouldDrawContinuousLine = j > 0 && options.continuous;
      for (let i = 0; i < dd.length - 1; i += 2) {
        if (r !== 0) {
          dd[i].x += r * dist * R.rr(-10, 10);
          dd[i].y += r * dist * R.rr(-10, 10);
          dd[i + 1].x += r * dist * R.rr(-10, 10);
          dd[i + 1].y += r * dist * R.rr(-10, 10);
        }
        line(dd[i].x, dd[i].y, dd[i + 1].x, dd[i + 1].y);
        if (shouldDrawContinuousLine) {
          line(gdots[j - 1][1].x, gdots[j - 1][1].y, dd[i].x, dd[i].y);
        }
      }
    }

    // Change state back to previous
    set(strokeBrush, strokeColor, strokeWeight);

    B.isActive = strokeActive;
  },
};

export const hatchArray = H.hatch;

// =============================================================================
// Section: Polygon management. Basic geometries
// =============================================================================
/**
 * This section includes the Polygon class for managing polygons and functions for drawing basic geometries
 * like rectangles and circles. It provides methods for creating, intersecting, drawing, and filling polygons,
 * as well as hatching them with a given distance and angle. Additional functions leverage the Polygon class
 * to draw rectangles with options for randomness and different drawing modes.
 */

/**
 * Represents a polygon with a set of vertices.
 */
export class Polygon {
  /**
   * Constructs the Polygon object from an array of points.
   *
   * @param {Array} pointsArray - An array of points, where each point is an array of two numbers [x, y].
   */
  constructor(array, bool = false) {
    this.a = array;
    this.vertices = array.map((a) => ({ x: a[0], y: a[1] }));
    if (bool) this.vertices = array;
    this.sides = this.vertices.map((v, i, arr) => [
      v,
      arr[(i + 1) % arr.length],
    ]);
  }
  /**
   * Intersects a given line with the polygon, returning all intersection points.
   *
   * @param {Object} line - The line to intersect with the polygon, having two properties 'point1' and 'point2'.
   * @returns {Array} An array of intersection points (each with 'x' and 'y' properties) or an empty array if no intersections.
   */
  intersect(line) {
    // Check if the result has been cached
    let cacheKey = `${line.point1.x},${line.point1.y}-${line.point2.x},${line.point2.y}`;
    if (this._intersectionCache && this._intersectionCache[cacheKey]) {
      return this._intersectionCache[cacheKey];
    }
    let points = [];
    for (let s of this.sides) {
      let intersection = _intersectLines(line.point1, line.point2, s[0], s[1]);
      if (intersection !== false) {
        points.push(intersection);
      }
    }
    // Cache the result
    if (!this._intersectionCache) this._intersectionCache = {};
    this._intersectionCache[cacheKey] = points;

    return points;
  }
  /**
   * Draws the polygon by iterating over its sides and drawing lines between the vertices.
   */
  draw(_brush = false, _color, _weight) {
    let curState = B.isActive;
    if (_brush) set(_brush, _color, _weight);
    if (B.isActive) {
      _ensureReady();
      for (let s of this.sides) {
        line(s[0].x, s[0].y, s[1].x, s[1].y);
      }
    }
    B.isActive = curState;
  }
  /**
   * Fills the polygon using the current fill state.
   */
  fill(_color = false, _opacity, _bleed, _texture, _border, _direction) {
    let curState = F.isActive;
    if (_color) {
      fill(_color, _opacity);
      bleed(_bleed, _direction);
      fillTexture(_texture, _border);
    }
    if (F.isActive) {
      _ensureReady();
      F.fill(this);
    }
    F.isActive = curState;
  }
  /**
   * Creates hatch lines across the polygon based on a given distance and angle.
   */
  hatch(_dist = false, _angle, _options) {
    let curState = H.isActive;
    if (_dist) hatch(_dist, _angle, _options);
    if (H.isActive) {
      _ensureReady();
      H.hatch(this);
    }
    H.isActive = curState;
  }

  erase(c = false, a = E.a) {
    if (E.isActive || c) {
      c = c ? new Color(c) : E.c;
      Mix.blend(c);
      Mix.isErase = true;
      Mix.ctx.save();
      Mix.ctx.fillStyle = RGBr(c) + a + "%)";
      drawPolygon(this.vertices);
      Mix.ctx.fill();
      Mix.ctx.restore();
    }
  }

  show() {
    this.fill();
    this.hatch();
    this.draw();
    this.erase();
  }
}

function drawPolygon(vertices) {
  Mix.ctx.beginPath();
  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    if (i == 0) Mix.ctx.moveTo(v.x, v.y);
    else Mix.ctx.lineTo(v.x, v.y);
  }
}

/**
 * Creates a Polygon from a given array of points and performs drawing and filling
 * operations based on active states.
 *
 * @param {Array} pointsArray - An array of points where each point is an array of two numbers [x, y].
 */
export function polygon(pointsArray) {
  // Create a new Polygon instance
  let polygon = new Polygon(pointsArray);
  polygon.show();
}

/**
 * Draws a rectangle on the canvas and fills it with the current fill color.
 *
 * @param {number} x - The x-coordinate of the rectangle.
 * @param {number} y - The y-coordinate of the rectangle.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {boolean} [mode="corner"] - If "center", the rectangle is drawn centered at (x, y).
 */
export function rect(x, y, w, h, mode = "corner") {
  if (mode == "center") (x = x - w / 2), (y = y - h / 2);
  if (FF.isActive) {
    beginShape(0);
    vertex(x, y);
    vertex(x + w, y);
    vertex(x + w, y + h);
    vertex(x, y + h);
    endShape("close");
  } else {
    let p = new Polygon([
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ]);
    p.show();
  }
}

// =============================================================================
// Section: Shape, Stroke, and Spline. Plot System
// =============================================================================
/**
 * This section defines the functionality for creating and managing plots, which are used to draw complex shapes,
 * strokes, and splines on a canvas. It includes classes and functions to create plots of type "curve" or "segments",
 * manipulate them with operations like adding segments and applying rotations, and render them as visual elements
 * like polygons or strokes. The spline functionality allows for smooth curve creation using control points with
 * specified curvature, which can be rendered directly or used as part of more complex drawings.
 */

/**
 * The Plot class is central to the plot system, serving as a blueprint for creating and manipulating a variety
 * of shapes and paths. It manages a collection of segments, each defined by an angle, length, and pressure,
 * allowing for intricate designs such as curves and custom strokes. Plot instances can be transformed by rotation,
 * and their visual representation can be controlled through pressure and angle calculations along their length.
 */
export class Plot {
  /**
   * Creates a new Plot.
   * @param {string} _type - The type of plot, "curve" or "segments"
   */
  constructor(_type) {
    (this.segments = []), (this.angles = []), (this.pres = []);
    this.type = _type;
    this.dir = 0;
    this.calcIndex(0);
    this.pol = false;
  }

  /**
   * Adds a segment to the plot with specified angle, length, and pressure.
   * @param {number} _a - The angle of the segment.
   * @param {number} _length - The length of the segment.
   * @param {number} _pres - The pressure of the segment.
   * @param {boolean} _degrees - Whether the angle is in degrees.
   */
  addSegment(_a = 0, _length = 0, _pres = 1, _degrees = false) {
    // Remove the last angle if the angles array is not empty
    if (this.angles.length > 0) {
      this.angles.splice(-1);
    }
    // Convert to degrees and normalize between 0 and 360 degrees
    _a = _degrees ? ((_a % 360) + 360) % 360 : R.toDegrees(_a);
    // Store the angle, pressure, and segment length
    this.angles.push(_a);
    this.pres.push(_pres);
    this.segments.push(_length);
    // Calculate the total length of the plot
    this.length = this.segments.reduce((partialSum, a) => partialSum + a, 0);
    // Push the angle again to prepare for the next segment
    this.angles.push(_a);
  }

  /**
   * Finalizes the plot by setting the last angle and pressure.
   * @param {number} _a - The final angle of the plot.
   * @param {number} _pres - The final pressure of the plot.
   * @param {boolean} _degrees - Whether the angle is in degrees.
   */
  endPlot(_a = 0, _pres = 1, _degrees = false) {
    // Convert angle to degrees if necessary
    _a = _degrees ? ((_a % 360) + 360) % 360 : R.toDegrees(_a);
    // Replace the last angle with the final angle
    this.angles.splice(-1);
    this.angles.push(_a);
    // Store the final pressure
    this.pres.push(_pres);
  }

  /**
   * Rotates the entire plot by a given angle.
   * @param {number} _a - The angle to rotate the plot.
   */
  rotate(_a) {
    this.dir = R.toDegrees(_a);
  }

  /**
   * Calculates the pressure at a given distance along the plot.
   * @param {number} _d - The distance along the plot.
   * @returns {number} - The calculated pressure.
   */
  pressure(_d) {
    // If the distance exceeds the plot length, return the last pressure
    if (_d > this.length) return this.pres[this.pres.length - 1];
    // Otherwise, calculate the pressure using the curving function
    return this.curving(this.pres, _d);
  }

  /**
   * Calculates the angle at a given distance along the plot.
   * @param {number} _d - The distance along the plot.
   * @returns {number} - The calculated angle.
   */
  angle(_d) {
    // If the distance exceeds the plot length, return the last angle
    if (_d > this.length) return this.angles[this.angles.length - 1];
    // Calculate the index for the given distance
    this.calcIndex(_d);
    // Return the angle, adjusted for the plot type and direction
    return this.type === "curve"
      ? this.curving(this.angles, _d) + this.dir
      : this.angles[this.index] + this.dir;
  }

  /**
   * Interpolates values between segments for smooth transitions.
   * @param {Array<number>} array - The array to interpolate within.
   * @param {number} _d - The distance along the plot.
   * @returns {number} - The interpolated value.
   */
  curving(array, _d) {
    let map0 = array[this.index];
    let map1 = array[this.index + 1];
    if (typeof map1 == "undefined") {
      map1 = map0;
    }
    if (Math.abs(map1 - map0) > 180) {
      if (map1 > map0) {
        map1 = -(360 - map1);
      } else {
        map0 = -(360 - map0);
      }
    }
    return R.map(
      _d - this.suma,
      0,
      this.segments[this.index],
      map0,
      map1,
      true
    );
  }

  /**
   * Calculates the current index of the plot based on the distance.
   * @param {number} _d - The distance along the plot.
   */
  calcIndex(_d) {
    (this.index = -1), (this.suma = 0);
    let d = 0;
    while (d <= _d) {
      this.suma = d;
      d += this.segments[this.index + 1];
      this.index++;
    }
    return this.index;
  }

  /**
   * Generates a polygon based on the plot.
   * @param {number} _x - The x-coordinate for the starting point of the polygon.
   * @param {number} _y - The y-coordinate for the starting point of the polygon.
   * @returns {Polygon} - The generated polygon.
   */
  genPol(_x, _y, _scale = 1, isHatch = false) {
    _ensureReady(); // Ensure that the drawing environment is prepared
    const step = 0.5;
    const vertices = [];
    const numSteps = Math.round(this.length / step);
    const pos = new Position(_x, _y);
    let side = isHatch ? 0.15 : F.bleed_strength * 3;
    let pside = 0;
    let prevIdx = 0;
    for (let i = 0; i < numSteps; i++) {
      pos.plotTo(this, step, step, 1);
      let idx = this.calcIndex(pos.plotted);
      pside += step;
      if (
        (pside >= this.segments[idx] * side * R.rr(0.7, 1.3) ||
          idx >= prevIdx) &&
        pos.x
      ) {
        vertices.push([pos.x, pos.y]);
        pside = 0;
        if (idx >= prevIdx) prevIdx++;
      }
    }
    return new Polygon(vertices);
  }

  /**
   * Draws the plot on the canvas.
   * @param {number} x - The x-coordinate to draw at.
   * @param {number} y - The y-coordinate to draw at.
   * @param {number} scale - The scale to draw with.
   */
  draw(x, y, scale) {
    if (B.isActive) {
      _ensureReady(); // Ensure that the drawing environment is prepared
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      plot(this, x, y, scale);
    }
  }

  /**
   * Fill the plot on the canvas.
   * @param {number} x - The x-coordinate to draw at.
   * @param {number} y - The y-coordinate to draw at.
   */
  fill(x, y, scale) {
    if (F.isActive) {
      _ensureReady(); // Ensure that the drawing environment is prepared
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      this.pol = this.genPol(x, y, scale);
      this.pol.fill();
    }
  }

  /**
   * Hatch the plot on the canvas.
   * @param {number} x - The x-coordinate to draw at.
   * @param {number} y - The y-coordinate to draw at.
   */
  hatch(x, y, scale) {
    if (H.isActive) {
      _ensureReady(); // Ensure that the drawing environment is prepared
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      this.pol = this.genPol(x, y, scale, true);
      this.pol.hatch();
    }
  }

  erase(x, y, scale) {
    if (E.isActive) {
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      this.pol = this.genPol(x, y, scale, true);
      Mix.blend(E.c);
      Mix.isErase = true;
      Mix.ctx.save();
      Mix.ctx.fillStyle = RGBr(E.c) + E.a + "%)";
      drawPolygon(this.pol.vertices);
      Mix.ctx.fill();
      Mix.ctx.restore();
    }
  }

  show(x, y, scale = 1) {
    this.draw(x, y, scale);
    this.fill(x, y, scale);
    this.hatch(x, y, scale);
    this.erase(x, y, scale);
  }
}

/**
 * Draws a circle on the canvas and fills it with the current fill color.
 *
 * @param {number} x - The x-coordinate of the center of the circle.
 * @param {number} y - The y-coordinate of the center of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {boolean} [r=false] - If true, applies a random factor to the radius for each segment.
 */
export function circle(x, y, radius, r = false) {
  // Create a new Plot instance for a curve shape
  let p = new Plot("curve");
  // Calculate the length of the arc for each quarter of the circle
  let l = (Math.PI * radius) / 2;
  // Initialize the angle for the drawing segments
  let angle = R.rr(0, 360);
  // Define a function to optionally add randomness to the segment length
  let rr = () => (r ? 1 + 0.2 * R.rr() : 1);
  // Add segments for each quarter of the circle with optional randomness
  p.addSegment(0 + angle * rr(), l * rr(), 1, true);
  p.addSegment(-90 + angle * rr(), l * rr(), 1, true);
  p.addSegment(-180 + angle * rr(), l * rr(), 1, true);
  p.addSegment(-270 + angle * rr(), l * rr(), 1, true);
  // Optionally add a random final angle for the last segment
  let angle2 = r ? R.randInt(-5, 5) : 0;
  if (r)
    p.addSegment(angle, Math.abs(angle2) * (Math.PI / 180) * radius, 1, true);
  // Finalize the plot
  p.endPlot(angle2 + angle, 1, true);
  // Fill / hatch / draw
  let o = [x - radius * R.sin(angle), y - radius * R.cos(-angle)];
  p.show(o[0], o[1], 1);
}

export function arc(x, y, radius, start, end) {
  _ensureReady();
  // Create a new Plot instance for a curve shape
  let p = new Plot("curve");
  // Calculate start angle and end angle
  let a1 = 270 - R.toDegrees(start),
    a2 = 270 - R.toDegrees(end);
  // Calculate length arc
  let arcAngle = R.toDegrees(end - start);
  let l = (Math.PI * radius * arcAngle) / 180;
  // Add segments to plot
  p.addSegment(a1, l, 1, true);
  p.endPlot(a2, 1, true);
  // Draw from starting point
  p.draw(x + radius * R.cos(-a1 - 90), y + radius * R.sin(-a1 - 90), 1);
}

// Holds the array of vertices for the custom shape being defined. Each vertex includes position and optional pressure.
let _strokeArray = false;
// Holds options for the stroke, such as curvature, that can influence the shape's rendering.
let _strokeOption;

/**
 * Starts recording vertices for a custom shape. Optionally, a curvature can be defined.
 * @param {number} [curvature] - From 0 to 1. Defines the curvature for the vertices being recorded (optional).
 */
export function beginShape(curvature = 0) {
  _strokeOption = R.constrain(curvature, 0, 1); // Set the curvature option for the shape
  _strokeArray = []; // Initialize the array to store vertices
}

/**
 * Records a vertex in the custom shape being defined between beginShape and endShape.
 * @param {number} x - The x-coordinate of the vertex.
 * @param {number} y - The y-coordinate of the vertex.
 * @param {number} [pressure] - The pressure at the vertex (optional).
 */
export function vertex(x, y, pressure) {
  _strokeArray.push([x, y, pressure]); // Add the vertex to the array
}

/**
 * Finishes recording vertices for a custom shape and either closes it or leaves it open.
 * It also triggers the drawing of the shape with the active stroke(), fill() and hatch() states.
 * @param {string} [a] - An optional argument to close the shape if set to "close".
 */
export function endShape(a) {
  if (a === "close") {
    _strokeArray.push(_strokeArray[0]); // Close the shape by connecting the last vertex to the first
    _strokeArray.push(_strokeArray[1]);
  }
  // Create a new Plot with the recorded vertices and curvature option
  let plot =
    _strokeOption == 0 && !FF.isActive
      ? new Polygon(_strokeArray)
      : _createSpline(
          _strokeArray,
          _strokeOption,
          a === "close" ? true : false
        );
  plot.show();
  _strokeArray = false; // Clear the array after the shape has been drawn
}

/**
 * Begins a new stroke with a given type and starting position. This initializes
 * a new Plot to record the stroke's path.
 * @param {string} type - The type of the stroke, which defines the kind of Plot to create.
 * @param {number} x - The x-coordinate of the starting point of the stroke.
 * @param {number} y - The y-coordinate of the starting point of the stroke.
 */
export function beginStroke(type, x, y) {
  _strokeOption = [x, y]; // Store the starting position for later use
  _strokeArray = new Plot(type); // Initialize a new Plot with the specified type
}

/**
 * Adds a segment to the stroke with a given angle, length, and pressure. This function
 * is called between beginStroke and endStroke to define the stroke's path.
 * @param {number} angle - The initial angle of the segment, relative to the canvas.
 * @param {number} length - The length of the segment.
 * @param {number} pressure - The pressure at the start of the segment, affecting properties like width.
 */
export function segment(angle, length, pressure) {
  _strokeArray.addSegment(angle, length, pressure); // Add the new segment to the Plot
}

/**
 * Completes the stroke path and triggers the rendering of the stroke.
 * @param {number} angle - The angle of the curve at the last point of the stroke path.
 * @param {number} pressure - The pressure at the end of the stroke.
 */
export function endStroke(angle, pressure) {
  _strokeArray.endPlot(angle, pressure); // Finalize the Plot with the end angle and pressure
  _strokeArray.draw(_strokeOption[0], _strokeOption[1], 1); // Draw the stroke using the stored starting position
  _strokeArray = false; // Clear the _strokeArray to indicate the end of this stroke
}

/**
 * Creates a new Plot object.
 * @param {Array<Array<number>>} array_points - An array of points defining the spline curve.
 * @param {number} [curvature=0.5] - The curvature of the spline curve, beterrn 0 and 1. A curvature of 0 will create a series of straight segments.
 */
function _createSpline(array_points, curvature = 0.5, _close = false) {
  // Initialize the plot type based on curvature
  let plotType = curvature === 0 ? "segments" : "curve";
  let p = new Plot(plotType);

  // Proceed only if there are points provided
  if (array_points && array_points.length > 0) {
    // Add each segment to the plot
    let done = 0;
    let pep, tep, pep2;
    for (let i = 0; i < array_points.length - 1; i++) {
      if (curvature > 0 && i < array_points.length - 2) {
        // Get the current and next points
        let p1 = array_points[i],
          p2 = array_points[i + 1],
          p3 = array_points[i + 2];
        // Calculate distances and angles between points
        let d1 = R.dist(p1[0], p1[1], p2[0], p2[1]),
          d2 = R.dist(p2[0], p2[1], p3[0], p3[1]);
        let a1 = R.calcAngle(p1[0], p1[1], p2[0], p2[1]),
          a2 = R.calcAngle(p2[0], p2[1], p3[0], p3[1]);
        // Calculate curvature based on the minimum distance
        let dd = curvature * Math.min(Math.min(d1, d2), 0.5 * Math.min(d1, d2)),
          dmax = Math.max(d1, d2);
        let s1 = d1 - dd,
          s2 = d2 - dd;
        // If the angles are approximately the same, create a straight segment
        if (Math.floor(a1) === Math.floor(a2)) {
          let temp = _close ? (i === 0 ? 0 : d1 - done) : d1 - done;
          let temp2 = _close ? (i === 0 ? 0 : d2 - pep2) : d2;
          p.addSegment(a1, temp, p1[2], true);
          if (i === array_points.length - 3)
            p.addSegment(a2, temp2, p2[2], true);
          done = 0;
          if (i === 0)
            (pep = d1), (pep2 = dd), (tep = array_points[1]), (done = 0);
        } else {
          // If the angles are not the same, create curves, etc (this is a too complex...)
          let point1 = {
            x: p2[0] - dd * R.cos(-a1),
            y: p2[1] - dd * R.sin(-a1),
          };
          let point2 = {
            x: point1.x + dmax * R.cos(-a1 + 90),
            y: point1.y + dmax * R.sin(-a1 + 90),
          };
          let point3 = {
            x: p2[0] + dd * R.cos(-a2),
            y: p2[1] + dd * R.sin(-a2),
          };
          let point4 = {
            x: point3.x + dmax * R.cos(-a2 + 90),
            y: point3.y + dmax * R.sin(-a2 + 90),
          };
          let int = _intersectLines(point1, point2, point3, point4, true);
          let radius = R.dist(point1.x, point1.y, int.x, int.y);
          let disti = R.dist(point1.x, point1.y, point3.x, point3.y) / 2;
          let a3 = 2 * Math.asin(disti / radius) * (180 / Math.PI);
          let s3 = (PI2 * radius * a3) / 360;
          let temp = _close ? (i === 0 ? 0 : s1 - done) : s1 - done;
          let temp2 =
            i === array_points.length - 3 ? (_close ? pep - dd : s2) : 0;
          p.addSegment(a1, temp, p1[2], true);
          p.addSegment(a1, isNaN(s3) ? 0 : s3, p1[2], true);
          p.addSegment(a2, temp2, p2[2], true);
          done = dd;
          if (i === 0) (pep = s1), (pep2 = dd), (tep = [point1.x, point1.y]);
        }
        if (i == array_points.length - 3) {
          p.endPlot(a2, p2[2], true);
        }
      } else if (curvature === 0) {
        // If curvature is 0, simply create segments
        if (i === 0 && _close) array_points.pop();
        let p1 = array_points[i],
          p2 = array_points[i + 1];
        let d = R.dist(p1[0], p1[1], p2[0], p2[1]);
        let a = R.calcAngle(p1[0], p1[1], p2[0], p2[1]);
        p.addSegment(a, d, p2[2], true);
        if (i == array_points.length - 2) {
          p.endPlot(a, 1, true);
        }
      }
    }
    // Set the origin point from the first point in the array
    p.origin = _close && curvature !== 0 ? tep : array_points[0];
  }
  return p;
}

/**
 * Creates and draws a spline curve with the given points and curvature.
 * @param {Array<Array<number>>} array_points - An array of points defining the spline curve.
 * @param {number} [curvature=0.5] - The curvature of the spline curve, between 0 and 1. A curvature of 0 will create a series of straight segments.
 */
export function spline(array_points, curvature = 0.5) {
  let p = _createSpline(array_points, curvature); // Create a new Plot-spline instance
  p.draw(); // Draw the Plot
}

// =============================================================================
// Section: Fill Management
// =============================================================================
/**
 * The Fill Management section contains functions and classes dedicated to handling
 * the fill properties of shapes within the drawing context. It supports complex fill
 * operations with effects such as bleeding to simulate watercolor-like textures. The
 * methods provided allow for setting the fill color with opacity, controlling the
 * intensity of the bleed effect, and enabling or disabling the fill operation.
 *
 * The watercolor effect implementation is inspired by Tyler Hobbs' generative art
 * techniques for simulating watercolor paints.
 */

// No docs for now but explicit enough
const E = {};
export function erase(color = _bg_Color, alpha = 255) {
  E.isActive = true;
  E.c = new Color(color);
  E.a = alpha;
}
export function noErase() {
  E.isActive = false;
}

/**
 * Sets the fill color and opacity for subsequent drawing operations.
 * @param {number|Color} a - The red component of the color or grayscale value, a CSS color string, or a Color object.
 * @param {number} [b] - The green component of the color or the grayscale opacity if two arguments.
 * @param {number} [c] - The blue component of the color.
 * @param {number} [d] - The opacity of the color.
 */
export function fill(a, b, c, d) {
  _ensureReady();
  F.opacity = arguments.length < 4 ? b : d;
  F.color = arguments.length < 3 ? new Color(a) : new Color(a, b, c);
  F.isActive = true;
}

/**
 * Sets the bleed and texture levels for the fill operation, simulating a watercolor effect.
 * @param {number} _i - The intensity of the bleed effect, capped at 0.5.
 * @param {number} _texture - The texture of the watercolor effect, from 0 to 1.
 */
export function bleed(_i, _direction = "out") {
  _ensureReady();
  F.bleed_strength = R.constrain(_i, 0, 1);
  F.direction = _direction;
}

export function fillTexture(_texture = 0.4, _border = 0.4) {
  _ensureReady();
  F.texture_strength = R.constrain(_texture, 0, 1);
  F.border_strength = R.constrain(_border, 0, 1);
}

/**
 * Disables the fill for subsequent drawing operations.
 */
export function noFill() {
  F.isActive = false;
}

/**
 * Disables some operations in order to guarantee a consistent bleed efect for animations (at different bleed levels)
 */
export function fillAnimatedMode(bool) {
  F.isAnimated = bool;
}

/**
 * Object representing the fill state and operations for drawing.
 * @property {boolean} isActive - Indicates if the fill operation is active.
 * @property {boolean} isAnimated - Enable or disable animation-mode
 * @property {Array} v - Array of Vector representing vertices of the polygon to fill.
 * @property {Array} m - Array of multipliers for the bleed effect on each vertex.
 * @property {Color} color - Current fill color.
 * @property {Color} opacity - Current fill opacity.
 * @property {number} bleed_strength - Base value for bleed effect.
 * @property {number} texture_strength - Base value for texture strength.
 * @property {number} border_strength - Base value for border strength.
 * @property {function} fill - Method to fill a polygon with a watercolor effect.
 * @property {function} calcCenter - Method to calculate the centroid of the polygon.
 */
const F = {
  isActive: false,
  isAnimated: false,
  color: new Color("#002185"),
  opacity: 60,
  bleed_strength: 0.07,
  texture_strength: 0.4,
  border_strength: 0.4,

  /**
   * Fills the given polygon with a watercolor effect.
   * @param {Object} polygon - The polygon to fill.
   */
  fill(polygon) {
    // Store polygon
    this.polygon = polygon;
    // Map polygon vertices to Vector objects
    let v = [...polygon.vertices];
    const vLength = v.length;
    // Shift vertices randomly to create a more natural watercolor edge
    let shift = R.randInt(0, vLength);
    // Calculate fluidity once, outside the loop
    const fluid = vLength * R.rr(0.2, 0.4);
    // Map vertices to bleed multipliers with more intense effect on 'fluid' vertices
    const strength = this.bleed_strength;
    F.m = v.map((_, i) => {
      let multiplier = R.rr(0.5, 1.4) * strength;
      return i < fluid ? multiplier : multiplier * 0.25;
    });
    shift -= ~~(vLength * 0.15);
    v = [...v.slice(shift), ...v.slice(0, shift)];
    // Create and fill the polygon with the calculated bleed effect
    let pol = new FillPolygon(v, this.m, this.calcCenter(v), [], true);
    pol.fill(
      this.color,
      R.map(this.opacity, 0, 100, 0, 1, true),
      this.texture_strength,
      true
    );
  },

  /**
   * Calculates the center point of the polygon based on the vertices.
   * @returns {Object} Object representing the centroid of the polygon.
   */
  calcCenter(v) {
    let midx = 0,
      midy = 0;
    for (let i = 0; i < v.length; ++i) {
      midx += v[i].x;
      midy += v[i].y;
    }
    (midx /= v.length), (midy /= v.length);
    return { x: midx, y: midy };
  },
};

/**
 * The FillPolygon class is used to create and manage the properties of the polygons that produces
 * the watercolor effect. It includes methods to grow (expand) the polygon and apply layers
 * of color with varying intensity and erase parts to simulate a natural watercolor bleed.
 * The implementation follows Tyler Hobbs' guide to simulating watercolor:
 * https://tylerxhobbs.com/essays/2017/a-generative-approach-to-simulating-watercolor-paints
 */
class FillPolygon {
  /**
   * The constructor initializes the polygon with a set of vertices, multipliers for the bleed effect, and a center point.
   * @param {Vector[]} _v - An array of Vector objects representing the vertices of the polygon.
   * @param {number[]} _m - An array of numbers representing the multipliers for the bleed effect at each vertex.
   * @param {Vector} _center - A Vector representing the calculated center point of the polygon.
   * @param {boolean[]} dir - An array of booleans representing the bleed direction.
   * @param {boolean} isFirst - Boolean = true for initial fill polygon
   */
  constructor(_v, _m, _center, dir, isFirst = false) {
    this.pol = new Polygon(_v, true);
    this.v = _v;
    this.dir = dir;
    this.m = _m;
    this.midP = _center;
    this.size = -Infinity;
    for (let v of this.v) {
      this.size = Math.max(
        R.dist(this.midP.x, this.midP.y, v.x, v.y),
        this.size
      );
    }
    // This calculates the bleed direction for the initial shape, for each of the vertices.
    if (isFirst) {
      for (let i = 0; i < this.v.length; i++) {
        const v1 = this.v[i];
        const v2 = this.v[(i + 1) % this.v.length];
        const side = { x: v2.x - v1.x, y: v2.y - v1.y };
        const rt = _rotate(0, 0, side.x, side.y, 90);
        let linea = {
          point1: { x: v1.x + side.x / 2, y: v1.y + side.y / 2 },
          point2: { x: v1.x + side.x / 2 + rt.x, y: v1.y + side.y / 2 + rt.y },
        };
        const isLeft = (a, b, c) => {
          return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0.01;
        };
        let d1 = 0;
        for (let int of F.polygon.intersect(linea)) {
          if (isLeft(v1, v2, int)) d1++;
        }
        this.dir[i] = d1 % 2 === 0 ? true : false;
      }
    }
  }

  trim(factor = 1) {
    let v = [...this.v],
      m = [...this.m],
      dir = [...this.dir];

    if (this.v.length > 8 && factor >= 0 && factor !== 1) {
      let numTrim = ~~((1 - factor) * this.v.length);

      let sp = ~~this.v.length / 2 - ~~numTrim / 2;
      v.splice(sp, numTrim);
      m.splice(sp, numTrim);
      dir.splice(sp, numTrim);
    }

    return { v: v, m: m, dir: dir };
  }

  /**
   * Grows the polygon's vertices outwards to simulate the spread of watercolor.
   * Optionally, can also shrink (degrow) the polygon's vertices inward.
   * @param {number} _a - The growth factor.
   * @param {boolean} [degrow=false] - If true, vertices will move inwards.
   * @returns {FillPolygon} A new `FillPolygon` object with adjusted vertices.
   */
  grow(growthFactor = 1, degrow) {
    const newVerts = [];
    const newMods = [];
    const newDirs = [];

    // Determine the length of vertices to process based on growth factor
    // Cache trimmed arrays and their length
    const trimmed = this.trim(growthFactor);
    const tr_v = trimmed.v;
    const tr_m = trimmed.m;
    const tr_dir = trimmed.dir;
    const len = tr_v.length;

    // Pre-compute values that do not change within the loop
    const modAdjustment = degrow ? -0.5 : 1;
    const bleedDirection = F.direction === "out" ? -90 : 90;
    // Inline changeModifier to reduce function calls
    const changeModifier = (modifier) => {
      return modifier + R.pseudoGaussian(0, 0.01);
    };
    let cond =
      growthFactor === 999 ? (F.bleed_strength <= 0.1 ? 0.25 : 0.75) : false;
    // Loop through each vertex to calculate the new position based on growth
    for (let i = 0; i < len; i++) {
      const currentVertex = tr_v[i];
      const nextVertex = tr_v[(i + 1) % len];
      // Determine the growth modifier
      let mod = cond || tr_m[i];
      mod *= modAdjustment;

      // Calculate side
      let side = {
        x: nextVertex.x - currentVertex.x,
        y: nextVertex.y - currentVertex.y,
      };

      // Make sure that we always bleed in the selected direction
      let rotationDegrees =
        (tr_dir[i] ? bleedDirection : -bleedDirection) + R.rr(-0.4, 0.4) * 45;
      let direction = _rotate(0, 0, side.x, side.y, rotationDegrees);

      // Calculate the middle vertex position
      let lerp = R.constrain(R.gaussian(0.5, 0.2), 0.1, 0.9);
      let mult = R.gaussian(0.5, 0.2) * R.rr(0.6, 1.4) * mod;

      // Calculate the new vertex position
      let newVertex = {
        x: currentVertex.x + side.x * lerp + direction.x * mult,
        y: currentVertex.y + side.y * lerp + direction.y * mult,
      };

      // Add the new vertex and its modifier
      newVerts.push(currentVertex, newVertex);
      newMods.push(mod, changeModifier(mod));
      newDirs.push(tr_dir[i], tr_dir[i]);
    }
    return new FillPolygon(newVerts, newMods, this.midP, newDirs);
  }

  /**
   * Fills the polygon with the specified color and intensity.
   * It uses layered growth to simulate watercolor paper absorption and drying patterns.
   * @param {Color|string} color - The fill color.
   * @param {number} intensity - The opacity of the color layers.
   */
  fill(color, intensity, tex) {
    // Precalculate stuff
    const numLayers = 24;
    const texture = tex * 3;
    const int = intensity * 2;

    // Perform initial setup only once
    Mix.blend(color);
    Mix.ctx.save();
    Mix.ctx.strokeStyle = RGBr(color) + 0.05 * F.border_strength + ")";
    Mix.ctx.lineWidth = 0;
    Mix.ctx.fillStyle = RGBr(color) + int + "%)";

    // Set the different polygons for texture
    let pol = this.grow();
    while (pol.v.length <= 15) {
      pol = pol.grow();
    }

    let pols;

    for (let i = 0; i < numLayers; i++) {
      if (i % 4 === 0) {
        pol = pol.grow();
        pols = [
          pol.grow(1 - 0.0125 * i),
          pol.grow(0.6 - 0.0125 * i),
          pol.grow(0.35 - 0.0125 * i),
        ];
        pols[2].grow(999).layer();
      }

      // Draw layers
      for (let p of pols) p.grow(999, true).grow(999).layer();
      if (texture !== 0 && i % 2 === 0) pol.erase(texture, intensity);
    }

    Mix.ctx.restore();
  }

  /**
   * Adds a layer of color to the polygon with specified opacity.
   * It also sets a stroke to outline the layer edges.
   * @param {number} _nr - The layer number, affecting the stroke and opacity mapping.
   * @param {boolean} [bool=true] - If true, adds a stroke to the layer.
   */
  layer() {
    // Set fill and stroke properties once
    drawPolygon(this.v);
    Mix.ctx.stroke();
    Mix.ctx.fill();
  }

  /**
   * Erases parts of the polygon to create a more natural, uneven watercolor texture.
   * Uses random placement and sizing of circles to simulate texture.
   */
  erase(texture, intensity) {
    Mix.ctx.save();
    if (isMobile) {
      drawPolygon(this.v);
      Mix.ctx.clip();
    }
    // Cache local values to avoid repeated property lookups
    const numCircles = R.rr(110, 170) * R.map(texture, 0, 1, 2, 3);
    const halfSize = this.size / 2;
    const minSizeFactor = 0.015 * this.size;
    const maxSizeFactor = 0.2 * this.size;
    const midX = this.midP.x;
    const midY = this.midP.y;
    Mix.ctx.globalCompositeOperation = "destination-out";
    let i = (5 - R.map(intensity, 80, 120, 0.3, 2, true)) * texture;
    Mix.ctx.fillStyle = RGBr(this.color) + i / 255 + ")";
    Mix.ctx.lineWidth = 0;
    for (let i = 0; i < numCircles; i++) {
      const x = midX + R.gaussian(0, halfSize);
      const y = midY + R.gaussian(0, halfSize);
      const size = R.rr(minSizeFactor, maxSizeFactor);
      Mix.ctx.beginPath();
      B.circle(x, y, size);
      if (i % 4 !== 0) Mix.ctx.fill();
    }
    Mix.ctx.globalCompositeOperation = "source-over";
    Mix.ctx.restore();
  }
}

// =============================================================================
// Section: Standard Brushes
// =============================================================================

/**
 * Defines a set of standard brushes with specific characteristics. Each brush is defined
 * with properties such as weight, vibration, definition, quality, opacity, spacing, and
 * pressure sensitivity. Some brushes have additional properties like type, tip, and rotate.
 */
const _vals = [
  "weight",
  "vibration",
  "definition",
  "quality",
  "opacity",
  "spacing",
  "pressure",
  "type",
  "tip",
  "rotate",
];
const _standard_brushes = [
  // Define each brush with a name and a set of parameters
  // For example, the "pen" brush has a weight of 0.35, a vibration of 0.12, etc.
  // The "marker2" brush has a custom tip defined by a function that draws rectangles.
  [
    "pen",
    [0.35, 0.12, 0.5, 8, 88, 0.3, { curve: [0.15, 0.2], min_max: [1.4, 0.9] }],
  ],
  [
    "rotring",
    [
      0.2,
      0.05,
      0.5,
      30,
      115,
      0.15,
      { curve: [0.35, 0.2], min_max: [1.3, 0.9] },
    ],
  ],
  [
    "2B",
    [0.35, 0.6, 0.1, 8, 140, 0.2, { curve: [0.15, 0.2], min_max: [1.5, 1] }],
  ],
  [
    "HB",
    [0.3, 0.5, 0.4, 4, 130, 0.25, { curve: [0.15, 0.2], min_max: [1.2, 0.9] }],
  ],
  [
    "2H",
    [0.2, 0.4, 0.3, 2, 100, 0.2, { curve: [0.15, 0.2], min_max: [1.2, 0.9] }],
  ],
  [
    "cpencil",
    [0.4, 0.6, 0.8, 7, 75, 0.15, { curve: [0.15, 0.2], min_max: [0.95, 1.2] }],
  ],
  [
    "charcoal",
    [0.5, 2, 0.8, 300, 70, 0.06, { curve: [0.15, 0.2], min_max: [1.5, 0.8] }],
  ],
  [
    "hatch_brush",
    [0.2, 0.4, 0.3, 2, 135, 0.15, { curve: [0.5, 0.7], min_max: [1, 1.5] }],
  ],
  [
    "spray",
    [0.2, 12, 15, 40, 35, 0.65, { curve: [0, 0.1], min_max: [1, 1] }, "spray"],
  ],
  [
    "marker",
    [
      2.5,
      0.12,
      null,
      null,
      25,
      0.4,
      { curve: [0.35, 0.25], min_max: [1.5, 1] },
      "marker",
    ],
  ],
];
/**
 * Iterates through the list of standard brushes and adds each one to the brush manager.
 * The brush manager is assumed to be a global object `B` that has an `add` method.
 */
for (let s of _standard_brushes) {
  let obj = {};
  for (let i = 0; i < s[1].length; i++) obj[_vals[i]] = s[1][i];
  add(s[0], obj);
}
