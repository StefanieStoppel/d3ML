// source: https://gist.github.com/classiemilio/7a9f01ae64c38205e43c7267442aef18

import { selection, select } from 'd3';

const d3SelectionProto = Object.assign({}, selection.prototype);

const D3TransitionTestUtils = {
  stubAndForceTransitions() {
    selection.prototype.transition = function () {
      return this;
    };

    selection.prototype.duration = function () {
      return this;
    };

    selection.prototype.delay = function () {
      return this;
    };

    selection.prototype.ease = function () {
      return this;
    };

    selection.prototype.on = function (event, callback) {
      if (event === 'start' || event === 'end') {
        this.each(callback);

        return this;
      }

      return d3SelectionProto.on.apply(this, arguments);

    };

    selection.prototype.tween = function (_name, tweenFn) {
      this.each(function (datum, index) {
        tweenFn.call(this, datum, index)(1);
      });

      return this;
    };

    selection.prototype.attrTween = function (attr, tweenFn) {
      this.each(function (datum, index) {
        select(this).attr(attr, tweenFn.call(this, datum, index)(1));
      });

      return this;
    };

    selection.prototype.styleTween = function (style, tweenFn) {
      this.each(function (datum, index) {
        select(this).style(style, tweenFn.call(this, datum, index)(1));
      });

      return this;
    };
  },

  restoreTransitions() {
    selection.prototype = Object.assign({}, d3SelectionProto);
  }
};

export default D3TransitionTestUtils;
