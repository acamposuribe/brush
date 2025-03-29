import { createNoise2D } from "simplex-noise";
import { prng_alea } from "esm-seedrandom";

// =============================================================================
// Section: Randomness and other auxiliary functions
// =============================================================================
/**
 * This section includes utility functions for randomness, mapping values,
 * constraining numbers within a range, and precalculated trigonometric values
 * to optimize performance. Additionally, it provides auxiliary functions for
 * geometric calculations such as translation extraction, line intersection,
 * and angle calculation.
 */

/**
 * The basic sources of randomness for random and noise
 * They can be seeded for determinism.
 */
let rng = prng_alea(Math.random());
export function seed(s) {
  rng = prng_alea(s);
}

let noise_rng = prng_alea(Math.random());
export let noise = createNoise2D(noise_rng);
export function noiseSeed(s) {
  noise = createNoise2D(prng_alea(s));
}

/**
 * Generates a random number within a specified range.
 * @param {number | Array} [min=0] - The lower bound of the range or an Array.
 * @param {number} [max=1] - The upper bound of the range.
 * @returns {number} A random number within the specified range or a random element of an array.
 */
export function random(e = 0, r = 1) {
  if (Array.isArray(e)) return e[~~(rng() * e.length)];
  if (arguments.length === 1) return rng() * e;
  return rr(...arguments);
}

export const rr = (e = 0, r = 1) => e + rng() * (r - e);

/**
 * Generates a random integer within a specified range.
 * @param {number} min - The lower bound of the range.
 * @param {number} max - The upper bound of the range.
 * @returns {number} A random integer within the specified range.
 */
export const randInt = (e, r) => ~~rr(e, r);

/**
 * Generates a random gaussian.
 * @param {number} mean - Mean.
 * @param {number} stdev - Standard deviation.
 * @returns {number} A random number following a normal distribution.
 */
export function gaussian(mean = 0, stdev = 1) {
  const u = 1 - rng();
  const v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * cos(360 * v);
  return z * stdev + mean;
}

export function pseudoGaussian(mean = 0, stdev = 1) {
  return mean - stdev * 2 + ((rng() + rng() + rng()) / 3) * stdev * 4;
}

/**
 * Generates a random value based on weighted probabilities.
 * @param {Object} weights - An object containing values as keys and their probabilities as values.
 * @returns {string} A key randomly chosen based on its weight.
 */
export function weightedRand(e) {
  let r,
    a,
    n = [];
  for (r in e) for (a = 0; a < 10 * e[r]; a++) n.push(r);
  let v = n[Math.floor(rng() * n.length)];
  return isNaN(v) ? v : parseInt(v);
}

/**
 * Remaps a number from one range to another.
 * @param {number} value - The number to remap.
 * @param {number} a - The lower bound of the value's current range.
 * @param {number} b- The upper bound of the value's current range.
 * @param {number} c - The lower bound of the value's target range.
 * @param {number} d - The upper bound of the value's target range.
 * @param {boolean} [withinBounds=false] - Whether to constrain the value to the target range.
 * @returns {number} The remapped number.
 */
export function map(value, a, b, c, d, withinBounds = false) {
  let r = c + ((value - a) / (b - a)) * (d - c);
  if (!withinBounds) return r;
  if (c < d) {
    return constrain(r, c, d);
  } else {
    return constrain(r, d, c);
  }
}

/**
 * Constrains a number to be within a range.
 * @param {number} n - The number to constrain.
 * @param {number} low - The lower bound of the range.
 * @param {number} high - The upper bound of the range.
 * @returns {number} The constrained number.
 */
export function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

function nAngle(angle) {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

/**
 * Calculates the cosine for a given angle using precalculated values.
 * @param {number} angle - The angle in degrees.
 * @returns {number} The cosine of the angle.
 */
export function cos(angle) {
  return c[~~(4 * nAngle(angle))];
}

/**
 * Calculates the sine for a given angle using precalculated values.
 * @param {number} angle - The angle in degrees.
 * @returns {number} The sine of the angle.
 */
export function sin(angle) {
  return s[~~(4 * nAngle(angle))];
}

/**
 * Precalculates trigonometric values for improved performance.
 * This function should be called before any trigonometric calculations are performed.
 */
const totalDegrees = 1440;
const radiansPerIndex = (2 * Math.PI) / totalDegrees;
const c = new Float32Array(totalDegrees);
const s = new Float32Array(totalDegrees);
for (let i = 0; i < totalDegrees; i++) {
  const radians = i * radiansPerIndex;
  c[i] = Math.cos(radians);
  s[i] = Math.sin(radians);
}

/**
 * Changes angles to degrees and between 0-360
 */
export const toDegrees = (a) => {
  let angle = ((a * 180) / Math.PI) % 360;
  return angle < 0 ? angle + 360 : angle;
};

/**
 * Calculates distance between two 2D points
 */
export const dist = (x1, y1, x2, y2) =>
  Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

/**
 * Calculates the angle in degrees between two points in 2D space.
 * The angle is measured in a clockwise direction from the positive X-axis.
 *
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} The angle in degrees between the two points.
 */
export const calcAngle = (x1, y1, x2, y2) =>
  toDegrees(Math.atan2(-(y2 - y1), x2 - x1));

/**
 * Calculates the intersection point between two line segments if it exists.
 *
 * @param {Object} s1a - The start point of the first line segment.
 * @param {Object} s1b - The end point of the first line segment.
 * @param {Object} s2a - The start point of the second line segment.
 * @param {Object} s2b - The end point of the second line segment.
 * @param {boolean} [includeSegmentExtension=false] - Whether to include points of intersection not lying on the segments.
 * @returns {Object|boolean} The intersection point as an object with 'x' and 'y' properties, or 'false' if there is no intersection.
 */
export function intersectLines(
  s1a,
  s1b,
  s2a,
  s2b,
  includeSegmentExtension = false
) {
  // Extract coordinates from points
  let x1 = s1a.x,
    y1 = s1a.y;
  let x2 = s1b.x,
    y2 = s1b.y;
  let x3 = s2a.x,
    y3 = s2a.y;
  let x4 = s2b.x,
    y4 = s2b.y;
  // Early return if line segments are points or if the lines are parallel
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false; // Segments are points
  }
  let deltaX1 = x2 - x1,
    deltaY1 = y2 - y1;
  let deltaX2 = x4 - x3,
    deltaY2 = y4 - y3;
  let denominator = deltaY2 * deltaX1 - deltaX2 * deltaY1;
  if (denominator === 0) {
    return false; // Lines are parallel
  }
  // Calculate the intersection point
  let ua = (deltaX2 * (y1 - y3) - deltaY2 * (x1 - x3)) / denominator;
  let ub = (deltaX1 * (y1 - y3) - deltaY1 * (x1 - x3)) / denominator;
  // Check if the intersection is within the bounds of the line segments
  if (!includeSegmentExtension && (ub < 0 || ub > 1)) {
    return false;
  }
  // Calculate the intersection coordinates
  let x = x1 + ua * deltaX1;
  let y = y1 + ua * deltaY1;
  return { x: x, y: y };
}

export function rotate(cx, cy, x, y, angle) {
  let coseno = cos(angle),
    seno = sin(angle),
    nx = coseno * (x - cx) + seno * (y - cy) + cx,
    ny = coseno * (y - cy) - seno * (x - cx) + cy;
  return { x: nx, y: ny };
}

export function cloneArray(array) {
  return array.map(function (arr) {
    return arr.slice();
  });
}
