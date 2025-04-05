// rollup.config.js

import terser from "@rollup/plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import resolve from "@rollup/plugin-node-resolve";

const config = {
  input: "src/index.js",
  output: [
    {
      file: "example/brush.js",
      format: "umd",
      name: "brush",
    },
    {
      file: "dist/brush.js",
      format: "umd",
      name: "brush",
    },
  ],
  plugins: [
    resolve({
      browser: true,
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
    cleanup({
      comments: "none",
    }),
  ],
};

export default config;
