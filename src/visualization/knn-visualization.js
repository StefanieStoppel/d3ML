import Circle from './circle';
import {defaultK, defaultType} from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

/*
 * TODO:
 * - add boolean flag for clickable
 * - add weighted
 */

export default class KNNVisualization extends Visualization {
  constructor(data, options, types, k = defaultK) {
    super(data, options, types);
    this.knn = new KNN(this.data, types, k);
    this.addEventListeners();
  }
  addEventListeners() {
    this.onClickSvg([this.svgClickCallback]);
  }
  svgClickCallback(circle) {
    const classifiedCircle = this.getClassifiedCircle(circle);
    this.addCircle(classifiedCircle);
    this.addCircle(this.getBoundingCircle(classifiedCircle));
    this.drawCircles();
    this.drawConnectingLines(this.mapClosestNeighborsToConnectingLines(classifiedCircle));
    this.removeElementsAfterTransition('.remove');
  }
  getClassifiedCircle(circle) {
    const circleType = this.knn.classify(circle, this.data);
    circle.setType(circleType);

    return circle;
  }
  getBoundingCircle(circle) {
    const furthestNeighbor = this.knn.kClosestNeighbors[this.knn.k - 1];
    const radius = furthestNeighbor.distance + this.options.circleRadius;
    const boundingCircle = new Circle(circle.cx, circle.cy, radius, 'transparent', 'white');
    boundingCircle.setCssClass('remove');

    return boundingCircle;
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
  removeElementsAfterTransition(selector) {
    this.data = this.data.filter(c => c.type !== defaultType);

    const that = this;
    this.svg.selectAll(selector)
      .transition()
      .duration(2000)
      .style('stroke', 'transparent')
      .style('fill', 'transparent')
      .on('end', function () {
        that.removeElements(selector);
      });
  }
  removeElements(selector) {
    this.svg.selectAll(selector).remove();
  }
};
