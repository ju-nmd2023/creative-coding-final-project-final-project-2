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

// ljud
let osc, filter, lfo;
let playing = false;

function setup() {
  createCanvas(innerWidth, innerHeight);
  colorMode(HSB, 360, 100, 100, 150);
  background(0);

  // Partiklar
  cols = floor(width / resolution);
  rows = floor(height / resolution);
  for (let i = 0; i < cols * rows; i++) flowfield[i] = p5.Vector.random2D();
  for (let i = 0; i < 3000; i++) particles.push(new Particle());

  // handpose
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose = ml5.handpose(video, () => console.log("laddad"));
  handpose.on("predict", results => predictions = results);

// sine osc
let osc1 = new Tone.Oscillator("C4", "sine").start();
let osc2 = new Tone.Oscillator("E4", "sine").start();
let osc3 = new Tone.Oscillator("G4", "sine").start();

// flow 
osc1.detune.value = -10;
osc2.detune.value = 5;
osc3.detune.value = 15;

// smoother
let filter = new Tone.Filter(500, "lowpass").toDestination();

// oscillatorerna till filtret
osc1.connect(filter);
osc2.connect(filter);
osc3.connect(filter);

// lfo filterfrek
let lfo = new Tone.LFO(0.1, 400, 1200); // väldigt lång
lfo.connect(filter.frequency);
lfo.start();

// Reverb 
let reverb = new Tone.Reverb({ decay: 8, wet: 0.4 }).toDestination();
filter.connect(reverb);

osc1.volume.value = -36;
osc2.volume.value = -36;
osc3.volume.value = -36;  
}

function draw() {
  noStroke();
  fill(0, 0, 0, 8);
  rect(0, 0, width, height);

  // Ffowfield
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

  // handdetektion me null
  let handTarget = null;
  if (predictions.length > 0) {
    handActive = true;
    let hand = predictions[0].landmarks[9];
    handTarget = createVector(
      map(hand[0], 0, video.width, 0, width),
      map(hand[1], 0, video.height, 0, height)
    );
  } else handActive = false;

  // Update particles
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


function mousePressed() {
  explode = true;
  explodePos = createVector(mouseX, mouseY);
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
  //reverses the particles when muse is clicked
  follow(vectors) {
    let x = floor(this.pos.x / resolution);
    let y = floor(this.pos.y / resolution);
    let index = x + y * cols;
    let force = vectors[index];
    if (force) {
      if (mouseIsPressed) {
        let reversed = force.copy().rotate(PI);
        this.applyForce(reversed);
      } else this.applyForce(force);
    }
  }
//rör sig till mål
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;
    if (d < 150) speed = map(d, 0, 150, 0, this.maxSpeed);
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    this.applyForce(steer); //method for acc 
  }
//närmare d är ju snabbare it will be
  explode() {
    let dir = p5.Vector.sub(this.pos, explodePos);
    let d = dir.mag();//mäter avs
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
//lägger acc 
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
    if (isHandActive) stroke(0, 0, 100); //ritar
    else stroke(this.hue, 80, 100, glow);
    strokeWeight(this.size * pulse);
    point(this.pos.x, this.pos.y);
    if (!isHandActive) {
      this.hue += 0.5;
      if (this.hue > 360) this.hue = 200;
    }
  }
}
//we made this artpiece with help from AI (eg. logic, examples, and explenation), examples from lectures, and some parts were made with help from a friend 