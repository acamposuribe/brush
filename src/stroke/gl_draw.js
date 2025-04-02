import earcut from "earcut";
import { Cwidth, Cheight } from "../core/config.js";
import { Mix } from "../core/color.js";
import { isMixReady } from "../core/color.js";
import { Matrix } from "../core/flowfield.js";

let isLoaded = false;
export function isReady() {
  if (!isLoaded) {
    isMixReady();
    gl = Mix.gl;
    matrix = createOrthographicMatrix(Cwidth, Cheight);
    prepareGL();
    isLoaded = true;
  }
}

// Vertex shader (GLSL ES 300)
const vertexShaderSource = `#version 300 es
in vec2 a_position;
in float a_radius;
in float a_alpha;
uniform mat4 u_matrix;
out float v_alpha;
void main() {
  gl_Position = u_matrix * vec4(a_position, 0, 1);
  v_alpha = a_alpha;
  gl_PointSize = a_radius * 2.0;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec3 u_color;                   // Base color.
uniform bool u_drawSquare;              // For point sprites.
uniform bool u_usePointSprite;          // true for point sprites; false for triangles (polygons).
in float v_alpha;
out vec4 outColor;
void main() {
  // When using point sprites (circles/squares), use gl_PointCoord.
  if(u_usePointSprite) {
    if(u_drawSquare) {
      outColor = vec4(u_color * v_alpha, v_alpha);
    } else {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float d = length(coord);
      if (d > 0.5) {
        discard;
      }
      float edgeFactor = smoothstep(0.45, 0.5, d);
      outColor = vec4(u_color * v_alpha, v_alpha * (1.0 - edgeFactor));
    }
  } else {
    // For polygon triangles, simply output a uniform fill.
    outColor = vec4(u_color * v_alpha, v_alpha);
  }
}
`;

/**
 * Compiles a shader.
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * Creates a WebGL2 program.
 */
function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error: " + gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

let program,
  positionLoc,
  radiusLoc,
  alphaLoc,
  matrixLoc,
  colorLoc,
  drawSquareLoc,
  gl,
  matrix,
  usePointSpriteLoc;

function prepareGL() {
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  // Enable blending for translucency.
  gl.enable(gl.BLEND);

  // Use additive blending so that new fragments add to the alpha.
  gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
  gl.blendEquation(gl.FUNC_ADD);

  // Look up attribute/uniform locations.
  positionLoc = gl.getAttribLocation(program, "a_position");
  radiusLoc = gl.getAttribLocation(program, "a_radius");
  alphaLoc = gl.getAttribLocation(program, "a_alpha");
  matrixLoc = gl.getUniformLocation(program, "u_matrix");
  colorLoc = gl.getUniformLocation(program, "u_color");
  drawSquareLoc = gl.getUniformLocation(program, "u_drawSquare");
  usePointSpriteLoc = gl.getUniformLocation(program, "u_usePointSprite");
}

// Create an orthographic projection matrix mapping canvas coordinates to clip space.
function createOrthographicMatrix(width, height) {
  return new Float32Array([
    2 / width,
    0,
    0,
    0,
    0,
    -2 / height,
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
 * Draws circles using WebGL2. Each circle has its own alpha.
 */
export function glDraw(isErase = false) {
  if (isErase) {
    // Set BLEND to destination-out for erasing.
    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
  }

  // Create and bind VAO.
  const vao = gl.createVertexArray(isSquare);
  gl.bindVertexArray(vao);
  gl.uniform1i(usePointSpriteLoc, 1); // true

  // Convert the circle objects into a transferable Float32Array.
  const circleData = new Float32Array(circles.length * 4);
  for (let i = 0; i < circles.length; i++) {
    const offset = i * 4;
    circleData[offset + 0] = circles[i].x;
    circleData[offset + 1] = circles[i].y;
    circleData[offset + 2] = circles[i].radius;
    circleData[offset + 3] = circles[i].alpha;
  }
  circles = [];

  // Create and upload the vertex buffer.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, circleData, gl.STATIC_DRAW);

  // Each circle now has 4 floats: x, y, radius, alpha.
  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
  // a_position (vec2) from offset 0.
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, stride, 0);
  // a_radius (float) at offset 2 * sizeof(float).
  gl.enableVertexAttribArray(radiusLoc);
  gl.vertexAttribPointer(
    radiusLoc,
    1,
    gl.FLOAT,
    false,
    stride,
    2 * Float32Array.BYTES_PER_ELEMENT
  );
  // a_alpha (float) at offset 3 * sizeof(float).
  gl.enableVertexAttribArray(alphaLoc);
  gl.vertexAttribPointer(
    alphaLoc,
    1,
    gl.FLOAT,
    false,
    stride,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  // Set uniforms: transformation matrix and base RGB color.
  gl.uniformMatrix4fv(matrixLoc, false, matrix);
  gl.uniform3fv(colorLoc, new Float32Array([1.0, 0.0, 0.0]));
  // Set the boolean uniform for shape type.
  gl.uniform1i(drawSquareLoc, isSquare ? 1 : 0);

  // Draw the circles in one call.
  const circleCount = circleData.length / 4;
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.POINTS, 0, circleCount);
  gl.bindVertexArray(null);

  gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
}

let circles = [];
let isSquare = false;

export function circle(x, y, diameter, alpha) {
  isReady();
  const radius = diameter / 2;
  circles.push({
    x: x + Matrix.x,
    y: y + Matrix.y,
    radius,
    alpha: alpha / 100,
  });
  isSquare = false;
}

export function square(x, y, size, alpha) {
  isReady();
  const radius = size / 2 / 1.2;
  circles.push({
    x: x + Matrix.x,
    y: y + Matrix.y,
    radius,
    alpha: alpha / 100,
  });
  isSquare = true;
}

// Global array to accumulate polygon data.
let polygons = [];

/**
 * Queues a polygon for drawing.
 * @param {number[]} points Flat array of vertices: [x0, y0, x1, y1, ..., xN, yN]
 * @param {number} alpha   The alpha value (0-100 scale) for the polygon.
 */
export function polygon(points, alpha) {
  isReady();
  const flatPoints = [];
  points.forEach((p) => {
    flatPoints.push(p.x + Matrix.x, p.y + Matrix.y);
  });
  // Store the polygon with its alpha (normalized to [0, 1]).
  polygons.push({
    points: flatPoints, // expected as flat [x, y, x, y, ...]
    alpha: alpha / 100,
  });
}

/**
 * Draws the queued irregular polygons.
 * It uses earcut to triangulate each polygon, then draws the resulting triangles.
 */
export function glDrawPolygons() {
  if (!polygons.length) return;
  gl.uniform1i(usePointSpriteLoc, 0); // false

  // For each queued polygon...
  polygons.forEach((poly) => {
    // Use earcut to get indices for triangulation.
    // poly.points must be a flat array of coordinates.
    const indices = earcut(poly.points);

    // Build a vertex array with 4 floats per vertex: [x, y, dummyRadius, alpha].
    // We need to supply a dummy radius since our current vertex shader expects it.
    const dummyRadius = 1.0;
    const vertexCount = indices.length;
    const vertexData = new Float32Array(vertexCount * 4);
    for (let i = 0; i < vertexCount; i++) {
      // Each index refers to a vertex in poly.points (2 values per vertex).
      const vi = indices[i] * 2;
      vertexData[i * 4 + 0] = poly.points[vi]; // x
      vertexData[i * 4 + 1] = poly.points[vi + 1]; // y
      vertexData[i * 4 + 2] = dummyRadius; // dummy radius
      vertexData[i * 4 + 3] = poly.alpha; // polygon alpha
    }

    // Create and bind a new VAO for the polygon.
    const polyVAO = gl.createVertexArray();
    gl.bindVertexArray(polyVAO);

    // Create and upload the vertex buffer.
    const polyBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, polyBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    // a_position (vec2) from offset 0.
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, stride, 0);
    // a_radius (float) at offset 2 * sizeof(float).
    gl.enableVertexAttribArray(radiusLoc);
    gl.vertexAttribPointer(
      radiusLoc,
      1,
      gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    // a_alpha (float) at offset 3 * sizeof(float).
    gl.enableVertexAttribArray(alphaLoc);
    gl.vertexAttribPointer(
      alphaLoc,
      1,
      gl.FLOAT,
      false,
      stride,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    // Set uniforms (using same projection matrix & color; color isn’t critical if only alpha matters).
    gl.uniformMatrix4fv(matrixLoc, false, matrix);
    gl.uniform3fv(colorLoc, new Float32Array([1.0, 0.0, 0.0]));
    // u_drawSquare is not used for polygons.
    gl.uniform1i(drawSquareLoc, 0);

    // Bind the VAO and draw the triangles.
    gl.bindVertexArray(polyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    gl.bindVertexArray(null);

    // Clean up the buffer and VAO.
    gl.deleteBuffer(polyBuffer);
    gl.deleteVertexArray(polyVAO);
  });

  // Clear the polygons array after drawing.
  polygons = [];
}
