// Watercolor Fill Pipeline Test
// Exercises the new GPU-native watercolor fill system:
//   - SDF computation (Jump Flood Algorithm)
//   - Watercolor fluid simulation
//   - Compositing onto the canvas
//
// Expected result: shapes with soft watercolor fills, visible edge
// darkening, organic bleeding, and strokes rendered on top.

const W = 1200;
const H = 1600;

brush.profiling();

brush.createCanvas(W, H);
brush.scaleBrushes(4);
brush.background("#f2ede4");
//brush.strokeStyle("#2a4d80"); // darker blue stroke

brush.seed(123123)
brush.fillTexture(0.6,0.3);

// ---- Test 1: Basic watercolor rectangle fill --------------------------------
brush.fillBleed(0.01);
brush.fillStyle("#3a6ea5", 100);   // blue, 70% opacity
brush.pick("HB");
brush.lineWidth(1.2);
brush.rect(150, 120, 400, 300);

// ---- Test 2: Watercolor fill on a circle -----------------------------------
brush.fillBleed(0.2);
brush.fillStyle("#b84c3a", 65);   // red-terracotta
brush.pick("pen");
brush.lineWidth(1);
brush.circle(820, 280, 160);

// ---- Test 3: Bleed variation — tighter bleed (more contained) --------------
brush.fillBleed(0.05);
brush.fillStyle("#4e8c3a", 75);   // green
brush.pick("2H");
brush.lineWidth(1.4);
brush.rect(150, 520, 350, 280);

// ---- Test 4: Bleed variation — looser bleed (more organic spread) ----------
brush.fillBleed(0.6);
brush.fillStyle("#8b4fa0", 60);   // violet
brush.pick("HB");
brush.lineWidth(1.2);
brush.rect(600, 520, 380, 280);

// reset bleed to default
brush.fillBleed(0.2);

// ---- Test 5: Polygon (non-rectangular) fill --------------------------------
const poly = new brush.Polygon([
  [280, 960],
  [520, 880],
  [720, 1000],
  [640, 1180],
  [340, 1200],
  [160, 1080],
]);
brush.fillStyle("#c47a28", 72);   // amber
brush.pick("pen");
brush.lineWidth(1);
poly.show();

// ---- Test 6: Low opacity — should be very light, still show edge ring ------
brush.fillStyle("#002080", 35);   // dark blue, very transparent
brush.pick("2H");
brush.lineWidth(1.5);
brush.rect(750, 900, 320, 260);

// ---- Test 7: Overlapping fills — test compositing order -------------------
brush.fillStyle("#d44070", 60);   // pink
brush.pick("pen");
brush.lineWidth(1);
brush.circle(350, 1400, 130);

brush.fillStyle("#2070c8", 55);   // blue, overlaps pink
brush.pick("pen");
brush.lineWidth(1);
brush.circle(500, 1440, 130);

// Flush everything to the canvas
brush.draw();
