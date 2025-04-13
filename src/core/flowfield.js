import { Mix, isMixReady, Cwidth, Cheight, State } from "./color.js";
import { randInt, noise, map, rr, sin, cos, cloneArray } from "./utils.js";

// =============================================================================
// Section: Matrix transformations
// =============================================================================

/**
 * The `Matrix` object stores the current translation offsets (`x` and `y`)
 * applied to the canvas. These values are updated whenever a translation
 * operation is performed.
 */
export const Matrix = { x: 0, y: 0 };

/**
 * Translates the canvas by the specified x and y offsets.
 * Updates the `Matrix` object to reflect the current translation state.
 *
 * @param {number} x - The horizontal translation offset.
 * @param {number} y - The vertical translation offset.
 */
export function translate(x, y) {
  isFieldReady();
  Mix.ctx.translate(x, y); // Apply the translation to the canvas context
  // Update the Matrix object with the current transformation state
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e; // Horizontal offset
  Matrix.y = m.f; // Vertical offset
}

/**
 * Rotates the canvas by the specified angle.
 *
 * @param {number} [a=0] - The angle of rotation in radians (default: 0).
 */
export function rotate(a = 0) {
  isFieldReady();
  Mix.ctx.rotate(a); // Apply the rotation to the canvas context
}

/**
 * Scales the canvas by the specified factor.
 *
 * @param {number} a - The scaling factor. Values greater than 1 enlarge the canvas,
 *                     while values between 0 and 1 shrink it.
 */
export function scale(a) {
  isFieldReady();
  Mix.ctx.scale(a, a); // Apply the scaling transformation to the canvas context
}

// =============================================================================
// Section: Field Initialization
// =============================================================================

let isLoaded = false;

/**
 * Ensures the field system is initialized and ready for use.
 * If the field is not loaded, it initializes the mixing system and creates the field.
 */
export function isFieldReady() {
  if (!isLoaded) {
    isMixReady(); // Ensure the mixing system is ready
    createField(); // Initialize the field
    isLoaded = true;
  }
}

// =============================================================================
// Section: Position Class
// =============================================================================

/**
 * The Position class represents a point within a two-dimensional space, which can interact with a vector field.
 * It provides methods to update the position based on the field's flow and to check whether the position is
 * within certain bounds (e.g., within the field or canvas).
 */
export class Position {
  /**
   * Constructs a new Position instance.
   * @param {number} x - The initial x-coordinate.
   * @param {number} y - The initial y-coordinate.
   */
  constructor(x, y) {
    this.update(x, y);
    this.plotted = 0; // Tracks the total distance plotted
  }

  /**
   * Updates the position's coordinates and calculates its offsets and indices within the flow field.
   * @param {number} x - The new x-coordinate.
   * @param {number} y - The new y-coordinate.
   */
  update(x, y) {
    this.x = x;
    this.y = y;
    this.column_index = Position.getColIndex(x);
    this.row_index = Position.getRowIndex(y);
  }

  /**
   * Resets the 'plotted' property to 0.
   */
  reset() {
    this.plotted = 0;
  }

  /**
   * Checks if the position is within the active flow field's bounds.
   * @returns {boolean} - True if the position is within the flow field, false otherwise.
   */
  isIn() {
    return State.field.isActive
      ? Position.isIn(this.column_index, this.row_index)
      : this.isInCanvas(this.x, this.y);
  }

  /**
   * Checks if the position is within the canvas bounds (with a margin).
   * @returns {boolean} - True if the position is within bounds, false otherwise.
   */
  isInCanvas() {
    const margin = 0.3;
    const w = Cwidth;
    const h = Cheight;
    const x = this.x + Matrix.x;
    const y = this.y + Matrix.y;
    return (
      x >= -margin * w &&
      x <= (1 + margin) * w &&
      y >= -margin * h &&
      y <= (1 + margin) * h
    );
  }

  /**
   * Calculates the angle of the flow field at the position's current coordinates.
   * @returns {number} - The angle in radians, or 0 if the position is not in the flow field or if the flow field is not active.
   */
  angle() {
    return this.isIn() && State.field.isActive
      ? flow_field()[this.column_index][this.row_index]
      : 0;
  }

  /**
   * Moves the position along the flow field by a certain length.
   * @param {number} _length - The length to move along the field.
   * @param {number} _dir - The direction of movement.
   * @param {number} _step_length - The length of each step.
   * @param {boolean} isFlow - Whether to use the flow field for movement.
   */
  moveTo(_length, _dir, _step_length, isFlow = true) {
    if (!this.isIn()) {
      this.plotted += _step_length;
      return;
    }

    let a, b;
    for (let i = 0; i < _length / _step_length; i++) {
      if (isFlow) {
        const angle = this.angle();
        a = cos(angle - _dir);
        b = sin(angle - _dir);
      } else {
        a = cos(-_dir);
        b = sin(-_dir);
      }
      const x_step = _step_length * a;
      const y_step = _step_length * b;
      this.plotted += _step_length;
      this.update(this.x + x_step, this.y + y_step);
    }
  }

  /**
   * Plots a point to another position within the flow field, following a Plot object
   * @param {Position} _plot - The Plot path object.
   * @param {number} _length - The length to move towards the target position.
   * @param {number} _step_length - The length of each step.
   * @param {number} _scale - The scaling factor for the plotting path.
   */
  plotTo(_plot, _length, _step_length, _scale) {
    if (!this.isIn()) {
      this.plotted += _step_length / _scale;
      return;
    }

    const inverse_scale = 1 / _scale;
    for (let i = 0; i < _length / _step_length; i++) {
      const current_angle = this.angle();
      const plot_angle = _plot.angle(this.plotted);
      const x_step = _step_length * cos(current_angle - plot_angle);
      const y_step = _step_length * sin(current_angle - plot_angle);
      this.plotted += _step_length * inverse_scale;
      this.update(this.x + x_step, this.y + y_step);
    }
  }

  // Static Methods

  /**
   * Gets the row index for a given y-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} - The row index.
   */
  static getRowIndex(y, d = 1) {
    const y_offset = y + Matrix.y - top_y;
    return Math.round(y_offset / resolution / d);
  }

  /**
   * Gets the column index for a given x-coordinate.
   * @param {number} x - The x-coordinate.
   * @returns {number} - The column index.
   */
  static getColIndex(x, d = 1) {
    const x_offset = x + Matrix.x - left_x;
    return Math.round(x_offset / resolution / d);
  }

  /**
   * Checks if a column and row index are within the flow field bounds.
   * @param {number} col - The column index.
   * @param {number} row - The row index.
   * @returns {boolean} - True if the indices are within bounds, false otherwise.
   */
  static isIn(col, row) {
    return col >= 0 && row >= 0 && col < num_columns && row < num_rows;
  }
}

// =============================================================================
// Section: VectorField
// =============================================================================

/**
 * Represents the state of the vector field.
 * @property {boolean} isActive - Indicates if the vector field is active.
 * @property {string|null} current - The name of the currently active vector field.
 */
State.field = {
  isActive: false,
  current: null,
};

// Internal variables for field configuration
let list = new Map();
let resolution, left_x, top_y, num_columns, num_rows;

/**
 * Initializes the field grid and sets up the vector field's structure based on the renderer's dimensions.
 */
export function createField() {
  resolution = Cwidth * 0.01; // Determine the resolution of the field grid
  left_x = -0.5 * Cwidth; // Left boundary of the field
  top_y = -0.5 * Cheight; // Top boundary of the field
  num_columns = Math.round((2 * Cwidth) / resolution); // Number of columns in the grid
  num_rows = Math.round((2 * Cheight) / resolution); // Number of columns in the grid
  addStandard(); // Add default vector field
  BleedField.genField(); // Generate the bleed field for watercolor fills
}

/**
 * Retrieves the field values for the current vector field.
 * @returns {Float32Array[]} The current vector field grid.
 */
function flow_field() {
  return list.get(State.field.current).field;
}

/**
 * Regenerates the current vector field using its associated generator function.
 * @param {number} [t=0] - An optional time parameter that can affect field generation.
 */
export function refreshField(t = 0) {
  list.get(State.field.current).field = list
    .get(State.field.current)
    .gen(t, genField());
}

/**
 * Generates an empty field array.
 * Reuses existing arrays to reduce memory allocation overhead.
 * @returns {Float32Array[]} Empty vector field grid.
 */
function genField(d = 1) {
  return new Array(num_columns / d)
    .fill(null)
    .map(() => new Float32Array(num_rows / d));
}

/**
 * Activates a specific vector field by name, ensuring it's ready for use.
 * @param {string} a - The name of the vector field to activate.
 */
export function field(a) {
  if (!list.has(a)) {
    throw new Error(`Field "${name}" does not exist.`);
  }
  State.field.isActive = true; // Mark the field framework as active
  State.field.current = a; // Update the current field
}

/**
 * Deactivates the current vector field.
 */
export function noField() {
  State.field.isActive = false;
}

/**
 * Adds a new vector field to the field list with a unique name and a generator function.
 * @param {string} name - The unique name for the new vector field.
 * @param {Function} funct - The function that generates the field values.
 */
export function addField(name, funct) {
  list.set(name, { gen: funct }); // Map the field name to its generator function
  list.get(name).field = list.get(name).gen(0, genField()); // Generate the initial field
}

/**
 * Retrieves a list of all available vector field names.
 * @returns {string[]} An array of all the field names.
 */
export function listFields() {
  return Array.from(list.keys());
}

/**
 * Adds standard predefined vector fields to the list with unique behaviors.
 */
function addStandard() {
  addField("hand", function (t, field) {
    const baseSize = rr(0.2, 0.8);
    const baseAngle = randInt(5, 10);
    const timeFactor = t * 0.1;

    for (let column = 0; column < num_columns; column++) {
      const columnNoise = column * 0.1 + timeFactor;
      for (let row = 0; row < num_rows; row++) {
        const addition = randInt(15, 25);
        const angle = baseAngle * sin(baseSize * row * column + addition);
        const noise_val = noise(columnNoise, row * 0.1 + timeFactor);
        field[column][row] = 0.5 * angle * cos(t) + noise_val * baseAngle * 0.5;
      }
    }
    return field;
  });
  addField("seabed", function (t, field) {
    const baseSize = rr(0.4, 0.8);
    const baseAngle = randInt(18, 26);
    const timeFactor = t * 0.1;

    for (let column = 0; column < num_columns; column++) {
      const columnNoise = column * 0.1 + timeFactor;
      for (let row = 0; row < num_rows; row++) {
        const addition = randInt(15, 20);
        const angle = baseAngle * sin(baseSize * row * column + addition);
        field[column][row] = 1.1 * angle * cos(t);
      }
    }
    return field;
  });
}

// =============================================================================
// Section: BleedField
// =============================================================================

/**
 * The `BleedField` object manages a secondary field used for blending effects,
 * such as watercolor-like bleeding. It provides methods to generate, update,
 * and retrieve field values.
 */
export const BleedField = {

  d: 4, // The density of the bleed field

  /**
   * Generates the primary and temporary fields for the bleed effect.
   * Reuses existing arrays to reduce memory allocation overhead.
   */
  genField() {
    this.field = genField(this.d); // Primary field
    this.fieldTemp = genField(this.d); // Temporary field for intermediate calculations
  },

  /**
   * Retrieves the value of the bleed field at a specific position.
   * Optionally updates the field with a new value.
   *
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} [value=false] - The value to set at the position (optional).
   * @returns {number} - The current or updated value at the position.
   */
  get(x, y, value = false) {
    const col = Position.getColIndex(x, this.d);
    const row = Position.getRowIndex(y, this.d);
    // Retrieve the current value at the position
    const current = this.field?.[col]?.[row] ?? 0;
    if (value) {
      // Update the temporary field with the maximum of the current and new values
      const biggest = Math.max(current, value);
      const tempValue = (this.fieldTemp[col]?.[row] ?? 0) * 0.75;
      this.fieldTemp[col][row] = Math.max(biggest, tempValue);
      return biggest;
    }
    return current;
  },

  /**
   * Updates the primary field with the values from the temporary field.
   * This operation is performed in-place to avoid unnecessary memory allocation.
   */
  update() {
    for (let col = 0; col < num_columns / this.d; col++) {
      for (let row = 0; row < num_rows / this.d; row++) {
        this.field[col][row] = this.fieldTemp[col][row];
      }
    }
  },

  /**
   * Saves the current state of the primary and temporary fields.
   * This allows the fields to be restored later.
   */
  save() {
    this.A = cloneArray(this.field);
    this.B = cloneArray(this.fieldTemp);
  },

  /**
   * Restores the previously saved state of the primary and temporary fields.
   */
  restore() {
    this.field = this.A;
    this.fieldTemp = this.B;
  },
};
