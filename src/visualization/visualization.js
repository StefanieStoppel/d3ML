import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions } from './defaults';
/*
 *  TODOS:
 *  - add and remove data points
 */

export default class Visualization {
  constructor(data, options) {
    this.options = Object.assign({}, defaultOptions, options);
    this.data = this.initData(data);
    this.svg = this.appendSVG();
    this.xScale = this.createXScale();
    this.yScale = this.createYScale();
  }
  validateData(data) {
    // isArray and contains objects with correct keys x and y while values are numeric
    if (!!data && Array.isArray(data)) {
      return data.reduce((res, val) => {
        return Object.entries(val).reduce((result, entry) => {
          const key = entry[0];
          const val = entry[1];
          return result
            && ['x', 'y'].includes(key)
            && typeof val === 'number'
            && val !== Infinity
            && val !== -Infinity;
        }, true);
      }, true)
    }
    return false;
  }
  initData(data) {
    return {
      x: {
        min: d3.min(data, function (d) { return d.x; }),
        max: d3.max(data, function (d) { return d.x; })
      },
      y: {
        min: d3.min(data, function (d) { return d.y; }),
        max: d3.max(data, function (d) { return d.y; })
      },
      circles: data.map(d => this.mapDataToCircle(d))
    };
  }
  addCircle(x, y) {
    this.data.circles = this.data.circles.concat(this.mapDataToCircle({x: x, y: y}));
  }
  mapDataToCircle(data) {
    return new Circle(
      data.x,
      data.y,
      this.options.circleRadius,
      this.options.circleFill,
      this.options.circleStroke);
  }
  appendSVG() { // todo: test
    return d3.select(this.options.rootNode)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
  }
  createXScale() { // todo: test
    return d3.scaleLinear()
      .domain([this.data.x.min - this.options.padding, this.data.x.max + this.options.padding])
      .range([0, this.options.width]);
  }
  createYScale() { // todo: test
    return d3.scaleLinear()
      .domain([this.data.y.min - this.options.padding, this.data.y.max + this.options.padding])
      .range([0, this.options.height]);
  }
  drawCircles() { // todo: test
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
