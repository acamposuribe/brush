let palette = ["#002185", "#fcd300", "#6b9404", "#fcd300", "#6b9404", "#C64123", "#002185", "#514221",
      "#7b4800",
      "#4e93cc",
      "#fce365",
      "#003c32",
      "#080f15",
      "#e2e7dc",];

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
brush.field("hand")

function hatchRect(x,y,w,l,angle, color) {
  for (let i=0; i < 12; i++) {
    let add = brush.random(-0.07,0.07) * Math.PI
    brush.hatchStyle("2H", color, 0.75)
    brush.refreshField();
    brush.hatch(brush.random(3,10),angle + add,{continuous: true, rand: brush.random(0.2,0.35), gradient: brush.random(0.2,0.6)})
    brush.rect(x,y,w,l)
  }
}

// Draw Loop
const draw = () => {
  brush.background(255);

  brush.save();
  
  let colors = []
  let coords = []
  let angles = []
  
  for (let i = 0; i < 6; i++) {
    colors.push(brush.random(palette))
    coords.push([brush.random(0,canvas.width-600),brush.random(canvas.height-600)])
    angles.push(brush.random(Math.PI/6,Math.PI/3))
  }

  for (let i = 0; i < colors.length; i++) {
    let c = colors[i]
    let co = coords[i]
    hatchRect(co[0],co[1],600,600,angles[i], c);
  }

  for (let i = 0; i < colors.length; i++) {
    let c = colors[i]
    let co = coords[i]
    hatchRect(co[0],co[1],600,600,angles[i], c);
  }

  brush.restore()
  
  brush.noLoop();
};

brush.frameRate(10);
brush.loop(draw)