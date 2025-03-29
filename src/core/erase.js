import { Color } from "./color.js";

// =============================================================================
// Erase Functions
// =============================================================================

export const E = {};

export function erase(color = _bg_Color, alpha = 255) {
  E.isActive = true;
  E.c = new Color(color);
  E.a = alpha;
}
export function noErase() {
  E.isActive = false;
}
