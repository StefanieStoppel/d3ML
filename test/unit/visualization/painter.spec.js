/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinonChai from 'sinon-chai';
import Painter from '../../../src/visualization/painter';
import * as d3 from 'd3';
import D3TransitionTestUtils from '../d3-transition-test-helper';

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
        {radius: '4', cx: '3', cy: '1', stroke: 'black', fill: 'magenta', cssClass: 'circle'}
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
  describe('transitionLine', () => {
    beforeEach(() => {
      D3TransitionTestUtils.stubAndForceTransitions();
    });
    afterEach(() => {
      D3TransitionTestUtils.restoreTransitions();
    });
    it('should transition line correctly to new coordinates', () => {
      // given
      const svg = d3.select('body')
        .append('svg')
        .attr('width', 500)
        .attr('height', 130);
      const givenLines = [
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'}
      ];
      Painter.drawLines(svg, givenLines);
      const transitionedLine = {x1: '13', y1: '-4', x2: '53', y2: '7'};
      // when
      Painter.transitionLine(svg, transitionedLine, 200);
      // then
      const line = document.querySelector('line');
      expect(line).to.have.attr('x1', transitionedLine.x1);
      expect(line).to.have.attr('y1', transitionedLine.y1);
      expect(line).to.have.attr('x2', transitionedLine.x2);
      expect(line).to.have.attr('y2', transitionedLine.y2);
    });
  });
  describe('transitionLine', () => {
    beforeEach(() => {
      D3TransitionTestUtils.stubAndForceTransitions();
    });
    afterEach(() => {
      D3TransitionTestUtils.restoreTransitions();
    });
    it('should transition lines correctly to new coordinates', () => {
      // given
      const svg = d3.select('body')
        .append('svg')
        .attr('width', 500)
        .attr('height', 130);
      const givenLines = [
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'},
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'},
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'},
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'},
        {x1: '2', y1: '100', x2: '123', y2: '42', stroke: 'red', strokeWidth: '3', cssClass: 'line'}
      ];
      const transitionedLines = [
        {x1: '1', y1: '2', x2: '3', y2: '4'},
        {x1: '5', y1: '6', x2: '7', y2: '8'},
        {x1: '10', y1: '11', x2: '12', y2: '13'},
        {x1: '14', y1: '15', x2: '16', y2: '17'},
        {x1: '18', y1: '19', x2: '20', y2: '21'}
      ];
      Painter.drawLines(svg, givenLines);
      // when
      Painter.transitionLines(svg, transitionedLines, 200);
      // then
      const lines = Array.from(document.querySelectorAll('line'));
      lines.forEach((line, idx) => {
        expect(line).to.have.attr('x1', transitionedLines[idx].x1);
        expect(line).to.have.attr('y1', transitionedLines[idx].y1);
        expect(line).to.have.attr('x2', transitionedLines[idx].x2);
        expect(line).to.have.attr('y2', transitionedLines[idx].y2);
      });
    });
  });
});
