import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions, defaultTypes } from './defaults';

export default class Visualization {
  constructor(data, options, types) {
    this.options = Object.assign({}, defaultOptions, options);
    this.types = Object.assign({}, defaultTypes, types);
    this.xScale = this.createXScale(
      d3.min(data, function (d) { return d.x; }),
      d3.max(data, function (d) { return d.x; })
    );
    this.yScale = this.createYScale(
      d3.min(data, function (d) { return d.y; }),
      d3.max(data, function (d) { return d.y; })
    );
    this.data = this.initData(data);
    this.svgId = 'd3ml-' + Date.now();
    this.svg = this.appendSVG();

    // this.addEventListeners();
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
  initData(data) {
    return {
      circles: data.map(d => this.mapDataToCircle(d))
    };
  }
  mapDataToCircle(data) {
    const type = data.type ? data.type : defaultTypes.None;

    return new Circle(
      data.x,
      data.y,
      this.options.circleRadius,
      this.options.circleFill,
      this.options.circleStroke,
      type);
  }
  addEventListeners() {
    this.onClickSvg([this.addCircle]);
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
    this.data.circles.push(circle);
  }
  appendSVG() { // todo: test
    return d3.select(this.options.rootNode)
      .append('svg')
      .attr('id', this.svgId)
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
  }
  createXScale(minX, maxX) { // todo: test
    return d3.scaleLinear()
      .domain([minX - this.options.padding, maxX + this.options.padding])
      .range([0, this.options.width]);
  }
  createYScale(minY, maxY) { // todo: test
    return d3.scaleLinear()
      .domain([minY - this.options.padding, maxY + this.options.padding])
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
