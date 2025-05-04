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

import { Mix, Cwidth, Cheight, isMixReady } from "../core/color.js";
import { Matrix } from "../core/flowfield.js";
import { createProgram } from "../core/gl/utils.js";

// =============================================================================
// Section: Initialization and Setup
// =============================================================================

// Module state
let isLoaded = false, gl, projMatrix;
const Attr = {}, Frag = {}, circles = [];

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
precision highp float;in float v_alpha;out vec4 outColor;void main(){vec2 v=gl_PointCoord-vec2(.5);float f=length(v),a=fwidth(f);f=1.-smoothstep(.5-a,.5+a,f);if(f<.01)discard;outColor=vec4(vec3(1,0,0)*v_alpha,v_alpha*f);}
`;

/**
 * Initializes WebGL objects if not done already.
 */
export function isReady() {
  if (!isLoaded) {
    isMixReady();
    gl = Mix.gl;
    projMatrix = new Float32Array([
      2/Cwidth, 0, 0, 0,
      0, -2/Cheight, 0, 0,
      0, 0, 1, 0,
      -1, 1, 0, 1
    ]);
    
    // Create shader program and initialize
    const program = createProgram(gl, vsSource, fsSource);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    
    // Cache attribute and uniform locations
    ["a_position", "a_radius", "a_alpha"].forEach(n => Attr[n] = gl.getAttribLocation(program, n));
    ["u_matrix"].forEach(n => Frag[n] = gl.getUniformLocation(program, n));
    
    isLoaded = true;
  }
}

// =============================================================================
// Section: Drawing Primitives
// =============================================================================

/**
 * Queue a circle to be drawn with the specified parameters
 */
export function circle(x, y, diameter, alpha) {
  isReady();
  circles.push({
    x: x + Matrix.x,
    y: y + Matrix.y,
    radius: diameter / 2,
    alpha: alpha / 100
  });
}

/**
 * Draw all queued circles using WebGL
 */
export function glDraw() {
  if (circles.length === 0) return;
  
  // Build vertex data: x, y, radius, alpha for each circle
  const circleData = new Float32Array(circles.length * 4);
  circles.forEach((c, i) => {
    const offset = i * 4;
    circleData.set([c.x, c.y, c.radius, c.alpha], offset);
  });
  circles.length = 0; // Clear queue
  
  // Create and bind vertex array
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  
  // Create and fill buffer
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, circleData, gl.STATIC_DRAW);
  
  // Set up attributes
  const stride = 16; // 4 floats × 4 bytes
  gl.enableVertexAttribArray(Attr.a_position);
  gl.vertexAttribPointer(Attr.a_position, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(Attr.a_radius);
  gl.vertexAttribPointer(Attr.a_radius, 1, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(Attr.a_alpha);
  gl.vertexAttribPointer(Attr.a_alpha, 1, gl.FLOAT, false, stride, 12);
  
  // Draw the circles
  gl.uniformMatrix4fv(Frag.u_matrix, false, projMatrix);
  gl.drawArrays(gl.POINTS, 0, circleData.length / 4);
  
  // Clean up
  gl.bindVertexArray(null);
  gl.deleteBuffer(buf);
  gl.deleteVertexArray(vao);
}