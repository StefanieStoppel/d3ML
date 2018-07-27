/* global describe, it */

import chai from 'chai';
import chaiDom from 'chai-dom';
import Knn from '../../src/algorithms/knn';
import Circle from '../../src/visualization/circle';
import {defaultK} from '../../src/visualization/defaults';

chai.use(chaiDom);
const expect = chai.expect;

describe('KNN', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      // given
      const givenK = 4;
      const givenTypes = ['foo', 'bar'];
      const givenCircles = [
        new Circle(1, 2, 4, 'red', 'blue', 'foo'),
        new Circle(2, 3, 4, 'red', 'blue', 'foo'),
        new Circle(4, 5, 4, 'red', 'blue', 'foo'),
        new Circle(1123, 53, 4, 'red', 'blue', 'bar'),
        new Circle(435, 42, 4, 'red', 'blue', 'bar'),
        new Circle(435, 42, 4, 'red', 'blue', givenTypes.None)
      ];
      // when
      const knn = new Knn(givenCircles, givenTypes, givenK);
      // then
      expect(knn.circles).to.deep.equal(givenCircles);
      expect(knn.k).to.equal(givenK);
      expect(knn.types).to.deep.equal(givenTypes);
      expect(knn.kClosestNeighbors).to.be.null;
    });
    it('should initialize with defaults correctly', () => {
      // given
      const givenTypes = ['foo', 'bar'];
      const givenCircles = [
        new Circle(435, 42, 4, 'red', 'blue', 'bar'),
        new Circle(435, 42, 4, 'red', 'blue', 'None')
      ];
      // when
      const knn = new Knn(givenCircles, givenTypes);
      // then
      expect(knn.k).to.equal(defaultK);
    });
  });
  describe('findKClosestNeighbors', () => {
    it('should find neighbors correctly', () => {
      // given
      const givenK = 4;
      const givenTypes = ['foo', 'bar'];
      const givenCircles = [
        new Circle(1, 2, 4, 'red', 'blue', 'foo'),
        new Circle(2, 3, 4, 'red', 'blue', 'foo'),
        new Circle(4, 5, 4, 'red', 'blue', 'foo'),
        new Circle(1123, 53, 4, 'red', 'blue', 'bar'),
        new Circle(435, 42, 4, 'red', 'blue', 'bar')
      ];
      const knn = new Knn(givenCircles, givenTypes, givenK);
      const newCircle = new Circle(0, 0, 'red', 'blue', givenTypes.None);
      // when
      const kClosestNeighbors = knn.findKClosestNeighbors(newCircle, givenCircles, givenK);
      // then
      let expected = givenCircles.map(c => {
        c.distance = knn.calculateDistance(c, newCircle);

        return c;
      }).sort((a, b) => a.distance > b.distance);
      expected.pop();

      expect(kClosestNeighbors).to.deep.equal(expected);
    });
  });
  describe('getCircleTypeWeighted', () => {
    it('should determine circle type correctly when weighted', () => {
      // given
      const expectedType = 'foo';
      const givenK = 3;
      const givenTypes = ['foo', 'bar'];
      const givenKClosestNeighbors = [
        new Circle(1, 2, 4, 'red', 'blue', 'foo'),
        new Circle(2, 3, 4, 'red', 'blue', 'bar'),
        new Circle(4, 5, 4, 'red', 'blue', 'bar')
      ];
      const circle = new Circle(1, 1);
      const knn = new Knn([], givenTypes, givenK);
      const kClosestNeighbors = knn.findKClosestNeighbors(circle, givenKClosestNeighbors);
      // when
      const circleType = knn.getCircleTypeWeighted(kClosestNeighbors);
      // then
      expect(circleType).to.deep.equal(expectedType);
    });
  });
  describe('getCircleTypeUnweighted', () => {
    it('should determine circle type correctly', () => {
      // given
      const givenK = 3;
      const givenTypes = ['foo', 'bar'];
      const givenKClosestNeighbors = [
        new Circle(1, 2, 4, 'red', 'blue', 'foo'),
        new Circle(2, 3, 4, 'red', 'blue', 'foo'),
        new Circle(4, 5, 4, 'red', 'blue', 'bar')
      ];
      const givenCircles = [
        ... givenKClosestNeighbors,
        new Circle(4, 8, 4, 'red', 'blue', 'foo'),
        new Circle(6, 8, 4, 'red', 'blue', 'bar')
      ];
      const circle = new Circle(1, 1);
      const knn = new Knn(givenCircles, givenTypes, givenK);
      const kClosestNeighbors = knn.findKClosestNeighbors(circle, givenKClosestNeighbors);
      const expectedType = 'foo';
      // when
      const circleType = knn.getCircleTypeUnweighted(kClosestNeighbors);
      // then
      expect(circleType).to.deep.equal(expectedType);
    });
    it('should pick first neighbor\'s circle type in a tie', () => {
      // given
      const givenK = 2;
      const givenTypes = ['foo', 'bar'];
      const givenCircles = [
        new Circle(435, 42, 4, 'red', 'blue', 'bar'),
        new Circle(1, 2, 4, 'red', 'blue', 'foo')
      ];
      const knn = new Knn([], givenTypes, givenK);
      // when
      const circleType = knn.getCircleTypeUnweighted(givenCircles);
      // then
      expect(circleType).to.equal('bar');
    });
  });
  describe('classify (unweighted)', () => {
    it('should classify new circle type correctly for odd k (unweighted)', () => {
      const expectedType = 'A';
      const givenK = 3;
      const givenNeighbors = [
        new Circle(435, 42, 4, 'green', 'blue', 'B'),
        new Circle(1, 2, 4, 'green', 'blue', 'B'),
        new Circle(2, 3, 4, 'red', 'blue', 'A'),
        new Circle(14, 5, 4, 'red', 'blue', 'A')
      ];
      const types = ['A', 'B'];
      const knn = new Knn(givenNeighbors, types, givenK);
      const newCircle = new Circle(0, 0);
      // when
      const circleType = knn.classify(newCircle, givenNeighbors);
      // then
      expect(circleType).to.equal(expectedType);
      expect(knn.kClosestNeighbors).to.deep.equal([givenNeighbors[1], givenNeighbors[2], givenNeighbors[3]]);
    });
    it('should classify new circle type based on first neighbor in kClosestNeighbors for even k (unweighted)', () => {
      const expectedType = 'B';
      const givenK = 2;
      const givenNeighbors = [
        new Circle(435, 42, 4, 'green', 'blue', 'B'),
        new Circle(1, 2, 4, 'green', 'blue', 'B'),
        new Circle(2, 3, 4, 'red', 'blue', 'A'),
        new Circle(14, 5, 4, 'red', 'blue', 'A')
      ];
      const types = ['A', 'B'];
      const knn = new Knn(givenNeighbors, types, givenK);
      const newCircle = new Circle(0, 0);
      // when
      const circleType = knn.classify(newCircle, givenNeighbors, false);
      // then
      expect(circleType).to.equal(expectedType);
      expect(knn.kClosestNeighbors).to.deep.equal([givenNeighbors[1], givenNeighbors[2]]);
    });
  });
  describe('classify (weighted)', () => {
    it('should classify new circle type correctly for odd k by inverse distance (weighted)', () => {
      const expectedType = 'A';
      const givenK = 3;
      const kClosestNeighbors = [
        new Circle(435, 253, 4, 'green', 'blue', 'B'),
        new Circle(65757, 2525, 4, 'green', 'blue', 'B'),
        new Circle(2, 3, 4, 'red', 'blue', 'A')
      ];
      const neighbors = [
        ...kClosestNeighbors,
        new Circle(24245454, 131332424, 4, 'green', 'blue', 'A'),
        new Circle(4354657, 242435, 4, 'red', 'blue', 'A')
      ];
      const types = ['A', 'B'];
      const knn = new Knn(neighbors, types, givenK);
      const newCircle = new Circle(2, 2);
      // when
      const circleType = knn.classify(newCircle, neighbors, true);
      // then
      expect(circleType).to.equal(expectedType);
      expect(knn.kClosestNeighbors).to.deep.equal([kClosestNeighbors[2], kClosestNeighbors[0], kClosestNeighbors[1]]);
    });
    it('should classify new circle type correctly for even k by inverse distance (weighted)', () => {
      const expectedType = 'A';
      const givenK = 4;
      const kClosestNeighbors = [
        new Circle(4, 5, 4, 'green', 'blue', 'B'),
        new Circle(3, 5, 4, 'green', 'blue', 'B'),
        new Circle(2, 3, 4, 'red', 'blue', 'A'),
        new Circle(2, 1, 4, 'red', 'blue', 'A')
      ];
      const neighbors = [
        ...kClosestNeighbors,
        new Circle(24245454, 131332424, 4, 'green', 'blue', 'A'),
        new Circle(4354657, 242435, 4, 'red', 'blue', 'A')
      ];
      const types = ['A', 'B'];
      const knn = new Knn(neighbors, types, givenK);
      const newCircle = new Circle(2, 2);
      // when
      const circleType = knn.classify(newCircle, neighbors, true);
      // then
      expect(circleType).to.equal(expectedType);
      expect(knn.kClosestNeighbors)
        .to.deep.equal([kClosestNeighbors[2], kClosestNeighbors[3], kClosestNeighbors[1], kClosestNeighbors[0]]);
    });
  });
});
