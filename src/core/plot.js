import { State } from "./config.js";
import { Mix } from "./color.js";
import { toDegrees, map, rr } from "./utils.js";
import { Position, isFieldReady } from "./flowfield.js";
import { E } from "./erase.js";
import { Polygon } from "./polygon.js";

// =============================================================================
// Section: Plot Class
// =============================================================================
/**
 * The Plot class is central to the plot system, serving as a blueprint for creating and manipulating a variety
 * of shapes and paths. It manages a collection of segments, each defined by an angle, length, and pressure,
 * allowing for intricate designs such as curves and custom strokes. Plot instances can be transformed by rotation,
 * and their visual representation can be controlled through pressure and angle calculations along their length.
 */

export class Plot {
  /**
   * Creates a new Plot.
   * @param {string} _type - The type of plot, "curve" or "segments"
   */
  constructor(_type) {
    (this.segments = []), (this.angles = []), (this.pres = []);
    this.type = _type;
    this.dir = 0;
    this.calcIndex(0);
    this.pol = false;
  }

  /**
   * Adds a segment to the plot with specified angle, length, and pressure.
   * @param {number} _a - The angle of the segment.
   * @param {number} _length - The length of the segment.
   * @param {number} _pres - The pressure of the segment.
   * @param {boolean} _degrees - Whether the angle is in degrees.
   */
  addSegment(_a = 0, _length = 0, _pres = 1, _degrees = false) {
    // Remove the last angle if the angles array is not empty
    if (this.angles.length > 0) {
      this.angles.splice(-1);
    }
    // Convert to degrees and normalize between 0 and 360 degrees
    _a = _degrees ? ((_a % 360) + 360) % 360 : toDegrees(_a);
    // Store the angle, pressure, and segment length
    this.angles.push(_a);
    this.pres.push(_pres);
    this.segments.push(_length);
    // Calculate the total length of the plot
    this.length = this.segments.reduce((partialSum, a) => partialSum + a, 0);
    // Push the angle again to prepare for the next segment
    this.angles.push(_a);
  }

  /**
   * Finalizes the plot by setting the last angle and pressure.
   * @param {number} _a - The final angle of the plot.
   * @param {number} _pres - The final pressure of the plot.
   * @param {boolean} _degrees - Whether the angle is in degrees.
   */
  endPlot(_a = 0, _pres = 1, _degrees = false) {
    // Convert angle to degrees if necessary
    _a = _degrees ? ((_a % 360) + 360) % 360 : toDegrees(_a);
    // Replace the last angle with the final angle
    this.angles.splice(-1);
    this.angles.push(_a);
    // Store the final pressure
    this.pres.push(_pres);
  }

  /**
   * Rotates the entire plot by a given angle.
   * @param {number} _a - The angle to rotate the plot.
   */
  rotate(_a) {
    this.dir = toDegrees(_a);
  }

  /**
   * Calculates the pressure at a given distance along the plot.
   * @param {number} _d - The distance along the plot.
   * @returns {number} - The calculated pressure.
   */
  pressure(_d) {
    // If the distance exceeds the plot length, return the last pressure
    if (_d > this.length) return this.pres[this.pres.length - 1];
    // Otherwise, calculate the pressure using the curving function
    return this.curving(this.pres, _d);
  }

  /**
   * Calculates the angle at a given distance along the plot.
   * @param {number} _d - The distance along the plot.
   * @returns {number} - The calculated angle.
   */
  angle(_d) {
    // If the distance exceeds the plot length, return the last angle
    if (_d > this.length) return this.angles[this.angles.length - 1];
    // Calculate the index for the given distance
    this.calcIndex(_d);
    // Return the angle, adjusted for the plot type and direction
    return this.type === "curve"
      ? this.curving(this.angles, _d) + this.dir
      : this.angles[this.index] + this.dir;
  }

  /**
   * Interpolates values between segments for smooth transitions.
   * @param {Array<number>} array - The array to interpolate within.
   * @param {number} _d - The distance along the plot.
   * @returns {number} - The interpolated value.
   */
  curving(array, _d) {
    let map0 = array[this.index];
    let map1 = array[this.index + 1];
    if (typeof map1 == "undefined") {
      map1 = map0;
    }
    if (Math.abs(map1 - map0) > 180) {
      if (map1 > map0) {
        map1 = -(360 - map1);
      } else {
        map0 = -(360 - map0);
      }
    }
    return map(_d - this.suma, 0, this.segments[this.index], map0, map1, true);
  }

  /**
   * Calculates the current index of the plot based on the distance.
   * @param {number} _d - The distance along the plot.
   */
  calcIndex(_d) {
    (this.index = -1), (this.suma = 0);
    let d = 0;
    while (d <= _d) {
      this.suma = d;
      d += this.segments[this.index + 1];
      this.index++;
    }
    return this.index;
  }

  /**
   * Generates a polygon based on the plot.
   * @param {number} _x - The x-coordinate for the starting point of the polygon.
   * @param {number} _y - The y-coordinate for the starting point of the polygon.
   * @returns {Polygon} - The generated polygon.
   */
  genPol(_x, _y, _scale = 1, side) {
    isFieldReady() // Ensure that the drawing environment is prepared
    const step = 0.5;
    const vertices = [];
    const numSteps = Math.round(this.length / step);
    const pos = new Position(_x, _y);
    let pside = 0;
    let prevIdx = 0;
    for (let i = 0; i < numSteps; i++) {
      pos.plotTo(this, step, step, 1);
      let idx = this.calcIndex(pos.plotted);
      pside += step;
      if (
        (pside >= this.segments[idx] * side * rr(0.7, 1.3) || idx >= prevIdx) &&
        pos.x
      ) {
        vertices.push([pos.x, pos.y]);
        pside = 0;
        if (idx >= prevIdx) prevIdx++;
      }
    }
    return new Polygon(vertices);
  }

  erase(x, y, scale) {
    if (E.isActive) {
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      this.pol = this.genPol(x, y, scale, 0.15);
      Mix.blend(E.c);
      Mix.isErase = true;
      Mix.ctx.save();
      Mix.ctx.fillStyle = "rgb(255 0 0 / " + E.a + "%)";
      drawPolygon(this.pol.vertices);
      Mix.ctx.fill();
      Mix.ctx.restore();
    }
  }

  show(x, y, scale = 1) {
    if (State.stroke) this.draw(x, y, scale);

    if (State.hatch) this.hatch(x, y, scale);
    if (State.fill) this.fill(x, y, scale);
    this.erase(x, y, scale);
  }
}
