// =============================================================================
// Module: GL Draw
// =============================================================================
/**
 * The GL Draw module provides functions for rendering shapes (circles and squares)
 * using WebGL2. It initializes the WebGL context and shader programs, prepares buffers,
 * and implements drawing routines based on queued drawing primitives. The module uses
 * an orthographic projection to map canvas coordinates to clip space and supports adjustable
 * blending for translucent effects.
 */

import { Mix, Cwidth, Cheight } from "../core/color.js";
import { isMixReady } from "../core/color.js";
import { Matrix } from "../core/flowfield.js";
import { createProgram } from "../core/gl/utils.js";

// =============================================================================
// Section: Initialization and Setup
// =============================================================================

let isLoaded = false;
let gl, matrix;

/**
 * Initializes WebGL objects if not done already.
 */
export function isReady() {
  if (!isLoaded) {
    isMixReady();
    gl = Mix.gl;
    matrix = createOrthographicMatrix(Cwidth, Cheight);
    prepareGL();
    isLoaded = true;
  }
}

/**
 * Creates an orthographic projection matrix that maps canvas coordinates to clip space.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 * @returns {Float32Array} The projection matrix.
 */
function createOrthographicMatrix(w, h) {
  return new Float32Array([
    2 / w,
    0,
    0,
    0,
    0,
    -2 / h,
    0,
    0,
    0,
    0,
    1,
    0,
    -1,
    1,
    0,
    1,
  ]);
}

/**
 * Sets up the shader program and caches attribute and uniform locations.
 */
function prepareGL() {
  // Create and use shader
  const program = createProgram(gl, vsSource, fsSource);
  gl.useProgram(program);
  // Enable blending for translucency.
  gl.enable(gl.BLEND);
  // Use additive blending so that new fragments add to the alpha.
  gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
  // Define attributes and uniform locations
  ["a_position", "a_radius", "a_alpha"].forEach(
    (n) => (Attr[n] = gl.getAttribLocation(program, n))
  );
  ["u_matrix"].forEach(
    (n) => (Frag[n] = gl.getUniformLocation(program, n))
  );
}

// =============================================================================
// Section: Shader Programs
// =============================================================================

/**
 * Vertex shader: Expects a_position (vec2), a_radius (float), and a_alpha (float).
 * Computes gl_Position from u_matrix and sets gl_PointSize.
 */
const vsSource = `#version 300 es
in vec2 a_position;in float a_radius,a_alpha;uniform mat4 u_matrix;out float v_alpha;void main(){gl_Position=u_matrix*vec4(a_position,0,1);v_alpha=a_alpha;gl_PointSize=a_radius*2.;}`;

/**
 * Fragment shader: When u_drawSquare is true, outputs a square.
 * Otherwise, uses gl_PointCoord to create a circular mask.
 */
const fsSource = `#version 300 es
precision highp float;
in float v_alpha;
out vec4 outColor;
void main(){
    vec2 v = gl_PointCoord - vec2(0.5);
    float e = length(v);
    // Compute the derivative of the distance to get a dynamic edge width.
    float afwidth = fwidth(e);
    // Use smoothstep based on the adaptive width.
    float alphaFactor = 1.0 - smoothstep(0.5 - afwidth, 0.5 + afwidth, e);
    if(alphaFactor < 0.01)
      discard;
    outColor = vec4(vec3(1,0,0) * v_alpha, v_alpha * alphaFactor);
}
`;

// Attrib & uniform caches.
const Attr = {},
  Frag = {};

// =============================================================================
// Section: Buffer Creation & Drawing Primitives
// =============================================================================

/**
 * Helper: Creates a VAO, uploads vertex data, and sets attribute pointers.
 * @param {Float32Array} data - Vertex data.
 * @param {Array} attribs - Array of objects {name, size, offset}.
 * @param {number} stride - Stride in bytes.
 * @returns {object} Contains {vao, buf}.
 */
function createAndBindBuffer(data, attribs, stride) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  attribs.forEach((a) => {
    const loc = Attr[a.name];
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, a.size, gl.FLOAT, false, stride, a.offset);
  });
  return { vao, buf };
}

/**
 * Draws all queued circles (each with its own alpha) using WebGL2.
 *
 * This function builds a Float32Array containing four values per circle:
 *   [x, y, radius, alpha]
 *
 * The vertex shader (vsSource) expects:
 *   - a_position: a vec2 containing the x,y position for each circle.
 *   - a_radius: a float that is used to determine gl_PointSize (scaled by 2).
 *   - a_alpha: a float used to control the alpha (transparency) of the circle.
 *
 * The function then uploads this array into a vertex buffer and instructs WebGL
 * to draw the circles as GL_POINTS. The blending mode set in prepareGL() handles
 * translucency so that overlapping circles properly accumulate alpha.
 *
 * After drawing, the circles queue is cleared.
 */
export function glDraw() {
  // Define the stride in bytes: 4 floats per circle.
  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
  // Build a contiguous array of circle vertex data:
  // Each circle contributes: x, y, radius, alpha.
  const circleData = new Float32Array(circles.length * 4);
  // Iterate over each circle in the queue and add its data to circleData.
  circles.forEach((c, i) => {
    const offset = i * 4;
    // Set circle data: position, radius and normalized alpha.
    circleData.set([c.x, c.y, c.radius, c.alpha], offset);
  });
  // Clear the circles array to avoid redrawing on subsequent calls.
  circles = [];
  // Create and bind a vertex array object (VAO) along with the associated buffer.
  // The helper function 'createAndBindBuffer' sets up the attributes using the
  // 'Attr' locations previously determined.
  const { vao, buf } = createAndBindBuffer(
    circleData,
    [
      { name: "a_position", size: 2, offset: 0 },
      { name: "a_radius", size: 1, offset: 2 * Float32Array.BYTES_PER_ELEMENT },
      { name: "a_alpha", size: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT },
    ],
    stride
  );
  // Set the uniform for the projection matrix (u_matrix).
  gl.uniformMatrix4fv(Frag.u_matrix, false, matrix);
  // Bind the VAO containing our prepared buffer data.
  gl.bindVertexArray(vao);
  // Draw the circles as points.
  //   The number of points equals the number of circles (circleData.length / 4).
  gl.drawArrays(gl.POINTS, 0, circleData.length / 4);
  gl.bindVertexArray(null);
  gl.deleteBuffer(buf);
  gl.deleteVertexArray(vao);
}

let circles = [];

// =============================================================================
// Section: Public Drawing Methods
// =============================================================================

/**
 * Queues a circle to be drawn.
 * @param {number} x - x-coordinate.
 * @param {number} y - y-coordinate.
 * @param {number} diameter - Diameter of the circle.
 * @param {number} alpha - Opacity (0-100).
 */
export function circle(x, y, diameter, alpha) {
  isReady();
  const radius = diameter / 2;
  circles.push({
    x: x + Matrix.x,
    y: y + Matrix.y,
    radius,
    alpha: alpha / 100,
  });
}