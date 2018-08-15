/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import LinearRegressionVisualization from '../../../src/visualization/linear-regression-visualization';
import Circle from '../../../src/visualization/circle';
import LinearRegression from '../../../src/algorithms/linear-regression';
import Visualization from "../../../src/visualization/visualization";

chai.use(chaiDom);
chai.use(sinonChai);
const expect = chai.expect;

describe('LinearRegressionVisualization', () => {
  let data;
  let options;

  beforeEach(() => {
    data = [
      {x: 54, y: 76},
      {x: 56, y: 73},
      {x: 3, y: 254},
      {x: 75, y: 103},
      {x: 5, y: 235},
      {x: 44, y: 122},
      {x: 3432435, y: 38},
      {x: 346, y: 10}
    ];
    options = {
      rootNode: 'body',
      width: 200,
      height: 100,
      padding: 5,
      backgroundColor: 'black',
      circleRadius: 8,
      circleFill: 'blue',
      circleStroke: 'yellow'
    };
  });
  afterEach(() => {
    const divs = Array.from(document.querySelectorAll('body > div'));
    divs.forEach(div => {
      div.remove();
    });
  });
  describe('constructor', () => {
    it('should instantiate LinearRegression correctly', () => {
      // when
      const vis = new LinearRegressionVisualization(data, options, []);
      // then
      expect(vis.linearRegression instanceof LinearRegression).to.equal(true);
      expect(vis.linearRegression).to.not.equal(null);
    })
  });
  describe('draw', () => {
    it('should draw circles and regression line correctly', () => {
      // given
      const superSpy = sinon.spy(Visualization.prototype, 'drawCircles');
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      vis.draw();
      // then
      expect(Array.from(document.querySelectorAll('circle')).length).to.equal(data.length);
      expect(superSpy).to.have.been.calledOnce;

      superSpy.restore();
    });
  });
  // todo: fix
  describe('drawRegressionLine', () => {
    it('should draw regression line correctly', () => {
      // given
      const givenData = [
        {x: 0, y: 0},
        {x: 4, y: 2}
      ];
      options = {
        width: 200,
        height: 100
      };
      const vis = new LinearRegressionVisualization(givenData, options, []);
      const {slope, intercept} = vis.linearRegression.performRegression(vis.data);
      const expectedLine = {
        x1: '0',
        y1: intercept,
        x2: options.width.toString(),
        y2: options.width * slope + intercept
      };

      // when
      vis.drawRegressionLine();
      // then
      const line = document.querySelector('line');
      expect(line).to.not.equal(null);
      expect(line).to.have.attr('x1', expectedLine.x1);
      // expect(line).to.have.attr('y1', vis.yScale.invert(expectedLine.y1));
      expect(line).to.have.attr('x2', expectedLine.x2);
      // expect(line).to.have.attr('y2', expectedLine.y2);
      expect(line).to.have.attr('stroke-width', '2');
      expect(line).to.have.style('stroke', 'white');
    });
  });
});