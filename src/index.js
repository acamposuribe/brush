/**
 * @fileoverview brush.js - A comprehensive toolset for brush management in vanilla js.
 * @version 0.0.3-alpha
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
 * Copyright (c) 2025 Alejandro Campos Uribe
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

// Randomness and other auxiliary functions
export {
  random,
  weightedRand as wRand,
  noise,
  seed,
  noiseSeed,
} from "./core/utils.js";

// Color Blending
export { load, background, drawImage, Color } from "./core/color.js";

// Matrix transformations, FlowField and Position Class
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
} from "./core/flowfield.js";

// Save / Restore
export { save, restore } from "./core/save.js";

// Erase
export { erase, noErase } from "./core/erase.js";

// Polygon and Plot classes
export { Polygon } from "./core/polygon.js";
export { Plot } from "./core/plot.js";

// Primitives
export {
  rect,
  circle,
  arc,
  beginPath,
  moveTo,
  lineTo,
  closePath,
  endPath,
  beginStroke,
  move,
  endStroke,
  spline,
  polygon,
} from "./core/primitives.js";

// Drawing Loop
export {
  endFrame as draw,
  loop,
  frameRate,
  noLoop,
  frameCount,
} from "./core/loop.js";

// Brushes
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
} from "./stroke/stroke.js";

// Section: Hatching
export {
  hatch,
  hatchStyle,
  noHatch,
  createHatch as hatchArray,
} from "./hatch/hatch.js";

// Fill
export { fillStyle, noFill, fillTexture, fillBleed } from "./fill/fill.js";
