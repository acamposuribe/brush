import { Mix } from "./color.js";
import { Matrix, FieldState, FieldSetState, createField } from "./flowfield.js";
import { BrushState, BrushSetState } from "./brush.js";
import { HatchState, HatchSetState } from "./hatch.js";
import { FillState, FillSetState } from "./fill.js";

// =============================================================================
// Section: Configure and Initiate
// =============================================================================
/**
 * This section contains functions for setting up the drawing system. It allows
 * for configuration with custom options, initialization of the system, preloading
 * necessary assets, and a check to ensure the system is ready before any drawing
 * operation is performed.
 */

export const Canvases = {};
export let cID, Cwidth, Cheight, Density;

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
    createField(); // Load flowfield system
  }
  Mix.load();
}

/**
 * Ensures that the drawing system is ready before any drawing operation.
 * Loads the system if it hasn't been loaded already.
 */
export function _ensureReady() {
  if (!_isReady) load();
}

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