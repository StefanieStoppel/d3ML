/* global describe, it, before */

import chai from 'chai';
import Circle from '../src/visualization/circle'
import { defaultType } from '../src/visualization/defaults'

chai.expect();

const expect = chai.expect;


describe('Circle', () => {
  describe('constructor', () => {
    it('should construct circle with correct values', function() {
      // given
      const params = {
        cx: 4,
        cy: 203,
        radius: 15,
        fill: 'black',
        stroke: '#1fed2e',
        type: 'A'
      };
      // when
      const circle = new Circle(params.cx, params.cy, params.radius, params.fill, params.stroke, params.type);
      // then
      expect(circle.cx).to.equal(params.cx);
      expect(circle.cy).to.equal(params.cy);
      expect(circle.radius).to.equal(params.radius);
      expect(circle.fill).to.equal(params.fill);
      expect(circle.stroke).to.equal(params.stroke);
      expect(circle.type).to.equal(params.type);
    });
    it('should construct circle with default values', function() {
      // when
      const circle = new Circle(null, null, null, null, null);
      // then
      expect(circle.type).to.equal(defaultType);
    });
  });
});