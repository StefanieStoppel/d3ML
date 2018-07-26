import MachineLearningAlgorithm from './machine-learning-algorithm';
import {defaultK, defaultType} from '../visualization/defaults';

export default class KNN extends MachineLearningAlgorithm {
  constructor(circles, types, k = defaultK) {
    super(circles);
    this.k = k;
    this.types = types;
    this.kClosestNeighbors = null;
  }
  calculateDistance(a, b) {
    return Math.sqrt(Math.pow((b.cx - a.cx), 2) + Math.pow((b.cy - a.cy), 2));
  }
  compareDistance(a, b) {
    if (a.distance > b.distance) {
      return 1;
    } else if (a.distance < b.distance) {
      return -1;
    }

    return 0;
  }
  findKClosestNeighbors(newCircle, neighbors) {
    return neighbors.filter(n => n !== newCircle && n.type !== defaultType)
      .map(n => {
        n.setDistance(this.calculateDistance(n, newCircle));

        return n;
      })
      .sort((a, b) => this.compareDistance(a, b))
      .filter((n, i) => i < this.k);
  }
  determineCircleType(kClosestNeighbors) {
    const counts = {};
    kClosestNeighbors.map(n => n.type)
      .forEach(type => {
        counts[type] = counts[type] ? counts[type] + 1 : 1;
      });

    return Object.entries(counts).sort((a, b) => a[1] < b[1])[0][0];
  }
  classify(circle, neighbors) {
    this.kClosestNeighbors = this.findKClosestNeighbors(circle, neighbors);

    return this.determineCircleType(this.kClosestNeighbors);
  }
}
