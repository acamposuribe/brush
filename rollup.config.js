// rollup.config.js

import terser from "@rollup/plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import resolve from "@rollup/plugin-node-resolve";
import glslify from 'rollup-plugin-glslify';

const config = {
  input: "src/index.js",
  output: [
    {
      file: "example/brush.js",
      format: "umd",
      name: "brush",
      sourcemap: true,
    },
    {
      file: "dist/brush.js",
      format: "umd",
      name: "brush",
      sourcemap: true,
    },
    {
      file: "dist/brush.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ browser: true }),
    glslify({
      include: ["src/core/gl/shader.vert", "src/core/gl/shader.frag"],
      compress: true,
    }),
    terser({
      module: true,
      compress: {
        keep_infinity: true,
        module: true,
        passes: 3,
        toplevel: true,
      },
    }),
    cleanup({ comments: "none" }),
  ],
};

export default config;
