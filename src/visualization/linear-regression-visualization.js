import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';
import Painter from './painter';
import HTMLElementCreator from './html-element-creator';

const selectors = {
  id: {
    showRegressionLineCheckbox: 'show-rl',
    showRegressionLineLabel: 'show-rl-label',
    showUserLineCheckbox: 'show-cl',
    showUserLineLabel: 'show-cl-label'
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
    this.userIntercept = this.options.height / 2;
    this.showRegressionLines = true;
    this.showUserLines = false;

    super.appendSettings([
      this.createTotalSquaredErrorDisplay(),
      this.createSettingsGroupShowRegressionLine(),
      this.createSettingsGroupShowUserLine()
    ]);
    this.addEventListeners();
  }
  addEventListeners() {
    super.onClickSvg([this.svgClickCallback]);
    super.onChangeInput(
      selectors.id.showRegressionLineCheckbox,
      'checkbox',
      [this.checkboxShowRegressionLineChangeCallback]
    );
    super.onChangeInput(
      selectors.id.showUserLineCheckbox,
      'checkbox',
      [this.checkboxShowUserLineChangeCallback]
    );
  }
  svgClickCallback(circle) {
    super.addCircle(circle);
    this.update();
    this.redraw();
  }
  checkboxShowRegressionLineChangeCallback(checked) {
    this.showRegressionLines = checked;
    this.redrawLines();
  }
  checkboxShowUserLineChangeCallback(checked) {
    this.showUserLines = checked;
    this.redrawLines();
  }
  draw() {
    this.update();
    this.redraw();
  }
  update() {
    this.performRegression();
    this.updateTotalSquaredErrorDisplay(this.getTotalSquaredError());
  }
  redraw() {
    Painter.drawCircles(this.svg, this.data);
    this.redrawLines();
  }
  redrawLines() {
    this.svg.selectAll('line').remove();
    Painter.drawLines(this.svg, this.getLines());
  }
  getLines() {
    let lines = [];
    if (this.showUserLines) {
      lines = lines.concat(this.getUserLines());
    }
    if (this.showRegressionLines) {
      lines = lines.concat(this.getRegressionLines());
    }

    return lines;
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

    return [this.getRegressionLine()].concat(this.getRegressionConnectingLines());
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
      this.createLine(
        d.cx,
        d.cy,
        d.cx,
        this.slope * d.cx + this.intercept,
        'white',
        '2',
        selectors.class.regressionLine
      )
    );
  }
  getUserLines() {
    return [this.getUserLine()].concat(this.getUserConnectingLines());
  }
  getUserLine() {
    return this.createLine(
      0,
      this.options.height / 2,
      this.options.width,
      this.options.height / 2,
      'blue',
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
        'blue',
        '3',
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
  createSettingsGroupShowUserLine() {
    const labelText = 'Show custom line: ';
    const labelAttributes = [
      ['for', selectors.id.showUserLineCheckbox],
      ['id', selectors.id.showUserLineLabel]
    ];
    const inputAttributes = [
      ['id', selectors.id.showUserLineCheckbox],
      ['type', 'checkbox']
    ];
    const labeledCheckbox = HTMLElementCreator.createLabeledInput(labelText, labelAttributes, '', inputAttributes);

    return HTMLElementCreator.createSettingsGroup([labeledCheckbox]);
  }
}
