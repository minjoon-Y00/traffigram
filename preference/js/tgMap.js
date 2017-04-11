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

		this.mapUtil = new TGMapUtil(tg, this.olMap)
	  this.tgWater = new TGMapWater(tg, this.olMap, this.mapUtil)
	  this.tgRoads = new TGMapRoads(tg, this.mapUtil)
	  this.tgControl = new TGMapControl(tg, this.mapUtil)
	  this.tgLocs = new TGMapLocs(tg, this.olMap, this.mapUtil)
	  this.tgPlaces = new TGMapPlaces(tg, this.olMap, this.mapUtil);
	  this.tgLanduse = new TGMapLanduse(tg, this.olMap, this.mapUtil);
	  //this.tgAux = new TGMapAux(tg, this.olMap, this.mapUtil);
	  this.tgBB = new TGMapBoundingBox(tg, this.olMap, this.mapUtil);
	  this.tgOrigin = new TGMapOrigin(tg, this.mapUtil);
	  this.tgIsochrone = new TGMapIsochrone(tg, this.mapUtil);

	  // initialization

	  this.tgWater.start();
	  this.tgRoads.init();
	  this.tgPlaces.start();
	  this.tgLanduse.start();

	  // variables

	  //this.tgBB.turn(true);

	  this.tgRoads.turn(true);
	  $('#dispRoadsCB').prop('checked', true);

	  this.tgOrigin.turn(true);
	  $('#dispOriginCB').prop('checked', true);

	  this.tgIsochrone.turn(true);
	  $('#dispIsochroneCB').prop('checked', true);

	  this.origin = {};
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
	  this.dispLocationLayer = true;
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

		this.tgBB.repositionElements();
		//console.log(this.calMaxDistance('lat'));
		//console.log(this.calMaxDistance('lng'));
	}

	debug2() {
		this.tgBB.repositionPlaces();
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

		console.log('$ recalculateAndDraw()');
		this.tpsReady = false;
		this.resetTime();
		this.resetDataInfo();
		this.calBoundaryBox();

		//this.tgRoads.clearLayers();
	  this.tgRoads.calDispRoads();
		this.tgRoads.render();


		if (this.originChanged) {
			this.tgBB.addOriginToBB();
			this.originChanged = false;
		}

		if (this.requestLocations) {
			this.tgLocs.request();
			this.requestLocations = false;
		}

	  this.tgControl.calculateControlPoints(() => {

	  	this.timerCheckGridSplitInTgMap = 
				setTimeout(
						this.calSplittedGrid.bind(this), 
						this.tg.opt.constant.timeToWaitForFinishGettingWaterData);



		  if (this.currentMode === 'DC') {
		  	this.currentMode = 'EM';
		  	//this.initElements();
		  	//this.goToDc();
		  }
		  else if (this.currentMode === 'EM') {
		  	this.tgControl.calDispNodes('original');
		  }

			//this.tgAux.drawCenterPositionLayer();

		  this.updateLayers();
			this.dispMapInfo();

	  });	



		this.tgWater.clearLayers();
		this.tgWater.calDispWater();
		this.tgWater.addWaterLayer();

		this.tgLanduse.clearLayers();
		this.tgLanduse.calDispLanduse();
		this.tgLanduse.addLanduseLayer();

		if (this.dispPlaceLayer) {
			this.tgPlaces.clearLayers();
			this.tgPlaces.calDispPlace();
			this.tgPlaces.addPlaceLayer();
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
		var pt = ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
		var clickedLat = pt[1];
		var clickedLng = pt[0];

		this.tgLocs.showModal(clickedLat, clickedLng);

		//console.log(pt[1]);
		//console.log(pt[0]);
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
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]))
		this.origin.lng = lng
		this.origin.lat = lat
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
		const extent = this.olMap.getView().calculateExtent(this.olMap.getSize());
	  const bottomLeft = 
	  		ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
	  const topRight = 
	  		ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

	  this.tg.opt.box.left = bottomLeft[0];
	  this.tg.opt.box.bottom = bottomLeft[1];
	  this.tg.opt.box.right = topRight[0];
	  this.tg.opt.box.top = topRight[1];

  	this.tg.opt.variable.latPerPx = 
  			(this.tg.opt.box.top - this.tg.opt.box.bottom) / this.olMapHeightPX;
  	this.tg.opt.variable.lngPerPx = 
  			(this.tg.opt.box.right - this.tg.opt.box.left) / this.olMapWidthPX;

  	/*this.clickRange = {
  		lat: height * this.tg.opt.constant.clickSensibility, 
  		lng: width * this.tg.opt.constant.clickSensibility
  	}*/
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

		if (this.dispWaterNodeLayer) this.tgWater.addWaterNodeLayer();
		else this.tgWater.removeWaterNodeLayer();

		if (this.dispRoadNodeLayer) this.tgRoads.addNodeLayer();
		else this.tgRoads.removeNodeLayer();

		if (this.dispLanduseNodeLayer) this.tgLanduse.addLanduseNodeLayer();
		else this.tgLanduse.removeLanduseNodeLayer();

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
	}

	goToDc(animation = true) {
		//if (this.currentMode === 'DC') return;

		//console.log('this.warpingMode: ' + this.warpingMode);

		//if ((this.needToCalWarping)||(!this.tpsReady)) {
		// cal warping
		this.tg.graph.calWarping();

		if (this.warpingMode === 'noIntersection') {
			this.tgControl.makeNonIntersectedGrid();
		}
		else if (this.warpingMode === 'shapePreserving') {
			this.tgControl.makeShapePreservingGridByFFT();
		}

		// tps calculation
		this.tg.graph.TPSSolve();

		if (this.tg.graph.TPSTest()) {
			console.log('TPS complete.');
			this.tpsReady = true;
		}
		else {
			//console.log('TPS failed...');
			alert('TPS failed...');
		}
		//this.needToCalWarping = false;

		this.tgLocs.calTargetNodes();

		if (this.warpingMode === 'none') {
			this.tgWater.calTargetNodes();
	  	this.tgRoads.calTargetNodes();
	  	this.tgPlaces.calTargetNodes();
	  	this.tgLanduse.calTargetNodes();
		}
		else {
			this.tgWater.calRealNodes();
	  	this.tgRoads.calRealNodes();
	  	this.tgPlaces.calRealNodes();
	  	this.tgLanduse.calRealNodes();
	  	this.tgLocs.calRealNodes();
		}

		if (animation) {
			this.timerFrame = 
				setInterval(this.moveElementsByFrame.bind(this, 'forward'), this.animationSpeed);
		}
		else {
			this.moveElementsByValue('intermediateReal', 1.0);
			this.reachDCOrEM();
		}
	}

	moveElementsByValue(intermediate, value) {
		const t1 = (new Date()).getTime();

		this.tgWater.clearLayers();
		this.tgWater.calDispNodes(intermediate, value);
		this.tgWater.updateDispWater();
		this.tgWater.addWaterLayer();

		const t2 = (new Date()).getTime();
		this.tempTimes.waterWarping.push(t2 - t1);
		console.log('[1] water: ' + (t2 - t1) + 'ms');

		//this.tgRoads.clearLayers();
		this.tgRoads.calDispNodes(intermediate, value);
  	//this.tgRoads.updateDispRoads();
  	this.tgRoads.render();

  	const t3 = (new Date()).getTime();
		this.tempTimes.roadWarping.push(t3 - t2);
		console.log('[2] road: ' + (t3 - t2) + 'ms');

		if (this.dispPlaceLayer) {
			this.tgPlaces.clearLayers();
	  	this.tgPlaces.calDispNodes(intermediate, value);
	  	this.tgPlaces.updateDispPlaces(true);
	  	this.tgPlaces.addPlaceLayer();
	  }

  	const t4 = (new Date()).getTime();
		this.tempTimes.placeWarping.push(t4 - t3);
		console.log('[3] place: ' + (t4 - t3) + 'ms');

		this.tgLanduse.clearLayers();
  	this.tgLanduse.calDispNodes(intermediate, value);
  	this.tgLanduse.updateDispLanduse(true);
  	this.tgLanduse.addLanduseLayer();

  	const t5 = (new Date()).getTime();
		this.tempTimes.landuseWarping.push(t5 - t4);
		console.log('[4] landuse: ' + (t5 - t4) + 'ms');

		if (this.dispLocationLayer) {
			this.tgLocs.removeLocationLayer();
			this.tgLocs.calDispNodes(intermediate, value);
			this.tgLocs.drawLocationLayer();
		}

		if (this.dispLocationNameLayer) {
			this.tgLocs.removeLocationNameLayer();
			this.tgLocs.drawLocationNameLayer();
		}

  	if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
  		this.tgControl.calDispNodes(intermediate, value);

  		if (this.dispGridLayer) this.tgControl.drawGridLayer();
  		if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer();
  	}

  	//if (this.dispIsochroneLayer) this.tgAux.drawIsochroneLayer();

  	const t6 = (new Date()).getTime();
		this.tempTimes.etcWarping.push(t6 - t5);
		console.log('[5] etc: ' + (t6 - t5) + 'ms');

		this.tempTimes.totalWarping.push((new Date()).getTime() - t1);
	}

	moveElementsByFrame(direction) {
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

			// ui
			this.olMap.dragPan.setActive(false);
			$('#dispIsochroneCB').prop('disabled', false);
			$('#noIntersectedGridRB').prop('disabled', false);
			$('#shapePreservingGridRB').prop('disabled', false);
		}
		else if ((direction === 'backward') && (this.frame <= 0)) {
			// completely go to em mode
			this.currentMode = 'EM';
			this.reachDCOrEM();

			// ui
			this.olMap.dragPan.setActive(true);
			$('#dispIsochroneCB').prop('disabled', true);
			$('#noIntersectedGridRB').prop('disabled', true);
			$('#shapePreservingGridRB').prop('disabled', true);
		}
		else {
			// intermediate mode
			this.tgIsochrone.disabled(true);
			this.tgIsochrone.render();
		}
	}

	reachDCOrEM() {
		clearInterval(this.timerFrame);
		this.tgBB.cleanBB();
		this.tgBB.addBBOfLocations();
		this.tgLocs.updateNonOverlappedLocationNames();
		this.tgLocs.drawLocationNameLayer();
		this.tgBB.render();

		//this.updateLayers();

		const averageTotal = this.tg.util.average(this.tempTimes.totalWarping);
		const averageWater = this.tg.util.average(this.tempTimes.waterWarping); 
		const averageRoad = this.tg.util.average(this.tempTimes.roadWarping); 
		const averagePlace = this.tg.util.average(this.tempTimes.placeWarping); 
		const averageLanduse = this.tg.util.average(this.tempTimes.landuseWarping); 
		const averageEtc = this.tg.util.average(this.tempTimes.etcWarping); 

		this.setTime('elementsWarping', 'set', averageTotal);
		this.setTime('waterWarping', 'set', averageWater);
		this.setTime('roadWarping', 'set', averageRoad);
		this.setTime('placeWarping', 'set', averagePlace);
		this.setTime('landuseWarping', 'set', averageLanduse);
		this.setTime('etcWarping', 'set', averageEtc);
		this.resetTempTime();
	}

	initElements() {
  	this.tgWater.calDispNodes('original');
  	this.tgWater.updateDispWater();
  	this.tgWater.addWaterLayer();

  	this.tgRoads.calDispNodes('original');
  	//this.tgRoads.updateDispRoads();
  	this.tgRoads.render();

  	if (this.dispPlaceLayer) {
	  	this.tgPlaces.calDispNodes('original');
	  	this.tgPlaces.updateDispPlaces();
	  	this.tgPlaces.addPlaceLayer();
	  }

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
		
		const centerLat = this.origin.lat;
  	const centerLng = this.origin.lng;
  	return this.tg.util.D2(centerLat, centerLng, lat, lng) * this.tg.graph.factor;
	}

	calDistanceFromLatLng(lat, lng) {
		const centerLat = this.origin.lat;
  	const centerLng = this.origin.lng;
  	return this.tg.util.distance(centerLat, centerLng, lat, lng); // km
	}

	calMaxDistance(latOrLng = 'lat') {
		const centerLat = this.origin.lat;
  	const centerLng = this.origin.lng;

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
