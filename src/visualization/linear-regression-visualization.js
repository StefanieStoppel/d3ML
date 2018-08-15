import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';
import Painter from './painter';

export default class LinearRegressionVisualization extends Visualization {
  constructor(data, options, types) {
    super(data, options, types);
    this.linearRegression = new LinearRegression();
  }
  draw() {
    super.draw();
    const regressionLine = this.getRegressionLine();
    Painter.drawLines(this.svg, [regressionLine]);
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
