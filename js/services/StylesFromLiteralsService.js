import * as utils from '../utils';

export default class StylesFromLiteralsService {
  constructor(properties) {
    this.singleStyle = null;
    this.defaultVal = 'defaultVal';
    this.noStyleVal = 'noStyleVal';
    this.styles = {
      point: {},
      line: {},
      polygon: {},
    };
    this.initDefaultStyles();
    this.type = properties.type;
    this.initialize_(properties);
  }

  initDefaultStyles() {
    this.initNoValuePointStyle();
    this.initNoStyleDefinitionPointStyle();
  }

  initNoValuePointStyle() {
    const olStyleDefaultPoint = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#FFFFFF',
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 1,
        }),
      }),
    });
    const styleSpecPointDefault = {
      labelProperty: undefined,
      maxResolution: Infinity,
      minResolution: 0,
      olStyle: olStyleDefaultPoint,
    };
    this.styles.point[this.defaultVal] = [styleSpecPointDefault];
  }

  initNoStyleDefinitionPointStyle() {
    const olStyleDefaultPoint = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#000000',
        }),
        stroke: new ol.style.Stroke({
          color: '#FFFFFF',
          width: 2,
        }),
      }),
    });
    const styleSpecPointDefault = {
      labelProperty: undefined,
      maxResolution: Infinity,
      minResolution: 0,
      olStyle: olStyleDefaultPoint,
    };
    this.styles.point[this.noStyleVal] = [styleSpecPointDefault];
  }

  initialize_(properties) {
    let styleSpec;
    if (this.type === 'unique' || this.type === 'range') {
      this.key = properties.property;
    }
    if (this.type === 'single') {
      this.singleStyle = {
        olStyle: this.getOlStyleFromLiterals(properties),
        labelProperty: this.getLabelProperty(properties.vectorOptions.label),
      };
    } else if (this.type === 'unique') {
      const values = properties.values;
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        styleSpec = {
          olStyle: this.getOlStyleFromLiterals(value),
          minResolution: this.getMinResolution(value),
          maxResolution: this.getMaxResolution(value),
          labelProperty: this.getLabelProperty(value.vectorOptions.label),
        };
        this.pushOrInitialize_(value.geomType, value.value, styleSpec);
      }
    } else if (this.type === 'range') {
      const ranges = properties.ranges;
      for (let i = 0; i < ranges.length; i += 1) {
        const range = ranges[i];
        styleSpec = {
          olStyle: this.getOlStyleFromLiterals(range),
          minResolution: this.getMinResolution(range),
          maxResolution: this.getMaxResolution(range),
          labelProperty: this.getLabelProperty(range.vectorOptions.label),
        };
        const key = range.range.toLocaleString();
        this.pushOrInitialize_(range.geomType, key, styleSpec);
      }
    }
  }

  pushOrInitialize_(geomType, key, styleSpec) {
    let keyOrDefault = key;
    if (key === undefined) {
      keyOrDefault = this.defaultVal;
    }
    if (!this.styles[geomType][keyOrDefault]) {
      this.styles[geomType][keyOrDefault] = [styleSpec];
    } else {
      this.styles[geomType][keyOrDefault].push(styleSpec);
    }
  }

  findOlStyleInRange_(value, geomType) {
    let olStyle;
    let BreakException;
    try {
      Object.keys(this.styles[geomType]).forEach((range) => {
        const rangeArray = range.split(',');
        if (value >= parseFloat(rangeArray[0]) &&
          value < parseFloat(rangeArray[1])) {
          olStyle = this.styles[geomType][range];
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) {
        throw e;
      }
    }
    if (olStyle == null) {
      return this.styles[geomType][this.noStyleVal];
    }
    return olStyle;
  }

  static getOlStyleForResolution_(olStyles, resolution) {
    let i;
    let ii;
    let olStyle;
    for (i = 0, ii = olStyles.length; i < ii; i += 1) {
      olStyle = olStyles[i];
      if (olStyle.minResolution <= resolution &&
        olStyle.maxResolution > resolution) {
        break;
      }
    }
    return olStyle;
  }

  getFeatureStyle(feature, resolution) {
    if (this.type === 'single') {
      const labelProperty = this.singleStyle.labelProperty;
      if (labelProperty) {
        const properties = feature.getProperties();
        const text = properties[labelProperty];
        const olText = this.singleStyle.olStyle.getText();
        this.singleStyle.olStyle.getText().setText(text);
      }
      return this.singleStyle.olStyle;
    } else if (this.type === 'unique') {
      const properties = feature.getProperties();
      let value = utils.getObjectValue(properties, this.key);
      value = value != null ? value : this.defaultVal;
      const geomType = this.getGeomTypeFromGeometry(feature.getGeometry());
      let olStyles = this.styles[geomType][value];
      if (olStyles == null) {
        olStyles = this.styles[geomType][this.noStyleVal];
      }
      const res = this.getOlStyleForResolution_(olStyles, resolution);
      const labelProperty = res.labelProperty;
      if (labelProperty) {
        const text = properties[labelProperty];
        res.olStyle.getText().setText(text);
      }
      return res.olStyle;
    } else if (this.type === 'range') {
      const properties = feature.getProperties();
      const value = utils.getObjectValue(properties, this.key);
      const geomType = this.getGeomTypeFromGeometry(feature.getGeometry());
      let olStyles;
      if (value == null) {
        olStyles = this.styles[geomType][this.defaultVal];
      } else {
        olStyles = this.findOlStyleInRange_(value, geomType);
      }
      const res = this.getOlStyleForResolution_(olStyles, resolution);
      const labelProperty = res.labelProperty;
      if (labelProperty) {
        const text = properties[labelProperty];
        res.olStyle.getText().setText(text);
      }
      return res.olStyle;
    }
    return undefined;
  }

  static getOlStyleForPoint(options, shape) {
    if (shape === 'circle') {
      return new ol.style.Circle(options);
    } else if (shape === 'icon') {
      return new ol.style.Icon(options);
    }

    const shapes = {
      square: {
        points: 4,
        angle: Math.PI / 4,
      },
      triangle: {
        points: 3,
        rotation: Math.PI / 4,
        angle: 0,
      },
      star: {
        points: 5,
        angle: 0,
      },
      cross: {
        points: 4,
        angle: 0,
      },
    };
    const style = $.extend({}, shapes[shape], options);
    return new ol.style.RegularShape(style);
  }

  static getOlBasicStyles(options) {
    const olStyles = {};
    Object.keys(options).forEach((key) => {
      const type = key;
      const style = options[key];
      if (type === 'stroke') {
        olStyles[type] = new ol.style.Stroke(style);
      } else if (type === 'fill') {
        olStyles[type] = new ol.style.Fill(style);
      } else if (type === 'text') {
        style.stroke = new ol.style.Stroke(style.stroke);
        style.fill = new ol.style.Fill(style.fill);
        olStyles[type] = new ol.style.Text(style);
      }
    });
    return olStyles;
  }

  getOlStyleFromLiterals(value) {
    const olStyles = {};
    const style = value.vectorOptions;
    const geomType = value.geomType;
    if (geomType === 'point') {
      let olText;
      if (style.label) {
        olText = this.getOlBasicStyles(style.label).text;
      }
      const basicStyles = this.getOlBasicStyles(style);
      let olImage = $.extend({}, style, basicStyles);
      delete olImage.label;
      olImage = this.getOlStyleForPoint(olImage, style.type);
      olStyles.image = olImage;
      olStyles.text = olText;
    } else {
      Object.keys(style).forEach((key) => {
        if (key === 'label') {
          olStyles.text = this.getOlBasicStyles(style[key]).text;
        } else if (['stroke', 'fill', 'image'].indexOf(key) !== -1) {
          olStyles[key] = this.getOlBasicStyles(style)[key];
        }
      });
    }
    return new ol.style.Style(olStyles);
  }

  static getGeomTypeFromGeometry(olGeometry) {
    if (olGeometry instanceof ol.geom.Point ||
      olGeometry instanceof ol.geom.MultiPoint) {
      return 'point';
    } else if (olGeometry instanceof ol.geom.LineString ||
      olGeometry instanceof ol.geom.MultiLineString) {
      return 'line';
    } else if (olGeometry instanceof ol.geom.Polygon ||
      olGeometry instanceof ol.geom.MultiPolygon) {
      return 'polygon';
    }
    return undefined;
  }

  static getLabelProperty(value) {
    if (value) {
      return value.property;
    }
    return undefined;
  }

  static getMinResolution(value) {
    return value.minResolution || 0;
  }

  static getMaxResolution(value) {
    return value.maxResolution || Infinity;
  }
}

