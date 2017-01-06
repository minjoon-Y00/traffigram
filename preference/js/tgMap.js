class TGMap {
	
	constructor(tg, map_id) {
		this.tg = tg
		this.olMap = new ol.Map({
	    target: map_id,
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([0,0]),
	      maxZoom: this.tg.opt.maxZoom, //18,
	    	minZoom: this.tg.opt.minZoom, //10,
	    	zoom: this.tg.opt.zoom //10
	    })
	  })


		this.mapUtil = new TGMapUtil(tg, this.olMap)
	  this.tgWater = new TGMapWater(tg, this.olMap, this.mapUtil)
	  this.tgRoads = new TGMapRoads(tg, this.olMap, this.mapUtil)
	  this.tgGrid = new TGMapGrid(tg, this.olMap, this.mapUtil)
	  this.tgLocs = new TGMapLocs(tg, this.olMap, this.mapUtil)
	  this.tgAux = new TGMapAux(tg, this.olMap, this.mapUtil)

	  this.tgWater.start()
	  //this.tgRoads.start()
	  
	  this.controlPoints = []
	  this.centerPosition = {}

	  this.dispGridLayer = true
	  this.dispCenterPositionLayer = false
	  this.dispControlPointLayer = true
	  this.dispLocationLayer = false

		this.currentZoom = this.olMap.getView().getZoom()
	  this.clickRange = {lat:0, lng:0}

	  // Event Handlers

		this.olMap.on('moveend', this.onMoveEnd.bind(this));
		this.olMap.on('click', this.onClicked.bind(this));
	}

	debug() {
		console.log(this.tgWater.waterLayer.getZIndex())
		//console.log(this.tgRoads.roadLayer.getZIndex())
		console.log(this.tgGrid.gridLayer.getZIndex())
	}



	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {
		if (this.currentZoom != this.olMap.getView().getZoom()) {
	    this.currentZoom = this.olMap.getView().getZoom()
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
	  this.tgGrid.initGrids()
	  this.tgLocs.calLocalLocations()

	  //this.tg.data.setTravelTime()
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
	}

  dispMapInfo() {

  	// map level and center position
  	var centerLat = (this.tg.opt.box.top + this.tg.opt.box.bottom)/2
		var centerLng = (this.tg.opt.box.left + this.tg.opt.box.right)/2
  	var str = 'Map Level (' + this.currentZoom 
  		+ '), Center (' + centerLat.toPrecision(8) + ', ' + centerLng.toPrecision(9) + ')'
  	$("#mapInfo1").text(str)

  	/*
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
		*/
  }

	setCenter(lat, lng) {
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]))
		this.centerPosition.lng = lng
		this.centerPosition.lat = lat
	}

	setZoom(zoom) {
		this.olMap.getView().setZoom(zoom)
	}

	calBoundaryBox() {
		var extent = this.olMap.getView().calculateExtent(this.olMap.getSize())
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
		var s = (new Date()).getTime()

	  if (this.dispGridLayer) this.tgGrid.drawGridLayer()
		else this.tgGrid.removeGridLayer()

		if (this.dispControlPointLayer) this.tgAux.drawControlPointLayer()
		else this.tgAux.removeControlPointLayer()

		if (this.dispCenterPositionLayer) this.tgAux.drawCenterPositionLayer()
		else this.tgAux.removeCenterPositionLayer()

		if (this.dispLocationLayer) this.tgLocs.drawLocationLayer()
		else this.tgLocs.removeLocationLayer()

		console.log('updateLayers : ' + ((new Date()).getTime() - s) + 'ms')
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

}
