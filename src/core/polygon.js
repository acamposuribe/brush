import { State } from "./color.js";
import { intersectLines, Perf } from "./utils.js";
import { W, drawWash } from "./wash.js";

// =============================================================================
// Section: Polygon Class
// =============================================================================

/**
 * Represents a polygon with a set of vertices and provides methods for
 * intersection, drawing, filling, and hatching.
 */
export class Polygon {
  /**
   * Constructs the Polygon object from an array of points.
   * @param {Array} pointsArray - An array of points, where each point is an array of two numbers [x, y].
   * @param {boolean} [useRawVertices=false] - If true, uses the raw array as vertices.
   */
  constructor(pointsArray, useRawVertices = false) {
    this.a = pointsArray;
    this.vertices = useRawVertices
      ? pointsArray
      : pointsArray.map(([x, y]) => ({ x, y }));
    this.sides = this.vertices.map((v, i, arr) => [
      v,
      arr[(i + 1) % arr.length],
    ]);
    this._intersectionCache = new Map();
  }

  /**
   * Intersects a given line with the polygon, returning all intersection points.
   * @param {Object} line - The line to intersect with the polygon, having two properties 'point1' and 'point2'.
   * @returns {Array} An array of intersection points (each with 'x' and 'y' properties) or an empty array if no intersections.
   */
  intersect(line) {
    const cacheKey = `${line.point1.x},${line.point1.y}-${line.point2.x},${line.point2.y}`;
    const cached = this._intersectionCache.get(cacheKey);
    if (cached) return cached;
    const points = [];
    for (const [start, end] of this.sides) {
      const intersection = intersectLines(line.point1, line.point2, start, end);
      if (intersection) points.push(intersection);
    }
    this._intersectionCache.set(cacheKey, points);
    return points;
  }

  /**
   * Erases the polygon using the erase tool.
   */
  wash() {
    drawWash(this.vertices);
  }

  /**
   * Displays the polygon with optional stroke, hatch, and fill effects.
   */
  show() {
    if (W.isActive) {
      this.wash();
      return;
    }
    let _s;
    if (State.stroke) { _s = performance.now(); this.draw(); Perf.stroke += performance.now() - _s; }
    if (State.hatch) { _s = performance.now(); this.hatch(); Perf.hatch += performance.now() - _s; }
    if (State.fill) { _s = performance.now(); this.fill(); Perf.fill += performance.now() - _s; }
  }
}