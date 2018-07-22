/* global describe, it, before */

import chai from 'chai';
import Visualization from '../../src/visualization/visualization'
import { defaultType, defaultOptions } from '../../src/visualization/defaults'
import Circle from "../../src/visualization/circle";

const expect = chai.expect;

describe('Visualization', () => {
  let data = null;
  let options = null;

  beforeEach(() => {
    data = [
      { x: 25, y: 36 },
      { x: 56, y: 73 },
      { x: 65, y: 135 },
      { x: 75, y: 103 },
      { x: 173, y: 64 },
      { x: 44, y: 122 },
      { x: 47, y: 38 },
      { x: 346, y: 10 },
      { x: 346, y: 410 }
    ];
    options = {
      rootNode: 'body',
      width: 400,
      height: 300,
      padding: 20,
      backgroundColor: 'white',
      circleRadius: 42,
      circleFill: 'black',
      circleStroke: '#14dfe2'
    }
  });
  describe('constructor', () => {
    it('should initialize options correctly', () => {
      // given
      const options = {
        rootNode: 'body',
        width: 100,
        height: 30,
        padding: 10,
        backgroundColor: 'blue',
        circleRadius: 25,
        circleFill: 'orange',
        circleStroke: '#e236c4'
      };
      // when
      const vis = new Visualization(data, options);
      // then
      expect(vis.options.rootNode).to.equal(options.rootNode);
      expect(vis.options.width).to.equal(options.width);
      expect(vis.options.height).to.equal(options.height);
      expect(vis.options.padding).to.equal(options.padding);
      expect(vis.options.backgroundColor).to.equal(options.backgroundColor);
      expect(vis.options.circleRadius).to.equal(options.circleRadius);
      expect(vis.options.circleFill).to.equal(options.circleFill);
      expect(vis.options.circleStroke).to.equal(options.circleStroke);
    });
  });
  describe('initData', () => {
    it('should initialize data correctly', () => {
      // given
      const givenData = [
        { x: -5, y: 3 },
        { x: 10, y: 23 },
        { x: 42, y: 12345 },
        { x: 1.3, y: 300 }
      ];
      const givenCircles = [
        new Circle(-5, 3, options.circleRadius, options.circleFill, options.circleStroke),
        new Circle(10, 23, options.circleRadius, options.circleFill, options.circleStroke),
        new Circle(42, 12345, options.circleRadius, options.circleFill, options.circleStroke),
        new Circle(1.3, 300, options.circleRadius, options.circleFill, options.circleStroke)
      ];
      const vis = new Visualization([], options);
      // when
      const data = vis.initData(givenData);
      // then
      expect(data.x).to.deep.equal({ min: -5, max: 42});
      expect(data.y).to.deep.equal({ min: 3, max: 12345});
      expect(data.circles).to.deep.equal(givenCircles);
    });
  });
  describe('validateData', () => {
    it('should pass validation', () => {
      // given
      const givenData = [
        { x: 13, y: 42 },
        { x: 145, y: 144645867 },
        { x: Math.PI, y: 53.24 }
      ];
      const vis = new Visualization([]);
      // when
      const validation = vis.validateData(givenData);
      // then
      expect(validation).to.be.true;
    });
    const failingTests = [
      { data: [{ a: 13, b: 42 }], expected: false },
      { data: [{ x: 145, foo: 144645867 }], expected: false },
      { data: [{ z: Math.PI, y: 53.24 }], expected: false },
      { data: [{ x: 'hello', y: 53.24 }], expected: false },
      { data: [{ x: 2, y: Infinity }], expected: false },
      { data: [{ x: 42, y: {} }], expected: false },
      { data: [{ x: 1, y: null }], expected: false },
      { data: [{ x: 1, y: '12' }], expected: false }
    ];
    failingTests.forEach(test => {
      it(`should fail validation for data: ${Object.entries(test.data[0])}`, () => {
        // when
        const vis = new Visualization([]);
        // given
        const validationResult = vis.validateData(test.data);
        // then
        expect(validationResult).to.equal(test.expected);
      });
    });
  });
  describe('mapDataToCircle', () => {
    it('should return correct mapping', () => {
      // given
      const givenOptions = {
        circleRadius: 31,
        circleFill: 'green',
        circleStroke: 'blue'
      };
      const givenData = { x: 13, y: 42 };
      const givenCircle = new Circle(13, 42, givenOptions.circleRadius, givenOptions.circleFill, givenOptions.circleStroke);
      const vis = new Visualization(data, givenOptions);
      // when
      const circle = vis.mapDataToCircle(givenData, givenOptions);
      // then
      expect(circle).to.deep.equal(givenCircle);
    });
  });
  describe('addCircle', () => {
    it('should add circle correctly', () => {
      // given
      const givenCircle = new Circle(1, 2, options.circleRadius, options.circleFill, options.circleStroke);
      const vis = new Visualization(data, options);
      // when
      vis.addCircle(1, 2);
      // then
      expect(vis.data.circles.pop()).to.deep.equal(givenCircle);
    });
  });
});