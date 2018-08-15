export default class LinearRegression {
  calculateMean(d) {
    return d.reduce((sum, val) => sum + val) / d.length;
  }
  calculateSlope(circles, meanX, meanY) {
    const f = circles.reduce((sum, d) => {
      return {
        up: sum.up + ((d.cx - meanX) * (d.cy - meanY)),
        down: sum.down + Math.pow((d.cx - meanX), 2)
      };
    }, {up: 0, down: 0});

    return f.up / f.down;
  }
  calculateIntercept(slope, meanX, meanY) {
    if (slope) {
      return meanY - (slope * meanX);
    }

    return 0;
  }
  performRegression(circles) {
    const meanX = this.calculateMean(circles.map(d => d.cx));
    const meanY = this.calculateMean(circles.map(d => d.cy));

    const slope = this.calculateSlope(circles, meanX, meanY);
    const intercept = this.calculateIntercept(slope, meanX, meanY);

    return {slope, intercept};
  }
}
