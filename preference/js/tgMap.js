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

		// modules

		this.mapUtil = new TGMapUtil(tg, this.olMap)
	  this.tgWater = new TGMapWater(tg, this.olMap, this.mapUtil)
	  this.tgRoads = new TGMapRoads(tg, this.olMap, this.mapUtil)
	  this.tgControl = new TGMapControl(tg, this.mapUtil)
	  this.tgLocs = new TGMapLocs(tg, this.olMap, this.mapUtil)
	  this.tgPlaces = new TGMapPlaces(tg, this.olMap, this.mapUtil);
	  this.tgLanduse = new TGMapLanduse(tg, this.olMap, this.mapUtil);
	  this.tgAux = new TGMapAux(tg, this.olMap, this.mapUtil)

	  // initialization

	  //this.tgWater.start();
	  this.tgRoads.start();
	  //this.tgPlaces.start();
	  //this.tgLanduse.start();

	  // variables

	  this.centerPosition = {}

	  this.dispGridLayer = true;
	  this.dispCenterPositionLayer = true;
	  this.dispControlPointLayer = false;
	  this.dispLocationLayer = false;
	  this.noIntersection = true;

	  this.currentMode = 'EM';
		this.currentZoom = this.olMap.getView().getZoom();
	  this.tgRoads.calDispRoadType(this.currentZoom);


	  this.clickRange = {lat:0, lng:0}

	  // Event Handlers
		this.olMap.on('moveend', this.onMoveEnd.bind(this));
		this.olMap.on('click', this.onClicked.bind(this));

		this.times = {};
		this.frame = 0; // [0 (EM), 10 (DC)]
		this.timerFrame = null;
		this.animationSpeed = 50; // ms
		this.tpsReady = false;

		this.displayString = 
				{roadLoadingTime: 'Road Loading:', 
				waterLoadingTime: 'Water Loading:', 
				landuseLoadingTime: 'Landuse Loading:', 
				placeLoadingTime: 'Place Loading:',
				travelTimeLoadingTime: 'Travel Time Loading:', 
				controlPointWarpingTime: 'Control Points Warping:',
				tpsCalculatingTime: 'TPS Calculating:',
				elementsWarpingTime: 'Elements Warping:',

				numRoadLoading: '# of Road:',
				numHighwayLoading: '# of Highway:',
        numPrimaryLoading: '# of Primary Road:',
        numSecondaryLoading: '# of Secondary Road:',
        numTertiaryLoading: '# of Tertiary Road:',
        numResidentialLoading: '# of Residential Road:',
				numWaterLoading: '# of Water Loading:',
				numLanduseLoading: '# of Landuse Loading:',
				numPlaceLoading: '# of Place Loading:',
				numNewTravelTime: '# of New Travel Time:',
			};

		this.resetTime();


	}

	debug() {
		//console.log(this.tgWater.waterLayer.getZIndex())
		//console.log(this.tgRoads.roadLayer.getZIndex())
		//console.log(this.tgControl.gridLayer.getZIndex())

		//console.log(this.tgRoads.dispRoads);
		//console.log(this.tgWater.dispWater);

		//tg.util.saveTextAsFile(this.tgRoads.dispRoads, 'dispRoads.json');
		//tg.util.saveTextAsFile(this.tgRoads.dispWater, 'dispWater.json');

		//console.log(this.olMap.getLayers().clear());
		this.tgRoads.clearLayers();
	}



	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {
		if (this.currentZoom != this.olMap.getView().getZoom()) {
	    this.currentZoom = this.olMap.getView().getZoom();
	    this.tgRoads.calDispRoadType(this.currentZoom);
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
		this.tpsReady = false;
		this.resetTime();
		this.resetDataInfo();
		this.calBoundaryBox();
		this.tgRoads.clearLayers();
//		console.log('removed all.');

	  this.tgControl.calculateControlPoints(() => {


	  	//this.tgLocs.calLocalLocations();

		  //if (this.tgRoads.roadLayer.motorway) {
		  //	this.tgRoads.setVisibleByCurrentZoom(this.currentZoom);
		  //}

		  if (this.tgPlaces.placesLayer[this.tg.opt.minZoom]) {
		  	this.tgPlaces.setVisibleByCurrentZoom(this.currentZoom);
		  }

		  if (this.currentMode === 'DC') {
		  	this.currentMode = 'EM';
		  	this.initElements();
		  	this.goToDc();
		  }
		  else if (this.currentMode === 'EM') {
		  	this.tgControl.calDispNodes('original');
		  }

			this.tgAux.drawCenterPositionLayer();

		  this.updateLayers();
			this.dispMapInfo();

	  });	  

	  this.tgRoads.calDispRoads();
	  //this.tgRoads.updateDispRoads();
		this.tgRoads.addRoadLayer();

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

  setCenterUserPosition() {
		if (!navigator.geolocation) {
	    alert('Geolocation is not supported by this browser.');
	    return;
	  }
	  navigator.geolocation.getCurrentPosition(saveCurrentLatLng.bind(this));

	  function saveCurrentLatLng(position) {
	  	this.setCenter(position.coords.latitude, position.coords.longitude);
	  }
  }

  setArea(area) {
		this.setCenter(this.tg.opt.center[area].lat, this.tg.opt.center[area].lng);
	}

	setCenter(lat, lng) {
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]))
		this.centerPosition.lng = lng
		this.centerPosition.lat = lat
		this.tgControl.setCenterPosition(lat, lng);
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

		if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
			if (this.currentMode === 'EM') this.tgControl.calDispNodes('original');
			else if (this.currentMode === 'DC') {
				if (this.noIntersection) this.tgControl.calDispNodes('real');
				else this.tgControl.calDispNodes('target');
			}
		}

	  if (this.dispGridLayer) this.tgControl.drawGridLayer()
		else this.tgControl.removeGridLayer()

		if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer()
		else this.tgControl.removeControlPointLayer()

		/*if (this.dispCenterPositionLayer) this.tgAux.drawCenterPositionLayer()
		else this.tgAux.removeCenterPositionLayer()*/

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

	goToEm() {
		if (this.currentMode === 'EM') return;

  	//this.tgPlaces.calDispNodes('original');
  	//this.tgPlaces.calDispPlaces(true);

  	//this.tgLanduse.calDispNodes('original');
  	//this.tgLanduse.calDispLanduse(true);

		//this.initElements();
		//this.updateLayers();

		this.timerFrame = 
				setInterval(this.moveElementsByFrame.bind(this, 'backward'), this.animationSpeed);

		this.currentMode = 'EM';
	}

	goToDc() {
		if (this.currentMode === 'DC') return;

		if (!this.tpsReady) {
			// cal warping
			this.tg.graph.calWarping();
			//if (this.noIntersection) {
			this.tgControl.makeNonIntersectedGrid();
			//}

			// tps calculation
			this.tg.graph.TPSSolve();
			if (this.tg.graph.TPSTest()) {
				console.log('TPS complete.');
				this.tpsReady = true;
			}
			else console.log('TPS failed...');

			
		}

		if (this.noIntersection) {
			this.tgWater.calRealNodes();
	  	this.tgRoads.calRealNodes();
	  	this.tgPlaces.calRealNodes();
	  	this.tgLanduse.calRealNodes();
		}
		else {
			this.tgWater.calTargetNodes();
	  	this.tgRoads.calTargetNodes();
	  	this.tgPlaces.calTargetNodes();
	  	this.tgLanduse.calTargetNodes();
		}

		this.timerFrame = 
				setInterval(this.moveElementsByFrame.bind(this, 'forward'), this.animationSpeed);

		this.currentMode = 'DC';
	}

	moveElementsByFrame(direction) {
		this.setTime('elementsWarping', 'start', (new Date()).getTime());
		this.frame += 1;

		let value;
		if (direction === 'forward') value = this.frame * 0.1;
		else if (direction === 'backward') value = 1 - (this.frame * 0.1);

		let intermediate;
		if (this.noIntersection) intermediate = 'intermediateReal';
		else intermediate = 'intermediateTarget';

		this.tgWater.calDispNodes(intermediate, value);
		this.tgWater.updateDispWater();
		this.tgWater.addWaterLayer();

		this.tgRoads.clearLayers();
		this.tgRoads.calDispNodes(intermediate, value);
  	this.tgRoads.updateDispRoads();
  	this.tgRoads.addRoadLayer();

  	this.tgPlaces.calDispNodes(intermediate, value);
  	this.tgPlaces.updateDispPlaces(true);
  	this.tgPlaces.addPlacesLayer();

  	this.tgLanduse.calDispNodes(intermediate, value);
  	this.tgLanduse.updateDispLanduse(true);
  	this.tgLanduse.addLanduseLayer();

  	if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
  		this.tgControl.calDispNodes(intermediate, value);

  		if (this.dispGridLayer) this.tgControl.drawGridLayer();
  		if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer();
  	}
  	

  	this.setTime('elementsWarping', 'end', (new Date()).getTime());

		if (this.frame >= 10) {
			this.frame = 0;
			clearInterval(this.timerFrame);
			this.updateLayers();
		} 
	}

	/*moveElements() {
  	this.tgWater.calRealNodes();
  	this.tgWater.calDispNodes('real');
  	this.tgWater.updateDispWater();
  	this.tgWater.addWaterLayer();

  	this.tgRoads.calRealNodes();
  	this.tgRoads.calDispNodes('real');
  	this.tgRoads.updateDispRoads();
  	this.tgRoads.addRoadLayer();

  	this.tgPlaces.calRealNodes();
  	this.tgPlaces.calDispNodes('real');
  	this.tgPlaces.updateDispPlaces();
  	this.tgPlaces.addPlacesLayer();

  	this.tgLanduse.calRealNodes();
  	this.tgLanduse.calDispNodes('real');
  	this.tgLanduse.updateDispLanduse();
  	this.tgLanduse.addLanduseLayer();
	}*/

	initElements() {
  	this.tgWater.calDispNodes('original');
  	this.tgWater.updateDispWater();
  	this.tgWater.addWaterLayer();

  	this.tgRoads.calDispNodes('original');
  	this.tgRoads.updateDispRoads();
  	this.tgRoads.addRoadLayer();

  	this.tgPlaces.calDispNodes('original');
  	this.tgPlaces.updateDispPlaces();
  	this.tgPlaces.addPlacesLayer();

  	this.tgLanduse.calDispNodes('original');
  	this.tgLanduse.updateDispLanduse();
  	this.tgLanduse.addLanduseLayer();

  	this.tgControl.calDispNodes('original');
	}

	resetTime() {
		const currentTime = (new Date()).getTime();
		this.times = 
				{roadLoading: {start:currentTime, end:currentTime}, 
				waterLoading: {start:currentTime, end:currentTime},
				landuseLoading: {start:currentTime, end:currentTime},
				placeLoading: {start:currentTime, end:currentTime},
				travelTimeLoading: {start:0, end:0},
				controlPointWarping: {start:0, end:0},
				tpsCalculating: {start:0, end:0},
				elementsWarping: {start:0, end:0},
			};

		for(let time in this.times) {
			$('#' + time + 'Time').html(this.displayString[time + 'Time'] + ' - ms');
		}

		/*$('#roadLoadingTime').html(this.displayString.roadLoadingTime + ' - ms');
		$('#waterLoadingTime').html(this.displayString.waterLoadingTime + ' - ms');
		$('#landuseLoadingTime').html(this.displayString.landuseLoadingTime + ' - ms');
		$('#placeLoadingTime').html(this.displayString.placeLoadingTime + ' - ms');
		$('#travelTimeLoadingTime').html(this.displayString.travelTimeLoadingTime + ' - ms');
		$('#controlPointWarpingTime').html(this.displayString.controlPointWarpingTime + ' - ms');
		$('#tpsCalculatingTime').html(this.displayString.tpsCalculatingTime + ' - ms');
		$('#elementsWarpingTime').html(this.displayString.elementsWarpingTime + ' - ms');*/
	}

	resetDataInfo() {
		this.dataInfo = 
				{numRoadLoading: 0, numHighwayLoading: 0, numPrimaryLoading: 0,
					numSecondaryLoading: 0, numTertiaryLoading: 0, numResidentialLoading: 0,
					numWaterLoading: 0, numLanduseLoading: 0,
					numPlaceLoading: 0, numNewTravelTime: 0,
				}; 

		for(let info in this.dataInfo) {
			$('#' + info).html(this.displayString[info] + ' -');
		}
	}

	setTime(type, se, time) {
		this.times[type][se] = time;

		if (se === 'end') {
			let str = this.displayString[type + 'Time'];
			str += ' ' + (this.times[type].end - this.times[type].start) + ' ms';
			$('#' + type + 'Time').html(str);			
		}
	}

	setDataInfo(type, action, value) {
		switch(action) {
			case 'increase' :
				this.dataInfo[type]++;
			break; 
			case 'set' :
				this.dataInfo[type] = value;
			break;
		}

		const str = this.displayString[type] + ' ' + this.dataInfo[type];
		$('#' + type).html(str);

	}

}
