import { _ensureReady, State } from "./config.js";
import { intersectLines } from "./utils.js";
import { Mix, Color, drawPolygon } from "./color.js";
import { E } from "./erase.js";

// =============================================================================
// Section: Polygon Class
// =============================================================================
/**
 * This section includes the Polygon class for managing polygons and functions for drawing basic geometries
 * like rectangles and circles. It provides methods for creating, intersecting, drawing, and filling polygons,
 * as well as hatching them with a given distance and angle.
 * It also defines the functionality for creating and managing plots, which are used to draw complex shapes,
 * strokes, and splines on a canvas.
 */

/**
 * Represents a polygon with a set of vertices.
 */
export class Polygon {
  /**
   * Constructs the Polygon object from an array of points.
   *
   * @param {Array} pointsArray - An array of points, where each point is an array of two numbers [x, y].
   */
  constructor(array, bool = false) {
    this.a = array;
    this.vertices = array.map((a) => ({ x: a[0], y: a[1] }));
    if (bool) this.vertices = array;
    this.sides = this.vertices.map((v, i, arr) => [
      v,
      arr[(i + 1) % arr.length],
    ]);
  }
  /**
   * Intersects a given line with the polygon, returning all intersection points.
   *
   * @param {Object} line - The line to intersect with the polygon, having two properties 'point1' and 'point2'.
   * @returns {Array} An array of intersection points (each with 'x' and 'y' properties) or an empty array if no intersections.
   */
  intersect(line) {
    // Check if the result has been cached
        let cacheKey = `${line.point1.x},${line.point1.y}-${line.point2.x},${line.point2.y}`;
        if (this._intersectionCache && this._intersectionCache[cacheKey]) {
          return this._intersectionCache[cacheKey];
        }
        let points = [];
        for (let s of this.sides) {
          let intersection = intersectLines(line.point1, line.point2, s[0], s[1]);
          if (intersection !== false) {
            points.push(intersection);
          }
        }
        // Cache the result
        if (!this._intersectionCache) this._intersectionCache = {};
        this._intersectionCache[cacheKey] = points;
    
        return points;
  }
  erase(c = false, a = E.a) {
    if (E.isActive || c) {
      c = c ? new Color(c) : E.c;
      Mix.blend(c);
      Mix.isErase = true;
      Mix.ctx.save();
      Mix.ctx.fillStyle = "rgb(255 0 0 / " + a + "%)";
      drawPolygon(this.vertices);
      Mix.ctx.fill();
      Mix.ctx.restore();
    }
  }
  show() {
    if (State.draw) this.draw();
    if (State.hatch) this.hatch();
    if (State.fill) this.fill();
    this.erase();
  }
}
