let field;
let coordinatesElement;
let dotsElement;
let canvasWidth = 720; // Set the width of the canvas
let canvasHeight = 720; // Set the height of the canvas
let dots = []; // Array to store the coordinates of the dots

function preload() {
  field = loadImage('field.png');
}

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  canvas.elt.oncontextmenu = (e) => e.preventDefault(); // Disable context menu on the canvas
  field.resize(canvasWidth, canvasHeight); // Resize the image to fit the canvas
  coordinatesElement = document.getElementById('coordinates');
  dotsElement = document.getElementById('dots');
}

function draw() {
  background(field);
  fill(255, 0, 0, 100); // Set the color to red with 40% opacity
  for (let dot of dots) {
    ellipse(dot.x, dot.y, 40); // Make each circle 4 times the size
  }
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    const x = (mouseX - width / 2) / (width / 2) * 72;
    const y = -(mouseY - height / 2) / (height / 2) * 72;
    coordinatesElement.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
  } else {
    coordinatesElement.textContent = '(?, ?)';
  }
}

function mouseClicked() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (mouseButton === LEFT) {
      const x = (mouseX - width / 2) / (width / 2) * 72;
      const y = -(mouseY - height / 2) / (height / 2) * 72;
      dots.push({x: mouseX, y: mouseY, displayX: Math.round(x), displayY: Math.round(y)}); // Add the dot to the array
      dotsElement.innerHTML += `<li>(${Math.round(x)}, ${Math.round(y)})</li>`;
    } else if (mouseButton === RIGHT) {
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        const distance = dist(mouseX, mouseY, dot.x, dot.y);
        if (distance < 40) { // If the click is within the circle
          dots.splice(i, 1); // Remove the dot from the array
          dotsElement.removeChild(dotsElement.childNodes[i]);
          break;
        }
      }
    }
  }
}