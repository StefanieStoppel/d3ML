import Visualization from './visualization';
import LinearRegression from '../algorithms/linear-regression';

export default class LinearRegressionVisualization extends Visualization {
  constructor(data, options, types) {
    super(data, options, types);
    this.linearRegression = new LinearRegression();
  }
  draw() {
    super.draw();
    this.drawRegressionLine();
  }
  drawRegressionLine() {
    const {slope, intercept} = this.linearRegression.performRegression(this.data);
    const regressionLine = [{
      x1: 0,
      y1: intercept,
      x2: this.options.width,
      y2: this.options.width * slope + intercept
    }];
    this.svg.selectAll('line')
      .data(regressionLine)
      .enter().append('line')
      .style('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('x1', function (d) { return d.x1; })
      .attr('y1', function (d) { return d.y1; })
      .attr('x2', function (d) { return d.x2; })
      .attr('y2', function (d) { return d.y2; });
  }
}
