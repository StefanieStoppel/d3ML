import Circle from './circle';
import { defaultK } from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

export default class KNNVisualization extends Visualization {
  constructor(data, options, k = defaultK, types) {
    super(data, options);
    this.knn = new KNN(this.data.circles, k, types);
    this.addEventListeners();
  }
  addEventListeners() {
    this.onClickSvg([this.classifyAndAddCircle, this.addBoundingCircle, this.addConnectingLines]);
  }
  classifyAndAddCircle(circle) {
    const circleType = this.knn.classify(circle); // this is called twice
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
    // todo: replace this with a better version
    // todo: find out why it's not always the furthest neighbor
    const c = { cx: this.xScale(circle.cx), cy: this.yScale(circle.cy) };
    const fn = { cx: this.xScale(furthestNeighbor.cx), cy: this.yScale(furthestNeighbor.cy) };
    const d = this.knn.calculateDistance(c, fn);
    const radius = d + this.options.circleRadius;

    return new Circle(circle.cx, circle.cy, radius, 'transparent', 'white');
  }
  getConnectingLines(circle) {
    return this.knn.kClosestNeighbors.map(n => {
      return {
        x1: this.xScale(n.cx),
        x2: this.xScale(circle.cx),
        y1: this.yScale(n.cy),
        y2: this.yScale(circle.cy),
        strokeWidth: 2,
        stroke: 'rgba(230,230,230,0.5)'
      };
    });
  }
  drawBoundingCircle(boundingCircle) {
    const that = this;
    this.svg.selectAll('circle')
      .data(boundingCircle)
      .enter().append('circle')
      .style('stroke', function (d) { return d.stroke; })
      .style('fill', function (d) { return d.fill; })
      .attr('r', function (d) { return d.radius; })
      .attr('cx', function (d) { return that.xScale(d.cx); })
      .attr('cy', function (d) { return that.yScale(d.cy); })
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
