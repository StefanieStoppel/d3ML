/* global describe, it */

import chai from 'chai';
import LinearRegression from '../../../src/algorithms/linear-regression';
import Circle from '../../../src/visualization/circle';

const expect = chai.expect;

describe('LinearRegression', () => {
  let circles;
  beforeEach(() => {
    circles = [
      new Circle(6,24),
      new Circle(564,12),
      new Circle(6,87)
    ];
  });
  describe('calculateMean', () => {
    it('should calculate mean correctly', () => {
      // given
      const data = [1,4,42,6,8,2];
      const lr = new LinearRegression();
      // when
      const mean = lr.calculateMean(data);
      // then
      expect(mean).to.equal(10.5);
    });
  });
  describe('calculateSlope', () => {
    it('should calculate slope correctly', () => {
      // given
      const circles = [
        new Circle(1, 1),
        new Circle(3, 3)
      ];
      const lr = new LinearRegression();
      // when
      const slope = lr.calculateSlope(circles, 2, 2);
      // then
      expect(slope).to.equal(1);
    });
  });
  describe('calculateIntercept', () => {
    it('should calculate intercept correctly', () => {
      // given
      const circles = [
        new Circle(1, 1),
        new Circle(3, 3)
      ];
      const lr = new LinearRegression();
      const slope = 1;
      // when
      const intercept = lr.calculateIntercept(slope, 2, 2);
      // then
      expect(intercept).to.equal(0);
    });
  });
  describe('performRegression', () => {
    it('should perform regression correctly', () => {
      // given
      const circles = [
        new Circle(1, 1),
        new Circle(2, 4)
      ];
      const lr = new LinearRegression();
      const slope = 3;
      const intercept = -2;
      // when
      const result = lr.performRegression(circles);
      // then
      expect(result).to.deep.equal({slope, intercept});
    });
  })
});