let field;
let coordinatesElement;
let dotsElement;
let canvasWidth = 720; // Set the width of the canvas
let canvasHeight = 720; // Set the height of the canvas
let dots = []; // Array to store the coordinates of the dots
let waypoints = [];
let selectedDot = null;
let counter = 0;

let draggedPointIndex = -1;
let offsetX = 0;
let offsetY = 0;

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
  numPointsSlider = createSlider(3, 20, 5); // min, max, default value
  numPointsSlider.position(width + 20, height - 120); // Adjust position as needed
  numPointsSlider.style('width', '100px'); // Adjust the width of the slider
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

  // Check if waypoints array has more than 3 points
  if (waypoints.length > 3) {
    const numPoints = 5; // Number of points on the generated path using catmullRom
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

  // Drawing existing dots
  for (let dot of dots) {
    if (dot === selectedDot) {
      fill(255, 0, 0, 200); // Darken the selected dot
    } else {
      fill(255, 0, 0, 100);
    }
    ellipse(dot.x, dot.y, 15);
    counter++;
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


class Point {
  constructor(x, y, index) {
    this.x = x;
    this.y = y;
    this.index = index;
  }

  add(pt) {
    return new Point(this.x + pt.x, this.y + pt.y, this.index);
  }

  subtract(pt) {
    return new Point(this.x - pt.x, this.y - pt.y, this.index);
  }

  multiply(d) {
    return new Point(this.x * d, this.y * d, this.index);
  }

  divide(d) {
    return new Point(this.x / d, this.y / d, this.index);
  }

  equals(pt) {
    return this.x === pt.x && this.y === pt.y;
  }

  static distance(pt1, pt2) {
    const d = Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
    return d;
  }

  static rotate(pt1, pt2, theta) {
    const shifted = new Point(pt2.x - pt1.x, pt2.y - pt1.y);
    const xcord = shifted.x * Math.cos(theta) - shifted.y * Math.sin(theta);
    const ycord = shifted.y * Math.cos(theta) + shifted.x * Math.sin(theta);
    return new Point(xcord + pt1.x, ycord + pt1.y, pt1.index);
  }

  static print(pt) {
    console.log(`(${pt.x}, ${pt.y})`);
  }

  static dotProduct(pt1, pt2) {
    return pt1.x * pt2.x + pt1.y * pt2.y;
  }

  static lerp(pt1, pt2, t) {
    // 0 <= t <= 1
    const x = (1 - t) * pt1.x + t * pt2.x;
    const y = (1 - t) * pt1.y + t * pt2.y;
    return new Point(x, y);
  }
}



function findPoint(p0, p1, p2, p3, t, scale) {
  const c0 = p1;
  const c1 = p0.multiply(-scale).add(p2.multiply(scale));
  const c2 = p0.multiply(scale * 2).add(p1.multiply(scale - 3)).add(p2.multiply(3 - 2 * scale)).add(p3.multiply(-scale));
  const c3 = p0.multiply(-scale).add(p1.multiply(2 - scale)).add(p2.multiply(scale - 2)).add(p3.multiply(scale));

  const t2 = t * t;
  const t3 = t2 * t;

  const newPoint = c0.add(c1.multiply(t)).add(c2.multiply(t2)).add(c3.multiply(t3));
  return newPoint;
}

function catmullRom(path, numPoints) {
  const newPath = [];

  for (let j = 0; j < path.length - 3; j++) {
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const addPoint = findPoint(path[j], path[j + 1], path[j + 2], path[j + 3], t, 0.5);
      addPoint.index = i;
      newPath.push(addPoint);
    }
  }

  const lastPoint = path[path.length - 2];
  lastPoint.index = (path.length - 3) * numPoints;
  newPath.push(lastPoint);

  return newPath;
}