import { Cwidth, Cheight, State } from "./config.js";
import { Mix, isMixReady } from "./color.js";
import { randInt, noise, map, rr, sin, cos, cloneArray } from "./utils.js";

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
  isFieldReady()
  Mix.ctx.translate(x, y);
  let m = Mix.ctx.getTransform();
  Matrix.x = m.e;
  Matrix.y = m.f;
}

/**
 * Captures the desired rotation.
 */
export function rotate(a = 0) {
  isFieldReady()
  Mix.ctx.rotate(a);
}

/**
 * Object to perform scale operations
 */
export function scale(a) {
  isFieldReady()
  Mix.ctx.scale(a, a);
} 

let isLoaded = false;

export function isFieldReady() {
  if (!isLoaded) {
    isMixReady();
    createField();
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

  static getRowIndex (y) {
    const y_offset = y + Matrix.y - top_y;
    return Math.round(y_offset / resolution);
  }

  static getColIndex (x) {
    const x_offset = x + Matrix.x - left_x;
    return Math.round(x_offset / resolution);
  }

  static isIn (col, row) {
    return col >= 0 &&
          row >= 0 &&
          col < num_columns &&
          row < num_rows
  }

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
      this.column_index = Position.getColIndex(x)
      this.row_index = Position.getRowIndex(y)
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
      : this.isInCanvas(this.x,this.y);
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
  plotTo(_plot, _length, _step_length, _scale, bool) {
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

State.field = {
  isActive: false,
  current: null
}

let list = new Map();

let resolution, left_x, top_y, num_columns, num_rows;

export function FieldState() {
  return { ...State.field };
}

export function FieldSetState(state) {
  State.field = { ...state }
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
  addStandard(); // Add default vector field
  BleedField.genField();
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
  list.get(State.field.current).field = list.get(State.field.current).gen(t, genField());
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
  // Check if field exists
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
  list.get(name).field = list.get(name).gen(0, genField());
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
    this.brush = genField().map((row) => row.map(() => rr(-0.25, 0.25)));
  },
  get(x, y, value = false) {
    const col = Position.getColIndex(x)
    const row = Position.getRowIndex(y)
    const current = this.field?.[col]?.[row] ?? 0;
    if (value) {
      const biggest = Math.max(current, value);
      const tempValue = (this.fieldTemp[col]?.[row] ?? 0) * 0.75;
      this.fieldTemp[col][row] = Math.max(biggest, tempValue);
      return biggest;
  }
    return current;
  },
  bField(Pos) {
    return Pos.isIn() ? this.brush[Pos.column_index][Pos.row_index] : 0;
  },
  update() {
    this.field = cloneArray(this.fieldTemp);
  },
  increase(x, y) {
    const col = Position.getColIndex(x)
    const row = Position.getRowIndex(y)
    if (!Position.isIn(col, row)) return;
    this.brush[col][row] = rr(0.2, 0.5);
  },
  save() {
    this.A = cloneArray(this.field)
    this.B = cloneArray(this.fieldTemp)
    this.C = cloneArray(this.brush)
  },
  restore() {
    this.field = this.A
    this.fieldTemp = this.B
    this.brush = this.C
  }
};
