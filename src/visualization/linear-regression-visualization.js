import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';
import Painter from './painter';
import HTMLElementCreator from './html-element-creator';

const selectors = {
  id: {
    showRegressionLineCheckbox: 'show-rl',
    showRegressionLineLabel: 'show-rl-label',
    showUserLineCheckbox: 'show-cl',
    showUserLineLabel: 'show-cl-label',
    rangeSlope: 'range-slope',
    rangeSlopeLabel: 'range-slope-label',
    rangeIntercept: 'range-intercept',
    rangeInterceptLabel: 'range-intercept-label'
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
      this.createSettingsGroupShowUserLine(),
      this.createSettingsGroupForSlope(),
      this.createSettingsGroupForIntercept()
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
    super.onChangeInput(
      selectors.id.rangeSlope,
      'range',
      [this.rangeSlopeChangeCallback]
    );
    super.onChangeInput(
      selectors.id.rangeIntercept,
      'range',
      [this.rangeInterceptChangeCallback]
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
  rangeSlopeChangeCallback(slope) {
    this.userSlope = parseFloat(slope);
    document.querySelector(`#${selectors.id.rangeSlopeLabel} > span`).innerHTML = slope;
    this.redrawLines();
  }
  rangeInterceptChangeCallback(intercept) {
    this.userIntercept = parseFloat(intercept);
    document.querySelector(`#${selectors.id.rangeInterceptLabel} > span`).innerHTML = intercept;
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
      this.userIntercept,
      this.options.width,
      this.userSlope * this.options.width + this.userIntercept,
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
  // todo: test
  createSettingsGroupForSlope() {
    const labelText = 'User line slope: ';
    const labelAttributes = [
      ['for', selectors.id.rangeSlope],
      ['id', selectors.id.rangeSlopeLabel]
    ];
    const inputAttributes = [
      ['id', selectors.id.rangeSlope],
      ['type', 'range'],
      ['min', '-1'],
      ['max', '1'],
      ['step', '0.005'],
      ['value', this.userSlope]
    ];
    const labeledInputSlope =
      HTMLElementCreator.createLabeledInput(labelText, labelAttributes, this.userSlope, inputAttributes);

    return HTMLElementCreator.createSettingsGroup([labeledInputSlope]);
  }
  createSettingsGroupForIntercept() {
    const labelText = 'User line intercept: ';
    const labelAttributes = [
      ['for', selectors.id.rangeIntercept],
      ['id', selectors.id.rangeInterceptLabel]
    ];
    const inputAttributes = [
      ['id', selectors.id.rangeIntercept],
      ['type', 'range'],
      ['min', '0'],
      ['max', this.options.height * 2],
      ['step', '1'],
      ['value', this.userIntercept]
    ];
    const labeledInputIntercept =
      HTMLElementCreator.createLabeledInput(labelText, labelAttributes, this.userIntercept, inputAttributes);

    return HTMLElementCreator.createSettingsGroup([labeledInputIntercept]);
  }
}
