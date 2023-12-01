let xValues = [];
let yValues = [];

let resetButton;
let runSimButton;

let field;
let c;

function preload() {
  resetButton = createButton("Reset");
  runSimButton = createButton("Run Simulation");

  // setButtonStyles();

  field = loadImage('field.png');
}


function setup() {
  c = createCanvas(500, 500);
  background(field);
}

function draw() {
  background(field);
  // background.style('text-align: center')
  c.mousePressed(addPoint);

  strokeWeight(4);
  for(let i=0; i<xValues.length; i++) {
    fill(0, 0, 0);
    ellipse(xValues[i], yValues[i], 5);
    line(xValues[i], yValues[i], xValues[i+1], yValues[i+1]);
  }

  resetButton.mouseClicked(clearCanvas);
  listCoords();
}

function addPoint() {
  xValues.push(Math.floor(mouseX));
  yValues.push(Math.floor(mouseY));
  document.getElementById('arrayX').innerHTML = xValues[xValues.length-1];
  document.getElementById('arrayY').innerHTML = yValues[yValues.length-1];
}

function clearCanvas() {
  xValues = [];
  yValues = [];
  clear();
  background(field);
}

function setButtonStyles() {
  resetButton.style('float: left;')
  runSimButton.style('float: right;')
  resetButton.style('text-align: center');
  runSimButton.style('text-align: center');

  resetButton.style('font-size: 35px;');
  runSimButton.style('font-size: 35px;');
  resetButton.style('font-family: "Times New Roman", Times, serif;');
  runSimButton.style('font-family: "Times New Roman", Times, serif;');
}

function listCoords() {
  let coords = "";
  for(let i=0; i<xValues.length; i++) {
    coords += i+1;
    coords = coords + ": {" + xValues[i] + ", " + yValues[i] + "}\n";
  }

  if(xValues.length == 0) {
    coords += ". . .";
  }
  document.getElementById("output").innerHTML = coords;
}