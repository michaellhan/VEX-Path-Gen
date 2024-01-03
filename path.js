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
  const speed = derivative.magnitude(); // Calculate the speed as the magnitude of the derivative vector
  return { point: newPoint, speed: speed };
}

function catmullRom(path, numPoints) {
  const totalArcLength = path.reduce((length, point, i, arr) => {
    if (i < arr.length - 1) {
      const nextPoint = arr[i + 1];
      const { speed } = findPoint(point, point, nextPoint, nextPoint, 0.5); // Evaluate at t = 0.5 for midpoint
      return length + speed;
    }
    return length;
  }, 0);

  const step = totalArcLength / numPoints;

  let currentArcLength = 0;
  let currentPointIndex = 0;
  let currentT = 0;

  const newPath = [];

  for (let i = 0; i < numPoints; i++) {
    while (currentPointIndex < path.length - 1) {
      const point1 = path[currentPointIndex];
      const point2 = path[currentPointIndex + 1];

      const { speed } = findPoint(point1, point1, point2, point2, 0.5); // Evaluate at t = 0.5 for midpoint

      if (currentArcLength + speed >= step * i) {
        const remainingArcLength = step * i - currentArcLength;
        currentT = remainingArcLength / speed;
        currentArcLength += remainingArcLength;
        break;
      } else {
        currentArcLength += speed;
        currentT = 0;
        currentPointIndex++;
      }
    }

    const { point } = findPoint(
      path[currentPointIndex],
      path[currentPointIndex],
      path[currentPointIndex + 1],
      path[currentPointIndex + 2],
      currentT
    );

    point.index = i;
    newPath.push(point);
  }

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






