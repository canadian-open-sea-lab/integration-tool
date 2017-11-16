export default class StyleRange {
  constructor(propertyName, color, lowerInclusiveBound, upperExclusiveBound) {
    this.propertyName = propertyName;
    this.color = color;
    this.lowerInclusiveBound = lowerInclusiveBound;
    this.upperExclusiveBound = upperExclusiveBound;
  }
}
