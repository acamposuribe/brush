import { Canvases, Cwidth, Cheight, cID } from "./config.js";
import { gl_worker } from "./workers.js";

// =============================================================================
// Section: Color Blending - Uses spectral.js as a module
// =============================================================================
/**
 * The Mix object is responsible for handling color blending operations within
 * the rendering context. It utilizes WebGL shaders to apply advanced blending
 * effects based on Kubelka-Munk theory. It depends on spectral.js for the
 * blending logic incorporated into its fragment shader.
 */

const colorCanvas = document.createElement("canvas");
colorCanvas.width = 1;
colorCanvas.height = 1;
const colorCtx = colorCanvas.getContext("2d");

/**
 * Class to deal with colours and their conversion
 */
export class Color {
  constructor(r, g, b) {
    if (!this.g && isNaN(r)) {
      this.hex = this.standardize(r);
      let rgb = this.hexToRgb(this.hex);
      (this.r = rgb.r), (this.g = rgb.g), (this.b = rgb.b);
    } else {
      (this.r = r), (this.g = !g ? r : g), (this.b = !b ? r : b);
      this.hex = this.rgbToHex(this.r, this.g, this.b);
    }
    this.gl = [this.r / 255, this.g / 255, this.b / 255, 1];
  }
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  hexToRgb(hex) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  standardize(str) {
    colorCtx.fillStyle = str;
    return colorCtx.fillStyle;
  }
}

/**
 * Object handling blending operations with WebGL shaders.
 * @property {boolean} loaded - Flag indicating if the blend shaders have been loaded.
 * @property {boolean} isBlending - Flag indicating if the blending has been initiated.
 * @property {obj} currentColor - Holds color values for shaders.
 * @property {function} load - Loads resources and initializes blend operations.
 * @property {function} blend - Applies blending effects using the initialized shader.
 */
export const Mix = {
  loaded: false,
  isBlending: false,
  currentColor: new Color("white").gl,

  /**
   * Loads necessary resources and prepares the mask buffer and shader for colour blending.
   */
  load() {
    if (!Canvases[cID].worker) {
      let ca = Canvases[cID];
      // Create 2d offscreen mask
      ca.mask = new OffscreenCanvas(Cwidth, Cheight);
      ca.ctx = ca.mask.getContext("2d");
      ca.ctx.lineWidth = 0;

      // Create offscreen webgl canvas and link to main canvas
      ca.offscreen = Canvases[cID].canvas.transferControlToOffscreen();
      // Init worker
      ca.worker = gl_worker();
      ca.worker.postMessage("init");
      // Send Offscreen webgl canvas to web worker as transferrable object
      ca.worker.postMessage({ canvas: ca.offscreen }, [ca.offscreen]);
    }

    this.mask = Canvases[cID].mask;
    this.ctx = Canvases[cID].ctx;
    this.worker = Canvases[cID].worker;
  },

  /**
   * Applies the blend shader to the current rendering context.
   * @param {string} _c - The color used for blending, as a Color object.
   * @param {boolean} _isLast - Indicates if this is the last blend after setup and draw.
   * @param {boolean} _isLast - Indicates if this is the last blend after setup and draw.
   */
  blend(_color = false, _isLast = false, _isImg = false, _sp = false) {
    // Check if blending is initialised
    if (!this.isBlending) {
      // If color has been provided, we initialise blending
      if (_color) (this.currentColor = _color.gl), (this.isBlending = true);
    }
    // Checks if newColor is the same than the cadhedColor
    // If it is the same, we wait before applying the shader for color mixing
    // If it's NOT the same, we apply the shader and cache the new color
    let newColor = !_color ? this.currentColor : _color.gl;

    let cond;
    if (_isLast || _isImg) cond = true;
    else cond = newColor.toString() !== this.currentColor.toString();

    if (cond) {
      let imageData = _isImg ? _isImg : this.mask.transferToImageBitmap();
      this.worker.postMessage(
        {
          addColor: this.currentColor,
          mask: imageData,
          isLast: _isLast,
          isErase: this.isErase,
          isImage: _isImg ? true : false,
          sp: _sp,
        },
        [imageData]
      );
      this.isErase = false;
      // We cache the new color here
      if (!_isLast) this.currentColor = _color.gl;
      if (_isLast && !_sp) this.isBlending = false;
    }
  },
};

/**
 * This function draws the background color
 */
let _bg_Color = new Color("white");
export function background(r, g, b) {
  if (r === "transparent") _bg_Color = new Color(g);
  else _bg_Color = new Color(...arguments);
  Mix.worker.postMessage({
    color: _bg_Color.gl,
    isBG: true,
  });
}

/**
 * This function draws an image into the canvas
 */
export function drawImage(img, x = 0, y = 0, w = img.width, h = img.height) {
  if (
    Object.prototype.toString.call(img) !== "[object ImageBitmap]" ||
    x !== 0
  ) {
    Mix.ctx.drawImage(...arguments);
    img = Mix.mask.transferToImageBitmap();
  }
  Mix.blend(false, false, img);
}

/**
 * This function gets the canvas as an ImageBitmap
 */
export async function getCanvas() {
  let image;
  await new Promise(function (resolve) {
    Mix.worker.postMessage({ get: true });
    Mix.worker.onmessage = function (event) {
      if (event.data !== 0) {
        image = event.data.canvas;
        resolve();
      }
    };
  });
  return image;
}
