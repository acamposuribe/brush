import { Cwidth, Cheight, State } from "../core/config.js";
import { Color, Mix } from "../core/color.js";
import {
  rr,
  map,
  dist,
  randInt,
  calcAngle,
  toDegrees,
  gaussian,
  noise,
} from "../core/utils.js";
import { Position, Matrix, isFieldReady } from "../core/flowfield.js";
import { Polygon } from "../core/polygon.js";
import { Plot } from "../core/plot.js";
import { isReady, glDraw, circle, square } from "./gl_draw.js";

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

// =============================================================================
// Global Brush State, getter and setter
// =============================================================================

State.stroke = {
  color: new Color("black"),
  weight: 1,
  clipWindow: null,
  type: "HB",
  isActive: false,
};

let list = new Map();

export function BrushState() {
  return { ...State.stroke };
}

export function BrushSetState(state) {
  State.stroke = { ...state };
}

// =============================================================================
// Section: Brush Manager
// =============================================================================

/**
 * Adds a new brush with the specified parameters to the brush list.
 * @param {string} name - The unique name for the new brush.
 * @param {BrushParameters} params - The parameters defining the brush behavior and appearance.
 */
export function add(name, params) {
  const validTypes = ["marker", "custom", "image", "spray"];
  params.type = validTypes.includes(params.type) ? params.type : "default";
  list.set(name, { param: params, colors: [], buffers: [] });
}

/**
 * Retrieves a list of all available brush names from the brush manager.
 * @returns {Array<string>} An array containing the names of all brushes.
 */
export function box() {
  return [...list.keys()];
}

/**
 * Adjusts the global scale of standard brushes based on the provided scale factor.
 * This affects the weight, vibration, and spacing of each standard brush.
 *
 * @param {number} _scale - The scaling factor to apply to the brush parameters.
 */
export function scaleBrushes(scaleFactor) {
  for (const { param } of list.values()) {
    if (param) {
      param.weight *= scaleFactor;
      param.vibration *= scaleFactor;
      param.spacing *= scaleFactor;
    }
  }
}

/**
 * Sets only the current brush type based on the given name.
 * @param {string} brushName - The name of the brush to set as current.
 */
export function pick(brushName) {
  if (list.has(brushName)) State.stroke.type = brushName;
}

/**
 * Sets the color of the current brush.
 * @param {number|string|Color} r - The red component of the color, a CSS color string, or a Color object.
 * @param {number} [g] - The green component of the color.
 * @param {number} [b] - The blue component of the color.
 */
export function strokeStyle(r, g, b) {
  State.stroke.color = new Color(...arguments);
  State.stroke.isActive = true;
}

/**
 * Sets the weight (size) of the current brush.
 * @param {number} weight - The weight to set for the brush.
 */
export function lineWidth(weight) {
  State.stroke.weight = weight;
}

/**
 * Sets the current brush with the specified name, color, and weight.
 * @param {string} brushName - The name of the brush to set as current.
 * @param {string|Color} color - The color to set for the brush.
 * @param {number} weight - The weight (size) to set for the brush.
 */
export function set(brushName, color, weight = 1) {
  pick(brushName);
  strokeStyle(color);
  lineWidth(weight);
}

/**
 * Disables the stroke for subsequent drawing operations.
 * This function sets the brush's `isActive` property to false, indicating that no stroke
 * should be applied to the shapes drawn after this method is called.
 */
export function noStroke() {
  State.stroke.isActive = false;
}

/**
 * Defines a clipping region for the brush strokes.
 * @param {number[]} clippingRegion - An array defining the clipping region as [x1, y1, x2, y2].
 */
export function clip(region) {
  State.stroke.clipWindow = region;
}

/**
 * Disables clipping region.
 */
export function noClip() {
  State.stroke.clipWindow = null;
}

/**
 * Calculates the tip spacing based on the current brush parameters.
 * @returns {number} The calculated spacing value.
 */
function spacing() {
  const { param } = list.get(State.stroke.type) ?? {};
  if (!param) return 1;
  return param.type === "default" || param.type === "spray"
    ? param.spacing / State.stroke.weight
    : param.spacing;
}

// Variables for drawing state
let _position;
let _length;
let _flow;
let _plot;
let _dir;
let _alpha;

/**
 * Initializes the drawing state with the given parameters.
 * @param {number} x - The x-coordinate of the starting point.
 * @param {number} y - The y-coordinate of the starting point.
 * @param {number} length - The length of the line to draw.
 * @param {boolean} flow - Flag indicating if the line should follow the vector-field.
 * @param {Object|boolean} plot - The shape object to be used for plotting, or false if not plotting a shape.
 */
function initializeDrawingState(x, y, length, flow, plot) {
  _position = new Position(x, y);
  _length = length;
  _flow = flow;
  _plot = plot;
  if (_plot) _plot.calcIndex(0);
}

/**
 * Executes the drawing operation for lines or shapes.
 * @param {number} angle_scale - The angle or scale to apply during drawing.
 * @param {boolean} isPlot - Flag indicating if the operation is plotting a shape.
 */
function draw(angleScale, isPlot) {
  if (!isPlot) _dir = angleScale;
  saveState();

  const stepSize = spacing();
  const totalSteps = Math.round(
    (_length * (isPlot ? angleScale : 1)) / stepSize
  );
  for (let i = 0; i < totalSteps; i++) {
    tip();
    isPlot
      ? _position.plotTo(
          _plot,
          stepSize,
          stepSize,
          angleScale,
          i < 10 ? true : false
        )
      : _position.moveTo(stepSize, angleScale, stepSize, _flow);
  }
  restoreState();
}

const current = {};

/**
 * Sets up the environment for a brush stroke.
 */
function saveState() {
  current.seed = rr() * 99999;
  const { param } = list.get(State.stroke.type) ?? {};
  if (!param) return;
  current.p = param;

  // Pressure values for the stroke
  const { pressure } = param;
  current.a = pressure.type !== "custom" ? rr(-1, 1) : 0;
  current.b = pressure.type !== "custom" ? rr(1, 1.5) : 0;
  current.cp = pressure.type !== "custom" ? rr(3, 3.5) : rr(-0.2, 0.2);
  [current.min, current.max] = pressure.min_max;

  // GL Ready?
  isReady();

  // Blend stuff
  Mix.blend(State.stroke.color);
  Mix.isBrush = true;

  // Set state
  current.alpha = calculateAlpha(); // Calculate Alpha
  markerTip();
}

/**
 * Restores the drawing state after a brush stroke is completed.
 */
function restoreState() {
  glDraw(State.stroke.color);
  markerTip();
}

/**
 * Draws the tip of the brush based on the current pressure and position.
 * @param {number} pressure - The desired pressure value.
 */
function tip(customPressure = false) {
  if (!isInsideClippingArea()) return; // Check if it's inside clipping area
  let pressure = customPressure || calculatePressure(); // Calculate Pressure
  pressure *=
    1 -
    0.3 *
      noise(
        _position.x * 0.007 + current.seed,
        _position.y * 0.007 + current.seed
      ) -
    0.1 * noise(_position.x * 0.002, _position.y * 0.002);

  // Draw different tip types
  switch (current.p.type) {
    case "spray":
      drawSpray(pressure);
      break;
    case "marker":
      drawMarker(pressure);
      break;
    case "custom":
    case "image":
      drawCustomOrImage(pressure, _alpha);
      break;
    default:
      drawDefault(pressure);
      break;
  }
}

/**
 * Calculates the pressure for the current position in the stroke.
 * @returns {number} The calculated pressure value.
 */
function calculatePressure() {
  return _plot
    ? simPressure() * _plot.pressure(_position.plotted)
    : simPressure();
}

/**
 * Simulates brush pressure based on the current position and brush parameters.
 * @returns {number} The simulated pressure value.
 */
function simPressure() {
  return current.p.pressure.type === "custom"
    ? map(
        current.p.pressure.curve(_position.plotted / _length) + current.cp,
        0,
        1,
        current.min,
        current.max,
        true
      )
    : gauss();
}

/**
 * Generates a Gaussian distribution value for the pressure calculation.
 * @param {number} a - Center of the Gaussian bell curve.
 * @param {number} b - Width of the Gaussian bell curve.
 * @param {number} c - Shape of the Gaussian bell curve.
 * @param {number} min - Minimum pressure value.
 * @param {number} max - Maximum pressure value.
 * @returns {number} The calculated Gaussian value.
 */
function gauss(
  a = 0.5 + current.p.pressure.curve[0] * current.a,
  b = 1 - current.p.pressure.curve[1] * current.b,
  c = current.cp,
  min = current.min,
  max = current.max
) {
  return map(
    1 /
      (1 +
        Math.pow(
          Math.abs((_position.plotted - a * _length) / ((b * _length) / 2)),
          2 * c
        )),
    0,
    1,
    min,
    max
  );
}

/**
 * Calculates the alpha (opacity) level for the brush stroke based on pressure.
 * @param {number} pressure - The current pressure value.
 * @returns {number} The calculated alpha value.
 */
function calculateAlpha() {
  return ["default", "spray"].includes(current.p.type)
    ? current.p.opacity
    : current.p.opacity / State.stroke.weight;
}

/**
 * Applies the current color and alpha to the renderer.
 * @param {number} alpha - The alpha (opacity) level to apply.
 */
function applyColor(alpha) {
  current.alpha = alpha;
}

/**
 * Checks if the current brush position is inside the defined clipping area.
 * @returns {boolean} True if the position is inside the clipping area, false otherwise.
 */
function isInsideClippingArea() {
  if (State.stroke.clipWindow)
    return (
      _position.x >= State.stroke.clipWindow[0] &&
      _position.x <= State.stroke.clipWindow[2] &&
      _position.y >= State.stroke.clipWindow[1] &&
      _position.y <= State.stroke.clipWindow[3]
    );
  else {
    let w = Cwidth,
      h = Cheight,
      o = Cwidth * 0.05;
    let x = _position.x + Matrix.x;
    let y = _position.y + Matrix.y;
    return x >= -o && x <= w + o && y >= -o && y <= h + o;
  }
}

/**
 * Draws the spray tip of the brush.
 * @param {number} pressure - The current pressure value.
 */
function drawSpray(pressure) {
  const vibration =
    State.stroke.weight * current.p.vibration * pressure +
    (State.stroke.weight * gaussian() * current.p.vibration) / 3;
  const sw = State.stroke.weight * rr(0.9, 1.1);
  const iterations = Math.ceil(current.p.quality / pressure);
  for (let j = 0; j < iterations; j++) {
    const r = rr(0.9, 1.1);
    const rX = r * vibration * rr(-1, 1);
    const yRandomFactor = rr(-1, 1);
    const sqrtPart = Math.sqrt((r * vibration) ** 2 - rX ** 2);
    square(
      _position.x + rX,
      _position.y + yRandomFactor * sqrtPart,
      sw,
      current.alpha
    );
  }
}

/**
 * Draws the marker tip of the brush.
 * @param {number} pressure - The current pressure value.
 * @param {boolean} [vibrate=true] - Whether to apply vibration effect.
 */
function drawMarker(pressure, vibrate = true, alpha = current.alpha) {
  const vibration = vibrate ? State.stroke.weight * current.p.vibration : 0;
  const rx = vibrate ? vibration * rr(-1, 1) : 0;
  const ry = vibrate ? vibration * rr(-1, 1) : 0;
  circle(
    _position.x + rx,
    _position.y + ry,
    State.stroke.weight * current.p.weight * pressure,
    alpha
  );
}

/**
 * Draws the custom or image tip of the brush.
 * @param {number} pressure - The current pressure value.
 * @param {number} alpha - The alpha (opacity) level to apply.
 * @param {boolean} [vibrate=true] - Whether to apply vibration effect.
 */
function drawCustomOrImage(pressure, alpha, vibrate = true) {
  Mix.ctx.save();

  const vibration = vibrate ? State.stroke.weight * current.p.vibration : 0;
  const rx = vibrate ? vibration * rr(-1, 1) : 0;
  const ry = vibrate ? vibration * rr(-1, 1) : 0;

  Mix.ctx.translate(_position.x + rx, _position.y + ry);
  adjustSizeAndRotation(State.stroke.weight * pressure, alpha);

  current.p.tip(Mix.ctx);
  Mix.ctx.restore();
}

/**
 * Draws the default tip of the brush.
 * @param {number} pressure - The current pressure value.
 */
function drawDefault(pressure) {
  const vibration =
    State.stroke.weight *
    current.p.vibration *
    (current.p.definition +
      ((1 - current.p.definition) * gaussian() * gauss(0.5, 0.9, 5, 0.2, 1.2)) /
        pressure);
  if (rr(0, current.p.quality * pressure) > 0.4) {
    square(
      _position.x + 0.7 * vibration * rr(-1, 1),
      _position.y + vibration * rr(-1, 1),
      pressure * current.p.weight * rr(0.85, 1.15),
      current.alpha
    );
  }
}

/**
 * Adjusts the size and rotation of the brush tip before drawing.
 * @param {number} pressure - The current pressure value.
 * @param {number} alpha - The alpha (opacity) level to apply.
 */
function adjustSizeAndRotation(pressure, alpha) {
  Mix.ctx.scale(pressure, pressure);
  let angle = 0;
  if (current.p.rotate === "random") angle = randInt(0, PI2);
  else if (current.p.rotate === "natural") {
    angle =
      (_plot ? -_plot.angle(_position.plotted) : -_dir) +
      (_flow ? _position.angle() : 0);
    angle = (angle * Math.PI) / 180;
  }
  Mix.ctx.rotate(angle);
}

/**
 * Draws the marker tip with a blend effect.
 */
function markerTip() {
  if (isInsideClippingArea()) {
    let pressure = calculatePressure();
    let alpha = calculateAlpha(pressure);
    if (current.p.type === "marker") {
      for (let s = 1; s < 10; s++) {
        drawMarker((pressure * s) / 10, false, alpha * 5);
      }
      glDraw(State.stroke.color);
    } else if (current.p.type === "custom" || current.p.type === "image") {
      for (let s = 1; s < 5; s++) {
        Mix.ctx.beginPath();
        current.drawCustomOrImage((pressure * s) / 5, alpha, false);
        Mix.ctx.fill();
      }
    }
  }
}

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
  isFieldReady();
  let d = dist(x1, y1, x2, y2);
  if (d == 0) return;
  initializeDrawingState(x1, y1, d, true, false);
  let angle = calcAngle(x1, y1, x2, y2);
  draw(angle, false);
}

/**
 * Draws a stroke with the current brush from a starting point in a specified direction.
 * @param {number} x - The x-coordinate of the starting point.
 * @param {number} y - The y-coordinate of the starting point.
 * @param {number} length - The length of the line to draw.
 * @param {number} dir - The direction in which to draw the line. Angles measured anticlockwise from the x-axis
 */
export function stroke(x, y, length, dir) {
  isFieldReady();
  initializeDrawingState(x, y, length, true, false);
  draw(toDegrees(dir), false);
}

/**
 * Draws a predefined plot.
 * @param {Object} p - An object representing the shape to draw.
 * @param {number} x - The x-coordinate of the starting position to draw the shape.
 * @param {number} y - The y-coordinate of the starting position to draw the shape.
 * @param {number} scale - The scale at which to draw the shape.
 */
function plot(p, x, y, scale) {
  isFieldReady();
  initializeDrawingState(x, y, p.length, true, p);
  draw(scale, true);
}

export function setDensity(d) {
  scaleBrushes(d);
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
    [0.2, 0.4, 0.3, 2, 60, 0.2, { curve: [0.15, 0.2], min_max: [1.2, 0.9] }],
  ],
  [
    "cpencil",
    [0.4, 0.55, 0.8, 7, 70, 0.15, { curve: [0.15, 0.2], min_max: [0.95, 1.2] }],
  ],
  [
    "charcoal",
    [
      0.35,
      1.5,
      0.65,
      300,
      60,
      0.06,
      { curve: [0.15, 0.2], min_max: [1.3, 0.9] },
    ],
  ],
  [
    "crayon",
    [0.25, 2, 0.8, 300, 60, 0.06, { curve: [0.35, 0.2], min_max: [0.9, 1.1] }],
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
      0.4,
      0.04,
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
// Add method to Polygon Class and Plot Class
// =============================================================================
/**
 * Draws the polygon by iterating over its sides and drawing lines between the vertices.
 */
Polygon.prototype.draw = function (_brush = false, _color, _weight) {
  let state = BrushState();
  if (_brush) set(_brush, _color, _weight);
  if (state.isActive) {
    for (let s of this.sides) {
      line(s[0].x, s[0].y, s[1].x, s[1].y);
    }
  }
  BrushSetState(state);
};

/**
 * Draws the plot on the canvas.
 * @param {number} x - The x-coordinate to draw at.
 * @param {number} y - The y-coordinate to draw at.
 * @param {number} scale - The scale to draw with.
 */
Plot.prototype.draw = function (x, y, scale) {
  if (BrushState().isActive) {
    if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
    plot(this, x, y, scale);
  }
};
