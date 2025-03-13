// =============================================================================
// Section: Fill Management
// =============================================================================
/**
 * The Fill Management section contains functions and classes dedicated to handling
 * the fill properties of shapes within the drawing context. It supports complex fill
 * operations with effects such as bleeding to simulate watercolor-like textures. The
 * methods provided allow for setting the fill color with opacity, controlling the
 * intensity of the bleed effect, and enabling or disabling the fill operation.
 *
 * The watercolor effect implementation is inspired by Tyler Hobbs' generative art
 * techniques for simulating watercolor paints.
 */

const PI2 = Math.PI * 2;

// No docs for now but explicit enough
const E = {};
export function erase(color = _bg_Color, alpha = 255) {
  E.isActive = true;
  E.c = new Color(color);
  E.a = alpha;
}
export function noErase() {
  E.isActive = false;
}

/**
 * Sets the fill color and opacity for subsequent drawing operations.
 * @param {number|Color} a - The red component of the color or grayscale value, a CSS color string, or a Color object.
 * @param {number} [b] - The green component of the color or the grayscale opacity if two arguments.
 * @param {number} [c] - The blue component of the color.
 * @param {number} [d] - The opacity of the color.
 */
export function fillStyle(a, b, c, d) {
  _ensureReady();
  Fill.opacity = arguments.length < 4 ? b : d;
  Fill.color = arguments.length < 3 ? new Color(a) : new Color(a, b, c);
  Fill.isActive = true;
}

/**
 * Sets the bleed and texture levels for the fill operation, simulating a watercolor effect.
 * @param {number} _i - The intensity of the bleed effect, capped at 0.5.
 * @param {number} _texture - The texture of the watercolor effect, from 0 to 1.
 */
export function fillBleed(_i, _direction = "out") {
  _ensureReady();
  Fill.bleed_strength = R.constrain(_i, 0, 1);
  Fill.direction = _direction;
}

export function fillTexture(_texture = 0.4, _border = 0.4) {
  _ensureReady();
  Fill.texture_strength = R.constrain(_texture, 0, 1);
  Fill.border_strength = R.constrain(_border, 0, 1);
}

/**
 * Disables the fill for subsequent drawing operations.
 */
export function noFill() {
  Fill.isActive = false;
}

/**
 * Object representing the fill state and operations for drawing.
 * @property {boolean} isActive - Indicates if the fill operation is active.
 * @property {Array} v - Array of Vector representing vertices of the polygon to fill.
 * @property {Array} m - Array of multipliers for the bleed effect on each vertex.
 * @property {Color} color - Current fill color.
 * @property {Color} opacity - Current fill opacity.
 * @property {number} bleed_strength - Base value for bleed effect.
 * @property {number} texture_strength - Base value for texture strength.
 * @property {number} border_strength - Base value for border strength.
 * @property {function} fill - Method to fill a polygon with a watercolor effect.
 * @property {function} calcCenter - Method to calculate the centroid of the polygon.
 */
const Fill = {
  isActive: false,
  color: new Color("#002185"),
  opacity: 60,
  bleed_strength: 0.07,
  texture_strength: 0.4,
  border_strength: 0.4,

  getState() {
    const {
      isActive,
      color,
      opacity,
      bleed_strength,
      texture_strength,
      border_strength,
    } = this;
    return {
      isActive,
      color,
      opacity,
      bleed_strength,
      texture_strength,
      border_strength,
    };
  },

  setState(state) {
    Object.assign(this, state);
  },

  /**
   * Fills the given polygon with a watercolor effect.
   * @param {Object} polygon - The polygon to fill.
   */
  fill(polygon) {
    // Store polygon
    this.polygon = polygon;
    // Map polygon vertices to Vector objects
    let v = [...polygon.vertices];
    const vLength = v.length;
    // Calculate fluidity once, outside the loop
    const fluid = vLength * 0.25 * R.weightedRand({ 1: 5, 2: 10, 3: 60 });
    // Map vertices to bleed multipliers with more intense effect on 'fluid' vertices
    const strength = this.bleed_strength;
    this.m = v.map((_, i) => {
      let multiplier = R.rr(0.85, 1.2) * strength;
      return i > fluid ? multiplier : multiplier * 0.2;
    });

    // Shift vertices randomly to create a more natural watercolor edge
    let shift = R.randInt(0, vLength);
    v = [...v.slice(shift), ...v.slice(0, shift)];
    // Create and fill the polygon with the calculated bleed effect
    let pol = new FillPolygon(v, this.m, this.calcCenter(v), [], true);
    pol.fill(
      this.color,
      R.map(this.opacity, 0, 100, 0, 1, true),
      this.texture_strength,
      true
    );
  },

  /**
   * Calculates the center point of the polygon based on the vertices.
   * @returns {Object} Object representing the centroid of the polygon.
   */
  calcCenter(pts) {
    var first = pts[0],
      last = pts[pts.length - 1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    var twicearea = 0,
      x = 0,
      y = 0,
      nPts = pts.length,
      p1,
      p2,
      f;
    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      f =
        (p1.y - first.y) * (p2.x - first.x) -
        (p2.y - first.y) * (p1.x - first.x);
      twicearea += f;
      x += (p1.x + p2.x - 2 * first.x) * f;
      y += (p1.y + p2.y - 2 * first.y) * f;
    }
    f = twicearea * 3;
    return { x: x / f + first.x, y: y / f + first.y };
  },
};

/**
 * The FillPolygon class is used to create and manage the properties of the polygons that produces
 * the watercolor effect. It includes methods to grow (expand) the polygon and apply layers
 * of color with varying intensity and erase parts to simulate a natural watercolor bleed.
 * The implementation follows Tyler Hobbs' guide to simulating watercolor:
 * https://tylerxhobbs.com/essays/2017/a-generative-approach-to-simulating-watercolor-paints
 */
class FillPolygon {
  /**
   * The constructor initializes the polygon with a set of vertices, multipliers for the bleed effect, and a center point.
   * @param {Vector[]} _v - An array of Vector objects representing the vertices of the polygon.
   * @param {number[]} _m - An array of numbers representing the multipliers for the bleed effect at each vertex.
   * @param {Vector} _center - A Vector representing the calculated center point of the polygon.
   * @param {boolean[]} dir - An array of booleans representing the bleed direction.
   * @param {boolean} isFirst - Boolean = true for initial fill polygon
   */
  constructor(_v, _m, _center, dir, isFirst = false) {
    this.pol = new Polygon(_v, true);
    this.v = _v;
    this.dir = dir;
    this.m = _m;
    this.midP = _center;
    this.size = -Infinity;
    this.sizeX = -Infinity;
    this.sizeY = -Infinity;
    for (let v of this.v) {
      this.sizeX = Math.max(R.dist(this.midP.x, 0, v.x, 0), this.sizeX);
      this.sizeY = Math.max(R.dist(this.midP.y, 0, v.y, 0), this.sizeY);
      this.size = Math.max(
        R.dist(this.midP.x, this.midP.y, v.x, v.y),
        this.size
      );
    }
    // This calculates the bleed direction for the initial shape, for each of the vertices.
    if (isFirst) {
      for (let i = 0; i < this.v.length; i++) {
        const v1 = this.v[i];
        const v2 = this.v[(i + 1) % this.v.length];
        const side = { x: v2.x - v1.x, y: v2.y - v1.y };
        const rt = R.rotate(0, 0, side.x, side.y, 90);
        let linea = {
          point1: { x: v1.x + side.x / 2, y: v1.y + side.y / 2 },
          point2: { x: v1.x + side.x / 2 + rt.x, y: v1.y + side.y / 2 + rt.y },
        };
        const isLeft = (a, b, c) => {
          return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0.01;
        };
        let d1 = 0;
        for (let int of Fill.polygon.intersect(linea)) {
          if (isLeft(v1, v2, int)) d1++;
        }
        this.dir[i] = d1 % 2 === 0 ? true : false;
      }
    }
  }

  trim(factor = 1) {
    let v = [...this.v],
      m = [...this.m],
      dir = [...this.dir];

    if (this.v.length > 8 && factor >= 0 && factor !== 1) {
      let numTrim = ~~((1 - factor) * this.v.length);

      let sp = ~~this.v.length / 2 - ~~numTrim / 2;
      v.splice(sp, numTrim);
      m.splice(sp, numTrim);
      dir.splice(sp, numTrim);
    }

    return { v: v, m: m, dir: dir };
  }

  /**
   * Grows the polygon's vertices outwards to simulate the spread of watercolor.
   * Optionally, can also shrink (degrow) the polygon's vertices inward.
   * @param {number} _a - The growth factor.
   * @param {boolean} [degrow=false] - If true, vertices will move inwards.
   * @returns {FillPolygon} A new `FillPolygon` object with adjusted vertices.
   */
  grow(growthFactor = 1, degrow) {
    const newVerts = [];
    const newMods = [];
    const newDirs = [];

    // Determine the length of vertices to process based on growth factor
    // Cache trimmed arrays and their length
    const trimmed = this.trim(growthFactor);
    const tr_v = trimmed.v;
    const tr_m = trimmed.m;
    const tr_dir = trimmed.dir;
    const len = tr_v.length;

    // Pre-compute values that do not change within the loop
    const modAdjustment = degrow ? -0.5 : 1;
    const bleedDirection = Fill.direction === "out" ? -90 : 90;
    // Inline changeModifier to reduce function calls
    const changeModifier = (modifier) => {
      return modifier + R.pseudoGaussian(0, 0.02);
    };
    let cond = false;
    switch (growthFactor) {
      case 999:
        cond = R.rr(0.2, 0.4);
        break;
      case 997:
        cond = Fill.bleed_strength / 1.7;
    }
    // Loop through each vertex to calculate the new position based on growth
    for (let i = 0; i < len; i++) {
      const currentVertex = tr_v[i];
      const nextVertex = tr_v[(i + 1) % len];
      // Determine the growth modifier
      let mod =
        cond || BleedField.get(currentVertex.x, currentVertex.y, tr_m[i]);

      mod *= modAdjustment;

      // Calculate side
      let side = {
        x: nextVertex.x - currentVertex.x,
        y: nextVertex.y - currentVertex.y,
      };

      // Make sure that we always bleed in the selected direction
      let rotationDegrees =
        (tr_dir[i] ? bleedDirection : -bleedDirection) + R.rr(-0.4, 0.4) * 45;
      let direction = R.rotate(0, 0, side.x, side.y, rotationDegrees);

      // Calculate the middle vertex position
      let lerp = R.constrain(R.gaussian(0.5, 0.2), 0.1, 0.9);
      let mult = R.gaussian(0.5, 0.2) * R.rr(0.6, 1.4) * mod;

      // Calculate the new vertex position
      let newVertex = {
        x: currentVertex.x + side.x * lerp + direction.x * mult,
        y: currentVertex.y + side.y * lerp + direction.y * mult,
      };

      // Add the new vertex and its modifier
      newVerts.push(currentVertex, newVertex);
      newMods.push(tr_m[i], changeModifier(tr_m[i]));
      newDirs.push(tr_dir[i], tr_dir[i]);
    }
    return new FillPolygon(newVerts, newMods, this.midP, newDirs);
  }

  /**
   * Fills the polygon with the specified color and intensity.
   * It uses layered growth to simulate watercolor paper absorption and drying patterns.
   * @param {Color|string} color - The fill color.
   * @param {number} intensity - The opacity of the color layers.
   */
  fill(color, intensity, tex) {
    // Precalculate stuff
    const numLayers = 24;
    const texture = tex * 3;
    const int = intensity * 1.5;

    // Perform initial setup only once
    Mix.blend(color);
    Mix.ctx.save();
    Mix.ctx.fillStyle = "rgb(255 0 0 / " + int + "%)";
    Mix.ctx.strokeStyle = "rgb(255 0 0 / " + 0.008 * Fill.border_strength + ")";

    // Set the different polygons for texture
    let pol = this.grow();

    let pols;

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
      if (texture !== 0 && i % 2 === 0) pol.erase(texture * 3, intensity);

      if (i % 6 === 0) {
        Mix.blend(color, true, false, true);
      }
    }
    BleedField.update();
    Mix.ctx.restore();
  }

  /**
   * Adds a layer of color to the polygon with specified opacity.
   * It also sets a stroke to outline the layer edges.
   * @param {number} _nr - The layer number, affecting the stroke and opacity mapping.
   * @param {boolean} [bool=true] - If true, adds a stroke to the layer.
   */
  layer(i) {
    const size = Math.max(this.sizeX, this.sizeY);
    Mix.ctx.lineWidth = R.map(i, 0, 24, size / 30, size / 45, true);

    // Set fill and stroke properties once
    drawPolygon(this.v);
    Mix.ctx.stroke();
    Mix.ctx.fill();
  }

  circle(x, y, d) {
    const radius = d / 2;
    Mix.ctx.moveTo(x + radius, y);
    Mix.ctx.arc(x, y, radius, 0, PI2);
  }

  /**
   * Erases parts of the polygon to create a more natural, uneven watercolor texture.
   * Uses random placement and sizing of circles to simulate texture.
   */
  erase(texture, intensity) {
    Mix.ctx.save();
    // Cache local values to avoid repeated property lookups
    const numCircles = R.rr(40, 60) * R.map(texture, 0, 1, 2, 3);
    const halfSizeX = this.sizeX / 2;
    const halfSizeY = this.sizeY / 2;
    const minSize =
      Math.min(this.sizeX, this.sizeY) * (1.4 - Fill.bleed_strength);
    const minSizeFactor = 0.03 * minSize;
    const maxSizeFactor = 0.25 * minSize;
    const midX = this.midP.x;
    const midY = this.midP.y;
    Mix.ctx.globalCompositeOperation = "destination-out";
    let i = (5 - R.map(intensity, 80, 120, 0.3, 2, true)) * texture;
    Mix.ctx.fillStyle = "rgb(255 0 0 / " + i / 255 + ")";
    Mix.ctx.lineWidth = 0;
    for (let i = 0; i < numCircles; i++) {
      const x = midX + R.gaussian(0, halfSizeX);
      const y = midY + R.gaussian(0, halfSizeY);
      const size = R.rr(minSizeFactor, maxSizeFactor);
      Mix.ctx.beginPath();
      this.circle(x, y, size);
      if (i % 4 !== 0) Mix.ctx.fill();
      if (
        Math.abs(x - midX) < 2 * halfSizeX &&
        Math.abs(y - midY) < 2 * halfSizeY
      )
        BleedField.increase(x, y);
    }
    Mix.ctx.globalCompositeOperation = "source-over";
    Mix.ctx.restore();
  }
}
