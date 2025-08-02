let palette = [
  "#002185",
  "#fcd300",
  "#6b9404",
  "#C64123",
  "#002185",
  "#7b4800",
  "#4e93cc",
  "#fce365",
  "#003c32",
];

const width = 1800,
  height = 2500;

brush.createCanvas(width, height); // Create main canvas and load library in a single line
brush.scaleBrushes(6.5); // Scale brushes to canvas
brush.background("#f6f6ec"); // Set background color
brush.wiggle(brush.random(1, 4)); // Set wiggle intensity for hand-drawn effect
brush.strokeStyle(brush.random(palette)); // Set brushes color

// Draw a random grid of circles that fills the canvas
const hMargin = 200;
const cols = ~~brush.random(10, 30);
const rows = Math.min(~~brush.random(15, 40), ~~((height / width) * cols));
const size = (width - hMargin * 2) / cols;
const vMargin = (height - size * rows) / 2;
const x = hMargin + size / 2,
  y = vMargin + size / 2;
for (let i = 0; i < cols; i++) {
  for (let j = 0; j < rows; j++) {
    brush.pick("pen"); // Pick brush
    brush.lineWidth(1.1); // Set width
    brush.circle(x + i * size, y + j * size, size / 2 - 2); // Draw circle
    brush.pick("2H"); // Pick brush
    brush.lineWidth(1.5); // Set width
    brush.circle(x + i * size, y + j * size, size / 2 - 2, true); // Draw circle
    brush.circle(x + i * size, y + j * size, size / 2 - 4, true); // Draw circle
  }
}
// Draw a rectangle around the grid
brush.pick("HB"); // Pick brush
brush.lineWidth(1); // Set width
brush.rect(hMargin, vMargin, width - 2 * hMargin, height - 2 * vMargin); // Draw rectangle

// Consolidate frame into canvas
brush.draw();
