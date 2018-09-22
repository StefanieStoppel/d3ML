import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions, defaultType, defaultClassSelectors } from './defaults';
import { isValidOptions, isValidTypes, isValidData } from '../validation/validator';
import Painter from './painter';
import HTMLElementCreator from './html-element-creator';

export default class Visualization {
  constructor(data, options, types = [defaultType]) {
    this.initializeOptions(options);
    this.initializeTypes(types);
    this.initializeTypeColorMap(this.types);
    this.initializeScales(data, this.options);
    this.initializeData(data, types);

    this.createVisualization();
    this.clickable = true;
  }
  appendSettings(childElements = []) {
    const settings = HTMLElementCreator.createSettings(childElements);
    document.querySelector(`#${this.containerId}`).appendChild(settings);
  }
  initializeOptions(options) {
    if (!isValidOptions(options)) {
      options = {};
    }
    this.options = Object.assign({}, defaultOptions, options);
  }
  initializeTypes(types) {
    if (!isValidTypes(types)) {
      types = [];
    }
    this.types = types;
  }
  initializeTypeColorMap(types) {
    this.typeColorMap = this.mapTypesToColors(types);
  }
  initializeScales(data, options) {
    this.xScale = d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.x; }) - options.padding,
        d3.max(data, function (d) { return d.x; }) + options.padding
      ])
      .range([0, options.width]);

    this.yScale = d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.y; }) - options.padding,
        d3.max(data, function (d) { return d.y; }) + options.padding
      ])
      .range([options.height, 0]);
  }
  initializeData(data, types) {
    if (!isValidData(data, types)) {
      this.data = [];
    } else {
      this.data = data.map(d => this.mapDataToCircle(d));
    }
  }
  createVisualization() {
    this.containerId = defaultClassSelectors.d3ml + Date.now();
    this.appendWrapperContainer();
    this.appendSVG();
  }
  appendWrapperContainer() {
    const container = HTMLElementCreator.createElement(
      'div',
      [['class', defaultClassSelectors.d3ml], ['id', this.containerId]]
    );
    const rootNode = document.querySelector(this.options.rootNode);
    rootNode.appendChild(container);
  }
  appendSVG() {
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
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
  getFillColor(data) {
    return !!data && data.type && this.typeColorMap.hasOwnProperty(data.type) ?
      this.typeColorMap[data.type] : this.options.circleFill;
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
    document.querySelector(`#${this.containerId} svg`).addEventListener('click', (e) => {
      this.clickCallback(e, callbacks);
    });
  }
  clickCallback(e, callbacks) {
    if (!!e.target && this.clickable) {
      const newCircle = this.mapDataToCircle({x: this.xScale.invert(e.offsetX), y: this.yScale.invert(e.offsetY)});
      callbacks.forEach(callback => {
        callback.call(this, newCircle);
      });
    }
  }
  onChangeInput(inputId, inputType, callbacks) {
    document.querySelector(`#${inputId}`).addEventListener('change', (e) => {
      this.inputChangeCallback(e, inputType, callbacks);
    });
  }
  inputChangeCallback(e, inputType, callbacks) {
    if (e.target) {
      const value = inputType === 'checkbox' ? e.target.checked : e.target.value;
      callbacks.forEach(callback => {
        callback.call(this, value);
      });
    }
  }
  addCircle(circle) {
    this.data.push(circle);
  }
  draw() {
    Painter.drawCircles(this.svg, this.data);
  }
}
