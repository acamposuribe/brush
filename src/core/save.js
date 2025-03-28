import { State } from "./config.js";
import { Mix } from "./color.js";
import { Matrix, BleedField, isFieldReady } from "./flowfield.js";

// =============================================================================
// SAVE / RESTORE
// =============================================================================

function sum(array) {
  let sum = 0

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      sum = sum + array[i][j]
    }
  }
  return sum
}



/**
 * Object that saves the current brush state for push and pop operations
 */
let _saveState = {};
/**
 * Saves current state to object
 */
export function save() {
  isFieldReady();
  Mix.ctx.save();
  _saveState.fill = { ...State.fill }
  _saveState.stroke = { ...State.stroke }
  _saveState.hatch = { ...State.hatch }
  _saveState.field = { ...State.field }
  BleedField.save()
}
/**
 * Restores previous state from object
 */
export function restore() {
  Mix.ctx.restore();
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;
  State.stroke = { ..._saveState.stroke }
  State.field = { ..._saveState.field }
  State.hatch = { ..._saveState.hatch }
  State.fill = { ..._saveState.fill }
  BleedField.restore()
}