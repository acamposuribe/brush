let palette = ["#002185", "#fcd300", "#ff2702", "#6b9404"];

let x_values = [];
let y_values = [];

// Create main canvas
const canvas = document.createElement("canvas");
canvas.classList.add("canvas");
canvas.setAttribute("id", "main");
canvas.width = 1200;
canvas.height = 1750;

var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

brush.load("main", canvas);
brush.set("pen", "#ff2702", 1.6);

brush.field("handwriting");

brush.scaleBrushes(7);
brush.bleed(0.5);
brush.fillTexture(0.7, 0.6);

brush.add("tiza", {
  type: "custom",
  weight: 3,
  vibration: 0.08,
  opacity: 15,
  spacing: 2,
  blend: true,
  pressure: {
    type: "standard",
    min_max: [1.35, 0.7],
    curve: [0.35, 0.15], // Values for the bell curve
  },
  tip: (_m) => {
    _m.rotate(45), _m.rect(-5, -5, 15, 15);
    _m.rect(-10, -10, 5, 5);
  },
  rotate: "natural",
});

let rr = brush.random();

const Loop = () => {
  brush.background(255);

  brush.save();

  /*
  brush.fill(brush.random(palette), 60);
  brush.translate(canvas.width / 2, canvas.height / 2);
  brush.rect(75, 75, 300, 300, "center");
  */

  brush.translate(100, 90);

  brush.stroke("#ff2702");
  brush.rect(200, 200, 600, 600);

  brush.hatch(9, 0, { continuous: true, rand: 0.08 });
  brush.setHatch("charcoal", "#ff2702", 0.7);
  brush.rect(200, 200, 600, 100);
  brush.noHatch();

  brush.stroke("#002185");
  brush.rect(170, 450, 120, 900);

  brush.hatch(7, Math.PI / 2, { rand: 0.05 });
  brush.setHatch("charcoal", "#002185", 0.7);
  brush.rect(170, 1350, 120, 120);

  brush.noHatch();
  brush.rect(420, 690, 120, 760);
  brush.flowLine(480, 800, 570, -Math.PI / 2);
  brush.flowLine(480, 1370, 100, -Math.PI / 2 + Math.PI / 5);
  brush.flowLine(480, 1370, 100, -Math.PI / 2 - Math.PI / 5);

  brush.rect(680, 80, 120, 120);
  brush.circle(740, 140, 45);

  brush.stroke("#ff2702");
  brush.beginShape(0);
  brush.vertex(710, 1370, 1);
  brush.vertex(710, 720, 1);
  brush.vertex(820, 720, 1);
  brush.vertex(820, 1370, 1);
  brush.endShape();

  brush.circle(765, 1390, 58);

  brush.restore();
  brush.noLoop();
}

brush.loop(Loop)