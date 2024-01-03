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
let pathGenerated = [];
let pathGenMethodDropdown;
let downloadButton;
let selectedMethod;

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
  numPointsSlider = createSlider(1, 40, numPoints); // min, max, default value
  numPointsSlider.position(windowWidth / 2, 100); // Center the slider horizontally
  numPointsSlider.input(updateNumPoints); // Call updateNumPoints function when slider value changes
  // Position the slider and its label
  positionSlider();
  pathGenMethodDropdown = document.getElementById('path-gen-method');
  pathGenMethodDropdown.addEventListener('change', updatePathGenMethod);
  downloadButton = document.getElementById('download');
  downloadButton.addEventListener('click', downloadPath);
}

function updatePathGenMethod() {
  selectedMethod = pathGenMethodDropdown.value;
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

function downloadPath() {
  let data = "";
  for (let point of pathGenerated) {
    let convertedX = (point.x - canvasWidth / 2) / (canvasWidth / 2) * 72;
    let convertedY = -(point.y - canvasHeight / 2) / (canvasHeight / 2) * 72;
    data += `${convertedX}, ${convertedY}, ${point.speed}\n`;
  }
  let blob = new Blob([data], {type: "text/plain;charset=utf-8"});
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "path.txt"; // This is the default filename
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function updateNumPoints() {
  numPoints = numPointsSlider.value(); // Update numPoints with the slider value
}

function draw() {
  background(field);

  // Update the position of the dragged point
  if (draggedPointIndex !== -1) {
    let newX = mouseX + offsetX;
    let newY = mouseY + offsetY;

    const buffer = 12; // Set a buffer distance from the edge of the field

    // Check if the new position would be outside the field
    if (newX < buffer) newX = buffer;
    if (newX > canvasWidth - buffer) newX = canvasWidth - buffer;
    if (newY < buffer) newY = buffer;
    if (newY > canvasHeight - buffer) newY = canvasHeight - buffer;

    dots[draggedPointIndex].x = newX;
    dots[draggedPointIndex].y = newY;
  }

  // Convert dots array into waypoints array with Point objects
  waypoints = dots.map(dot => new Point(dot.x, dot.y, dots.indexOf(dot)));

  const numPoints = numPointsSlider.value();

  // Update the path generation method based on the dropdown selection
  updatePathGenMethod();

  if (selectedMethod === 'catmull-rom') {
    // Check if waypoints array has more than 1 points
    if (waypoints.length > 1) {
      first = waypoints[0];
      second = waypoints[1];
      last = waypoints[waypoints.length - 1];
      secondToLast = waypoints[waypoints.length - 2];
      firstGhostPoint = (first.multiply(2)).subtract(second);
      waypoints.unshift(firstGhostPoint);
  
      lastGhostPoint = (secondToLast.multiply(2)).subtract(last);
      waypoints.push(lastGhostPoint)

      // Path Generation
      pathGenerated = catmullRom(waypoints, numPoints);
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
    
  } 
  else if (selectedMethod === 'cubic-spline') {
    // Find the largest number n that is 1 mod 3 and less than or equal to the number of points
    let n = waypoints.length;
    while ((n % 3) != 1 && n > 3) {
      n--;
    }
    // Use the first n points to generate the path
    if (n > 3) {
      pathGenerated = cubicSpline2(waypoints.slice(0, n), 2, 30);
      // Draw the generated path
      noFill();
      beginShape();
      for (let i = 0; i < pathGenerated.length - 1; i++) {
        stroke(0, 255, 0); // Set path color
        strokeWeight(2); // Set path stroke weight
        line(pathGenerated[i].x, pathGenerated[i].y, pathGenerated[i + 1].x, pathGenerated[i + 1].y);
      }
      endShape();
    } else {
      console.log("Not enough points for cubic spline path generation");
    }
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
  if (draggedPointIndex !== -1) {
    return;
  }

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
      document.body.classList.add('no-select'); // Add the no-select class to the body
      break;
    }
  }
}

function stopDragging() {
  draggedPointIndex = -1;
  document.body.classList.remove('no-select'); // Remove the no-select class from the body
}
