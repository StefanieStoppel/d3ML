/* global describe, it */

import chai from 'chai';
import chaiDom from 'chai-dom';
import sinonChai from 'sinon-chai';
import { defaultClassSelectors } from '../../../src/visualization/defaults';
import HTMLElementCreator from '../../../src/visualization/html-element-creator';
import Visualization from "../../../src/visualization/visualization";

chai.use(chaiDom);
chai.use(sinonChai);
const expect = chai.expect;

describe('HTMLElementCreator', () => {
  describe('createElement', () => {
    it('should return HTMLElement with correct type and attributes', () => {
      // given
      const type = 'input';
      const attributes = [['class', 'test'], ['name', 'height'], ['type', 'number']];
      // when
      const labeledInput = HTMLElementCreator.createElement(type, attributes);
      // then
      expect(labeledInput).to.match(type);
      attributes.forEach(([attrName, attrValue]) => {
        expect(labeledInput, attrName).to.have.attr(attrName, attrValue);
      });
    });
    const testCases = [
      {childElements: [], childElementsText: '[]'},
      {childElements: null, childElementsText: 'null'},
      {childElements: undefined, childElementsText: 'undefined'}
    ];
    testCases.forEach(({testAttributes, testAttributesText}) => {
      it(`should return HTMLElement with correct type and no attributes when 
        attributes is ${testAttributesText}`, () => {
        // given
        const type = 'input'; // bla
        // when
        const labeledInput = HTMLElementCreator.createElement(type, testAttributes);
        // then
        expect(labeledInput).to.match(type);
      });
    });
  });
  describe('createSettingsGroup', () => {
    it('should return div with correct CSS class', () => {
      // given
      const expectedClass = defaultClassSelectors.settingsGroup;
      // when
      const settingsGroup = HTMLElementCreator.createSettingsGroup();
      // then
      expect(settingsGroup).to.match('div');
      expect(settingsGroup).to.have.attr('class', expectedClass);
    });
    const testCases = [
      {childElements: [], childElementsText: '[]'},
      {childElements: null, childElementsText: 'null'},
      {childElements: undefined, childElementsText: 'undefined'}
    ];
    testCases.forEach(({childElements, childElementsText}) => {
      it(`should return div with no childElements: ${childElementsText}`, () => {
        // given
        // when
        const settingsGroup = HTMLElementCreator.createSettingsGroup(childElements);
        // then
        expect(settingsGroup).to.match('div');
      });
    });
    it('should return div with correct childElements', () => {
      // given
      const expectedChildElements = [
        {selector: 'input', attributes: [['class', 'some-class'], ['type', 'email']]},
        {selector: 'span', attributes: [['id', 'some-id'], ['title', 'this is a title']]},
        {selector: 'svg', attributes: [['width', '500'], ['height', '300']]}
      ];
      const childElements = expectedChildElements.map(({selector, attributes}) => {
        return HTMLElementCreator.createElement(selector, attributes);
      });
      // when
      const settingsGroup = HTMLElementCreator.createSettingsGroup(childElements);
      // then
      expect(settingsGroup).to.match('div');
      expectedChildElements.forEach(({selector, attributes}) => {
        expect(settingsGroup).to.contain(selector);
        attributes.forEach(([attrName, attrValue]) => {
          expect(settingsGroup.querySelector(selector)).to.have.attr(attrName, attrValue);
        });
      });
    });
  });
  describe('createLabeledInput', () => {
    it('should return div containing label and input with correct attributes', () => {
      // given
      const labelText = 'ab';
      const labelAttributes = [];
      const attr = [];
      // when
      const labeledInput = HTMLElementCreator.createLabeledInput(labelText, labelAttributes, attr);
      // then
      expect(labeledInput).to.match('div');
      expect(labeledInput).to.contain('label');
      expect(labeledInput.querySelector('label')).to.have.text(labelText);
      expect(labeledInput).to.contain('input');
    });
  });
  describe('createLabeledValue', () => {
    it('should return span with correct label and value text', () => {
      // given
      const expectedLabel = 'blup';
      const expectedValue = '6';
      // when
      const labeledValueWrapper = HTMLElementCreator.createLabeledValue(expectedLabel, expectedValue);
      // then
      expect(labeledValueWrapper).to.match('div');
      expect(labeledValueWrapper).to.have.length(2);

      const label = labeledValueWrapper.querySelector('.label');
      const value = labeledValueWrapper.querySelector('.value');
      expect(label).to.have.text(`${expectedLabel}: `);
      expect(label).to.have.class('label');
      expect(value).to.have.text(`${expectedValue}`);
      expect(value).to.have.class('value');
    });
  });
  describe('createSettings', () => {
    it('should create settings div without child elements', () => {
      // given
      // when
      const settings = HTMLElementCreator.createSettings();
      // then
      expect(settings).to.have.attr('class', defaultClassSelectors.settings);
      expect(settings).to.have.length(0);
    });
    it('should create settings div with correct child elements', () => {
      // given
      const childSpan = HTMLElementCreator.createElement('span', [['class', 'child-span']]);
      const label = 'my label';
      const value = '12';
      const childLabeledValue = HTMLElementCreator.createLabeledValue(label, value);
      const childSettings = [childSpan, childLabeledValue];
      // when
      const settings = HTMLElementCreator.createSettings(childSettings);
      // then
      expect(settings).to.not.equal(null);
      expect(settings).to.have.length(2);
      expect(settings.querySelector('.child-span')).to.not.equal(null);
      expect(settings.querySelector('div .label')).to.have.text(`${label}: `);
      expect(settings.querySelector('div .value')).to.have.text(value);
    });
  })
});
