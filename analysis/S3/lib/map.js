var map = new ol.Map({
  target: 'ol_map',
  layers: [],
  view: new ol.View({
    center: ol.proj.fromLonLat([-122.312035, 47.658316]),
    maxZoom: 20,
  	minZoom: 0,
  	zoom: 13
  })
});

var tileLayer = createTileLayer();
map.addLayer(tileLayer);

//var waterLayer = createWaterLayer();
//map.addLayer(waterLayer);

function createWaterLayer() {
	return new ol.layer.Vector({
	  source: new ol.source.TileVector({
	    format: new ol.format.TopoJSON(),
	    projection: 'EPSG:3857',
	    tileGrid: new ol.tilegrid.XYZ({
	      maxZoom: 20
	    }),
	    url: 'http://{a-c}.tile.openstreetmap.us/' +
	        'vectiles-water-areas/{z}/{x}/{y}.topojson'
	  }),
	  style: function(feature, resolution) {
	  	return [new ol.style.Style({
		    fill: new ol.style.Fill({
		      color: 'rgba(146, 219, 238, 1)'
		    })
		  })];
	  }
	});
}

function createTileLayer() {
	return new ol.layer.Tile({
    source: new ol.source.MapQuest({layer: 'sat'})
  });
}
