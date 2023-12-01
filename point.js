export class Point {
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
  
  