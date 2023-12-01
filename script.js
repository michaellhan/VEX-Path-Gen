let field;
let coordinatesElement;

function preload() {
  field = loadImage('field.png');
}

function setup() {
  const canvas = createCanvas(field.width, field.height);
  canvas.parent('canvas-container');
  coordinatesElement = document.getElementById('coordinates');
}

function draw() {
  background(field);
  if (mouseIsPressed) {
    fill(255, 0, 0);
    ellipse(mouseX, mouseY, 10);
    const x = mouseX - width / 2;
    const y = mouseY - height / 2;
    coordinatesElement.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
  }
}