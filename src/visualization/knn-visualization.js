import Circle from './circle';
import {defaultK, defaultType} from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

/*
 * TODO:
 * - add weighted checkbox
 * - add slider for k
 */

export default class KNNVisualization extends Visualization {
  constructor(data, options, types, k = defaultK) {
    super(data, options, types);
    this.knn = new KNN(this.data, types, k);

    document.querySelector(this.options.rootNode).appendChild(this.createSettings());
    this.addEventListeners();
  }
  createSettings() { // todo: refactor and test
    const settings = this.createElement('div', [['class', 'settings']]);

    const inputAttributes = [
      ['id', 'range-k'],
      ['type', 'range'],
      ['min', '1'],
      ['max', this.data.length], // todo: update max value according to new data.length
      ['value', this.knn.k]
    ];
    const labelAttributes = [
      ['for', 'range-k'],
      ['id', 'range-k-label']
    ];
    const labelText = 'Amount of neighbors, k: ';
    const { label, input } = this.createLabeledInput(labelText, labelAttributes, this.knn.k, inputAttributes);
    settings.appendChild(this.createSettingsGroup([label, input]));

    return settings;
  }
  addEventListeners() {
    this.onClickSvg(this.svgId, [this.svgClickCallback]);
    this.onChangeInput('range-k', [this.inputRangeKChangeCallback]);
  }
  svgClickCallback(circle) {
    this.setClickable(false);
    const classifiedCircle = this.getClassifiedCircle(circle);
    this.addCircle(classifiedCircle);
    const boundingCircle = this.getBoundingCircle(classifiedCircle);
    this.addCircle(boundingCircle);
    this.drawCircles();
    this.drawConnectingLines(this.mapClosestNeighborsToConnectingLines(classifiedCircle));
    this.data = this.data.filter(c => c !== boundingCircle);
    this.removeElementsAfterTransition('.remove');
  }
  inputRangeKChangeCallback(k) {
    this.k = k;
    this.knn.k = k;
    document.querySelector('#range-k-label > span').innerHTML = k;
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
    const that = this;
    this.svg.selectAll(selector)
      .transition()
      .duration(2000)
      .style('stroke', 'transparent')
      .style('fill', 'transparent')
      .on('end', function () {
        that.removeElements(selector);
        that.setClickable(true);
      });
  }
  removeElements(selector) {
    this.svg.selectAll(selector).remove();
  }
};
