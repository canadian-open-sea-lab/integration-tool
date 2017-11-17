import * as configuration from './configuration';
import OLLayerFactory from './OLLayerFactory';
import StyleRange from './StyleRange';
import StyleFunctionGenerator from './services/StyleFunctionGenerator';
import PopupService from './services/PopupService';

let map;
let baseLayers;
const TOPIC_CODE = 'ca.ogsl.conditions';

function getSelectedBaseLayerCode() {
  return $('#baseLayers').find('option:selected').val();
}

function getBaseLayerFromCode(baseLayerCode) {
  return baseLayers.find(bL => bL.code === baseLayerCode);
}

function initMap() {
  const mapview = new ol.View({
    center: ol.proj.transform([-66.0, 51.0], 'EPSG:4326', 'EPSG:3857'),
    zoom: 3,
  });

  const baseLayerCode = getSelectedBaseLayerCode();
  const baseLayer = getBaseLayerFromCode(baseLayerCode);
  const olBaseLayer = OLLayerFactory.generateLayer(baseLayer);

  const sourceParams = {};
  sourceParams.url = 'https://test-www.ogsl.ca/geoserver/ogsl/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ogsl:view_decision_layer&outputFormat=application%2Fjson&CQL_FILTER=decision_layer_id=2';
  sourceParams.format = new ol.format.GeoJSON();
  const gridSource = new ol.source.Vector(sourceParams);
  const gridLayer = new ol.layer.Vector({ source: gridSource });

  const styleRanges = [];
  styleRanges.push(new StyleRange('depth', 'rgba(66, 244, 69,0.6)', -89, 0));
  styleRanges.push(new StyleRange('wind_speed', 'rgba(66, 244, 69,0.6)', 0, 130));
  const styleFunction = StyleFunctionGenerator.generateStyle(styleRanges);

  gridLayer.setStyle(styleFunction);
  gridLayer.setZIndex(1);

  map = new ol.Map({
    target: 'map',
    view: mapview,
    layers: [olBaseLayer, gridLayer],
  });
}

// TODO: put inside a service?
function loadBaseLayers() {
  return $.ajax({
    url: `${configuration.urlConfiguration.mapapi}/api/topics/getBaseLayerCatalog`
    + `?lang=${configuration.language}&code=${TOPIC_CODE}`,
    type: 'GET',
  });
}

function loadSelectBaseLayers() {
  baseLayers.forEach((baseLayer) => {
    $('#baseLayers').append(`<option value="${baseLayer.code}">${baseLayer.label__}`);
  });
}

function updateMapBaseLayer(baseLayer) {
  const layerToRemove = map.getLayers().getArray().find(layer => layer.get('id') === baseLayer.id);
  map.removeLayer(layerToRemove);
  map.addLayer(OLLayerFactory.generateLayer(baseLayer));
}

function initOnBaseLayerSelection() {
  $('#baseLayers').change(() => {
    const baseLayerCode = getSelectedBaseLayerCode();
    const baseLayer = getBaseLayerFromCode(baseLayerCode);
    if (baseLayer != null) {
      updateMapBaseLayer(baseLayer);
    }
  });
}

function initBootstrapSelect() {
  $('.mapSelectStyle').selectpicker({
    style: 'mapButtonStyle',
    header: '<span class="mapSelectHeader">Select map background' +
    '<i class="mapSelectHeaderIcon fa fa-map" style="padding-left:5px"></i></span>',
  });
}

function initFeatureClick(evt) {
  map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
    console.log(feature.getProperties());
    PopupService.removePopup('featureClick');
    PopupService.createPopup('featureClick', false);
    PopupService.addPopupContent('featureClick', 'This is some random shit content');
  });
}

function initMapClick() {
  map.on('singleclick', (evt) => {
    initFeatureClick(evt);
  });
}

$(document).ready(() => {
  // TODO: if there are too many ajax calls, combine with $.when a do a preload phase
  loadBaseLayers().done((response) => {
    baseLayers = response;
    loadSelectBaseLayers();
    initOnBaseLayerSelection();
    initMap();
    initMapClick();
    initBootstrapSelect();
  });
});
