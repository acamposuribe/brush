import { Mix } from "./color.js";

// =============================================================================
// Section: Drawing Loop
// =============================================================================

let _time = 0,
  _isLoop = true,
  _drawingLoop,
  _fps = 30;

export function loop(drawingLoop) {
  _drawingLoop = drawingLoop;
  _isLoop = true;
  requestAnimationFrame(drawLoop);
}

export let frameRate = (fps) => {
  if (fps) _fps = fps;
  return _fps;
};

export let frameCount = 0;
export function noLoop() {
  _isLoop = false;
}
function drawLoop(timeStamp) {
  if (_isLoop) {
    if (timeStamp > _time + 1000 / frameRate() || timeStamp === 0) {
      _time = timeStamp;
      frameCount++;
      _drawingLoop();
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
