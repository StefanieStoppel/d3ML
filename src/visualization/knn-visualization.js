import Circle from './circle';
import { defaultK } from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

/*
 * TODO:
 * - add class .remove to bounding circle and lines
 * - remove them after a few seconds
 * - add transitions
 * - add weighted
 */

export default class KNNVisualization extends Visualization {
  constructor(data, options, types, k = defaultK) {
    super(data, options, types);
    this.knn = new KNN(this.data, k, types);
    this.addEventListeners();
  }
  addEventListeners() { // todo: test
    this.onClickSvg([this.classifyAndAddCircle, this.addBoundingCircle, this.addConnectingLines]);
  }
  classifyAndAddCircle(circle) { // todo: test
    const circleType = this.knn.classify(circle);
    circle.setType(circleType);
    // circle.setFill(this.typeColorMap[circleType]);
    this.data.push(circle);
  }
  addBoundingCircle(circle) { // todo: test
    const boundingCircle = this.getBoundingCircle(circle, this.knn.furthestNeighborOfKClosest);
    this.addCircle(boundingCircle);
    this.drawCircles();
  }
  addConnectingLines(circle) { // todo: test
    const connectingLines = this.mapClosestNeighborsToConnectingLines(circle);
    this.drawConnectingLines(connectingLines);
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
  drawConnectingLines(connectingLines) {
    this.svg.selectAll('line')
      .data(connectingLines)
      .enter().append('line')
      .style('stroke', function (d) { return d.stroke; })
      .attr('stroke-width', function (d) { return d.strokeWidth; })
      .attr('x1', function (d) { return d.x1; })
      .attr('y1', function (d) { return d.y1; })
      .attr('x2', function (d) { return d.x2; })
      .attr('y2', function (d) { return d.y2; })
      .attr('class', 'remove');
  }
};
