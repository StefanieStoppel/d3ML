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
import Visualization from "../../src/visualization/visualization";

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
  });
  describe('constructor', () => {
    it('should initialize KNN algorithm', () => {
      // given
      // when
      const vis = new KNNVisualization(data, options);
      // then
      expect(vis.knn).to.not.be.null;
      // todo: check event listener count is 1
    });
  });
  describe('drawConnectingLines', () => {
    it('should draw lines correctly', () => {
      // given
      const data = [
        new Circle(2, 6),
        new Circle(5, 93),
        new Circle(42, 84)
      ];
      const vis = new KNNVisualization(data, options);
      const newCircle = new Circle(5,7);
      vis.knn.kClosestNeighbors = data;
      vis.addConnectingLines(newCircle);
      // when
      vis.drawConnectingLines();
      // then
      const lines = Array.from(document.querySelectorAll('line'));
      lines.forEach((line, idx) => {
        expect(line).to.have.attr('x1', data[idx].cx.toString());
        expect(line).to.have.attr('x2', newCircle.cx.toString());
        expect(line).to.have.attr('y1', data[idx].cy.toString());
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
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 64, y: 34 },
        { x: 324, y: 53 }
      ];
      const vis = new KNNVisualization(data, options, undefined, 3);
      const cx = 1;
      const cy = 2;
      const circle = new Circle(cx, cy);
      vis.knn.classify(circle);
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
  describe('classifyAndAddCircle', () => {
    it('should set classified type on circle and add it to data', () => {
      // given
      const newCircle = new Circle(1, 2);
      const types = ['A', 'B'];
      const vis = new KNNVisualization(data, options, types, 3);
      const expectedType = 'B';
      sinon.stub(vis.knn, 'classify').callsFake((circle) => { return expectedType; });
      // when
      vis.classifyAndAddCircle(newCircle);
      // then
      expect(newCircle.type).to.equal(expectedType);
      expect(vis.data).to.contain(newCircle);
    });
  });
  describe('addEventListeners', () => {
    let classifyAndAddCircleStub;
    let addBoundingCircleStub;
    let drawCircleStub;
    let addConnectingLinesStub;
    let drawConnectingLinesStub;
    beforeEach(() => {
      classifyAndAddCircleStub = sinon.stub(KNNVisualization.prototype, 'classifyAndAddCircle');
      addBoundingCircleStub = sinon.stub(KNNVisualization.prototype, 'addBoundingCircle');
      drawCircleStub = sinon.stub(KNNVisualization.prototype, 'drawCircles');
      addConnectingLinesStub = sinon.stub(KNNVisualization.prototype, 'addConnectingLines');
      drawConnectingLinesStub = sinon.stub(KNNVisualization.prototype, 'drawConnectingLines');
    });
    afterEach(() => {
      KNNVisualization.prototype.classifyAndAddCircle.restore();
      KNNVisualization.prototype.addBoundingCircle.restore();
      KNNVisualization.prototype.drawCircles.restore();
      KNNVisualization.prototype.addConnectingLines.restore();
      KNNVisualization.prototype.drawConnectingLines.restore();
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
      expect(classifyAndAddCircleStub).calledOnce;
      expect(addBoundingCircleStub).calledOnce;
      expect(drawCircleStub).calledOnce;
      expect(addConnectingLinesStub).calledOnce;
      expect(drawConnectingLinesStub).calledOnce;
    });
  });
  describe('drawCircles', () => {
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
      const newCircle = new Circle(2,2);
      vis.classifyAndAddCircle(newCircle);
      const expectedColor = vis.typeColorMap[types[0]];
      // when
      vis.drawCircles();
      // then
      const circle = document.querySelector('circle:last-of-type');
      expect(circle).to.have.style('fill', expectedColor);
      expect(parentSpy).calledOnce;

      Visualization.prototype.drawCircles.restore();
    });
  });
});
