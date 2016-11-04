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
	  this.dispOriginalRoadLayer = false;
	  this.dispOriginalNodeLayer = false;
	  this.dispSimplifiedRoadLayer = true;
	  this.dispSimplifiedNodeLayer = true;
	  this.dispOrders = true;
	  this.dispCenterPositionLayer = false;

	  this.dispRoadLayer = false;
	  this.dispNodeLayer = false;
	  this.dispNetworkLayer = false;
	  this.NetworkLevel = 2;

	  this.dispLocationLayer = false;
	  this.dispControlPointLayer = false;
	  this.dispGridLayer = false;

	  this.viewCenterPos = {lat:0, lng:0};
	  this.clickRange = {lat:0, lng:0};
	  this.readAllObjects = false;
	  this.selectedNodeID = -1;

	  // Event Handlers
		this.map.getView().on('propertychange', this.propertyChange.bind(this));
		this.map.on('moveend', this.onMoveEnd.bind(this));
		this.map.on('click', this.onClicked.bind(this));

		// For displaying texts in the map
	  $('#displayTextLT1').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLT2').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLT3').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLT4').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLB1').appendTo($('.ol-overlaycontainer'));
	  $('#displayTextLB2').appendTo($('.ol-overlaycontainer'));
	}

	//
	// When zooming in / out
	//
	propertyChange(e) {
	  switch (e.key) {
	    case 'resolution':
	      this.currentZoom = this.map.getView().getZoom();
	      this.calBoundaryBox();
	      this.data.calNOI();
	      this.data.calGrids()
	      this.data.calControlPoints()
	      this.data.calDispRoads();
	      this.updateLayers();
		 		this.displayTexts();
		 		this.dispMapText();
	    break;
		} 
	}

	//
	// When finising the mouse move
	//
	onMoveEnd(e) {
		this.calBoundaryBox();
		this.data.calNOI();
		this.data.calGrids()
		this.data.calControlPoints()
		this.data.calDispRoads();
    this.updateLayers();
	 	this.displayTexts();
	 	this.dispMapText();
	}

	//
	// When mouse button is clicked
	//
	onClicked(e) {
		var pt = ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
		var clickedLat = pt[1];
		var clickedLng = pt[0];

		/*
		var edges = this.data['level' + this.NetworkLevel].edges;
		var nodes = this.net.calNodes(edges);

		var found = false;
		for(var i = 0; i < nodes.length; i++) {

			if ((Math.abs(nodes[i].lat - clickedLat) <= this.clickRange.lat)
				&&(Math.abs(nodes[i].lng - clickedLng) <= this.clickRange.lng)) {
				//console.log(i);
				this.dispNodeText(i);
				this.selectedNodeID = i;
				found = true;
				break;
			}

			if (!found) {
				this.dispNodeText(-1);
				this.selectedNodeID = -1;	
			}
		}
		this.updateLayers();
		*/
	}

	//
	// Display overlapped information in the map
	//
	displayTexts() {
		return;
		var precision = 3;

		// Display the total number of original nodes & roads
		var orgN = this.data.original.nodes.length;
		var orgR = this.data.original.roads.length;
		var str = 'Total N(' + orgN + ') R(' + orgR + ')';
		$('#displayTextLT1').text(str);

		// Display the total number of simplified nodes & roads
		var simpN = this.data.simple.nodes.length;
		var simpR = this.data.simple.roads.length;
		var percN = (simpN / orgN * 100).toPrecision(precision);
		var percR = (simpR / orgR * 100).toPrecision(precision);
		var str = 'Total N(' + simpN + ') R(' + simpR + ') (' + percN + '% ,' + percR + '%)';
		$('#displayTextLT2').text(str);

		// Display the number of displayed (original) nodes & roads
		var orgDispN = this.data.calUniqueNodesLength(this.data.original.nodes, this.data.original.dispRoads);
		var orgDispR = this.data.original.dispRoads.length;
		str = 'Disp N(' + orgDispN + ') R(' + orgDispR + ')';
		$('#displayTextLT3').text(str);

		// Display the number of displayed (simplified) nodes & roads
		var simpDispN = this.data.calUniqueNodesLength(this.data.simple.nodes, this.data.simple.dispRoads);
		var simpDispR = this.data.simple.dispRoads.length;
		str = 'Simp N(' + simpDispN + ') R(' + simpDispR + ')';
		$('#displayTextLT4').text(str);

		
		//$('#displayTextLT1').text(this.currentZoom + ' Map Level');
		//$('#displayTextLT1').text(this.data.locations[this.data.locationType].length + ' Total Nodes');

		//console.log('dispEdges = ' + this.dispEdges.length);
		//this.calDispNodeLength();
		
		//$('#displayTextLT2').text(this.data.noi.length + ' Selected Nodes');
		//$('#displayTextLT3').text(this.data.controlPoints.length + ' Control Points');

	}

  dispMapText() {
  	var centerLat = (this.opt.box.top + this.opt.box.bottom)/2;
		var centerLng = (this.opt.box.left + this.opt.box.right)/2;

  	var str = 'Map Level: ' + this.currentZoom 
  		+ ', Center (' + centerLat.toPrecision(8) + ', ' + centerLng.toPrecision(9) + ')';
  	$("#mapTextDisplay").text(str);
  }

  dispNodeText(id) {
  	var str = "";

  	if (id > 0) {
  		str = 'Clicked Node: Lv ' + (this.NetworkLevel + 1) + ', ID ' + id;
  	} 

  	$("#nodeTextDisplay").text(str);
  }


	setCenter(lat, lng) {
		this.map.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.data.centerPosition.lng = lng;
		this.data.centerPosition.lat = lat;
	}

	setCenterByNodeID(id) {
		/*
		var edges = this.data['level' + this.NetworkLevel].edges;
		var nodes = this.net.calNodes(edges);

		if (id < nodes.length) {
			this.setCenter(nodes[id].lat, nodes[id].lng);*/

			/*var lat = nodes[id].lat;
			var lng = nodes[id].lng;
			this.map.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
			this.data.centerPosition.lng = lng;
			this.data.centerPosition.lat = lat;*/
			//this.updateLayers();
		//}
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

	  var height = this.opt.box.top - this.opt.box.bottom;
  	var width = this.opt.box.right - this.opt.box.left;

  	this.clickRange = {
  		lat: height * this.opt.constant.clickSensibility, 
  		lng: width * this.opt.constant.clickSensibility
  	};

  	//console.log('left : ' + this.opt.box.left);
  	//console.log('right : ' + this.opt.box.right);
  	//console.log('top : ' + this.opt.box.top);
  	//console.log('bottom : ' + this.opt.box.bottom);
	}

	//
	// Redraw all layers of displayed elements
	//
	updateLayers() {

		var start = (new Date()).getTime();
		if (!this.readAllObjects) return;

		// Tile

		if (this.dispTileLayer) this.drawTileLayer();
		else this.removeLayer(this.map.tileLayer);

		// Water

		if (this.dispWaterLayer) this.drawWaterLayer();
		else this.removeLayer(this.map.waterLayer);

		// Original Roads

		if (this.dispOriginalRoadLayer) this.drawOriginalRoadLayer();
		else this.removeLayer(this.map.originalRoadLayer);

		if (this.dispOriginalNodeLayer) this.drawOriginalNodeLayer();
		else this.removeLayer(this.map.originalNodeLayer);

		if (this.dispSimplifiedRoadLayer) this.drawSimplifiedRoadLayer();
		else this.removeLayer(this.map.simplifiedRoadLayer);

		if (this.dispSimplifiedNodeLayer) this.drawSimplifiedNodeLayer();
		else this.removeLayer(this.map.simplifiedNodeLayer);


		// Network

		/*
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
		}*/

		// Locations

		//if (this.dispLocationLayer) this.drawLocationLayer(this.data.locations[this.data.locationType]);
		if (this.dispLocationLayer) this.drawLocationLayer(this.data.noi);
		else this.removeLayer(this.map.locationLayer);

		// Control Points

		if (this.dispControlPointLayer) this.drawControlPointLayer();
		else this.removeLayer(this.map.controlPointLayer);

		if (this.dispGridLayer) this.drawGridLayer();
		else this.removeLayer(this.map.gridLayer);


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

	drawOriginalRoadLayer() {
		this.removeLayer(this.map.originalRoadLayer);
		this.map.originalRoadLayer = this.createRoadLayer(
			this.data.original.nodes, this.data.original.dispRoads, 
			this.opt.color.originalRoad, this.opt.width.originalRoad);
	  this.map.addLayer(this.map.originalRoadLayer);
	}

	drawOriginalNodeLayer() {
		this.removeLayer(this.map.originalNodeLayer);
		this.map.originalNodeLayer = this.createNodeLayer(
			this.data.original.nodes, this.data.original.dispRoads, 
			this.opt.color.originalNode, this.opt.radius.originalNode);
	  this.map.addLayer(this.map.originalNodeLayer);
	}

	drawSimplifiedRoadLayer() {
		this.removeLayer(this.map.simplifiedRoadLayer);
		this.map.simplifiedRoadLayer = this.createRoadLayer(
			this.data.simple.nodes, this.data.simple.dispRoads, 
			this.opt.color.simplifiedRoad, this.opt.width.simplifiedRoad);
	  this.map.addLayer(this.map.simplifiedRoadLayer);
	}

	drawSimplifiedNodeLayer() {
		this.removeLayer(this.map.simplifiedNodeLayer);
		this.map.simplifiedNodeLayer = this.createNodeLayer(
			this.data.simple.nodes, this.data.simple.dispRoads, 
			this.opt.color.simplifiedNode, this.opt.radius.simplifiedNode);
	  this.map.addLayer(this.map.simplifiedNodeLayer);
	}

	drawCenterPositionLayer() {
		this.removeLayer(this.map.centerPositionLayer);
		this.map.centerPositionLayer = this.createCenterPositionLayer();
	  this.map.addLayer(this.map.centerPositionLayer);		
	}

	/*
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
	*/

	drawLocationLayer(locations) {
		this.removeLayer(this.map.locationLayer);
		this.map.locationLayer = this.createLocationLayer(locations);
	  this.map.addLayer(this.map.locationLayer);
	}

	drawControlPointLayer() {
		this.removeLayer(this.map.controlPointLayer);
		this.map.controlPointLayer = this.createControlPointLayer(this.data.controlPoints);
	  this.map.addLayer(this.map.controlPointLayer);
	}

	drawGridLayer() {
		this.removeLayer(this.map.gridLayer);
		this.map.gridLayer = this.createGridLayer();
	  this.map.addLayer(this.map.gridLayer);
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

	textStyleFunc(text, color, font) {
	  return new ol.style.Style({
	  	text: new ol.style.Text({
	    	textAlign: 'Center',
	    	font: font,
	    	text: text,
	    	fill: new ol.style.Fill({color: color}),
	    	offsetX: 0,
	    	offsetY: 0
	    })
	  });
	}

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
		this.displayedRoads.push(this.opt.type[type]);
	}

	removeToDisplayedRoads(type) {
		var idx = this.displayedRoads.indexOf(this.opt.type[type]);
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

	/*
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
	}*/
	/*
		var clr = this.opt.color[edges[i].type];
		clr = clr.slice(5, clr.length-1);
		clr = clr.split(',');
		clr = 'rgba(' + clr[0] + ',' + clr[1] + ',' + clr[2] + ',' + alpha + ')';
		feature.setStyle(this.lineStyleFunc(clr, this.opt.width[edges[i].type]));
		*/

	createRoadLayer(nodes, edges, clr, width) {
		var arr = [];
		this.createRoadLayerByType(nodes, edges, clr, 1, arr, [21, 22, 23, 24, 25]);
		this.createRoadLayerByType(nodes, edges, clr, 1, arr, [11, 12, 13]);
		this.createRoadLayerByType(nodes, edges, clr, 5, arr, [1, 2]);
		//this.createRoadLayerByType(ne, arr, ['motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link']);
		//this.createRoadLayerByType(ne, arr, ['primary', 'secondary', 'tertiary']);
		//this.createRoadLayerByType(ne, arr, ['motorway', 'trunk']);

		return this.olVectorFromFeatures(arr);
	}

	createRoadLayerByType(nodes, roads, clr, width, arr, typeArr) {
		var lenRoads = roads.length;



		//console.log(clr);

		for(var i = 0; i < lenRoads; i++) {

			if (typeArr.indexOf(roads[i].type) == -1) continue;

			//if ($.arrayIntersect(ne.edges[i].tag, typeArr).length == 0) continue;
			//if ($.inArray(ne.edges[i].tag[0], typeArr) === -1) continue;

			//console.log(this.displayedRoads);
			//var r = Math.floor((Math.random() * 255));
			//var g = Math.floor((Math.random() * 255));
			//var b = Math.floor((Math.random() * 255));
			//clr = 'rgb(' + r + ',' + g + ',' + b + ')';

			var new_width;
			if ((roads[i].type == 1)||(roads[i].type == 2)||(roads[i].type == 21)||(roads[i].type == 22)||(roads[i].type == 23)) {
				new_width = 1;
				clr = '#F00';
			}
			else {
				new_width = 1;
				clr = '#BBB';
			}

			clr = '#BBB';


			if (this.displayedRoads.indexOf(roads[i].type) === -1) continue;

			for(var j = 0; j < roads[i].nodes.length - 1; j++) {

				//var new_width = (roads[i].oneway) ? width : width + 1;
				

				this.olFeaturesFromLineStrings(arr, 
					nodes[roads[i].nodes[j]].lng, 
					nodes[roads[i].nodes[j]].lat, 
					nodes[roads[i].nodes[j + 1]].lng, 
					nodes[roads[i].nodes[j + 1]].lat, 
					this.lineStyleFunc(clr, new_width));
			}
		}
	}

	createNodeLayer(nodes, roads, clr, radius) {
		var arr = [];
		var lenRoads = roads.length;
		var new_clr;

		for(var i = 0; i < lenRoads; i++) {

			if (this.displayedRoads.indexOf(roads[i].type) === -1) continue;

			for(var j = 0; j < roads[i].nodes.length; j++) {

				if (nodes[roads[i].nodes[j]].deleted) continue;

				if (this.dispOrders) {
					var order = nodes[roads[i].nodes[j]].roads.length;

					if (order == 0) continue;


					if (order > 7) order = 7;
					if (order == 0) clr = '#CCC';
					else clr = this.opt.color.nodeOrder[order - 1];
				}


				if (order == 0) {
					// intermediate nodes
					clr = '#000';
					radius = 2;
				}
				else { 
					// terminal nodes
					clr = '#000';
					radius = 2;
				}

				if (nodes[roads[i].nodes[j]].deleted) new_clr = '#000';
				else new_clr = clr;

	


				

				this.olFeaturesFromPoints(arr, 
					nodes[roads[i].nodes[j]].lng, nodes[roads[i].nodes[j]].lat, 
					this.nodeStyleFunc(new_clr, radius));
			}
		}
		return this.olVectorFromFeatures(arr);
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

	/*
	createNodeLayer(nodes) {
		var arr = [];
		for(var i = 0; i < nodes.length; i++) {

			var clr = this.opt.color.node;

			if (i === this.selectedNodeID) clr = this.opt.color.selectedNode;
			
			this.olFeaturesFromPoints(arr, 
				nodes[i].lng, nodes[i].lat, 
				this.nodeStyleFunc(clr, this.opt.radius.node));
		}
		return this.olVectorFromFeatures(arr);
	}
	*/

	createLocationLayer(nodes) {
		var arr = [];
		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, 
				nodes[i].target.lng, nodes[i].target.lat, 
				this.nodeStyleFunc(this.opt.color.location, this.opt.radius.location));
				//this.imageStyleFunc(this.opt.image.location));

			if ((nodes[i].target.lng != nodes[i].original.lng) 
				|| (nodes[i].target.lat != nodes[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[i].original.lng, nodes[i].original.lat,
					nodes[i].target.lng, nodes[i].target.lat,
					this.lineStyleFunc(this.opt.color.locationLine, this.opt.width.locationLine));
			}
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

	createControlPointLayer(nodes) {
		var arr = [];
		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
				this.nodeStyleFunc(this.opt.color.controlPoint, this.opt.radius.controlPoint));

			if ((nodes[i].target.lng != nodes[i].original.lng) || (nodes[i].target.lat != nodes[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[i].original.lng, nodes[i].original.lat, nodes[i].target.lng, nodes[i].target.lat,
					this.lineStyleFunc(this.opt.color.controlPointLine, this.opt.width.controlPointLine));
			}

			//var str = nodes[i].time + '(' + nodes[i].distance + ')';
			var str = nodes[i].travelTime
			//var str = i

			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
				this.textStyleFunc(str, '#000', '14px Source Sans Pro'));

			
		}
		return this.olVectorFromFeatures(arr);
	}

	createGridLayer() {
		var arr = []
		var grids = this.data.grids

		for(var i = 0; i < grids.length; i++) {
			for(var j = 0; j < grids[i].pts.length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					grids[i].pts[j].target.lng, 
					grids[i].pts[j].target.lat, 
					grids[i].pts[j + 1].target.lng, 
					grids[i].pts[j + 1].target.lat, 
					this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));
			}
		}

		for(var i = 0; i < grids[0].pts.length; i++) {
			for(var j = 0; j < grids.length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					grids[j].pts[i].target.lng, 
					grids[j].pts[i].target.lat, 
					grids[j + 1].pts[i].target.lng, 
					grids[j + 1].pts[i].target.lat, 
					this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));
			}
		}



		/*for(var i = 0; i < grids.length; i++) {
			for(var j = 0; j < grids[i].pts.length; j++) {
				this.olFeaturesFromPoints(arr, grids[i].pts[j].original.lng, grids[i].pts[j].original.lat, 
				//this.olFeaturesFromPoints(arr, -122.312035, 47.658311, 
					this.nodeStyleFunc(this.opt.color.controlPoint, this.opt.radius.controlPoint));

			console.log(grids[i].pts[j].original.lng)
			console.log(grids[i].pts[j].original.lat)
			}
		}*/

		/*
		for(var i = 0; i < grids.length; i++) {
			this.olFeaturesFromLineStrings(arr, 
				grids[i].TL.lng, grids[i].TL.lat, grids[i].TR.lng, grids[i].TR.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));

			this.olFeaturesFromLineStrings(arr, 
				grids[i].TR.lng, grids[i].TR.lat, grids[i].BR.lng, grids[i].BR.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));

			this.olFeaturesFromLineStrings(arr, 
				grids[i].BR.lng, grids[i].BR.lat, grids[i].BL.lng, grids[i].BL.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));

			this.olFeaturesFromLineStrings(arr, 
				grids[i].BL.lng, grids[i].BL.lat, grids[i].TL.lng, grids[i].TL.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));
		}
		*/
		return this.olVectorFromFeatures(arr);
	}



}


