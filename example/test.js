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
canvas.width = 2000;
canvas.height = 2000;
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

// Load brush library
brush.load("main", canvas);

// Scale brushes to canvas
brush.scaleBrushes(8);

brush.background(245);

color = [], size = [], dir = [], position = [];

let number = 20;

for (let i = 0; i < number; i++) {
  position.push(new brush.Position(brush.random(0, canvas.width), brush.random(0, canvas.height)));
  dir.push(brush.random(0, 360));
  color.push(brush.random(palette1));
  size.push(brush.random(200, 400));
}

// Draw Loop
const draw = () => {
  
  brush.save();

  /*
  
  brush.wiggle(10)

  for (let i = 0; i < number; i++) {
    brush.set("HB", color[i], 1);
    position[i].moveTo(dir[i], brush.random(10,20), 1)
    brush.circle(
      position[i].x,
      position[i].y,
      size[i]
    );
  }

  brush.wiggle(0);

  brush.erase(255, 10)
  brush.rect(0,0,canvas.width, canvas.height)
  brush.noErase();

  */
  for (let i = 0; i < 5; i++) {
    brush.fillBleed(brush.random(0.4,0.8))
    brush.fillTexture(0.6,0.6)
    brush.fillStyle(brush.random(palette1),70);
    brush.noStroke();
    brush.circle(
      position[i].x,
      position[i].y,
      size[i]
    )
  }
  /*

  brush.noFill();

  brush.wiggle(5)

  for (let i = 0; i < 5; i++) {
    brush.set("charcoal", brush.random(palette1), 1);
    brush.rect(
      brush.random(400, canvas.width - 400),
      brush.random(400, canvas.height - 400),
      brush.random(400, 600),
      brush.random(400, 800),
      "center"
    );
  }
  brush.noStroke();

  brush.wiggle(1.5);

  // Crayon circles
  let colors = [];
  let coords = [];
  let angles = [];
  for (let i = 0; i < 2; i++) {
    colors.push(brush.random(palette1));
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
    brush.refreshField();
    hatchRect(co[0], co[1], 600, 600, angles[i], c);
    brush.refreshField();
    hatchRect(co[0], co[1], 600, 600, angles[i], c);
  }

  // Crayon line rectangles
  brush.wiggle(5)

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

brush.frameRate(30);

setTimeout(() => {
  brush.loop(draw);
}, "200");


// utility functions

function hatchRect(x, y, w, l, angle, color) {
  brush.save();
  brush.translate(x, y);
  for (let i = 0; i < 3; i++) {
    let add = brush.random(-0.1, 0.1) * Math.PI;
    brush.hatchStyle("2H", color, 1);
    brush.hatch(brush.random(5, 10), angle + add, {
      continuous: true,
      rand: brush.random(0.1, 0.5),
      gradient: brush.random(0.2, 0.4),
    });
    brush.circle(0, 0, w / 2);
  }
  brush.restore();
}