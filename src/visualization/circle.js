import { defaultType, defaultOptions } from './defaults';

export default class Circle {
  constructor(cx,
              cy,
              radius = defaultOptions.circleRadius,
              fill = defaultOptions.circleFill,
              stroke = defaultOptions.circleStroke,
              type = defaultType
  ) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.fill = fill;
    this.stroke = stroke;
    this.type = type;
    this.distance = null;
    this.cssClass = '';
  }
  setType(type) {
    this.type = type;
  }
  setDistance(distance) {
    this.distance = distance;
  }
  setCssClass(value) {
    this.cssClass = value;
  }
}
