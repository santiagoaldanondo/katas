/* eslint-disable no-param-reassign */
// Find the areas of the Voronoi cells associated with the Point objects in the array p.

const util = require('util');

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const vP = (p1, p2) => ({
  x: p2.x - p1.x,
  y: p2.y - p1.y,
});

const vV = (vx, vy) => ({
  x: vx,
  y: vy,
});

const deepCopy = (p) => {
  const copy = [];
  p.forEach((point) => {
    copy.push(point);
  });
  return copy;
};

const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

const sortByDistance = (point, p) => {
  const allPoints = deepCopy(p).sort((p1, p2) => (
    (point.x - p2.x) ** 2) + ((point.y - p2.y) ** 2)
  < ((point.x - p1.x) ** 2) + ((point.y - p1.y) ** 2));
  allPoints.shift();
  return allPoints;
};

const mediatrix = (p1, p2) => {
  const x = (p1.x + p2.x) / 2;
  const y = (p1.y + p2.y) / 2;
  const middle = new Point(x, y);
  const vy = p2.x - p1.x;
  const vx = p2.y - p1.y;
  return {
    middle,
    dir: vV(vx, vy),
  };
};

const intersect = (med1, med2) => {
  if ((med1.dir.x === 0 && med2.dir.x === 0)
    || (med1.dir.y === 0 && med2.dir.y === 0)
    || (med1.dir.x !== 0 && med1.dir.y !== 0
      && med2.dir.x !== 0 && med2.dir.y !== 0
      && med2.dir.x * med1.dir.y === med2.dir.y * med1.dir.x)) return null;
  const alpha = (
    med2.middle.y * med2.dir.x
    - med2.middle.x * med2.dir.y
    - med2.dir.x * med1.middle.y
    + med2.dir.y * med1.middle.x
  ) / (
    med2.dir.x * med1.dir.y
    - med2.dir.y * med1.dir.x
  );
  const x = alpha * med1.dir.x + med1.middle.x;
  const y = alpha * med1.dir.y + med1.middle.y;
  return new Point(x, y);
};

const escalar = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

const vectorial = (v1, v2) => v1.x * v2.y - v1.y * v2.x;

const initMed = (point, other, index) => ({
  ...mediatrix(point, other),
  me: index,
  range: [-Infinity, Infinity],
  pos: [null, null],
  partner: [null, null],
  visited: [],
});

const isInside = (currInter, dir, oldInter, point) => {
  const vPoint = vP(point, currInter);
  const vOld = vP(oldInter, currInter);
  return vectorial(vPoint, dir) * vectorial(vOld, dir) > 0;
};

const setPosAndRange = (inter, currMed, oldMed, point) => {
  const currRangeLimit = escalar(vP(inter, currMed.middle), currMed.dir);
  console.log('currRangeLimit', currRangeLimit);
  if (currRangeLimit > currMed.range[0] && currRangeLimit < currMed.range[1]) {
    let currIndex = 0;
    if (currRangeLimit > 0) currIndex = 1;
    currMed.range[currIndex] = currRangeLimit;
    currMed.pos[currIndex] = inter;
    currMed.partner[currIndex] = oldMed.me;

    const oldRangeLimit = escalar(vP(inter, oldMed.middle), oldMed.dir);
    console.log('oldRangeLimit', oldRangeLimit);
    let oldIndex;
    if (oldMed.range[0] === -Infinity && oldMed.range[1] === Infinity) {
      oldIndex = 0;
      if (oldRangeLimit > 0) oldIndex = 1;
      oldMed.range[oldIndex] = oldRangeLimit;
      oldMed.pos[oldIndex] = inter;
      oldMed.partner[oldIndex] = currMed.me;
    } else if (oldMed.range[0] === -Infinity && oldMed.range[1] !== Infinity) {
      if (isInside(inter, currMed.dir, oldMed.pos[1], point)) {
        oldMed.range[0] = oldRangeLimit;
        oldMed.pos[0] = inter;
        oldMed.partner[0] = currMed.me;
      } else {
        oldMed.range[1] = oldRangeLimit;
        oldMed.pos[1] = inter;
        oldMed.partner[1] = currMed.me;
      }
    } else if (oldMed.range[1] === Infinity && oldMed.range[0] !== -Infinity) {
      if (isInside(inter, currMed.dir, oldMed.pos[0], point)) {
        oldMed.range[1] = oldRangeLimit;
        oldMed.pos[1] = inter;
        oldMed.partner[1] = currMed.me;
      } else {
        oldMed.range[0] = oldRangeLimit;
        oldMed.pos[0] = inter;
        oldMed.partner[0] = currMed.me;
      }
    } else if (isInside(inter, currMed.dir, oldMed.pos[0], point)) {
      oldMed.range[0] = oldRangeLimit;
      oldMed.pos[0] = inter;
      oldMed.partner[0] = currMed.me;
      oldMed.range[1] = -Infinity;
      oldMed.pos[1] = null;
      oldMed.partner[1] = null;
    } else if (isInside(inter, currMed.dir, oldMed.pos[1], point)) {
      oldMed.range[1] = oldRangeLimit;
      oldMed.pos[1] = inter;
      oldMed.partner[1] = currMed.me;
      oldMed.range[0] = -Infinity;
      oldMed.pos[0] = null;
      oldMed.partner[0] = null;
    }
  }
};

const area = (point, vertices) => {
  console.log('\n\r\n\r\n\rFINAL', JSON.stringify(vertices));
  if (vertices.find(vert => vert.range
    .find(range => range === -Infinity || range === Infinity))) return -1;
  return vertices.reduce((acc, curr) => acc + distance(point, curr.middle) * distance(curr.pos[0], curr.pos[1]) / 2, 0);
};

const voronoi_areas = p => p.map((point) => {
  const sorted = sortByDistance(point, p);
  const vertices = [];
  sorted.forEach((other, index) => {
    const med = initMed(point, other, index);
    if (vertices.length === 1) { // Second mediatrix, calculate intersection
      const inter = intersect(med, vertices[0]);
      if (inter !== null) setPosAndRange(inter, med, vertices[0], point);
    } else if (vertices.length > 1) { // Rest of mediatrix
      vertices.forEach((otherMed) => {
        if (med.visited.indexOf(otherMed.me) === -1 && otherMed.me !== med.me) {
          med.visited.push(otherMed.me);
          const inter = intersect(med, otherMed);
          if (inter !== null) {
            const rangeLimit = escalar(vP(inter, otherMed.middle), otherMed.dir);
            if (rangeLimit > med.range[0] && rangeLimit < med.range[1]) {
              setPosAndRange(inter, med, otherMed, point);
            }
          }
        }
      });
    }
    vertices.push(med);
  });
  return area(point, vertices);
});

const p = [
  new Point(0.0, 0.0),
  new Point(2.0, 0.0),
  new Point(-2.0, 0.0),
  new Point(0.0, 2.0),
  new Point(0.0, -2.0),
];

const p2 = [
  new Point(2.0, 1.0),
  new Point(2.0, -1.0),
  new Point(4.4, 2.2),
  new Point(4.4, -2.2),
  new Point(-0.4, 2.2),
  new Point(-0.4, -2.2)];

// const ans = [4.0, -1, -1, -1, -1];
const ans2 = [8, 8, -1, -1, -1, -1];

// const result = voronoi_areas(p);
const result2 = voronoi_areas(p2);

// console.log(result, '\n\r', ans);
console.log(result2, '\n\r', ans2);
