/* eslint-disable camelcase */
const { expect } = require('chai');

const Point = require('../Point');
const { voronoi_areas } = require('../voronoi-cells');

describe('voronoi_cells()', () => {
  it.only('should work for a square case', () => {
    const p = [
      new Point(0.0, 0.0),
      new Point(2.0, 0.0),
      new Point(-2.0, 0.0),
      new Point(0.0, 2.0),
      new Point(0.0, -2.0),
    ];
    const ans = [4.0, -1, -1, -1, -1];

    const result = voronoi_areas(p);

    expect(result).to.deep.equal(ans);
  });

  it.only('should work for a triangle case', () => {
    const p = [
      new Point(2.0, 1.0),
      new Point(2.0, -1.0),
      new Point(4.4, 2.2),
      new Point(4.4, -2.2),
      new Point(-0.4, 2.2),
      new Point(-0.4, -2.2),
    ];

    const ans = [8, 8, -1, -1, -1, -1];

    const result = voronoi_areas(p);

    expect(result).to.deep.equal(ans);
  });
});
