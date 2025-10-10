let particles = [];
let flowfield;
let cols, rows;
let scl = 30; 
let zoff = 0;
let inc = 0.1;

function setup() {
  createCanvas(innerWidth, innerHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);
  
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);
  
  for (let i = 0; i < 1000; i++) {
    particles[i] = new Particle();
  }
}

function draw() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(0.5);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
  }
  zoff += 0.002;
  
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 3;
    this.hue = random(180, 300); 
  }
  
  follow(vectors) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  show() {
    stroke(this.hue, 80, 100, 10);
    strokeWeight(1.5);
    point(this.pos.x, this.pos.y);
  }
  
  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
} //Did this artwork with some help from a friend 