import Circle from './circle';
import { defaultK } from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

export default class KNNVisualization extends Visualization {
  constructor(data, options, k = defaultK, types) {
    super(data, options);
    this.knn = new KNN(this.data, k, types);
    this.addEventListeners();
  }
  addEventListeners() {
    this.onClickSvg([this.classifyAndAddCircle, this.addBoundingCircle, this.addConnectingLines]);
  }
  classifyAndAddCircle(circle) {
    const circleType = this.knn.classify(circle);
    circle.setType(circleType);
    super.addCircle(circle);
  }
  addBoundingCircle(circle) {
    const boundingCircle = this.getBoundingCircle(circle, this.knn.kClosestNeighbors[this.knn.k - 1]);
    this.addCircle(boundingCircle);
    this.drawCircles();
  }
  addConnectingLines(circle) {
    const connectingLines = this.getConnectingLines(circle);
    this.drawConnectingLines(connectingLines);
  }
  getBoundingCircle(circle, furthestNeighbor) {
    const radius = furthestNeighbor.distance + this.options.circleRadius;

    return new Circle(circle.cx, circle.cy, radius, 'transparent', 'white');
  }
  getConnectingLines(circle) {
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
  drawBoundingCircle(boundingCircle) {
    this.svg.selectAll('circle')
      .data(boundingCircle)
      .enter().append('circle')
      .style('stroke', function (d) { return d.stroke; })
      .style('fill', function (d) { return d.fill; })
      .attr('r', function (d) { return d.radius; })
      .attr('cx', function (d) { return d.cx; })
      .attr('cy', function (d) { return d.cy; })
      .attr('class', 'remove');
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
