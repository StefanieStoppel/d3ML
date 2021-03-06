/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Visualization from '../../src/visualization/visualization';
import Circle from '../../src/visualization/circle';
import { defaultType } from '../../src/visualization/defaults';
import { scaleOrdinal, schemeSet1 } from 'd3';

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
    const svgs = Array.from(document.querySelectorAll('svg'));
    svgs.forEach(svg => {
      svg.remove();
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
  describe('isValidData', () => {
    it('should pass validation', () => {
      // given
      const givenData = [
        { x: 13, y: 42 },
        { x: 145, y: 144645867 },
        { x: Math.PI, y: 53.24 }
      ];
      const vis = new Visualization([]);
      // when
      const validation = vis.isValidData(givenData);
      // then
      expect(validation).to.be.true;
    });
    const failingTests = [
      { data: [{ a: 13, b: 42 }], expected: { key: 'a', val: 13 } },
      { data: [{ x: 145, foo: 144645867 }], expected: { key: 'foo', val: 144645867 } },
      { data: [{ z: Math.PI, y: 53.24 }], expected: { key: 'z', val: Math.PI } },
      { data: [{ x: 'hello', y: 53.24 }], expected: { key: 'x', val: 'hello' } },
      { data: [{ x: 2, y: Infinity }], expected: { key: 'y', val: Infinity } },
      { data: [{ x: 42, y: {} }], expected: { key: 'y', val: {} } },
      { data: [{ x: 1, y: null }], expected: { key: 'y', val: null } },
      { data: [{ x: 1, y: '12' }], expected: { key: 'y', val: '12' } }
    ];
    failingTests.forEach(test => {
      it(`should fail validation for data: ${Object.entries(test.data[0])}`, () => {
        // when
        const vis = new Visualization([]);
        // then
        expect(vis.isValidData.bind(vis, test.data))
          .to.throw(`Invalid data specified: ${test.expected.key} with value ${test.expected.val}.` +
          ' Accepted data keys are x and y. Values must be numeric.');
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
  describe('isValidEventTarget', () => {
    const failingTests = [
      { event: { target: undefined, offsetX: 100, offsetY: 200 }},
      { event: { target: null, offsetX: 100, offsetY: 200 }},
      { event: { offsetX: 100, offsetY: 200 }},
      { event: { target: {}, offsetX: 100, offsetY: 200 }},
      { event: { target: { id: null }, offsetX: 100, offsetY: 200 }},
      { event: { target: { id: 'd3ml-123456' }, offsetX: 100, offsetY: 200 }}
    ];
    failingTests.forEach(test => {
      it(`should return false when event has invalid target: 
      ${test.event.target ? Object.entries(test.event.target) : test.event.target}`, () => {
        // given
        const vis = new Visualization([], options);
        // when
        const result = vis.isValidEventTarget(test.event.target, vis.svgId);
        // then
        expect(result).to.be.false;
      });
    });
    it('should return true when event has valid target', () => {
      // given
      const vis = new Visualization([], options);
      const event = {
        target: {
          id: vis.svgId
        }
      };
      // when
      const result = vis.isValidEventTarget(event);
      // then
      expect(result).to.be.true;
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
      vis.clickCallback(event, vis.svgId, [callback]);
      // then
      expect(callback).calledOnce;
    });
  });
  describe('appendSvg', () => {
    it('should append svg with correct attributes', () => {
      // given
      const vis = new Visualization(data, options);
      // when
      vis.appendSVG();
      // then
      const body = document.body;
      expect(body).to.contain(`svg#${vis.svgId}`);
      const svg = document.querySelector(`#${vis.svgId}`);
      expect(svg).to.have.attr('width', options.width.toString());
      expect(svg).to.have.attr('height', options.height.toString());
      expect(svg).to.have.attr('style', `background-color: ${options.backgroundColor};`);
    });
  });
  describe('drawCircles', () => {
    it('should draw circles with correct attributes', () => {
      // given
      const givenData = [
        { x: 1, y: 3 },
        { x: 2, y: 4 },
        { x: 4, y: 6 }
      ];
      const vis = new Visualization(givenData, options);
      // when
      vis.drawCircles();
      // then
      const circles = Array.from(document.querySelectorAll('circle'));
      circles.forEach((circle, idx) => {
        expect(circle).to.have.attr('r', options.circleRadius.toString());
        expect(circle).to.have.attr('cx', vis.xScale(givenData[idx].x).toString());
        expect(circle).to.have.attr('cy', vis.yScale(givenData[idx].y).toString());
        expect(circle).to.have.attr('style', `stroke: ${options.circleStroke}; fill: ${options.circleFill};`);
      });
    });
  });
  describe('createXScale', () => {
    it('should create xScale correctly', () => {
      // given
      const givenOptions = Object.assign({}, options, {
        width: 500,
        height: 600,
        padding: 10
      });
      const givenData = [
        { x: 1, y: 3 },
        { x: 2, y: 4 },
        { x: 4, y: 100 }
      ];
      const expectedXDomain = {
        min: givenData[0].x - givenOptions.padding,
        max: givenData[2].x + givenOptions.padding
      };
      const expectedXRange = {
        min: 0,
        max: givenOptions.width
      };
      const vis = new Visualization(givenData, givenOptions);
      // when
      const xScale = vis.createXScale(givenData);
      // then
      expect(xScale.domain()[0]).to.equal(expectedXDomain.min);
      expect(xScale.domain()[1]).to.equal(expectedXDomain.max);
      expect(xScale.range()[0]).to.equal(expectedXRange.min);
      expect(xScale.range()[1]).to.equal(expectedXRange.max);
    });
  });
  describe('createYScale', () => {
    it('should create yScale correctly', () => {
      // given
      const givenOptions = Object.assign({}, options, {
        width: 500,
        height: 600,
        padding: 10
      });
      const givenData = [
        { x: 1, y: 7 },
        { x: 2, y: 4 },
        { x: 4, y: 100 }
      ];
      const expectedYDomain = {
        min: givenData[1].y - givenOptions.padding,
        max: givenData[2].y + givenOptions.padding
      };
      const expectedYRange = {
        min: 0,
        max: givenOptions.height
      };
      const vis = new Visualization(givenData, givenOptions);
      // when
      const yScale = vis.createYScale(givenData);
      // then
      expect(yScale.domain()[0]).to.equal(expectedYDomain.min);
      expect(yScale.domain()[1]).to.equal(expectedYDomain.max);
      expect(yScale.range()[0]).to.equal(expectedYRange.min);
      expect(yScale.range()[1]).to.equal(expectedYRange.max);
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
  describe('isValidTypes', () => {
    const typeDataValid = [
      [ 'foo', 'bar', defaultType ],
      [ 'A', 'B' ],
      [ defaultType ],
      [ 'Z' ]
    ];
    typeDataValid.forEach(types => {
      it(`should return true for validation of ${types}`, () => {
        const vis = new Visualization(data, options, types);
        // given
        // when
        const result = vis.isValidTypes(types);
        // then
        expect(result).to.be.true;
      });
    });
    const typeDataInvalid = [
      {},
      null,
      [],
      undefined,
      'A',
      7
    ];
    typeDataInvalid.forEach(types => {
      it(`should return false for validation of ${types}`, () => {
        // given
        const vis = new Visualization(data, options);
        // when
        const result = vis.isValidTypes(types);
        // then
        expect(result).to.be.false;
      });
    });
  });
  // todo: add tests for settings and settings__group in general

});
