/* global describe, it, beforeEach, afterEach */

import chai from 'chai';
import chaiDom from 'chai-dom';
import chaiStyle from 'chai-style';
import KNNVisualization from '../../src/visualization/knn-visualization';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {createEvent} from '../test-helper';
import Visualization from '../../src/visualization/visualization';

chai.use(chaiDom);
chai.use(chaiStyle);
chai.use(sinonChai);
const expect = chai.expect;

describe('KNNVisualization Integration Test', () => {

  function expectCircleToHaveCorrectAttributes(addedCircle, x, y, type) {
    expect(addedCircle.cx).to.equal(x);
    expect(addedCircle.cy).to.equal(y);
    expect(addedCircle.type).to.equal(type);
  }

  function expectCircleToBeDisplayedCorrectly(circle, circleData, options, fill) {
    expect(circle).to.have.attr('r', options.circleRadius.toString());
    expect(circle).to.have.attr('cx', circleData.cx.toString());
    expect(circle).to.have.attr('cy', circleData.cy.toString());
    expect(circle).to.have.style('stroke', options.circleStroke);
    expect(circle).to.have.style('fill', fill);
  }

  function expectCirclesToBeDisplayedCorrectly(data, options, colorMap) {
    const circles = Array.from(document.querySelectorAll('circle'));
    expect(circles.length).to.not.equal(0);

    data.forEach((data, idx) => {
      expectCircleToBeDisplayedCorrectly(circles[idx], data, options, colorMap[data.type]);
    });
  }

  function expectBoundingCircleToBeDisplayedCorrectly(boundingCircle, addedCircleData, options, furthestNeighbor) {
    expect(boundingCircle).to.have.attr('r', (furthestNeighbor.distance + options.circleRadius).toString());
    expect(boundingCircle).to.have.attr('cx', addedCircleData.cx.toString());
    expect(boundingCircle).to.have.attr('cy', addedCircleData.cy.toString());
    expect(boundingCircle).to.have.attr('style', 'stroke: white; fill: transparent;');
    expect(boundingCircle).to.have.attr('class', 'remove');
  }

  function expectConnectingLinesToBeDisplayedCorrectly(lines, addedCircle, kClosestNeighbors) {
    expect(lines.length).to.equal(kClosestNeighbors.length);

    lines.forEach((line, idx)=> {
      expect(line).to.have.attr('x1', kClosestNeighbors[idx].cx.toString());
      expect(line).to.have.attr('x2', addedCircle.cx.toString());
      expect(line).to.have.attr('y1', kClosestNeighbors[idx].cy.toString());
      expect(line).to.have.attr('y2', addedCircle.cy.toString());
      expect(line).to.have.attr('stroke-width', '2');
      expect(line).to.have.style('stroke', 'rgba(230,230,230,0.5)');
      expect(line).to.have.attr('class', 'remove');
    });
  }

  function expectWeightedCheckboxChecked(weightedCheckBox, checked) {
    expect(weightedCheckBox).to.not.be.null;
    if (checked) {
      expect(weightedCheckBox.checked).to.equal(true);
    } else {
      expect(weightedCheckBox).to.not.have.attr('checked');
    }
  }

  function expectWeightedCheckboxAndLabelDisplayedCorrectly(weightedCheckBox) {
    expect(weightedCheckBox).to.not.be.null;
    expect(weightedCheckBox).to.have.attr('type', 'checkbox');
  }

  function expectInputRangeKMaxToBeCorrect(inputRangeK, dataLength) {
    expect(inputRangeK).to.have.attr('max', dataLength.toString());
  }

  function expectInputRangeKAndLabelToBeDisplayedCorrectly(inputRangeK, labelSpan, k, dataLength) {
    expect(inputRangeK).to.not.be.null;
    expect(inputRangeK).to.have.attr('type', 'range');
    expect(inputRangeK).to.have.attr('value', k.toString());
    expect(inputRangeK).to.have.attr('min', '1');
    expectInputRangeKMaxToBeCorrect(inputRangeK, dataLength);

    expect(labelSpan).to.not.be.null;
    expect(labelSpan).to.have.text(k.toString());
  }

  function expectSvgToBeDisplayedCorrectly(svg, options) {
    expect(svg).to.not.be.null;
    expect(svg).to.have.attr('width', options.width.toString());
    expect(svg).to.have.attr('height', options.height.toString());
    expect(svg).to.have.style('background-color', options.backgroundColor);
  }

  function simulateSvgClick(svg, x, y) {
    const { node, event } = createEvent(svg, 'click');
    event.offsetX = x;
    event.offsetY = y;
    node.dispatchEvent(event, true);
  }

  function simulateCheckingWeightedCheckbox(vis, weightedCheckbox, checked) {
    weightedCheckbox.checked = checked;
    vis.checkboxWeightedChangeCallback(checked);
  }

  function expectInitialStateToBeDisplayedCorrectly(
    svg, inputRangeK, labelK, weightedCheckBox, options, k, dataLength
  ) {
    expectSvgToBeDisplayedCorrectly(svg, options);
    expectInputRangeKAndLabelToBeDisplayedCorrectly(inputRangeK, labelK, k, dataLength);
    expectWeightedCheckboxAndLabelDisplayedCorrectly(weightedCheckBox, false);
  }

  let data;
  let options;
  let types;
  let vis;

  beforeEach(() => {
    data = [
      {x: 23, y: 56, type: 1},
      {x: 23, y: 65, type: 1},
      {x: 25, y: 87, type: 2},
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
      circleFill: 'white',
      circleStroke: 'black'
    };
    types = [1, 2];
  });

  afterEach(() => {
    const divs = Array.from(document.querySelectorAll('body > div'));
    divs.forEach(div => {
      div.remove();
    });
  });

  describe('Unweighted KNN', () => {
    it('should perform and visualize "unweighted" KNN correctly', () => {
      let dataLength = data.length;
      const k = 3;
      vis = new KNNVisualization(data, options, types, k);

      const svg = document.querySelector(`#${vis.containerId} svg`);
      const inputRangeK = document.querySelector('#range-k');
      const labelSpan = document.querySelector('#range-k-label span');
      const weightedCheckBox = document.querySelector('#weighted');

      expectInitialStateToBeDisplayedCorrectly(
        svg, inputRangeK, labelSpan, weightedCheckBox, options, k, dataLength
      );

      // draw visualization
      vis.draw();

      // check whether circles are displayed correctly
      expectCirclesToBeDisplayedCorrectly(vis.data, options, vis.typeColorMap);

      // check whether weighted checkbox is not checked
      expectWeightedCheckboxChecked(weightedCheckBox, false);

      // simulate a click on the svg
      const clickCoord = { x: 25, y: 60 };
      simulateSvgClick(svg, clickCoord.x, clickCoord.y);

      // check whether new circle was added to data
      dataLength += 1;
      expect(vis.data.length).to.equal(dataLength);

      const addedCircle = vis.data[dataLength - 1];
      expectCircleToHaveCorrectAttributes(addedCircle, clickCoord.x, clickCoord.y, types[0].toString());

      // check whether added circle is displayed correctly
      const circle = document.querySelector('circle:nth-last-of-type(2)');
      // There is a transition on the new circle which changes the color after 1500 ms.
      // However at this point it did not take place yet, so the circle has the default color specified in options.
      expectCircleToBeDisplayedCorrectly(circle, addedCircle, options, options.circleFill);

      // check whether bounding circle is displayed correctly
      const boundingCircle = document.querySelector('circle:last-of-type');
      expectBoundingCircleToBeDisplayedCorrectly(
        boundingCircle, addedCircle, options, vis.knn.kClosestNeighbors[k - 1]);

      // check whether connecting lines are displayed correctly
      const lines = Array.from(document.querySelectorAll('line'));
      expectConnectingLinesToBeDisplayedCorrectly(lines, addedCircle, vis.knn.kClosestNeighbors);

      expectInputRangeKMaxToBeCorrect(inputRangeK, dataLength);
    });
  });

  describe('Weighted KNN', () => {
    it('should perform and visualize "weighted" KNN correctly', () => {
      let dataLength = data.length;
      const k = 2;
      vis = new KNNVisualization(data, options, types, k);

      const svg = document.querySelector(`#${vis.containerId} svg`);
      const inputRangeK = document.querySelector('#range-k');
      const labelSpan = document.querySelector('#range-k-label span');
      const weightedCheckBox = document.querySelector('#weighted');

      expectInitialStateToBeDisplayedCorrectly(
        svg, inputRangeK, labelSpan, weightedCheckBox, options, k, dataLength
      );

      // draw visualization
      vis.draw();

      // check whether circles are displayed correctly
      expectCirclesToBeDisplayedCorrectly(vis.data, options, vis.typeColorMap);

      // check whether weighted checkbox is not checked
      expectWeightedCheckboxChecked(weightedCheckBox, false);

      // simulate checking weighted checkbox
      simulateCheckingWeightedCheckbox(vis, weightedCheckBox, true);

      // check whether weighted checkbox is now checked and weighted flag set to true
      expectWeightedCheckboxChecked(weightedCheckBox, true);
      expect(vis.knn.weighted).to.be.true;

      // simulate a click on the svg
      const clickCoord = { x: vis.xScale(data[2].x + 1), y: vis.yScale(data[2].y + 1) };
      simulateSvgClick(svg, clickCoord.x, clickCoord.y);

      // check whether new circle was added to data
      dataLength += 1;
      expect(vis.data.length).to.equal(dataLength);

      const addedCircle = vis.data[dataLength - 1];
      expectCircleToHaveCorrectAttributes(addedCircle, clickCoord.x, clickCoord.y, types[1]);

      // check whether added circle is displayed correctly
      const circle = document.querySelector('circle:nth-last-of-type(2)');
      // There is a transition on the new circle which changes the color after 1500 ms.
      // However at this point it did not take place yet, so the circle has the default color specified in options.
      expectCircleToBeDisplayedCorrectly(circle, addedCircle, options, options.circleFill);

      // check whether bounding circle is displayed correctly
      const boundingCircle = document.querySelector('circle:last-of-type');
      expectBoundingCircleToBeDisplayedCorrectly(
        boundingCircle, addedCircle, options, vis.knn.kClosestNeighbors[k - 1]);

      // check whether connecting lines are displayed correctly
      const lines = Array.from(document.querySelectorAll('line'));
      expectConnectingLinesToBeDisplayedCorrectly(lines, addedCircle, vis.knn.kClosestNeighbors);

      // check that maximum of k slider has changed
      expectInputRangeKMaxToBeCorrect(inputRangeK, dataLength);
    });
  });

  describe('clickable', () => {
    it('should *NOT* perform and visualize algorithm twice in a row', () => {
      let dataLength = data.length;
      const k = 3;
      vis = new KNNVisualization(data, options, types, k);

      const svg = document.querySelector(`#${vis.containerId} svg`);
      const inputRangeK = document.querySelector('#range-k');
      const labelSpan = document.querySelector('#range-k-label span');
      const weightedCheckBox = document.querySelector('#weighted');

      expectInitialStateToBeDisplayedCorrectly(svg, inputRangeK, labelSpan, weightedCheckBox, options, k, dataLength);

      // draw visualization
      vis.draw();

      // check whether circles are displayed correctly
      expectCirclesToBeDisplayedCorrectly(vis.data, options, vis.typeColorMap);

      // check whether weighted checkbox is not checked
      expectWeightedCheckboxChecked(weightedCheckBox, false);

      // simulate a click on the svg
      let clickCoord = { x: 25, y: 60 };
      simulateSvgClick(svg, clickCoord.x, clickCoord.y);

      // check whether new circle was added to data
      dataLength += 1;
      expect(vis.data.length).to.equal(dataLength);

      // check whether circle was classified correctly unweighted
      const addedCircle = vis.data[dataLength - 1];
      expectCircleToHaveCorrectAttributes(addedCircle, clickCoord.x, clickCoord.y, types[0].toString());

      // check whether added circle is displayed correctly
      const circle = document.querySelector('circle:nth-last-of-type(2)');
      expectCircleToBeDisplayedCorrectly(circle, addedCircle, options, options.circleFill);

      // check cliackable is false
      expect(vis.clickable).to.be.false;

      // create spies for click callbacks
      const svgClickCallbackSpy = sinon.spy(KNNVisualization.prototype, 'svgClickCallback');
      const clickCallbackSpy = sinon.spy(Visualization.prototype, 'clickCallback');

      // simulate second click
      clickCoord = { x: 14, y: 52 };
      simulateSvgClick(svg, clickCoord.x, clickCoord.y);

      // check that new circle was NOT added
      expect(vis.data.length).to.equal(dataLength);
      expect(document.querySelectorAll('circle')).to.have.length(dataLength + 1);// circles + bounding circle

      // check spy calls
      expect(clickCallbackSpy).to.have.been.calledOnce;
      expect(svgClickCallbackSpy).to.not.have.been.called;
    });
  });
});
