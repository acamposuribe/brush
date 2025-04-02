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
uniform vec3 u_color; // RGB color uniform; per-vertex alpha comes from v_alpha.
uniform bool u_drawSquare; // If true, draw squares; if false, draw circles.
in float v_alpha;
out vec4 outColor;
void main() {
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
  matrix;

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
export function glDraw() {
  // Create and bind VAO.
  const vao = gl.createVertexArray(isSquare);
  gl.bindVertexArray(vao);

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
}

let circles = [];
let isSquare = false;

export function circle(x, y, diameter, alpha) {
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
  const radius = size / 2 / 1.2;
  circles.push({
    x: x + Matrix.x,
    y: y + Matrix.y,
    radius,
    alpha: alpha / 100,
  });
  isSquare = true;
}
