import { Mix } from "./color.js";

// =============================================================================
// Section: Drawing Loop
// =============================================================================

let _time = 0,
  _isLoop = true,
  _drawingLoop,
  _fps = 30;

export let frameCount = 0;

/**
 * Starts the drawing loop.
 * @param {Function} [drawingLoop] - Custom function to execute on each frame.
 */
export function loop(drawingLoop = false) {
  if (drawingLoop) _drawingLoop = drawingLoop;
  _isLoop = true;
  
  setTimeout(() => {
  requestAnimationFrame(drawLoop);
}, "200");
}

/**
 * Stops the drawing loop.
 */
export function noLoop() {
  _isLoop = false;
}

/**
 * Gets or sets the frame rate.
 * @param {number} [fps] - Desired frames per second.
 * @returns {number} - Current frame rate.
 */
export let frameRate = (fps) => {
  if (fps) _fps = fps;
  return _fps;
};

/**
 * Main loop function. Executes the user-defined loop and composites the frame.
 * @param {number} timeStamp - Current time in milliseconds.
 */
function drawLoop(timeStamp) {
  if (_isLoop) {
    if (timeStamp > _time + 1000 / frameRate() || timeStamp === 0) {
      _time = timeStamp;
      frameCount++;
      if (_drawingLoop) _drawingLoop();
      endFrame();
    }
  }
  requestAnimationFrame(drawLoop);
}

/**
 * Use this function when you want to composite the final result
 */
export function endFrame() {
  Mix.blend(false, true);
}
