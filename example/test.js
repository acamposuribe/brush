let palette1 = [
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

let palette = [
  "#f9da49",
  "#bfbfbf",
  "black",
  "#bd8346"
];

let x_values = [];
let y_values = [];

// Create main canvas
const canvas = document.createElement("canvas");
canvas.classList.add("canvas");
canvas.setAttribute("id", "main");
canvas.width = 1000;
canvas.height = 1000;
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

// Load brush library
brush.load("main", canvas);

// Scale brushes to canvas
brush.scaleBrushes(6);

brush.background(245);

color = [], size = [], dir = [], position = [];

let number = 20;

for (let i = 0; i < number; i++) {
  position.push(new brush.Position(brush.random(0, canvas.width), brush.random(0, canvas.height)));
  dir.push(brush.random(0, 360));
  color.push(brush.random(palette1));
  size.push(brush.random(6, 10));
}

// Draw Loop
const draw = () => {
  
  brush.save();

  brush.wiggle(10)


  for (let i = 0; i < number; i++) {
    brush.set("HB", color[i], 1);
    position[i].moveTo(8, dir[i])
    brush.circle(
      position[i].x,
      position[i].y,
      size[i]
    );
  }

  brush.noField();

  brush.erase(255, 10)
  brush.rect(0,0,canvas.width, canvas.height)
  brush.noErase();

  /*

  brush.noFill();

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

  brush.wiggle(5)

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

  brush.wiggle(1);

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
    angles.push(brush.random(0, Math.PI));
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
  brush.wiggle(5)

  for (let i = 0; i < 5; i++) {
    brush.set("charcoal", brush.random(palette), 0.6);
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

  //brush.noLoop();
};

brush.frameRate(30);

setTimeout(() => {
  brush.loop(draw);
}, "200");


// utility functions

function hatchRect(x, y, w, l, angle, color) {
  brush.save();
  brush.translate(x, y);
  let add = brush.random(-0.1, 0.1) * Math.PI;
  brush.hatchStyle("charcoal", color, 0.7);
  brush.hatch(brush.random(4, 9), angle + add, {
    continuous: true,
    rand: brush.random(0.2, 0.35),
    gradient: brush.random(0.2, 0.6),
  });

  brush.circle(0, 0, w / 2);
  brush.rotate((Math.PI / 2) * ~~brush.random(0, 4));
  brush.hatchStyle("charcoal", color, 0.2);
  brush.hatch(brush.random(2, 6), angle - add, {
    continuous: true,
    rand: brush.random(0.2, 0.35),
    gradient: 0.2,
  });
  brush.circle(0, 0, w / 2);
  brush.restore();
}