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
  if (!_isReady) _isReady = true;
}

/**
 * Ensures that the drawing system is ready before any drawing operation.
 * Loads the system if it hasn't been loaded already.
 */
export function isCanvasReady() {
  if (!_isReady) load();
}

// =============================================================================
// SAVE / RESTORE
// =============================================================================

export const State = {};