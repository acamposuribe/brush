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
let cID, Cwidth, Cheight, Density;

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
    FlowField.create(); // Load flowfield system
  }
  Mix.load();
}

/**
 * Preloads necessary assets or configurations.
 * This function should be called before setup to ensure all assets are loaded.
 */
function preload() {
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
const _saveState = {};

/**
 * Saves current state to object
 */
export function save() {
  Mix.ctx.save();
  _saveState.field = FlowField.getState();
  _saveState.stroke = Brush.getState();
  _saveState.hatch = Hatch.getState();
  _saveState.fill = Fill.getState();
}

/**
 * Restores previous state from object
 */
export function restore() {
  Mix.ctx.restore();
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;

  FlowField.setState(_saveState.field);
  Brush.setState(_saveState.stroke);
  Hatch.setState(_saveState.hatch);
  Fill.setState(_saveState.fill);
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
  return "rgb(255 0 0 / ";
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
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
  },

  /**
   * Applies the blend shader to the current rendering context.
   * @param {string} _c - The color used for blending, as a Color object.
   * @param {boolean} _isLast - Indicates if this is the last blend after setup and draw.
   * @param {boolean} _isLast - Indicates if this is the last blend after setup and draw.
   */
  blend(_color = false, _isLast = false, _isImg = false, _sp = false) {
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
          sp: _sp,
        },
        [imageData]
      );
      this.isErase = false;
      // We cache the new color here
      if (!_isLast) this.currentColor = _color.gl;
      if (_isLast && !_sp) this.isBlending = false;
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
  Mix.worker.postMessage({
    color: _bg_Color.gl,
    isBG: true,
  });
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
  Mix.ctx.scale(a, a);
}

/**
 * Activates a specific vector field by name, ensuring it's ready for use.
 * @param {string} a - The name of the vector field to activate.
 */
export function field(a) {
  _ensureReady();
  // Check if field exists
  FlowField.isActive = true; // Mark the field framework as active
  FlowField.current = a; // Update the current field
}

/**
 * Deactivates the current vector field.
 */
export function noField() {
  FlowField.isActive = false;
}

/**
 * Adds a new vector field to the field list with a unique name and a generator function.
 * @param {string} name - The unique name for the new vector field.
 * @param {Function} funct - The function that generates the field values.
 */
export function addField(name, funct) {
  _ensureReady();
  FlowField.list.set(name, { gen: funct }); // Map the field name to its generator function
  FlowField.current = name; // Set the newly added field as the current one to be used
  FlowField.refresh(); // Refresh the field values using the generator function
}

/**
 * Refreshes the current vector field based on the generator function, which can be time-dependent.
 * @param {number} [t=0] - An optional time parameter that can affect field generation.
 */
export function refreshField(t) {
  FlowField.refresh(t);
}

/**
 * Retrieves a list of all available vector field names.
 * @returns {Iterator<string>} An iterator that provides the names of all the fields.
 */
export function listFields() {
  return Array.from(FlowField.list.keys());
}

/**
 * Represents a framework for managing vector fields used in dynamic simulations or visualizations.
 * @property {boolean} isActive - Indicates whether any vector field is currently active.
 * @property {Map} list - A map associating field names to their respective generator functions and current states.
 * @property {Array} field - An array representing the current vector field grid with values.
 */
const FlowField = {
  list: new Map(),
  isActive: false,
  current: null,

  getState() {
    const { isActive, current } = this;
    return { isActive, current };
  },

  setState(state) {
    Object.assign(this, state);
  },

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
    BleedField.genField();
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
      for (let column = 0; column < FlowField.num_columns; column++) {
        for (let row = 0; row < FlowField.num_rows; row++) {
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
    addField("hand", function (t, field) {
      let baseSize = R.rr(0.2, 0.8);
      let baseAngle = R.randInt(5, 10);

      for (let column = 0; column < FlowField.num_columns; column++) {
        for (let row = 0; row < FlowField.num_rows; row++) {
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
      for (let column = 0; column < FlowField.num_columns; column++) {
        for (let row = 0; row < FlowField.num_rows; row++) {
          let addition = R.randInt(15, 20);
          let angle = baseAngle * R.sin(baseSize * row * column + addition);
          field[column][row] = 1.1 * angle * R.cos(t);
        }
      }
      return field;
    });
  },
};

export const BleedField = {
  genField() {
    this.resolution = Cwidth * 0.01,
    this.num_columns = Math.round((2 * Cwidth) / this.resolution);
    this.num_rows = Math.round((2 * Cheight) / this.resolution);
    this.field = new Array(this.num_columns); // Initialize the field array
    this.fieldTemp = new Array(this.num_columns);
    this.brush = new Array(this.num_columns);
    for (let i = 0; i < this.num_columns; i++) {
      this.field[i] = new Float32Array(this.num_rows);
      this.fieldTemp[i] = new Float32Array(this.num_rows);
      this.brush[i] = new Float32Array(this.num_rows);
    }
  },
  calc(x,y) {
    const x_offset = x + Matrix.x - FlowField.left_x;
    const y_offset = y + Matrix.y - FlowField.top_y;
    this.column_index = Math.round(x_offset / this.resolution);
    this.row_index = Math.round(y_offset / this.resolution);
  },
  get(x, y, value = false) {
    this.calc(x,y)
    if (this.isOut()) return value || 0
    if (value) {
      let current = this.field[this.column_index][this.row_index]
      let biggest = Math.max(current, value);
      this.fieldTemp[this.column_index][this.row_index] = Math.max(biggest, this.fieldTemp[this.column_index][this.row_index] * 0.75);
      return biggest;
    }
    return this.field[this.column_index][this.row_index]
  },
  isOut() {
return (this.column_index >= this.num_columns || this.column_index < 0) || (this.row_index >= this.num_rows || this.row_index < 0)
  },
  gete(x,y) {
    this.calc(x,y)
    if (this.isOut()) return 0
    //console.log(this.brush)
    return this.brush[this.column_index][this.row_index]
  },
  update() {
    this.field = this.fieldTemp.slice();
  },
  increase(x,y) {
    this.calc(x,y)
    if (this.isOut()) return
    this.brush[this.column_index][this.row_index] = R.rr(0,0.5);
  }
}

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
    if (FlowField.isActive || Fill.isActive) {
      this.x_offset = this.x + Matrix.x - FlowField.left_x;
      this.y_offset = this.y + Matrix.y - FlowField.top_y;
      this.column_index = Math.round(this.x_offset / FlowField.R);
      this.row_index = Math.round(this.y_offset / FlowField.R);
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
    return FlowField.isActive
      ? this.column_index >= 0 &&
          this.row_index >= 0 &&
          this.column_index < FlowField.num_columns &&
          this.row_index < FlowField.num_rows
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
    return this.isIn() && FlowField.isActive
      ? FlowField.flow_field()[this.column_index][this.row_index]
      : 0;
  }

  /**
   * Moves the position along the flow field by a certain length.
   * @param {number} _length - The length to move along the field.
   * @param {number} _dir - The direction of movement.
   * @param {number} _step_length - The length of each step.
   * @param {boolean} isFlow - Whether to use the flow field for movement.
   */
  moveTo(_length, _dir, _step_length = Brush.spacing(), isFlow = true) {
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

const PI2 = Math.PI * 2;

/**
 * The B object, representing a brush, contains properties and methods to manipulate
 * the brush's appearance and behavior when drawing on the canvas.
 * @type {Object}
 */
const Brush = {
  isActive: true, // Indicates if the brush is active.
  color: new Color("black"), // Current color of the brush.
  weight: 1, // Current weight (size) of the brush.
  clipWindow: null, // Clipping region for brush strokes.
  type: "HB", // Name of the current brush.

  list: new Map(), // Stores brush definitions by name.

  getState() {
    const { isActive, type, color, weight, clipWindow } = this;
    return { isActive, type, color, weight, clipWindow };
  },

  setState(state) {
    Object.assign(this, state);
  },

  /**
   * Adds a new brush with the specified parameters to the brush list.
   * @param {string} name - The unique name for the new brush.
   * @param {BrushParameters} params - The parameters defining the brush behavior and appearance.
   */
  add(name, params) {
    const validTypes = ["marker", "custom", "image", "spray"];
    params.type = validTypes.includes(params.type) ? params.type : "default";
    this.list.set(name, { param: params, colors: [], buffers: [] });
  },

  /**
   * Retrieves a list of all available brush names from the brush manager.
   * @returns {Array<string>} An array containing the names of all brushes.
   */
  box() {
    return [...this.list.keys()];
  },

  /**
   * Adjusts the global scale of standard brushes based on the provided scale factor.
   * This affects the weight, vibration, and spacing of each standard brush.
   *
   * @param {number} _scale - The scaling factor to apply to the brush parameters.
   */
  scaleBrushes(scaleFactor) {
    for (const { param } of this.list.values()) {
      if (param) {
        param.weight *= scaleFactor;
        param.vibration *= scaleFactor;
        param.spacing *= scaleFactor;
      }
    }
  },

  /**
   * Sets only the current brush type based on the given name.
   * @param {string} brushName - The name of the brush to set as current.
   */
  pick(brushName) {
    if (this.list.has(brushName)) this.type = brushName;
  },

  /**
   * Sets the color of the current brush.
   * @param {number|string|Color} r - The red component of the color, a CSS color string, or a Color object.
   * @param {number} [g] - The green component of the color.
   * @param {number} [b] - The blue component of the color.
   */
  strokeStyle(r, g, b) {
    this.color = new Color(...arguments);
    this.isActive = true;
  },

  /**
   * Sets the weight (size) of the current brush.
   * @param {number} weight - The weight to set for the brush.
   */
  lineWidth(weight) {
    this.weight = weight;
  },

  /**
   * Sets the current brush with the specified name, color, and weight.
   * @param {string} brushName - The name of the brush to set as current.
   * @param {string|Color} color - The color to set for the brush.
   * @param {number} weight - The weight (size) to set for the brush.
   */
  set(brushName, color, weight = 1) {
    this.pick(brushName);
    this.strokeStyle(color);
    this.lineWidth(weight);
  },

  /**
   * Disables the stroke for subsequent drawing operations.
   * This function sets the brush's `isActive` property to false, indicating that no stroke
   * should be applied to the shapes drawn after this method is called.
   */
  noStroke() {
    this.isActive = false;
  },

  /**
   * Defines a clipping region for the brush strokes.
   * @param {number[]} clippingRegion - An array defining the clipping region as [x1, y1, x2, y2].
   */
  clip(region) {
    this.clipWindow = region;
  },

  /**
   * Disables clipping region.
   */
  noClip() {
    this.clipWindow = null;
  },

  /**
   * Calculates the tip spacing based on the current brush parameters.
   * @returns {number} The calculated spacing value.
   */
  spacing() {
    const { param } = this.list.get(this.type) ?? {};
    if (!param) return 1;
    return param.type === "default" || param.type === "spray"
      ? param.spacing / this.weight
      : param.spacing;
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
  draw(angleScale, isPlot) {
    if (!isPlot) this.dir = angleScale;
    this.saveState();

    const stepSize = this.spacing();
    const totalSteps = Math.round(
      (this.length * (isPlot ? angleScale : 1)) / stepSize
    );

    for (let i = 0; i < totalSteps; i++) {
      this.tip();
      isPlot
        ? this.position.plotTo(this.plot, stepSize, stepSize, angleScale)
        : this.position.moveTo(stepSize, angleScale, stepSize, this.flow);
    }

    this.restoreState();
  },

  /**
   * Sets up the environment for a brush stroke.
   */
  saveState() {
    const { param } = this.list.get(this.type) ?? {};
    if (!param) return;
    this.p = param;

    // Pressure values for the stroke
    const { pressure } = param;
    this.a = pressure.type !== "custom" ? R.rr(-1, 1) : 0;
    this.b = pressure.type !== "custom" ? R.rr(1, 1.5) : 0;
    this.cp = pressure.type !== "custom" ? R.rr(3, 3.5) : R.rr(-0.2, 0.2);
    [this.min, this.max] = pressure.min_max;

    // Blend stuff
    Mix.blend(this.color);

    // Set state
    Mix.ctx.save();
    this.markerTip();
    this.alpha = this.calculateAlpha(); // Calcula Alpha
    this.applyColor(this.alpha); // Apply Color
    Mix.ctx.beginPath(); // Begin Path
  },

  /**
   * Restores the drawing state after a brush stroke is completed.
   */
  restoreState() {
    Mix.ctx.fill();
    this.markerTip();
    Mix.ctx.restore();
  },

  /**
   * Draws the tip of the brush based on the current pressure and position.
   * @param {number} pressure - The desired pressure value.
   */
  tip(customPressure = false) {
    if (!this.isInsideClippingArea()) return; // Check if it's inside clipping area
    let pressure = customPressure || this.calculatePressure(); // Calculate Pressure
    pressure *= (1-BleedField.gete(this.position.x,this.position.y));
    // Draw different tip types
    switch (this.p.type) {
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
    return this.p.pressure.type === "custom"
      ? R.map(
          this.p.pressure.curve(this.position.plotted / this.length) + this.cp,
          0,
          1,
          this.min,
          this.max,
          true
        )
      : this.gauss();
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
    a = 0.5 + this.p.pressure.curve[0] * this.a,
    b = 1 - this.p.pressure.curve[1] * this.b,
    c = this.cp,
    min = this.min,
    max = this.max
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
    return ["default", "spray"].includes(this.p.type)
      ? this.p.opacity
      : this.p.opacity / this.weight;
  },

  /**
   * Applies the current color and alpha to the renderer.
   * @param {number} alpha - The alpha (opacity) level to apply.
   */
  applyColor(alpha) {
    Mix.ctx.fillStyle = `${RGBr(this.color)}${alpha}%)`;
  },

  /**
   * Checks if the current brush position is inside the defined clipping area.
   * @returns {boolean} True if the position is inside the clipping area, false otherwise.
   */
  isInsideClippingArea() {
    if (this.clipWindow)
      return (
        this.position.x >= this.clipWindow[0] &&
        this.position.x <= this.clipWindow[2] &&
        this.position.y >= this.clipWindow[1] &&
        this.position.y <= this.clipWindow[3]
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
    const size = d / 1.2;
    Mix.ctx.rect(x - size / 2, y - size / 2, size, size);
  },

  /**
   * Draws a circle to the mask.
   */
  circle(x, y, d) {
    const radius = d / 2;
    Mix.ctx.moveTo(x + radius, y);
    Mix.ctx.arc(x, y, radius, 0, PI2);
  },

  /**
   * Draws the spray tip of the brush.
   * @param {number} pressure - The current pressure value.
   */
  drawSpray(pressure) {
    const vibration =
      this.weight * this.p.vibration * pressure +
      (this.weight * R.gaussian() * this.p.vibration) / 3;
    const sw = this.weight * R.rr(0.9, 1.1);
    const iterations = Math.ceil(this.p.quality / pressure);
    for (let j = 0; j < iterations; j++) {
      const r = R.rr(0.9, 1.1);
      const rX = r * vibration * R.rr(-1, 1);
      const yRandomFactor = R.rr(-1, 1);
      const sqrtPart = Math.sqrt((r * vibration) ** 2 - rX ** 2);
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
    const vibration = vibrate ? this.weight * this.p.vibration : 0;
    const rx = vibrate ? vibration * R.rr(-1, 1) : 0;
    const ry = vibrate ? vibration * R.rr(-1, 1) : 0;
    this.circle(
      this.position.x + rx,
      this.position.y + ry,
      this.weight * this.p.weight * pressure
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

    const vibration = vibrate ? this.weight * this.p.vibration : 0;
    const rx = vibrate ? vibration * R.rr(-1, 1) : 0;
    const ry = vibrate ? vibration * R.rr(-1, 1) : 0;

    Mix.ctx.translate(this.position.x + rx, this.position.y + ry);
    this.adjustSizeAndRotation(this.weight * pressure, alpha);

    this.p.tip(Mix.ctx);
    Mix.ctx.restore();
  },

  /**
   * Draws the default tip of the brush.
   * @param {number} pressure - The current pressure value.
   */
  drawDefault(pressure) {
    const vibration =
      this.weight *
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
    let angle = 0;
    if (this.p.rotate === "random") angle = R.randInt(0, PI2);
    else if (this.p.rotate === "natural") {
      angle =
        (this.plot ? -this.plot.angle(this.position.plotted) : -this.dir) +
        (this.flow ? this.position.angle() : 0);
      angle = (angle * Math.PI) / 180;
    }
    Mix.ctx.rotate(angle);
  },

  /**
   * Draws the marker tip with a blend effect.
   */
  markerTip() {
    if (this.isInsideClippingArea()) {
      let pressure = this.calculatePressure();
      let alpha = this.calculateAlpha(pressure);
      Mix.ctx.fillStyle = RGBr(this.color) + alpha / 3 + "%)";
      if (this.p.type === "marker") {
        for (let s = 1; s < 5; s++) {
          Mix.ctx.beginPath();
          this.drawMarker((pressure * s) / 5, false);
          Mix.ctx.fill();
        }
      } else if (this.p.type === "custom" || this.p.type === "image") {
        for (let s = 1; s < 5; s++) {
          Mix.ctx.beginPath();
          this.drawCustomOrImage((pressure * s) / 5, alpha, false);
          Mix.ctx.fill();
        }
      }
    }
  },
};

export const add = Brush.add.bind(Brush);
export const box = Brush.box.bind(Brush);
export const scaleBrushes = Brush.scaleBrushes.bind(Brush);
export const pick = Brush.pick.bind(Brush);
export const strokeStyle = Brush.strokeStyle.bind(Brush);
export const lineWidth = Brush.lineWidth.bind(Brush);
export const set = Brush.set.bind(Brush);
export const noStroke = Brush.noStroke.bind(Brush);
export const clip = Brush.clip.bind(Brush);
export const noClip = Brush.noClip.bind(Brush);

// =============================================================================
// Section: Basic Drawing using Brush
// =============================================================================

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
  Brush.initializeDrawingState(x1, y1, d, true, false);
  let angle = R.calcAngle(x1, y1, x2, y2);
  Brush.draw(angle, false);
}

/**
 * Draws a stroke with the current brush from a starting point in a specified direction.
 * @param {number} x - The x-coordinate of the starting point.
 * @param {number} y - The y-coordinate of the starting point.
 * @param {number} length - The length of the line to draw.
 * @param {number} dir - The direction in which to draw the line. Angles measured anticlockwise from the x-axis
 */
export function stroke(x, y, length, dir) {
  _ensureReady();
  Brush.initializeDrawingState(x, y, length, true, false);
  Brush.draw(R.toDegrees(dir), false);
}

/**
 * Draws a predefined plot.
 * @param {Object} p - An object representing the shape to draw.
 * @param {number} x - The x-coordinate of the starting position to draw the shape.
 * @param {number} y - The y-coordinate of the starting position to draw the shape.
 * @param {number} scale - The scale at which to draw the shape.
 */
function plot(p, x, y, scale) {
  _ensureReady();
  Brush.initializeDrawingState(x, y, p.length, true, p);
  Brush.draw(scale, true);
}

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
  Hatch.isActive = true;
  Hatch.hatchingParams = [dist, angle, options];
}

/**
 * Sets the brush type, color, and weight for subsequent hatches.
 * If this function is not called, hatches will use the parameters from stroke operations.
 * @param {string} brushName - The name of the brush to set as current.
 * @param {string|Color} color - The color to set for the brush.
 * @param {number} weight - The weight (size) to set for the brush.
 */
export function hatchStyle(brush, color = "black", weight = 1) {
  Hatch.hatchingBrush = [brush, color, weight];
}

/**
 * Disables hatching for subsequent shapes
 */
export function noHatch() {
  Hatch.isActive = false;
  Hatch.hatchingBrush = false;
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
const Hatch = {
  isActive: false,
  hatchingParams: [5, 45, {}],
  hatchingBrush: false,

  getState() {
    const { isActive, hatchingParams, hatchingBrush } = this;
    return { isActive, hatchingParams, hatchingBrush };
  },

  setState(state) {
    Object.assign(this, state);
  },

  /**
   * Creates a hatching pattern across the given polygons.
   *
   * @param {Array|Object} polygons - A single polygon or an array of polygons to apply the hatching.
   */
  hatch(polygons) {
    let dist = Hatch.hatchingParams[0];
    let angle = Hatch.hatchingParams[1];
    let options = Hatch.hatchingParams[2];

    // Save current stroke state
    let save = Brush.getState();

    // Change state if hatch has been set to different params than stroke
    if (Hatch.hatchingBrush)
      set(
        Hatch.hatchingBrush[0],
        Hatch.hatchingBrush[1],
        Hatch.hatchingBrush[2]
      );

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
    Brush.setState(save);
  },
};

export const hatchArray = Hatch.hatch;

// =============================================================================
// Section: Polygon and Plot Classes
// =============================================================================
/**
 * This section includes the Polygon class for managing polygons and functions for drawing basic geometries
 * like rectangles and circles. It provides methods for creating, intersecting, drawing, and filling polygons,
 * as well as hatching them with a given distance and angle.
 * It also defines the functionality for creating and managing plots, which are used to draw complex shapes,
 * strokes, and splines on a canvas.
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
    let curState = Brush.isActive;
    if (_brush) set(_brush, _color, _weight);
    if (Brush.isActive) {
      _ensureReady();
      for (let s of this.sides) {
        line(s[0].x, s[0].y, s[1].x, s[1].y);
      }
    }
    Brush.isActive = curState;
  }
  /**
   * Fills the polygon using the current fill state.
   */
  fill(_color = false, _opacity, _bleed, _texture, _border, _direction) {
    let curState = Fill.isActive;
    if (_color) {
      fillStyle(_color, _opacity);
      fillBleed(_bleed, _direction);
      fillTexture(_texture, _border);
    }
    if (Fill.isActive) {
      _ensureReady();
      Fill.fill(this);
    }
    Fill.isActive = curState;
  }
  /**
   * Creates hatch lines across the polygon based on a given distance and angle.
   */
  hatch(_dist = false, _angle, _options) {
    let curState = Hatch.isActive;
    if (_dist) hatch(_dist, _angle, _options);
    if (Hatch.isActive) {
      _ensureReady();
      Hatch.hatch(this);
    }
    Hatch.isActive = curState;
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
    let side = isHatch ? 0.15 : Fill.bleed_strength * 3;
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
    if (Brush.isActive) {
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
    if (Fill.isActive) {
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
    if (Hatch.isActive) {
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

// =============================================================================
// Section: Primitives and Geommetry
// =============================================================================

/**
 * Creates a Polygon from a given array of points and performs drawing and filling
 * operations based on active states.
 *
 * @param {Array} pointsArray - An array of points where each point is an array of two numbers [x, y, pressure].
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
    beginPath(0);
    moveTo(x, y);
    lineTo(x + w, y);
    lineTo(x + w, y + h);
    lineTo(x, y + h);
    closePath();
    drawPath();
}

/**
 * Draws a circle on the canvas
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

let _pathArray;
let _current;
let _curvature;

class SubPath {
  constructor() {
    this.isClosed = false;
    this.curvature = _curvature;
    this.vert = [];
  }
  vertex(x, y, pressure) {
    this.vert.push([x, y, pressure]);
  }
  show() {
    let plot = _createSpline(this.vert, this.curvature, this.isClosed);
    plot.show();
  }
}

export function beginPath(curvature = 0) {
  _curvature = R.constrain(curvature,0,1);
  _pathArray = [];
}

export function moveTo(x, y, pressure = 1) {
  _current = new SubPath();
  _pathArray.push(_current);
  _current.vertex(x, y, pressure);
}

export function lineTo(x, y, pressure = 1) {
  _current.vertex(x, y, pressure);
}

export function closePath() {
  _current.vertex(..._current.vert[0]);
  _current.isClosed = true;
}

export function drawPath() {
  for (let sub of _pathArray) {
    sub.show();
  }
  _pathArray = false;
}

let _strokeArray, _strokeOrigin;

/**
 * Begins a new stroke with a given type and starting position. This initializes
 * a new Plot to record the stroke's path.
 * @param {string} type - The type of the stroke, which defines the kind of Plot to create.
 * @param {number} x - The x-coordinate of the starting point of the stroke.
 * @param {number} y - The y-coordinate of the starting point of the stroke.
 */
export function beginStroke(type, x, y) {
  _strokeOrigin = [x, y]; // Store the starting position for later use
  _strokeArray = new Plot(type); // Initialize a new Plot with the specified type
}

/**
 * Adds a segment to the stroke with a given angle, length, and pressure. This function
 * is called between beginStroke and endStroke to define the stroke's path.
 * @param {number} angle - The initial angle of the segment, relative to the canvas.
 * @param {number} length - The length of the segment.
 * @param {number} pressure - The pressure at the start of the segment, affecting properties like width.
 */
export function move(angle, length, pressure) {
  _strokeArray.addSegment(angle, length, pressure); // Add the new segment to the Plot
}

/**
 * Completes the stroke path and triggers the rendering of the stroke.
 * @param {number} angle - The angle of the curve at the last point of the stroke path.
 * @param {number} pressure - The pressure at the end of the stroke.
 */
export function endStroke(angle, pressure) {
  _strokeArray.endPlot(angle, pressure); // Finalize the Plot with the end angle and pressure
  _strokeArray.draw(_strokeOrigin[0], _strokeOrigin[1], 1); // Draw the stroke using the stored starting position
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
  if (_close && curvature !== 0) array_points.push(array_points[1])

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
export function fillStyle(a, b, c, d) {
  _ensureReady();
  Fill.opacity = arguments.length < 4 ? b : d;
  Fill.color = arguments.length < 3 ? new Color(a) : new Color(a, b, c);
  Fill.isActive = true;
}

/**
 * Sets the bleed and texture levels for the fill operation, simulating a watercolor effect.
 * @param {number} _i - The intensity of the bleed effect, capped at 0.5.
 * @param {number} _texture - The texture of the watercolor effect, from 0 to 1.
 */
export function fillBleed(_i, _direction = "out") {
  _ensureReady();
  Fill.bleed_strength = R.constrain(_i, 0, 1);
  Fill.direction = _direction;
}

export function fillTexture(_texture = 0.4, _border = 0.4) {
  _ensureReady();
  Fill.texture_strength = R.constrain(_texture, 0, 1);
  Fill.border_strength = R.constrain(_border, 0, 1);
}

/**
 * Disables the fill for subsequent drawing operations.
 */
export function noFill() {
  Fill.isActive = false;
}

/**
 * Object representing the fill state and operations for drawing.
 * @property {boolean} isActive - Indicates if the fill operation is active.
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
const Fill = {
  isActive: false,
  color: new Color("#002185"),
  opacity: 60,
  bleed_strength: 0.07,
  texture_strength: 0.4,
  border_strength: 0.4,

  getState() {
    const {
      isActive,
      color,
      opacity,
      bleed_strength,
      texture_strength,
      border_strength,
    } = this;
    return {
      isActive,
      color,
      opacity,
      bleed_strength,
      texture_strength,
      border_strength,
    };
  },

  setState(state) {
    Object.assign(this, state);
  },

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
    // Calculate fluidity once, outside the loop
    const fluid = vLength * 0.25 * R.weightedRand({ 1: 5, 2: 10, 3: 60 });
    // Map vertices to bleed multipliers with more intense effect on 'fluid' vertices
    const strength = this.bleed_strength;
    this.m = v.map((_, i) => {
      let multiplier = R.rr(0.85, 1.2) * strength;
      return i > fluid ? multiplier : multiplier * 0.2;
    });

    // Shift vertices randomly to create a more natural watercolor edge
    let shift = R.randInt(0, vLength);
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
  calcCenter(pts) {
    var first = pts[0], last = pts[pts.length-1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    var twicearea=0,
    x=0, y=0,
    nPts = pts.length,
    p1, p2, f;
    for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
       p1 = pts[i]; p2 = pts[j];
       f = (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
       twicearea += f;
       x += (p1.x + p2.x - 2 * first.x) * f;
       y += (p1.y + p2.y - 2 * first.y) * f;
    }
    f = twicearea * 3;
    return { x:x/f + first.x, y:y/f + first.y };
 }
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
    this.sizeX = -Infinity;
    this.sizeY = -Infinity;
    for (let v of this.v) {
      this.sizeX = Math.max(
        R.dist(this.midP.x, 0, v.x, 0),
        this.sizeX
      );
      this.sizeY = Math.max(
        R.dist(this.midP.y, 0, v.y, 0),
        this.sizeY
      );
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
        for (let int of Fill.polygon.intersect(linea)) {
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
    const bleedDirection = Fill.direction === "out" ? -90 : 90;
    // Inline changeModifier to reduce function calls
    const changeModifier = (modifier) => {
      return modifier + R.pseudoGaussian(0, 0.02);
    };
    let cond = false;
    switch(growthFactor) {
      case 999:
        cond = R.rr(0.2,0.4)
        break;
      case 997:
        cond = Fill.bleed_strength / 1.7
    }    
    // Loop through each vertex to calculate the new position based on growth
    for (let i = 0; i < len; i++) {
      const currentVertex = tr_v[i];
      const nextVertex = tr_v[(i + 1) % len];
      // Determine the growth modifier
      let mod = cond || BleedField.get(currentVertex.x,currentVertex.y, tr_m[i]);


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
      newMods.push(tr_m[i], changeModifier(tr_m[i]));
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
    const int = intensity * 1.5;

    // Perform initial setup only once
    Mix.blend(color);
    Mix.ctx.save();
    Mix.ctx.fillStyle = RGBr(color) + int + "%)";
    Mix.ctx.strokeStyle = RGBr(this.color) + 0.008 * Fill.border_strength + ")";

    // Set the different polygons for texture
    let pol = this.grow();

    let pols;

    for (let i = 0; i < numLayers; i++) {
      if (i % 4 === 0) {
        pol = pol.grow();
      }
      pols = [
        pol.grow(1 - 0.0125 * i),
        pol.grow(0.7 - 0.0125 * i),
        pol.grow(0.4 - 0.0125 * i),
      ];

      // Draw layers
      for (let p of pols) p.grow(997).grow().layer(i);
      pol.grow(0.1).grow(999).layer(i)
      if (texture !== 0 && i % 2 === 0) pol.erase(texture * 3, intensity);

      if (i % 6 === 0) {
        Mix.blend(color, true, false, true);
      }
    }
    BleedField.update()
    Mix.ctx.restore();
  }

  /**
   * Adds a layer of color to the polygon with specified opacity.
   * It also sets a stroke to outline the layer edges.
   * @param {number} _nr - The layer number, affecting the stroke and opacity mapping.
   * @param {boolean} [bool=true] - If true, adds a stroke to the layer.
   */
  layer(i) {
    const size = Math.max(this.sizeX,this.sizeY)
    Mix.ctx.lineWidth = R.map(i, 0, 24, size / 30, size / 45, true);

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
    // Cache local values to avoid repeated property lookups
    const numCircles = R.rr(40, 60) * R.map(texture, 0, 1, 2, 3);
    const halfSizeX = this.sizeX / 2;
    const halfSizeY = this.sizeY / 2;
    const minSize = Math.min(this.sizeX,this.sizeY) * (1.4 - Fill.bleed_strength)
    const minSizeFactor = 0.03 * minSize;
    const maxSizeFactor = 0.25 * minSize;
    const midX = this.midP.x;
    const midY = this.midP.y;
    Mix.ctx.globalCompositeOperation = "destination-out";
    let i = (5 - R.map(intensity, 80, 120, 0.3, 2, true)) * texture;
    Mix.ctx.fillStyle = RGBr(this.color) + i / 255 + ")";
    Mix.ctx.lineWidth = 0;
    for (let i = 0; i < numCircles; i++) {
      const x = midX + R.gaussian(0, halfSizeX);
      const y = midY + R.gaussian(0, halfSizeY);
      const size = R.rr(minSizeFactor, maxSizeFactor);
      Mix.ctx.beginPath();
      Brush.circle(x, y, size);
      if (i % 4 !== 0) Mix.ctx.fill();
        if (Math.abs(x - midX) < 2 * halfSizeX && Math.abs(y - midY) < 2*halfSizeY) BleedField.increase(x,y)
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
    [0.4, 0.55, 0.8, 7, 70, 0.15, { curve: [0.15, 0.2], min_max: [0.95, 1.2] }],
  ],
  [
    "charcoal",
    [0.5, 2, 0.8, 300, 70, 0.06, { curve: [0.15, 0.2], min_max: [1.5, 0.8] }],
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

// =============================================================================
// Section: Drawing Loop
// =============================================================================

let _time = 0,
  _isLoop = true,
  _drawingLoop,
  _fps = 30;

export function loop(drawingLoop) {
  _drawingLoop = drawingLoop;
  _isLoop = true;
  requestAnimationFrame(drawLoop);
}

export let frameRate = (fps) => {
  if (fps) _fps = fps;
  return _fps;
};

export let frameCount = 0;
export function noLoop() {
  _isLoop = false;
}
function drawLoop(timeStamp) {
  if (_isLoop) {
    if (timeStamp > _time + 1000 / frameRate() || timeStamp === 0) {
      _time = timeStamp;
      frameCount++;
      _drawingLoop();
      endFrame();
    }
  }
  requestAnimationFrame(drawLoop);
}
