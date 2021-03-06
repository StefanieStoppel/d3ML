/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import chaiStyle from 'chai-style';
import KNNVisualization from '../../src/visualization/knn-visualization';
import Circle from '../../src/visualization/circle';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {createEvent} from '../test-helper';
import D3TransitionTestUtils from '../d3-transition-test-helper';
import Visualization from '../../src/visualization/visualization';

chai.use(chaiDom);
chai.use(chaiStyle);
chai.use(sinonChai);
const expect = chai.expect;

describe('KNNVisualization', () => {
  let data = null;
  let options = null;

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
      width: 400,
      height: 300,
      padding: 20,
      backgroundColor: 'white',
      circleRadius: 4,
      circleFill: 'red',
      circleStroke: 'magenta'
    };
  });
  afterEach(() => {
    const svgs = Array.from(document.querySelectorAll('svg'));
    svgs.forEach(svg => {
      svg.remove();
    });
    const settings = Array.from(document.querySelectorAll('.settings'));
    settings.forEach(setting => {
      setting.remove();
    });
  });
  describe('constructor', () => {
    it('should initialize KNN algorithm', () => {
      // given
      // when
      const vis = new KNNVisualization(data, options);
      // then
      expect(vis.knn).to.not.be.null;
    });
    it('should attach range slider and label for changing k', () => {
      // given
      const k = 4;
      // when
      const vis = new KNNVisualization(data, options, [], k); // eslint-disable-line
      // then
      expect(document.querySelector('#range-k').value).to.equal(k.toString());
      expect(document.querySelector('#range-k-label span')).to.have.text(k.toString());
    });
    it('should attach checkbox and label for setting weighted', () => {
      // given
      // when
      const vis = new KNNVisualization(data, options, [], 3);// eslint-disable-line
      // then
      expect(document.querySelector('#weighted').value).to.equal('false');
      expect(document.querySelector('#weighted-label span')).to.have.text('false');
    });
  });
  describe('drawConnectingLines', () => {
    it('should draw lines correctly', () => {
      // given
      const data = [
        {x: 2, y: 6},
        {x: 5, y: 93},
        {x: 42, y: 84},
        {x: 524, y: 1242},
        {x: 35, y: 232}
      ];
      const neighbors = [
        new Circle(2, 6),
        new Circle(5, 93),
        new Circle(42, 84)
      ];
      const vis = new KNNVisualization(data, options);
      const newCircle = new Circle(5, 7);
      vis.knn.kClosestNeighbors = neighbors;
      const connectingLines = vis.mapClosestNeighborsToConnectingLines(newCircle);
      // when
      vis.drawConnectingLines(connectingLines);
      // then
      const lines = Array.from(document.querySelectorAll('line'));
      lines.forEach((line, idx) => {
        expect(line).to.have.attr('x1', data[idx].x.toString());
        expect(line).to.have.attr('x2', newCircle.cx.toString());
        expect(line).to.have.attr('y1', data[idx].y.toString());
        expect(line).to.have.attr('y2', newCircle.cy.toString());
        expect(line).to.have.attr('style', 'stroke: rgba(230,230,230,0.5);');
        expect(line).to.have.attr('stroke-width', '2');
        expect(line).to.have.class('remove');
      });
    });
  });
  describe('mapClosestNeighborsToConnectingLines', () => {
    it('should map closest neighbors to lines correctly', () => {
      // given
      const connectingLines = [
        {x1: 2, x2: 1, y1: 2, y2: 2, strokeWidth: 2, stroke: 'rgba(230,230,230,0.5)'},
        {x1: 0, x2: 1, y1: -2, y2: 2, strokeWidth: 2, stroke: 'rgba(230,230,230,0.5)'},
        {x1: 4, x2: 1, y1: 8, y2: 2, strokeWidth: 2, stroke: 'rgba(230,230,230,0.5)'}
      ];
      const vis = new KNNVisualization(data, options);
      vis.knn.kClosestNeighbors = [
        new Circle(2, 2),
        new Circle(0, -2),
        new Circle(4, 8)
      ];
      const circle = new Circle(1, 2);
      // when
      const lines = vis.mapClosestNeighborsToConnectingLines(circle);
      // then
      lines.forEach((line, idx) => {
        expect(line.x1).to.equal(connectingLines[idx].x1);
        expect(line.x2).to.equal(connectingLines[idx].x2);
        expect(line.y1).to.equal(connectingLines[idx].y1);
        expect(line.y2).to.equal(connectingLines[idx].y2);
        expect(line.stroke).to.equal('rgba(230,230,230,0.5)');
        expect(line.strokeWidth).to.equal(2);
      });
    });
  });
  describe('getBoundingCircle', () => {
    it('should return correct bounding circle', () => {
      // given
      const data = [
        { x: 1, y: 1, type: 'A' },
        { x: 2, y: 2, type: 'B' },
        { x: 64, y: 34, type: 'A' },
        { x: 324, y: 53, type: 'B' }
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B'], 3);
      const cx = 1;
      const cy = 2;
      const circle = new Circle(cx, cy);
      vis.knn.classify(circle, vis.data);
      const furthestNeighbor = vis.data[2];
      const radius = vis.knn.calculateDistance(furthestNeighbor, circle) + options.circleRadius;
      // when
      const boundingCircle = vis.getBoundingCircle(circle, furthestNeighbor);
      // then
      expect(boundingCircle.cx).to.equal(cx);
      expect(boundingCircle.cy).to.equal(cy);
      expect(boundingCircle.radius).to.equal(radius);
      expect(boundingCircle.fill).to.equal('transparent');
      expect(boundingCircle.stroke).to.equal('white');
    });
  });
  describe('getClassifiedCircle', () => {
    it('should set classified type on circle', () => {
      // given
      const newCircle = new Circle(1, 2);
      const types = ['A', 'B'];
      const vis = new KNNVisualization(data, options, types, 3);
      const expectedType = 'B';
      sinon.stub(vis.knn, 'classify').callsFake((circle) => { return expectedType; });
      // when
      vis.getClassifiedCircle(newCircle);
      // then
      expect(newCircle.type).to.equal(expectedType);
    });
  });
  describe('addEventListeners', () => {
    let getClassifiedCircleStub;
    let getBoundingCircleStub;
    let drawCirclesStub;
    let mapClosestNeighborsToConnectingLinesStub;
    let drawConnectingLinesStub;
    let removeElementsAfterTransitionStub;
    beforeEach(() => {
      getClassifiedCircleStub = sinon.stub(KNNVisualization.prototype, 'getClassifiedCircle');
      getBoundingCircleStub = sinon.stub(KNNVisualization.prototype, 'getBoundingCircle');
      drawCirclesStub = sinon.stub(KNNVisualization.prototype, 'drawCircles');
      mapClosestNeighborsToConnectingLinesStub =
        sinon.stub(KNNVisualization.prototype, 'mapClosestNeighborsToConnectingLines');
      drawConnectingLinesStub = sinon.stub(KNNVisualization.prototype, 'drawConnectingLines');
      removeElementsAfterTransitionStub = sinon.stub(KNNVisualization.prototype, 'removeElementsAfterTransition');
    });
    afterEach(() => {
      KNNVisualization.prototype.getClassifiedCircle.restore();
      KNNVisualization.prototype.getBoundingCircle.restore();
      KNNVisualization.prototype.drawCircles.restore();
      KNNVisualization.prototype.mapClosestNeighborsToConnectingLines.restore();
      KNNVisualization.prototype.drawConnectingLines.restore();
      KNNVisualization.prototype.removeElementsAfterTransition.restore();
    });
    it('should register click event listener on svg and call callbacks on click', () => {
      // given
      const types = ['A', 'B'];
      const vis = new KNNVisualization(data, options, types, 3);
      const svg = document.querySelector(`svg#${vis.svgId}`);
      // when
      const { node, event } = createEvent(svg, 'click');
      event.offsetX = 100;
      event.offsetY = 200;
      node.dispatchEvent(event, true);
      // then
      expect(getClassifiedCircleStub).calledOnce;
      expect(getBoundingCircleStub).calledOnce;
      expect(drawCirclesStub).calledOnce;
      expect(mapClosestNeighborsToConnectingLinesStub).calledOnce;
      expect(drawConnectingLinesStub).calledOnce;
      expect(removeElementsAfterTransitionStub).calledOnce;
    });
  });
  describe('drawCircles', () => {
    // TODO: add a test that doesn't stub the transitions
    // TODO: check whether the circle has the right color before transitioning
    beforeEach(() => {
      D3TransitionTestUtils.stubAndForceTransitions();
    });
    afterEach(() => {
      D3TransitionTestUtils.restoreTransitions();
    });
    it('should correctly call parent method and transition fill color', () => {
      // given
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'},
        { x: 45, y: 7, type: 'B'}
      ];
      const types = ['A', 'B'];
      const vis = new KNNVisualization(data, options, types);
      const parentSpy = sinon.spy(Visualization.prototype, 'drawCircles');
      const newCircle = new Circle(2, 2);
      vis.addCircle(vis.getClassifiedCircle(newCircle));
      const expectedColor = vis.typeColorMap[types[0]];
      // when
      vis.drawCircles();
      // then
      const circle = document.querySelector('circle:last-of-type');
      expect(circle).to.have.style('fill', expectedColor);
      expect(parentSpy).calledOnce;

      Visualization.prototype.drawCircles.restore();
    });
    it('should add class .remove to bounding circle, but not to rest', () => {
      // given
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'}
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B']);
      const circle = new Circle(0, 0);
      vis.addCircle(vis.getClassifiedCircle(circle));
      vis.addCircle(vis.getBoundingCircle(circle));
      // when
      vis.drawCircles();
      // then
      const boundingCircle = document.querySelector('circle:last-of-type');
      expect(boundingCircle).to.have.attr('class', 'remove');
      const circles = Array.from(document.querySelector('circle:not(:last-of-type)'));
      circles.forEach(circle => {
        expect(circle).to.not.have.attr('class', 'remove');
      });
    });
  });
  describe('removeElements', () => {
    it('should remove all svg elements with selector .remove', () => {
      // given
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'}
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B']);
      const circle = new Circle(0, 0);
      vis.addCircle(vis.getClassifiedCircle(circle));
      vis.addCircle(vis.getBoundingCircle(circle));
      vis.drawCircles();
      vis.drawConnectingLines(vis.mapClosestNeighborsToConnectingLines(circle));
      expect(document.querySelectorAll('.remove')).to.have.length(vis.knn.k + 1);
      // when
      vis.removeElements('.remove');
      // then
      expect(document.querySelector(`svg#${vis.svgId}`)).to.not.contain('.remove');
    });
  });
  describe('removeElementsAfterTransition', () => {
    beforeEach(() => {
      D3TransitionTestUtils.stubAndForceTransitions();
    });
    afterEach(() => {
      D3TransitionTestUtils.restoreTransitions();
    });
    it('should make all elements with selector .remove transparent in transition and remove them afterwards', () => {
      // given
      const selector = '.remove';
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'},
        { x: 546, y: 424, type: 'B'}
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B'], 3);
      const circle = new Circle(1, 3);
      vis.svgClickCallback(circle);
      // when
      vis.removeElementsAfterTransition(selector);
      // then
      const transparentElements = Array.from(document.querySelectorAll(selector));
      transparentElements.forEach(t => {
        expect(t).to.have.attr('style', 'stroke: transparent; fill: transparent;');
      });
      expect(document.querySelector(`svg#${vis.svgId}`)).to.not.contain('.remove');
    });
  });
  describe('clickable', () => {
    it('should not add circle if clickable is set to false', () => {
      const dataCount = data.length;
      const vis = new KNNVisualization(data, options, ['A', 'B']);
      const svg = document.querySelector(`svg#${vis.svgId}`);
      expect(vis.data.length).to.equal(data.length);
      vis.clickable = false;
      // when
      const { node, event } = createEvent(svg, 'click');
      event.offsetX = 100;
      event.offsetY = 200;
      node.dispatchEvent(event, true);
      // then
      expect(vis.data.length).to.equal(dataCount);
      expect(vis.clickable).to.be.false;
    });
  });
  describe('inputRangeKChangeCallback', () => {
    it('should update value of k on input range change', () => {
      // given
      const expectedK = 7;
      const vis = new KNNVisualization(data, options, ['A', 'B'], 3);
      // when
      vis.inputRangeKChangeCallback(7);
      // then
      expect(vis.k).to.equal(expectedK);
      expect(vis.knn.k).to.equal(expectedK);
      expect(document.querySelector('#range-k-label > span').innerHTML).to.equal(expectedK.toString());
    });
  });
  describe('checkboxWeightedChangeCallback', () => {
    it('should set weighted to true', () => {
      // given
      const vis = new KNNVisualization(data, options, ['A', 'B'], 3);
      expect(vis.knn.weighted).to.equal(false);
      // when
      vis.checkboxWeightedChangeCallback(true);
      // then
      expect(vis.knn.weighted).to.equal(true);
    });
    it('should set weighted to false', () => {
      // given
      const vis = new KNNVisualization(data, options, ['A', 'B'], 3);
      vis.knn.weighted = true;
      // when
      vis.checkboxWeightedChangeCallback(false);
      // then
      expect(vis.knn.weighted).to.equal(false);
    });
  });
  describe('createSettingsGroupForWeighted ', () => {
    it('should create settings group for k correctly', () => {
      // given
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'},
        { x: 546, y: 424, type: 'B'}
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B']);
      // when
      const settingsGroup = vis.createSettingsGroupForWeighted();
      // then
      expect(settingsGroup).to.have.attr('class', 'settings__group');
      expect(settingsGroup).to.contain('#weighted');
      expect(settingsGroup).to.contain('#weighted-label');
      const weighted = settingsGroup.querySelector('#weighted');
      const weightedLabel = settingsGroup.querySelector('#weighted-label');
      expect(weighted).to.have.attr('type', 'checkbox');
      expect(weighted).to.have.attr('value', 'false');
      expect(weightedLabel).to.have.text('Use weighted algorithm: false');
      expect(weightedLabel).to.have.attr('for', 'weighted');
    });
  });
  describe('createSettingsGroupForK ', () => {
    it('should create settings group for k correctly', () => {
      // given
      const givenK = 4;
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'},
        { x: 546, y: 424, type: 'B'}
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B'], givenK);
      // when
      const settingsGroup = vis.createSettingsGroupForK();
      // then
      expect(settingsGroup).to.have.attr('class', 'settings__group');
      expect(settingsGroup).to.contain('#range-k');
      expect(settingsGroup).to.contain('#range-k-label');
      const k = settingsGroup.querySelector('#range-k');
      const kLabel = settingsGroup.querySelector('#range-k-label');
      expect(k).to.have.attr('type', 'range');
      expect(k).to.have.attr('min', '1');
      expect(k).to.have.attr('max', vis.data.length.toString());
      expect(k).to.have.attr('value', givenK.toString());
      expect(kLabel).to.have.text('Amount of neighbors, k: ' + givenK);
      expect(kLabel).to.have.attr('for', 'range-k');
    });
  });
  describe('createSettings', () => {
    it('should create settings with two groups correctly', () => {
      // given
      const data = [
        { x: 2, y: 3, type: 'A'},
        { x: 1, y: 1, type: 'B'},
        { x: 2, y: 4, type: 'A'},
        { x: 75, y: 4, type: 'A'},
        { x: 546, y: 424, type: 'B'}
      ];
      const vis = new KNNVisualization(data, options, ['A', 'B'], 4);
      // when
      const settings = vis.createSettings();
      // then
      expect(settings).to.have.attr('class', 'settings');
      expect(settings.querySelectorAll('.settings__group').length).to.equal(2);
    });
  });
});
