function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 100);
  background(20);
}

function draw() {
  background(20);

  translate(width / 2, height / 2); 

  fill(30, 75, 100); 
  stroke(20);
  strokeWeight(2);
  ellipse(0, 0, 400, 400);

  noFill();
  stroke(0, 0, 100, 20); 
  strokeWeight(1);
  for (let r = 120; r <= 200; r += 15) {
    ellipse(0, 0, r * 2, r * 2);
  }

  fill(0, 0, 90);
  noStroke();
  ellipse(0, 0, 60, 60);

  for (let i = 0; i < 80; i++) { 
    let angle = random(TWO_PI);
    let radius = random(120, 200); 
    let x = radius * cos(angle);
    let y = radius * sin(angle);

    let alpha = 30 + 70 * sin(frameCount * 0.1 + i); 
    stroke(60, 20, 100, alpha);
    strokeWeight(random(1, 2));
    point(x, y);
  } //got some help from ai with the sparkles
}

