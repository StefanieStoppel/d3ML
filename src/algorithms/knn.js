import MachineLearningAlgorithm from './machine-learning-algorithm';
import {defaultK} from '../visualization/defaults';

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
    return neighbors.filter(n => n !== newCircle)
      .map(n => {
        n.setDistance(this.calculateDistance(n, newCircle));

        return n;
      })
      .sort((a, b) => this.compareDistance(a, b))
      .filter((n, i) => i < this.k);

  }
  getCircleTypeWeighted(kClosestNeighbors) { // todo: test
    const typeDistance = this.types.reduce((res, type) => {
      res[type] = 0;

      return res;
    }, {max: {type: null, val: 0}});
    const res = kClosestNeighbors.reduce((res, neighbor) => {
      const inverseDistance = res[neighbor.type] + 1 / neighbor.distance;
      if (inverseDistance > res.max.val) {
        res.max.type = neighbor.type;
        res.max.val = inverseDistance;
      }
      res[neighbor.type] = inverseDistance;

      return res;
    }, typeDistance);

    return res.max.type;
  }
  getCircleTypeUnweighted(kClosestNeighbors) { // todo: test
    const counts = {};
    kClosestNeighbors.map(n => n.type)
      .forEach(type => {
        counts[type] = counts[type] ? counts[type] + 1 : 1;
      });

    return Object.entries(counts).sort((a, b) => a[1] < b[1])[0][0];
  }
  determineCircleType(kClosestNeighbors, weighted) {
    let result;
    if (weighted) {
      result = this.getCircleTypeWeighted(kClosestNeighbors);
    } else {
      result = this.getCircleTypeUnweighted(kClosestNeighbors);
    }

    return result;
  }

  classify(circle, neighbors, weighted = false) {
    this.kClosestNeighbors = this.findKClosestNeighbors(circle, neighbors);

    return this.determineCircleType(this.kClosestNeighbors, weighted);
  }
}
