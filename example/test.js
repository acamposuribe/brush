let palette = ["#002185", "#fcd300", "#6b9404"];

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
brush.scaleBrushes(6);


// Pick a flowfield

brush.field("hand");


let vertexes = []
for (let i = 0; i < 8; i++) {
  vertexes.push([brush.random(0,canvas.width),brush.random(0, canvas.height)])
}

function shape() {
  brush.beginPath(1)
  for (let i = 0; i < vertexes.length; i++) {
    let v = vertexes[i]
    if (i==0) brush.moveTo(v[0],v[1])
    else brush.lineTo(v[0],v[1])
  }
  brush.closePath();
  brush.endPath();
}

function hatchRect(angle) {
  brush.refreshField();
  brush.hatch(brush.random(2,4),angle*brush.random(0.85,1.15),{rand: brush.random(0.1,0.3), gradient: brush.random(0.2,0.4)})
  shape()
}

// Draw Loop
const draw = () => {

  brush.background(255);

  brush.save();
  
  //brush.translate(500,500);


  brush.hatchStyle("2H", brush.random(palette), 0.5)
  for (let i=0; i < 35; i++) hatchRect(Math.PI/4);

  brush.hatchStyle("2H", brush.random(palette), 0.5)
  vertexes = []
for (let i = 0; i < 8; i++) {
  vertexes.push([brush.random(0,canvas.width),brush.random(0, canvas.height)])
}
for (let i=0; i < 35; i++) hatchRect(Math.PI/2);

  
  

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
  brush.endPath();

  brush.circle(765, 1390, 58);
  

  
  brush.restore()
  
  brush.noLoop();
};


brush.frameRate(10)
brush.loop(draw);