/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import Knn from '../../src/algorithms/knn';
import Circle from '../../src/visualization/circle';

chai.use(chaiDom);
const expect = chai.expect;

describe('KNN', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      // given
      const givenK = 4;
      const givenTypes = {
        foo: 'foo',
        bar: 'bar',
        None: 'None'
      };
      const givenCircles = [
        new Circle(1, 2, 4, 'red', 'blue', givenTypes.foo),
        new Circle(2, 3, 4, 'red', 'blue', givenTypes.foo),
        new Circle(4, 5, 4, 'red', 'blue', givenTypes.foo),
        new Circle(1123, 53, 4, 'red', 'blue', givenTypes.bar),
        new Circle(435, 42, 4, 'red', 'blue', givenTypes.bar),
        new Circle(435, 42, 4, 'red', 'blue', givenTypes.None),
      ];
      // when
      const knn = new Knn(givenCircles, givenK, givenTypes);
      // then
      expect(knn.circles).to.deep.equal(givenCircles);
      expect(knn.k).to.equal(givenK);
      expect(knn.types).to.deep.equal(givenTypes);
      expect(knn.kClosestNeighbors).to.be.null;
    });
  });
  describe('findKClosestNeighbors', () => {
    it('should find neighbors correctly', () => {
      // given
      const givenK = 4;
      const givenTypes = {
        foo: 'foo',
        bar: 'bar',
        None: 'None'
      };
      const givenCircles = [
        new Circle(1, 2, 4, 'red', 'blue', givenTypes.foo),
        new Circle(2, 3, 4, 'red', 'blue', givenTypes.foo),
        new Circle(4, 5, 4, 'red', 'blue', givenTypes.foo),
        new Circle(1123, 53, 4, 'red', 'blue', givenTypes.bar),
        new Circle(435, 42, 4, 'red', 'blue', givenTypes.bar),
      ];
      const knn = new Knn(givenCircles, givenK, givenTypes);
      const newCircle = new Circle(0, 0, 'red', 'blue', givenTypes.None);
      // when
      const kClosestNeighbors = knn.findKClosestNeighbors(newCircle, givenCircles, givenK);
      // then
      let expected = givenCircles.map(c => {
        c.distance = knn.calculateDistance(c, newCircle);
        return c;
      }).sort((a,b) => a.distance > b.distance);
      expected.pop();

      expect(kClosestNeighbors).to.deep.equal(expected);
    });
  });
  describe('determineCircleType', () => {
    it('should determine circle type correctly', () => {
      // given
      const givenK = 3;
      const givenTypes = {
        foo: 'foo',
        bar: 'bar',
        None: 'None'
      };
      const givenKClosestNeighbors = [
        new Circle(1, 2, 4, 'red', 'blue', givenTypes.foo),
        new Circle(2, 3, 4, 'red', 'blue', givenTypes.foo),
        new Circle(4, 5, 4, 'red', 'blue', givenTypes.bar),
      ];
      const givenCircles = [
        ... givenKClosestNeighbors,
        new Circle(4, 8, 4, 'red', 'blue', givenTypes.foo),
        new Circle(6, 8, 4, 'red', 'blue', givenTypes.bar),
      ];
      const knn = new Knn(givenCircles, givenK, givenTypes);
      const expectedType = givenTypes.foo;
      // when
      const circleType = knn.determineCircleType(givenKClosestNeighbors);
      // then
      expect(circleType).to.deep.equal(expectedType);
    });
    it('should pick first neighbor\'s circle type in a tie', () => {
      // given
      const givenK = 2;
      const givenTypes = {
        foo: 'foo',
        bar: 'bar',
        None: 'None'
      };
      const givenCircles = [
        new Circle(435, 42, 4, 'red', 'blue', givenTypes.bar),
        new Circle(1, 2, 4, 'red', 'blue', givenTypes.foo),
      ];
      const knn = new Knn([], givenK, givenTypes);
      // when
      const circleType = knn.determineCircleType(givenCircles);
      // then
      expect(circleType).to.equal(givenTypes.bar);
    });
  });
});