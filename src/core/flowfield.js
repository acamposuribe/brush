import { Mix, isMixReady, Cwidth, Cheight, State } from "./color.js";
import { randInt, noise, rr, sin, cos } from "./utils.js";

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
    isFieldReady();
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
    this.colIdx = Position.getColIndex(x);
    this.rowIdx = Position.getRowIndex(y);
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
      ? Position.isIn(this.colIdx, this.rowIdx)
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
      ? flow_field()[this.colIdx][this.rowIdx] * State.field.wiggle
      : 0;
  }

  /**
   * Moves the position along the flow field by a certain length.
   * @param {number} _length - The length to move along the field.
   * @param {number} _dir - The direction of movement.
   * @param {number} _step_length - The length of each step.
   */
  moveTo(_dir, _length, _step_length = 1) {
    this.movePos(_dir, _length, _step_length)
  }

  /**
   * Plots a point to another position within the flow field, following a Plot object
   * @param {Position} _plot - The Plot path object.
   * @param {number} _length - The length to move towards the target position.
   * @param {number} _step_length - The length of each step.
   * @param {number} _scale - The scaling factor for the plotting path.
   */
  plotTo(_plot, _length, _step_length, _scale = 1) {
    this.movePos(_plot, _length, _step_length, _scale)
  }

  movePos(_dirPlot, _length, _step, _scale = false) {
    const scaleFactor = _scale || 1;
    if (!this.isIn()) {
      this.plotted += _step / scaleFactor;
      return;
    }
    for (let i = 0; i < _length / _step; i++) {
      const angle = this.angle() - (_scale ? _dirPlot.angle(this.plotted) : _dirPlot);
      // Calculate new position
      this.update(
        this.x + _step * cos(angle),
        this.y + _step * sin(angle)
      );
      this.plotted += _step / scaleFactor;
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
  wiggle: 1,
};

// Internal variables for field configuration
let list = new Map();
let resolution, left_x, top_y, num_columns, num_rows;

/**
 * Initializes the field grid and sets up the vector field's structure based on the renderer's dimensions.
 */
function createField() {
  resolution = Cwidth * 0.01; // Determine the resolution of the field grid
  left_x = -0.5 * Cwidth; // Left boundary of the field
  top_y = -0.5 * Cheight; // Top boundary of the field
  num_columns = Math.round((2 * Cwidth) / resolution); // Number of columns in the grid
  num_rows = Math.round((2 * Cheight) / resolution); // Number of columns in the grid
  addStandard(); // Add default vector field
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
  const currentField = list.get(State.field.current);
  currentField.field = currentField.gen(t, genField());
}

/**
 * Generates an empty field array.
 * Reuses existing arrays to reduce memory allocation overhead.
 * @returns {Float32Array[]} Empty vector field grid.
 */
function genField() {
  return new Array(num_columns)
    .fill(null)
    .map(() => new Float32Array(num_rows));
}

/**
 * Activates a specific vector field by name, ensuring it's ready for use.
 * @param {string} a - The name of the vector field to activate.
 */
export function field(a) {
  if (!State.field.wiggle) { State.field.wiggle = 1; } // Set default wiggle value
  isFieldReady();
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
  isFieldReady();
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
  isFieldReady();
  return Array.from(list.keys());
}

export function wiggle(a = 1) {
  field("hand");
  State.field.wiggle = a;
}

/**
 * Adds standard predefined vector fields to the list with unique behaviors.
 */
function addStandard() {
  addField("hand", function (t, field) {
    const baseSize = rr(0.2, 0.8);
    const baseAngle = randInt(5, 10);
    for (let column = 0; column < num_columns; column++) {
      const columnNoise = column;
      for (let row = 0; row < num_rows; row++) {
        const addition = randInt(15, 25);
        const angle = 0.5 * baseAngle * sin(baseSize * row * column + addition);
        const noise_val = noise(columnNoise, row);
        field[column][row] = 0.2 * angle * cos(t) + noise_val * baseAngle * 0.7;
      }
    }
    return field;
  });
}