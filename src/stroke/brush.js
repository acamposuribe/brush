// =============================================================================
// Module: Brush
// =============================================================================
/**
 * The Brush module provides a comprehensive set of functions and classes for
 * simulating various drawing tools ranging from pens, markers, pencils, to
 * custom image-based brushes. This module controls brush properties such as
 * weight, color, vibration, and spacing, and manages the drawing process through
 * stateful methods that enable features like pressure sensitivity, clipping, and
 * blending. By supporting multiple brush types and dynamic parameter adjustments,
 * the Brush module facilitates the creation of realistic and expressive stroke effects.
 */

import { Color, Mix, Cwidth, Cheight, State } from "../core/color.js";
import {
  rr,
  map,
  dist,
  randInt,
  calcAngle,
  toDegrees,
  gaussian,
  noise,
  random
} from "../core/utils.js";
import { Position, Matrix, isFieldReady } from "../core/flowfield.js";
import { Polygon } from "../core/polygon.js";
import { Plot } from "../core/plot.js";
import { isReady, glDraw, circle, square } from "./gl_draw.js";

const PI2 = Math.PI * 2;

// ---------------------------------------------------------------------------
// Brush State and Helpers
// ---------------------------------------------------------------------------

/**
 * Global stroke state settings.
 */
State.stroke = {
  color: new Color("black"),
  weight: 1,
  clipWindow: null,
  type: "HB",
  isActive: false,
};

let list = new Map();

/**
 * Retrieves a shallow copy of the current stroke state.
 * @returns {object} The stroke state.
 */
export function BrushState() {
  return { ...State.stroke };
}

/**
 * Updates the stroke state.
 * @param {object} state - The new stroke state.
 */
export function BrushSetState(state) {
  State.stroke = { ...state };
}

// =============================================================================
// Section: Brush Manager
// =============================================================================

/**
 * Adds a new brush with the specified parameters to the brush list.
 * @param {string} name - The unique name for the new brush.
 * @param {object} params - The parameters defining the brush behavior and appearance.
 */
export function add(name, params) {
  const validTypes = ["marker", "custom", "image", "spray"];
  params.type = validTypes.includes(params.type) ? params.type : "default";
  list.set(name, { param: params, colors: [], buffers: [] });
}

/**
 * Retrieves the list of available brush names.
 * @returns {Array<string>} Array of brush names.
 */
export function box() {
  return [...list.keys()];
}

/**
 * Scales standard brush parameters by the provided factor.
 * @param {number} scaleFactor - The scaling factor to apply.
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
 * Sets the current brush type by name.
 * @param {string} brushName - The name of the brush.
 */
export function pick(brushName) {
  if (list.has(brushName)) State.stroke.type = brushName;
}

/**
 * Sets the stroke style (color) for the current brush.
 * @param {number|string|Color} r - Red component, CSS color string, or Color object.
 * @param {number} [g] - Green component.
 * @param {number} [b] - Blue component.
 */
export function strokeStyle(r, g, b) {
  State.stroke.color = new Color(...arguments);
  State.stroke.isActive = true;
}

/**
 * Sets the brush weight (thickness).
 * @param {number} weight - The weight value.
 */
export function lineWidth(weight) {
  State.stroke.weight = weight;
}

/**
 * Sets the current brush with name, color, and weight.
 * @param {string} brushName - The brush name.
 * @param {string|Color} color - The brush color.
 * @param {number} [weight=1] - The brush weight.
 */
export function set(brushName, color, weight = 1) {
  pick(brushName);
  strokeStyle(color);
  lineWidth(weight);
}

/**
 * Disables the stroke effect.
 */
export function noStroke() {
  State.stroke.isActive = false;
}

/**
 * Defines a clipping region for strokes.
 * @param {number[]} region - Array as [x1, y1, x2, y2] defining the clipping region.
 */
export function clip(region) {
  State.stroke.clipWindow = region;
}

/**
 * Disables the clipping region.
 */
export function noClip() {
  State.stroke.clipWindow = null;
}

/**
 * Sets the brush density by scaling standard brushes.
 * @param {number} d - Density factor.
 */
export function setDensity(d) {
  scaleBrushes(d);
}

// ---------------------------------------------------------------------------
// Drawing Variables and Functions
// ---------------------------------------------------------------------------
let _position, _length, _flow, _plot, _dir, _alpha;
const current = {};

/**
 * Initializes the drawing state.
 * @param {number} x - Starting x-coordinate.
 * @param {number} y - Starting y-coordinate.
 * @param {number} length - Length of stroke.
 * @param {boolean} flow - Flag for vector-field following.
 * @param {Object|boolean} plot - Plot object or false.
 */
function initializeDrawingState(x, y, length, flow, plot) {
  _position = new Position(x, y);
  _length = length;
  _flow = flow;
  _plot = plot;
  if (_plot) _plot.calcIndex(0);
}

const gaussians = [];

/**
 * Executes the drawing operation.
 * @param {number} angleScale - Angle (in degrees) or scaling factor.
 * @param {boolean} isPlot - True if plotting a shape.
 */
function draw(angleScale, isPlot) {
  if (!isPlot) _dir = angleScale;
  saveState();

  const stepSize = spacing();
  const totalSteps = Math.round(
    (_length * (isPlot ? angleScale : 1)) / stepSize
  );
  for (let i = 0; i < totalSteps; i++) {
    if (gaussians.length < totalSteps * 2) { gaussians.push(gaussian()); }
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

/**
 * Prepares the environment for a brush stroke.
 */
function saveState() {
  current.seed = rr() * 99999;
  const { param } = list.get(State.stroke.type) ?? {};
  if (!param) return;
  current.p = param;

  // Set pressure values for the stroke
  const { pressure } = param;
  current.a = pressure.type !== "custom" ? rr(-1, 1) : 0;
  current.b = pressure.type !== "custom" ? rr(1, 1.5) : 0;
  current.cp = pressure.type !== "custom" ? rr(3, 3.5) : rr(-0.2, 0.2);
  [current.min, current.max] = pressure.min_max;

  // Ensure GL is ready and blend state
  isReady();
  Mix.blend(State.stroke.color);
  Mix.isBrush = true;

  // Set additional state values
  current.alpha = calculateAlpha(); // Calculate Alpha
  markerTip();
}

/**
 * Restores drawing state after completing a stroke.
 */
function restoreState() {
  glDraw(State.stroke.color);
  markerTip();
}

/**
 * Renders the brush tip based on current pressure and position.
 * @param {number} [customPressure=false] - Optional custom pressure.
 */
function tip(customPressure = false) {
  if (!isInsideClippingArea()) return;
  let pressure = customPressure || calculatePressure();
  pressure *=
    1 -
    0.2 *
      noise(_position.plotted * 0.01 + current.seed, 1) -
    0.2 * noise(_position.x * 0.003, _position.y * 0.003);

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
 * Calculates the effective brush pressure.
 * @returns {number} The calculated pressure.
 */
function calculatePressure() {
  return _plot
    ? simPressure() * _plot.pressure(_position.plotted)
    : simPressure();
}

/**
 * Simulates brush pressure based on stroke parameters.
 * @returns {number} Simulated pressure value.
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
 * Generates a Gaussian-based pressure value.
 * @param {number} [a] - Center parameter.
 * @param {number} [b] - Width parameter.
 * @param {number} [c] - Shape parameter.
 * @param {number} [min] - Minimum pressure.
 * @param {number} [max] - Maximum pressure.
 * @returns {number} Gaussian pressure value.
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
 * Calculates the alpha (opacity) level for a brush stroke.
 * @returns {number} The calculated opacity.
 */
function calculateAlpha() {
  return ["default", "spray"].includes(current.p.type)
    ? current.p.opacity
    : current.p.opacity / State.stroke.weight;
}

/**
 * Checks if the current drawing position is within the clipping region.
 * @returns {boolean} True if inside clipping area; false otherwise.
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
 * Calculates the step spacing based on the current brush parameters.
 * @returns {number} The spacing value.
 */
function spacing() {
  const { param } = list.get(State.stroke.type) ?? {};
  if (!param) return 1;
  return param.type === "default" || param.type === "spray"
    ? param.spacing / State.stroke.weight
    : param.spacing;
}

// ---------------------------------------------------------------------------
// Brush Tip Rendering Methods
// ---------------------------------------------------------------------------

/**
 * Draws the spray tip effect.
 * @param {number} pressure - Current pressure.
 */
function drawSpray(pressure) {
  const vibration =
    State.stroke.weight * current.p.vibration * pressure +
    (State.stroke.weight * random(gaussians) * current.p.vibration) / 3;
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
 * Draws the marker tip effect.
 * @param {number} pressure - Current pressure.
 * @param {boolean} [vibrate=true] - Whether to apply vibration.
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
 * Draws a custom or image-based brush tip.
 * @param {number} pressure - Current pressure.
 * @param {number} alpha - Alpha (opacity) for drawing.
 * @param {boolean} [vibrate=true] - Whether to apply vibration.
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
 * Draws the default brush tip.
 * @param {number} pressure - Current pressure.
 */
function drawDefault(pressure) {
  const vibration =
    State.stroke.weight *
    current.p.vibration *
    (current.p.definition +
      ((1 - current.p.definition) * random(gaussians) * gauss(0.5, 0.9, 5, 0.2, 1.2)) /
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
 * Adjusts the size and rotation of the brush tip before rendering.
 * @param {number} pressure - Pressure-based scaling factor.
 * @param {number} alpha - Opacity value.
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

// ---------------------------------------------------------------------------
// Basic Drawing Operations
// ---------------------------------------------------------------------------

/**
 * Draws a line using the current brush.
 * @param {number} x1 - Start x-coordinate.
 * @param {number} y1 - Start y-coordinate.
 * @param {number} x2 - End x-coordinate.
 * @param {number} y2 - End y-coordinate.
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
 * Draws a stroke from a starting point in a given direction.
 * @param {number} x - Starting x-coordinate.
 * @param {number} y - Starting y-coordinate.
 * @param {number} length - Length of the stroke.
 * @param {number} dir - Direction (in radians, anticlockwise from the x-axis).
 */
export function stroke(x, y, length, dir) {
  isFieldReady();
  initializeDrawingState(x, y, length, true, false);
  draw(toDegrees(dir), false);
}

/**
 * Draws a predefined plot.
 * @param {object} p - Shape object representing the plot.
 * @param {number} x - Starting x-coordinate.
 * @param {number} y - Starting y-coordinate.
 * @param {number} scale - Scale factor.
 */
function plot(p, x, y, scale) {
  isFieldReady();
  initializeDrawingState(x, y, p.length, true, p);
  draw(scale, true);
}

// ---------------------------------------------------------------------------
// Standard Brushes Definition and Initialization
// ---------------------------------------------------------------------------

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

for (let s of _standard_brushes) {
  let obj = {};
  for (let i = 0; i < s[1].length; i++) obj[_vals[i]] = s[1][i];
  add(s[0], obj);
}

// ---------------------------------------------------------------------------
// Extensions to Polygon and Plot Prototypes
// ---------------------------------------------------------------------------

/**
 * Draws the polygon using the current brush.
 * @param {boolean} [_brush=false] - Optional brush name override.
 * @param {string|Color} [_color] - Optional color override.
 * @param {number} [_weight] - Optional weight override.
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
 * Draws the plot using the current brush.
 * @param {number} x - Starting x-coordinate.
 * @param {number} y - Starting y-coordinate.
 * @param {number} scale - Scale factor.
 */
Plot.prototype.draw = function (x, y, scale) {
  if (BrushState().isActive) {
    if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
    plot(this, x, y, scale);
  }
};
