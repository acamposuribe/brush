import { load } from "../core/color.js";

export function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);

  // Base styles for the canvas itself
  canvas.style.maxWidth = "100%";
  canvas.style.maxHeight = "100%";
  canvas.style.width = "auto";
  canvas.style.height = "auto";
  canvas.style.objectFit = "contain";

  load(canvas.id, canvas);
}
