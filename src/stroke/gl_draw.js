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
const vsSource = `#version 300 es
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

const fsSource = `#version 300 es
precision highp float;
uniform bool u_drawSquare;
in float v_alpha;
out vec4 outColor;
void main() {
    if(u_drawSquare) {
      outColor = vec4(vec3(1.,0.,0.) * v_alpha, v_alpha);
    } else {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float d = length(coord);
      if (d > 0.5) {
        discard;
      }
      float edgeFactor = smoothstep(0.45, 0.5, d);
      outColor = vec4(vec3(1.,0.,0.) * v_alpha, v_alpha * (1.0 - edgeFactor));
    }
}
`;

function createProgram(gl, vert, frag) {
  const p = gl.createProgram();
  for (let [t, src] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ]) {
    const s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  return p;
}

let gl, matrix;
const Attr = {};
const Frag = {};

function prepareGL() {
  // Create and use shader
  const program = createProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

    // Enable blending for translucency.
    gl.enable(gl.BLEND);

    // Use additive blending so that new fragments add to the alpha.
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquation(gl.FUNC_ADD);

  // Define attributes and uniform locations
  let attr = [
    "a_position",
    "a_radius",
    "a_alpha",
  ];
  for (let a of attr) Attr[a] = gl.getAttribLocation(program, a);
  let uniforms = [
    "u_matrix",
    "u_drawSquare",
  ]
  for (let u of uniforms) Frag[u] = gl.getUniformLocation(program, u);
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
  gl.enableVertexAttribArray(Attr.a_position);
  gl.vertexAttribPointer(Attr.a_position, 2, gl.FLOAT, false, stride, 0);
  // a_radius (float) at offset 2 * sizeof(float).
  gl.enableVertexAttribArray(Attr.a_radius);
  gl.vertexAttribPointer(
    Attr.a_radius,
    1,
    gl.FLOAT,
    false,
    stride,
    2 * Float32Array.BYTES_PER_ELEMENT
  );
  // a_alpha (float) at offset 3 * sizeof(float).
  gl.enableVertexAttribArray(Attr.a_alpha);
  gl.vertexAttribPointer(
    Attr.a_alpha,
    1,
    gl.FLOAT,
    false,
    stride,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  // Set uniforms: transformation matrix and base RGB color.
  gl.uniformMatrix4fv(Frag.u_matrix, false, matrix);
  // Set the boolean uniform for shape type.
  gl.uniform1i(Frag.u_drawSquare, isSquare ? 1 : 0);

  // Draw the circles in one call.
  const circleCount = circleData.length / 4;
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.POINTS, 0, circleCount);
  gl.bindVertexArray(null);
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