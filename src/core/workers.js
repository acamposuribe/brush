import { GL } from "./gl/blend.js";

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
  Worker.create(GL);
