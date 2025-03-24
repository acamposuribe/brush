import { State } from "./config.js";
import { Mix, isMixReady } from "./color.js";
import { Matrix } from "./flowfield.js";

// =============================================================================
// SAVE / RESTORE
// =============================================================================

/**
 * Object that saves the current brush state for push and pop operations
 */
let _saveState = {};
/**
 * Saves current state to object
 */
export function save() {
  isMixReady();
  Mix.ctx.save();
  _saveState.fill = { ...State.fill }
  _saveState.stroke = { ...State.stroke }
  _saveState.hatch = { ...State.hatch }
  _saveState.field = { ...State.field }
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
}