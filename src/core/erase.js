import { Color } from "./color.js";
import { drawPolygon } from "./mask.js";

// =============================================================================
// Erase Functions
// =============================================================================
/**
 * This module provides functions to handle erasing operations. It uses the
 * blending system to erase parts of the canvas by applying a mask with a
 * specified color and transparency.
 */

export const E = {
  isActive: false, // Tracks if erasing is active
  c: null, // Current erase color
  a: 255, // Current erase alpha (transparency)
};

/**
 * Activates the erase mode with a specified color and alpha.
 * @param {string|Color} color - The erase color (default: background color).
 * @param {number} alpha - The transparency level (0-255, default: 255).
 */
export function erase(color = _bg_Color, alpha = 255) {
  E.isActive = true;
  E.c = new Color(color);
  E.a = alpha;
}

/**
 * Deactivates the erase mode.
 */
export function noErase() {
  E.isActive = false;
}

/**
 * Draws an erase operation using a polygon mask.
 * @param {Array<{x: number, y: number}>} vertices - The vertices of the polygon to erase.
 */
export function drawErase(vertices) {
  // Set the blending color and activate erase mode
  Mix.blend(E.c);
  Mix.isErase = true;
  // Save the current context state
  Mix.ctx.save();
  // Set the fill style with the erase alpha
  Mix.ctx.fillStyle = "rgb(255 0 0 / " + E.a + "%)";
  // Draw the polygon mask
  drawPolygon(vertices);
  // Fill the mask and restore the context state
  Mix.ctx.fill();
  Mix.ctx.restore();
}
