let particles = [];
let flowfield = [];
let cols, rows;
let resolution = 40;
let explode = false;
let explodePos;

let video;
let handpose;
let predictions = [];
let handActive = false;

// Tone.js
let synth;
let loop;

function setup() {
  createCanvas(innerWidth, innerHeight);
  colorMode(HSB, 360, 100, 100, 150);
  background(0);

  cols = floor(width / resolution);
  rows = floor(height / resolution);

  for (let i = 0; i < cols * rows; i++) {
    flowfield[i] = p5.Vector.random2D();
  }

  for (let i = 0; i < 3000; i++) {
    particles.push(new Particle());
  }

  // cam
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // handpose
  handpose = ml5.handpose(video, () => console.log("Handpose loaded"));
  handpose.on("predict", results => predictions = results);

  // Enkel Tone.js synth
  synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 1, decay: 2, sustain: 0.2, release: 2 }
  }).toDestination();

  // Starta Tone.js via user interaction
  userStartAudio();
}

function draw() {
  noStroke();
  fill(0, 0, 0, 8); 
  rect(0, 0, width, height);

  // flowfield
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * 0.002) * TWO_PI * 3;
      flowfield[index] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  // handpose
  let handTarget = null;
  if (predictions.length > 0) {
    handActive = true;
    let hand = predictions[0].landmarks[9];
    handTarget = createVector(map(hand[0], 0, video.width, 0, width),
                              map(hand[1], 0, video.height, 0, height));
  } else {
    handActive = false;
  }

  // partiklar
  for (let p of particles) {
    if (handActive) {
      p.stop();
    } else if (handTarget) {
      p.seek(handTarget);
    } else if (explode) {
      p.explode();
    } else {
      p.follow(flowfield);
    }
    p.update();
    p.show(handActive);
  }

  if (explode) explode = false;
}

function mouseReleased() {
  explode = true;
  explodePos = createVector(mouseX, mouseY);
}

// Starta lugn Tone.js-loop när användaren klickar
function mousePressed() {
  if (!loop) {
    loop = new Tone.Loop(time => {
      if (!handActive) {
        let freq = random(220, 330);
        synth.triggerAttackRelease(freq, 0.5);
      }
    }, "1n").start(0);
    Tone.Transport.start();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.maxSpeed = random(2, 4);
    this.hue = random(200, 280);
    this.size = random(1, 3);
  }

  follow(vectors) {
    let x = floor(this.pos.x / resolution);
    let y = floor(this.pos.y / resolution);
    let index = x + y * cols;
    let force = vectors[index];

    if (force) this.applyForce(force);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;
    if (d < 150) speed = map(d, 0, 150, 0, this.maxSpeed);
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    this.applyForce(steer);
  }

  explode() {
    let dir = p5.Vector.sub(this.pos, explodePos);
    let d = dir.mag();
    if (d > 0) {
      dir.normalize();
      dir.mult(20 / (d * 0.05 + 1));
      this.applyForce(dir);
    }
  }

  stop() {
    this.vel.mult(0);
    this.acc.mult(0);
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

  show(isHandActive) {
    let glow = map(sin(frameCount * 0.1 + this.pos.x * 0.01), -1, 1, 50, 150);
    let pulse = map(sin(frameCount * 0.05 + this.pos.y * 0.01), -1, 1, 0.5, 2);

    if (isHandActive) {
      stroke(0, 0, 100);
    } else {
      stroke(this.hue, 80, 100, glow);
    }

    strokeWeight(this.size * pulse);
    point(this.pos.x, this.pos.y);

    if (!isHandActive) {
      this.hue += 0.5;
      if (this.hue > 360) this.hue = 200;
    }
  }
}
