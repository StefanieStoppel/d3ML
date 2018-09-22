import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';
import Painter from './painter';
import HTMLElementCreator from './html-element-creator';

const selectors = {
  id: {
    showRegressionLineCheckbox: 'show-rl',
    showRegressionLineLabel: 'show-rl-label'
  },
  class: {
    regressionLine: 'regression-line',
    userLine: 'user-line'
  }
};

export default class LinearRegressionVisualization extends Visualization {
  constructor(data, options, types) {
    super(data, options, types);
    this.linearRegression = new LinearRegression();
    this.lines = [];
    this.slope = 0;
    this.intercept = 0;
    this.userSlope = 0;
    this.userIntercept = 0;
    super.appendSettings([this.createTotalSquaredErrorDisplay(), this.createSettingsGroupShowRegressionLine()]);
    this.addEventListeners();
  }
  addEventListeners() {
    super.onClickSvg([this.svgClickCallback]);
    super.onChangeInput(
      selectors.id.showRegressionLineCheckbox,
      'checkbox',
      [this.checkboxShowRegressionLineChangeCallback]
    );
  }
  svgClickCallback(circle) {
    super.addCircle(circle);
    this.update();
    this.redraw();
  }
  checkboxShowRegressionLineChangeCallback(checked) {
    if (checked) {
      Painter.drawLines(this.svg, this.getRegressionLines());
    } else {
      this.svg.selectAll(`.${selectors.class.regressionLine}`).remove();
    }
  }
  update() {
    this.performRegression();
    this.updateTotalSquaredErrorDisplay(this.getTotalSquaredError());
  }
  redraw() {
    Painter.drawCircles(this.svg, this.data);
    this.transitionLines();
  }
  transitionLines() {
    const lines = this.getRegressionLines();
    const linesCopy = Array.from(lines);
    let newLine = linesCopy[linesCopy.length - 1];
    linesCopy[linesCopy.length - 1] = Object.assign({}, newLine, {y2: newLine.y1});
    Painter.drawLines(this.svg, linesCopy);
    Painter.transitionLines(this.svg, lines, 1500);
  }
  draw() {
    this.update();
    Painter.drawCircles(this.svg, this.data);
    Painter.drawLines(this.svg, this.getRegressionLines());
  }
  createLine(x1, y1, x2, y2, stroke, strokeWidth, cssClass) {
    return {x1, y1, x2, y2, stroke, strokeWidth, cssClass};
  }
  performRegression() {
    const {slope, intercept} = this.linearRegression.performRegression(this.data);
    this.slope = slope;
    this.intercept = intercept;
  }
  getRegressionLines() {
    this.performRegression();
    const regressionLine = this.getRegressionLine();
    const connectingLines = this.getRegressionConnectingLines();

    return [regressionLine].concat(connectingLines);
  }
  getRegressionLine() {
    return this.createLine(
      0,
      this.intercept,
      this.options.width,
      this.options.width * this.slope + this.intercept,
      'white',
      '2',
      selectors.class.regressionLine
    );
  }
  getRegressionConnectingLines() {
    return this.data.map(d =>
      this.createLine(d.cx, d.cy, d.cx, this.slope * d.cx + this.intercept, 'white', '1', selectors.class.regressionLine)
    );
  }
  getUserLine() {
    return this.createLine(
      0,
      this.options.height / 2,
      this.options.width,
      this.options.height / 2,
      'lightblue',
      '2',
      selectors.class.userLine
    );
  }
  getUserConnectingLines() {
    return this.data.map(d =>
      this.createLine(
        d.cx,
        d.cy,
        d.cx,
        this.userSlope * d.cx + this.userIntercept,
        'lightblue',
        '1',
        selectors.class.userLine)
    );
  }
  getTotalSquaredError() {
    return this.data.reduce((sum, value) => sum + Math.pow(value.cy - (this.slope * value.cx + this.intercept), 2), 0);
  }
  updateTotalSquaredErrorDisplay(totalSquaredError) {
    const tseValue = document.querySelector(`#${this.containerId} .error--tse .value`);
    tseValue.innerHTML = totalSquaredError;
  }
  createTotalSquaredErrorDisplay() {
    const label = 'Total squared error';
    const value = this.getTotalSquaredError().toString();
    const errorDisplay = HTMLElementCreator.createLabeledValue(label, value);
    errorDisplay.setAttribute('class', 'error error--tse');

    return errorDisplay;
  }
  createSettingsGroupShowRegressionLine() {
    const labelText = 'Show regression line: ';
    const labelAttributes = [
      ['for', selectors.id.showRegressionLineCheckbox],
      ['id', selectors.id.showRegressionLineLabel]
    ];
    const inputAttributes = [
      ['id', selectors.id.showRegressionLineCheckbox],
      ['type', 'checkbox'],
      ['checked', 'checked']
    ];
    const labeledCheckbox = HTMLElementCreator.createLabeledInput(labelText, labelAttributes, '', inputAttributes);

    return HTMLElementCreator.createSettingsGroup([labeledCheckbox]);
  }
}
