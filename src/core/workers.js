import { vsSource, fsSource } from "./gl/shader.js";

// Create a blob URL from a function or string for worker creation.
Worker.createURL = function (func_or_string) {
  const str =
    typeof func_or_string === "function"
      ? func_or_string.toString()
      : func_or_string;
  const blob = new Blob(["'use strict';\nself.onmessage=" + str], {
    type: "text/javascript",
  });
  return window.URL.createObjectURL(blob);
};

// Create a new Worker instance from a function or string.
Worker.create = function (func_or_string) {
  return new Worker(Worker.createURL(func_or_string));
};

/**
 * gl_worker:
 * A dedicated Web Worker for WebGL shader processing. It listens for messages to initialize
 * the WebGL context, clear backgrounds, apply shaders, and return processed images.
 * @returns {Worker} A new Web Worker instance.
 */
export const gl_worker = () =>
  Worker.create(function (e) {
    let canvas, gl;
    const sh = {}; // Stores shader uniform locations and FBOs/textures.

    /**
     * Compiles a shader program from the given vertex and fragment sources.
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     * @param {string} vert - Vertex shader source.
     * @param {string} frag - Fragment shader source.
     * @returns {WebGLProgram} The compiled and linked program.
     */
    const createProgram = (gl, vert, frag) => {
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
    };

        /**
     * Creates a texture and allocates storage based on the canvas dimensions.
     * @returns {WebGLTexture} The created texture.
     */
        function createTexture() {
          const tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, canvas.width, canvas.height);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          return tex;
        }

            /**
     * Creates a framebuffer object (FBO) with an associated texture.
     * @returns {{texture: WebGLTexture, fbo: WebGLFramebuffer}} An object containing the texture and FBO.
     */
    function createFBO() {
      let texture = createTexture();
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      return { texture, fbo: fb };
    }

    /**
     * Prepares the WebGL context:
     * - Initializes WebGL2 with antialiasing disabled.
     * - Compiles the shader program.
     * - Caches uniform locations.
     * - Creates necessary textures and framebuffer objects (FBOs).
     * - Binds textures to texture units.
     */
    function prepareGL() {
      gl = canvas.getContext("webgl2", { antialias: false });

      // Compile shader
      const mainProg = createProgram(gl, vsSource, fsSource);
      gl.useProgram(mainProg);

      // Cache uniform locations used by the fragment shader.
      [
        "u_addColor",
        "u_isErase",
        "u_isImage",
        "u_isBrush",
        "u_source",
        "u_mask"
      ].forEach((name) => {
        sh[name] = gl.getUniformLocation(mainProg, name);
      });

      // Create texture and framebuffer objects.
      sh.mask = createTexture();
      sh.source = createFBO();
      sh.target = createFBO();

      // Bind textures to texture units 0 and 1.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sh.source.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, sh.mask);
      gl.uniform1i(sh.u_source, 0);
      gl.uniform1i(sh.u_mask, 1);
    }

    /**
     * Returns true if the worker is running in Safari.
     * @returns {boolean} True if Safari, false otherwise.
     */
    function isSafari() {
      return (
        self.navigator &&
        /Safari/.test(self.navigator.userAgent) &&
        !/Chrome/.test(self.navigator.userAgent)
      );
    }

    /**
     * Applies the shader by updating the mask texture and drawing to framebuffer objects.
     * Handles updating of uniforms and copying the rendered image between framebuffers.
     * @param {object} data - Contains blend parameters and the mask ImageBitmap.
     */
    function applyShader(data) {
      let imageData;
      // Workaround for Safari memory leak using an OffscreenCanvas.
      if (isSafari()) {
        const offscreen = new OffscreenCanvas(
          data.mask.width,
          data.mask.height
        );
        const offctx = offscreen.getContext("2d");
        offctx.drawImage(data.mask, 0, 0);
        imageData = offctx.getImageData(
          0,
          0,
          data.mask.width,
          data.mask.height
        );
      }
      // Draw mask to texture
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        isSafari() ? imageData : data.mask
      );
      // Close imagebitmap
      data.mask.close();
      // Draw to framebuffer
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.target.fbo);
      // Uniforms
      gl.uniform1i(sh.u_isImage, data.isImage ? 1 : 0);
      gl.uniform1i(sh.u_isBrush, data.isBrush ? 1 : 0);
      if (!data.isImage) {
        gl.uniform1i(sh.u_isImage, false);
        gl.uniform4f(sh.u_addColor, ...data.addColor);
        gl.uniform1i(sh.u_isErase, data.isErase ? true : false);
      }
      // Composite image to frameBuffer
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Copy framebuffer to source
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sh.target.fbo);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
      blit();
      // Display framebuffer on canvas
      if (data.isLast && !data.sp) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sh.target.fbo); // Read from target
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // Draw to canvas
        blit();
      }
    }

    /**
     * Copies the content from the current framebuffer to the destination using gl.blitFramebuffer.
     */
    function blit() {
      gl.blitFramebuffer(
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
        gl.COLOR_BUFFER_BIT,
        gl.NEAREST
      );
    }

    /**
     * Message handler for the worker.
     * - If a canvas is provided, initializes and prepares the WebGL context.
     * - If a background-clear message is received, clears the background.
     * - If mask data is received, applies the shader.
     */
    onmessage = async (event) => {
      if (event.data.canvas) {
        canvas = event.data.canvas;
        prepareGL();
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
        gl.clearColor(1, 1, 1, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      } else if (event.data.isBG) {
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
        gl.clearColor(...event.data.color);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      } else if (event.data.mask) {
        applyShader(event.data);
      }
    };
  });
