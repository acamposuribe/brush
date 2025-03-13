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

// Load brush library
brush.load("main", canvas);

// Scale brushes to canvas
brush.scaleBrushes(5);

brush.fillTexture(0.9, 0.7);

// Pick a flowfield
brush.field("hand");

let fff = brush.random()
console.log(fff)

brush.seed(fff)

// Draw Loop
const draw = () => {
  brush.background(255);

  brush.strokeStyle("#000000");
  

  brush.save();


  brush.pick("pen");
  brush.translate(100, 90);

  brush.strokeStyle("#ff2702");
  brush.rect(200, 200, 600, 600);


  brush.hatch(7, 0, { rand: 0.08 });
  brush.hatchStyle("charcoal", "#ff2702", 0.7);
  brush.rect(200, 200, 600, 100);

  
  brush.noHatch();


  brush.strokeStyle("#002185");
  brush.rect(170, 450, 120, 900);
  brush.hatch(7, Math.PI / 2, { rand: 0.05 });
  brush.hatchStyle("charcoal", "#002185", 0.7);
  brush.rect(170, 1350, 120, 120);

  brush.noHatch();
  brush.rect(420, 690, 120, 760);
  brush.stroke(480, 800, 570, -Math.PI / 2);
  brush.stroke(480, 1370, 100, -Math.PI / 2 + Math.PI / 5);
  brush.stroke(480, 1370, 100, -Math.PI / 2 - Math.PI / 5);



  brush.rect(680, 80, 120, 120);
  brush.circle(740, 140, 45);

  brush.strokeStyle("#ff2702");

  brush.beginPath();
  brush.moveTo(710, 1370, 1);
  brush.lineTo(710, 720, 1);
  brush.lineTo(820, 720, 1);
  brush.lineTo(820, 1370, 1);
  brush.drawPath();

  brush.circle(765, 1390, 58);
 
  

  brush.restore();
  brush.noLoop();
};

brush.loop(draw);
