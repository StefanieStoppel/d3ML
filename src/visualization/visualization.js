import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions, defaultType } from './defaults';

export default class Visualization {
  constructor(data, options, types = [defaultType]) {
    this.options = Object.assign({}, defaultOptions, options);
    this.xScale = this.createXScale(data);
    this.yScale = this.createYScale(data);
    if (this.validateTypes(types)) {
      this.typeColorMap = this.mapTypesToColors(types);
    } else {
      this.typeColorMap = this.mapTypesToColors([defaultType]);
    }
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
  validateTypes(types) {
    let result = false;
    if (!!types && Array.isArray(types) && types.length > 0) {
      result = types.reduce((res, type) => {
        return res && !!type;
      }, true);
    }

    return result;
  }
  getFillColor(data) { // todo: test
    return data.type ? this.typeColorMap[data.type] : this.options.circleFill;
  }
  mapDataToCircle(data) {
    const fillColor = this.getFillColor(data);

    return new Circle(
      this.xScale(data.x),
      this.yScale(data.y),
      this.options.circleRadius,
      fillColor,
      this.options.circleStroke,
      data.type);
  }
  onClickSvg(callbacks) {
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
    }
  }
  addCircle(circle) {
    this.data.push(circle);
  }
  appendSVG() {
    return d3.select(this.options.rootNode)
      .append('svg')
      .attr('id', this.svgId)
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
  }
  createXScale(data) {
    return d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.x; }) - this.options.padding,
        d3.max(data, function (d) { return d.x; }) + this.options.padding
      ])
      .range([0, this.options.width]);
  }
  createYScale(data) {
    return d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.y; }) - this.options.padding,
        d3.max(data, function (d) { return d.y; }) + this.options.padding
      ])
      .range([0, this.options.height]);
  }
  drawCircles() {
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
  mapTypesToColors(types) {
    const colorScale = d3.scaleOrdinal(d3.schemeSet1);

    const colorMap = types.reduce((map, type) => {
      map[type] = colorScale(type);

      return map;
    }, {});
    colorMap[defaultType] = colorScale(defaultType);

    return colorMap;
  }
}
