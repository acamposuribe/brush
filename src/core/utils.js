// =============================================================================
// Section: Randomness & Noise
// =============================================================================

import { createNoise2D } from "simplex-noise";
import { prng_alea } from "esm-seedrandom";

/**
 * A uniform PRNG function. Returns a float in [0,1).
 * @callback RNG
 * @returns {number}
 */
/** @type {RNG} */
let rng = prng_alea(Math.random());

/**
 * Seed the random number generator.
 * @param {number|string} s – The seed value.
 * @returns {void}
 */
export function seed(s) {
  rng = prng_alea(s);
}

/**
 * Simplex‐noise 2D function.
 * @type {function(number, number): number}
 */
export let noise = createNoise2D(prng_alea(Math.random()));

/**
 * Seed the noise generator.
 * @param {number|string} s - The seed value.
 * @returns {void}
 */
export function noiseSeed(s) {
  noise = createNoise2D(prng_alea(s));
}

/**
 * Returns a random float in [min, max).
 * @param {number} [min=0]
 * @param {number} [max=1]
 * @returns {number}
 */
export const rr = (e = 0, r = 1) => e + rng() * (r - e);

/**
 * Selects a random element from an array.
 * @param {T[]} array - Input array.
 * @returns {T}
 */
export function rArray(array) {
  return array[~~(rng() * array.length)]
}

/**
 * Generates a random number or picks a random array element.
 * @param {number|Array} [minOrArr=0]
 * @param {number} [max=1]
 * @returns {number}
 */
export function random(e = 0, r = 1) {
  if (Array.isArray(e)) return rArray(e);
  if (arguments.length === 1) return rng() * e;
  return rr(...arguments);
}

/**
 * Returns a random integer in [min, max).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randInt = (e, r) => ~~rr(e, r);

/**
 * Gaussian (normal) random sample N(mean, stdev²).
 * @param {number} [mean=0]
 * @param {number} [stdev=1]
 * @returns {number}
 */
export function gaussian(mean = 0, stdev = 1) {
  const u = 1 - rng();
  const v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * cos(360 * v);
  return z * stdev + mean;
}

/**
 * Picks a key from an object according to weighted probabilities.
 * @param {Object<string|number, number>} weights
 * @returns {string|number}
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

// =============================================================================
// Section: Numeric Mapping & Constraints
// =============================================================================

/**
 * Maps a value from range [a,b] to [c,d], optionally clamped.
 * @param {number} value
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {boolean} [withinBounds=false]
 * @returns {number}
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

// =============================================================================
// Section: Trigonometry
// =============================================================================

/**
 * Normalize an angle in degrees to [0,360).
 * @param {number} angle
 * @returns {number}
 */
function nAngle(angle) {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

/**
 * Cosine of an angle (degrees), via lookup table.
 * @param {number} angle
 * @returns {number}
 */
export function cos(angle) {
  return c[~~(4 * nAngle(angle))];
}

/**
 * Sine of an angle (degrees), via lookup table.
 * @param {number} angle
 * @returns {number}
 */
export function sin(angle) {
  return s[~~(4 * nAngle(angle))];
}

/**
 * Converts radians to degrees, normalized to [0,360).
 * @param {number} rad
 * @returns {number}
 */
export const toDegrees = (a) => {
  let angle = ((a * 180) / Math.PI) % 360;
  return angle < 0 ? angle + 360 : angle;
};

// Precompute lookup tables for sin/cos
const totalDegrees = 1440;
const radiansPerIndex = (2 * Math.PI) / totalDegrees;
const c = new Float32Array(totalDegrees);
const s = new Float32Array(totalDegrees);
for (let i = 0; i < totalDegrees; i++) {
  const radians = i * radiansPerIndex;
  c[i] = Math.cos(radians);
  s[i] = Math.sin(radians);
}

// =============================================================================
// Section: Geometry & Transforms
// =============================================================================

/**
 * Rotates point (x,y) around center (cx,cy) by angle degrees.
 * @param {number} cx
 * @param {number} cy
 * @param {number} x
 * @param {number} y
 * @param {number} angle - Degrees
 * @returns {{x:number,y:number}}
 */
export function rotate(cx, cy, x, y, angle) {
  let coseno = cos(angle),
    seno = sin(angle),
    nx = coseno * (x - cx) + seno * (y - cy) + cx,
    ny = coseno * (y - cy) - seno * (x - cx) + cy;
  return { x: nx, y: ny };
}

/**
 * Euclidean distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export const dist = (x1, y1, x2, y2) =>
  Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

/**
 * Angle in degrees between two points, measured clockwise from +X.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export const calcAngle = (x1, y1, x2, y2) =>
  toDegrees(Math.atan2(-(y2 - y1), x2 - x1));

/**
 * Intersection of two line segments, or false if none.
 * @param {{x:number,y:number}} s1a
 * @param {{x:number,y:number}} s1b
 * @param {{x:number,y:number}} s2a
 * @param {{x:number,y:number}} s2b
 * @param {boolean} [includeSegmentExtension=false]
 * @returns {{x:number,y:number}|false}
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

// =============================================================================
// Section: Other Utility Functions
// =============================================================================

/**
 * Shallow‐clones an array of arrays.
 * @param {T[]} array
 * @returns {T[]}
 */
export function cloneArray(array) {
  return array.map(function (arr) {
    return arr.slice();
  });
}