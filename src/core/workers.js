import { vsSource, fsSource } from "./gl/shader.js";

Worker.createURL = function (func_or_string) {
  const str =
    typeof func_or_string === "function"
      ? func_or_string.toString()
      : func_or_string;
  const blob = new Blob(["'use strict';\nself.onmessage =" + str], {
    type: "text/javascript",
  });
  return window.URL.createObjectURL(blob);
};

Worker.create = function (func_or_string) {
  return new Worker(Worker.createURL(func_or_string));
};

// Worker for webGL shaders
export const gl_worker = () =>
  Worker.create(function (e) {
    let canvas, gl;
    const sh = {};

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

    function prepareGL() {
      gl = canvas.getContext("webgl2");

      const pr = createProgram(gl, vsSource, fsSource);

      // Define uniform locations for fragment shader
      let uniforms = [
        "u_flip",
        "u_addColor",
        "u_isErase",
        "u_isFBO",
        "u_source",
        "u_mask",
        "u_isImage",
      ];
      for (let u of uniforms) sh[u] = gl.getUniformLocation(pr, u);

      // Use shader
      gl.useProgram(pr);

      sh.mask = createTexture();
      sh.source = createFBO();
      sh.target = createFBO();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sh.source.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, sh.mask);

      gl.uniform1i(sh.u_source, 0);
      gl.uniform1i(sh.u_mask, 1);
    }

    function createFBO() {
      let targetTexture = createTexture();
      // Create and bind the framebuffer
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      // attach the texture as the first color attachment
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        targetTexture,
        0
      );
      return { texture: targetTexture, fbo: fb };
    }

    function createTexture() {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, canvas.width, canvas.height);
      return texture;
    }

    function isSafari() {
      return (
        self.navigator &&
        /Safari/.test(self.navigator.userAgent) &&
        !/Chrome/.test(self.navigator.userAgent)
      );
    }

    function applyShader(data) {
      let imageData;

      // Fix Safari Memory Leak
      if (isSafari()) {
        const offscreen = new OffscreenCanvas(
          data.mask.width,
          data.mask.height
        );
        const offctx = offscreen.getContext("2d");
        // Draw the ImageBitmap onto the canvas
        offctx.drawImage(data.mask, 0, 0);
        // Extract the pixel data
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
      gl.uniform1f(sh.u_flip, 1);
      gl.uniform1i(sh.u_isFBO, false);
      gl.uniform1i(sh.u_isImage, data.isImage ? true : false);

      if (!data.isImage) {
        gl.uniform1i(sh.u_isImage, false);
        gl.uniform4f(sh.u_addColor, ...data.addColor);
        gl.uniform1i(sh.u_isErase, data.isErase ? true : false);
      }

      // Composite image to frameBuffer
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Copy framebuffer to source
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sh.target.fbo); // Read from target
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo); // Draw to source
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
      gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, [gl.COLOR_ATTACHMENT0]);

      // Display framebuffer on canvas
      if (data.isLast && !data.sp) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.uniform1i(sh.u_isImage, false);
        gl.uniform1i(sh.u_isFBO, true);
        gl.uniform1f(sh.u_flip, -1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }

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
      } else if (event.data.get) {
        let imgbitmap = await createImageBitmap(canvas);
        postMessage({ canvas: imgbitmap }, [imgbitmap]);
        imgbitmap.close();
      }
    };
  });
