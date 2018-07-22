export default class MachineLearningAlgorithm {
  constructor(data) {
    this.data = data;
    this.n = data.length;
  }
  addDataPoint(d) {
    this.data.push(d);
  }
}
// TODO: add validation
