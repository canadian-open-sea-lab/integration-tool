import OLSourceFactory from './OLSourceFactory';
import StylesFromLiteralsService from './services/StylesFromLiteralsService';
import StyleService from './services/StyleService';

export default class OLLayerFactory {
  static generateLayer(ogslLayer) {
    let layer;
    if (ogslLayer.type === 'Tile') {
      layer = this.generateTileLayer(ogslLayer);
    } else if (ogslLayer.type === 'Vector') {
      layer = this.generateVectorLayer(ogslLayer);
    }
    layer.setZIndex(ogslLayer.zIndex);
    return layer;
  }

  static generateTileLayer(ogslLayer) {
    const source = OLSourceFactory.generateSource(ogslLayer.source);
    const layer = new ol.layer.Tile({ source });
    this.setOLLayerProperties(layer, ogslLayer);
    return layer;
  }

  static generateVectorLayer(ogslLayer) {
    const source = OLSourceFactory.generateSource(ogslLayer.source);
    const layer = new ol.layer.Vector({ source });
    this.setOLLayerProperties(layer, ogslLayer);
    if (ogslLayer.styleId != null) {
      const styleService = new StyleService();
      styleService.getStyle(ogslLayer.styleId).done((style) => {
        const stylesFromLiteralsService = new StylesFromLiteralsService(
          style.data);
        layer.setStyle(
          (feature, resolution) => [stylesFromLiteralsService.getFeatureStyle(
            feature,
            resolution)]);
      });
    }
    return layer;
  }

  static setOLLayerProperties(layer, ogslLayer) {
    layer.set('id', ogslLayer.id);
    layer.set('uniqueId', ogslLayer.uniqueId);
    layer.set('code', ogslLayer.code);
    layer.set('isTimeEnabled', ogslLayer.isTimeEnabled);
  }
}
