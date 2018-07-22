import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions } from './defaults';
/*
 *  TODOS:
 *  - add validation for data format
 *  - add and remove data points
 */

export default class Visualization {
  constructor(data, options) {
    this.options = Object.assign({}, defaultOptions, options);// tested
    this.data = this.initData(data, this.options);
    this.svg = this.appendSVG();
    this.xScale = this.createXScale();
    this.yScale = this.createYScale();
  }
  initData(data, options) {
    return {
      x: {
        min: d3.min(data, function (d) { return d.x; }),
        max: d3.max(data, function (d) { return d.x; })
      },
      y: {
        min: d3.min(data, function (d) { return d.y; }),
        max: d3.max(data, function (d) { return d.y; })
      },
      circles: this.mapDataToCircles(data, options)
    };
  }
  mapDataToCircles(data, options) {
    return data.map(d => {
      return new Circle(
        d.x,
        d.y,
        options.circleRadius,
        options.circleFill,
        options.circleStroke);
    });
  }
  appendSVG() {
    return d3.select(this.options.rootNode)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
  }
  createXScale() {
    return d3.scaleLinear()
      .domain([this.data.x.min - this.options.padding, this.data.x.max + this.options.padding])
      .range([0, this.options.width]);
  }
  createYScale() {
    return d3.scaleLinear()
      .domain([this.data.y.min - this.options.padding, this.data.y.max + this.options.padding])
      .range([0, this.options.height]);
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
  draw() {
    this.drawCircles();
  }
}
