# brush.js

brush.js is a javascript library dedicated to the creation and management of custom brushes. It extends the drawing capabilities of the canvas api by allowing users to simulate a wide range of brush strokes, vector fields, hatching patterns, and fill textures. These features are essential for emulating the nuanced effects found in traditional sketching and painting. Whether for digital art applications or procedural generation of graphics, brush.js provides a robust framework for artists and developers to create rich, dynamic, and textured visuals.

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Reference](#reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Installation

### Local Installation

To set up your project, add `brush.js` to your HTML file. You can download the last version of the brush.js library in the [dist](/dist) folder.

```html
<!-- via <script> tag (UMD build, exposes `brush` global) -->
<script src="path_to/brush.js"></script>
```
Replace path_to with the actual path to the script in your project directory or the URL if you are using a CDN.

### Use a hosted version of the brush.js library 

Alternatively, you can link to a `brush.js` file hosted online. All versions are stored in a CDN (Content Delivery Network). In this case you can change the link to:

```html
<!-- Online version of brush -->
<script src="LINK_TO_BE_UPDATED"></script>
```

### Install with NPM and other modular-based apps

Install the npm package

```
npm install @acamposuribe/brush --save
```

After that, import brush functions to your sketch:

```
// ES‑module import (tree‑shaking enabled)
import * as brush from '@acamposuribe/brush'
// or pick & choose named exports:
// import { load, circle, fillStyle } from "@acamposuribe/brush";
```

```
// CommonJS (Node.js / older bundlers)
const brush = require("@acamposuribe/brush");
```

### Load the brush.js library

In order to load the library, you need to create a canvas and pass it through the brush.load() function. You can load brush.js in several canvas and and change accordingly. That's why you need to choose a canvas id within the load function.

```js
// Create canvas. There are many ways of doing this
const canvas = document.createElement("canvas");
canvas.setAttribute("id", "canvas_name");
canvas.width = 1200;
canvas.height = 1750;
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

// Pass the canvas to the brush.js library through load(). Pick a name for said canvas.
brush.load("canvas_name", canvas);
```

## Features

- **Custom Configuration**: Customize your drawing strokes with the ability to select different buffers and leverage a custom random number generator to introduce variability in procedural designs.
- **Vector Field Integration**: Direct the motion of your brush strokes with vector fields, crafting fluid, dynamic visuals within your sketches.
- **Dynamic Brush System**: Select from an array of brushes, each offering distinct characteristics, to create a variety of effects and textures.
- **Brush and Field Management**: Manage and switch between brushes and vector fields with ease, adapting to the needs of your project seamlessly.
- **Extensibility**: Expand the library's capabilities by integrating your own custom brushes and vector fields, tailoring the toolset to your artistic vision.
- **Custom Brush Tips**: Load and use your own custom brush tip assets.
- **Interactive Brush Tips**: Utilize pressure-sensitive brush tips for interactive drawing, adding a level of responsiveness to your canvas work.
- **Hatch Patterns**: Implement hatching techniques with precision control over the patterns' density and orientation, enhancing your artwork with automated detailing.
- **Intuitive Spline and Curve Generation**: Generate smooth and accurate curves and splines effortlessly, simplifying the process of intricate path creation.
- **Watercolor Fill System**: Achieve the subtle nuances of watercolor with a digital fill system designed to blend and diffuse colors in a naturally fluid way.

With brush.js, your digital canvas becomes a playground for innovation and expression, where each tool is fine-tuned to complement your unique creative process.

.

## Reference

brush.js provides a comprehensive API for creating complex drawings and effects. Below are the categorized functions and classes available in the library.

### Table of Functions

|      Section                               |      Functions      |   | Section                                    |      Functions      |
|--------------------------------------------|---------------------|---|--------------------------------------------|---------------------|
| [Configuration](#important-configuration)  | brush.load()        |   | [Drawing Loop](#drawing-loop)              | brush.draw()        |
|                                            | brush.createCanvas()|   |                                            | brush.loop()        |
|                                            | brush.scaleBrushes()|   |                                            | brush.noLoop()      |
|                                            | brush.seed()        |   |                                            | brush.frameRate()   |
|                                            | brush.noiseSeed()   |   |                                            | brush.frameCount    |
| [Utility](#utility-functions)              | brush.save()        |   |                                            |                     |
|                                            | brush.restore()     |   | [Hatch Operations](#hatch-operations)      | brush.hatch()       |
|                                            | brush.translate()   |   |                                            | brush.noHatch()     |
|                                            | brush.background()  |   |                                            | brush.hatchStyle()  |
|                                            | brush.drawImage()   |   | [Geometry](#geometry)                      | brush.line()        |
| [Vector-Fields](#vector-fields)            | brush.field()       |   |                                            | brush.stroke()      |
|                                            | brush.noField()     |   |                                            | brush.beginStroke() |
|                                            | brush.wiggle()      |   |                                            | brush.move()        |
|                                            | brush.listFields()  |   |                                            | brush.endStroke()   |
|                                            | brush.addField()    |   |                                            | brush.spline()      |
| [Brush Management](#brush-management)      | brush.box()         |   |                                            | brush.rect()        |
|                                            | brush.add()         |   |                                            | brush.circle()      |
|                                            | brush.clip()        |   |                                            | brush.beginPath()   |
|                                            | brush.noClip()      |   |                                            | brush.moveTo()      |
| [Stroke Operations](#stroke-operations)    | brush.set()         |   |                                            | brush.lineTo()      |
|                                            | brush.pick()        |   |                                            | brush.closePath()   |
|                                            | brush.strokeStyle() |   |                                            | brush.endPath()     |
|                                            | brush.noStroke()    |   | [Classes](#exposed-classes)                | brush.Polygon()     |
|                                            | brush.lineWidth()   |   |                                            | brush.Plot()        |
| [Fill Operations](#fill-operations)        | brush.fillStyle()   |   |                                            | brush.Position()    |
|                                            | brush.noFill()      |   | [Utils](#utils)                            | brush.random()      |
|                                            | brush.fillBleed()   |   |                                            | brush.noise()       |
|                                            | brush.fillTexture() |   |                                            | brush.wRand()       |
| [Erase](#erase-operations)                 | brush.erase()       |   |                                            |                     |
|                                            | brush.noErase()     |   |                                            |                     |

---

<sub>[back to table](#table-of-functions)</sub>
### Important: Configuration

This section covers functions for initializing the drawing system, preloading required assets, and configuring system behavior. The library doesn't work without executing the load function!

---

- `brush.load(canvasID, canvas_obj)`
  - **Description**: Initializes the drawing system and sets up the environment.
  - **Important**: If you want to use the createCanvas() function, the library will be automatically loaded. There's no need to use the load function.
  - **Parameters**: 
    - `canvasID` (string): Optional ID of the buffer/canvas element. If false, uses the window's rendering context.
    - `canva_obj` (string): Optional ID of the buffer/canvas element. If false, uses the window's rendering context.
  - **Example**: 
    ```javascript
      // Create canvas. There are many ways of doing this
      const canvas = document.createElement("canvas");
      canvas.setAttribute("id", "first_canvas");
      canvas.width = 1200;
      canvas.height = 1750;
      var body = document.getElementsByTagName("body")[0];
      body.appendChild(canvas);

      // Pass the canvas to the brush.js library through load(). Pick a name for said canvas.
      brush.load("first_canvas", canvas);
      // Perform Drawing operations
      brush.line(0, 0, 200, 300)
      // Push things to canvas at the end
      brush.draw()

      // You can load brush.js on a second canvas and draw on it
      brush.load("second_canvas", canvas2)
      brush.line(50, 20, 100, 100)
      brush.draw()

      // And change between canvas like this
      brush.load("first_canvas")
      ```
      **Important note:** You can only load brush.js on canvas that don't have a drawingContext. The canvas context will be created and captured by brush.js and will become unusable to perform other canvas api operations.

---

- `brush.createCanvas(width, height)`
  - **Description**: Creates a new canvas element, adds it to the document, and automatically initializes the brush.js library for this canvas. This is the simplest way to get started with brush.js, as it handles both canvas creation and library initialization in a single call.
  - **Parameters**:
    - `width` (Number): The width of the canvas in pixels.
    - `height` (Number): The height of the canvas in pixels.
  - **Note**: When using `createCanvas()`, there is no need to call `brush.load()` separately, as the library is automatically loaded and initialized for the newly created canvas. The `brush.load()` function is only needed when you want to use brush.js with an existing canvas element.
  - **Usage**:
    ```javascript
    // Create a new 800x600 canvas and initialize brush.js
    brush.createCanvas(800, 600);
    
    // Start drawing immediately
    brush.background("#f5f5f5");
    brush.set("HB", "black", 1);
    brush.circle(400, 300, 100);
    brush.draw();
    ```
    The canvas is automatically styled to be responsive, maintaining its aspect ratio while fitting within the browser window.

---

- `brush.scaleBrushes(scale)`
  - **Description**: Adjusts the global scale of all standard brush parameters, including weight, vibration, and spacing, based on the given scaling factor. This function is specifically designed to affect default brushes only, allowing for uniform scaling across various brush types.
  - **Parameters**:
    - `scale` (Number): The scaling factor to be applied to the brush parameters.
  - **Note**: This function only impacts the default brushes. Custom brushes may not be affected by this scaling, since they are defined per case basis.
  - **Usage**:
    ```javascript
    // Scale all standard brushes by a factor of 1.5
    brush.scaleBrushes(1.5);
    ```
    Using `brush.scaleBrushes()`, you can easily adjust the size and spacing characteristics of standard brushes in your project, providing a convenient way to adapt to different canvas sizes or artistic styles.
    
---

- `brush.seed(seed)`
  - **Description**: Sets a custom seed for deterministic drawing results.
  - **Parameters**: 
    - `seed` (String | Number): A seed.
  - **Example**: 
    ```javascript
    brush.seed('hello');
    ```
    Replace `hello` with the actual seed.

- `brush.noiseSeed(seed)`
  - **Description**: Sets a custom seed for deterministic noise, affecting fields and the noise() function.
  - **Parameters**: 
    - `seed` (String | Number): A seed.
  - **Example**: 
    ```javascript
    brush.noiseSeed('hello');
    ```
    Replace `hello` with the actual seed.

---

<sub>[back to table](#table-of-functions)</sub>

### Drawing Loop

TBW. 

---

- `brush.draw()`
  - **Description**: In case you don't use a the loop function, Use draw() when you're done drawing, to show elements on canvas. If you don't add this at the end of your sketch, elements will be missing from the screen.

---

- `brush.loop(function)`
  - **Description**: Use the loop function to create a drawing loop that will be drawn at 30fps (by default)
  - **Parameters**:
   - `function` (function): Pass a function that will be executed on a loop.
   - **Usage**:
    ```javascript
    const palette = ["red", "blue", "yellow", "green", "black"];
    // Create a drawing function that will be repeated each frame
    const draw = () => {
      // We select a random color
      brush.strokeStyle(brush.random(palette))
      // We draw a line from 0,0 to a random coordinate
      brush.line(0, 0, brush.random(0, width), brush.random(0, height))
    }
    // Start the drawing loop
    brush.loop(draw)
    ```
    If you use brush.loop() without parameter, it will restart the loop with the previously passed function.

- `brush.noLoop()`
  - **Description**: Stops the drawing loop.

- `brush.frameRate(fps)`
  - **Description**: Sets the frameRate for the loop
  - **Parameters**:
   - `fps` (number): Expected frames per second
  - **Default value**: 30 fps

- `brush.frameCount`
  - **Description**: Variable that stores the number of frames already drawn

---

<sub>[back to table](#table-of-functions)</sub>

### Utility Functions

---
 
- `brush.save()`
  - **Description**: Saves the current drawing state, including brush, hatch, and fill settings and transformations. Used in conjunction with `brush.restore()` to temporarily modify settings that can later be reverted.

- `brush.restore()`
  - **Description**: Restores the previously saved drawing state. This function returns all brush, hatch, fill settings and transformations to the state that was active when the last `brush.save()` was called.

---

- `brush.translate(x, y)`
  - **Description**: Moves the origin point of the drawing canvas to the specified coordinates. All subsequent drawing operations will be relative to this new origin.
  - **Parameters**:
    - `x` (Number): The x-coordinate to translate to.
    - `y` (Number): The y-coordinate to translate to.
  - **Usage**:
    ```javascript
    // Move the origin to coordinates (100, 50)
    brush.translate(100, 50);
    // A circle drawn at (0,0) will now appear at (100,50)
    brush.circle(0, 0, 25);
    ```

---

- `brush.background(color)`
  - **Description**: Sets the background color of the canvas. This function clears the canvas with the specified color, providing a fresh canvas for drawing. The color can be specified as a CSS color string or as RGB values.
  - **Parameters**:
    - `color` (String|Number): The color to fill the background. Can be a CSS color string (like "#002185" or "red") or the red component if using RGB.
    - `g` (Number): Optional. The green component if using RGB.
    - `b` (Number): Optional. The blue component if using RGB.
  - **Usage**:
    ```javascript
    // Set background using a CSS color string
    brush.background("#f5f5f5");
    // Or using RGB values
    brush.background(245, 245, 245);
    ```

- `brush.drawImage(img, x, y, w, h)`
  - **Description**: Draws an image onto the canvas. This function allows you to place images on your canvas, which will be blended with existing content according to the library's blending mode.
  - **Parameters**:
    - `img` (ImageBitmap|HTMLImageElement): The image to draw.
    - `x` (Number): Optional. The x-coordinate for the image placement (defaults to 0).
    - `y` (Number): Optional. The y-coordinate for the image placement (defaults to 0).
    - `w` (Number): Optional. The width to scale the image to (defaults to the image's width).
    - `h` (Number): Optional. The height to scale the image to (defaults to the image's height).
  - **Usage**:
    ```javascript
    // Load an image element
    const img = new Image();
    img.src = 'path/to/image.jpg';
    img.onload = function() {
      // Draw the image at position (100, 100) with size 200x150
      brush.drawImage(img, 100, 100, 200, 150);
    };
    ```

---

<sub>[back to table](#table-of-functions)</sub>

### Vector Fields

Vector Fields allow for dynamic control over brush stroke behavior, enabling the creation of complex and fluid motion within sketches.


 #### Basic vector-field functions

---
 
- `brush.field(name)`
  - **Description**: Activates a named vector field. When a vector field is active, it influences the flow and direction of the brush strokes for shapes drawn thereafter. It is important to note that certain shapes may be exempt from this influence; such exceptions will be clearly documented in the API for each specific geometry.
  - **Parameters**:
    - `name` (String): The identifier for the vector field to be activated. This can be a name of one of the predefined fields or a custom field created with `brush.addField()`.
  - **Default Fields**: The library comes with a set of built-in vector fields: `curved`, `truncated`, `zigzag`, `seabed`, and `waves`. These, as well as any custom fields added, can be activated using this function.
  - **Usage**:
    ```javascript
    // To activate the "waves" vector field
    brush.field("waves");

    // To activate a custom vector field named "myCustomField"
    brush.field("myCustomField");
    ```
    Once a vector field is activated, it affects how the subsequent shapes are drawn, aligning them with its directional flow, unless stated otherwise in the documentation

---

- `brush.noField()`
  - **Description**: Deactivates the currently active vector field, returning the drawing behavior to its default state where shapes are not influenced by any vector field. Any shapes drawn after this function call will not be affected by the previously active vector field.
  - **Usage**:
    ```javascript
    // Deactivate the current vector field
    brush.noField();
    ```
    Use this function when you want to draw shapes that are unaffected by the directional flow of any vector field, effectively resetting the drawing behavior to its original state.

---

- `brush.wiggle(amount)`
  - **Description**: Sets the amount of randomness/wiggle for drawing operations. Higher values produce more varied, hand-drawn effects.
  - **Parameters**:
    - `amount` (Number): The wiggle intensity, usually between 0 and 10.
  - **Usage**:
    ```javascript
    // Set a medium wiggle effect
    brush.wiggle(5);
    // Draw shapes with the wiggle effect applied
    brush.circle(200, 200, 100);
    ```

---

- `brush.listFields()`
  - **Description**: Retrieves an iterator containing the names of all the available vector fields within the system. This includes both the default fields provided by the library and any custom fields that have been added using `brush.addField()`.
  - **Returns**: `Iterator<string>` - An iterator that yields the names of the vector fields.
  - **Usage**:
    ```javascript
    // Get an iterator of all vector field names
    let fieldNames = brush.listFields();
    // Loop through the names using the iterator
    for (let name of fieldNames) {
      console.log(name);
    }
    ```
    Use `brush.listFields()` to access the names of all existing vector fields, which can then be used to activate or modify fields as needed.

---
 
 #### Advanced vector-field functions

---

- `brush.addField(name, generatorFunction)`
  - **Description**: Adds a custom vector field to the list of available fields. This advanced function requires a unique name for the field and a generator function that defines the behavior of the vector field over time.
  - **Parameters**:
    - `name` (String): A unique identifier for the vector field.
    - `generatorFunction` (Function): A function that generates the field values. It takes a time parameter `t`, loops through the vector field cells, assigns angular values based on custom logic, and returns the modified `field` array.
  - **Default Fields**: The library includes several pre-defined vector fields. Users can add their own to extend the functionality.
  - **Usage**: To add a vector field that creates wave-like motions:
    ```javascript
    brush.addField("waves", function(t, field) {
        let sinrange = random(10,15) + 5 * sin(t);
        let cosrange = random(3,6) + 3 * cos(t);
        let baseAngle = random(20,35);
        for (let column = 0; column < field.length; column++) {
            for (let row = 0; row < field[0].length; row++) {               
                let angle = sin(sinrange * column) * (baseAngle * cos(row * cosrange)) + random(-3,3);
                field[column][row] = angle;
            }
        }
        return field;
    });
    ```
    - **Note**: It's important that your loops create a grid of `field.length` x `field[0].length`. It's necessary to fill all the `field` cells with a numeric value. Return this array when you've filled the values. **The angles MUST BE in Degrees**.
    ```javascript
    brush.addField("name_field", function(t, field) {
        let field = FF.genField()
        // Related functions for angle calculation
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[0].length; j++) {               
                // Related functions for angle calculation here
                field[i][j] = CalculatedAngle;
            }
        }
        return field;
    });
    ```
    

---

<sub>[back to table](#table-of-functions)</sub>

### Brush Management

Functions for managing brush behaviors and properties.

---

- `brush.box()`
  - **Description**: Retrieves an array containing the unique names of all available brushes. This function is useful for accessing the variety of brushes included in the library, which range from different pencil types to markers and specialized brushes like the hatch brush. Of course, the function will also return the custom brushes you've created.
  - **Returns**: `Array<string>` - An array listing the names of all brushes.
  - **Default Brushes**: The library includes a default set of 11 brushes: `2B`, `HB`, `2H`, `cpencil`, `pen`, `rotring`, `spray`, `marker`, `marker2`, `charcoal`, and `hatch_brush` (for clean hatching).
  - **Usage**:
    ```javascript
    // Retrieve a list of all available brush names
    let brushes = brush.box();
    console.log(brushes); // Logs the array of brush names
    ```
    `brush.box()` allows you to explore and select from the various brushes, facilitating the choice of the appropriate brush for different artistic needs.

---

**NOTE: Image brush types are currently not working. Will fix soon**

- `brush.add(name, params)`
  - **Description**: Adds a new brush to the brush list with specified parameters, defining the brush's behavior and appearance. This function allows for extensive customization, enabling the creation of unique brush types suited to various artistic needs.
  - **Parameters**:
    - `name` (String): A unique identifier for the brush.
    - `params` (BrushParameters): An object containing the parameters for the brush. The parameters include:
      - `type`: (`standard` | `spray` | `marker` | `custom` | `image`) The tip type. 
      - `weight`: Base size of the brush tip, in canvas units.
      - `vibration`: Vibration of the lines, affecting spread, in canvas units.
      - `definition`: (Number from 0-1) Between 0 and 1, defining clarity. Unnecessary for custom, marker, and image type brushes.
      - `quality`: Higher values lead to a more continuous line. Unnecessary for custom, marker, and image type brushes.
      - `opacity`: (Number from 0-255) Base opacity of the brush (affected by pressure).
      - `spacing`: Spacing between points in the brush stroke, in canvas units.
      - `blend`: (Boolean) Enables or disables realistic color mixing (default true for marker, custom, and image brushes).
      - `pressure`: An object or function defining the pressure sensitivity.
         - `type` : 'standard" or 'custom". Use standard for simple gauss bell curves. Use 'custom' for custom pressure curves.
         - `min_max`: (Array [min, max]) Define min and max pressure (reverse for inverted presure).
         - `curve`: function or array.
            - Standard pressure: [a, b] - If 'standard' pressure curve, pick a and b values for the gauss curve. a is max horizontal mvt of the bell, b changes the slope.
            - Custom pressure: (x) => function - If 'custom' pressure curve, define the curve function with a curve equation receiving values from 0 to 1, returning values from 0 to 1. Use https://mycurvefit.com/
      - `tip`: (For custom types) A function defining the geometry of the brush tip. Remove if unnecessary.
      - `image`: (For image types) The url path to your image, which MUST be in the same baseURL. Remove if unnecessary.
      - `rotate`: (`none` | `natural` | `random`) Defines the tip angle rotation.
  - **Usage**:
    ```javascript
    // You create an image brush like this:
    brush.add("watercolor", {
        type: "image",
        weight: 10,
        vibration: 2,
        opacity: 30,
        spacing: 1.5,
        blend: true,
        pressure: {
            type: "custom",
            min_max: [0.5,1.2],
            // This formula implies that the pressure changes in a linear distribution through the whole length of the line.
            // Minimum pressure at the start, maximum pressure at the end.
            curve: (x) => 1-x
        },
        image: {
            src: "./brush_tips/brush.jpg",
        },
        rotate: "random",
    })
    
    // You create a custom tip brush like this:
    brush.add("watercolor", {
        type: "custom",
        weight: 5,
        vibration: 0.08,
        opacity: 23,
        spacing: 0.6,
        blend: true,
        pressure: {
            type: "custom",
            min_max: [1.35,1],
            curve: [0.35,0.25] // Values for the bell curve
        },
        tip: (_m) => {
           // in this example, the tip is composed of two squares, rotated 45 degrees
           // Always execute drawing functions within the _m buffer!
           _m.rotate(45), _m.rect(-1.5,-1.5,3,3), _m.rect(1,1,1,1);
        }
        rotate: "natural",
    })
    ```
    By using `brush.add()`, you can expand your brush collection with custom brushes tailored to specific artistic effects and styles.

---

- `brush.clip(clippingRegion)`
  - **Description**: Sets a rectangular clipping region for all subsequent brush strokes. When this clipping region is active, brush strokes outside this area will not be rendered. This is particularly useful for ensuring that strokes, such as lines and curves, are contained within a specified area. The clipping affects only stroke and hatch operations, not fill operations. The clipping remains in effect for all strokes drawn after the call to `brush.clip()` until `brush.noClip()` is used.
  - **Parameters**:
    - `clippingRegion` (Array): An array defining the clipping region as `[x1, y1, x2, y2]`, with `(x1, y1)` and `(x2, y2)` being the corners of the clipping rectangle.
  - **Usage**:
    ```javascript
    // Set a clipping region
    brush.clip([10, 10, 250, 200]);
    // Draw a line - it will be clipped according to the region
    brush.line(100, 90, 300, 40);

    // Remove the clipping region
    brush.noClip();
    // Draw another line - it will not be clipped
    brush.line(0, 0, 200, 300);
    ```

---

- `brush.noClip()`
  - **Description**: Disables the current clipping region, allowing subsequent brush strokes to be drawn across the entire canvas without being clipped. Use this function to revert to the default state where strokes are unrestricted.
  - **Usage**:
    ```javascript
    // Disable the clipping region
    brush.noClip();
    ```

---

<sub>[back to table](#table-of-functions)</sub>

### Stroke Operations

Stroke Operations encompass methods for manipulating and applying brushes to strokes (aka lines), providing artists with precise control over their brushwork.

---

- `brush.set(brushName, color, weight)`
  - **Description**: Selects and sets up the current brush with a specific name, color, and weight. This function is crucial for preparing the brush to draw strokes with the desired characteristics.
  - **Parameters**:
    - `brushName` (String): The name of the brush to be used.
    - `color` (String): The color for the brush, which can be specified as a HEX string.
    - `weight` (Number): The weight or size of the brush.
  - **Note**: This function will automatically activate stroke mode for subsequent geometries.
  - **Usage**:
    ```javascript
    // Set the "HB" brush with a specific blue color and weight factor 1
    brush.set("HB", "#002185", 1);
    ```
    By using `brush.set()`, you can quickly switch between different brushes, colors, and sizes, allowing for dynamic and varied stroke applications in your artwork.

---

 - `brush.pick(brushName)`
   - **Description**: Selects the current brush type based on the specified name. This function is used to change the brush type without altering its color or weight.
   - **Parameters**:
     - `brushName` (String): The name of the brush to set as current.
   - **Usage**:
    ```javascript
    // Set the current brush to "charcoal"
    brush.pick("charcoal");
    ```
    Use `brush.pick()` to switch between different brush types while maintaining the current color and weight settings.

---

- `brush.strokeStyle(r, g, b)` or `brush.strokeStyle(color)`
  - **Description**: Sets the color of the current brush. This function can take either RGB color components or a CSS color string. It also activates stroke mode for subsequent shapes.
  - **Parameters**:
    - `r` (Number|String): The red component of the color, a CSS color string.
    - `g` (Number): Optional. The green component of the color.
    - `b` (Number): Optional. The blue component of the color.
  - **Usage**:
    ```javascript
    // Set the brush color using RGB values
    brush.strokeStyle(105, 111, 34);
    // Or set the brush color using a HEX string
    brush.strokeStyle("#002185");
    ```
    Use `brush.strokeStyle()` to define the color of your brush strokes, enabling a diverse palette for your artwork.

---

- `brush.noStroke()`
  - **Description**: Disables the stroke for subsequent drawing operations. This function is useful when you want to draw shapes without an outline.
  - **Usage**:
    ```javascript
    // Disable stroke for the upcoming shapes
    brush.noStroke();
    ```
    `brush.noStroke()` is essential for creating drawings where only fill and no outline is desired.

---

- `brush.lineWidth(weight)`
  - **Description**: Sets the weight or size of the current brush. The specified weight acts as a multiplier to the base size of the brush, allowing for dynamic adjustments.
  - **Parameters**:
    - `weight` (Number): The weight to set for the brush.
  - **Returns**: None.
  - **Usage**:
    ```javascript
    // Set the brush stroke weight to 2.3 times the base size
    brush.lineWidth(2.3);
    ```
    `brush.lineWidth()` provides the flexibility to easily adjust the thickness of your brush strokes, enhancing the expressiveness of your drawing tools.

---

<sub>[back to table](#table-of-functions)</sub>

### Fill Operations

The Fill Management section focuses on managing fill properties for shapes, enabling complex fill operations with effects like bleeding to simulate watercolor-like textures. These methods set fill colors with opacity, control bleed intensity, and manage fill operations. The watercolor fill effect is inspired by Tyler Hobbs' generative art techniques.

** IMPORTANT: ** At the moment, fill operations expect an array of vertices in the clockwise direction. Otherwise, the fill will "bleed" to the inside, destroying the effect. I'll try to fix this on a forthcoming update.

---

- `brush.fillStyle(a, b, c, d)` or `brush.fill(color, opacity)`
  - **Description**: Sets the fill color and opacity for subsequent shapes, activating fill mode. This function can accept either RGB color components with opacity or a CSS color string with an optional opacity.
  - **Parameters**:
    - `a` (Number|String): The red component of the color or grayscale value, a CSS color string.
    - `b` (Number): Optional. The green component of the color or grayscale opacity if two arguments are used.
    - `c` (Number): Optional. The blue component of the color.
    - `d` (Number): Optional. The opacity of the color.
  - **Usage**:
    ```javascript
    // Set the fill color using RGB values and opacity
    brush.fillStyle(244, 15, 24, 75);
    // Or set the fill color using a HEX string and opacity
    brush.fillStyle("#002185", 110);
    ```
    `brush.fillStyle()` allows for detailed control over the color and transparency of the fill.

---

- `brush.noFill()`
  - **Description**: Disables the fill for subsequent drawing operations. Useful for creating shapes or lines without a fill.
  - **Usage**:
    ```javascript
    // Disable fill for the upcoming shapes
    brush.noFill();
    ```

---

- `brush.fillBleed(strength, direction)`
  - **Description**: Adjusts the bleed and texture levels for the fill operation, mimicking the behavior of watercolor paints. This function adds a natural and organic feel to digital artwork.
  - **Parameters**:
    - `strength` (Number): The intensity of the bleed effect, capped at 0.5.
    - `direction` (String): Optional. "out" or "in". Defines the direction of the bleed effect
    - `_borderIntensity` (Number): The intensity of the border watercolor effect, ranging from 0 to 1.
  - **Usage**:
    ```javascript
    // Set the bleed intensity and direction for a watercolor effect
    brush.fillBleed(0.3, "out");
    ```

---

- `brush.fillTexture(textureStrength, borderIntensity)`
  - **Description**: Adjusts the texture levels for the fill operation, mimicking the behavior of watercolor paints. This function adds a natural and organic feel to digital artwork.
  - **Parameters**:
    - `textureStrength` (Number): The texture of the fill effect, ranging from 0 to 1.
    - `borderIntensity` (Number): The intensity of the border watercolor effect, ranging from 0 to 1.
  - **Usage**:
    ```javascript
    // Set the fill texture and border intensity
    brush.fillTexture(0.6, 0.4);
    ```

---

<sub>[back to table](#table-of-functions)</sub>

### Hatch Operations

The Hatching section focuses on creating and drawing hatching patterns, which involves drawing closely spaced parallel lines. These functions offer control over the hatching style and application.

---

- `brush.hatch(dist, angle, options)`
  - **Description**: Activates hatching with specified parameters for subsequent geometries. This function enables the drawing of hatching patterns with controlled line spacing, angle, and additional stylistic options.
  - **Parameters**:
    - `dist` (Number): The distance between hatching lines, in canvas units.
    - `angle` (Number): The angle at which hatching lines are drawn, in RADIANS.
    - `options` (Object): Optional settings to affect the hatching style, including:
      - `rand`: Randomness in line placement (0 to 1 or false).
      - `continuous`: Whether to connect the end of a line with the start of the next.
      - `gradient`: Modifies the distance between lines to create a gradient effect (0 to 1 or false).
      - Defaults to `{rand: false, continuous: false, gradient: false}`.
  - **Usage**:
    ```javascript
    // Set hatching with specific distance, angle, and options
    brush.hatch(5, 30, {rand: 0.1, continuous: true, gradient: 0.3});
    ```

---

- `brush.noHatch()`
  - **Description**: Disables hatching for subsequent shapes. Use this function to return to normal drawing modes without hatching.
  - **Usage**:
    ```javascript
    // Disable hatching for upcoming shapes
    brush.noHatch();
    ```

---

- `brush.hatchStyle(brushName, color, weight)`
  - **Description**: Sets the brush type, color, and weight specifically for hatching. If not called, hatching will use the parameters defined by the current stroke settings.
  - **Parameters**:
    - `brushName` (String): The name of the brush to use for hatching.
    - `color` (String): The color for the brush, either as a CSS string.
    - `weight` (Number): The weight or size of the brush for hatching.
  - **Usage**:
    ```javascript
    // Set the hatching brush to "rotring" with green color and specific weight
    brush.hatchStyle("rotring", "green", 1.3);
    ```

---
In essence, the hatching system activates hatches for subsequent shapes, similarly to stroke and fill operations. However, you can also directly hatch multiple objects at once (and their intersections), if you proceed as described below
.

- `brush.hatchArray(polygons)`
  - **Description**: Creates a hatching pattern across specified polygons. This function applies the set hatching parameters to a single polygon or an array of polygons.
  - **Parameters**:
    - `polygons` (Array|Object): The polygon(s) to apply the hatching. Can be a single polygon object or an array of polygon objects.
  - **Note**: This is not the main, but an alternative way of applying hatches. Read above.
  - **Usage**:
    ```javascript
    // Define an array of polygons (reference in the classes section)
    let myPolygons = []
    for (let i = 0; i < 10; i++) {
       // We're creating 10 random triangles here
    			let p = new brush.Polygon([
          [random(width), random(height)],
          [random(width), random(height)],
          [random(width), random(height)],  
       ])
       myPolygons.push(p)
    }
    // Create hatching across specified polygons
    brush.hatchArray(myPolygons);
    ```
    `brush.hatchArray()` provides an efficient way to apply complex hatching patterns to a set of defined shapes.


---

<sub>[back to table](#table-of-functions)</sub>

### Erase Operations

The Erase section provides functions for removing content from the canvas with precise control.

---

- `brush.erase(color, alpha)`
  - **Description**: Activates erase mode for subsequent drawing operations. When active, shapes drawn will erase existing content rather than adding to it. The erase effect can be customized with a specific color and transparency level.
  - **Parameters**:
    - `color` (String|Color): Optional. The color to use for erasing. Defaults to the background color.
    - `alpha` (Number): Optional. The transparency level for the erase effect, ranging from 0 to 255. A higher value creates a more opaque erasure. Defaults to 255 (full erasure).
  - **Usage**:
    ```javascript 
    // Activate erase mode with a specific color and partial transparency
    brush.erase("white", 150);
    // Draw a circle that partially erases content
    brush.circle(300, 200, 75);
    ```
    Using `brush.erase()` allows for creative effects like partial erasure or colored erasure, useful for creating highlights or special effects.

---

- `brush.noErase()`
  - **Description**: Deactivates erase mode, returning to normal drawing operations. Any shapes drawn after calling this function will add content to the canvas rather than erasing.
  - **Usage**:
    ```javascript
    // Deactivate erase mode
    brush.noErase();
    // Resume normal drawing
    brush.line(50, 50, 250, 250);
    ```
    Use `brush.noErase()` when you've finished erasing and want to return to standard drawing operations.

---

<sub>[back to table](#table-of-functions)</sub>

### Geometry

This section details the functions for creating various shapes and strokes with the set brush, fill, and hatch parameters.

#### Lines, Strokes, Splines, and Plots

The following functions are only affected by stroke() operations, completely ignoring fill() and hatch().

---

- `brush.line(x1, y1, x2, y2)`
  - **Description**: Draws a line from one point to another using the current brush settings. This function is affected only by stroke operations and will not produce any drawing if `noStroke()` has been called.
  - **Parameters**:
    - `x1` (Number): The x-coordinate of the start point.
    - `y1` (Number): The y-coordinate of the start point.
    - `x2` (Number): The x-coordinate of the end point.
    - `y2` (Number): The y-coordinate of the end point.
  - **Usage**:
    ```javascript
    // Set the brush color and draw a line
    brush.strokeStyle("red");
    brush.line(15, 10, 200, 10);
    ```

---

- `brush.stroke(x, y, length, dir)`
  - **Description**: Draws a stroke that adheres to the currently selected vector field. Strokes are defined by a starting point, length, and direction. They are useful for creating lines that dynamically follow the flow of the vector field.
  - **Parameters**:
    - `x` (Number): The x-coordinate of the starting point.
    - `y` (Number): The y-coordinate of the starting point.
    - `length` (Number): The length of the line.
    - `dir` (Number): The direction in which to draw the line, measured anticlockwise from the x-axis.
  - **Usage**:
    ```javascript
    // Set a vector field and draw a flow line
    brush.field("seabed");
    brush.stroke(15, 10, 185, 0);
    ```

---

These three functions provide advanced control over the creation of strokes/paths, allowing for custom pressure and direction at different points along the path. This is a strange way of defining strokes, but intuitive when you think of them as bodily movements performed with the hands. You can create two types of strokes: "curve" or "segments". For curved strokes, the curvature at any point of the stroke is lerped between the nearest control points.

These functions allow for the creation of strokes with varied pressures and directions, mimicking the organic nature of hand-drawn strokes. For an application of these principles, see: [Enfantines II](https://art.arqtistic.com/Enfantines-2)

- `brush.beginStroke(type, x, y)`
  - **Description**: Initializes a new stroke, setting the type and starting position. The type determines the kind of Plot to create, either a "curve" or "segments".
  - **Parameters**:
    - `type` (String): The type of the stroke, either "curve" or "segments".
    - `x` (Number): The x-coordinate of the starting point of the stroke.
    - `y` (Number): The y-coordinate of the starting point of the stroke.
  - **Usage**:
    ```javascript
    // Begin a new curve stroke
    brush.beginStroke("curve", 15, 30);
    ```

- `brush.move(angle, length, pressure)`
  - **Description**: Adds a segment to the stroke, defining its path by specifying the angle, length, and pressure. This function is used after `brush.beginStroke()` and before `brush.endStroke()` to outline the stroke's trajectory and characteristics.
  - **Parameters**:
    - `angle` (Number): The initial angle of the segment, relative to the canvas, measured anticlockwise from the x-axis.
    - `length` (Number): The length of the segment.
    - `pressure` (Number): The pressure at the start of the segment, influencing properties like width.
  - **Usage**:
    ```javascript
    // Add two segments to the stroke
    brush.move(30, 150, 0.6);
    brush.move(75, 40, 1.1);
    ```

- `brush.endStroke(angle, pressure)`
  - **Description**: Completes the stroke path and triggers its rendering. This function defines the angle and pressure at the last point of the stroke path.
  - **Parameters**:
    - `angle` (Number): The angle of the curve at the end point of the stroke path.
    - `pressure` (Number): The pressure at the end of the stroke.
  - **Usage**:
    ```javascript
    // Complete the stroke with a specific angle and pressure
    brush.endStroke(-45, 0.8);
    ```

---

- `brush.spline(array_points, curvature)`
  - **Description**: Generates and draws a spline curve, a smooth curve defined by a series of control points. The curve connects the start and end points directly, using the other points in the array as control points to define the curve's path. The curvature parameter allows for adjusting the smoothness of the curve. Spline is maybe not the appropriate description, since these splines are basically segmented paths with rounded corners.
  - **Parameters**:
    - `array_points` (Array<Array<number>>): An array of points, where each point is an array of two numbers `[x, y]`.
    - `curvature` (Number): Optional. The curvature of the spline curve, ranging from 0 to 1. A curvature of 0 results in a series of straight segments.
  - **Note**: This is a simplified alternative to beginShape() - endShape() operations, useful for certain stroke() applications.
  - **Usage**:
    ```javascript
    // Define points for the spline curve
    let points = [[30, 70], [85, 20], [130, 100], [180, 50]];
    // Create a spline curve with a specified curvature
    brush.spline(points, 0.5);
    ```

---

#### Shapes and Polygons

The following functions are affected by stroke(), fill() and hatch() operations.

---

- `brush.rect(x, y, w, h, mode)`
  - **Description**: Draws a rectangle on the canvas. This shape adheres to the current stroke, fill, and hatch attributes. Rectangles are influenced by active vector fields.
  - **Parameters**:
    - `x` (Number): The x-coordinate of the rectangle.
    - `y` (Number): The y-coordinate of the rectangle.
    - `w` (Number): The width of the rectangle.
    - `h` (Number): The height of the rectangle.
    - `mode` (Boolean): Optional. If `CENTER`, the rectangle is drawn centered at `(x, y)`.
  - **Usage**:
    ```javascript
    brush.noStroke();
    brush.noHatch();
    brush.fill("#002185", 75);
    brush.rect(150, 100, 50, 35, CENTER);
    ```

---

- `brush.circle(x, y, radius, r)`
  - **Description**: Draws a circle on the canvas, using the current brush settings. If `r` is true, the circle is rendered with a hand-drawn style. Circles are affected by vector fields.
  - **Parameters**:
    - `x` (Number): The x-coordinate of the circle's center.
    - `y` (Number): The y-coordinate of the circle's center.
    - `radius` (Number): The radius of the circle.
    - `r` (Boolean): Optional. When true, applies a hand-drawn style to the circle.
  - **Usage**:
    ```javascript
    brush.circle(100, 150, 75, true);
    ```

---

These next five functions allow you to draw custom shapes, with fine control over brush pressure at the different points of the perimeter.

- `brush.beginPath(curvature)`
  - **Description**: Initiates the creation of a custom shape by starting to record vertices. An optional curvature can be defined for the vertices.
  - **Parameters**:
    - `curvature` (Number): Optional. A value from 0 to 1 that defines the curvature of the shape's edges.
  - **Returns**: None.
  - **Usage**:
    ```javascript
    // Begin defining a custom shape with a specified curvature
    brush.beginPath(0.3);
    ```

- `brush.moveTo(x, y, pressure)`
  - **Description**: Initiates the creation of a subPath, just like the ctx.moveTo function in the Canvas API. The coordinates will define the starting point for the shape.
  - **Parameters**:
    - `x` (Number): The x-coordinate of the vertex.
    - `y` (Number): The y-coordinate of the vertex.
    - `pressure` (Number): Optional. The pressure at the vertex, affecting properties like width.
  - **Usage**:
    ```javascript
    // Begin defining a custom shape with a specified curvature
    brush.moveTo(50, 100);
    ```

- `brush.lineTo(x, y, pressure)`
  - **Description**: Adds a vertex to the custom shape currently being defined. An optional pressure parameter can be applied at each vertex.
  - **Parameters**:
    - `x` (Number): The x-coordinate of the vertex.
    - `y` (Number): The y-coordinate of the vertex.
    - `pressure` (Number): Optional. The pressure at the vertex, affecting properties like width.
  - **Usage**:
    ```javascript
    // Add vertices to the custom shape
    brush.vertex(100, 150, 0.5);
    brush.vertex(150, 100);
    ```

- `brush.closePath()`
  - **Description**: The current subpath can be closed with this function
  - **Usage**:
    ```javascript
    // Close the custom subpath
    brush.closePath();
    ```

- `brush.endPath()`
  - **Description**: Completes the custom shape, finalizing the recording of vertices. The function also triggers the rendering of the shape with the current stroke, fill, and hatch settings.
  - **Usage**:
    ```javascript
    // Finish the custom shape and close it with a straight line
    brush.endPath();
    ```

---

- `brush.polygon(pointsArray)`
  - **Description**: Creates and draws a polygon based on a provided array of points. This function is useful for drawing shapes that are not affected by vector fields, offering an alternative to the `beginShape()` and `endShape()` approach.
  - **Parameters**:
    - `pointsArray` (Array): An array of points, where each point is an array of two numbers `[x, y]`.
  - **Note**: This is a simplified alternative to beginShape() - endShape() operations, useful for certain fill() and hatch() applications.
  - **Usage**:
    ```javascript
    // Define a polygon using an array of points
    let points = [[x1, y1], [x2, y2], ...];
    brush.polygon(points);
    ```
    `brush.polygon()` is ideal for drawing fixed shapes that remain unaffected by vector fields, providing precise control over their form and appearance.

---

<sub>[back to table](#table-of-functions)</sub>

### Exposed Classes

Exposed Classes provide foundational elements for creating and manipulating shapes and paths, as well as interacting with vector-fields in a more advanced manner.

---

#### Class: `brush.Polygon`

- **Description**: Represents a polygon defined by a set of vertices. The `Polygon` class is essential for creating and working with multi-sided shapes, offering various methods to manipulate and render these shapes.

- **Constructor**:
  - `brush.Polygon(pointsArray)`
    - `pointsArray` (Array): An array of points, where each point is an array of two numbers `[x, y]`.

- **Methods**:
  - `.intersect(line)`
    - Intersects the polygon with a given line, returning all intersection points.
    - Parameters:
      - `line` (Object): A line object with properties `point1` and `point2`.
    - Returns: `Array` of objects, each with `x` and `y` properties, representing the intersection points.
  - `.draw(brush, color, weight)`
    - Draws the polygon on the canvas, following the current stroke state or the provided params.
  - `.fill(color, opacity, bleed, texture)`
    - Fills the polygon on the canvas, adhering to the current fill state or to the provided params.
  - `.hatch(distance, angle, options)`
    - Applies hatching to the polygon on the canvas, based on the current hatch state or the provided params.

- **Attributes**:
  - `.vertices`: An array of the polygon's vertices, each vertex being an object with `x` and `y` properties.
  - `.sides`: An array representing the different segments that make up the polygon.

---

#### Class: `brush.Plot`

- **Description**: The `Plot` class is crucial for the plot system, managing a collection of segments to create a variety of shapes and paths. It enables intricate designs, such as curves and custom strokes, by defining each segment with an angle, length, and pressure. `Plot` instances can be transformed through rotation, and their appearance controlled via pressure and angle calculations.

- **Constructor**:
  - `brush.Plot(_type)`
    - `_type` (String): The type of plot, either "curve" or "segments".

- **Methods**:
  - `.addSegment(_a, _length, _pres)`
    - Adds a segment to the plot.
    - Parameters:
      - `_a` (Number): The angle of the segment.
      - `_length` (Number): The length of the segment.
      - `_pres` (Number): The pressure of the segment.
  - `.endPlot(_a, _pres)`
    - Finalizes the plot with the last angle and pressure.
    - Parameters:
      - `_a` (Number): The final angle of the plot.
      - `_pres` (Number): The final pressure of the plot.
  - `.rotate(_a)`
    - Rotates the entire plot by a specified angle.
    - Parameters:
      - `_a` (Number): The angle for rotation.
  - `.genPol(_x, _y)`
    - Generates a polygon based on the plot.
    - Parameters:
      - `_x` (Number): The x-coordinate for the starting point.
      - `_y` (Number): The y-coordinate for the starting point.
    - Returns: `Polygon` - The generated polygon.
  - `.draw(x, y)`
    - Draws the plot on the canvas with current stroke() state.
    - Parameters:
      - `x` (Number): The x-coordinate to draw at.
      - `y` (Number): The y-coordinate to draw at.
  - `.fill(x, y)`
    - Fills the plot on the canvas with current fill() state.
    - Parameters:
      - `x` (Number): The x-coordinate to fill at.
      - `y` (Number): The y-coordinate to fill at.
  - `.hatch(x, y)`
    - Hatches the plot on the canvas with current hatch() state.
    - Parameters:
      - `x` (Number): The x-coordinate to hatch at.
      - `y` (Number): The y-coordinate to hatch at.

- **Attributes**:
  - `.segments`: An array containing the lengths of all segments.
  - `.angles`: An array of angles at the different control points.
  - `.press`: An array with custom brush pressures at the various control points.
  - `.type`: The type of the plot, either "curve" or "segments".
  - `.pol`: Stores the generated polygon object after executing the `.genPol()` method.

---

#### Class: `brush.Position`

- **Description**: The `Position` class represents a point within a two-dimensional space, capable of interacting with a vector field. It includes methods for updating the position based on the field's flow, allowing for movement through the vector field in various ways.

- **Constructor**:
  - `brush.Position(x, y)`
    - `x` (Number): The initial x-coordinate.
    - `y` (Number): The initial y-coordinate.

- **Methods**:
  - `.moveTo(_length, _dir, _step_length, isFlow)`
    - Moves the position along the flow field by a specified length.
    - Parameters:
      - `_length` (Number): The length to move along the field.
      - `_dir` (Number): The direction of movement, with angles measured anticlockwise from the x-axis.
      - `_step_length` (Number): The length of each step.
      - `isFlow` (Boolean): Whether to use the flow field for movement.
  - `.plotTo(_plot, _length, _step_length, _scale)`
    - Plots a point to another position within the flow field, following a given `Plot` object.
    - Parameters:
      - `_plot` (Position): The `Plot` path object.
      - `_length` (Number): The length to move towards the target position.
      - `_step_length` (Number): The length of each step.
      - `_scale` (Number): The scaling factor for the plotting path.
  - `.angle()`
    - Returns vector-field angle for that position.
  - `.reset()`
    - Resets the `plotted` property to 0. This property tracks the distance moved since the last reset or the creation of the position. Important for consecutive different `Plot` paths.

- **Attributes**:
  - `.x`: The current x-coordinate.
  - `.y`: The current y-coordinate.
  - `.plotted`: Stores the distance moved since the last reset or the creation of the position.


## Examples

- TBD

## Contributing
We welcome contributions from the community. If you find a bug or have a feature request, please open an issue on Github.

## License
brush.js is released under the MIT License. See the LICENSE file for details.

## Acknowledgements
- The fill() operations followed the steps explained by Tyler Hobbs [here](https://tylerxhobbs.com/essays/2017/a-generative-approach-to-simulating-watercolor-paints)
- The realistic color blending is calculated with [spectral.js](https://github.com/rvanwijnen/spectral.js), by Ronald van Wijnen
