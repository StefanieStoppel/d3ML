import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions, defaultTypes } from './defaults';

export default class Visualization {
  constructor(data, options, types) {
    this.options = Object.assign({}, defaultOptions, options);
    this.types = Object.assign({}, defaultTypes, types);
    this.xScale = this.createXScale(data);
    this.yScale = this.createYScale(data);
    this.data = data.map(d => this.mapDataToCircle(d));
    this.svgId = 'd3ml-' + Date.now();
    this.svg = this.appendSVG();
  }
  validateData(data) {
    let result = false;
    if (!!data && Array.isArray(data)) {
      result = data.reduce((res, val) => {
        return Object.entries(val).reduce((result, entry) => {
          const key = entry[0];
          const val = entry[1];

          return result &&
            ['x', 'y'].includes(key) &&
            typeof val === 'number' &&
            val !== Infinity &&
            val !== -Infinity;
        }, true);
      }, true);
    }

    return result;
  }
  mapDataToCircle(data) {
    const type = data.type ? data.type : defaultTypes.None;

    return new Circle(
      this.xScale(data.x),
      this.yScale(data.y),
      this.options.circleRadius,
      this.options.circleFill,
      this.options.circleStroke,
      type);
  }
  onClickSvg(callbacks) { // todo: test
    document.querySelector(`#${this.svgId}`).addEventListener('click', (e) => {
      this.clickCallback(e, callbacks);
    });
  }
  isValidEventTarget(e) {
    return !!e.target && e.target.id === this.svgId;
  }
  clickCallback(e, callbacks) {
    if (this.isValidEventTarget(e)) {
      const newCircle = this.mapDataToCircle({x: this.xScale.invert(e.offsetX), y: this.yScale.invert(e.offsetY)});
      callbacks.forEach(callback => {
        callback.call(this, newCircle);
      });
      this.draw();
    }
  }
  addCircle(circle) {
    this.data.push(circle);
  }
  appendSVG() { // todo: test
    return d3.select(this.options.rootNode)
      .append('svg')
      .attr('id', this.svgId)
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
  }
  createXScale(data) { // todo: test
    return d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.x; }) - this.options.padding,
        d3.max(data, function (d) { return d.x; }) + this.options.padding
      ])
      .range([0, this.options.width]);
  }
  createYScale(data) { // todo: test
    return d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.y; }) - this.options.padding,
        d3.max(data, function (d) { return d.y; }) + this.options.padding
      ])
      .range([0, this.options.height]);
  }
  drawCircles() { // todo: test
    this.svg.selectAll('circle')
      .data(this.data)
      .enter().append('circle')
      .style('stroke', function (d) { return d.stroke; })
      .style('fill', function (d) { return d.fill; })
      .attr('r', function (d) { return d.radius; })
      .attr('cx', function (d) { return d.cx; })
      .attr('cy', function (d) { return d.cy; });
  }
  draw() {
    this.drawCircles();
  }
}
