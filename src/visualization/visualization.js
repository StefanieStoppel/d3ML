import * as d3 from 'd3';
import Circle from './circle';

export default class Visualization {
  constructor(data, options) {
    this.options = Object.assign({}, {
      rootNode: 'body',
      width: 500,
      height: 300,
      padding: 50
    }, options);
    // todo: add validation for data format
    this.data = {
      x: {
        min: d3.min(data, function (d) { return d.x; }),
        max: d3.max(data, function (d) { return d.x; })
      },
      y: {
        min: d3.min(data, function (d) { return d.y; }),
        max: d3.max(data, function (d) { return d.y; })
      },
      circles: data.map(d => new Circle(d.x, d.y))
    };
    this.svg = this.appendSVG(this.data.circles, this.options.rootNode, this.options.width, this.options.height);
    this.xScale = this.createXScale(this.data.circles, this.options.width);
    this.yScale = this.createYScale(this.data.circles, this.options.height);
  }
  appendSVG(data, rootNode, width, height) {
    return d3.select(rootNode)
      .append('svg')
      .attr('id', 'd3ml')
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#1d1e22');
  }
  createXScale(data, width) {
    return d3.scaleLinear()
      .domain([this.data.x.min - this.options.padding, this.data.x.max + this.options.padding])
      .range([0, width]);
  }
  createYScale(data, height) {
    return d3.scaleLinear()
      .domain([this.data.y.min - this.options.padding, this.data.y.max + this.options.padding])
      .range([0, height]);
  }
  plotData() {
    this.drawCircles();
  }
  drawCircles() {
    const that = this;
    this.svg.selectAll('circle')
      .data(this.data.circles)
      .enter().append('circle')
      .style('stroke', function (d) { return d.stroke; })
      .style('fill', function (d) { return d.fill; })
      .attr('r', function (d) { return d.radius; })
      .attr('cx', function (d) { return that.xScale(d.cx); })
      .attr('cy', function (d) { return that.yScale(d.cy); });
  }
}
