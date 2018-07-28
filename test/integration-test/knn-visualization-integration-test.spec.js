/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import chaiStyle from 'chai-style';
import KNNVisualization from '../../src/visualization/knn-visualization';
import Circle from '../../src/visualization/circle';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {createEvent} from '../test-helper';
import D3TransitionTestUtils from '../d3-transition-test-helper';
import Visualization from '../../src/visualization/visualization';

chai.use(chaiDom);
chai.use(chaiStyle);
chai.use(sinonChai);
const expect = chai.expect;

/**
 * TODOS:
 *
 * UNWEIGHTED
 * - check whether new circle was added at correct coordinates
 * - check whether circle was classified correctly
 * - check whether bounding circle and lines were drawn and then removed
 * - check whether max increased in range slider
 *
 * - simulate checking of weighted checkbox
 *
 * WEIGHTED
 * - simulate a click on the svg, before that check that weighted is true / checked
 * - check whether new circle was added at correct coordinates
 * - check whether circle was classified correctly using weighted algorithm
 * - check whether bounding circle and lines were drawn and then removed
 * - check whether max increased in range slider
 *
 * CHANGE K
 * - simulate a change event on range input, change value to 8
 * - check whether range input value has changed
 * - check whether k has changed
 * - simulate click
 * - check amount of kClosestNeighbors === 8
 * - check circle
 * - check that there was 8 lines
 *
 * CLICK TWICE
 * - simulate a click on the svg, before that check that weighted is true / checked
 * - check clickable false
 * - simulate another click
 * - check that only first circle was added
 **/

describe.only('KNNVisualization Integration Test', () => {
  let data;
  let options;
  let types;
  let vis;

  beforeEach(() => {
    D3TransitionTestUtils.stubAndForceTransitions();
    data = [
      {x: 23, y: 56, type: 1},
      {x: 23, y: 65, type: 1},
      {x: 23, y: 87, type: 2},
      {x: 256, y: 74, type: 2},
      {x: 14, y: 2, type: 1},
      {x: 64, y: 555, type: 1},
      {x: 55, y: 56, type: 2},
      {x: 123, y: 75, type: 1},
      {x: 56, y: 6, type: 2},
      {x: 1, y: 53, type: 1},
      {x: 13, y: 96, type: 2}
    ];
    options = {
      rootNode: 'body',
      width: 800,
      height: 600,
      padding: 10,
      backgroundColor: 'white',
      circleRadius: 4,
      circleFill: 'transparent',
      circleStroke: 'black'
    };
    types = [1, 2];
  });

  afterEach(() => {
    D3TransitionTestUtils.restoreTransitions();
    const svgs = Array.from(document.querySelectorAll('svg'));
    svgs.forEach(svg => {
      svg.remove();
    });
    const settings = Array.from(document.querySelectorAll('.settings'));
    settings.forEach(setting => {
      setting.remove();
    });
  });

  it('should perform and visualize "unweighted" KNN correctly', () => {
    let dataLength = data.length;
    const k = 3;
    vis = new KNNVisualization(data, options, types, k);

    // check whether svg is displayed correctly
    const svg = document.querySelector(`#${vis.svgId}`);
    expectSvgToBeDisplayedCorrectly(svg, options);
    expectInputRangeKToBeDisplayedCorrectly(k, dataLength);

    // draw visualization
    vis.draw();

    // check whether circles are displayed correctly
    expectCirclesToBeDisplayedCorrectly(vis.data, options, vis.typeColorMap);

    // check whether weighted checkbox is not checked
    expectWeightedCheckboxChecked(false);

    // simulate a click on the svg
    const clickCoord = { x: 25, y: 60 };
    simulateSvgClick(svg, clickCoord.x, clickCoord.y);

    // check whether new circle was added to data
    dataLength += 1;
    expect(vis.data.length).to.equal(dataLength);

    const addedCircle = vis.data[dataLength - 1];
    expect(addedCircle.cx).to.equal(clickCoord.x);
    expect(addedCircle.cy).to.equal(clickCoord.y);
    expect(addedCircle.type).to.equal(types[0].toString());

    // check whether added circle is displayed correctly
    const circle = document.querySelector('circle:last-of-type');
    expectCircleToBeDisplayedCorrectly(circle, addedCircle, options, vis.typeColorMap[addedCircle.type]);
  });

  function expectCirclesToBeDisplayedCorrectly(data, options, colorMap) {
    const circles = Array.from(document.querySelectorAll('circle'));
    expect(circles.length).to.not.equal(0);

    data.forEach((data, idx) => {
      expectCircleToBeDisplayedCorrectly(circles[idx], data, options, colorMap[data.type]);
    });
  }

  function expectCircleToBeDisplayedCorrectly(circle, circleData, options, fill) {
    expect(circle).to.have.attr('r', options.circleRadius.toString());
    expect(circle).to.have.attr('cx', circleData.cx.toString());
    expect(circle).to.have.attr('cy', circleData.cy.toString());
    expect(circle).to.have.style('stroke', options.circleStroke);
    expect(circle).to.have.style('fill', fill)
  }

  function expectWeightedCheckboxChecked(checked) {
    const weightedCheckBox = document.querySelector('#weighted');
    expect(weightedCheckBox).to.not.be.null;
    if (checked) {
      expect(weightedCheckBox).to.have.attr('checked', 'true');
    } else {
      expect(weightedCheckBox).to.not.have.attr('checked');
    }
  }

  function expectInputRangeKToBeDisplayedCorrectly(k, dataLength) {
    const inputRangeK = document.querySelector('#range-k');
    expect(inputRangeK).to.have.attr('value', k.toString());
    expect(inputRangeK).to.have.attr('min', '1');
    expect(inputRangeK).to.have.attr('max', dataLength.toString());

    const labelSpan = document.querySelector('#range-k-label span');
    expect(labelSpan).to.have.text(k.toString());
  }

  function expectSvgToBeDisplayedCorrectly(svg, options) {
    expect(svg).to.not.be.null;
    expect(svg).to.have.attr('width', options.width.toString());
    expect(svg).to.have.attr('height', options.height.toString());
    expect(svg).to.have.style('background-color', options.backgroundColor);
  }

  function simulateSvgClick(svg, x, y) {
    // const spy = sinon.spy(KNNVisualization.prototype, 'svgClickCallback');
    const { node, event } = createEvent(svg, 'click');
    event.offsetX = x;
    event.offsetY = y;
    node.dispatchEvent(event, true);
    // expect(spy).calledOnce;
  }
});