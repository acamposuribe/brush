import vertSrc from "./shader.vert";
import fragSrc from "./shader.frag";

/**
 * This code will be compiled into a separate worker thread
 */
export const GL = () => {
    let canvas, gl, sh = {};

    /**
     * Prepares the WebGL context:
     * - Initializes WebGL2 with antialiasing disabled.
     * - Compiles the shader program.
     * - Caches uniform locations.
     * - Creates necessary textures and framebuffer objects (FBOs).
     * - Binds textures to texture units.
     */
    function init(canvasObj) {
      canvas = canvasObj;
      gl = canvas.getContext("webgl2", { antialias: false });

      // Compile shader
      const mainProg = createProgram(gl, vertSrc, fragSrc);
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
      gl.uniform1i(sh.u_source, 0);
      gl.uniform1i(sh.u_mask, 1);
      bindTexture(gl.TEXTURE0, sh.source.texture);
      bindTexture(gl.TEXTURE1, sh.mask);

      // Initial clear
      clearFramebuffer([1, 1, 1, 0]);
    }

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

    // Bind texture with state tracking
    function bindTexture(unit, texture) {
      gl.activeTexture(unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
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

    function updateMaskTexture(data) {
      // Handle mask texture update with Safari special case
      let source = data.mask;
      if (isSafari()) {
        const offscreen = new OffscreenCanvas(source.width, source.height);
        offscreen.getContext("2d").drawImage(source, 0, 0);
        source = offscreen.getContext("2d").getImageData(0, 0, source.width, source.height);
      }
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
      data.mask.close();
    }

    /**
     * Applies the shader by updating the mask texture and drawing to framebuffer objects.
     * Handles updating of uniforms and copying the rendered image between framebuffers.
     * @param {object} data - Contains blend parameters and the mask ImageBitmap.
     */
    function applyShader(data) {
      // Update texture with mask data
      updateMaskTexture(data)
      // Draw to framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, sh.target.fbo);
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
      copyFramebuffers(sh.target.fbo, sh.source.fbo);
      if (data.isLast && !data.sp) {
        // Copy framebuffer to canvas
        copyFramebuffers(sh.target.fbo, null)
      }
    }

    function copyFramebuffers(src, dest) {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dest);
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
      const data = event.data;
      if (data.canvas) {
        init(data.canvas);
      } else if (data.isBG) {
        clearFramebuffer(data.color)
      } else if (data.mask) {
        applyShader(data);
      }
    };

    function clearFramebuffer(color) {
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
      gl.clearColor(...color);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
  }