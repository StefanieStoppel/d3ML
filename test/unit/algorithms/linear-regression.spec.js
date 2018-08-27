/* global describe, it */

import chai from 'chai';
import LinearRegression from '../../../src/algorithms/linear-regression';
import Circle from '../../../src/visualization/circle';

const expect = chai.expect;

describe('LinearRegression', () => {
  describe('calculateMean', () => {
    it('should calculate mean correctly', () => {
      // given
      const data = [1, 4, 42, 6, 8, 2];
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
      const lr = new LinearRegression();
      const slope = 1;
      // when
      const intercept = lr.calculateIntercept(slope, 2, 4);
      // then
      expect(intercept).to.equal(2);
    });
    it('should calculate intercept correctly if slope is 0', () => {
      // given
      const lr = new LinearRegression();
      const slope = 0;
      // when
      const intercept = lr.calculateIntercept(slope, 2, 4);
      // then
      expect(intercept).to.equal(4);
    });
    it('should return 0 if slope is undefined', () => {
      // given
      const lr = new LinearRegression();
      const slope = undefined;
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
  });
  describe('calculateTotalSquaredError', () => {
    it('should calculate total squared error correctly', () => {
      // given
      const expectedLoss = 3;
      const y = [1,2,3];
      const yPredicted = [2,3,4];
      const lr = new LinearRegression();
      // when
      const result = lr.calculateTotalSquaredError(y, yPredicted);
      // then
      expect(result).to.equal(expectedLoss);
    });
    it('should return NaN if calculateTotalSquaredError is passed null as an argument', () => {
      // given
      const expectedResult = NaN;
      const y = null;
      const yPredicted = [2,3,4,5];
      const lr = new LinearRegression();
      // when
      const result = lr.calculateTotalSquaredError(y, yPredicted);
      // then
      expect(isNaN(result)).to.equal(isNaN(expectedResult));
    });
    it('should calculateTotalSquaredError return NaN when parameter yPredicted has fewer elements than y', () => {
      // given
      const expectedResult = NaN;
      const y = [1,2,3,4,5];
      const yPredicted = [2,3,4,5];
      const lr = new LinearRegression();
      // when
      const result = lr.calculateTotalSquaredError(y, yPredicted);
      // then
      expect(isNaN(result)).to.equal(isNaN(expectedResult));
    });
  });
});
