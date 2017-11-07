let map;


function initMap() {
  const mapview = new ol.View({
    center: ol.proj.transform([-66.0, 51.0], 'EPSG:4326', 'EPSG:3857'),
    zoom: 3,
  });

  const backlayer = new ol.layer.Tile({
    visible: true,
    preload: Infinity,
    source: new ol.source.BingMaps({
      key: 'Al-vCFd3kpTVli45kJ62doCSRNQY1DoYdw0s-vP1vwgiWiO3TiOQsu2EGlYAy9xt',
      imagerySet: 'AerialWithLabels',
      // use maxZoom 19 to see stretched tiles instead of the BingMaps
      // "no photos at this zoom level" tiles
      maxZoom: 19,
    }),
  });
  map = new ol.Map({
    target: 'map',
    view: mapview,
    layers: [backlayer],
  });
}

$(document).ready(() => {
  initMap();
});
