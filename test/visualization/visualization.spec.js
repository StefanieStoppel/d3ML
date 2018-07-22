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
  describe('mapToCircles', () => {
    it('should return correct mapping', () => {
      // given
      const givenOptions = {
        circleRadius: 31,
        circleFill: 'green',
        circleStroke: 'blue'
      };
      const givenData = [
        { x: 13, y: 42 },
        { x: 145, y: 144645867 }
      ];
      const givenCircles = [
        new Circle(13, 42, givenOptions.circleRadius, givenOptions.circleFill, givenOptions.circleStroke),
        new Circle(145, 144645867, givenOptions.circleRadius, givenOptions.circleFill, givenOptions.circleStroke)
      ];
      const vis = new Visualization(givenData, givenOptions);
      // when
      const circles = vis.mapDataToCircles(givenData, givenOptions);
      // then
      expect(circles).to.deep.equal(givenCircles);
    });
  });
});