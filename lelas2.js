let particles = [];
let flowfield = [];
let cols, rows;
let resolution = 30;

function setup() {
    createCanvas(innerWidth, innerHeight);
  cols = floor(width / resolution);
  rows = floor(height / resolution);

  //  flowfield
  for (let i = 0; i < cols * rows; i++) {
    flowfield[i] = p5.Vector.random2D();
  }

  // partiklar
  for (let i = 0; i < 5000; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(20, 20, 30, 10); //skuggan

  // Uppdatera flowfield med perlin-noise
  let yoff = 5;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * 0.02) * TWO_PI * 4;
      flowfield[index] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 50;
  }

  // Update the pic
  for (let p of particles) {
    p.follow(flowfield);
    p.update();
    p.show();
  }
}

// particles
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1;
    this.hue = random(360);
  }

  follow(vectors) {
    let x = floor(this.pos.x / resolution);
    let y = floor(this.pos.y / resolution);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show() {
    stroke(this.hue, 200, 255, 50);
    strokeWeight(5);
    colorMode(HSB, 360, 255, 255, 200);
    point(this.pos.x, this.pos.y);
    this.hue = (this.hue + 0.5);
  }
}
//Help from AI then the lectures
