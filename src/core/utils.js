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

/**
 * Seed the random number generator.
 * @param {number|string} s - The seed value.
 */
export function seed(s) {
  rng = prng_alea(s);
}

/**
 * A noise function based on simplex-noise.
 */
let noise_rng = prng_alea(Math.random());
export let noise = createNoise2D(noise_rng);

/**
 * Seeds the noise generator.
 * @param {number|string} s - The seed value.
 */
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

/**
 * Returns a random number between min and max.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @returns {number} The random number.
 */
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

/**
 * Generates a pseudo-Gaussian random number by averaging several random values.
 * @param {number} [mean=0] - Mean value.
 * @param {number} [stdev=1] - Standard deviation.
 * @returns {number} The pseudo-Gaussian random number.
 */
export function pseudoGaussian(mean = 0, stdev = 1) {
  return mean - stdev * 2 + ((rng() + rng() + rng()) / 3) * stdev * 4;
}

/**
 * Selects a random key from an object based on weighted probabilities.
 * @param {Object} weights - Keys with their associated weights.
 * @returns {string|number} The selected key.
 */
export function weightedRand(weights) {
  let totalWeight = 0;
  const entries = [];

  // Build cumulative weights array
  for (const key in weights) {
    totalWeight += weights[key];
    entries.push({ key, cumulative: totalWeight });
  }

  // Get a random number between 0 and totalWeight
  const rnd = rng() * totalWeight;

  // Pick the first entry where rnd is less than the cumulative weight
  for (const entry of entries) {
    if (rnd < entry.cumulative) {
      return isNaN(entry.key) ? entry.key : parseInt(entry.key);
    }
  }
}

/**
 * Remaps a number from one range to another.
 * @param {number} value - The input value.
 * @param {number} a - Original range lower bound.
 * @param {number} b - Original range upper bound.
 * @param {number} c - Target range lower bound.
 * @param {number} d - Target range upper bound.
 * @param {boolean} [withinBounds=false] - Constrain to target range if true.
 * @returns {number} The mapped value.
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
 * Constrains a number within the provided bounds.
 * @param {number} n - The number.
 * @param {number} low - Lower bound.
 * @param {number} high - Upper bound.
 * @returns {number} The constrained number.
 */
export function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

/**
 * Normalizes an angle (in degrees) to the range [0, 360).
 * @param {number} angle - The angle to normalize.
 * @returns {number} The normalized angle.
 */
function nAngle(angle) {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

/**
 * Returns the cosine of the given angle using precalculated values.
 * @param {number} angle - The angle in degrees.
 * @returns {number} The cosine value.
 */
export function cos(angle) {
  return c[~~(4 * nAngle(angle))];
}

/**
 * Returns the sine of the given angle using precalculated values.
 * @param {number} angle - The angle in degrees.
 * @returns {number} The sine value.
 */
export function sin(angle) {
  return s[~~(4 * nAngle(angle))];
}

// Precalculate trigonometric lookup tables for improved performance.
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
 * Converts an angle from radians to degrees and normalizes it to [0, 360).
 * @param {number} a - The angle in radians.
 * @returns {number} The angle in degrees.
 */
export const toDegrees = (a) => {
  let angle = ((a * 180) / Math.PI) % 360;
  return angle < 0 ? angle + 360 : angle;
};

/**
 * Calculates the Euclidean distance between two points.
 * @param {number} x1 - X-coordinate of the first point.
 * @param {number} y1 - Y-coordinate of the first point.
 * @param {number} x2 - X-coordinate of the second point.
 * @param {number} y2 - Y-coordinate of the second point.
 * @returns {number} The distance.
 */
export const dist = (x1, y1, x2, y2) =>
  Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

/**
 * Calculates the angle in degrees between two points.
 * @param {number} x1 - X-coordinate of the first point.
 * @param {number} y1 - Y-coordinate of the first point.
 * @param {number} x2 - X-coordinate of the second point.
 * @param {number} y2 - Y-coordinate of the second point.
 * @returns {number} The angle in degrees measured clockwise from the positive X-axis.
 */
export const calcAngle = (x1, y1, x2, y2) =>
  toDegrees(Math.atan2(-(y2 - y1), x2 - x1));

/**
 * Computes the intersection point between two line segments if it exists.
 * @param {Object} s1a - Start point of the first segment { x, y }.
 * @param {Object} s1b - End point of the first segment { x, y }.
 * @param {Object} s2a - Start point of the second segment { x, y }.
 * @param {Object} s2b - End point of the second segment { x, y }.
 * @param {boolean} [includeSegmentExtension=false] - Allow intersections outside segment bounds.
 * @returns {Object|boolean} The intersection point { x, y } or false if none exists.
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

/**
 * Rotates a point (x, y) around a center (cx, cy) by the given angle.
 * @param {number} cx - X-coordinate of the center.
 * @param {number} cy - Y-coordinate of the center.
 * @param {number} x - X-coordinate of the point.
 * @param {number} y - Y-coordinate of the point.
 * @param {number} angle - Rotation angle in degrees.
 * @returns {Object} The rotated point { x, y }.
 */
export function rotate(cx, cy, x, y, angle) {
  let coseno = cos(angle),
    seno = sin(angle),
    nx = coseno * (x - cx) + seno * (y - cy) + cx,
    ny = coseno * (y - cy) - seno * (x - cx) + cy;
  return { x: nx, y: ny };
}

/**
 * Creates a shallow clone of an array of arrays.
 * @param {Array} array - The array to clone.
 * @returns {Array} A new array where each element is a shallow copy of the corresponding element in the input.
 */
export function cloneArray(array) {
  return array.map(function (arr) {
    return arr.slice();
  });
}
