import { Color, Mix, getBackgroundColor } from "./color.js";
import { drawPolygon } from "./mask.js";

// =============================================================================
// Wash Functions
// =============================================================================
/**
 * This module provides functions to handle wash operations. It uses the
 * blending system to paint a solid flat color over parts of the canvas
 * by applying a mask with a specified color and transparency.
 */

export const W = {
  isActive: false, // Tracks if wash is active
  c: null,         // Current wash color
  a: 1,            // Current wash alpha in the range [0, 1]
};

/**
 * Activates wash mode with a specified color and alpha.
 * @param {string|Color} color - The wash color (default: background color).
 * @param {number} alpha - The transparency level (0-100, default: 100).
 */
export function wash(color = getBackgroundColor(), alpha = 100) {
  W.isActive = true;
  W.c = new Color(color);
  W.a = Math.max(0, Math.min(alpha, 100)) / 100;
}

/**
 * Deactivates wash mode.
 */
export function noWash() {
  W.isActive = false;
}

/**
 * Draws a wash operation using a polygon mask.
 * @param {Array<{x: number, y: number}>} vertices - The vertices of the polygon to wash.
 */
export function drawWash(vertices) {
  Mix.blend(W.c);
  Mix.isErase = true;
  Mix.ctx.save();
  Mix.ctx.fillStyle = "rgb(255 0 0 / " + W.a + ")";
  drawPolygon(vertices);
  Mix.ctx.fill();
  Mix.ctx.restore();
}
