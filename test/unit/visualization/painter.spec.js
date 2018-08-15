/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Painter from '../../../src/visualization/painter';
import * as d3 from 'd3';

chai.use(chaiDom);
chai.use(sinonChai);
const expect = chai.expect;

describe('Painter', () => {
  afterEach(() => {
    const svgs = Array.from(document.querySelectorAll('body > svg'));
    svgs.forEach(svg => {
      svg.remove();
    });
  });
  describe('drawCircles', () => {
    it('should draw circles correctly on svg', () => {
      // given
      const svg = d3.select('body')
        .append('svg')
        .attr('width', 500)
        .attr('height', 130);
      const givenCircles = [
        {radius: '2', cx: '100', cy: '100', stroke: 'red', fill: 'blue', cssClass: 'circle'},
        {radius: '3', cx: '30', cy: '10', stroke: 'purple', fill: 'blue', cssClass: ''},
        {radius: '9', cx: '5', cy: '120', stroke: 'yellow', fill: 'green', cssClass: 'remove'},
        {radius: '3', cx: '423', cy: '9', stroke: 'purple', fill: 'blue', cssClass: ''},
        {radius: '4', cx: '3', cy: '1', stroke: 'black', fill: 'magenta', cssClass: 'circle'},
      ];
      // when
      Painter.drawCircles(svg, givenCircles);
      // then
      const circles = Array.from(document.querySelectorAll('circle'));
      circles.forEach((circle, idx) => {
        expect(circle).to.have.attr('r', givenCircles[idx].radius);
        expect(circle).to.have.attr('cx', givenCircles[idx].cx);
        expect(circle).to.have.attr('cy', givenCircles[idx].cy);
        expect(circle).to.have.attr('class', givenCircles[idx].cssClass);
        expect(circle).to.have.style('stroke', givenCircles[idx].stroke);
        expect(circle).to.have.style('fill', givenCircles[idx].fill);
      });
    });
  });
  describe('drawLines', () => {
    it('should draw lines correctly on svg', () => {
      // given
      const svg = d3.select('body')
        .append('svg')
        .attr('width', 500)
        .attr('height', 130);
      const givenLines = [
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'},
        {x1: '6', y1: '42', x2: '153', y2: '47', stroke: 'black', strokeWidth: '4', cssClass: ''},
        {x1: '9', y1: '4', x2: '9', y2: '8', stroke: 'green', strokeWidth: '1', cssClass: '33'},
        {x1: '13', y1: '48', x2: '90', y2: '5', stroke: 'red', strokeWidth: '3', cssClass: 'no-line'}
      ];
      // when
      Painter.drawLines(svg, givenLines);
      // then
      const lines = Array.from(document.querySelectorAll('line'));
      lines.forEach((line, idx) => {
        expect(line).to.have.attr('x1', givenLines[idx].x1);
        expect(line).to.have.attr('y1', givenLines[idx].y1);
        expect(line).to.have.attr('x2', givenLines[idx].x2);
        expect(line).to.have.attr('y2', givenLines[idx].y2);
        expect(line).to.have.attr('class', givenLines[idx].cssClass);
        expect(line).to.have.style('stroke', givenLines[idx].stroke);
      });
    });
  });
});