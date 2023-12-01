let field;
let coordinatesElement;
let canvasWidth = 720; // Set the width of the canvas
let canvasHeight = 720; // Set the height of the canvas
let dots = []; // Array to store the coordinates of the dots

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
  fill(255, 0, 0, 100); // Set the color to red with 40% opacity
  for (let dot of dots) {
    ellipse(dot.x, dot.y, 10);
  }
  if (mouseIsPressed && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    const x = (mouseX - width / 2) / (width / 2) * 72;
    const y = (mouseY - height / 2) / (height / 2) * 72;
    dots.push({x: mouseX, y: mouseY}); // Add the dot to the array
    coordinatesElement.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
  }
}