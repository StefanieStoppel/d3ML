/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import LinearRegressionVisualization from '../../../src/visualization/linear-regression-visualization';
import LinearRegression from '../../../src/algorithms/linear-regression';
import {defaultClassSelectors} from '../../../src/visualization/defaults';

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
    });
  });
  describe('draw', () => {
    it('should draw circles, regression line and connecting lines correctly', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      const {slope, intercept} = vis.linearRegression.performRegression(vis.data); // eslint-disable-line
      const expectedLines = vis.getRegressionLines();
      // when
      vis.draw();
      // then
      expect(Array.from(document.querySelectorAll('circle')).length).to.equal(data.length);
      const lines = Array.from(document.querySelectorAll('line'));
      expect(lines.length).to.equal(vis.data.length + 1);
      lines.forEach((line, idx) => {
        expect(line).to.have.attr('x1', expectedLines[idx].x1.toString());
        expect(line).to.have.attr('y1', expectedLines[idx].y1.toString());
        expect(line).to.have.attr('x2', expectedLines[idx].x2.toString());
        expect(line).to.have.attr('y2', expectedLines[idx].y2.toString());
        expect(line).to.have.attr('class', expectedLines[idx].cssClass.toString());
        expect(line).to.have.attr('stroke-width', expectedLines[idx].strokeWidth.toString());
        expect(line).to.have.style('stroke', expectedLines[idx].stroke.toString());
      });
    });
  });
  describe('getRegressionLines', () => {
    it('should return lines correctly', () => {
      // given
      const givenData = [
        {x: 0, y: 0},
        {x: 4, y: 2},
        {x: 3, y: 5},
        {x: 7, y: 19}
      ];
      options = {
        width: 200,
        height: 100
      };
      const vis = new LinearRegressionVisualization(givenData, options, []);
      const {slope, intercept} = vis.linearRegression.performRegression(vis.data);
      // when
      const lines = vis.getRegressionLines();
      // then
      const expectedLines = [vis.getRegressionLine(slope, intercept)].concat(vis.getRegressionConnectingLines(slope, intercept));
      expect(lines).to.deep.equal(expectedLines);
    });
  });
  describe('getRegressionLine', () => {
    it('should return regression line correctly', () => {
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
      vis.performRegression();
      const expectedLine = {
        x1: 0,
        y1: vis.intercept,
        x2: options.width,
        y2: options.width * vis.slope + vis.intercept,
        stroke: 'white',
        strokeWidth: '2',
        cssClass: 'regression-line'
      };
      // when
      const line = vis.getRegressionLine();
      // then
      expect(line).to.deep.equal(expectedLine);
    });
  });
  describe('getRegressionConnectingLines', () => {
    it('should return connecting lines correctly', () => {
      // given
      const givenData = [
        {x: 0, y: 0},
        {x: 4, y: 2},
        {x: 3, y: 5},
        {x: 7, y: 19}
      ];
      options = {
        width: 200,
        height: 100
      };
      const vis = new LinearRegressionVisualization(givenData, options, []);
      vis.performRegression();
      // when
      const lines = vis.getRegressionConnectingLines();
      // then
      lines.forEach((line, idx) => {
        expect(line.x1).to.equal(vis.data[idx].cx);
        expect(line.y1).to.equal(vis.data[idx].cy);
        expect(line.x2).to.equal(vis.data[idx].cx);
        expect(line.y2).to.equal(vis.slope * vis.data[idx].cx + vis.intercept);
      });
    });
  });
  describe('getUserConnectingLines', () => {
    it('should return correct connecting lines for user line', () => {
      // given
      const givenData = [
        {x: 0, y: 0},
        {x: 4, y: 2},
        {x: 3, y: 5},
        {x: 7, y: 19}
      ];
      options = {
        width: 200,
        height: 100
      };
      const vis = new LinearRegressionVisualization(givenData, options, []);
      vis.performRegression();
      // when
      const lines = vis.getUserConnectingLines();
      // then
      lines.forEach((line, idx) => {
        expect(line.x1).to.equal(vis.data[idx].cx);
        expect(line.y1).to.equal(vis.data[idx].cy);
        expect(line.x2).to.equal(vis.data[idx].cx);
        expect(line.y2).to.equal(vis.userSlope * vis.data[idx].cx + vis.userIntercept);
      });
    });
  });
  describe('svgClickCallback', () => {
    it('should add circle correctly', () => {
      // given
      const givenCircle = {
        cx: '100',
        cy: '200',
        radius: '3',
        stroke: 'yellow',
        cssClass: 'c'
      };
      const spy = sinon.spy(LinearRegressionVisualization.prototype, 'getRegressionLine');
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      vis.svgClickCallback(givenCircle);
      // then
      const circle = Array.from(document.querySelectorAll('circle'))[data.length];
      expect(circle).to.have.attr('cx', givenCircle.cx);
      expect(circle).to.have.attr('cy', givenCircle.cy);
      expect(circle).to.have.attr('r', givenCircle.radius);
      expect(circle).to.have.style('stroke', givenCircle.stroke);
      expect(circle).to.have.attr('class', givenCircle.cssClass);

      expect(spy).to.have.been.calledOnce;

      LinearRegressionVisualization.prototype.getRegressionLine.restore();
    });
  });
  describe('getTotalSquaredError', () => {
    it('should calculate total squared error correctly', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      vis.performRegression();
      const expectedTotalSquaredError =
        vis.data.reduce((sum, value) => sum + Math.pow(value.cy - (vis.slope * value.cx + vis.intercept), 2), 0);
      // when
      const totalSquaredError = vis.getTotalSquaredError(vis.data);
      // then
      expect(totalSquaredError).to.equal(expectedTotalSquaredError);
    });
  });
  describe('updateTotalSquaredErrorDisplay', () => {
    it('should update display of total squared error correctly', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      vis.updateTotalSquaredErrorDisplay(0);
      // then
      const updatedTotalSquaredErrorValue = document.querySelector('.error--tse .value');
      expect(updatedTotalSquaredErrorValue).to.have.text('0');
    });
  });
  describe('update', () => {
    it('should perform regression and update display of error', () => {
      // given
      const givenCircle = {
        cx: '100',
        cy: '200',
        radius: '3',
        stroke: 'yellow',
        cssClass: 'c'
      };
      const regressionSpy = sinon.spy(LinearRegressionVisualization.prototype, 'performRegression');
      const totalSquaredErrorSpy = sinon.spy(LinearRegressionVisualization.prototype, 'updateTotalSquaredErrorDisplay');
      const vis = new LinearRegressionVisualization(data, options, []);
      vis.addCircle(givenCircle);
      // when
      vis.update();
      // then
      expect(regressionSpy).to.have.been.calledOnce;
      expect(totalSquaredErrorSpy).to.have.been.calledWith(vis.getTotalSquaredError());

      // cleanup
      LinearRegressionVisualization.prototype.performRegression.restore();
      LinearRegressionVisualization.prototype.updateTotalSquaredErrorDisplay.restore();
    });
  });
  describe('createSettingsGroupShowRegressionLine', () => {
    it('should create a settings group with checkbox for displaying the regression line', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      const settingsGroup = vis.createSettingsGroupShowRegressionLine();
      // then
      expect(settingsGroup).to.have.attr('class', defaultClassSelectors.settingsGroup);
      const label = settingsGroup.querySelector('label');
      expect(label).to.have.text('Show regression line: ');
      expect(label).to.have.attr('for', 'show-rl');
      expect(label).to.have.id('show-rl-label');
      const checkbox = settingsGroup.querySelector('input');
      expect(checkbox).to.have.id('show-rl');
      expect(checkbox).to.have.attr('type', 'checkbox');
      expect(checkbox).to.have.attr('checked', 'checked');
    });
  });
  describe('createSettingsGroupShowUserLine', () => {
    it('should create a settings group with checkbox for displaying the user line', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      const settingsGroup = vis.createSettingsGroupShowUserLine();
      // then
      expect(settingsGroup).to.have.attr('class', defaultClassSelectors.settingsGroup);
      const label = settingsGroup.querySelector('label');
      expect(label).to.have.text('Show custom line: ');
      expect(label).to.have.attr('for', 'show-cl');
      expect(label).to.have.id('show-cl-label');
      const checkbox = settingsGroup.querySelector('input');
      expect(checkbox).to.have.id('show-cl');
      expect(checkbox).to.have.attr('type', 'checkbox');
    });
  });
  describe('checkboxShowRegressionLineChangeCallback', () => {
    it('should remove lines when unchecked', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      vis.draw();
      expect(document.querySelector(`#${vis.containerId} .regression-line`)).to.not.equal(null);
      // when
      vis.checkboxShowRegressionLineChangeCallback(false);
      // then
      expect(document.querySelector(`#${vis.containerId} .regression-line`)).to.equal(null);
    });
    it('should draw lines from data when checkbox checked', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      const expectedAmountOfLines = vis.data.length + 1;
      vis.draw();
      expect(document.querySelector(`#${vis.containerId} .regression-line`)).to.not.equal(null);
      vis.checkboxShowRegressionLineChangeCallback(false);
      expect(document.querySelector(`#${vis.containerId} .regression-line`)).to.equal(null);
      // when
      vis.checkboxShowRegressionLineChangeCallback(true);
      // then
      const lines = Array.from(document.querySelectorAll(`#${vis.containerId} .regression-line`));
      expect(lines.length).to.equal(expectedAmountOfLines);
    });
  });
  describe('checkboxShowUserLineChangeCallback', () => {
    it('should have no user lines by default (unchecked)', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      vis.draw();
      // when
      vis.checkboxShowUserLineChangeCallback(false);
      // then
      expect(document.querySelector(`#${vis.containerId} .user-line`)).to.equal(null);
    });
    it('should draw lines from data when checkbox checked', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      const expectedAmountOfLines = vis.data.length + 1;
      vis.draw();

      expect(document.querySelector(`#${vis.containerId} .user-line`)).to.equal(null);
      // when
      vis.checkboxShowUserLineChangeCallback(true);
      // then
      const lines = Array.from(document.querySelectorAll(`#${vis.containerId} .user-line`));
      expect(lines.length).to.equal(expectedAmountOfLines);
    });
  });
  describe('getUserLine', () => {
    it('should return correct user line', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      const expectedLine = {
        x1: 0,
        y1: vis.options.height / 2,
        x2: vis.options.width,
        y2: vis.options.height / 2,
        stroke: 'blue',
        strokeWidth: '2',
        cssClass: 'user-line'
      };
      // when
      const userLine = vis.getUserLine();
      // then
      expect(userLine).to.deep.equal(expectedLine);
    });
  });
  describe('createSettingsGroupForSlope', () => {
    it('should create a settings group with range for changing the user line slope', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      const settingsGroup = vis.createSettingsGroupForSlope();
      // then
      expect(settingsGroup).to.have.attr('class', defaultClassSelectors.settingsGroup);
      const label = settingsGroup.querySelector('label');
      expect(label).to.have.text('User line slope: 0');
      expect(label).to.have.attr('for', 'range-slope');
      expect(label).to.have.id('range-slope-label');
      const checkbox = settingsGroup.querySelector('input');
      expect(checkbox).to.have.id('range-slope');
      expect(checkbox).to.have.attr('type', 'range');
      expect(checkbox).to.have.attr('min', '-1');
      expect(checkbox).to.have.attr('max', '1');
      expect(checkbox).to.have.attr('step', '0.005');
      expect(checkbox).to.have.attr('value', '0');
    });
  });
  describe('createSettingsGroupForIntercept', () => {
    it('should create a settings group with range for changing the user line intercept', () => {
      // given
      const vis = new LinearRegressionVisualization(data, options, []);
      // when
      const settingsGroup = vis.createSettingsGroupForIntercept();
      // then
      expect(settingsGroup).to.have.attr('class', defaultClassSelectors.settingsGroup);
      const label = settingsGroup.querySelector('label');
      expect(label).to.have.text(`User line intercept: ${vis.options.height / 2}`);
      expect(label).to.have.attr('for', 'range-intercept');
      expect(label).to.have.id('range-intercept-label');
      const checkbox = settingsGroup.querySelector('input');
      expect(checkbox).to.have.id('range-intercept');
      expect(checkbox).to.have.attr('type', 'range');
      expect(checkbox).to.have.attr('min', '0');
      expect(checkbox).to.have.attr('max', (vis.options.height * 2).toString());
      expect(checkbox).to.have.attr('step', '1');
      expect(checkbox).to.have.attr('value', (vis.options.height / 2).toString());
    });
  })
});
