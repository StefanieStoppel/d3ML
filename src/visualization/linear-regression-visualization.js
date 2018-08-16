import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';
import Painter from './painter';

export default class LinearRegressionVisualization extends Visualization {
  constructor(data, options, types) {
    super(data, options, types);
    this.linearRegression = new LinearRegression();
    this.addEventListeners();
    this.lines = [];
  }
  addEventListeners() {
    this.onClickSvg([this.svgClickCallback]);
  }
  svgClickCallback(circle) {
    this.addCircle(circle);
    this.redraw();
  }
  redraw() {
    Painter.drawCircles(this.svg, this.data);
    this.transitionLines();
  }
  transitionLines() {
    const lines = this.getLinesToDraw();
    const linesCopy = Array.from(lines);
    let newLine = linesCopy[linesCopy.length - 1];
    linesCopy[linesCopy.length - 1] = Object.assign({}, newLine, {y2: newLine.y1});
    Painter.drawLines(this.svg, linesCopy);
    Painter.transitionLines(this.svg, lines, 300);
  }
  draw() {
    Painter.drawCircles(this.svg, this.data);
    Painter.drawLines(this.svg, this.getLinesToDraw());
  }
  createLine(x1, y1, x2, y2, stroke, strokeWidth, cssClass) {
    return {x1, y1, x2, y2, stroke, strokeWidth, cssClass};
  }
  getLinesToDraw() {
    const {slope, intercept} = this.linearRegression.performRegression(this.data);
    const regressionLine = this.getRegressionLine(slope, intercept);
    const connectingLines = this.getConnectingLines(slope, intercept);

    return [regressionLine].concat(connectingLines);
  }
  getRegressionLine(slope, intercept) {
    return this.createLine(0, intercept, this.options.width, this.options.width * slope + intercept, 'white', '2', '');
  }
  getConnectingLines(slope, intercept) {
    return this.data.map(d => this.createLine(d.cx, d.cy, d.cx, slope * d.cx + intercept, 'white', '1', ''));
  }
}
