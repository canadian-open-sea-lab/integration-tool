import * as configuration from './configuration';
import OLLayerFactory from './OLLayerFactory';

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

  map = new ol.Map({
    target: 'map',
    view: mapview,
    layers: [olBaseLayer],
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
    $('#baseLayers').append(
      `<option value="${baseLayer.code}">${baseLayer.label__}`);
  });
}

function updateMapBaseLayer(baseLayer) {
  const layerToRemove = map.getLayers().getArray().find(
    layer => layer.get('id') === baseLayer.id);
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

$(document).ready(() => {
  // TODO: if there are too many ajax calls, combine with $.when a do a preload phase
  loadBaseLayers().done((response) => {
    baseLayers = response;
    loadSelectBaseLayers();
    initOnBaseLayerSelection();
    initMap();
  });
});
