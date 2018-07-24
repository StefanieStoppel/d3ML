/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import KNNVisualization from '../../src/visualization/knn-visualization';
import Circle from '../../src/visualization/circle';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(chaiDom);
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
      const vis = new KNNVisualization(data, options);
      const connectingLines = [
        { x1: 2, x2: 5, y1: 6, y2: 7, strokeWidth: 2, stroke: 'rgba(230,230,230,0.5)' },
        { x1: 5, x2: 1, y1: 93, y2: 23, strokeWidth: 2, stroke: 'rgba(230,230,230,0.5)' },
        { x1: 42, x2: 0, y1: 84, y2: 12, strokeWidth: 2, stroke: 'rgba(230,230,230,0.5)' }
      ];
      // when
      vis.drawConnectingLines(connectingLines);
      // then
      const lines = Array.from(document.querySelectorAll('line'));
      lines.forEach((line, idx) => {
        expect(line).to.have.attr('x1', connectingLines[idx].x1.toString());
        expect(line).to.have.attr('x2', connectingLines[idx].x2.toString());
        expect(line).to.have.attr('y1', connectingLines[idx].y1.toString());
        expect(line).to.have.attr('y2', connectingLines[idx].y2.toString());
        expect(line).to.have.attr('style', `stroke: rgba(230,230,230,0.5);`);
        expect(line).to.have.attr('stroke-width', '2');
        expect(line).to.have.class('remove');
      });
    })
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
        new Circle(4, 8),
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
    })
    describe('getBoundingCircle', () => {
      it('should return correct bounding circle', () => {
        // given
        const vis = new KNNVisualization(data, options);
        const cx = 1;
        const cy = 2;
        const distance = 14;
        const radius = distance + options.circleRadius;
        const circle = new Circle(cx, cy);
        const furthestNeighbor = new Circle(64, 34);
        furthestNeighbor.setDistance(distance);
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
  });
});
