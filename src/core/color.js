import { gl_worker } from "./workers.js";
import { constrain } from "./utils.js";

// =============================================================================
// Section: Configure and Initiate
// =============================================================================
/**
 * This module handles the configuration and initialization of the drawing system.
 * It manages canvas properties, ensures the system is ready for rendering, and
 * provides utilities for saving and restoring states.
 */

const Canvases = {}; // Stores canvas instances by ID
export let cID, Cwidth, Cheight, Density; // Global canvas properties

/**
 * Loads and initializes a canvas for the drawing system.
 * @param {string} canvasID - Unique identifier for the canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element to initialize.
 */
export const load = (canvasID, canvas) => {
  cID = canvasID;
  if (!Canvases[cID]) Canvases[cID] = { canvas };
  Cwidth = canvas.width;
  Cheight = canvas.height;
  _isReady = true;
  Mix.load();
}

let _isReady = false;

/**
 * Ensures the drawing system is ready before any operation.
 */
const isCanvasReady = () => { if (!_isReady) throw new Error("Call `load()` first"); };

/**
 * Stores the current state of the drawing system.
 * Can be used to save and restore configurations or canvas states.
 */
export const State = {};

// =============================================================================
// Section: Color Manager
// =============================================================================
/**
 * The Color Manager is responsible for handling color-related operations,
 * including color creation, conversion, and standardization. It provides
 * utilities to work with colors in various formats (e.g., RGB, Hexadecimal,
 * and named colors) and ensures compatibility with WebGL rendering.
 *
 * The `Color` class is the core of this section, offering methods to:
 * - Convert between RGB and Hexadecimal formats.
 * - Standardize color strings to their canonical form.
 * - Store color data in WebGL-compatible formats (normalized RGBA).
 */

const colorCtx = document.createElement("canvas").getContext("2d");

/**
 * Class to deal with colours and their conversion
 */
export class Color {
  constructor(r, g, b) {
    if (isNaN(r)) {
      // If the input is not a number, assume it's a color string (e.g., hex or named color)
      this.hex = this.standardize(r);
      let rgb = this.hexToRgb(this.hex);
      this.r = rgb.r; this.g = rgb.g; this.b = rgb.b;
    } else {
      // Constrain RGB values to the range [0, 255]
      this.r = constrain(r, 0, 255);
      this.g = constrain(g || r, 0, 255);
      this.b = constrain(b || r, 0, 255);
      this.hex = this.rgbToHex(this.r, this.g, this.b);
    }
    // Store the color in WebGL format (normalized RGBA)
    this.gl = [this.r / 255, this.g / 255, this.b / 255, 1];
  }

  /**
   * Converts RGB values to a hexadecimal color string.
   * @param {number} r - Red value (0-255).
   * @param {number} g - Green value (0-255).
   * @param {number} b - Blue value (0-255).
   * @returns {string} Hexadecimal color string.
   */
  rgbToHex = (r, g, b) => "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

  /**
   * Converts a hexadecimal color string to RGB values.
   * @param {string} hex - Hexadecimal color string.
   * @returns {object} An object with r, g, and b properties.
   */
  hexToRgb(hex) {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  }

  /**
   * Standardizes a color string to its canonical form.
   * @param {string} str - Color string (e.g., "red", "#f00").
   * @returns {string} Standardized color string.
   */
  standardize = str => { colorCtx.fillStyle = str; return colorCtx.fillStyle; };
}

// =============================================================================
// Section: Color Blending
// =============================================================================
/**
 * Handles color blending using WebGL shaders. Implements advanced blending
 * effects based on Kubelka-Munk theory. Relies on spectral.js for blending logic.
 */

/**
 * Ensures the Mix object is initialized and ready for blending.
 */
export const isMixReady = () => { if (!Mix.loaded) { isCanvasReady(); Mix.load(); } };


/**
 * Manages blending operations with WebGL shaders.
 * @property {boolean} loaded - Indicates if shaders are loaded.
 * @property {boolean} isBlending - Indicates if blending is active.
 * @property {object} currentColor - Current color in WebGL format.
 * @property {function} load - Initializes blending resources.
 * @property {function} blend - Applies blending effects.
 */
export const Mix = {
  loaded: false,
  isBlending: false,

  /**
   * Loads necessary resources and prepares the mask buffer and shader for colour blending.
   */
  load() {
    const ca = Canvases[cID];
    if (!ca.worker) {
      // Create offscreen masks
      ca.mask = new OffscreenCanvas(Cwidth, Cheight);
      ca.glMask = new OffscreenCanvas(Cwidth, Cheight);
      ca.ctx = ca.mask.getContext("2d");
      ca.gl = ca.glMask.getContext("webgl2");
      ca.ctx.lineWidth = 0;
      
      // Create an offscreen WebGL canvas and link it to the main canvas
      ca.offscreen = ca.canvas.transferControlToOffscreen();

      // Initialize the WebGL worker
      ca.worker = gl_worker();
      ca.worker.postMessage(0);

      // Send the offscreen WebGL canvas to the worker
      ca.worker.postMessage({ canvas: ca.offscreen }, [ca.offscreen]);
    }

    // Store references to the mask, context, and worker
    Object.assign(this, ca);
  },

  /**
   * Applies blending effects using the current color and mask.
   * @param {Color} _color - Color to blend.
   * @param {boolean} _isLast - If this is the final blend operation.
   * @param {boolean} _isImg - If blending an image.
   * @param {boolean} _isFillLayer - If this is a special case.
   */
  blend(_color = false, _isLast = false, _isImg = false, _isFillLayer = false) {
    isMixReady();

    // Initialize blending if not already active
    if (!this.isBlending && _color) {
      this.currentColor = _color.gl;
      this.isBlending = true;
    }

    if ((_isLast || _isImg || _color.gl.toString() !== this.currentColor.toString())) {

      // Use existing image data or transfer mask to ImageBitmap
      const imageData = (_isImg || this.isBrush) 
        ? this.glMask.transferToImageBitmap()
        : this.mask.transferToImageBitmap();

      // Send blending data to the worker
      this.worker.postMessage(
        {
          addColor: this.currentColor,
          mask: imageData,
          isLast: _isLast,
          isErase: this.isErase,
          isImage: Boolean(_isImg),
          sp: _isFillLayer,
          isBrush: this.isBrush,
        },
        [imageData]
      );

      // Reset flags
      this.isErase = this.isBrush = false;

      if (_isLast && !_isFillLayer) this.isBlending = false;
      else this.currentColor = _color.gl
    }
  },
};

// =============================================================================
// Section: Functions Exposed to Users
// =============================================================================

/**
 * Stores the background color. Defaults to white.
 */
let _bg_Color = new Color("white");

/**
 * Sets the background color of the canvas.
 * @param {number|string} r - Red value (0-255) or a color string.
 * @param {number|string} g - Green value (0-255) or a color string.
 * @param {number} b - Blue value (0-255).
 */
export const background = (...args) => {
  isMixReady();
  _bg_Color = new Color(...args);
  Mix.worker.postMessage({
    color: _bg_Color.gl,
    isBG: true,
  });
};

/**
 * Draws an image onto the canvas.
 * @param {ImageBitmap|HTMLImageElement} img - The image to draw.
 * @param {number} [x=0] - X-coordinate of the image.
 * @param {number} [y=0] - Y-coordinate of the image.
 * @param {number} [w=img.width] - Width of the image.
 * @param {number} [h=img.height] - Height of the image.
 */
export const drawImage = (img, ...args) => {
  isMixReady();
  // Draw the image onto the mask context
  Mix.ctx.drawImage(img, ...args);
  // Convert the mask to an ImageBitmap
  img = Mix.mask.transferToImageBitmap();
  // Blend the image into the canvas
  Mix.blend(false, false, img);
};