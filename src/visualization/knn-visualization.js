import * as d3 from 'd3';
import Circle from './circle';
import { defaultOptions } from './defaults';
import Visualization from './visualization';
import KNN from '../algorithms/knn';

const defaultK = 3;

export default class KNNVisualization extends Visualization {
  constructor(data, options, k = defaultK, types) {
    super(data, option);
    this.knn = new KNN(data, k, types);
    this.addEventListeners();
  }
  addEventListeners() {
    this.onClickSvg([this.addCircle, this.addBoundingCircleAndConnectingLines]);
  }
  addBoundingCircleAndConnectingLines(circle) {
    const boundingCircle = this.getBoundingCircle(circle, this.knn.kClosestNeighbors[this.knn.k-1]);
    const connectingLines = this.getConnectingLines(circle);
  }
  getBoundingCircle(circle, furthestNeighbor) {
    const radius = furthestNeighbor.distance + this.options.circleRadius;
    return new Circle(circle.cx, circle.cy, radius, 'transparent', 'white', type='None');
  }
  getConnectingLines(circle) {
    return this.knn.kClosestNeighbors.map(n => {
      return {
        x1: n.cx,
        x2: circle.cx,
        y1: n.cy,
        y2: circle.cy,
        strokeWidth: 2,
        stroke: 'rgba(230,230,230,0.5)'
      };
    })
  }
};
