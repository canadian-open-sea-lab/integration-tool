import * as utils from './utils';

export default class OLSourceFactory {
  static generateSource(ogslSource) {
    let source;
    if (ogslSource.type === 'BingMaps') {
      source = this.generateBingMapsSource(ogslSource);
    } else if (ogslSource.type === 'TileWMS') {
      source = this.generateTileWMSSource(ogslSource);
    } else if (ogslSource.type === 'Vector') {
      source = this.generateVectorSource(ogslSource);
    }
    return source;
  }

  static generateBingMapsSource(ogslSource) {
    return new ol.source.BingMaps({
      key: ogslSource.key,
      imagerySet: ogslSource.imagerySet,
    });
  }

  static generateTileWMSSource(ogslSource) {
    const sourceParams = {};
    sourceParams.url = ogslSource.url;
    sourceParams.projection = ogslSource.projection;
    sourceParams.params = {
      FORMAT: ogslSource.format,
      VERSION: ogslSource.wmsVersion,
      LAYERS: ogslSource.wmsLayers,
      tilesOrigin: ogslSource.tilesOrigin,
    };
    const wmsSource = new ol.source.TileWMS(sourceParams);
    if (ogslSource.urlParams != null) {
      ogslSource.urlParams.forEach((urlParam) => {
        if (urlParam.value != null) {
          const obj = {};
          obj[urlParam.name] = urlParam.value;
          wmsSource.updateParams(obj);
        }
      });
    }
    return new ol.source.TileWMS(sourceParams);
  }

  static generateVectorSource(ogslSource) {
    const sourceParams = {};
    sourceParams.url = ogslSource.url;
    sourceParams.format = new ol.format.GeoJSON();
    if (ogslSource.urlParams != null) {
      ogslSource.urlParams.forEach((urlParam) => {
        if (urlParam.value != null) {
          const obj = {};
          obj[urlParam.name] = urlParam.value;
          sourceParams.url = utils.updateQueryString(urlParam.name,
            urlParam.value, sourceParams.url);
        }
      });
    }
    return new ol.source.Vector(sourceParams);
  }
}
