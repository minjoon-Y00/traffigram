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

	  this.dispWaterDataLayer = true;
	  this.dispWaterLayer = true;
	  this.dispRoadLayer = true;
	  this.dispNodeLayer = false;
	  this.dispCenterPositionLayer = false;
	  this.dispControlPointLayer = false;
	  this.dispGridLayer = false;
	  this.dispLocationLayer = false;

	  this.dispWater = []


	  // Variables for others

		this.currentZoom = this.map.getView().getZoom();
	  this.clickRange = {lat:0, lng:0};
	  this.finishGettingWaterData = false
  	//this.needToCalTGWater = true
  	this.timerWaterData = null

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
  	this.finishGettingWaterData = false

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
	// Calculate all displayed object
	//
	calDispObjects() {

		// calculate dispWater

		var localWater = this.tg.data.localWater
		this.dispWater = new Array(localWater.length)

		for(var i = 0; i < localWater.length; i++) {
			if (localWater[i].geotype == 'Polygon') {
				this.dispWater[i] = {'geotype':'Polygon', 
					'coordinates':new Array(localWater[i].coordinates.length)}

				for(var j = 0; j < localWater[i].coordinates.length; j++) {
					this.dispWater[i].coordinates[j] 
						= new Array(localWater[i].coordinates[j].length)

					for(var k = 0; k < localWater[i].coordinates[j].length; k++) {
						this.dispWater[i].coordinates[j][k] = new Array(2)
						this.dispWater[i].coordinates[j][k][0] 
							= localWater[i].coordinates[j][k].original.lng
						this.dispWater[i].coordinates[j][k][1]
							= localWater[i].coordinates[j][k].original.lat
					}
				}
			} 
			else if (this.noiWater[i].geotype == 'MultiPolygon') {

				this.dispWater[i] = {'geotype':'MultiPolygon', 
					'coordinates':new Array(localWater[i].coordinates.length)}

				for(var j = 0; j < localWater[i].coordinates.length; j++) {
					this.dispWater[i].coordinates[j] 
						= new Array(localWater[i].coordinates[j].length)

					for(var k = 0; k < localWater[i].coordinates[j].length; k++) {
						this.dispWater[i].coordinates[j][k] 
							= new Array(localWater[i].coordinates[j][k].length)

						for(var m = 0; m < localWater[i].coordinates[j][k].length; m++) {
							this.dispWater[i].coordinates[j][k][m] = new Array(2)
							this.dispWater[i].coordinates[j][k][m][0]
								= localWater[i].coordinates[j][k].original.lng
							this.dispWater[i].coordinates[j][k][m][1]
								= localWater[i].coordinates[j][k].original.lat
						}
					}
				}
			}
		}

		console.log(this.tg.data.localWater)
		//console.log(this.dispWater)

	}

	//
	// Redraw all layers of displayed elements
	//
	updateLayers() {
		if (this.dispWaterLayer) { 
			this.drawWaterDataLayer()
		}
		else {
			this.removeLayer(this.map.waterDataLayer)
			this.removeLayer(this.map.waterLayer)
			this.updateLayersNext()
		}
	}
		
	updateLayersNext() {

		// calculate all displayed objects (elements)
		this.calDispObjects()

		// display objects

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

		// temp

		var p1 = {lng:-122.312035, lat:47.658316}
		var p2 = {lng:-122.312035 + 0.017, lat:47.648316}

		var arr = []

		this.olFeaturesFromLineStrings(arr, p1.lng, p1.lat, p2.lng, p2.lat,
			this.lineStyleFunc(this.tg.opt.color.controlPointLine, 
				this.tg.opt.width.controlPointLine))

		this.olFeaturesFromPoints(arr, p1.lng, p1.lat, 
			this.nodeStyleFunc(this.tg.opt.color.node, this.tg.opt.radius.node))

		this.olFeaturesFromPoints(arr, p2.lng, p2.lat, 
			this.nodeStyleFunc(this.tg.opt.color.node, this.tg.opt.radius.node))

		var idx = 5
		var coord = this.dispWater[idx].coordinates
		console.log('idx = ' + idx)
		console.log(coord)

		var countIntersection = 0
		for(var i = 0; i < coord.length; i++) {
			for(var j = 0; j < coord[i].length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					coord[i][j][0], coord[i][j][1], 
					coord[i][j + 1][0], coord[i][j + 1][1],
					this.lineStyleFunc(this.tg.opt.color.controlPointLine, 
					this.tg.opt.width.controlPointLine))

				if (this.tg.util.intersects(
					p1.lat, p1.lng, p2.lat, p2.lng, 
        	coord[i][j][1], coord[i][j][0], coord[i][j + 1][1], coord[i][j + 1][0])) {
					countIntersection++
					console.log('found!')
				}
			}

		}

		console.log('count = ' + countIntersection)
        


		this.map.addLayer(this.olVectorFromFeatures(arr))


		console.log('updateLayers : ' + ((new Date()).getTime() - start) + 'ms')
	}

	//
	//
	//

	drawWaterDataLayer() {
		this.removeLayer(this.map.waterDataLayer)
		this.map.waterDataLayer = this.createWaterDataLayer()
	  this.map.addLayer(this.map.waterDataLayer)
	}

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
	 	})
	}

	nodeStyleFunc(color, radius) {
		return new ol.style.Style({
	    image: new ol.style.Circle({
	    	radius: radius,
	    	fill: new ol.style.Fill({
	      	color: color
	    	})
	    })
		})
	}

	polygonStyleFunc(color) {
		return new ol.style.Style({
	  	fill: new ol.style.Fill({
	    	color: color
	  	})
	 	})
	}

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
		var arr = []
		var feature

		//for(var i = 0; i < this.dispWater.length; i++) {
		var i = 5
		{
			if (this.dispWater[i].geotype == 'Polygon') {
				feature = new ol.Feature({
		      geometry: new ol.geom.Polygon(this.dispWater[i].coordinates)
		  	})
			} 
			else if (this.dispWater[i].geotype == 'MultiPolygon') {
				feature = new ol.Feature({
		      geometry: new ol.geom.MultiPolygon(this.dispWater[i].coordinates)
		  	})
			}

			feature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
			feature.setStyle(this.polygonStyleFunc(this.tg.opt.color.water))		
			arr.push(feature)
		}

		return new ol.layer.Vector({
			source: new ol.source.Vector({
		    features: arr
			})
		})
	}


	/*createWaterLayer2() {
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
	}*/

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
		var nodes = this.tg.data.controlPoints
		var arr = []
		var str = ''

		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
			//this.olFeaturesFromPoints(arr, nodes[i].travelLng, nodes[i].travelLat, 
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


	drawLineOfGrid(arr, pt1, pt2) {
		this.olFeaturesFromLineStrings(arr, 
			pt1.target.lng, pt1.target.lat, pt2.target.lng, pt2.target.lat, 
			this.lineStyleFunc(this.tg.opt.color.grid, this.tg.opt.width.grid))
	}

	createGridLayer() {
		var arr = []
		var grids = this.tg.data.grids

		for(var i = 0; i < grids.length; i++) {
			this.drawLineOfGrid(arr, grids[i].BL, grids[i].BR)
			this.drawLineOfGrid(arr, grids[i].BR, grids[i].TR)
			this.drawLineOfGrid(arr, grids[i].TR, grids[i].TL)
			this.drawLineOfGrid(arr, grids[i].TL, grids[i].BL)
		}
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

	//
	//
	//
	createWaterDataLayer() {
		this.tg.data.localWater = []

		var waterLayer = new ol.layer.Vector({
		  source: new ol.source.TileVector({
		    format: new ol.format.TopoJSON(),
		    projection: 'EPSG:3857',
		    tileGrid: new ol.tilegrid.XYZ({
		      maxZoom: 19
		    }),
		    url: 'http://{a-c}.tile.openstreetmap.us/' +
		        'vectiles-water-areas/{z}/{x}/{y}.topojson'
		  }),
		  style: this.addToLocalWater.bind(this)
		})
		return waterLayer
	}

	addToLocalWater(feature, resolution) {

		if (this.timerWaterData) clearInterval(this.timerWaterData)
		this.timerWaterData = setInterval(this.finishDraw.bind(this), 
			this.tg.opt.timeWaitForGettingWaterData);

		var kind = feature.get('kind') // ocean, water, riverbank, reservoir, ...
		var coords, obj
		
		if ((kind == 'reservoir')||(kind == 'water')) return null // skip reservoir, water

		if (feature.getGeometry().getType() == 'Polygon') {
			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326')

			coords = feature.getGeometry().getCoordinates()
			obj = {'geotype':'Polygon', 'coordinates':new Array(coords.length), 'in':false}

			for(var i = 0; i < coords.length; i++) {
				obj.coordinates[i] = new Array(coords[i].length)

				for(var j = 0; j < coords[i].length; j++) {
					obj.coordinates[i][j] = new Node(coords[i][j][1], coords[i][j][0])
					if (!obj.in) obj.in = this.isIn(coords[i][j][0], coords[i][j][1])
				}
			}
		}
		else if (feature.getGeometry().getType() == 'MultiPolygon') {
			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326')

			coords = feature.getGeometry().getCoordinates()
			obj = {'geotype':'MultiPolygon', 'coordinates':new Array(coords.length), 'in':false}

			for(var i = 0; i < coords.length; i++) {
				obj.coordinates[i] = new Array(coords[i].length)

				for(var j = 0; j < coords[i].length; j++) {
					obj.coordinates[i][j] = new Array(coords[i][j].length)

					for(var k = 0; k < coords[i][j].length; k++) {
						obj.coordinates[i][j][k] = new Node(coords[i][j][k][1], coords[i][j][k][0])
						if (!obj.in) obj.in = this.isIn(coords[i][j][k][0], coords[i][j][k][1])
					}
				}
			}
		}
		
		if (obj.in) {
			this.tg.data.localWater.push(obj)
			//console.log(coords)
		}
		else {
			console.log('in = false')
		}
		
		return null
	}

	isIn(lng, lat) {
	  return (lat > this.tg.opt.box.bottom)&&(lat < this.tg.opt.box.top)
	  	&&(lng > this.tg.opt.box.left)&&(lng < this.tg.opt.box.right)
	}

	finishDraw() {
		console.log('finish getting water data.')

		this.finishGettingWaterData = true
		clearInterval(this.timerWaterData)

		if (this.tg.data.localWater.length > 0) {

			//this.calTGWater(this.noiWater);
			console.log('go update layer next')
			this.updateLayersNext()
		} 
		
		//console.log('## total process time = ' + (new Date().getTime() - this.startTime1));
	}
}
