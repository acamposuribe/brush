let palette = [
  "#002185",
  "#fcd300",
  "#6b9404",
  "#fcd300",
  "#6b9404",
  "#C64123",
  "#002185",
  "#7b4800",
  "#4e93cc",
  "#fce365",
  "#003c32",
  "#e2e7dc",
];

let x_values = [];
let y_values = [];

// Create main canvas
const canvas = document.createElement("canvas");
canvas.classList.add("canvas");
canvas.setAttribute("id", "main");
canvas.width = 2000;
canvas.height = 2600;
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

// Load brush library
brush.load("main", canvas);
// Scale brushes to canvas
brush.scaleBrushes(9);

// Pick a flowfield

function hatchRect(x, y, w, l, angle, color) {
  brush.save();
  brush.translate(x, y);
  let add = brush.random(-0.1, 0.1) * Math.PI;
  brush.hatchStyle("crayon", color, 0.7);
  brush.hatch(brush.random(4, 9), angle + add, {
    continuous: true,
    rand: brush.random(0.2, 0.35),
    gradient: brush.random(0.2, 0.6),
  });

  brush.circle(0, 0, w / 2);
  brush.rotate((Math.PI / 2) * ~~brush.random(0, 4));
  brush.hatchStyle("crayon", color, 0.5);
  brush.hatch(brush.random(2, 6), angle - add, {
    continuous: true,
    rand: brush.random(0.2, 0.35),
    gradient: 0.2,
  });
  brush.circle(0, 0, w / 2);
  brush.restore();
}

//brush.seed("hola");
brush.noiseSeed("hhhaa");

// Draw Loop
const draw = () => {
  brush.background(255);

  brush.save();
  brush.fillBleed(0.3);
  brush.noStroke();
  brush.fillTexture(1, 0.5);

  for (let i = 0; i < 10; i++) {
    brush.fillStyle(brush.random(palette), 70);
    brush.rect(
      brush.random(400, canvas.width - 400),
      brush.random(400, canvas.height - 400),
      brush.random(400, 600),
      brush.random(400, 800),
      "center"
    );
  }

  /*

  brush.set("charcoal", brush.random(palette), 1);
  brush.beginPath(1);
  brush.moveTo(300, 30, 1);
  for (let i = 0; i < 10; i++) {
    brush.lineTo(
      brush.random(400, canvas.width - 400),
      brush.random(400, canvas.height - 400),
      1
    );
  }
  brush.closePath();
  brush.endPath();

  brush.field("seabed");

  for (let i = 0; i < 4; i++) {
    brush.set("charcoal", brush.random(palette), 1);
    brush.rect(
      brush.random(400, canvas.width - 400),
      brush.random(400, canvas.height - 400),
      brush.random(400, 600),
      brush.random(400, 800),
      "center"
    );
  }
  brush.noStroke();

  brush.field("hand");

  // Crayon circles
  let colors = [];
  let coords = [];
  let angles = [];
  for (let i = 0; i < 8; i++) {
    colors.push(brush.random(palette));
    coords.push([
      brush.random(400, canvas.width - 400),
      brush.random(400, canvas.height - 400),
    ]);
    angles.push(brush.random(Math.PI / 6, Math.PI / 3));
  }
  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    let co = coords[i];
    hatchRect(co[0], co[1], 600, 600, angles[i], c);
  }
  brush.refreshField();
  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    let co = coords[i];
    hatchRect(co[0], co[1], 600, 600, angles[i], c);
  }
  brush.refreshField();
  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    let co = coords[i];
    hatchRect(co[0], co[1], 600, 600, angles[i], c);
  }

  // Crayon line rectangles
  brush.field("seabed");

  for (let i = 0; i < 5; i++) {
    brush.set("charcoal", brush.random(palette), 1);
    brush.rect(
      brush.random(400, canvas.width - 400),
      brush.random(400, canvas.height - 400),
      brush.random(400, 600),
      brush.random(400, 800),
      "center"
    );
  }

  */

  brush.restore();

  brush.noLoop();
};

brush.frameRate(10);
brush.loop(draw);
