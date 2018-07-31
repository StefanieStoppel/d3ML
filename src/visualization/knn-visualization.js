import Circle from './circle';
import {defaultK, defaultType, defaultClassSelectors} from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

const selectors = {
  id: {
    rangeK: 'range-k',
    rangeKLabel: 'range-k-label',
    weightedCheckbox: 'weighted',
    weightedLabel: 'weighted-label'
  }
};

export default class KNNVisualization extends Visualization {
  constructor(data, options, types, k = defaultK) {
    super(data, options, types);
    this.knn = new KNN(this.data, types, k);

    this.appendSettings();
    this.addEventListeners();
  }
  appendSettings() {
    document.querySelector(`#${this.containerId}`).appendChild(this.createSettings());
  }
  createSettings() {
    const settings = this.createElement('div', [['class', defaultClassSelectors.settings]]);
    settings.appendChild(this.createSettingsGroupForK());
    settings.appendChild(this.createSettingsGroupForWeighted());

    return settings;
  }
  createSettingsGroupForK() {
    const labelText = 'Amount of neighbors, k: ';
    const labelAttributes = [
      ['for', selectors.id.rangeK],
      ['id', selectors.id.rangeKLabel]
    ];
    const inputAttributes = [
      ['id', selectors.id.rangeK],
      ['type', 'range'],
      ['min', '1'],
      ['max', this.data.length],
      ['value', this.knn.k]
    ];
    const { label, input } = this.createLabeledInput(labelText, labelAttributes, this.knn.k, inputAttributes);

    return this.createSettingsGroup([label, input]);
  }
  createSettingsGroupForWeighted() {
    const labelText = 'Use weighted algorithm: ';
    const labelAttributes = [
      ['for', selectors.id.weightedCheckbox],
      ['id', selectors.id.weightedLabel]
    ];
    const inputAttributes = [
      ['id', selectors.id.weightedCheckbox],
      ['type', 'checkbox']
    ];
    const { label, input } = this.createLabeledInput(labelText, labelAttributes, '', inputAttributes);

    return this.createSettingsGroup([label, input]);
  }
  addEventListeners() {
    this.onClickSvg([this.svgClickCallback]);
    this.onChangeInput(selectors.id.rangeK, 'range', [this.inputRangeKChangeCallback]);
    this.onChangeInput(selectors.id.weightedCheckbox, 'checkbox', [this.checkboxWeightedChangeCallback]);
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
    this.removeElementsAfterTransition(`.${defaultClassSelectors.remove}`);

    this.updateIndexRangeKMaximum(this.data.length);
  }

  updateIndexRangeKMaximum(max) {// todo: test
    document.querySelector(`#${selectors.id.rangeK}`).setAttribute('max', max);
  }
  inputRangeKChangeCallback(k) {
    this.k = k;
    this.knn.k = k;
    document.querySelector(`#${selectors.id.rangeKLabel} > span`).innerHTML = k;
  }
  checkboxWeightedChangeCallback(checked) {
    this.knn.weighted = checked;
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
    boundingCircle.setCssClass(defaultClassSelectors.remove);

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
      .attr('class', defaultClassSelectors.remove);
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
