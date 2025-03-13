// =============================================================================
// Section: Hatching
// =============================================================================
/**
 * The Hatching section of the code is responsible for creating and drawing hatching patterns.
 * Hatching involves drawing closely spaced parallel lines.
 */

import { BrushState, BrushSetState, set, line } from "./brush.js";
import { toDegrees, map, cos, sin, rr } from "./utils.js";
import { Polygon } from "./polygon.js";

let isActive = false;
let hatchingParams = {
  dist: 5,
  angle: 45,
  options: {},
};
let hatchingBrush = false;

/**
 * Activates hatching for subsequent geometries, with the given params.
 * @param {number} dist - The distance between hatching lines.
 * @param {number} angle - The angle at which hatching lines are drawn.
 * @param {Object} options - An object containing optional parameters to affect the hatching style:
 *                           - rand: Introduces randomness to the line placement.
 *                           - continuous: Connects the end of a line with the start of the next.
 *                           - gradient: Changes the distance between lines to create a gradient effect.
 *                           Defaults to {rand: false, continuous: false, gradient: false}.
 */
export function hatch(
  dist = 5,
  angle = 45,
  options = { rand: false, continuous: false, gradient: false }
) {
  isActive = true;
  hatchingParams = { dist, angle, options };
}

/**
 * Sets the brush type, color, and weight for subsequent hatches.
 * If this function is not called, hatches will use the parameters from stroke operations.
 * @param {string} brushName - The name of the brush to set as current.
 * @param {string|Color} color - The color to set for the brush.
 * @param {number} weight - The weight (size) to set for the brush.
 */
export function hatchStyle(brush, color = "black", weight = 1) {
  hatchingBrush = { brush, color, weight };
}

/**
 * Disables hatching for subsequent shapes
 */
export function noHatch() {
  isActive = false;
  hatchingBrush = false;
}

/**
 * Object to hold the current hatch state and to perform hatch calculation
 */

export function HatchState() {
  return {
    isActive,
    hatchingParams: { ...hatchingParams },
    hatchingBrush: { ...hatchingBrush },
  };
}

export function HatchSetState(state) {
  isActive = state.isActive;
  hatchingParams = { ...state.hatchingParams };
  hatchingBrush = { ...state.hatchingBrush };
}

/**
 * Creates a hatching pattern across the given polygons.
 *
 * @param {Array|Object} polygons - A single polygon or an array of polygons to apply the hatching.
 */
export function createHatch(polygons) {
  let { dist, angle, options } = hatchingParams;

  // Save current stroke state
  let save = BrushState();

  // Change state if hatch has been set to different params than stroke
  if (hatchingBrush) set(...Object.values(hatchingBrush));

  // Transform to degrees and between 0-180
  angle = toDegrees(angle) % 180;

  // Find Bounding Box ---
  if (!Array.isArray(polygons)) polygons = [polygons];
  const overallBB = computeOverallBoundingBox(polygons);
  // Create a bounding polygon from the overall bounding box.
  let ventana = new Polygon([
    [overallBB.minX, overallBB.minY],
    [overallBB.maxX, overallBB.minY],
    [overallBB.maxX, overallBB.maxY],
    [overallBB.minX, overallBB.maxY],
  ]);

  // Set initial values for line generation
  let startY = angle <= 90 && angle >= 0 ? overallBB.minY : overallBB.maxY;
  let gradient = options.gradient
    ? map(options.gradient, 0, 1, 1, 1.1, true)
    : 1;
  let dots = [];
  let i = 0;
  let dist1 = dist;
  let linea = (i) => {
    return {
      point1: {
        x: overallBB.minX + dist1 * i * cos(-angle + 90),
        y: startY + dist1 * i * sin(-angle + 90),
      },
      point2: {
        x: overallBB.minX + dist1 * i * cos(-angle + 90) + cos(-angle),
        y: startY + dist1 * i * sin(-angle + 90) + sin(-angle),
      },
    };
  };

  // Generate lines and calculate intersections with polygons
  // Loop through the lines based on the distance and angle to calculate intersections with the polygons
  // The loop continues until a line does not intersect with the bounding window polygon
  // Each iteration accounts for the gradient effect by adjusting the distance between lines
  while (ventana.intersect(linea(i)).length > 0) {
    let tempArray = [];
    for (let p of polygons) {
      tempArray.push(p.intersect(linea(i)));
    }
    dots[i] = tempArray
      .flat()
      .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
    dist1 *= gradient;
    i++;
  }

  // Filter out empty arrays to avoid drawing unnecessary lines
  let gdots = [];
  for (let dd of dots) {
    if (typeof dd[0] !== "undefined") {
      gdots.push(dd);
    }
  }

  // Draw the hatching lines using the calculated intersections
  // If the 'rand' option is enabled, add randomness to the start and end points of the lines
  // If the 'continuous' option is set, connect the end of one line to the start of the next
  let r = options.rand ? options.rand : 0;
  for (let j = 0; j < gdots.length; j++) {
    let dd = gdots[j];
    let shouldDrawContinuousLine = j > 0 && options.continuous;
    for (let i = 0; i < dd.length - 1; i += 2) {
      if (r !== 0) {
        dd[i].x += r * dist * rr(-10, 10);
        dd[i].y += r * dist * rr(-10, 10);
        dd[i + 1].x += r * dist * rr(-10, 10);
        dd[i + 1].y += r * dist * rr(-10, 10);
      }
      line(dd[i].x, dd[i].y, dd[i + 1].x, dd[i + 1].y);
      if (shouldDrawContinuousLine) {
        line(gdots[j - 1][1].x, gdots[j - 1][1].y, dd[i].x, dd[i].y);
      }
    }
  }

  // Change state back to previous
  BrushSetState(save);
}

// Helper functions for bounding box calculation
function computeBoundingBoxForPolygon(polygon) {
  // If already computed, return the cached bounding box.
  if (polygon._boundingBox) return polygon._boundingBox;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i < polygon.a.length; i++) {
    const [x, y] = polygon.a[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  polygon._boundingBox = { minX, minY, maxX, maxY };
  return polygon._boundingBox;
}

function computeOverallBoundingBox(polygons) {
  let overall = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  for (let poly of polygons) {
    const bb = computeBoundingBoxForPolygon(poly);
    overall.minX = Math.min(overall.minX, bb.minX);
    overall.minY = Math.min(overall.minY, bb.minY);
    overall.maxX = Math.max(overall.maxX, bb.maxX);
    overall.maxY = Math.max(overall.maxY, bb.maxY);
  }
  return overall;
}
