/* global describe, it */

import chai from 'chai';
import Validator from '../../../src/visualization/validator';

const expect = chai.expect;

describe('Validator', () => {
  describe('isValidOptions', () => {
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
      it(`should return false for invalid options: ${testCase.options}`, () => {
        // given
        // when
        const result = Validator.isValidOptions(testCase.options);
        // then
        expect(result).to.equal(false);
      });
    });

    const positiveTestCases = [
      { options: {circleRadius: 2} },
      { options: {rootNode: '.foo', circleFill: 'magenta'} },
      { options: {padding: 30, circleStroke: 'yellow'} },
      { options: {height: 30, width: 800} }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should return true for valid options: ${testCase.options}`, () => {
        // given
        // when
        const result = Validator.isValidOptions(testCase.options);
        // then
        expect(result).to.equal(true);
      });
    });
  });
  describe('isValidData', () => {
    const negativeTestCases = [
      { data: undefined },
      { data: null },
      { data: [] },
      { data: {} },
      { data: 'foo' },
      { data: '' },
      { data: 5 },
      { data: {x: 6, y: 7, type: 'Z'} },
      { data: [{a: 6, b: 7, type: 'Z'}] },
      { data: [{x: 'miau', y: 7, type: 'A'}] },
      { data: [{x: 4, y: 7, type: 'A'}], types: ['1', '2'] },
      { data: [{x: 4, y: 7}], types: ['1', '2'] },
      { data: [{x: 4, y: 7, type: 1}], types: [] }
    ];
    negativeTestCases.forEach(testCase => {
      it(`should return false for invalid data: ${testCase.data}`, () => {
        // given
        const types = testCase.types || [];
        // when
        const result = Validator.isValidData(testCase.data, types);
        // then
        expect(result).to.equal(false);
      });
    });
    const positiveTestCases = [
      { data: [{x: 6, y: 7, type: 'bla'}], types: ['bla', 'alb'] },
      { data: [{x: 1, y: 4, type: 'A'}], types: ['A'] },
      {
        data: [
          {x: 4, y: 7, type: 1},
          {x: 2, y: 5, type: 2},
          {x: 1, y: 2, type: 54},
          {x: 17, y: 5, type: 1},
          {x: 31, y: 3, type: 54}
        ],
        types: [1, 2, 54]
      }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should return true for valid data: ${testCase.data}`, () => {
        // given
        const types = testCase.types || [];
        // when
        const result = Validator.isValidData(testCase.data, types);
        // then
        expect(result).to.equal(true);
      });
    });
  });
  describe('isValidTypes', () => {
    const negativeTestCases = [
      { types: undefined },
      { types: null },
      { types: 5 },
      { types: '' },
      { types: 'bla' },
      { types: {} },
      { types: [{A: 'A', B: 'B'}, 'C'] }
    ];
    negativeTestCases.forEach(testCase => {
      it(`should return false for invalid types: ${testCase.types}`, () => {
        // given
        // when
        const result = Validator.isValidTypes(testCase.types);
        // then
        expect(result).to.equal(false);
      });
    });
    const positiveTestCases = [
      { types: [] },
      { types: [1, 2] },
      { types: ['foo', 'bar', 'baz'] },
      { types: [1, '2', 42] }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should return true for valid types: ${testCase.types}`, () => {
        // given
        // when
        const result = Validator.isValidTypes(testCase.types);
        // then
        expect(result).to.equal(true);
      });
    });
  });
  describe('isValidK', () => {
    const negativeTestCases = [
      { k: undefined },
      { k: null },
      { k: '' },
      { k: 'bla' },
      { k: {} },
      { k: [] },
      { k: 0 },
      { k: -5 },
      { k: 42.5 }
    ];
    negativeTestCases.forEach(testCase => {
      it(`should return false for invalid k: ${testCase.k}`, () => {
        // given
        // when
        const result = Validator.isValidK(testCase.k);
        // then
        expect(result).to.equal(false);
      });
    });
    const positiveTestCases = [
      { k: 1 },
      { k: 100 },
      { k: 42 }
    ];
    positiveTestCases.forEach(testCase => {
      it(`should return true for valid k: ${testCase.k}`, () => {
        // given
        // when
        const result = Validator.isValidK(testCase.k);
        // then
        expect(result).to.equal(true);
      });
    });
  });
});
