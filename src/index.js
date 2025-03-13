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
export { load } from "./config.js";

// =============================================================================
// Randomness and other auxiliary functions
// =============================================================================
export {
  random,
  weightedRand as wRand,
  seed,
  noise,
  noiseSeed,
} from "./utils.js";

// =============================================================================
// Color Blending
// =============================================================================

import { Mix } from "./color.js";
export { background, drawImage, getCanvas } from "./color.js";

// =============================================================================
// Matrix transformations, FlowField and Position Class
// =============================================================================

import { Matrix, FieldState, FieldSetState } from "./flowfield.js";
export {
  field,
  noField,
  addField,
  refreshField,
  listFields,
  translate,
  rotate,
  scale,
  Position,
} from "./flowfield.js";

// =============================================================================
// Brushes
// =============================================================================

import { BrushState, BrushSetState } from "./brush.js";
export {
  add,
  box,
  scaleBrushes,
  pick,
  strokeStyle,
  lineWidth,
  set,
  noStroke,
  clip,
  noClip,
  line,
  stroke,
} from "./brush.js";

// =============================================================================
// Section: Hatching
// =============================================================================

import { HatchState, HatchSetState } from "./hatch.js";
export {
  hatch,
  hatchStyle,
  noHatch,
  createHatch as hatchArray,
} from "./hatch.js";

// =============================================================================
// Polygon and Plot classes
// =============================================================================

export { Polygon } from "./polygon.js";
export { Plot } from "./plot.js";

// =============================================================================
// Primitives
// =============================================================================

export {
  polygon,
  rect,
  circle,
  arc,
  beginPath,
  moveTo,
  lineTo,
  closePath,
  drawPath,
  beginStroke,
  move,
  endStroke,
  spline,
} from "./primitives.js";

// =============================================================================
// Fill
// =============================================================================

import { FillState, FillSetState } from "./fill.js";

// =============================================================================
// Drawing Loop
// =============================================================================

export { endFrame, loop, frameRate, noLoop, frameCount } from "./loop.js";

// =============================================================================
// SAVE / RESTORE
// =============================================================================
/**
 * Object that saves the current brush state for push and pop operations
 */
const _saveState = {};
/**
 * Saves current state to object
 */
export function save() {
  Mix.ctx.save();
  _saveState.field = FieldState();
  _saveState.stroke = BrushState();
  _saveState.hatch = HatchState();
  _saveState.fill = FillState();
}
/**
 * Restores previous state from object
 */
export function restore() {
  Mix.ctx.restore();
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;

  FieldSetState(_saveState.field);
  BrushSetState(_saveState.stroke);
  HatchSetState(_saveState.hatch);
  FillSetState(_saveState.fill);
}
