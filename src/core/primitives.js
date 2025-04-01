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
 * Creates a Polygon from an array of points and calls its show() method.
 * @param {Array<Array<number>>} pointsArray - Array of points [x, y, pressure]
 */
export function polygon(pointsArray) {
  // Create a new Polygon instance
  const polygon = new Polygon(pointsArray);
  polygon.show();
}

/**
 * Draws a rectangle on the canvas using path functions.
 * @param {number} x - X-coordinate.
 * @param {number} y - Y-coordinate.
 * @param {number} w - Width.
 * @param {number} h - Height.
 * @param {boolean} [mode="corner"] - "corner" (default) or "center".
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
 * @param {number} x - Center x.
 * @param {number} y - Center y.
 * @param {number} radius - Circle radius.
 * @param {boolean} [r=false] - Randomizes segment lengths if true.
 */
export function circle(x, y, radius, r = false) {
  const p = new Plot("curve");
  const arcLength = Math.PI * radius;
  const angleOffset = rr(0, 360);
  const randomFactor = r ? () => 1 + 0.2 * rr() : () => 1;

  // Divide circle into 4 segments
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
 * @param {number} x - Center x.
 * @param {number} y - Center y.
 * @param {number} radius - Radius.
 * @param {number} start - Radian start angle.
 * @param {number} end - Radian end angle.
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

// Variables for managing paths and strokes
let _pathArray;
let _current;
let _curvature;

class SubPath {
  constructor() {
    this.isClosed = false;
    this.curvature = _curvature;
    this.vert = [];
  }
  /**
   * Adds a vertex to this subpath.
   * @param {number} x
   * @param {number} y
   * @param {number} pressure
   */
  vertex(x, y, pressure) {
    this.vert.push([x, y, pressure]);
  }
  /**
   * Renders the subpath by creating a spline from its vertices.
   */
  show() {
    let plot = _createSpline(this.vert, this.curvature, this.isClosed);
    plot.show();
  }
}

/**
 * Begins a new path with a specified curvature.
 * @param {number} [curvature=0] - Curvature from 0 to 1.
 */
export function beginPath(curvature = 0) {
  _curvature = constrain(curvature, 0, 1);
  _pathArray = [];
}

/**
 * Moves to a new point in the current path.
 * @param {number} x - X-coordinate.
 * @param {number} y - Y-coordinate.
 * @param {number} [pressure=1] - Pressure value.
 */
export function moveTo(x, y, pressure = 1) {
  _current = new SubPath();
  _pathArray.push(_current);
  _current.vertex(x, y, pressure);
}

/**
 * Adds a line segment from the current point to the given coordinates.
 * @param {number} x - Destination x.
 * @param {number} y - Destination y.
 * @param {number} [pressure=1] - Pressure value.
 */
export function lineTo(x, y, pressure = 1) {
  _current.vertex(x, y, pressure);
}

/**
 * Closes the current path by connecting the last point to the first.
 */
export function closePath() {
  _current.vertex(..._current.vert[0]);
  _current.isClosed = true;
}

/**
 * Ends the current path and renders all subpaths.
 */
export function endPath() {
  for (let sub of _pathArray) {
    sub.show();
  }
  _pathArray = false;
}

let _strokeArray, _strokeOrigin;

/**
 * Begins a new stroke with a given type and starting position.
 * @param {string} type - Stroke type.
 * @param {number} x - Starting x.
 * @param {number} y - Starting y.
 */
export function beginStroke(type, x, y) {
  _strokeOrigin = [x, y]; // Store the starting position for later use
  _strokeArray = new Plot(type); // Initialize a new Plot with the specified type
}

/**
 * Adds a segment to the stroke.
 * @param {number} angle - Segment angle.
 * @param {number} length - Segment length.
 * @param {number} pressure - Segment pressure.
 */
export function move(angle, length, pressure) {
  _strokeArray.addSegment(angle, length, pressure); // Add the new segment to the Plot
}

/**
 * Completes and renders the stroke.
 * @param {number} angle - End angle.
 * @param {number} pressure - End pressure.
 */
export function endStroke(angle, pressure) {
  _strokeArray.endPlot(angle, pressure); // Finalize the Plot with the end angle and pressure
  _strokeArray.draw(_strokeOrigin[0], _strokeOrigin[1], 1); // Draw the stroke using the stored starting position
  _strokeArray = false; // Clear the _strokeArray to indicate the end of this stroke
}

/**
 * Creates and draws a spline curve from an array of points.
 * @param {Array<Array<number>>} array_points - Array of points [x, y, pressure].
 * @param {number} [curvature=0.5] - Curvature from 0 to 1.
 */
export function spline(_array_points, _curvature = 0.5) {
  let p = _createSpline(_array_points, _curvature); // Create a new Plot-spline instance
  p.draw(); // Draw the Plot
}

/**
 * Creates a new Plot object representing a spline curve.
 *
 * For curved segments (curvature > 0) with at least 3 points available,
 * the function either treats segments as straight (if their angles match)
 * or calculates control points to compute a circular arc.
 *
 * If no curvature is specified, a simple straight segment is used.
 *
 * @param {Array<Array<number>>} points - Array of points [x, y, pressure].
 * @param {number} [curvature=0.5] - Curvature value between 0 and 1.
 * @param {boolean} [close=false] - Whether to close the spline.
 * @returns {Plot} - The generated Plot object.
 */
function _createSpline(points, curvature = 0.5, close = false) {
  const plotType = curvature === 0 ? "segments" : "curve";
  const p = new Plot(plotType);
  const PI2 = Math.PI * 2;

  // If closing the spline, add the second point to the end
  if (close && curvature !== 0) {
    points.push(points[1]);
  }

  if (points && points.length > 0) {
    let done = 0; // Tracks excess length from previous segment
    let pep, tep, pep2; // Variables used for initial calibration

    for (let i = 0; i < points.length - 1; i++) {
      // For curved segments (if curvature > 0 and there is at least 3 points ahead)
      if (curvature > 0 && i < points.length - 2) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];

        const d1 = dist(p1[0], p1[1], p2[0], p2[1]);
        const d2 = dist(p2[0], p2[1], p3[0], p3[1]);
        const a1 = calcAngle(p1[0], p1[1], p2[0], p2[1]);
        const a2 = calcAngle(p2[0], p2[1], p3[0], p3[1]);

        // Compute the adjustment length based on curvature
        const curvAdjust = curvature * Math.min(d1, d2, 0.5 * Math.min(d1, d2));
        const dmax = Math.max(d1, d2);
        const s1 = d1 - curvAdjust;
        const s2 = d2 - curvAdjust;

        if (Math.floor(a1) === Math.floor(a2)) {
          // If angles are nearly the same, treat as a straight segment
          const temp = close ? (i === 0 ? 0 : d1 - done) : d1 - done;
          const temp2 = close ? (i === 0 ? 0 : d2 - pep2) : d2;

          p.addSegment(a1, temp, p1[2], true);
          if (i === points.length - 3) {
            p.addSegment(a2, temp2, p2[2], true);
          }

          done = 0;
          if (i === 0) {
            pep = d1;
            pep2 = curvAdjust;
            tep = points[1];
            done = 0;
          }
        } else {
          // For a curved segment, compute control points and arc segment details
          const point1 = {
            x: p2[0] - curvAdjust * cos(-a1),
            y: p2[1] - curvAdjust * sin(-a1),
          };
          const point2 = {
            x: point1.x + dmax * cos(-a1 + 90),
            y: point1.y + dmax * sin(-a1 + 90),
          };
          const point3 = {
            x: p2[0] + curvAdjust * cos(-a2),
            y: p2[1] + curvAdjust * sin(-a2),
          };
          const point4 = {
            x: point3.x + dmax * cos(-a2 + 90),
            y: point3.y + dmax * sin(-a2 + 90),
          };

          const intPt = intersectLines(point1, point2, point3, point4, true);
          const radius = dist(point1.x, point1.y, intPt.x, intPt.y);
          const halfDist = dist(point1.x, point1.y, point3.x, point3.y) / 2;
          const arcAngle = 2 * Math.asin(halfDist / radius) * (180 / Math.PI);
          const arcLength = (PI2 * radius * arcAngle) / 360;

          const temp = close ? (i === 0 ? 0 : s1 - done) : s1 - done;
          const temp2 =
            i === points.length - 3 ? (close ? pep - curvAdjust : s2) : 0;

          p.addSegment(a1, temp, p1[2], true);
          p.addSegment(a1, isNaN(arcLength) ? 0 : arcLength, p1[2], true);
          p.addSegment(a2, temp2, p2[2], true);

          done = curvAdjust;
          if (i === 0) {
            pep = s1;
            pep2 = curvAdjust;
            tep = [point1.x, point1.y];
          }
        }

        if (i === points.length - 3) {
          p.endPlot(a2, p2[2], true);
        }
      } else if (curvature === 0) {
        // If no curvature, add a simple straight segment
        const p1 = points[i];
        const p2 = points[i + 1];
        const d = dist(p1[0], p1[1], p2[0], p2[1]);
        const a = calcAngle(p1[0], p1[1], p2[0], p2[1]);

        p.addSegment(a, d, p2[2], true);
        if (i === points.length - 2) {
          p.endPlot(a, 1, true);
        }
      }
    }

    p.origin = close && curvature !== 0 ? tep : points[0];
  }

  return p;
}
