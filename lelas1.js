let particles = [];
let flowfield = [];
let cols, rows;
let resolution = 30;

function setup() {
    createCanvas(innerWidth, innerHeight);
  cols = floor(width / resolution);
  rows = floor(height / resolution);

  // flowfield
  for (let i = 0; i < cols * rows; i++) {
    flowfield[i] = p5.Vector.random2D();
  }

  // partiklar
  for (let i = 0; i < 2000; i++) {
    particles.push(new Particle());
  }

  colorMode(HSB, 360, 255, 255, 200);
  background(20);
}

function draw() {
  // uppdatera flowfield
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * 0.01) * TWO_PI;
      flowfield[index] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  // partiklar
  for (let p of particles) {
    p.follow(flowfield);
    p.update();
    p.edges();
    p.show();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.prevPos = this.pos.copy();
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
    stroke(this.hue, 200, 255, 30);
    strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
    this.hue = (this.hue + 0.2) % 360; // slowly changing color
  }

  updatePrev() {
    this.prevPos.set(this.pos);
  }

  edges() {
    if (this.pos.x > width) { this.pos.x = 0; this.updatePrev(); }
    if (this.pos.x < 0) { this.pos.x = width; this.updatePrev(); }
    if (this.pos.y > height) { this.pos.y = 0; this.updatePrev(); }
    if (this.pos.y < 0) { this.pos.y = height; this.updatePrev(); }
  }
}
///Helped from AI and lectures( pretty much math) and a friend