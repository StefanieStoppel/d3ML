export default class MachineLearningAlgorithm {
  constructor(circles) {
    this.circles = circles;
    this.n = circles.length;
  }
  addCircle(c) {
    this.circles.push(c);
  }
}
