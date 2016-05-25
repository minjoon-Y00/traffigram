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


	 	// Variables

		this.currentZoom = this.map.getView().getZoom();

	  this.dispWaterLayer = true;
	  this.dispTileLayer = false;

	  this.displayedRoads = [];
	  this.dispOriginalRoadLayer = true;
	  this.dispCenterPositionLayer = true;

	  this.dispEdgeLayer = true;
	  this.dispNodeLayer = true;
	  this.dispNetworkLayer = true;
	  this.NetworkLevel = 2;

	  this.dispLocationLayer = true;
	  this.dispControlPointLayer = true;

	  this.viewCenterPos = {lat:0, lng:0};

	  // Event Handlers
		this.map.getView().on('propertychange', this.propertyChange.bind(this));
		this.map.on('moveend', this.onMoveEnd.bind(this));

		// For displaying texts in the map
	  $('#displayTextLT1').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLT2').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLT3').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLT4').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLB1').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLB2').appendTo($('.ol-overlaycontainer'));
	}

	//
	//
	//
	propertyChange(e) {
	  switch (e.key) {
	    case 'resolution':
	      this.currentZoom = this.map.getView().getZoom();
	      this.calBoundaryBox();
	      this.data.calNOI();
	      this.data.calControlPointsGrid();
		 		this.displayTexts();
	    break;
		} 
	}

	onMoveEnd(e) {
		this.calBoundaryBox();
		this.data.calNOI();
		this.data.calControlPointsGrid();
	 	this.displayTexts();
	}

	displayTexts() {
		$('#displayTextLT1').text(this.currentZoom + ' Map Level');
		$('#displayTextLT2').text(this.data.locations[this.data.locationType].length + ' Total Nodes');
		$('#displayTextLT3').text(this.data.noi.length + ' Selected Nodes');
		$('#displayTextLT4').text(this.data.controlPoints.length + ' Control Points');

		$('#displayTextLB2').text('center(lat, lng):');

		var centerLat = (this.opt.box.top + this.opt.box.bottom)/2;
		var centerLng = (this.opt.box.left + this.opt.box.right)/2;
		$('#displayTextLB1').text('(' + centerLat.toPrecision(8) + ', ' + centerLng.toPrecision(9) + ')');
	}

	setCenter(lat, lng) {
		this.map.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.data.centerPosition.lng = lng;
		this.data.centerPosition.lat = lat;
	}

	setZoom(zoom) {
		this.map.getView().setZoom(zoom);
	}

	calBoundaryBox() {
		var extent = this.map.getView().calculateExtent(this.map.getSize());
	  var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
	  var topRight = ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

	  this.opt.box.left = bottomLeft[0];
	  this.opt.box.bottom = bottomLeft[1];
	  this.opt.box.right = topRight[0];
	  this.opt.box.top = topRight[1];
	}

	//
	//
	//
	updateLayers() {

		var start = (new Date()).getTime();

		// Tile

		if (this.dispTileLayer) this.drawTileLayer();
		else this.removeLayer(this.map.tileLayer);

		// Water

		if (this.dispWaterLayer) this.drawWaterLayer();
		else this.removeLayer(this.map.waterLayer);

		// Original Roads

		if (this.dispOriginalRoadLayer) this.drawOriginalRoadLayer(this.data.verbose.edges);
		else this.removeLayer(this.map.originalRoadLayer);

		// Network

		if (this.dispNetworkLayer) {
			var edges = this.data['level' + this.NetworkLevel].edges;

			if (this.dispEdgeLayer) this.drawEdgeLayer(edges);
			else this.removeLayer(this.map.edgeLayer);

			if (this.dispNodeLayer) this.drawNodeLayer(this.net.calNodes(edges));
			else this.removeLayer(this.map.nodeLayer);
		}
		else {
			this.removeLayer(this.map.edgeLayer);
			this.removeLayer(this.map.nodeLayer);
		}

		// Locations

		if (this.dispLocationLayer) this.drawLocationLayer(this.data.locations[this.data.locationType]);
		else this.removeLayer(this.map.locationLayer);

		// Control Points

		if (this.dispControlPointLayer) this.drawControlPointLayer();
		else this.removeLayer(this.map.controlPointLayer);


		// Center Position
		if (this.dispCenterPositionLayer) this.drawCenterPositionLayer();
		else this.removeLayer(this.map.centerPositionLayer);

		console.log('updateLayers : ' + ((new Date()).getTime() - start) + 'ms');
	}

	//
	//
	//
	drawTileLayer() {
		this.removeLayer(this.map.tileLayer);
		this.map.tileLayer = this.createTileLayer();
	  this.map.addLayer(this.map.tileLayer);
	}

	drawWaterLayer() {
		this.removeLayer(this.map.waterLayer);
		this.map.waterLayer = this.createWaterLayer();
	  this.map.addLayer(this.map.waterLayer);
	}

	drawOriginalRoadLayer(edges) {
		this.removeLayer(this.map.originalRoadLayer);
		this.map.originalRoadLayer = this.createRoadLayer(edges);
	  this.map.addLayer(this.map.originalRoadLayer);
	}

	drawCenterPositionLayer() {
		this.removeLayer(this.map.centerPositionLayer);
		this.map.centerPositionLayer = this.createCenterPositionLayer();
	  this.map.addLayer(this.map.centerPositionLayer);		
	}

	drawEdgeLayer(edges) {
		this.removeLayer(this.map.edgeLayer);
		this.map.edgeLayer = this.createEdgeLayer(edges);
	  this.map.addLayer(this.map.edgeLayer);
	}

	drawNodeLayer(edges) {
		this.removeLayer(this.map.nodeLayer);
		this.map.nodeLayer = this.createNodeLayer(edges);
	  this.map.addLayer(this.map.nodeLayer);
	}

	drawLocationLayer(locations) {
		this.removeLayer(this.map.locationLayer);
		this.map.locationLayer = this.createLocationLayer(locations);
	  this.map.addLayer(this.map.locationLayer);
	}

	drawControlPointLayer() {
		this.removeLayer(this.map.controlPointLayer);
		this.map.controlPointLayer = this.createControlPointLayer();
	  this.map.addLayer(this.map.controlPointLayer);
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
	removeLayer(layer) {
		if (layer) {
			this.map.removeLayer(layer);
			layer = null;
		}
	}

	olVectorFromFeatures(arr) {
		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		});
	}

	olFeaturesFromPoints(arr, lng, lat, styleFunc) {
		var feature = new ol.Feature({
  		geometry: new ol.geom.Point(
    		ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
		});
  	
  	feature.setStyle(styleFunc);
  	arr.push(feature);
	}

	olFeaturesFromLineStrings(arr, sLng, sLat, eLng, eLat, styleFunc) {
		var feature = new ol.Feature({
  		geometry: new ol.geom.LineString(
    		[ol.proj.transform([sLng, sLat], 'EPSG:4326', 'EPSG:3857'), 
    		ol.proj.transform([eLng, eLat], 'EPSG:4326', 'EPSG:3857')])
		});
  	
  	feature.setStyle(styleFunc);
  	arr.push(feature);
	}

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

	createRoadLayer(edges) {
		var arr = [];
		this.createRoadLayerByType(edges, arr, ['rail', 'monorail', 'light_rail', 'tram', 'disused']);
		this.createRoadLayerByType(edges, arr, ['motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link']);
		this.createRoadLayerByType(edges, arr, ['primary', 'secondary', 'tertiary']);
		this.createRoadLayerByType(edges, arr, ['motorway', 'trunk']);

		return this.olVectorFromFeatures(arr);
	}

	createRoadLayerByType(edges, arr, typeArr) {
		for(var i = 0; i < edges.length; i++) {

			if ($.inArray(edges[i].type, typeArr) === -1) continue;
			if ($.inArray(edges[i].type, this.displayedRoads) === -1) continue;

			this.olFeaturesFromLineStrings(arr, 
				edges[i].startNode.lng, edges[i].startNode.lat, edges[i].endNode.lng, edges[i].endNode.lat, 
				this.lineStyleFunc(this.opt.color[edges[i].type], this.opt.width[edges[i].type]));
		}
		/*
		var clr = this.opt.color[edges[i].type];
		clr = clr.slice(5, clr.length-1);
		clr = clr.split(',');
		clr = 'rgba(' + clr[0] + ',' + clr[1] + ',' + clr[2] + ',' + alpha + ')';
		feature.setStyle(this.lineStyleFunc(clr, this.opt.width[edges[i].type]));
		*/
	}

	createEdgeLayer(edges) {
		var arr = [];
		for(var i = 0; i < edges.length; i++) {
			this.olFeaturesFromLineStrings(arr, 
				edges[i].startNode.lng, edges[i].startNode.lat, edges[i].endNode.lng, edges[i].endNode.lat, 
				this.lineStyleFunc(this.opt.color.edge, this.opt.width.edge));
		}
		return this.olVectorFromFeatures(arr);
	}

	createNodeLayer(nodes) {
		var arr = [];
		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, 
				nodes[i].lng, nodes[i].lat, 
				this.nodeStyleFunc(this.opt.color.node, this.opt.radius.node));
		}
		return this.olVectorFromFeatures(arr);
	}

	createLocationLayer(locations) {
		var arr = [];
		for(var i = 0; i < locations.length; i++) {
			this.olFeaturesFromPoints(arr, 
				Number(locations[i].loc_x), Number(locations[i].loc_y), 
				this.nodeStyleFunc(this.opt.color.location, this.opt.radius.location));
				//this.imageStyleFunc(this.opt.image.location));
		}
		return this.olVectorFromFeatures(arr);
	}

	createCenterPositionLayer() {
		var arr = [];
		this.olFeaturesFromPoints(arr, 
			this.data.centerPosition.lng, this.data.centerPosition.lat, 
			this.imageStyleFunc(this.opt.image.center));
		return this.olVectorFromFeatures(arr);
	}

	createControlPointLayer() {
		var arr = [];
		for(var i = 0; i < this.data.controlPoints.length; i++) {
			this.olFeaturesFromPoints(arr, 
				this.data.controlPoints[i].target.lng, this.data.controlPoints[i].target.lat, 
				this.nodeStyleFunc(this.opt.color.controlPoint, this.opt.radius.controlPoint));

			if ((this.data.controlPoints[i].target.lng != this.data.controlPoints[i].original.lng) 
				|| (this.data.controlPoints[i].target.lat != this.data.controlPoints[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					this.data.controlPoints[i].original.lng, this.data.controlPoints[i].original.lat,
					this.data.controlPoints[i].target.lng, this.data.controlPoints[i].target.lat,
					this.lineStyleFunc(this.opt.color.controlPointLine, this.opt.width.controlPointLine));
			}
		}
		return this.olVectorFromFeatures(arr);
	}



}


