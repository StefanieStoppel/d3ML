import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';
import Painter from './painter';

export default class LinearRegressionVisualization extends Visualization {
  constructor(data, options, types) {
    super(data, options, types);
    this.linearRegression = new LinearRegression();
    this.addEventListeners();
  }
  addEventListeners() {
    this.onClickSvg([this.svgClickCallback]);
  }
  svgClickCallback(circle) {
    this.addCircle(circle);
    super.draw();
    Painter.transitionLine(this.svg, this.getRegressionLine(), 300);
  }
  draw() {
    super.draw();
    const regressionLines = [this.getRegressionLine()];
    Painter.drawLines(this.svg, regressionLines);
  }
  getRegressionLine() {
    const {slope, intercept} = this.linearRegression.performRegression(this.data);

    return {
      x1: 0,
      y1: intercept,
      x2: this.options.width,
      y2: this.options.width * slope + intercept,
      stroke: 'white',
      strokeWidth: '2',
      cssClass: ''
    };
  }
}
