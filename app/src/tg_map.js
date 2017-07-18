const TgControl = require('./map/tg_map_control');
const TgRoads = require('./map/tg_map_roads');
const TgWater = require('./map/tg_map_water');
const TgLanduse = require('./map/tg_map_landuse');
const TgPlaces = require('./map/tg_map_places');
const TgLocations = require('./map/tg_map_locations');
const TgIsochrone = require('./map/tg_map_isochrone');
const TgBoundingBox = require('./map/tg_map_bounding_box');
const TgOrigin = require('./map/tg_map_origin');
const tgUtil = require('./tg_util');
const TgMapUtil = require('./map/tg_map_util');

class TgMap {
	constructor(tg, map_id) {
		this.tg = tg;
		this.data = tg.data;
		this.graph = tg.graph;
		this.olMap = new ol.Map({
	    target: map_id,
	    //controls: [],
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([0,0]),
	      maxZoom: this.data.zoom.max,
	    	minZoom: this.data.zoom.min,
	    	zoom: this.data.zoom.init,
	    })
	  });

	  this.olMap.getInteractions().forEach((interaction) => {
		  if (interaction instanceof ol.interaction.DragPan) {
		  	this.olMap.dragPan = interaction;
		  }
		}, this);

		// modules

		this.mapUtil = new TgMapUtil(this.data, this.olMap);
	  this.tgWater = new TgWater(this, this.data, this.graph);
	  this.tgRoads = new TgRoads(this, this.data, this.graph);
	  this.tgLanduse = new TgLanduse(this, this.data, this.graph);
	  this.tgLocs = new TgLocations(this, this.data, this.graph);
	  this.tgControl = new TgControl(this, this.data, this.graph);
	  this.tgPlaces = new TgPlaces(this, this.data, this.graph);
	  this.tgBB = new TgBoundingBox(this, this.data, this.graph);
	  this.tgOrigin = new TgOrigin(this, this.data, this.graph);
	  this.tgIsochrone = new TgIsochrone(this, this.data, this.graph);

	  // initialization

	  this.tgWater.init();
	  this.tgRoads.init();
	  this.tgLanduse.init();
	  this.tgPlaces.init();

	  // variables

	 	//this.tgBB.turn(true);
	  //$('#dispBoundingBoxCB').prop('checked', true);

	  this.tgWater.turn(true);
	  $('#dispWaterCB').prop('checked', true);

	  this.tgRoads.turn(true);
	  $('#dispRoadsCB').prop('checked', true);
	  
	  this.tgLanduse.turn(true);
	  $('#dispLanduseCB').prop('checked', true);
	  
	  this.tgPlaces.turn(true);
	  $('#dispPlaceCB').prop('checked', true);	  

	  this.tgLocs.turn(true);
	  $('#dispLocationCB').prop('checked', true);

	  this.tgOrigin.turn(true);
	  $('#dispOriginCB').prop('checked', true);

	  this.tgIsochrone.turn(true);
	  $('#dispIsochroneCB').prop('checked', true);

	  this.dispGridLayer = false;
	  //this.dispCenterPositionLayer = true;
	  this.dispControlPointLayer = false;
	  this.dispIsochroneLayer = true;
	  this.warpingMode = 'shapePreserving'; 
	  this.needToCalWarping = false;
	  this.dispWaterNodeLayer = false;
	  this.dispRoadNodeLayer = false;
	  this.dispPlaceLayer = false;
	  this.dispLanduseNodeLayer = false;
	  this.dispLocationNameLayer = true;

	  this.currentMode = 'EM';
		this.data.zoom.current = this.olMap.getView().getZoom();
	  this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);

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

  setArea(area) {
		this.setCenter(this.data.center[area].lat, this.data.center[area].lng);
	}

	setOrigin(param) {
		if (param.lat && param.lng) {
			this.setCenter(param.lat, param.lng);
		}
		else if (param.address) {
			const s = (new Date()).getTime();

			this.tgOrigin.searchLatLngByAddress(param.address)
			.then((data) => {
				const elapsed = (new Date()).getTime() - s;
				console.log('received: lat & lng (' + elapsed + ' ms)');
				this.setCenter(data.lat, data.lng);
			})
			.catch((error) => {
				console.error(error);
				if (!this.tgOrigin.getOrigin()) setDefaultOrigin();
			});
		}
		else {
			console.error('invalid param in setOrigin()');
			if (!this.tgOrigin.getOrigin()) setDefaultOrigin();
		}

		function setDefaultOrigin() {
			console.log('use default lat & lng.')
			this.setCenter(this.data.origin.default.lat, this.data.origin.default.lng);
		}
	}

	setOriginByCurrentLocation() {
  	this.tgOrigin.getCurrentLocation()
  	.then((data) => {
  		console.log('got lat & lng from geolocation.');
			this.setCenter(data.lat, data.lng);
  	})
  	.catch((error) => {
			console.error(error);
			if (!this.tgOrigin.getOrigin()) setDefaultOrigin();
		});
  }

	setCenter(lat, lng) {
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.tgOrigin.setOrigin(lat, lng);
		this.tgControl.setOrigin(lat, lng);
		this.tgOrigin.render();
		this.calBoundaryBox();
		this.tgPlaces.needToBeRedrawn();
		this.tgLocs.request();
	}



	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {
		if (this.data.zoom.current != this.olMap.getView().getZoom()) {
	    this.data.zoom.current = this.olMap.getView().getZoom();
	    this.onZoomEnd();
	  }
	  else {
	  	this.onPanEnd();
	  }
	}

	onZoomEnd() {
    console.log('onZoomEnd');

    this.tgWater.tempCount = 0;

		this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);
		this.calBoundaryBox();
		this.tgPlaces.needToBeRedrawn();
    this.tgLocs.request();

    this.tgLocs.initLocations();
		this.recalculateAndDraw();


	}

	onPanEnd() {
		console.log('onPanEnd.');
		this.calBoundaryBox();
		this.recalculateAndDraw();


	}

	//
	// Recalculate information changed according to the interaction and draw it
	//
	recalculateAndDraw() {

		if (!this.tgOrigin.getOrigin()) return;

		console.log('recalculateAndDraw');

		//this.tpsReady = false;
		this.resetTime();
		this.resetDataInfo();

	  this.tgRoads.calDispRoads();
		this.tgWater.calDispWater();
		this.tgLanduse.calDispLanduse();
		//this.tgPlaces.calDispPlace();
		

		if (this.currentMode === 'DC') {
			this.calAllDispNodeAsOriginal();
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
			//this.tgPlaces.render();

		}


		this.readyControlPoints = false;
		this.disableSGapAndGapButtons(true);

	  this.tgControl.calculateControlPoints(() => {

	  	console.log('received: control points.');

	  	this.timerCheckGridSplitInTgMap = 
				setTimeout(
						this.calSplittedGrid.bind(this), 
						this.data.time.waitForFinishGettingWaterData);

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
			else {
				this.tgOrigin.render();
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
  	const centerLat = (this.data.box.top + this.data.box.bottom)/2
		const centerLng = (this.data.box.left + this.data.box.right)/2
  	const str = 'Map Level (' + this.data.zoom.current 
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


	setZoom(zoom) {
		this.olMap.getView().setZoom(zoom);
	}

	zoomIn() {
		this.setZoom(this.data.zoom.current + 1);
	}

	zoomOut() {
		this.setZoom(this.data.zoom.current - 1);
	}

	calBoundaryBox() {
	  const box = this.data.box;
	  const vars = this.data.var;
		const extent = this.olMap.getView().calculateExtent(this.olMap.getSize());
	  const bottomLeft = 
	  		ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
	  const topRight = 
	  		ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

	  box.left = bottomLeft[0];
	  box.bottom = bottomLeft[1];
	  box.right = topRight[0];
	  box.top = topRight[1];

  	vars.latPerPx = (box.top - box.bottom) / this.olMapHeightPX;
  	vars.lngPerPx = (box.right - box.left) / this.olMapWidthPX;
  	vars.latMargin = (box.top - box.bottom) * (vars.marginPercent * 0.01);
		vars.lngMargin = (box.right - box.left) * (vars.marginPercent * 0.01);
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

		/*if (this.dispPlaceLayer) {
			this.tgPlaces.calDispPlace();
			this.tgPlaces.addPlaceLayer();
		}
		else this.tgPlaces.clearLayers();
		*/

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

		switch(this.warpingMode) {
			case 'shapePreserving':
				this.tgControl.makeShapePreservingGridByFFT();
				break;
			case 'noIntersection':
				this.tgControl.makeNonIntersectedGrid();
				break;
			case 'noWarping':
				this.tgControl.makeNoWarpedGrid();
				break;
			case 'originalDC':
				this.tgControl.makeOriginalDCGrid();
				break;
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

	/*
	 * move elements by value 0 - 1
	 * intermediate: 'intermediateReal' or 'intermediateTarget'
	 * value: 0.0 - 1.0
	 * render: t/f
	 */
	moveElementsByValue(intermediate, value, render = true) {
		this.tgWater.calDispNodes(intermediate, value);
		this.tgRoads.calDispNodes(intermediate, value);
  	this.tgLanduse.calDispNodes(intermediate, value);
  	this.tgOrigin.calDispNodes(intermediate, value);
		this.tgLocs.calDispNodes(intermediate, value);
		this.tgPlaces.calDispNodes(intermediate, value);

		if (render) {
			this.tgWater.render();
			this.tgRoads.render();
  		this.tgLanduse.render();
  		this.tgOrigin.render();
			this.tgLocs.render();
			this.tgPlaces.render();
		}

		/*if (this.dispPlaceLayer) {
			this.tgPlaces.clearLayers();
	  	this.tgPlaces.calDispNodes(intermediate, value);
	  	this.tgPlaces.updateDispPlaces(true);
	  	this.tgPlaces.addPlaceLayer();
	  }*/


		

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
		//this.tgLocs.updateNonOverlappedLocationNames();
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
			this.calAllDispNodeAsOriginal();
			this.frame = 0;

		  $('#emModeRB').prop('checked', true);
		  $('#dcSGapModeRB').prop('checked', false);
		  $('#dcGapModeRB').prop('checked', false);
		}
	}

	calAllDispNodeAsOriginal() {
  	this.tgWater.calDispNodes('original');
  	this.tgRoads.calDispNodes('original');
  	this.tgLanduse.calDispNodes('original');
	  this.tgPlaces.calDispNodes('original');
	  this.tgOrigin.calDispNodes('original');
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
  	//return tgUtil.D2(centerLat, centerLng, lat, lng) * this.tg.graph.factor;
  	return tgUtil.D2(centerLat, centerLng, inLat, inLng) * this.tg.graph.factor;
	}

	calDistanceFromLatLng(lat, lng) {
		const centerLat = this.tgOrigin.origin.original.lat;
  	const centerLng = this.tgOrigin.origin.original.lng;
  	return tgUtil.distance(centerLat, centerLng, lat, lng); // km
	}

	calMaxDistance(latOrLng = 'lat') {
		const centerLat = this.tgOrigin.origin.original.lat;
  	const centerLng = this.tgOrigin.origin.original.lng;

		if (latOrLng === 'lat') {
			const halfHeightLat = (this.data.box.top - this.data.box.bottom) / 2;
			return this.calDistanceFromLatLng(centerLat + halfHeightLat, centerLng);
		}
		else if (latOrLng === 'lng') {
			const halfWidthLng = (this.data.box.right - this.data.box.left) / 2;
			return this.calDistanceFromLatLng(centerLat, centerLng + halfWidthLng);
		}
	}

}

module.exports = TgMap;