import { Cwidth, Cheight, _ensureReady } from "./config.js";
import { Mix } from "./color.js";
import { spacing } from "./brush.js";
import { randInt, noise, map, rr, sin, cos } from "./utils.js";

// =============================================================================
// Section: Matrix transformations
// =============================================================================

/**
 * Object to store matrix translation and rotation operations
 */
export const Matrix = { x: 0, y: 0 };

/**
 * Translate function
 */
export function translate(x, y) {
  Mix.ctx.translate(x, y);
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;
}

/**
 * Captures the desired rotation.
 */
export function rotate(a = 0) {
  Mix.ctx.rotate(a);
}

/**
 * Object to perform scale operations
 */
export function scale(a) {
  Mix.ctx.scale(a, a);
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
    this.plotted = 0;
  }

  /**
   * Updates the position's coordinates and calculates its offsets and indices within the flow field if active.
   * @param {number} x - The new x-coordinate.
   * @param {number} y - The new y-coordinate.
   */
  update(x, y) {
    (this.x = x), (this.y = y);
    if (isActive || Fill.isActive) {
      this.x_offset = this.x + Matrix.x - left_x;
      this.y_offset = this.y + Matrix.y - top_y;
      this.column_index = Math.round(this.x_offset / resolution);
      this.row_index = Math.round(this.y_offset / resolution);
    }
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
    return isActive
      ? this.column_index >= 0 &&
          this.row_index >= 0 &&
          this.column_index < num_columns &&
          this.row_index < num_rows
      : this.isInCanvas();
  }

  /**
   * Checks if the position is within reasonable bounds (+ half canvas on each side).
   * @returns {boolean} - True if the position is within bounds, false otherwise.
   */
  isInCanvas() {
    let w = Cwidth,
      h = Cheight;
    let x = this.x + Matrix.x;
    let y = this.y + Matrix.y;
    return x >= -0.3 * w && x <= 1.3 * w && y >= -0.3 * h && y <= 1.3 * h;
  }

  /**
   * Calculates the angle of the flow field at the position's current coordinates.
   * @returns {number} - The angle in radians, or 0 if the position is not in the flow field or if the flow field is not active.
   */
  angle() {
    return this.isIn() && isActive
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
  moveTo(_length, _dir, _step_length = spacing(), isFlow = true) {
    if (this.isIn()) {
      let a, b;
      if (!isFlow) {
        a = cos(-_dir);
        b = sin(-_dir);
      }
      for (let i = 0; i < _length / _step_length; i++) {
        if (isFlow) {
          let angle = this.angle();
          a = cos(angle - _dir);
          b = sin(angle - _dir);
        }
        let x_step = _step_length * a,
          y_step = _step_length * b;
        this.plotted += _step_length;
        this.update(this.x + x_step, this.y + y_step);
      }
    } else {
      this.plotted += _step_length;
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
    if (this.isIn()) {
      const inverse_scale = 1 / _scale;
      for (let i = 0; i < _length / _step_length; i++) {
        let current_angle = this.angle();
        let plot_angle = _plot.angle(this.plotted);
        let x_step = _step_length * cos(current_angle - plot_angle);
        let y_step = _step_length * sin(current_angle - plot_angle);
        this.plotted += _step_length * inverse_scale;
        this.update(this.x + x_step, this.y + y_step);
      }
    } else {
      this.plotted += _step_length / scale;
    }
  }
}

// =============================================================================
// Section: VectorField
// =============================================================================

let isActive = false;
let current = null;
let list = new Map();

let resolution, left_x, top_y, num_columns, num_rows;

export function FieldState() {
  return { isActive, current };
}

export function FieldSetState(state) {
  isActive = state.isActive;
  current = state.current;
}

/**
 * Initializes the field grid and sets up the vector field's structure based on the renderer's dimensions.
 */
export function createField() {
  resolution = Cwidth * 0.01; // Determine the resolution of the field grid
  left_x = -0.5 * Cwidth; // Left boundary of the field
  top_y = -0.5 * Cheight; // Top boundary of the field
  num_columns = Math.round((2 * Cwidth) / resolution); // Number of columns in the grid
  num_rows = Math.round((2 * Cheight) / resolution); // Number of columns in the grid
  addStandard(); // Add default vector fields
  BleedField.genField();
}

/**
 * Retrieves the field values for the current vector field.
 * @returns {Float32Array[]} The current vector field grid.
 */
function flow_field() {
  return list.get(current).field;
}

/**
 * Regenerates the current vector field using its associated generator function.
 * @param {number} [t=0] - An optional time parameter that can affect field generation.
 */
export function refreshField(t = 0) {
  list.get(current).field = list.get(current).gen(t, genField());
}

/**
 * Generates empty field array using its associated generator function.
 * @returns {Float32Array[]} Empty vector field grid.
 */
function genField() {
  let grid = new Array(num_columns); // Initialize the field array
  for (let i = 0; i < num_columns; i++) {
    grid[i] = new Float32Array(num_rows);
  }
  return grid;
}

/**
 * Activates a specific vector field by name, ensuring it's ready for use.
 * @param {string} a - The name of the vector field to activate.
 */
export function field(a) {
  _ensureReady();
  // Check if field exists
  isActive = true; // Mark the field framework as active
  current = a; // Update the current field
}

/**
 * Deactivates the current vector field.
 */
export function noField() {
  isActive = false;
}

/**
 * Adds a new vector field to the field list with a unique name and a generator function.
 * @param {string} name - The unique name for the new vector field.
 * @param {Function} funct - The function that generates the field values.
 */
export function addField(name, funct) {
  _ensureReady();
  list.set(name, { gen: funct }); // Map the field name to its generator function
  current = name; // Set the newly added field as the current one to be used
  refreshField(); // Refresh the field values using the generator function
}

/**
 * Retrieves a list of all available vector field names.
 * @returns {Iterator<string>} An iterator that provides the names of all the fields.
 */
export function listFields() {
  return Array.from(list.keys());
}

/**
 * Adds standard predefined vector fields to the list with unique behaviors.
 */
function addStandard() {
  addField("curved", function (t, field) {
    let angleRange = randInt(-20, -10);
    if (randInt(0, 100) % 2 == 0) {
      angleRange = angleRange * -1;
    }
    for (let column = 0; column < num_columns; column++) {
      for (let row = 0; row < num_rows; row++) {
        let noise_val = noise(column * 0.01 + t * 0.03, row * 0.01 + t * 0.03);
        let angle = map(noise_val, 0.0, 1.0, -angleRange, angleRange);
        field[column][row] = angle;
      }
    }
    return field;
  });
  addField("hand", function (t, field) {
    let baseSize = rr(0.2, 0.8);
    let baseAngle = randInt(5, 10);

    for (let column = 0; column < num_columns; column++) {
      for (let row = 0; row < num_rows; row++) {
        let addition = randInt(15, 25);
        let angle = baseAngle * sin(baseSize * row * column + addition);

        let noise_val = noise(column * 0.1 + t, row * 0.1 + t);

        field[column][row] = 0.5 * angle * cos(t) + noise_val * angle;
      }
    }
    return field;
  });
  addField("seabed", function (t, field) {
    let baseSize = rr(0.4, 0.8);
    let baseAngle = randInt(18, 26);
    for (let column = 0; column < num_columns; column++) {
      for (let row = 0; row < num_rows; row++) {
        let addition = randInt(15, 20);
        let angle = baseAngle * sin(baseSize * row * column + addition);
        field[column][row] = 1.1 * angle * cos(t);
      }
    }
    return field;
  });
}

// =============================================================================
// Section: BleedField
// =============================================================================

export const BleedField = {
  genField() {
    this.field = genField();
    this.fieldTemp = genField();
    this.brush = genField().map((row) => row.map(() => rr(0, 0.25)));
  },
  get(x, y, value = false) {
    const Pos = new Position(x, y);
    if (!Pos.isIn()) return value ?? 0;
    const { column_index: col, row_index: row } = Pos;
    const current = this.field?.[col]?.[row];
    if (value) {
      const biggest = Math.max(current, value);
      this.fieldTemp[col][row] = Math.max(
        biggest,
        (this.fieldTemp[col]?.[row] ?? 0) * 0.75
      );
      return biggest;
    }
    return current;
  },
  bField(Pos) {
    return Pos.isIn() ? this.brush[Pos.column_index][Pos.row_index] : 0;
  },
  update() {
    this.field = this.fieldTemp.slice();
  },
  increase(x, y) {
    const Pos = new Position(x, y);
    if (!Pos.isIn()) return;
    this.brush[Pos.column_index][Pos.row_index] = rr(0.2, 0.5);
  },
};
