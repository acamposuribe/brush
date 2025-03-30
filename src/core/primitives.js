import {
  rr,
  randInt,
  sin,
  cos,
  toDegrees,
  constrain,
  dist,
  calcAngle,
  intersectLines,
} from "./utils.js";
import { Polygon } from "./polygon.js";
import { Plot } from "./plot.js";

// =============================================================================
// Section: Primitives and Geommetry
// =============================================================================

/**
 * Creates a Polygon from a given array of points and performs drawing and filling operations.
 * @param {Array} pointsArray - An array of points where each point is an array of two numbers [x, y, pressure].
 */
export function polygon(pointsArray) {
  // Create a new Polygon instance
  const polygon = new Polygon(pointsArray);
  polygon.show();
}

/**
 * Draws a rectangle on the canvas and fills it with the current fill color.
 * @param {number} x - The x-coordinate of the rectangle.
 * @param {number} y - The y-coordinate of the rectangle.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {boolean} [mode="corner"] - If "center", the rectangle is drawn centered at (x, y).
 */
export function rect(x, y, w, h, mode = "corner") {
  if (mode === "center") {
    x -= w / 2;
    y -= h / 2;
  }
  beginPath(0);
  moveTo(x, y);
  lineTo(x + w, y);
  lineTo(x + w, y + h);
  lineTo(x, y + h);
  closePath();
  endPath();
}

/**
 * Draws a circle on the canvas.
 * @param {number} x - The x-coordinate of the center of the circle.
 * @param {number} y - The y-coordinate of the center of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {boolean} [r=false] - If true, applies a random factor to the radius for each segment.
 */
export function circle(x, y, radius, r = false) {
  const p = new Plot("curve");
  const arcLength = Math.PI * radius; // Cache arc length
  const angleOffset = rr(0, 360); // Random starting angle
  // Define a function to optionally add randomness to the segment length
  const randomFactor = r ? () => 1 + 0.2 * rr() : () => 1;

  // Add segments for the circle
  for (let i = 0; i < 4; i++) {
    const angle = -90 * i + angleOffset;
    p.addSegment(
      angle * randomFactor(),
      (arcLength / 2) * randomFactor(),
      1,
      true
    );
  }

  // Optionally add a random final angle for the last segment
  if (r) {
    const randomAngle = randInt(-5, 5);
    p.addSegment(
      angleOffset,
      Math.abs(randomAngle) * (Math.PI / 180) * radius,
      1,
      true
    );
    p.endPlot(randomAngle + angleOffset, 1, true);
  } else {
    p.endPlot(angleOffset, 1, true);
  }

  // Draw the circle
  const offsetX = x - radius * sin(angleOffset);
  const offsetY = y - radius * cos(-angleOffset);
  p.show(offsetX, offsetY, 1);
}

/**
 * Draws an arc on the canvas.
 * @param {number} x - The x-coordinate of the center of the arc.
 * @param {number} y - The y-coordinate of the center of the arc.
 * @param {number} radius - The radius of the arc.
 * @param {number} start - The starting angle of the arc in radians.
 * @param {number} end - The ending angle of the arc in radians.
 */
export function arc(x, y, radius, start, end) {
  const p = new Plot("curve");
  const startAngle = 270 - toDegrees(start);
  const endAngle = 270 - toDegrees(end);
  const arcAngle = toDegrees(end - start);
  const arcLength = (Math.PI * radius * arcAngle) / 180;

  p.addSegment(startAngle, arcLength, 1, true);
  p.endPlot(endAngle, 1, true);

  const startX = x + radius * cos(-startAngle - 90);
  const startY = y + radius * sin(-startAngle - 90);
  p.draw(startX, startY, 1);
}

let _pathArray;
let _current;
let _curvature;

class SubPath {
  constructor() {
    this.isClosed = false;
    this.curvature = _curvature;
    this.vert = [];
  }
  vertex(x, y, pressure) {
    this.vert.push([x, y, pressure]);
  }
  show() {
    let plot = _createSpline(this.vert, this.curvature, this.isClosed);
    plot.show();
  }
}

export function beginPath(curvature = 0) {
  _curvature = constrain(curvature, 0, 1);
  _pathArray = [];
}

export function moveTo(x, y, pressure = 1) {
  _current = new SubPath();
  _pathArray.push(_current);
  _current.vertex(x, y, pressure);
}

export function lineTo(x, y, pressure = 1) {
  _current.vertex(x, y, pressure);
}

export function closePath() {
  _current.vertex(..._current.vert[0]);
  _current.isClosed = true;
}

export function endPath() {
  for (let sub of _pathArray) {
    sub.show();
  }
  _pathArray = false;
}

let _strokeArray, _strokeOrigin;

/**
 * Begins a new stroke with a given type and starting position. This initializes
 * a new Plot to record the stroke's path.
 * @param {string} type - The type of the stroke, which defines the kind of Plot to create.
 * @param {number} x - The x-coordinate of the starting point of the stroke.
 * @param {number} y - The y-coordinate of the starting point of the stroke.
 */
export function beginStroke(type, x, y) {
  _strokeOrigin = [x, y]; // Store the starting position for later use
  _strokeArray = new Plot(type); // Initialize a new Plot with the specified type
}

/**
 * Adds a segment to the stroke with a given angle, length, and pressure. This function
 * is called between beginStroke and endStroke to define the stroke's path.
 * @param {number} angle - The initial angle of the segment, relative to the canvas.
 * @param {number} length - The length of the segment.
 * @param {number} pressure - The pressure at the start of the segment, affecting properties like width.
 */
export function move(angle, length, pressure) {
  _strokeArray.addSegment(angle, length, pressure); // Add the new segment to the Plot
}

/**
 * Completes the stroke path and triggers the rendering of the stroke.
 * @param {number} angle - The angle of the curve at the last point of the stroke path.
 * @param {number} pressure - The pressure at the end of the stroke.
 */
export function endStroke(angle, pressure) {
  _strokeArray.endPlot(angle, pressure); // Finalize the Plot with the end angle and pressure
  _strokeArray.draw(_strokeOrigin[0], _strokeOrigin[1], 1); // Draw the stroke using the stored starting position
  _strokeArray = false; // Clear the _strokeArray to indicate the end of this stroke
}

const PI2 = Math.PI * 2;

/**
 * Creates and draws a spline curve with the given points and curvature.
 * @param {Array<Array<number>>} array_points - An array of points defining the spline curve.
 * @param {number} [curvature=0.5] - The curvature of the spline curve, between 0 and 1.
 */
export function spline(_array_points, _curvature = 0.5) {
  let p = _createSpline(_array_points, _curvature); // Create a new Plot-spline instance
  p.draw(); // Draw the Plot
}

/**
 * Creates a new Plot object for a spline curve.
 * @param {Array<Array<number>>} array_points - An array of points defining the spline curve.
 * @param {number} [curvature=0.5] - The curvature of the spline curve, between 0 and 1.
 * @param {boolean} [_close=false] - Whether the spline should be closed.
 * @returns {Plot} - The created Plot object.
 */
function _createSpline(_array_points, _curvature = 0.5, _close = false) {
  const plotType = _curvature === 0 ? "segments" : "curve";
  const p = new Plot(plotType);

  if (_close && _curvature !== 0) {
    _array_points.push(_array_points[1]); // Close the spline by adding the first point to the end
  }

  if (_array_points && _array_points.length > 0) {
    let done = 0;
    let pep, tep, pep2;

    for (let i = 0; i < _array_points.length - 1; i++) {
      if (_curvature > 0 && i < _array_points.length - 2) {
        const p1 = _array_points[i];
        const p2 = _array_points[i + 1];
        const p3 = _array_points[i + 2];

        const d1 = dist(p1[0], p1[1], p2[0], p2[1]);
        const d2 = dist(p2[0], p2[1], p3[0], p3[1]);
        const a1 = calcAngle(p1[0], p1[1], p2[0], p2[1]);
        const a2 = calcAngle(p2[0], p2[1], p3[0], p3[1]);

        const dd = _curvature * Math.min(d1, d2, 0.5 * Math.min(d1, d2));
        const dmax = Math.max(d1, d2);
        const s1 = d1 - dd;
        const s2 = d2 - dd;

        if (Math.floor(a1) === Math.floor(a2)) {
          const temp = _close ? (i === 0 ? 0 : d1 - done) : d1 - done;
          const temp2 = _close ? (i === 0 ? 0 : d2 - pep2) : d2;

          p.addSegment(a1, temp, p1[2], true);
          if (i === _array_points.length - 3) {
            p.addSegment(a2, temp2, p2[2], true);
          }

          done = 0;
          if (i === 0) {
            pep = d1;
            pep2 = dd;
            tep = _array_points[1];
            done = 0;
          }
        } else {
          const point1 = {
            x: p2[0] - dd * cos(-a1),
            y: p2[1] - dd * sin(-a1),
          };
          const point2 = {
            x: point1.x + dmax * cos(-a1 + 90),
            y: point1.y + dmax * sin(-a1 + 90),
          };
          const point3 = {
            x: p2[0] + dd * cos(-a2),
            y: p2[1] + dd * sin(-a2),
          };
          const point4 = {
            x: point3.x + dmax * cos(-a2 + 90),
            y: point3.y + dmax * sin(-a2 + 90),
          };

          const int = intersectLines(point1, point2, point3, point4, true);
          const radius = dist(point1.x, point1.y, int.x, int.y);
          const disti = dist(point1.x, point1.y, point3.x, point3.y) / 2;
          const a3 = 2 * Math.asin(disti / radius) * (180 / Math.PI);
          const s3 = (PI2 * radius * a3) / 360;

          const temp = _close ? (i === 0 ? 0 : s1 - done) : s1 - done;
          const temp2 =
            i === _array_points.length - 3 ? (_close ? pep - dd : s2) : 0;

          p.addSegment(a1, temp, p1[2], true);
          p.addSegment(a1, isNaN(s3) ? 0 : s3, p1[2], true);
          p.addSegment(a2, temp2, p2[2], true);

          done = dd;
          if (i === 0) {
            pep = s1;
            pep2 = dd;
            tep = [point1.x, point1.y];
          }
        }

        if (i === _array_points.length - 3) {
          p.endPlot(a2, p2[2], true);
        }
      } else if (_curvature === 0) {
        const p1 = _array_points[i];
        const p2 = _array_points[i + 1];
        const d = dist(p1[0], p1[1], p2[0], p2[1]);
        const a = calcAngle(p1[0], p1[1], p2[0], p2[1]);

        p.addSegment(a, d, p2[2], true);
        if (i === _array_points.length - 2) {
          p.endPlot(a, 1, true);
        }
      }
    }

    p.origin = _close && _curvature !== 0 ? tep : _array_points[0];
  }

  return p;
}
