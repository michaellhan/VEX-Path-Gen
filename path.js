function deCasteljau(path, t) {
  if (path.length === 1) {
    return path;
  }

  const newPath = [];

  for (let i = 0; i < path.length - 1; i++) {
    const nextPoint = Point.lerp(path[i], path[i + 1], t);
    newPath.push(nextPoint);
  }

  return deCasteljau(newPath, t);
}

function injection(path, numPoints) {
  const newPath = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const addPoint = deCasteljau(path, t)[0];
    addPoint.index = i;
    newPath.push(addPoint);
  }

  return newPath;
}


function findPoint(p0, p1, p2, p3, t) {
  const c0 = p1;
  const c1 = p0.multiply(-0.5).add(p2.multiply(0.5));
  const c2 = p0.multiply(0.5 * 2).add(p1.multiply(0.5 - 3)).add(p2.multiply(3 - 2 * 0.5)).add(p3.multiply(-0.5));
  const c3 = p0.multiply(-0.5).add(p1.multiply(2 - 0.5)).add(p2.multiply(0.5 - 2)).add(p3.multiply(0.5));

  const t2 = t * t;
  const t3 = t2 * t;

  const newPoint = c0.add(c1.multiply(t)).add(c2.multiply(t2)).add(c3.multiply(t3));
  const derivative = c1.multiply(1).add(c2.multiply(2 * t)).add(c3.multiply(3 * t2));
  const speed =  Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y) // Calculate the speed as the magnitude of the derivative vector
  return { point: newPoint, speed: speed };
}


function catmullRom(path, numPoints) {
  const newPath = [];

  for (let j = 0; j < path.length - 3; j++) {
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const {addPoint, speed} = findPoint(path[j], path[j + 1], path[j + 2], path[j + 3], t);
      addPoint.index = i;
      addPoint.speed = speed;
      newPath.push(addPoint);
    }
  }

  const lastPoint = path[path.length - 2];
  lastPoint.index = (path.length - 3) * numPoints;
  lastPoint.speed = 0;
  newPath.push(lastPoint);

  return newPath;
}

function generateCumulativeDistance(path) {
  let d = 0;
  const cumDistance = [0];
  
  for (let i = 0; i < path.length - 1; i++) {
    const pointToPointDistance = Point.distance(path[i], path[i + 1]);
    d += pointToPointDistance;
    cumDistance.push(d);
  }
  
  return cumDistance;
}

function cubicSpline(path, numPoints) {
  const sectionedSpline = [];
  
  for (let i = 0; i < path.length - 1; i += 3) {
    const curve = [path[i], path[i + 1], path[i + 2], path[i + 3]];
    const injectedCurve = injection(curve, numPoints);
    sectionedSpline.push(injectedCurve);
  }
  
  const newPath = [];
  for (let i = 0; i < sectionedSpline.length * numPoints; i++) {
    const t = i / numPoints;
    const u = Math.floor(t);
    const tPrime = t - u;
    const addPoint = deCasteljau(sectionedSpline[u], tPrime)[0];
    addPoint.index = i;
    newPath.push(addPoint);
  }
  
  const lastPoint = path[path.length - 1];
  lastPoint.index = sectionedSpline.length * numPoints;
  newPath.push(lastPoint);
  
  return newPath;
}

function cubicSpline2(path, distance, approx) {
  const numPoints = Math.floor(approx);
  const sectionedSpline = [];
  
  for (let i = 0; i < path.length - 1; i += 3) {
    const curve = [path[i], path[i + 1], path[i + 2], path[i + 3]];
    const injectedCurve = injection(curve, numPoints);
    sectionedSpline.push(injectedCurve);
  }
  
  const sampleSpline = cubicSpline(path, numPoints);
  const cumDistance = generateCumulativeDistance(sampleSpline);
  const curveLength = cumDistance[cumDistance.length - 1];
  const totalPoints = Math.floor(curveLength / distance);
  distance = curveLength / totalPoints;
  const newPath = [];
  let dCounter = 0;

  for (let i = 0; i < totalPoints; i++) {
    const dValue = i * distance;
    for (let j = dCounter; j < totalPoints; j++) {
      if (cumDistance[j] <= dValue && dValue <= cumDistance[j + 1]) {
        const slope = (cumDistance[j + 1] - cumDistance[j]) * approx;
        const t = (dValue - cumDistance[j]) / slope + j / approx;
        const u = Math.floor(t);
        const tPrime = t - u;
        const addPoint = deCasteljau(sectionedSpline[u], tPrime)[0];
        addPoint.index = i;
        newPath.push(addPoint);
        dCounter = j;
        break;
      }
    }
  }
  
  const lastPoint = path[path.length - 1];
  lastPoint.index = sectionedSpline.length * numPoints;
  newPath.push(lastPoint);
  
  return newPath;
}






