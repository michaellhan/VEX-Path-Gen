let field;
let coordinatesElement;
let canvasWidth = 720; // Set the width of the canvas
let canvasHeight = 720; // Set the height of the canvas

function preload() {
  field = loadImage('field.png');
}

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  field.resize(canvasWidth, canvasHeight); // Resize the image to fit the canvas
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