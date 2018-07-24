import { defaultTypes, defaultOptions } from './defaults';

export default class Circle {
  constructor(cx, cy, radius = defaultOptions.circleRadius,
              fill = defaultOptions.circleFill, stroke = defaultOptions.circleStroke, type = defaultTypes.None) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.fill = fill;
    this.stroke = stroke;
    this.type = type;
  }
  setFill(fill) {
    this.fill = fill;
  }
  setStroke(stroke) {
    this.stroke = stroke;
  }
  setType(type) {
    this.type = type;
  }
}
