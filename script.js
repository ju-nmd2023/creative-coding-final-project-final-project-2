let particles = [];
let flowfield = [];
let cols, rows;
let resolution = 40;

function setup() {
    createCanvas(innerWidth, innerHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(250);
  
  cols = floor(width / resolution);
  rows = floor(height / resolution);
  
  // slump
  for (let i = 0; i < cols * rows; i++) {
    flowfield[i] = p5.Vector.random2D();
  }

  // plats till par 
  for (let i = 0; i < 1500; i++) {
    
  }
}

function draw() {
  noStroke();
  fill(0, 0, 0, 8); // mjuk effekt
  rect(0, 0, width, height);
  
  // perlin noise upd
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * 0.003) * TWO_PI * 2;
      flowfield[index] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 0.1; // maybe byta
  }

}
//  a bit similar to our project, basic now, took even help from Ai , not finish 