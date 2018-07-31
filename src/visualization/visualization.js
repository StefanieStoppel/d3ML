import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions, defaultType } from './defaults';

export default class Visualization {
  constructor(data, options, types = [defaultType]) {
    this.options = Object.assign({}, defaultOptions, options);
    this.xScale = this.createXScale(data);
    this.yScale = this.createYScale(data);
    if (this.isValidTypes(types)) {
      this.types = types;
    } else {
      this.types = [defaultType];
    }
    this.typeColorMap = this.mapTypesToColors(this.types);
    if (this.isValidData(data)) {
      this.data = data.map(d => this.mapDataToCircle(d));
    }
    this.clickable = true;

    this.createVisualization();
  }
  createVisualization() {
    this.containerId = 'd3ml-' + Date.now();
    this.appendWrapperContainer();
    this.appendSVG();
  }
  appendWrapperContainer() {
    const container = this.createElement('div', [['class', 'd3ml'], ['id', this.containerId]]);
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
  isValidData(data) {
    let result = false;
    if (!!data && Array.isArray(data)) {
      result = data.reduce((res, val) => {
        return Object.entries(val).reduce((result, entry) => {
          const key = entry[0];
          const val = entry[1];
          let res = false;
          if (this.isValidCoordinate(key, val) || this.isValidType(key, val)) {
            res = result && true;
          } else {
            if (!this.isValidType(key, val)) {
              const msg = `Invalid data specified: ${key} with value ${val}. ` +
                'Accepted data keys are x and y. Values must be numeric.';
              throw Error(msg);
            } else if (!this.isValidCoordinate(key, val)) {
              throw Error(`Invalid type specified: ${key}: ${val}`);
            }
          }

          return res;
        }, true);
      }, true);
    }

    return result;
  }
  isValidCoordinate(key, val) {
    return ['x', 'y'].includes(key) &&
      typeof val === 'number' &&
      val !== Infinity &&
      val !== -Infinity;
  }
  isValidType(key, val) {
    return key === 'type' && this.types.includes(val);
  }
  isValidTypes(types) {
    let result = false;
    if (!!types && Array.isArray(types) && types.length > 0) {
      result = types.reduce((res, type) => {
        return res && !!type;
      }, true);
    }

    return result;
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
  setClickable(clickable) {
    this.clickable = clickable;
  }
  createElement(elementName, attributes = []) {
    const el = document.createElement(elementName);
    attributes.forEach(attr => {
      el.setAttribute(attr[0], attr[1]);
    });

    return el;
  }
  createSettingsGroup(childElements) {
    const settingsGroup = this.createElement('div', [['class', 'd3ml__settings__group']]);
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
      .attr('cy', function (d) { return d.cy; })
      .attr('class', function (d) { return d.cssClass ? d.cssClass : ''; });
  }
  draw() {
    this.drawCircles();
  }
}
