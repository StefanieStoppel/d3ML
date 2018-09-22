/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Visualization from '../../../src/visualization/visualization';
import Circle from '../../../src/visualization/circle';
import {defaultType, defaultOptions, defaultClassSelectors} from '../../../src/visualization/defaults';
import { scaleOrdinal, schemeSet1 } from 'd3';
import {createEvent} from '../../test-helper';
import Painter from '../../../src/visualization/painter';
import HTMLElementCreator from "../../../src/visualization/html-element-creator";

chai.use(chaiDom);
chai.use(sinonChai);
const expect = chai.expect;

describe('Visualization', () => {
  let data = null;
  let options = null;

  beforeEach(() => {
    data = [
      { x: 25, y: 36 },
      { x: 56, y: 73 },
      { x: 65, y: 135 },
      { x: 75, y: 103 },
      { x: 173, y: 64 },
      { x: 44, y: 122 },
      { x: 47, y: 38 },
      { x: 346, y: 10 },
      { x: 346, y: 410 }
    ];
    options = {
      rootNode: 'body',
      width: 400,
      height: 300,
      padding: 20,
      backgroundColor: 'white',
      circleRadius: 42,
      circleFill: 'black',
      circleStroke: '#14dfe2'
    };
  });
  afterEach(() => {
    const divs = Array.from(document.querySelectorAll('body > div'));
    divs.forEach(div => {
      div.remove();
    });
  });
  describe('constructor', () => {
    it('should initialize correctly', () => {
      // given
      const options = {
        rootNode: 'body',
        width: 100,
        height: 30,
        padding: 10,
        backgroundColor: 'blue',
        circleRadius: 25,
        circleFill: 'orange',
        circleStroke: '#e236c4'
      };
      // when
      const vis = new Visualization(data, options);
      // then
      expect(vis.options.rootNode).to.equal(options.rootNode);
      expect(vis.options.width).to.equal(options.width);
      expect(vis.options.height).to.equal(options.height);
      expect(vis.options.padding).to.equal(options.padding);
      expect(vis.options.backgroundColor).to.equal(options.backgroundColor);
      expect(vis.options.circleRadius).to.equal(options.circleRadius);
      expect(vis.options.circleFill).to.equal(options.circleFill);
      expect(vis.options.circleStroke).to.equal(options.circleStroke);
      expect(vis.clickable).to.equal(true);
    });
    const incorrectTypes = [
      {},
      null,
      [],
      undefined,
      'A',
      42
    ];
    incorrectTypes.forEach(type => {
      it(`should initialize typeColorMap correctly for invalid types: ${type}`, () => {
        // given
        // when
        const vis = new Visualization(data, options, type);
        // then
        expect(vis.typeColorMap).to.deep.equal(vis.mapTypesToColors([defaultType]));
      });
    });
  });
  describe('initializeOptions', () => {
    const negativeTestCases = [
      { options: undefined },
      { options: [] },
      { options: null },
      { options: 5 },
      { options: '' },
      { options: 'bla' },
      { options: {a: 2, b: 'foo'} },
      { options: {circleRadius: 2, y: 'baz'} }
    ];
    negativeTestCases.forEach(testCase => {
      it(`should initialize using defaultOptions when passed invalid options: ${testCase.options}`, () => {
        // given
        const vis = new Visualization(data, options);
        // when
        vis.initializeOptions(testCase.options);
        // then
        expect(vis.options).to.deep.equal(defaultOptions);
      });
    });
    const positiveTestCases = [
      { options: {circleRadius: 2, circleFill: 'blue'} },
      { options: {circleStroke: 'red', width: 400} },
      { options: {height: 1, padding: 100, backgroundColor: '#1hef2e'} },
      { options: {rootNode: '.root', circleFill: 'yellow'} }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should initialize by merging defaultOptions and options when passed valid options: ${testCase.options}`,
        () => {
          // given
          const vis = new Visualization(data, options);
          const expectedOptions = Object.assign({}, defaultOptions, testCase.options);
          // when
          vis.initializeOptions(testCase.options);
          // then
          expect(vis.options).to.deep.equal(expectedOptions);
        });
    });
  });
  describe('initializeTypes', () => {
    const negativeTestCases = [
      { types: undefined },
      { types: [] },
      { types: null },
      { types: [null] },
      { types: 5 },
      { types: '' },
      { types: 'bla' },
      { types: {a: 2, b: 'foo'} },
      { types: {circleRadius: 2, y: 'baz'} }
    ];
    negativeTestCases.forEach(testCase => {
      it(`should initialize types as empty array when passed invalid parameter: ${testCase.types}`, () => {
        // given
        const vis = new Visualization(data, options);
        // when
        vis.initializeTypes(testCase.types);
        // then
        expect(vis.types).to.deep.equal([]);
      });
    });
    const positiveTestCases = [
      { types: ['A', 'B'] },
      { types: [1, 2, 5] },
      { types: [1, '2', 18, '42', 'foo'] }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should initialize types using valid parameter: ${testCase.options}`,
        () => {
          // given
          const vis = new Visualization(data, options);
          // when
          vis.initializeTypes(testCase.types);
          // then
          expect(vis.types).to.deep.equal(testCase.types);
        });
    });
  });
  describe('initializeData', () => {
    const negativeTestCases = [
      { data: undefined, types: [] },
      { data: [], types: [] },
      { data: null, types: [] },
      { data: [null], types: [] },
      { data: 5, types: [] },
      { data: '', types: [] },
      { data: 'bla', types: [] },
      { data: [{x: 2, y: 'foo'}] },
      { data: [{x: 2, y: 3, type: 1}], types: [] },
      { data: [{x: 2, y: 3, type: '1'}], types: [2, 3] }
    ];
    negativeTestCases.forEach(testCase => {
      it(`should initialize data as empty array when passed invalid parameters data: ${testCase.data} and types: ${testCase.types}`, () => { // eslint-disable-line
        // given
        const vis = new Visualization(data, options);
        // when
        vis.initializeData(testCase.data, testCase.types, vis.options);
        // then
        expect(vis.data).to.deep.equal([]);
      });
    });
    const positiveTestCases = [
      { data: [{x: 2, y: 3, type: 42}], types: [42] },
      { data: [{x: 2, y: 3, type: 'A'}], types: ['A', 2, 3] },
      { data: [{x: 2, y: 3}], types: [] }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should initialize data correctly when using valid parameters data: ${testCase.data} and types: ${testCase.types}`, () => { // eslint-disable-line
        // given
        const vis = new Visualization(data, options);
        // when
        vis.initializeData(testCase.data, testCase.types);
        // then
        expect(vis.data).to.deep.equal(testCase.data.map(d => vis.mapDataToCircle(d)));
      });
    });
  });

  describe('mapDataToCircle', () => {
    it('should return correct mapping', () => {
      // given
      const givenOptions = {
        circleRadius: 31,
        circleFill: 'green',
        circleStroke: 'blue'
      };
      const givenData = { x: 13, y: 42, type: 'A' };
      const givenTypes = [givenData.type];
      const vis = new Visualization(data, givenOptions, givenTypes);
      const color = vis.typeColorMap[givenData.type];
      const givenCircle = new Circle(
        vis.xScale(13),
        vis.yScale(42),
        givenOptions.circleRadius,
        color,
        givenOptions.circleStroke,
        givenData.type
      );
      // when
      const circle = vis.mapDataToCircle(givenData, givenOptions);
      // then
      expect(circle).to.deep.equal(givenCircle);
    });
  });
  describe('addCircle', () => {
    it('should add circle correctly', () => {
      // given
      const givenCircle = new Circle(1, 2, options.circleRadius, options.circleFill, options.circleStroke);
      const vis = new Visualization(data, options);
      // when
      vis.addCircle(givenCircle);
      // then
      expect(vis.data.pop()).to.deep.equal(givenCircle);
    });
  });
  describe('clickCallback', () => {
    it('should call passed callback', () => {
      // given
      const vis = new Visualization(data, options);
      const callback = sinon.spy();
      const event = {
        target: {
          id: vis.svgId
        },
        offsetX: 100,
        offsetY: 200
      };
      // when
      vis.clickCallback(event, [callback]);
      // then
      expect(callback).calledOnce;
    });
  });
  describe('inputChangeCallback', () => {
    it('should not execute callback if event target is not set', () => {
      // given
      const event = {
        target: null
      };
      const callbackSpy = sinon.spy();
      const vis = new Visualization(data, options);
      // when
      vis.inputChangeCallback(event, null, [callbackSpy]);
      // then
      expect(callbackSpy).to.not.have.been.called;
    });
    const testCases = [
      {inputType: 'checkbox', event: { target: {checked: true} }},
      {inputType: 'range', event: { target: {value: 5} }},
      {inputType: 'number', event: { target: {value: 42.3} }}
    ];
    testCases.forEach(testCase => {
      it(`should execute callback correctly for input type: ${testCase.inputType}`, () => {
        const callbackSpy = sinon.spy();
        const vis = new Visualization(data, options);
        // when
        vis.inputChangeCallback(testCase.event, testCase.inputType, [callbackSpy]);
        // then
        expect(callbackSpy).to.have.been.calledOnce;
      });
    });
  });
  describe('appendWrapperContainer', () => {
    it('should append div with correct attributes', () => {
      // given
      const vis = new Visualization(data, options);
      // when
      vis.appendWrapperContainer();
      // then
      const container = document.querySelector(`#${vis.containerId}`);
      expect(container).to.not.be.null;
      expect(container).to.have.attr('class', 'd3ml');
    });
  });
  describe('appendSvg', () => {
    it('should append svg with correct attributes', () => {
      // given
      const vis = new Visualization(data, options);
      // when
      vis.appendSVG();
      // then
      const svg = document.querySelector(`#${vis.containerId} svg`);
      expect(svg).to.not.be.null;
      expect(svg).to.have.attr('width', options.width.toString());
      expect(svg).to.have.attr('height', options.height.toString());
      expect(svg).to.have.attr('style', `background-color: ${options.backgroundColor};`);
    });
  });
  describe('draw', () => {
    it('should call Painter.drawCircles inside draw', () => {
      // given
      const drawCirclesSpy = sinon.spy(Painter, 'drawCircles');
      const vis = new Visualization(data, options);
      // when
      vis.draw();
      // then
      expect(drawCirclesSpy).to.have.been.calledOnce;

      Painter.drawCircles.restore();
    });
  });
  describe('initializeScales', () => {
    it('should initialize x and y scales correctly', () => {
      // given
      const givenOptions = Object.assign({}, options, {
        width: 500,
        height: 600,
        padding: 10
      });
      const givenData = [
        { x: 1, y: 3 },
        { x: 2, y: 102 },
        { x: 4, y: 100 }
      ];
      const expectedXDomain = {
        min: givenData[0].x - givenOptions.padding,
        max: givenData[2].x + givenOptions.padding
      };
      const expectedYDomain = {
        min: givenData[0].y - givenOptions.padding,
        max: givenData[1].y + givenOptions.padding
      };
      const expectedXRange = {
        min: 0,
        max: givenOptions.width
      };
      const expectedYRange = {
        min: givenOptions.height,
        max: 0
      };
      const vis = new Visualization(givenData, givenOptions);
      // when
      vis.initializeScales(givenData, vis.options);
      // then
      expect(vis.xScale.domain()[0]).to.equal(expectedXDomain.min);
      expect(vis.xScale.domain()[1]).to.equal(expectedXDomain.max);
      expect(vis.xScale.range()[0]).to.equal(expectedXRange.min);
      expect(vis.xScale.range()[1]).to.equal(expectedXRange.max);
      expect(vis.yScale.domain()[0]).to.equal(expectedYDomain.min);
      expect(vis.yScale.domain()[1]).to.equal(expectedYDomain.max);
      expect(vis.yScale.range()[0]).to.equal(expectedYRange.min);
      expect(vis.yScale.range()[1]).to.equal(expectedYRange.max);
    });
  });
  describe('mapTypeToColor', () => {
    const typeData = [
      ['foo', 'bar', defaultType],
      [ 'A', 'B' ],
      [ defaultType ]
    ];
    typeData.forEach(types => {
      it(`should map types ${types} to colors correctly`, () => {
        const vis = new Visualization(data, options, types);
        const colorScale = scaleOrdinal(schemeSet1);
        // when
        const colorMapping = vis.mapTypesToColors(types);
        // then
        types.forEach(type => {
          expect(colorMapping[type]).to.equal(colorScale(type));
        });
      });
    });
  });
  describe('getFillColor', function () {
    const typeData = [
      { data: { }, types: ['A', 'B'] },
      { data: null, types: ['None'] },
      { data: { type: null }, types: ['Z'] },
      { data: { type: undefined }, types: ['Z'] },
      { data: { type: NaN }, types: ['Z'] },
      { data: { type: 'C' }, types: ['A', 'B'] }
    ];
    typeData.forEach(td => {
      it(`should return default circleFill color for invalid data: ${td}`, () => {
        // given
        const givenOptions = Object.assign({}, options, { circleFill: 'yellow' });
        const vis = new Visualization(data, givenOptions, td.types);
        // when
        const color = vis.getFillColor(td.data);
        // then
        expect(color).to.equal(givenOptions.circleFill);
      });
    });
  });
  describe('onChangeInput', () => {
    it('should call callback correctly', () => {
      // given
      const id = 'foo';
      const type = 'number';
      const numberInput = document.createElement('input');
      numberInput.setAttribute('type', type);
      numberInput.setAttribute('value', 42);
      numberInput.setAttribute('id', id);
      document.body.appendChild(numberInput);

      const callbackSpy = sinon.spy(Visualization.prototype, 'inputChangeCallback');
      const vis = new Visualization(data, options);
      vis.onChangeInput(id, type, [callbackSpy]);
      // when
      const { node, event } = createEvent(document.querySelector(`#${id}`), 'change');
      node.dispatchEvent(event, true);
      // then
      expect(callbackSpy).to.have.been.calledWith(event, type, [callbackSpy]);

      Visualization.prototype.inputChangeCallback.restore();
    });
  });
  ;
});
