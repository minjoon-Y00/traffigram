class TGMap {
	
	constructor(map_id, data, net, options) {
		this.data = data;
		this.net = net;
		this.opt = options;
		this.map = new ol.Map({
	    target: map_id,
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([0,0]),
	      maxZoom: this.opt.maxZoom, //18,
	    	minZoom: this.opt.minZoom, //10,
	    	zoom: this.opt.zoom //10
	    })
	  });

		this.map.getView().on('propertychange', this.propertyChange.bind(this));

		this.currentZoom = this.map.getView().getZoom();

	  $('#displayText1').appendTo(
	  	$('.ol-overlaycontainer')
	 	);

	  var str = this.currentZoom + ' Map Level';
	 	$('#displayText1').text(str);



	  this.displayedRoads = [];

	  this.addWaterLayer = true;
	  this.addTileLayer = false;
	  this.addOriginalRoadLayer = true;
	  this.addLocationLayer = false;

	  this.transparencyOriginalRoads = 1.0; //0.5;
	  this.addNetworkLayer = true;
	  this.NetworkLevel = 2;
	  this.addEdgeLayer = true;
	  this.addNodeLayer = true;
	}

	propertyChange(e) {

  switch (e.key) {
    case 'resolution':
      this.currentZoom = this.map.getView().getZoom();
      var str = this.currentZoom + ' Map Level';
	 		$('#displayText1').text(str);
    break;
	} 
}

	//
	//
	//
	setCenter(lat, lng) {
		this.map.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
	}

	//
	//
	//
	setZoom(zoom) {
		this.map.getView().setZoom(zoom);
	}

	//
	//
	//
	updateLayers() {
		if (this.addTileLayer) this.drawTileLayer();
		else this.removeTileLayer();

		if (this.addWaterLayer) this.drawWaterLayer();
		else this.removeWaterLayer();

		if (this.addOriginalRoadLayer) this.drawOriginalRoadLayer(this.data.verbose.edges);
		else this.removeOriginalRoadLayer();

		if (this.addNetworkLayer) {
			var edges = this.data['level' + this.NetworkLevel].edges;

			if (this.addEdgeLayer) this.drawEdgeLayer(edges);
			else this.removeEdgeLayer();

			if (this.addNodeLayer) this.drawNodeLayer(this.net.calNodes(edges));
			else this.removeNodeLayer();
		}
		else {
			this.removeEdgeLayer();
			this.removeNodeLayer();
		}

		if (this.addLocationLayer) this.drawLocationLayer(this.data.locations[this.data.locationType]);
		else this.removeLocationLayer();

		
	}

	//
	//
	//
	drawTileLayer() {
		this.removeTileLayer();
		this.map.tileLayer = this.createTileLayer();
	  this.map.addLayer(this.map.tileLayer);
	}

	drawWaterLayer() {
		this.removeWaterLayer();
		this.map.waterLayer = this.createWaterLayer();
	  this.map.addLayer(this.map.waterLayer);
	}

	drawRoadLayer(edges) {
		this.removeRoadLayer();
		this.map.roadLayer = this.createRoadLayer(edges);
	  this.map.addLayer(this.map.roadLayer);
	}

	drawOriginalRoadLayer(edges) {
		this.removeOriginalRoadLayer();
		//this.map.originalRoadLayer = this.createRoadLayer(edges, this.transparencyOriginalRoads);
		this.map.originalRoadLayer = this.createRoadLayer(edges);
	  this.map.addLayer(this.map.originalRoadLayer);
	}

	drawEdgeLayer(edges) {
		this.removeEdgeLayer();
		this.map.edgeLayer = this.createEdgeLayer(edges);
	  this.map.addLayer(this.map.edgeLayer);
	}

	drawNodeLayer(edges) {
		this.removeNodeLayer();
		this.map.nodeLayer = this.createNodeLayer(edges);
	  this.map.addLayer(this.map.nodeLayer);
	}

	drawLocationLayer(locations) {
		this.removeLocationLayer();
		this.map.locationLayer = this.createLocationLayer(locations);
	  this.map.addLayer(this.map.locationLayer);
	}

	//
	//
	//
	removeTileLayer() {
		if (this.map.tileLayer) {
			this.map.removeLayer(this.map.tileLayer);
			this.map.tileLayer = null;
		}
	}

	removeWaterLayer() {
		if (this.map.waterLayer) {
			this.map.removeLayer(this.map.waterLayer);
			this.map.waterLayer = null;
		}
	}

	removeRoadLayer() {
		if (this.map.roadLayer) {
			this.map.removeLayer(this.map.roadLayer);
			this.map.roadLayer = null;
		}
	}

	removeOriginalRoadLayer() {
		if (this.map.originalRoadLayer) {
			this.map.removeLayer(this.map.originalRoadLayer);
			this.map.originalRoadLayer = null;
		}
	}

	removeEdgeLayer() {
		if (this.map.edgeLayer) {
			this.map.removeLayer(this.map.edgeLayer);
			this.map.edgeLayer = null;
		}
	}

	removeNodeLayer() {
		if (this.map.nodeLayer) {
			this.map.removeLayer(this.map.nodeLayer);
			this.map.nodeLayer = null;
		}
	}

	removeLocationLayer() {
		if (this.map.locationLayer) {
			this.map.removeLayer(this.map.locationLayer);
			this.map.locationLayer = null;
		}
	}

	//
	//
	//
	lineStyleFunc(color, width) {
		return new ol.style.Style({
	  	stroke: new ol.style.Stroke({
	  		color: color,
	  		width: width
	  	})
	 	});
	};

	nodeStyleFunc(color, radius) {
		return new ol.style.Style({
	    image: new ol.style.Circle({
	    	radius: radius,
	    	fill: new ol.style.Fill({
	      	color: color
	    	})
	    })
		});
	};

	imageStyleFunc(src) {
		return new ol.style.Style({
			image: new ol.style.Icon({
	  		src: src
			})
		});
	};

	//
	//
	//
	addToDisplayedRoads(type) {
		this.displayedRoads.push(type);
	}

	removeToDisplayedRoads(type) {
		var idx = this.displayedRoads.indexOf(type);
		if (idx >= 0) this.displayedRoads.splice(idx, 1);
	}

	//
	//
	//
	createTileLayer() {
		return new ol.layer.Tile({
	    source: new ol.source.MapQuest({layer: 'sat'})
	  });
	}

	//
	//
	//
	createWaterLayer() {
		return new ol.layer.Vector({
		  source: new ol.source.TileVector({
		    format: new ol.format.TopoJSON(),
		    projection: 'EPSG:3857',
		    tileGrid: new ol.tilegrid.XYZ({
		      maxZoom: this.opt.maxZoom
		    }),
		    url: 'http://{a-c}.tile.openstreetmap.us/' +
		        'vectiles-water-areas/{z}/{x}/{y}.topojson'
		  }),
		  style: function(feature, resolution) {
		  	return [new ol.style.Style({
			    fill: new ol.style.Fill({
			      color: this.opt.color.water
			    })
			  })];
		  }.bind(this)
		});
	}

	//
	//
	//
	createRoadLayer(edges, alpha) {
		var arr = [];
		this.createRoadLayerByType(edges, arr, alpha, ['rail', 'monorail', 'light_rail', 'tram', 'disused']);
		this.createRoadLayerByType(edges, arr, alpha, ['motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link']);
		this.createRoadLayerByType(edges, arr, alpha, ['primary', 'secondary', 'tertiary']);
		this.createRoadLayerByType(edges, arr, alpha, ['motorway', 'trunk']);

		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		});
	}

	createRoadLayerByType(edges, arr, alpha, typeArr) {
		for(var i = 0; i < edges.length; i++) {

			if ($.inArray(edges[i].type, typeArr) === -1) continue;
			if ($.inArray(edges[i].type, this.displayedRoads) === -1) continue;

	  	var feature = new ol.Feature({
	  		geometry: new ol.geom.LineString(
	    		[ol.proj.transform([edges[i].startNode.lng, edges[i].startNode.lat], 'EPSG:4326', 'EPSG:3857'), 
	    		ol.proj.transform([edges[i].endNode.lng, edges[i].endNode.lat], 'EPSG:4326', 'EPSG:3857')])
			});

			if (alpha) {
				var clr = this.opt.color[edges[i].type];
				clr = clr.slice(5, clr.length-1);
				clr = clr.split(',');
				clr = 'rgba(' + clr[0] + ',' + clr[1] + ',' + clr[2] + ',' + alpha + ')';
	  		feature.setStyle(this.lineStyleFunc(clr, this.opt.width[edges[i].type]));
			} 
			else {
	  		feature.setStyle(this.lineStyleFunc(this.opt.color[edges[i].type], this.opt.width[edges[i].type]));
			}
	  	arr.push(feature);
		}
	}

	createEdgeLayer(edges) {
		var arr = [];

		for(var i = 0; i < edges.length; i++) {

			var feature = new ol.Feature({
	  		geometry: new ol.geom.LineString(
	    		[ol.proj.transform([edges[i].startNode.lng, edges[i].startNode.lat], 'EPSG:4326', 'EPSG:3857'), 
	    		ol.proj.transform([edges[i].endNode.lng, edges[i].endNode.lat], 'EPSG:4326', 'EPSG:3857')])
			});

	  	feature.setStyle(this.lineStyleFunc(this.opt.color.edge, this.opt.width.edge));
	  	arr.push(feature);
		}

		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		});
	}

	createNodeLayer(nodes) {
		var arr = [];

		for(var i = 0; i < nodes.length; i++) {

			var feature = new ol.Feature({
	  		geometry: new ol.geom.Point(
	    		ol.proj.transform([nodes[i].lng, nodes[i].lat], 'EPSG:4326', 'EPSG:3857'))
			});
	  	
	  	feature.setStyle(this.nodeStyleFunc(this.opt.color.node, this.opt.radius.node));
	  	arr.push(feature);
		}

		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		});
	}

	createLocationLayer(locations) {
		var arr = [];

		for(var i = 0; i < locations.length; i++) {

			var feature = new ol.Feature({
	  		geometry: new ol.geom.Point(
	    		ol.proj.transform([Number(locations[i].loc_x), Number(locations[i].loc_y)], 'EPSG:4326', 'EPSG:3857'))
			});
	  	
	  	//feature.setStyle(this.imageStyleFunc(this.opt.image.location));
	  	feature.setStyle(this.nodeStyleFunc(this.opt.color.location, this.opt.radius.location));

	  	arr.push(feature);
		}

		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		});
	}

}


