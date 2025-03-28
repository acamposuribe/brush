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
 * Creates a Polygon from a given array of points and performs drawing and filling
 * operations based on active states.
 *
 * @param {Array} pointsArray - An array of points where each point is an array of two numbers [x, y, pressure].
 */
export function polygon(pointsArray) {
  // Create a new Polygon instance
  let polygon = new Polygon(pointsArray);
  polygon.show();
}

/**
 * Draws a rectangle on the canvas and fills it with the current fill color.
 *
 * @param {number} x - The x-coordinate of the rectangle.
 * @param {number} y - The y-coordinate of the rectangle.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {boolean} [mode="corner"] - If "center", the rectangle is drawn centered at (x, y).
 */
export function rect(x, y, w, h, mode = "corner") {
  if (mode == "center") (x = x - w / 2), (y = y - h / 2);
  beginPath(0);
  moveTo(x, y);
  lineTo(x + w, y);
  lineTo(x + w, y + h);
  lineTo(x, y + h);
  closePath();
  drawPath();
}

/**
 * Draws a circle on the canvas
 *
 * @param {number} x - The x-coordinate of the center of the circle.
 * @param {number} y - The y-coordinate of the center of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {boolean} [r=false] - If true, applies a random factor to the radius for each segment.
 */
export function circle(x, y, radius, r = false) {
  // Create a new Plot instance for a curve shape
  let p = new Plot("curve");
  // Calculate the length of the arc for each quarter of the circle
  let l = (Math.PI * radius) / 2;
  // Initialize the angle for the drawing segments
  let angle = rr(0, 360);
  // Define a function to optionally add randomness to the segment length
  let rra = () => (r ? 1 + 0.2 * rr() : 1);
  // Add segments for each quarter of the circle with optional randomness
  p.addSegment(0 + angle * rra(), l * rra(), 1, true);
  p.addSegment(-90 + angle * rra(), l * rra(), 1, true);
  p.addSegment(-180 + angle * rra(), l * rra(), 1, true);
  p.addSegment(-270 + angle * rra(), l * rra(), 1, true);
  // Optionally add a random final angle for the last segment
  let angle2 = r ? randInt(-5, 5) : 0;
  if (r)
    p.addSegment(angle, Math.abs(angle2) * (Math.PI / 180) * radius, 1, true);
  // Finalize the plot
  p.endPlot(angle2 + angle, 1, true);
  // Fill / hatch / draw
  let o = [x - radius * sin(angle), y - radius * cos(-angle)];
  p.show(o[0], o[1], 1);
}

export function arc(x, y, radius, start, end) {
  _ensureReady();
  // Create a new Plot instance for a curve shape
  let p = new Plot("curve");
  // Calculate start angle and end angle
  let a1 = 270 - toDegrees(start),
    a2 = 270 - toDegrees(end);
  // Calculate length arc
  let arcAngle = toDegrees(end - start);
  let l = (Math.PI * radius * arcAngle) / 180;
  // Add segments to plot
  p.addSegment(a1, l, 1, true);
  p.endPlot(a2, 1, true);
  // Draw from starting point
  p.draw(x + radius * cos(-a1 - 90), y + radius * sin(-a1 - 90), 1);
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

export function drawPath() {
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

const PI2 = Math.PI * 2

/**
 * Creates a new Plot object.
 * @param {Array<Array<number>>} array_points - An array of points defining the spline curve.
 * @param {number} [curvature=0.5] - The curvature of the spline curve, beterrn 0 and 1. A curvature of 0 will create a series of straight segments.
 */
function _createSpline(array_points, curvature = 0.5, _close = false) {
  // Initialize the plot type based on curvature
  let plotType = curvature === 0 ? "segments" : "curve";
  let p = new Plot(plotType);
  if (_close && curvature !== 0) array_points.push(array_points[1]);

  // Proceed only if there are points provided
  if (array_points && array_points.length > 0) {
    // Add each segment to the plot
    let done = 0;
    let pep, tep, pep2;
    for (let i = 0; i < array_points.length - 1; i++) {
      if (curvature > 0 && i < array_points.length - 2) {
        // Get the current and next points
        let p1 = array_points[i],
          p2 = array_points[i + 1],
          p3 = array_points[i + 2];
        // Calculate distances and angles between points
        let d1 = dist(p1[0], p1[1], p2[0], p2[1]),
          d2 = dist(p2[0], p2[1], p3[0], p3[1]);
        let a1 = calcAngle(p1[0], p1[1], p2[0], p2[1]),
          a2 = calcAngle(p2[0], p2[1], p3[0], p3[1]);
        // Calculate curvature based on the minimum distance
        let dd = curvature * Math.min(Math.min(d1, d2), 0.5 * Math.min(d1, d2)),
          dmax = Math.max(d1, d2);
        let s1 = d1 - dd,
          s2 = d2 - dd;
        // If the angles are approximately the same, create a straight segment
        if (Math.floor(a1) === Math.floor(a2)) {
          let temp = _close ? (i === 0 ? 0 : d1 - done) : d1 - done;
          let temp2 = _close ? (i === 0 ? 0 : d2 - pep2) : d2;
          p.addSegment(a1, temp, p1[2], true);
          if (i === array_points.length - 3)
            p.addSegment(a2, temp2, p2[2], true);
          done = 0;
          if (i === 0)
            (pep = d1), (pep2 = dd), (tep = array_points[1]), (done = 0);
        } else {
          // If the angles are not the same, create curves, etc (this is a too complex...)
          let point1 = {
            x: p2[0] - dd * cos(-a1),
            y: p2[1] - dd * sin(-a1),
          };
          let point2 = {
            x: point1.x + dmax * cos(-a1 + 90),
            y: point1.y + dmax * sin(-a1 + 90),
          };
          let point3 = {
            x: p2[0] + dd * cos(-a2),
            y: p2[1] + dd * sin(-a2),
          };
          let point4 = {
            x: point3.x + dmax * cos(-a2 + 90),
            y: point3.y + dmax * sin(-a2 + 90),
          };
          let int = intersectLines(point1, point2, point3, point4, true);
          let radius = dist(point1.x, point1.y, int.x, int.y);
          let disti = dist(point1.x, point1.y, point3.x, point3.y) / 2;
          let a3 = 2 * Math.asin(disti / radius) * (180 / Math.PI);
          let s3 = (PI2 * radius * a3) / 360;
          let temp = _close ? (i === 0 ? 0 : s1 - done) : s1 - done;
          let temp2 =
            i === array_points.length - 3 ? (_close ? pep - dd : s2) : 0;
          p.addSegment(a1, temp, p1[2], true);
          p.addSegment(a1, isNaN(s3) ? 0 : s3, p1[2], true);
          p.addSegment(a2, temp2, p2[2], true);
          done = dd;
          if (i === 0) (pep = s1), (pep2 = dd), (tep = [point1.x, point1.y]);
        }
        if (i == array_points.length - 3) {
          p.endPlot(a2, p2[2], true);
        }
      } else if (curvature === 0) {
        // If curvature is 0, simply create segments
        let p1 = array_points[i],
          p2 = array_points[i + 1];
        let d = dist(p1[0], p1[1], p2[0], p2[1]);
        let a = calcAngle(p1[0], p1[1], p2[0], p2[1]);
        p.addSegment(a, d, p2[2], true);
        if (i == array_points.length - 2) {
          p.endPlot(a, 1, true);
        }
      }
    }
    // Set the origin point from the first point in the array
    p.origin = _close && curvature !== 0 ? tep : array_points[0];
  }
  return p;
}

/**
 * Creates and draws a spline curve with the given points and curvature.
 * @param {Array<Array<number>>} array_points - An array of points defining the spline curve.
 * @param {number} [curvature=0.5] - The curvature of the spline curve, between 0 and 1. A curvature of 0 will create a series of straight segments.
 */
export function spline(array_points, curvature = 0.5) {
  let p = _createSpline(array_points, curvature); // Create a new Plot-spline instance
  p.draw(); // Draw the Plot
}
