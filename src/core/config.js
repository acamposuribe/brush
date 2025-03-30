// =============================================================================
// Section: Configure and Initiate
// =============================================================================
/**
 * This module handles the configuration and initialization of the drawing system.
 * It manages canvas properties, ensures the system is ready for rendering, and
 * provides utilities for saving and restoring states.
 */

export const Canvases = {}; // Stores canvas instances by ID
export let cID, Cwidth, Cheight, Density; // Global canvas properties

/**
 * Flag to indicate if the system is ready for rendering.
 * @type {boolean}
 */
let _isReady = false;

/**
 * Loads and initializes a canvas for the drawing system.
 * @param {string} canvasID - Unique identifier for the canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element to initialize.
 */
export function load(canvasID, canvas) {
  cID = canvasID;

  // Initialize the canvas if it hasn't been registered yet
  if (!Canvases[cID]) {
    Canvases[cID] = { canvas };
  }

  // Set canvas dimensions
  Cwidth = Canvases[cID].canvas.width;
  Cheight = Canvases[cID].canvas.height;

  // Mark the system as ready
  if (!_isReady) _isReady = true;
}

/**
 * Ensures the drawing system is ready before any operation.
 * Automatically loads the system if it hasn't been initialized.
 */
export function isCanvasReady() {
  if (!_isReady) {
    throw new Error("Canvas system is not ready. Call `load()` first.");
  }
}

// =============================================================================
// SAVE / RESTORE
// =============================================================================

/**
 * Stores the current state of the drawing system.
 * Can be used to save and restore configurations or canvas states.
 */
export const State = {};
