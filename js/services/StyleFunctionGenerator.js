export default class StyleFunctionGenerator {
  static generateStyle(styleRanges) {
    return (feature, resolution) => {
      const calculatedColor = this.getColorFromStyleRanges(styleRanges, feature);
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'pink',
          width: 1,
        }),
        fill: new ol.style.Fill({
          color: calculatedColor,
        }),
      });
    };
  }

  static getColorFromStyleRanges(styleRanges, feature) {
    let color = 'rgba(0, 0, 0, 1)';
    const red = 'rgba(193, 66, 66,0.6)';
    const yellow = 'rgba(237, 245, 80, 0.6)';
    const properties = feature.getProperties();

    let BreakException;
    try {
      styleRanges.forEach((styleRange) => {
        if (this.propertyIsOutsideRange(properties, styleRange)) {
          color = red;
          throw BreakException;
        } else if (this.propertyIsInsideRange(properties, styleRange)) {
          if (color !== yellow) {
            color = styleRange.color;
          }
        } else {
          color = yellow;
        }
      });
    } catch (e) {
      if (e !== BreakException) {
        throw e;
      }
    }
    return color;
  }

  static propertyIsInsideRange(properties, styleRange) {
    const property = properties[styleRange.propertyName];
    if (property === null) {
      return false;
    }
    return property >= styleRange.lowerInclusiveBound
      &&
      property
      < styleRange.upperExclusiveBound;
  }

  static propertyIsOutsideRange(properties, styleRange) {
    const property = properties[styleRange.propertyName];
    if (property === null) {
      return false;
    }
    return property < styleRange.lowerInclusiveBound
      ||
      property
      >= styleRange.upperExclusiveBound;
  }
}
