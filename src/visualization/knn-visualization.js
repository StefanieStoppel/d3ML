import Circle from './circle';
import {defaultK, defaultType} from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

/*
 * TODO:
 * - add class .remove to bounding circle and lines
 * - remove them after a few seconds
 * - add weighted
 */

export default class KNNVisualization extends Visualization {
  constructor(data, options, types, k = defaultK) {
    super(data, options, types);
    this.knn = new KNN(this.data, types, k);
    this.boundingCircle = null;
    this.connectingLines = null;
    this.addEventListeners();
  }
  addEventListeners() {
    this.onClickSvg([
      this.classifyAndAddCircle,
      this.addBoundingCircle,
      this.drawCircles,
      this.addConnectingLines,
      this.drawConnectingLines
    ]);
  }
  classifyAndAddCircle(circle) {
    const circleType = this.knn.classify(circle);
    circle.setType(circleType);
    this.addCircle(circle);
  }
  addBoundingCircle(circle) { // todo: test
    this.boundingCircle = this.getBoundingCircle(circle, this.knn.furthestNeighborOfKClosest);
    this.addCircle(this.boundingCircle);
  }
  addConnectingLines(circle) { // todo: test
    this.connectingLines = this.mapClosestNeighborsToConnectingLines(circle);
  }
  getBoundingCircle(circle, furthestNeighbor) {
    const radius = furthestNeighbor.distance + this.options.circleRadius;

    return new Circle(circle.cx, circle.cy, radius, 'transparent', 'white');
  }
  mapClosestNeighborsToConnectingLines(circle) {
    return this.knn.kClosestNeighbors.map(n => {
      return {
        x1: n.cx,
        x2: circle.cx,
        y1: n.cy,
        y2: circle.cy,
        strokeWidth: 2,
        stroke: 'rgba(230,230,230,0.5)'
      };
    });
  }
  drawConnectingLines() {
    this.svg.selectAll('line')
      .data(this.connectingLines)
      .enter().append('line')
      .style('stroke', function (d) { return d.stroke; })
      .attr('stroke-width', function (d) { return d.strokeWidth; })
      .attr('x1', function (d) { return d.x1; })
      .attr('y1', function (d) { return d.y1; })
      .attr('x2', function (d) { return d.x2; })
      .attr('y2', function (d) { return d.y2; })
      .attr('class', 'remove');
  }
  drawCircles() {
    super.drawCircles();
    const colorMap = this.typeColorMap;
    this.svg.selectAll('circle')
      .transition().duration(1500)
      .style('fill', function (d) {
        const typeColor = colorMap[d.type];

        return d.type === defaultType || d.fill === typeColor ? d.fill : typeColor;
      });
  }
};
