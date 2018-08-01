import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions, defaultType, defaultClassSelectors } from './defaults';
import { isValidOptions, isValidTypes, isValidData } from './validator';

export default class Visualization {
  constructor(data, options, types = [defaultType]) {
    this.initializeOptions(options);
    this.initializeTypes(types);
    this.initializeTypeColorMap(this.types);
    this.initializeScales(data, options);
    this.initializeData(data, types);

    this.createVisualization();
    this.clickable = true;
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

    this.yScale =  d3.scaleLinear()
      .domain([
        d3.min(data, function (d) { return d.y; }) - options.padding,
        d3.max(data, function (d) { return d.y; }) + options.padding
      ])
      .range([0, options.height]);
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
    const container = this.createElement('div', [['class', defaultClassSelectors.d3ml], ['id', this.containerId]]);
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
      this.inputChangeCallback(e, inputId, inputType, callbacks);
    });
  }
  inputChangeCallback(e, inputId, type, callbacks) {
    if (e.target) {
      const value = type === 'checkbox' ? e.target.checked : e.target.value;
      callbacks.forEach(callback => {
        callback.call(this, value);
      });
    }
  }
  createElement(elementName, attributes = []) {
    const el = document.createElement(elementName);
    attributes.forEach(attr => {
      el.setAttribute(attr[0], attr[1]);
    });

    return el;
  }
  createSettingsGroup(childElements) {
    const settingsGroup = this.createElement('div', [['class', defaultClassSelectors.settingsGroup]]);
    childElements.forEach(child => {
      settingsGroup.append(child);
    });

    return settingsGroup;
  }
  createLabeledInput(labelText, labelAttributes, displayedValue, inputAttributes) {
    const span = this.createElement('span');
    span.innerHTML = displayedValue;

    const inputLabel = this.createElement('label', labelAttributes);
    inputLabel.textContent = labelText;

    const input = this.createElement('input', inputAttributes);
    inputLabel.appendChild(span);

    return {label: inputLabel, input};
  }
  addCircle(circle) {
    this.data.push(circle);
  }
  drawCircles() {
    this.svg.selectAll('circle')
      .data(this.data)
      .enter().append('circle')
      .style('stroke', function (d) { return d.stroke; })
      .style('fill', function (d) { return d.fill; })
      .attr('r', function (d) { return d.radius; })
      .attr('cx', function (d) { return d.cx; })
      .attr('cy', function (d) { return d.cy; })
      .attr('class', function (d) { return d.cssClass ? d.cssClass : ''; });
  }
  draw() {
    this.drawCircles();
  }
}
