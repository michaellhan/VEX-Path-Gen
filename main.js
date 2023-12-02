let field;
let coordinatesElement;
let dotsElement;
let canvasWidth = 720; // Set the width of the canvas
let canvasHeight = 720; // Set the height of the canvas
let dots = []; // Array to store the coordinates of the dots
let waypoints = [];
let selectedDot = null;
let draggedPointIndex = -1;
let offsetX = 0;
let offsetY = 0;
let numPoints = 15; // Set a default value for numPoints
let numPointsSlider; // Declare a global variable for the slider
let pathGenMethodDropdown;

function preload() {
  field = loadImage('field.png', () => {
    const aspectRatio = field.width / field.height;
    canvasHeight = windowHeight - 100; // Set canvas height to the user's screen height
    canvasWidth = canvasHeight * aspectRatio; // Calculate canvas width based on aspect ratio
    field.resize(canvasWidth, canvasHeight); // Resize the image to fit the canvas
  });
}

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  field.resize(canvasWidth, canvasHeight); // Resize the image to fit the canvas
  coordinatesElement = document.getElementById('coordinates');
  dotsElement = document.getElementById('dots');
  canvas.mousePressed(startDragging);
  canvas.mouseReleased(stopDragging);
  // Create the slider
  numPointsSlider = createSlider(1, 20, numPoints); // min, max, default value
  numPointsSlider.position(windowWidth / 2, 100); // Center the slider horizontally
  numPointsSlider.input(updateNumPoints); // Call updateNumPoints function when slider value changes
  // Position the slider and its label
  positionSlider();
  pathGenMethodDropdown = document.getElementById('path-gen-method');
  pathGenMethodDropdown.addEventListener('change', updatePathGenMethod);
}
function updatePathGenMethod() {
  let selectedMethod = pathGenMethodDropdown.value;
  if (selectedMethod === 'catmull-rom') {
    pathGenerated = catmullRom(waypoints, numPoints);
  } else if (selectedMethod === 'cubic-spline') {
    // Find the largest number n that is 1 mod 3 and less than or equal to the number of points
    let n = waypoints.length;
    while (n % 3 !== 1 && n > 3) {
      n--;
    }
    // Use the first n points to generate the path
    if (n >= 3) {
      pathGenerated = cubicSpline2(waypoints.slice(0, n), 2, 30);
    } else {
      console.log("Not enough points for cubic spline path generation");
    }
  }
}

function positionSlider() {
  const sliderX = windowWidth / 2; // X position for the slider (centered horizontally)
  const sliderY = 100; // Y position for the slider above the coordinates header
  numPointsSlider.position(sliderX, sliderY); // Adjust position as needed

  const labelX = windowWidth / 2; // X position for the label (centered horizontally)
  const labelY = 70; // Y position for the label above the slider
  const sliderLabel = select('#slider-label');
  sliderLabel.position(labelX, labelY); // Adjust position as needed
}

function updateNumPoints() {
  numPoints = numPointsSlider.value(); // Update numPoints with the slider value
}

function draw() {
  background(field);

  // Update the position of the dragged point
  if (draggedPointIndex !== -1) {
    dots[draggedPointIndex].x = mouseX + offsetX;
    dots[draggedPointIndex].y = mouseY + offsetY;
  }

  // Convert dots array into waypoints array with Point objects
  waypoints = dots.map(dot => new Point(dot.x, dot.y, dots.indexOf(dot)));

  const numPoints = numPointsSlider.value();

  // Check if waypoints array has points
  if (waypoints.length >= 1) {
    first = waypoints[0];
    second = waypoints[1];
    last = waypoints[waypoints.length - 1];
    secondToLast = waypoints[waypoints.length - 2];
    firstGhostPoint = (first.multiply(2)).subtract(second);
    waypoints.unshift(firstGhostPoint);

    lastGhostPoint = (secondToLast.multiply(2)).subtract(last);
    waypoints.push(lastGhostPoint)

    // Update the path generation method based on the dropdown selection
    updatePathGenMethod();

    // Draw the generated path
    noFill();
    beginShape();
    for (let i = 0; i < pathGenerated.length - 1; i++) {
      stroke(0, 255, 0); // Set path color
      strokeWeight(2); // Set path stroke weight
      line(pathGenerated[i].x, pathGenerated[i].y, pathGenerated[i + 1].x, pathGenerated[i + 1].y);
    }
    endShape();
  }


  // Drawing existing dots
  for (let dot of dots) {
    if (dot === selectedDot) {
      fill(255, 0, 0, 200); // Darken the selected dot
    } else {
      fill(255, 0, 0, 100);
    }
    ellipse(dot.x, dot.y, 15);
  }

  // Display coordinates
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
    for (let dot of dots) {
      const distance = dist(mouseX, mouseY, dot.x, dot.y);
      if (distance < 20) {
        if (dot === selectedDot) {
          selectedDot = null; // Deselect the dot if it's already selected
        } else {
          selectedDot = dot; // Select the dot
        }
        return;
      }
    }
    if (mouseButton === LEFT) {
      const x = (mouseX - width / 2) / (width / 2) * 72;
      const y = -(mouseY - height / 2) / (height / 2) * 72;
      dots.push({x: mouseX, y: mouseY, displayX: Math.round(x), displayY: Math.round(y)}); // Add the dot to the array
      dotsElement.innerHTML += `<li>(${Math.round(x)}, ${Math.round(y)})</li>`;
    }
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE && selectedDot) {
    const index = dots.indexOf(selectedDot);
    if (index !== -1) {
      dots.splice(index, 1); // Remove the selected dot from the array
      // loop here
      dotsElement.removeChild(dotsElement.childNodes[index]);
      selectedDot = null; // Deselect the dot
    }
  }
}

function startDragging() {
  for (let i = 0; i < dots.length; i++) {
    const d = dist(mouseX, mouseY, dots[i].x, dots[i].y);
    if (d < 20) {
      draggedPointIndex = i;
      offsetX = dots[i].x - mouseX;
      offsetY = dots[i].y - mouseY;
      break;
    }
  }
}

function stopDragging() {
  draggedPointIndex = -1;
}
