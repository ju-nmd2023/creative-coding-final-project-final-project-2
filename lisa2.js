let cols, rows;
const spacing = 10; 
let t = 0; 

function setup() {
  createCanvas(innerWidth, innerHeight);
  noStroke();
  colorMode(HSB, 360, 100, 100);
  cols = width / spacing;
  rows = height / spacing;
}

function draw() {
  background(0); 

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * spacing;
      let y = j * spacing;
      
      let n = noise(i * 0.1, j * 0.1, t * 0.2);
      let offset = map(n, 0, 1, -spacing * 2, spacing * 2);
      
      let px = x + offset * cos(t + j * 0.05);
      let py = y + offset * sin(t + i * 0.05);
      
      let hue = map(n, 0, 1, 100, 300) + t * 20; 
      hue = hue % 360; 

      fill(hue, 80, 100);
      
      let d = map(n, 0, 1, 2, 8);
      circle(px, py, d);
    }
  }

  t += 0.03; 
}