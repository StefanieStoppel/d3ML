import MachineLearningAlgorithm from './machine-learning-algorithm';

export default class KNN extends MachineLearningAlgorithm {
  constructor(circles, k, types) {
    super(circles);
    this.k = k;
    this.types = types;
    this.kClosestNeighbors = null;
  }
  calculateDistance(a, b) {
    return Math.sqrt(Math.pow((b.cx - a.cx), 2) + Math.pow((b.cy - a.cy), 2));
  }
  findKClosestNeighbors(newCircle, neighbors, k) {
    return neighbors.filter(n => n !== newCircle)
      .map(n => {
        n.setDistance(this.calculateDistance(n, newCircle));

        return n;
      })
      .sort((a, b) => a.distance > b.distance)
      .filter((n, i) => i < k);
  }
  determineCircleType(kClosestNeighbors) {
    const counts = {};
    kClosestNeighbors.map(n => n.type)
      .forEach(type => {
        counts[type] = counts[type] ? counts[type] + 1 : 1;
      });

    return Object.entries(counts).sort((a, b) => a[1] < b[1])[0][0];
  }
  classify(newCircle) { // todo: test
    this.kClosestNeighbors = this.findKClosestNeighbors(newCircle, this.circles, this.k);
    this.addCircle(newCircle);

    return this.determineCircleType(this.kClosestNeighbors);
  }
  get furthestNeighborOfKClosest() {
    return this.kClosestNeighbors[this.k - 1];
  }
}
