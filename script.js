let particles = [];
let flowfield = [];
let cols, rows;
let resolution = 40;

function setup() {
    createCanvas(innerWidth, innerHeight);

  colorMode(HSB, 360, 100, 100, 100);
  background(0);
  
  cols = floor(width / resolution);
  rows = floor(height / resolution);
  
  for (let i = 0; i < cols * rows; i++) {
    flowfield[i] = p5.Vector.random2D();
  }

  for (let i = 0; i < 1500; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  noStroke();
  fill(0, 0, 0, 8); // fade trail
  rect(0, 0, width, height);
  
  // Perlin flow update
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * 0.003) * TWO_PI * 2;
      flowfield[index] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  // particles
  for (let p of particles) {
    p.follow(flowfield);
    p.update();
    p.show();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.hue = random(200, 280); 
  }

  follow(vectors) {
    let x = floor(this.pos.x / resolution);
    let y = floor(this.pos.y / resolution);
    let index = x + y * cols;
    let force = vectors[index];
    if (force) this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    stroke(this.hue, 80, 100, 50);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
    this.hue += 0.2;
    if (this.hue > 360) this.hue = 200;
  }
}

//  a bit similar to our project, basic now, took even help from Ai , not finish 