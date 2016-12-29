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
		this.mapUtil = new TGMapUtil(tg, this.map)
	  this.tgWater = new TGMapWater(tg, this.map, this.mapUtil)
	  this.tgRoads = new TGMapRoads(tg, this.map, this.mapUtil)

	  this.tgWater.start()
	  //this.tgRoads.start()



	  this.dispCenterPositionLayer = true;
	  this.dispControlPointLayer = false;
	  this.dispGridLayer = false;
	  this.dispLocationLayer = false;



	  // Variables for others

		this.currentZoom = this.map.getView().getZoom()
	  this.clickRange = {lat:0, lng:0}

	  // Event Handlers

		this.map.on('moveend', this.onMoveEnd.bind(this));
		this.map.on('click', this.onClicked.bind(this));
	}



	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {
		if (this.currentZoom != this.map.getView().getZoom()) {
	    this.currentZoom = this.map.getView().getZoom()
	    console.log('zoomEnd')
	  }
	  else {
	    console.log('centerEnd')
	  }
		this.recalculateAndDraw()
	}

	//
	// Recalculate information changed according to the interaction and draw it
	//
	recalculateAndDraw() {
		console.log('recalculateAndDraw')
		this.tgWater.resetTimes()
		this.tgRoads.resetTimes()
		this.calBoundaryBox()

	  //this.tg.data.initGrids()
	  //this.tg.data.setTravelTime()
	  //this.tg.data.calLocalNodesRoads()
	  //this.tg.data.calLocalLocations()
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

  	/*this.clickRange = {
  		lat: height * this.tg.opt.constant.clickSensibility, 
  		lng: width * this.tg.opt.constant.clickSensibility
  	}*/
	}


	//
	// Redraw all layers of displayed elements
	//		
	updateLayers() {

		// display objects

		var start = (new Date()).getTime()



		if (this.dispGridLayer) this.drawGridLayer()
		else this.removeLayer(this.map.gridLayer)

		if (this.dispControlPointLayer) this.drawControlPointLayer()
		else this.removeLayer(this.map.controlPointLayer)

		if (this.dispLocationLayer) this.drawLocationLayer()
		else this.removeLayer(this.map.locationLayer)

		if (this.dispCenterPositionLayer) this.addCenterPositionLayer()
		else this.removeLayer(this.map.centerPositionLayer) 


		

	/*

		var p1 = {lng:-122.312035, lat:47.658316}
		var p2 = {lng:-122.312035 + 0.017, lat:47.648316}

		var arr = []

		this.olFeaturesFromLineStrings(arr, p1.lng, p1.lat, p2.lng, p2.lat,
			this.mapUtil.lineStyleFunc(this.tg.opt.color.controlPointLine, 
				this.tg.opt.width.controlPointLine))

		this.olFeaturesFromPoints(arr, p1.lng, p1.lat, 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.node, this.tg.opt.radius.node))

		this.olFeaturesFromPoints(arr, p2.lng, p2.lat, 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.node, this.tg.opt.radius.node))

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
					this.mapUtil.lineStyleFunc(this.tg.opt.color.controlPointLine, 
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
		*/

		console.log('updateLayers : ' + ((new Date()).getTime() - start) + 'ms')
	}

	//
	/*setVisiblityByZoom() {
		console.log('--- set visibility')
		//var roadTypes = ['primary', 'secondary', 'tertiary']
		for(var t = 0; t < this.roadTypes.length; t++) {
			if(this.tg.opt.dispZoom[this.roadTypes[t]].minZoom > this.currentZoom) {
				for(var i = 0; i < this.dispRoads[this.roadTypes[t]].length; i++) {
					this.roadObject[this.roadTypes[t]][i].visible = false
				}
			}
			else {
				this.roadObject[this.roadTypes[t]][i].visible = true
			}
		}
	}*/

	//
	//
	//


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
		})
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



	addCenterPositionLayer() {
		var arr = []

		this.mapUtil.removeLayer(this.map.centerPositionLayer)

		this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.tg.data.centerPosition.lng, this.tg.data.centerPosition.lat]), 
			this.mapUtil.imageStyleFunc(this.tg.opt.image.center))

		this.map.centerPositionLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.map.centerPositionLayer.setZIndex(this.tg.opt.z.centerPosition)
	  this.map.addLayer(this.map.centerPositionLayer)
	}

	createControlPointLayer() {
		var nodes = this.tg.data.controlPoints
		var arr = []
		var str = ''

		for(var i = 0; i < nodes.length; i++) {
			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
			//this.olFeaturesFromPoints(arr, nodes[i].travelLng, nodes[i].travelLat, 
				this.mapUtil.nodeStyleFunc(this.tg.opt.color.controlPoint, this.tg.opt.radius.controlPoint))

			if ((nodes[i].target.lng != nodes[i].original.lng) || (nodes[i].target.lat != nodes[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[i].original.lng, nodes[i].original.lat, nodes[i].target.lng, nodes[i].target.lat,
					this.mapUtil.lineStyleFunc(this.tg.opt.color.controlPointLine, this.tg.opt.width.controlPointLine))
			}

			str = nodes[i].travelTime

			this.olFeaturesFromPoints(arr, nodes[i].target.lng, nodes[i].target.lat, 
				this.mapUtil.textStyleFunc(str, this.tg.opt.color.text, this.tg.opt.font.text))
		}
		return this.olVectorFromFeatures(arr);
	}


	drawLineOfGrid(arr, pt1, pt2) {
		this.olFeaturesFromLineStrings(arr, 
			pt1.target.lng, pt1.target.lat, pt2.target.lng, pt2.target.lat, 
			this.mapUtil.lineStyleFunc(this.tg.opt.color.grid, this.tg.opt.width.grid))
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
				this.mapUtil.nodeStyleFunc(this.tg.opt.color.location, this.tg.opt.radius.location));
				//this.mapUtil.imageStyleFunc(this.tg.opt.image.location));

			if ((nodes[i].target.lng != nodes[i].original.lng) 
				|| (nodes[i].target.lat != nodes[i].original.lat)) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[i].original.lng, nodes[i].original.lat,
					nodes[i].target.lng, nodes[i].target.lat,
					this.mapUtil.lineStyleFunc(this.tg.opt.color.locationLine, this.tg.opt.width.locationLine));
			}
		}
		return this.olVectorFromFeatures(arr);
	}

}
