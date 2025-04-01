import { State } from "./config.js";
import { Mix } from "./color.js";
import { Matrix, BleedField, isFieldReady } from "./flowfield.js";

// =============================================================================
// SAVE / RESTORE
// =============================================================================

/**
 * Object that holds the saved brush state for push/pop operations.
 * @type {Object}
 */
let _saveState = {};

/**
 * Saves the current state from the State and BleedField objects.
 * It also saves the current canvas context state.
 */
export function save() {
  // Ensure the field is ready before saving
  isFieldReady();

  // Save the canvas context
  Mix.ctx.save();

  // Save a copy of the current state
  _saveState.fill = { ...State.fill };
  _saveState.stroke = { ...State.stroke };
  _saveState.hatch = { ...State.hatch };
  _saveState.field = { ...State.field };

  // Save additional field state
  BleedField.save();
}

/**
 * Restores the saved state from the _saveState object.
 * It also restores the canvas context state.
 */
export function restore() {
  // Restore the canvas context
  Mix.ctx.restore();

  // Update Matrix transform from the current context
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;

  // Restore State from saved copies
  State.stroke = { ..._saveState.stroke };
  State.field = { ..._saveState.field };
  State.hatch = { ..._saveState.hatch };
  State.fill = { ..._saveState.fill };

  // Restore additional field state
  BleedField.restore();
}
