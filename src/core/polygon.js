import { _ensureReady } from "./config.js";
import { intersectLines } from "./utils.js";
import { Mix, Color } from "./color.js";
import { BrushState, set, line, BrushSetState } from "./brush.js";
import { FillState, FillSetState, E, createFill } from "./fill.js";
import { HatchState, createHatch, hatch, HatchSetState } from "./hatch.js";

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
  /**
   * Draws the polygon by iterating over its sides and drawing lines between the vertices.
   */
  draw(_brush = false, _color, _weight) {
    let state = BrushState();
    if (_brush) set(_brush, _color, _weight);
    if (state.isActive) {
      _ensureReady();
      for (let s of this.sides) {
        line(s[0].x, s[0].y, s[1].x, s[1].y);
      }
    }
    BrushSetState(state);
  }
  /**
   * Fills the polygon using the current fill state.
   */
  fill(_color = false, _opacity, _bleed, _texture, _border, _direction) {
    let state = FillState();
    if (_color) {
      fillStyle(_color, _opacity);
      fillBleed(_bleed, _direction);
      fillTexture(_texture, _border);
    }
    if (state.isActive) {
      _ensureReady();
      createFill(this);
    }
    FillSetState(state);
  }
  /**
   * Creates hatch lines across the polygon based on a given distance and angle.
   */
  hatch(_dist = false, _angle, _options) {
    let state = HatchState();
    if (_dist) hatch(_dist, _angle, _options);
    if (state.isActive) {
      _ensureReady();
      createHatch(this);
    }
    HatchSetState(state);
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
    this.fill();
    this.hatch();
    this.draw();
    this.erase();
  }
}

export function drawPolygon(vertices) {
  Mix.ctx.beginPath();
  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    if (i == 0) Mix.ctx.moveTo(v.x, v.y);
    else Mix.ctx.lineTo(v.x, v.y);
  }
}
