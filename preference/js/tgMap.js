class TGMap {
	
	constructor(tg, map_id) {
		this.tg = tg
		this.map = new ol.Map({
	    target: map_id,
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([0,0]),
	      maxZoom: this.tg.opt.maxZoom, //18,
	    	minZoom: this.tg.opt.minZoom, //10,
	    	zoom: this.tg.opt.zoom //10
	    })
	  })


	 	// Variables for Display

	  this.dispWaterLayer = true;
	  this.dispRoadLayer = true;
	  this.dispNodeLayer = false;
	  this.dispCenterPositionLayer = false;
	  this.dispControlPointLayer = false;
	  this.dispGridLayer = false;

	  this.dispLocationLayer = false;


	  // Variables for others

		this.currentZoom = this.map.getView().getZoom();
	  this.clickRange = {lat:0, lng:0};

	  // Event Handlers

		this.map.getView().on('propertychange', this.propertyChange.bind(this));
		this.map.on('moveend', this.onMoveEnd.bind(this));
		this.map.on('click', this.onClicked.bind(this));
	}

	//
	// When zooming in / out
	//
	propertyChange(e) {
	  switch (e.key) {
	    case 'resolution':
	      this.currentZoom = this.map.getView().getZoom()
	      this.recalculateAndDraw()
	    break;
		} 
	}

	//
	// When finising the mouse move
	//
	onMoveEnd(e) {
		this.recalculateAndDraw()
	}

	//
	// Recalculate information changed according to the interaction and draw it
	//
	recalculateAndDraw() {
		this.calBoundaryBox()
	  this.tg.data.initGrids()
	  this.tg.data.setTravelTime()
	  this.tg.data.calLocalNodesRoads()
	  this.tg.data.calLocalLocations()
	  this.updateLayers()
		this.dispMapInfo()
	}

	//
	// When mouse button is clicked
	//
	onClicked(e) {
		var pt = ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
		var clickedLat = pt[1];
		var clickedLng = pt[0];

		/*
		var edges = this.tg.data['level' + this.NetworkLevel].edges;
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

  dispMapInfo() {

  	// map level and center position
  	var centerLat = (this.tg.opt.box.top + this.tg.opt.box.bottom)/2
		var centerLng = (this.tg.opt.box.left + this.tg.opt.box.right)/2
  	var str = 'Map Level (' + this.currentZoom 
  		+ '), Center (' + centerLat.toPrecision(8) + ', ' + centerLng.toPrecision(9) + ')'
  	$("#mapInfo1").text(str)

  	// Display the total number of nodes & roads
		var orgN = this.tg.data.nodes.length
		var orgR = this.tg.data.roads.length
		var str = 'Total Nodes (' + orgN + '), Roads (' + orgR + ')'
		$('#mapInfo2').text(str)

		// Display the displayed number of nodes & roads
		var localN = this.tg.data.localNodes.length
		var localR = this.tg.data.localRoads.length
		var str = 'Displayed Nodes (' + localN + '), Roads (' + localR + ')'
		$('#mapInfo3').text(str)
  }

	setCenter(lat, lng) {
		this.map.getView().setCenter(ol.proj.fromLonLat([lng, lat]))
		this.tg.data.centerPosition.lng = lng
		this.tg.data.centerPosition.lat = lat
	}

	setZoom(zoom) {
		this.map.getView().setZoom(zoom)
	}

	calBoundaryBox() {
		var extent = this.map.getView().calculateExtent(this.map.getSize())
	  var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326')
	  var topRight = ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326')

	  this.tg.opt.box.left = bottomLeft[0]
	  this.tg.opt.box.bottom = bottomLeft[1]
	  this.tg.opt.box.right = topRight[0]
	  this.tg.opt.box.top = topRight[1]

	  var height = this.tg.opt.box.top - this.tg.opt.box.bottom
  	var width = this.tg.opt.box.right - this.tg.opt.box.left

  	this.clickRange = {
  		lat: height * this.tg.opt.constant.clickSensibility, 
  		lng: width * this.tg.opt.constant.clickSensibility
  	}
	}

	//
	// Redraw all layers of displayed elements
	//
	updateLayers() {

		var start = (new Date()).getTime()

		if (this.dispWaterLayer) this.drawWaterLayer()
		else this.removeLayer(this.map.waterLayer)

		if (this.dispRoadLayer) this.drawRoadLayer()
		else this.removeLayer(this.map.roadLayer)

		if (this.dispNodeLayer) this.drawNodeLayer()
		else this.removeLayer(this.map.nodeLayer)

		if (this.dispGridLayer) this.drawGridLayer()
		else this.removeLayer(this.map.gridLayer)

		if (this.dispControlPointLayer) this.drawControlPointLayer()
		else this.removeLayer(this.map.controlPointLayer)

		if (this.dispLocationLayer) this.drawLocationLayer()
		else this.removeLayer(this.map.locationLayer)




		if (this.dispCenterPositionLayer) this.drawCenterPositionLayer()
		else this.removeLayer(this.map.centerPositionLayer)

		console.log('updateLayers : ' + ((new Date()).getTime() - start) + 'ms')
	}

	//
	//
	//

	drawWaterLayer() {
		this.removeLayer(this.map.waterLayer)
		this.map.waterLayer = this.createWaterLayer()
	  this.map.addLayer(this.map.waterLayer)
	}

	drawRoadLayer() {
		this.removeLayer(this.map.roadLayer)
		this.map.roadLayer = this.createRoadLayer()
	  this.map.addLayer(this.map.roadLayer)
	}

	drawNodeLayer() {
		this.removeLayer(this.map.nodeLayer)
		this.map.nodeLayer = this.createNodeLayer()
	  this.map.addLayer(this.map.nodeLayer)
	}

	drawCenterPositionLayer() {
		this.removeLayer(this.map.centerPositionLayer)
		this.map.centerPositionLayer = this.createCenterPositionLayer()
	  this.map.addLayer(this.map.centerPositionLayer)
	}

	drawControlPointLayer() {
		this.removeLayer(this.map.controlPointLayer)
		this.map.controlPointLayer = this.createControlPointLayer()
	  this.map.addLayer(this.map.controlPointLayer)
	}

	drawGridLayer() {
		this.removeLayer(this.map.gridLayer)
		this.map.gridLayer = this.createGridLayer()
	  this.map.addLayer(this.map.gridLayer)
	}

	drawLocationLayer() {
		this.removeLayer(this.map.locationLayer)
		this.map.locationLayer = this.createLocationLayer()
	  this.map.addLayer(this.map.locationLayer)
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
			this.map.removeLayer(layer)
			layer = null
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
		})
  	feature.setStyle(styleFunc)
  	arr.push(feature)
	}

	olFeaturesFromLineStrings(arr, sLng, sLat, eLng, eLat, styleFunc) {
		var feature = new ol.Feature({
  		geometry: new ol.geom.LineString(
    		[ol.proj.transform([sLng, sLat], 'EPSG:4326', 'EPSG:3857'), 
    		ol.proj.transform([eLng, eLat], 'EPSG:4326', 'EPSG:3857')])
		})
  	feature.setStyle(styleFunc)
  	arr.push(feature)
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
		      maxZoom: this.tg.opt.maxZoom
		    }),
		    url: 'http://{a-c}.tile.openstreetmap.us/' +
		        'vectiles-water-areas/{z}/{x}/{y}.topojson'
		  }),
		  style: function(feature, resolution) {
		  	return [new ol.style.Style({
			    fill: new ol.style.Fill({
			      color: this.tg.opt.color.water
			    })
			  })];
		  }.bind(this)
		});
	}

	createRoadLayer() {
		var nodes = this.tg.data.localNodes
		var roads = this.tg.data.localRoads
		var arr = []

		// motorway_link, trunk_link, primary_link, secondary_link, tertiary_link
		this.createRoadLayerByType(arr, nodes, roads, this.tg.opt.color.link, this.tg.opt.width.link, [21, 22, 23, 24, 25])
			
		// primary, secondary, tertiary
		this.createRoadLayerByType(arr, nodes, roads, this.tg.opt.color.arterial, this.tg.opt.width.arterial, [11, 12, 13])
			
		// motorway, trunk
		this.createRoadLayerByType(arr, nodes, roads, this.tg.opt.color.highway, this.tg.opt.width.highway, [1, 2])

		return this.olVectorFromFeatures(arr)
	}

	createRoadLayerByType(arr, nodes, roads, clr, width, typeArr) {
		var lenRoads = roads.length

		for(var i = 0; i < lenRoads; i++) {
			if (typeArr.indexOf(roads[i].type) === -1) continue

			for(var j = 0; j < roads[i].nodes.length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[roads[i].nodes[j]].original.lng, 
					nodes[roads[i].nodes[j]].original.lat, 
					nodes[roads[i].nodes[j + 1]].original.lng, 
					nodes[roads[i].nodes[j + 1]].original.lat, 
					this.lineStyleFunc(clr, width))
			}
		}
	}

	createNodeLayer() {
		var nodes = this.tg.data.localNodes
		var roads = this.tg.data.localRoads
		var lenRoads = roads.length
		var clr = this.tg.opt.color.node
		var radius = this.tg.opt.radius.node
		var arr = []

		for(var i = 0; i < lenRoads; i++) {
			this.olFeaturesFromPoints(arr, 
				nodes[roads[i].nodes[0]].original.lng, 
				nodes[roads[i].nodes[0]].original.lat, 
				this.nodeStyleFunc(clr, radius))

			this.olFeaturesFromPoints(arr, 
				nodes[roads[i].nodes[roads[i].nodes.length - 1]].original.lng, 
				nodes[roads[i].nodes[roads[i].nodes.length - 1]].original.lat, 
				this.nodeStyleFunc(clr, radius))	
		}
		return this.olVectorFromFeatures(arr)
	}

	createCenterPositionLayer() {
		var arr = []
		this.olFeaturesFromPoints(arr, 
			this.tg.data.centerPosition.lng, this.tg.data.centerPosition.lat, 
			this.imageStyleFunc(this.tg.opt.image.center))
		return this.olVectorFromFeatures(arr)
	}

	createControlPointLayer() {
		var nodes = this.tg.data.getControlPointsFromGrid()
		var arr = []
		var str = ''

		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
				this.nodeStyleFunc(this.tg.opt.color.controlPoint, this.tg.opt.radius.controlPoint))

			if ((nodes[i].target.lng != nodes[i].original.lng) || (nodes[i].target.lat != nodes[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[i].original.lng, nodes[i].original.lat, nodes[i].target.lng, nodes[i].target.lat,
					this.lineStyleFunc(this.tg.opt.color.controlPointLine, this.tg.opt.width.controlPointLine))
			}

			str = nodes[i].travelTime

			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
				this.textStyleFunc(str, this.tg.opt.color.text, this.tg.opt.font.text))
		}
		return this.olVectorFromFeatures(arr);
	}

	drawGridLines(arr, lines) {
		for(var i = 0; i < lines.length; i++) {
			this.olFeaturesFromLineStrings(arr, 
				lines[i].from.target.lng, 
				lines[i].from.target.lat, 
				lines[i].to.target.lng, 
				lines[i].to.target.lat, 
				this.lineStyleFunc(this.tg.opt.color.grid, this.tg.opt.width.grid))
		}
	}

	createGridLayer() {
		var arr = []
		this.drawGridLines(arr, this.tg.data.gridLinesX)
		this.drawGridLines(arr, this.tg.data.gridLinesY)




		/*
		console.log(grids)

		for(var i = 0; i < grids.length; i++) {
			for(var j = 0; j < grids[i].pts.length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					grids[i].pts[j].target.lng, 
					grids[i].pts[j].target.lat, 
					grids[i].pts[j + 1].target.lng, 
					grids[i].pts[j + 1].target.lat, 
					this.lineStyleFunc(this.tg.opt.color.grid, this.tg.opt.width.grid))
			}
		}

		for(var i = 0; i < grids.length - 1; i++) {
			for(var j = 0; j < grids[i].pts.length; j++) {
				curLng = grids[i].pts[j].original.lng

				for(var k = 0; k < grids[i + 1].pts.length; k++) {
					//console.log(curLng + ', ' + grids[i + 1].pts[k].original.lng)
					if (grids[i + 1].pts[k].original.lng == curLng) {
						//console.log('ok!')
						this.olFeaturesFromLineStrings(arr, 
							grids[i].pts[j].target.lng, 
							grids[i].pts[j].target.lat, 
							grids[i + 1].pts[k].target.lng, 
							grids[i + 1].pts[k].target.lat, 
							this.lineStyleFunc(this.tg.opt.color.grid, this.tg.opt.width.grid))
						break
					}

				}
			}
		}
		*/
		return this.olVectorFromFeatures(arr)
	}

	createLocationLayer() {
		var nodes = this.tg.data.localLocations
		var arr = []

		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, 
				nodes[i].target.lng, nodes[i].target.lat, 
				this.nodeStyleFunc(this.tg.opt.color.location, this.tg.opt.radius.location));
				//this.imageStyleFunc(this.tg.opt.image.location));

			if ((nodes[i].target.lng != nodes[i].original.lng) 
				|| (nodes[i].target.lat != nodes[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[i].original.lng, nodes[i].original.lat,
					nodes[i].target.lng, nodes[i].target.lat,
					this.lineStyleFunc(this.tg.opt.color.locationLine, this.tg.opt.width.locationLine));
			}
		}
		return this.olVectorFromFeatures(arr);
	}









}


