class TGMap {
	constructor(tg, map_id) {
		this.tg = tg;
		this.olMap = new ol.Map({
	    target: map_id,
	    //controls: [],
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([0,0]),
	      maxZoom: this.tg.opt.maxZoom, //18,
	    	minZoom: this.tg.opt.minZoom, //10,
	    	zoom: this.tg.opt.zoom, //10
	    })
	  });

	  this.olMap.getInteractions().forEach((interaction) => {
		  if (interaction instanceof ol.interaction.DragPan) {
		  	this.olMap.dragPan = interaction;
		  }
		}, this);

	  this.checkParameters();

		// modules

		this.mapUtil = new TGMapUtil(tg, this.olMap);
	  this.tgWater = new TGMapWater(tg, this.mapUtil);
	  this.tgRoads = new TGMapRoads(tg, this.mapUtil);
	  this.tgLanduse = new TGMapLanduse(tg, this.mapUtil);
	  this.tgLocs = new TGMapLocs(tg, this.mapUtil)

	  this.tgControl = new TGMapControl(tg, this.mapUtil)
	  this.tgPlaces = new TGMapPlaces(tg, this.olMap, this.mapUtil);
	  //this.tgAux = new TGMapAux(tg, this.olMap, this.mapUtil);
	  this.tgBB = new TGMapBoundingBox(tg, this.olMap, this.mapUtil);
	  this.tgOrigin = new TGMapOrigin(tg, this.mapUtil);
	  this.tgIsochrone = new TGMapIsochrone(tg, this.mapUtil);

	  // initialization

	  this.tgWater.init();
	  this.tgRoads.init();
	  this.tgLanduse.init();
	  this.tgPlaces.start();

	  // variables

	  //this.tgBB.turn(true);

	  this.tgWater.turn(true);
	  $('#dispWaterCB').prop('checked', true);
	  this.tgRoads.turn(true);
	  $('#dispRoadsCB').prop('checked', true);
	  this.tgLanduse.turn(true);
	  $('#dispLanduseCB').prop('checked', true);
	  this.tgLocs.turn(true);
	  $('#dispLocationCB').prop('checked', true);

	  this.tgOrigin.turn(true);
	  $('#dispOriginCB').prop('checked', true);

	  this.tgIsochrone.turn(true);
	  $('#dispIsochroneCB').prop('checked', true);

	  //this.origin = {};
	  this.originChanged = false;

	  this.dispGridLayer = false;
	  //this.dispCenterPositionLayer = true;
	  this.dispControlPointLayer = false;
	  this.dispIsochroneLayer = true;
	  this.warpingMode = 'shapePreserving'; //'none';
	  this.needToCalWarping = false;
	  this.dispWaterNodeLayer = false;
	  this.dispRoadNodeLayer = false;
	  this.dispPlaceLayer = false;
	  this.dispLanduseNodeLayer = false;
	  this.dispLocationNameLayer = true;

	  this.currentMode = 'EM';
		this.currentZoom = this.olMap.getView().getZoom();
	  this.tgRoads.updateDisplayedRoadType(this.currentZoom);

  	this.olMapHeightPX = $('#ol_map').css('height'); 
  	this.olMapHeightPX = 
  			Number(this.olMapHeightPX.slice(0, this.olMapHeightPX.length - 2)); // 900
  	this.olMapWidthPX = $('#ol_map').css('width');  
  	this.olMapWidthPX = 
  			Number(this.olMapWidthPX.slice(0, this.olMapWidthPX.length - 2)); // 600

	  this.clickRange = {lat:0, lng:0};

	  // Event Handlers
		this.olMap.on('moveend', this.onMoveEnd.bind(this));
		this.olMap.on('click', this.onClicked.bind(this));

		this.times = {};
		this.tempTimes = {};
		this.frame = 0; // [0 (EM), 10 (DC)]
		this.timerFrame = null;
		this.animationSpeed = 50; // ms
		this.tpsReady = false;
		this.requestLocations = true;
		this.timerCheckGridSplitInTgMap = null;

		this.readyControlPoints = false;

		this.displayString = 
				{roadLoadingTime: 'Road Loading:', 
				waterLoadingTime: 'Water Loading:', 
				landuseLoadingTime: 'Landuse Loading:', 
				placeLoadingTime: 'Place Loading:',
				travelTimeLoadingTime: 'Travel Time Loading:', 
				locationLoadingTime: 'Location Loading:', 
				controlPointWarpingTime: 'Control Points Warping:',
				tpsCalculatingTime: 'TPS Calculating:',
				elementsWarpingTime: 'Elements Warping (avg):',
				waterWarpingTime: 'Water Warping (avg):',
				roadWarpingTime: 'Road Warping (avg):',
				placeWarpingTime: 'Place Warping (avg):',
				landuseWarpingTime: 'Landuse Warping (avg):',
				etcWarpingTime: 'Etc Warping (avg):',

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
		this.resetTempTime();

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
		//this.tgRoads.clearLayers();

		//this.tgWater.isPointInWater();
		//this.tgWater.arePointsInWater();

		/*console.log('# of road node: ');
		console.log(this.tgRoads.calNumberOfNode());
		console.log('# of water node: ');
		console.log(this.tgWater.calNumberOfNode());
		console.log('# of landuse node: ');
		console.log(this.tgLanduse.calNumberOfNode());
		*/

		//this.tgBB.repositionElements();
		//console.log(this.calMaxDistance('lat'));
		//console.log(this.calMaxDistance('lng'));
	}

	debug2() {
		//this.tgBB.repositionPlaces();
	}


	checkParameters() {
	  if ((params.simplify)&&(params.simplify === 'false')) {
	  	this.simplify = false;
	  	console.log('no simplification.');
	  }
	  else {
	  	this.simplify = true;
	  	//this.simplify = false;
	  }

	  if (params.spThreshold) {
	  	this.tg.opt.constant.shapePreservingDegree = Number(params.spThreshold);
	  	console.log('spThreshold: ' + Number(params.spThreshold));
	  }

	  if (params.maxSplitLevel) {
	  	this.tg.opt.constant.maxSplitLevel = Number(params.maxSplitLevel);
	  	console.log('maxSplitLevel: ' + Number(params.maxSplitLevel));
	  }
	}





	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {
		if (this.currentZoom != this.olMap.getView().getZoom()) {
	    this.currentZoom = this.olMap.getView().getZoom();
	    this.tgRoads.updateDisplayedRoadType(this.currentZoom);
	    this.requestLocations = true;
	    console.log('zoomEnd');

	    this.tgLocs.initLocations();
	  }
	  else {
	    console.log('centerEnd');
	  }
		this.recalculateAndDraw();
	}

	//
	// Recalculate information changed according to the interaction and draw it
	//
	recalculateAndDraw() {

		this.tpsReady = false;
		this.resetTime();
		this.resetDataInfo();
		this.calBoundaryBox();

	  this.tgRoads.calDispRoads();
		this.tgWater.calDispWater();
		this.tgLanduse.calDispLanduse();




		if (this.currentMode === 'DC') {
			this.dispNodesOfallElementsAreOriginal();
			//this.tgRoads.discard();
			//this.tgWater.discard();
			//this.tgLanduse.discard();

			this.tgLocs.discard();
			this.tgOrigin.discard();
			this.tgIsochrone.discard();
		}
		else {
			this.tgRoads.render();
			this.tgWater.render();
			this.tgLanduse.render();
		}

		

		if (this.originChanged) {
			this.tgBB.addOriginToBB();
			this.originChanged = false;
		}

		if (this.requestLocations) {
			this.tgLocs.request();
			this.requestLocations = false;
		}

		this.readyControlPoints = false;
		this.disableSGapAndGapButtons(true);

	  this.tgControl.calculateControlPoints(() => {

	  	console.log('received: control points.');

	  	this.timerCheckGridSplitInTgMap = 
				setTimeout(
						this.calSplittedGrid.bind(this), 
						this.tg.opt.constant.timeToWaitForFinishGettingWaterData);


			

		  if (this.currentMode === 'DC') {
		  	//if (this.tgLocs.readyLocs) this.goToDcAgain();
		  	//this.goToDcAgain();
		  }
		  else if (this.currentMode === 'EM') {
		  	this.tgControl.calDispNodes('original');
		  }

		  this.updateLayers();
			this.dispMapInfo();

	  });	






		if (this.dispPlaceLayer) {
			this.tgPlaces.clearLayers();
			this.tgPlaces.calDispPlace();
			this.tgPlaces.addPlaceLayer();
		}


	}

	changeTransportType(type) {
		if (this.tgControl.currentTransport === type) return;

		this.disableSGapAndGapButtons(true);

		this.tgControl.currentTransport = type;
		this.tgControl.getTravelTimeOfControlPoints(() => {

			this.disableSGapAndGapButtons(false);

			if (this.currentMode === 'DC') {
				this.goToDcAgain(false);
				//this.goToDcAgain(true);
			}


			/*
			if (this.currentMode === 'EM') {
		  	this.tgControl.calDispNodes('original');
		  }

		  this.updateLayers();
			this.dispMapInfo();
			*/

		});
	}

	goToDcAgain(noNeedToCalFactor = false) {
		this.frame = 0;
		this.moveElementsByValue('intermediateReal', 0.0, false);
		this.currentMode = 'EM';
		/*
		this.tgBB.cleanBB();
		this.tgBB.addBBOfLocations();
		this.tgLocs.dispNameLayer = true;
		this.tgLocs.updateNonOverlappedLocationNames();
		this.tgLocs.render();
		this.tgBB.render();
		*/
		this.goToDc(false, noNeedToCalFactor);

		if (this.tgLocs.needToDisplayLocs) {
			this.tgLocs.displayLocsInDc();
			this.tgLocs.needToDisplayLocs = false;
		}
	}

	calSplittedGrid() {
		this.tgControl.currentSplitLevel = 0;
		this.tgWater.checkPointsInWater(this.tgControl.controlPoints);
		this.tgControl.checkGridSplit();
	}




	//
	// When mouse button is clicked
	//
	onClicked(e) {
		const pt = 
				ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
		this.tgLocs.showModal(pt[1], pt[0]); // lat, lng
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
  	this.originChanged = true;
		this.setCenter(this.tg.opt.center[area].lat, this.tg.opt.center[area].lng);
	}

	setCenter(lat, lng) {
		this.requestLocations = true;
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.tgOrigin.setOrigin(lat, lng);
		this.tgControl.setOrigin(lat, lng);
		this.tgOrigin.render();
	}

	setZoom(zoom) {
		this.olMap.getView().setZoom(zoom);
	}

	zoomIn() {
		this.setZoom(this.currentZoom + 1);
	}

	zoomOut() {
		this.setZoom(this.currentZoom - 1);
	}

	calBoundaryBox() {
	  const opt = this.tg.opt;
		const extent = this.olMap.getView().calculateExtent(this.olMap.getSize());
	  const bottomLeft = 
	  		ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
	  const topRight = 
	  		ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

	  opt.box.left = bottomLeft[0];
	  opt.box.bottom = bottomLeft[1];
	  opt.box.right = topRight[0];
	  opt.box.top = topRight[1];

  	opt.variable.latPerPx = (opt.box.top - opt.box.bottom) / this.olMapHeightPX;
  	opt.variable.lngPerPx = (opt.box.right - opt.box.left) / this.olMapWidthPX;

  	opt.variable.latMargin = 
  			(opt.box.top - opt.box.bottom) * (opt.constant.marginPercent * 0.01);
		opt.variable.lngMargin = 
  			(opt.box.right - opt.box.left) * (opt.constant.marginPercent * 0.01);
	}


	//
	// Redraw all layers of displayed elements
	//		
	updateLayers() {
		var s = (new Date()).getTime();

		if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
			if (this.currentMode === 'EM') this.tgControl.calDispNodes('original');
			else if (this.currentMode === 'DC') {
				if (this.warpingMode === 'none') this.tgControl.calDispNodes('target');
				else this.tgControl.calDispNodes('real');
			}
		}

		if (this.dispPlaceLayer) {
			this.tgPlaces.calDispPlace();
			this.tgPlaces.addPlaceLayer();
		}
		else this.tgPlaces.clearLayers();

		//if (this.dispWaterNodeLayer) this.tgWater.addWaterNodeLayer();
		//else this.tgWater.removeWaterNodeLayer();

		//if (this.dispRoadNodeLayer) this.tgRoads.addNodeLayer();
		//else this.tgRoads.removeNodeLayer();

		//if (this.dispLanduseNodeLayer) this.tgLanduse.addLanduseNodeLayer();
		//else this.tgLanduse.removeLanduseNodeLayer();

	  if (this.dispGridLayer) this.tgControl.drawGridLayer()
		else this.tgControl.removeGridLayer()

		if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer()
		else this.tgControl.removeControlPointLayer()

		//if (this.dispCenterPositionLayer) this.tgAux.drawCenterPositionLayer()
		//else this.tgAux.removeCenterPositionLayer();

		//if (this.dispLocationLayer) this.tgLocs.drawLocationLayer()
		//else this.tgLocs.removeLocationLayer();

		//if (this.dispLocationNameLayer) this.tgLocs.drawLocationNameLayer()
		//else this.tgLocs.removeLocationNameLayer();

		//if (this.dispIsochroneLayer) this.tgAux.drawIsochroneLayer();
		//else this.tgAux.removeIsochroneLayer();

		//this.tgOrigin.render();
		this.tgBB.render();

		console.log('updateLayers : ' + ((new Date()).getTime() - s) + 'ms')
	}

	goToEm(animation = true) {
		if (this.currentMode === 'EM') return;

		if (animation) {
			this.timerFrame = 
					setInterval(this.goToEmByFrame.bind(this), this.animationSpeed);
		}
		else {
			this.frame = 0;
			this.moveElementsByValue('intermediateReal', 0.0);
			this.reachEm();
		}
	}

	goToDc(animation = true, noNeedToCalFactor = false) {
		//if (this.currentMode === 'DC') return;

		//if ((this.needToCalWarping)||(!this.tpsReady)) {
		// cal warping
		this.tg.graph.calWarping(noNeedToCalFactor);

		if (this.warpingMode === 'noIntersection') {
			this.tgControl.makeNonIntersectedGrid();
		}
		else if (this.warpingMode === 'shapePreserving') {
			this.tgControl.makeShapePreservingGridByFFT();
		}

		// tps calculation
		this.tg.graph.TPSSolve();

		if (this.tg.graph.TPSTest()) {
			console.log('complete: TPS(' + parseInt(this.tg.graph.factor) + ')');
			this.tpsReady = true;

			// TODO: if locations are not ready...
		}
		else {
			//console.log('fail: TPS...');
			alert('fail: TPS...');
		}
		//this.needToCalWarping = false;

		this.tgLocs.calTargetNodes();

		if (this.warpingMode === 'none') {
			this.tgWater.calTargetNodes();
	  	this.tgRoads.calTargetNodes();
	  	this.tgPlaces.calTargetNodes();
	  	this.tgLanduse.calTargetNodes();
	  	this.tgOrigin.calTargetNodes();
		}
		else {
			this.tgWater.calRealNodes();
	  	this.tgRoads.calRealNodes();
	  	this.tgPlaces.calRealNodes();
	  	this.tgLanduse.calRealNodes();
	  	this.tgLocs.calRealNodes();
	  	this.tgOrigin.calRealNodes();
		}

		if (animation) {
			this.timerFrame = 
					setInterval(this.goToDcByFrame.bind(this), this.animationSpeed);
		}
		else {
			this.frame = 10;
			this.moveElementsByValue('intermediateReal', 1.0);
			this.reachDc();
		}
	}

	moveElementsByValue(intermediate, value, render = true) {
		this.tgWater.calDispNodes(intermediate, value);
		this.tgRoads.calDispNodes(intermediate, value);
  	this.tgLanduse.calDispNodes(intermediate, value);
  	this.tgOrigin.calDispNodes(intermediate, value);
		this.tgLocs.calDispNodes(intermediate, value);

		if (render) {
			this.tgWater.render();
			this.tgRoads.render();
  		this.tgLanduse.render();
  		this.tgOrigin.render();
			this.tgLocs.render();
		}

		if (this.dispPlaceLayer) {
			this.tgPlaces.clearLayers();
	  	this.tgPlaces.calDispNodes(intermediate, value);
	  	this.tgPlaces.updateDispPlaces(true);
	  	this.tgPlaces.addPlaceLayer();
	  }


		

  	if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
  		this.tgControl.calDispNodes(intermediate, value);

  		if (this.dispGridLayer) this.tgControl.drawGridLayer();
  		if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer();
  	}
	}

	goToDcByFrame() {
		this.frame += 1;
		const value = this.frame * 0.1;
		this.moveElementsByValue('intermediateReal', value);

		if (this.frame < 10) {
			// intermediate mode
			this.betweenDcAndEm();
		}
		else {
			// completely go to dc mode
			this.reachDc();
		}
	}

	goToEmByFrame() {
		this.frame -= 1;
		const value = this.frame * 0.1;
		this.moveElementsByValue('intermediateReal', value);

		if (this.frame > 1) {
			// intermediate mode
			this.betweenDcAndEm();
		}
		else {
			// completely go to em mode
			this.reachEm();
		}
	}

	betweenDcAndEm() {
		this.currentMode = 'INTERMEDIATE';
		this.tgIsochrone.disabled(true);
		this.tgIsochrone.render();
		this.tgLocs.dispNameLayer = false;
		this.tgLocs.removeNameLayer();
		this.tgLocs.render();
	}

	reachDc() {
		console.log('@reach DC');
		this.currentMode = 'DC';
		this.tgIsochrone.disabled(false);
		this.tgIsochrone.render();
		this.reachDcOrEm();
		this.resetUI();
	}

	reachEm() {
		this.currentMode = 'EM';
		this.reachDcOrEm();
		this.resetUI();
	}

	reachDcOrEm() {
		clearInterval(this.timerFrame);
		this.tgOrigin.render();
		this.tgBB.cleanBB();
		this.tgBB.addBBOfLocations();
		this.tgLocs.dispNameLayer = true;
		this.tgLocs.updateNonOverlappedLocationNames();
		this.tgLocs.render();
		this.tgBB.render();

	}

	resetUI() {
		const tf = (this.currentMode === 'EM');
		this.olMap.dragPan.setActive(tf);
		$('#dispIsochroneCB').prop('disabled', tf);
		//this.disableSGapAndGapButtons(tf);
	}

	disableSGapAndGapButtons(tf) {
		$('#dcGapModeRB').prop('disabled', tf);
		$('#dcSGapModeRB').prop('disabled', tf);
	}



	/*moveElementsByFrame(direction) {
		if (direction === 'forward') this.frame += 1;
		else if (direction === 'backward') this.frame -= 1;

		const value = this.frame * 0.1;

		// let intermediate;
		// if (this.warpingMode === 'none') intermediate = 'intermediateTarget';
		// else intermediate = 'intermediateReal';

		this.moveElementsByValue('intermediateReal', value);
		
		if ((direction === 'forward') && (this.frame >= 10)) {
			// completely go to dc mode
			this.currentMode = 'DC';
			this.tgIsochrone.disabled(false);
			this.tgIsochrone.render();
			this.reachDCOrEM();
			this.resetUI();
		}
		else if ((direction === 'backward') && (this.frame <= 0)) {
			// completely go to em mode
			this.currentMode = 'EM';
			this.reachDCOrEM();
			this.resetUI();
		}
		else {
			
		}
	}*/





	initMap() {
		this.tgBB.cleanBB();
		this.tgLocs.initLocations();
		this.tgLocs.removeLayer();
		this.tgLocs.removeNameLayer();
		this.tgLocs.render();

		console.log('init locs.');

		if (this.currentMode === 'DC') {
			this.currentMode = 'EM';
			this.resetUI();
			this.tgIsochrone.disabled(true);
			this.tgIsochrone.render();
			this.dispNodesOfallElementsAreOriginal();
			this.frame = 0;

		  $('#emModeRB').prop('checked', true);
		  $('#dcSGapModeRB').prop('checked', false);
		  $('#dcGapModeRB').prop('checked', false);
		}
	}

	dispNodesOfallElementsAreOriginal() {
  	this.tgWater.calDispNodes('original');
  	//this.tgWater.render();
  	this.tgRoads.calDispNodes('original');
  	//this.tgRoads.render();
  	this.tgLanduse.calDispNodes('original');
  	//this.tgLanduse.render();
	  this.tgPlaces.calDispNodes('original');
	  this.tgOrigin.calDispNodes('original');
  	//this.tgPlaces.render();
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
				locationLoading: {start:0, end:0},
				controlPointWarping: {start:0, end:0},
				tpsCalculating: {start:0, end:0},
				elementsWarping: {start:0, end:0},
				waterWarping: {start:0, end:0},
				roadWarping: {start:0, end:0},
				placeWarping: {start:0, end:0},
				landuseWarping: {start:0, end:0},
				etcWarping: {start:0, end:0},
			};

		for(let time in this.times) {
			$('#' + time + 'Time').html(this.displayString[time + 'Time'] + ' - ms');
		}
	}

	resetTempTime() {
		this.tempTimes = 
			{totalWarping: [], waterWarping: [], roadWarping: [], placeWarping: [],
				landuseWarping: [], etcWarping: []};
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
		else if (se === 'set') {
			const str = this.displayString[type + 'Time'] + ' ' + time + ' ms';
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

	calTimeFromLatLng(lat, lng) {
		if (!this.tg.graph.factor) return 0;
		
		const centerLat = this.tgOrigin.origin.original.lat;
  	const centerLng = this.tgOrigin.origin.original.lng;// / this.tg.graph.toLat();
  	const inLat = lat;
  	const inLng = lng; // / this.tg.graph.toLat();
  	//return this.tg.util.D2(centerLat, centerLng, lat, lng) * this.tg.graph.factor;
  	return this.tg.util.D2(centerLat, centerLng, inLat, inLng) * this.tg.graph.factor;
	}

	calDistanceFromLatLng(lat, lng) {
		const centerLat = this.tgOrigin.origin.original.lat;
  	const centerLng = this.tgOrigin.origin.original.lng;
  	return this.tg.util.distance(centerLat, centerLng, lat, lng); // km
	}

	calMaxDistance(latOrLng = 'lat') {
		const centerLat = this.tgOrigin.origin.original.lat;
  	const centerLng = this.tgOrigin.origin.original.lng;

		if (latOrLng === 'lat') {
			const halfHeightLat = (this.tg.opt.box.top - this.tg.opt.box.bottom) / 2;
			return this.calDistanceFromLatLng(centerLat + halfHeightLat, centerLng);
		}
		else if (latOrLng === 'lng') {
			const halfWidthLng = (this.tg.opt.box.right - this.tg.opt.box.left) / 2;
			return this.calDistanceFromLatLng(centerLat, centerLng + halfWidthLng);
		}
	}

}
