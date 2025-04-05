// =============================================================================
// Module: Fill
// =============================================================================
/**
 * The Fill module contains functions and classes dedicated to handling
 * the fill properties of shapes within the drawing context. It supports complex fill
 * operations with effects such as bleeding to simulate watercolor-like textures. The
 * methods provided allow for setting the fill color with opacity, controlling the
 * intensity of the bleed effect, and enabling or disabling the fill operation.
 *
 * The watercolor effect implementation is inspired by Tyler Hobbs'
 * techniques for simulating watercolor paints.
 */

import { Color, Mix, State } from "../core/color.js";
import { drawPolygon, circle } from "../core/mask.js";
import {
  constrain,
  weightedRand,
  rr,
  map,
  randInt,
  gaussian,
  pseudoGaussian,
  rotate,
} from "../core/utils.js";
import { BleedField, isFieldReady } from "../core/flowfield.js";
import { Polygon } from "../core/polygon.js";
import { Plot } from "../core/plot.js";

// =============================================================================
// Fill State and helpers
// =============================================================================

/**
 * Global fill state settings.
 */
State.fill = {
  color: new Color("#002185"),
  opacity: 60,
  bleed_strength: 0.07,
  texture_strength: 0.8,
  border_strength: 0.5,
  direction: "out",
  isActive: false,
};

/**
 * Returns a shallow copy of the current fill state.
 * @returns {Object} The current fill state.
 */
function FillState() {
  return { ...State.fill };
}

/**
 * Updates the global fill state.
 * @param {Object} state - The new fill state.
 */
function FillSetState(state) {
  State.fill = { ...state };
}

// ---------------------------------------------------------------------------
// Fill Style Functions
// ---------------------------------------------------------------------------

/**
 * Sets the fill color and opacity for subsequent drawing operations.
 * @param {number|string|Color} a - Either the red component, a CSS color string, or a Color object.
 * @param {number} [b] - The green component or the opacity if using grayscale.
 * @param {number} [c] - The blue component.
 * @param {number} [d] - The opacity.
 */
export function fillStyle(a, b, c, d) {
  State.fill.opacity = (arguments.length < 4 ? b : d) || 60;
  State.fill.color = arguments.length < 3 ? new Color(a) : new Color(a, b, c);
  State.fill.isActive = true;
}

/**
 * Sets the bleed (watercolor) intensity and direction.
 * @param {number} _i - The bleed intensity (clamped to [0,1]).
 * @param {string} [_direction="out"] - The bleeding direction.
 */
export function fillBleed(_i, _direction = "out") {
  State.fill.bleed_strength = constrain(_i, 0, 1);
  State.fill.direction = _direction;
}

/**
 * Sets the texture and border strengths for the fill.
 * @param {number} [_texture=0.4] - The texture strength (clamped to [0,1]).
 * @param {number} [_border=0.4] - The border strength (clamped to [0,1]).
 */
export function fillTexture(_texture = 0.4, _border = 0.4) {
  State.fill.texture_strength = constrain(_texture, 0, 1);
  State.fill.border_strength = constrain(_border, 0, 1);
}

/**
 * Disables fill for subsequent drawing operations.
 */
export function noFill() {
  State.fill.isActive = false;
}

// ---------------------------------------------------------------------------
// Fill Manager Functions
// ---------------------------------------------------------------------------

let fillPolygon;

/**
 * Fills a given polygon with a watercolor effect.
 * @param {Polygon} polygon - The polygon to fill.
 */
export function createFill(polygon) {
  // Store polygon
  fillPolygon = polygon;
  // Map polygon vertices to Vector objects
  let v = [...polygon.vertices];
  const vLength = v.length;
  // Calculate fluidity once, outside the loop
  const fluid = vLength * 0.25 * weightedRand({ 1: 5, 2: 10, 3: 60 });
  // Map vertices to bleed multipliers with more intense effect on 'fluid' vertices
  const strength = State.fill.bleed_strength;
  let modifiers = v.map((_, i) => {
    let multiplier = rr(0.85, 1.2) * strength;
    return i > fluid ? multiplier : multiplier * 0.2;
  });
  // Shift vertices randomly for natural edges.
  const shift = randInt(0, vLength);
  v = [...v.slice(shift), ...v.slice(0, shift)];
  const center = calcCenter(v);
  // Create and fill the polygon with the calculated bleed effect
  let pol = new FillPolygon(v, modifiers, center, [], true);
  pol.fill(
    State.fill.color,
    map(State.fill.opacity, 0, 100, 0, 1, true),
    State.fill.texture_strength
  );
}

/**
 * Calculates the centroid of a polygon from its vertices.
 * @param {Object[]} pts - Array of points with {x, y}.
 * @returns {Object} The center point {x, y}.
 */
function calcCenter(pts) {
  pts = [...pts];
  const first = pts[0],
    last = pts[pts.length - 1];
  if (first.x !== last.x || first.y !== last.y) pts.push(first);
  let twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length;
  for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
    const p1 = pts[i],
      p2 = pts[j];
    const f =
      (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
    twicearea += f;
    x += (p1.x + p2.x - 2 * first.x) * f;
    y += (p1.y + p2.y - 2 * first.y) * f;
  }
  const f = twicearea * 3;
  return { x: x / f + first.x, y: y / f + first.y };
}

// ---------------------------------------------------------------------------
// FillPolygon Class
// ---------------------------------------------------------------------------
/**
 * The FillPolygon class is used to create and manage the properties of the polygons that produces
 * the watercolor effect. It includes methods to grow (expand) the polygon and apply layers
 * of color with varying intensity and erase parts to simulate a natural watercolor bleed.
 * The implementation follows Tyler Hobbs' guide to simulating watercolor:
 * https://tylerxhobbs.com/essays/2017/a-generative-approach-to-simulating-watercolor-paints
 */
class FillPolygon {
  /**
   * Constructs a FillPolygon.
   * @param {Object[]} _v - Vertices of the polygon.
   * @param {number[]} _m - Multipliers for the bleed effect at each vertex.
   * @param {Object} _center - The polygon's center {x, y}.
   * @param {boolean[]} dir - Array indicating bleed direction per vertex.
   * @param {boolean} isFirst - True for initial polygon.
   */
  constructor(_v, _m, _center, dir, isFirst) {
    this.v = _v;
    this.dir = dir;
    this.m = _m;
    this.midP = _center;
    this.sizeX = -Infinity;
    this.sizeY = -Infinity;
    for (let v of this.v) {
      this.sizeX = Math.max(Math.abs(this.midP.x - v.x), this.sizeX);
      this.sizeY = Math.max(Math.abs(this.midP.y - v.y), this.sizeY);
    }
    // Calculate bleed direction for the initial shape.
    if (isFirst) {
      for (let i = 0; i < this.v.length; i++) {
        const v1 = this.v[i];
        const v2 = this.v[(i + 1) % this.v.length];
        const side = { x: v2.x - v1.x, y: v2.y - v1.y };
        const rt = rotate(0, 0, side.x, side.y, 90);
        let linea = {
          point1: { x: v1.x + side.x / 2, y: v1.y + side.y / 2 },
          point2: { x: v1.x + side.x / 2 + rt.x, y: v1.y + side.y / 2 + rt.y },
        };
        const isLeft = (a, b, c) => {
          return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0.01;
        };
        let d1 = 0;
        for (let int of fillPolygon.intersect(linea)) {
          if (isLeft(v1, v2, int)) d1++;
        }
        this.dir[i] = d1 % 2 === 0 ? true : false;
      }
    }
  }

  /**
   * Trims vertices from the polygon based on a factor.
   * @param {number} [factor=1] - Factor determining amount of trimming.
   * @returns {Object} An object containing trimmed vertices, multipliers, and direction.
   */
  trim(factor = 1) {
    let v = [...this.v],
      m = [...this.m],
      dir = [...this.dir];
    if (this.v.length > 8 && factor >= 0 && factor !== 1) {
      const numTrim = ~~((1 - factor) * this.v.length);
      const sp = ~~(this.v.length / 2 - numTrim / 2);
      v.splice(sp, numTrim);
      m.splice(sp, numTrim);
      dir.splice(sp, numTrim);
    }
    return { v, m, dir };
  }

  /**
   * Grows (or shrinks) the polygon vertices to simulate watercolor spread.
   * @param {number} [growthFactor=1] - Factor controlling growth.
   * @returns {FillPolygon} A new FillPolygon with adjusted vertices.
   */
  grow(growthFactor = 1) {
    const newVerts = [];
    const newMods = [];
    const newDirs = [];

    // Determine the length of vertices to process based on growth factor
    // Cache trimmed arrays and their length
    const trimmed = this.trim(growthFactor);
    const tr_v = trimmed.v,
      tr_m = trimmed.m,
      tr_dir = trimmed.dir;
    const len = tr_v.length;
    const bleedDirection = State.fill.direction === "out" ? -90 : 90;
    let cond = false;
    if (growthFactor === 999) cond = rr(0.2, 0.6);
    else if (growthFactor === 997) cond = State.fill.bleed_strength / 1.7;
    // Loop through each vertex to calculate the new position based on growth
    for (let i = 0; i < len; i++) {
      const currentVertex = tr_v[i];
      const nextVertex = tr_v[(i + 1) % len];
      // Determine the growth modifier
      let mod =
        cond || BleedField.get(currentVertex.x, currentVertex.y, tr_m[i]);

      // Calculate side
      let side = {
        x: nextVertex.x - currentVertex.x,
        y: nextVertex.y - currentVertex.y,
      };

      // Make sure that we always bleed in the selected direction
      let rotationDegrees =
        (tr_dir[i] ? bleedDirection : -bleedDirection) + rr(-1, 1) * 5;
      let direction = rotate(0, 0, side.x, side.y, rotationDegrees);

      // Calculate the middle vertex position
      let lerp = rr(0.35, 0.65);
      let mult = gaussian(0.5, 0.2) * rr(0.65, 1.35) * mod;

      // Calculate the new vertex position
      let newVertex = {
        x: currentVertex.x + side.x * lerp + direction.x * mult,
        y: currentVertex.y + side.y * lerp + direction.y * mult,
      };

      // Add the new vertex and its modifier
      newVerts.push(currentVertex, newVertex);
      newMods.push(tr_m[i], tr_m[i] + pseudoGaussian(0, 0.02));
      newDirs.push(tr_dir[i], tr_dir[i]);
    }
    return new FillPolygon(newVerts, newMods, this.midP, newDirs);
  }

  /**
   * Fills the polygon with multiple layers to simulate a watercolor effect.
   * @param {Color|string} color - The fill color.
   * @param {number} intensity - Opacity intensity (mapped from 0 to 1).
   * @param {number} tex - Texture factor.
   */
  fill(color, intensity, tex) {
    // Precalculate stuff
    const numLayers = 24;
    const texture = tex * 3;
    const int = intensity * (1 + tex / 2);

    // Perform initial setup only once
    Mix.blend(color);
    Mix.ctx.save();
    Mix.ctx.fillStyle = "rgb(255 0 0 / " + int + "%)";
    Mix.ctx.strokeStyle =
      "rgb(255 0 0 / " + 0.008 * State.fill.border_strength + ")";

    // Set the different polygons for texture
    let pol = this.grow(),
      pols;
    for (let i = 0; i < numLayers; i++) {
      if (i % 4 === 0) {
        pol = pol.grow();
      }
      pols = [
        pol.grow(1 - 0.0125 * i),
        pol.grow(0.7 - 0.0125 * i),
        pol.grow(0.4 - 0.0125 * i),
      ];

      // Draw layers
      for (let p of pols) p.grow(997).grow().layer(i);
      pol.grow(0.1).grow(999).layer(i);
      if (i % 4 === 0 || i === numLayers - 1) {
        if (texture !== 0) pol.erase(texture * 5, intensity);
        Mix.blend(color, true, false, true);
      }
    }
    BleedField.update();
    Mix.ctx.restore();
  }

  /**
   * Draws a layer of the fill polygon with stroke and fill.
   * @param {number} i - The layer index.
   */
  layer(i) {
    const size = Math.max(this.sizeX, this.sizeY);
    Mix.ctx.lineWidth = map(i, 0, 24, size / 30, size / 45, true);
    // Set fill and stroke properties once
    drawPolygon(this.v);
    Mix.ctx.stroke();
    Mix.ctx.fill();
  }

  /**
   * Erases parts of the polygon to create a natural watercolor texture.
   * @param {number} texture - Texture strength factor.
   * @param {number} intensity - Intensity value for size scaling.
   */
  erase(texture, intensity) {
    Mix.ctx.save();
    // Cache local values to avoid repeated property lookups
    let numCircles = rr(60, 100) * map(texture, 0, 1, 2, 3);
    const halfSizeX = this.sizeX / 1.8;
    const halfSizeY = this.sizeY / 1.8;
    const minSize =
      Math.min(this.sizeX, this.sizeY) * (1.4 - State.fill.bleed_strength);
    const minSizeFactor = 0.03 * minSize;
    const maxSizeFactor = 0.3 * minSize;
    const midX = this.midP.x;
    const midY = this.midP.y;
    Mix.ctx.globalCompositeOperation = "destination-out";
    let i = (5 - map(intensity, 80, 120, 0.3, 2, true)) * texture;
    Mix.ctx.fillStyle = "rgb(255 0 0 / " + i / 255 + ")";
    Mix.ctx.lineWidth = 0;
    for (let i = 0; i < numCircles; i++) {
      const x = midX + gaussian(0, halfSizeX);
      const y = midY + gaussian(0, halfSizeY);
      const size = rr(minSizeFactor, maxSizeFactor);
      Mix.ctx.beginPath();
      circle(x, y, size);
      if (i % 4 !== 0) Mix.ctx.fill();
    }
    Mix.ctx.globalCompositeOperation = "source-over";
    Mix.ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Extend Polygon and Plot Prototypes for Fill
// ---------------------------------------------------------------------------

/**
 * Applies a fill effect to the polygon using the current fill state.
 * @param {Color|string} [_color] - The color for the fill.
 * @param {number} [_opacity] - The opacity value.
 * @param {number} [_bleed] - The bleed intensity.
 * @param {number} [_texture] - The texture strength.
 * @param {number} [_border] - The border strength.
 * @param {string} [_direction] - The bleed direction.
 */
Polygon.prototype.fill = function (
  _color = false,
  _opacity,
  _bleed,
  _texture,
  _border,
  _direction
) {
  let state = FillState();
  if (_color) {
    fillStyle(_color, _opacity);
    fillBleed(_bleed, _direction);
    fillTexture(_texture, _border);
  }
  if (state.isActive) {
    isFieldReady();
    createFill(this);
  }
  FillSetState(state);
};

/**
 * Fills a plot on the canvas by generating a polygon based on the provided coordinates.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} scale - Scaling factor.
 */
Plot.prototype.fill = function (x, y, scale) {
  if (FillState().isActive) {
    if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
    this.pol = this.genPol(x, y, scale, State.fill.bleed_strength * 3);
    this.pol.fill();
  }
};
