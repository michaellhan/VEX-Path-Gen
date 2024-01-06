let field;
let coordinatesElement;
let waypointsElement;
let canvasWidth = 720; // Set the width of the canvas
let canvasHeight = 720; // Set the height of the canvas
let waypoints = [];
let selectedPoint = null;
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
  waypointsElement = document.getElementById('waypoints');
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

    waypoints[draggedPointIndex].x = newX;
    waypoints[draggedPointIndex].y = newY;
    updateCoordinatesDisplay();
  }

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
  }

  // Drawing existing points
  for (let point of waypoints) {
    if (point === selectedPoint) {
      fill(255, 0, 0, 200); // Darken the selected point
    } else {
      fill(255, 0, 0, 100);
    }
    ellipse(point.x, point.y, 15);
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
  waypoints = [];

  // Clear the UI elements that show points
  waypointsElement.innerHTML = '';

  // Optionally, you can also clear the generated path
  pathGenerated = [];

  // Redraw the canvas to reflect the changes
  redraw();
}

function mouseClicked() {
  if (draggedPointIndex !== -1) {
    return;
  }

  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    for (let point of waypoints) {
      const distance = dist(mouseX, mouseY, point.x, point.y);
      if (distance < 20) {
        if (point === selectedPoint) {
          selectedPoint = null; // Deselect the point if it's already selected
        } else {
          selectedPoint = point; // Select the point
        }
        return;
      }
    }
    if (mouseButton === LEFT) {
      const x = (mouseX - width / 2) / (width / 2) * 72;
      const y = -(mouseY - height / 2) / (height / 2) * 72;
      
      waypoints.push({x: mouseX, y: mouseY}); // Add the point to the array
      waypoints.innerHTML += `<li>(${Math.round(x)}, ${Math.round(y)})</li>`;
      if (selectedMethod === 'cubic-spline') {
        adjustPointForCollinearity(waypoints, waypoints.length - 1);
      }
    }
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE && selectedPoint) {
    const index = waypoints.indexOf(selectedPoint);
    if (index !== -1) {
      waypoints.splice(index, 1); // Remove the selected point from the array
      // loop here
      waypointsElement.removeChild(waypointsElement.childNodes[index]);
      selectedPoint = null; // Deselect the point
    }
  }
}

function startDragging() {
  for (let i = 0; i < waypoints.length; i++) {
    const d = dist(mouseX, mouseY, waypoints[i].x, waypoints[i].y);
    if (d < 20) {
      draggedPointIndex = i;
      offsetX = waypoints[i].x - mouseX;
      offsetY = waypoints[i].y - mouseY;
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
          adjustPointForCollinearity(waypoints, draggedPointIndex);
      }
      updateCoordinatesDisplay(); 
      draggedPointIndex = -1;
  }
  document.body.classList.remove('no-select');
}

function updateCoordinatesDisplay() {
  waypointsElement.innerHTML = ''; // Clear current list
  waypoints.forEach(dot => {
    const x = (dot.x - canvasWidth / 2) / (canvasWidth / 2) * 72;
    const y = -(dot.y - canvasHeight / 2) / (canvasHeight / 2) * 72;
    waypoints.innerHTML += `<li>(${Math.round(x)}, ${Math.round(y)})</li>`; // Add updated coordinates
  });
}