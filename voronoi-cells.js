/* eslint-disable no-param-reassign, camelcase */
// Find the areas of the Voronoi cells associated with the Point objects in the array p.

const Point = require('./Point');

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

const distance = (p1, p2) => Math.sqrt(((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2));

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
  const vx = -p2.y + p1.y;
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
  point,
  other,
  include: false,
});

const isInside = (currInter, dir, oldInter, point) => {
  const vPoint = vP(point, currInter);
  const vOld = vP(oldInter, currInter);
  return vectorial(vPoint, dir) * vectorial(vOld, dir) > 0;
};

const doSet = (med, index, range, pos, partner) => {
  med.range[index] = range;
  med.pos[index] = pos;
  med.partner[index] = partner;
};

const setNew = (med, inter, range, partner) => {
  if (med.range[0] === -Infinity && med.range[1] === Infinity) {
    if (range > 0) {
      doSet(med, 1, range, inter, partner);
    } else {
      doSet(med, 0, range, inter, partner);
    }
  } else if (med.range[0] === -Infinity && med.range[1] !== Infinity) {
    doSet(med, 0, range, inter, partner);
  } else if (med.range[0] !== -Infinity && med.range[1] === Infinity) {
    doSet(med, 1, range, inter, partner);
  }
  med.include = true;
};

const isClose = (med, rangeLimit) => rangeLimit > med.range[0] && rangeLimit < med.range[1];

// const isSmaller = (med, otherMed) => { };

const setPosAndRange = (inter, med, otherMed, point) => {
  const rangeLimit = escalar(vP(inter, med.middle), med.dir);
  const otherRangeLimit = escalar(vP(inter, otherMed.middle), otherMed.dir);
  // >= and <= fails for squares
  if (isClose(med, rangeLimit) && isClose(otherMed, otherRangeLimit)) {
    if (otherMed.range[0] === -Infinity && otherMed.range[1] === Infinity) {
      if (otherRangeLimit > 0) {
        doSet(otherMed, 1, otherRangeLimit, inter, med.me);
      } else {
        doSet(otherMed, 0, otherRangeLimit, inter, med.me);
      }
    } else if (otherMed.range[0] === -Infinity && otherMed.range[1] !== Infinity) {
      // if (distance(otherMed.pos, inter) < 0.0001) return;
      // if (!isSmaller(inter, med.dir, otherMed.pos[1], point)) return;
      if (isInside(inter, med.dir, otherMed.pos[1], point)) {
        doSet(otherMed, 0, otherRangeLimit, inter, med.me);
      } else {
        doSet(otherMed, 1, otherRangeLimit, inter, med.me);
      }
    } else if (otherMed.range[0] !== -Infinity && otherMed.range[1] === Infinity) {
      // if (distance(otherMed.pos, inter) < 0.0001) return;
      if (isInside(inter, med.dir, otherMed.pos[0], point)) {
        doSet(otherMed, 1, otherRangeLimit, inter, med.me);
      } else {
        doSet(otherMed, 0, otherRangeLimit, inter, med.me);
      }
    } else if (isInside(inter, med.dir, otherMed.pos[0], point)) {
      // if (distance(otherMed.pos, inter) < 0.0001) return;
      doSet(otherMed, 0, otherRangeLimit, inter, med.me);
      doSet(otherMed, 1, Infinity, null, null);
    } else if (isInside(inter, med.dir, otherMed.pos[1], point)) {
      // if (distance(otherMed.pos, inter) < 0.0001) return;
      doSet(otherMed, 1, otherRangeLimit, inter, med.me);
      doSet(otherMed, 0, -Infinity, null, null);
    }
    setNew(med, inter, rangeLimit, otherMed.me);
  }
};

const area = (point, middle, pos) => {
  const height = distance(point, middle);
  const base = distance(pos[0], pos[1]);
  return height * base / 2;
};

const verticesArea = (point, vertices) => {
  console.log('\n\r\n\r\n\rFINAL', JSON.stringify(vertices));
  if (vertices.find(vert => vert.range
    .find(range => range === -Infinity || range === Infinity))) return -1;
  return vertices.reduce(
    (acc, curr) => acc + area(point, curr.middle, curr.pos), 0,
  );
};

const voronoi_areas = p => p.map((point) => {
  const sorted = sortByDistance(point, p);
  const vertices = [];
  sorted.forEach((other, index) => {
    const med = initMed(point, other, index);
    if (vertices.length === 0) { // First mediatrix
      med.include = true;
    } else if (vertices.length === 1) { // Second mediatrix, calculate intersection
      med.include = true;
      const inter = intersect(med, vertices[0]);
      if (inter !== null) setPosAndRange(inter, med, vertices[0], point);
    } else if (vertices.length > 1) { // Rest of mediatrix
      vertices.forEach((otherMed) => {
        if (med.visited.indexOf(otherMed.me) === -1 && otherMed.me !== med.me) {
          med.visited.push(otherMed.me);
          const inter = intersect(med, otherMed);
          if (inter !== null) setPosAndRange(inter, med, otherMed, point);
        }
      });
    }
    console.log(index, med.include);
    if (med.include) vertices.push(med);
  });
  return verticesArea(point, vertices);
});

const p = [
  new Point(2.0, 1.0),
  new Point(2.0, -1.0),
  new Point(4.4, 2.2),
  new Point(4.4, -2.2),
  new Point(-0.4, 2.2),
  new Point(-0.4, -2.2),
];

const result = voronoi_areas(p);

module.exports = {
  voronoi_areas,
};
