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
  pathGenMethodDropdown = document.getElementById('path-gen-method');
  pathGenMethodDropdown.addEventListener('change', updatePathGenMethod);
  downloadButton = document.getElementById('download');
  downloadButton.addEventListener('click', downloadPath);
  
}



function updatePathGenMethod() {
  let previousMethod = selectedMethod;
  selectedMethod = pathGenMethodDropdown.value;

  // Check if the method has been changed
  if (previousMethod !== selectedMethod) {
    clearAllPoints();
  }

  if (selectedMethod === 'code-gen') {
    downloadButton.textContent = 'Copy Code';
    downloadButton.removeEventListener('click', downloadPath);
    downloadButton.addEventListener('click', copyCodeToClipboard);
  } else {
    downloadButton.textContent = 'Download Path';
    downloadButton.removeEventListener('click', copyCodeToClipboard);
    downloadButton.addEventListener('click', downloadPath);
  }
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
    updateCoordinatesDisplay();
  }

  // Convert dots array into waypoints array with Point objects
  waypoints = dots.map(dot => new Point(dot.x, dot.y, dots.indexOf(dot)));

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
  
      lastGhostPoint = (last.multiply(2)).subtract(secondToLast);
      
      //waypoints.push(lastGhostPoint)
      waypoints.push(last)

      // Path Generation
      pathGenerated = catmullRom(waypoints);
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

    for(let j = 0; j < n - 1; j++){
      stroke(0, 0, 255);
      strokeWeight(2);
      if((j % 3 == 0) || (j % 3 == 2)){
        line(waypoints[j].x, waypoints[j].y, waypoints[j + 1].x, waypoints[j + 1].y);
      }
    }

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
  } else if (selectedMethod === 'code-gen'){
    for(let j = 0; j < waypoints.length - 1; j++){
        stroke(0, 255, 0); // Set path color
        strokeWeight(2); // Set path stroke weight
      line(waypoints[j].x, waypoints[j].y, waypoints[j + 1].x, waypoints[j + 1].y);
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

function clearAllPoints() {
  // Clear the points array
  dots = [];

  // Clear the UI elements that show points
  dotsElement.innerHTML = '';

  // Optionally, you can also clear the generated path
  pathGenerated = [];

  // Redraw the canvas to reflect the changes
  redraw();
}

function mouseClicked() {
  if (draggedPointIndex !== -1) {
    draggedPointIndex = -1;
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
      updateCoordinatesDisplay(); // Update coordinates display
      break;
    }
  }
}


function adjustPointForCollinearity(path, index) {
  if (index % 3 === 1 && index >= 3) {
      const point3k = path[index - 2];
      const point3kPlus1 = path[index - 1];
      const point3kPlus2 = path[index];

      const adjustedPoint3kPlus2 = projectPointOnLine(point3k, point3kPlus1, point3kPlus2);

      path[index] = adjustedPoint3kPlus2;
  }
}

function projectPointOnLine(pointA, pointB, pointC) {
  const AB = pointB.subtract(pointA);
  const AC = pointC.subtract(pointA);
  const projectionScalar = Point.dotProduct(AC, AB) / Point.dotProduct(AB, AB);

  return pointA.add(AB.multiply(projectionScalar));
}

function stopDragging() {
  if (draggedPointIndex !== -1) {
      // Apply collinearity adjustments only for cubic spline
      if (selectedMethod === 'cubic-spline') {
          let mappedDots = dots.map(dot => new Point(dot.x, dot.y));
          adjustPointForCollinearity(mappedDots, draggedPointIndex);
          dots = mappedDots.map(pt => ({ x: pt.x, y: pt.y }));
      }
      updateCoordinatesDisplay(); 
      draggedPointIndex = -1;
  }
  document.body.classList.remove('no-select');
}

function updateCoordinatesDisplay() {
  dotsElement.innerHTML = ''; // Clear current list
  dots.forEach(dot => {
    const x = (dot.x - canvasWidth / 2) / (canvasWidth / 2) * 72;
    const y = -(dot.y - canvasHeight / 2) / (canvasHeight / 2) * 72;
    dotsElement.innerHTML += `<li>(${Math.round(x)}, ${Math.round(y)})</li>`; // Add updated coordinates
  });
}

function copyCodeToClipboard() {
  // Start with the (0,0) point
  let codeString = 'goToPoint(0, 0);\n';

  for (let point of waypoints) {
    // Convert canvas coordinates to your coordinate system
    let scaledX = (point.x - canvasWidth / 2) / (canvasWidth / 2) * 72;
    let scaledY = -(point.y - canvasHeight / 2) / (canvasHeight / 2) * 72;

    // Append the command to the code string
    codeString += `goToPoint(${scaledX.toFixed(1)}, ${scaledY.toFixed(1)});\n`;
  }

  // Copy codeString to clipboard
  navigator.clipboard.writeText(codeString)
    .then(() => console.log('Code copied to clipboard!'))
    .catch(err => console.error('Error copying code: ', err));
}
