//const TgControl = require('./map/tg_map_control');
//const TgRoads = require('./map/tg_map_roads');
//const TgWater = require('./map/tg_map_water');
//const TgLanduse = require('./map/tg_map_landuse');
//const TgPlaces = require('./map/tg_map_places');
//const TgLocations = require('./map/tg_map_locations');
//const TgIsochrone = require('./map/tg_map_isochrone');
//const TgBoundingBox = require('./map/tg_map_bounding_box');
//const TgOrigin = require('./map/tg_map_origin');
//const TgGrid = require('./map/tg_map_grid');
//const TgUtil = require('./tg_util');
//const TgMapUtil = require('./map/tg_map_util');
//const TgMapInteraction = require('./map/tg_map_interactions');

class TgMap {
	constructor(tg, map_id) {
		this.tg = tg;
		this.data = tg.data;
		this.graph = tg.graph;

		this.olView = new ol.View({
      center: ol.proj.fromLonLat([0,0]),
      maxZoom: this.data.zoom.max,
    	minZoom: this.data.zoom.min,
    	zoom: this.data.zoom.init,
    });

    this.tgInteraction = new TgMapInteraction(this);

	  this.olMap = new ol.Map({
	  	interactions: ol.interaction.defaults().extend([this.tgInteraction]),
	    target: map_id,
	    controls: [], // don't show zoom buttons
	    layers: [],
	    view: this.olView,
	  });
  	this.tgInteraction.addOverlay();

  	//
	  this.olMap.getInteractions().forEach((interaction) => {
		  //if (interaction instanceof ol.interaction.DragPan) {
		  	//this.olMap.dragPan = interaction;
		  //}
		  if (interaction instanceof ol.interaction.DoubleClickZoom) {
		  	this.olMap.doubleClickZoom = interaction;
		  }
		  if (interaction instanceof ol.interaction.DragZoom) {
		  	this.olMap.dragZoom = interaction;
		  }
		  if (interaction instanceof ol.interaction.KeyboardZoom) {
		  	this.olMap.keyboardZoom = interaction;
		  }
		  if (interaction instanceof ol.interaction.PinchZoom) {
		  	this.olMap.pinchZoom = interaction;
		  }
		  if (interaction instanceof ol.interaction.MouseWheelZoom) {
		  	this.olMap.mouseWheelZoom = interaction;
		  }

		}, this);

	  //if (this.data.var.appMode !== 'pc') {
	  	this.olMap.doubleClickZoom.setActive(false);
			this.olMap.dragZoom.setActive(false);
			this.olMap.keyboardZoom.setActive(false);
			this.olMap.pinchZoom.setActive(false);
			this.olMap.mouseWheelZoom.setActive(false);
	  //}





		// modules

		this.mapUtil = new TgMapUtil(this.data, this.olMap);
	  this.tgWater = new TgMapWater(this, this.data, this.graph);
	  this.tgRoads = new TgMapRoads(this, this.data, this.graph);
	  this.tgLanduse = new TgMapLanduse(this, this.data, this.graph);
	  this.tgLocs = new TgMapLocations(this, this.data, this.graph);
	  this.tgControl = new TgMapControl(this, this.data, this.graph);
	  this.tgGrids = new TgMapGrid(this, this.data, this.graph);
	  this.tgPlaces = new TgMapPlaces(this, this.data, this.graph);
	  this.tgBB = new TgMapBoundingBox(this, this.data, this.graph);
	  this.tgOrigin = new TgMapOrigin(this, this.data, this.graph);
	  this.tgIsochrone = new TgMapIsochrone(this, this.data, this.graph);

	  this.warpingMode = 'shapePreserving'; 
	  this.needToCalWarping = false;

	  this.currentMode = 'EM';
		this.data.zoom.current = this.olMap.getView().getZoom();
		this.data.zoom.previous = this.data.zoom.current;
	  this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);

  	this.olMapHeightPX = $('#ol_map').css('height'); 
  	this.olMapHeightPX = 
  			Number(this.olMapHeightPX.slice(0, this.olMapHeightPX.length - 2)); // 900
  	this.olMapWidthPX = $('#ol_map').css('width');  
  	this.olMapWidthPX = 
  			Number(this.olMapWidthPX.slice(0, this.olMapWidthPX.length - 2)); // 600

	  // Event Handlers
		this.olMap.on('moveend', this.onMoveEnd.bind(this));

		this.frame = 0; // [0 (EM), 10 (DC)]
		this.timerFrame = null;
		this.deltaFrame = this.data.var.deltaFrame;
		this.animationSpeed = this.data.var.animationSpeed;
		this.tpsReady = false;
		this.timerCheckGridSplitInTgMap = null;

		this.readyControlPoints = false;
		this.currentCenter = {lat :0, lng :0};

		// initialization

		if (this.data.elements.water.disp) this.tgWater.init();
		if (this.data.elements.road.disp) this.tgRoads.init();
		if (this.data.elements.landuse.disp) this.tgLanduse.init();
		if (this.data.elements.place.disp) this.tgPlaces.init();
	  
	  this.tgOrigin.setPresets();

	  // variables

  	this.tgWater.turn(this.data.elements.water.disp);
  	$('#dispWaterCB').prop('checked', this.data.elements.water.disp);

	  this.tgRoads.turn(this.data.elements.road.disp);
	  $('#dispRoadsCB').prop('checked', this.data.elements.road.disp);
	  
	  this.tgLanduse.turn(this.data.elements.landuse.disp);
	  $('#dispLanduseCB').prop('checked', this.data.elements.landuse.disp);
	  
	  this.tgPlaces.turn(this.data.elements.place.disp);
	  $('#dispPlaceCB').prop('checked', this.data.elements.place.disp);	  

	  this.tgLocs.turn(true);
	  $('#dispLocationCB').prop('checked', true);

	  this.tgOrigin.turn(true);
	  $('#dispOriginCB').prop('checked', true);

	  this.tgIsochrone.turn(true);
	  $('#dispIsochroneCB').prop('checked', true);

	  //this.tgGrids.turn(true);
	  //$('#dispGridCB').prop('checked', true);

	 	//this.tgBB.turn(true);
	  //$('#dispBoundingBoxCB').prop('checked', true);


	}

	debug() {

	}

	setCenter(lat, lng) {
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.tgOrigin.setOrigin(lat, lng);
		this.tgControl.setOrigin(lat, lng);
		this.currentCenter.lat = lat;
		this.currentCenter.lng = lng;
		this.tgOrigin.render();
		this.calBoundaryBox();
		this.requestControlPoints();

		this.tgPlaces.needToBeRedrawn();
		this.tgLocs.request();

    if (typeof user_currentloc != 'undefined') {
    	user_currentloc.lng = lng;
			user_currentloc.lat = lat;
    }


	}

	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {
		//console.log(this.olMap.getView().getZoom());
		
		const intZoom = Math.round(this.olMap.getView().getZoom());

		// zooming.
		if (this.data.zoom.current != intZoom) {

			if (intZoom < this.data.zoom.min) {
				this.olMap.getView().setZoom(this.data.zoom.min);

				if (this.data.zoom.current !== this.data.zoom.min) {
					this.data.zoom.previous = this.data.zoom.current;
					this.data.zoom.current = this.data.zoom.min;
					this.onZoomEnd();
				}
			}
			else {
				this.data.zoom.previous = this.data.zoom.current;
	    	this.data.zoom.current = intZoom;
	    	this.onZoomEnd();
			}
	  }
		// panning.
	  else {
			this.data.zoom.previous = this.data.zoom.current;
	  	this.onPanEnd();
	  }
	}

	//type: zoom, pan

	log(type) {
		if (typeof user_log != 'undefined') {
			if (this.currentMode === 'DC') {
				user_log.mode_frequency.DC[type]++;
				console.log('$ user_log.mode_frequency.DC.' + type + '(' + 
					user_log.mode_frequency.DC[type] + ')');
			}
			else {
				user_log.mode_frequency.WM[type]++;
				console.log('$ user_log.mode_frequency.WM.' + type + '(' + 
					user_log.mode_frequency.WM[type] + ')');
			}
		}
	}

	onZoomEnd() {
		this.calBoundaryBox();

		if ((this.currentMode === 'DC') && (this.tgLocs.getHighLightMode())) {
			// return the normal isochrone mode
			this.tgInteraction.disableHighlightMode();
      this.tgLocs.resetCurrentSet();
		}

		if ((this.currentMode === 'DC') && (!this.tgOrigin.isOriginInTheBox())) {
    	console.log('origin is out of bouding box, so recover the previous zoom.');
    	this.olMap.getView().setZoom(this.data.zoom.previous);
		}
		else {
			this.log('zoom'); // Logging

	    console.log('onZoomEnd : ' + this.data.zoom.previous + '->' 
	    		+ this.data.zoom.current);

	    this.tpsReady = false;

	    this.tgWater.tempCount = 0;

			this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);
			this.tgPlaces.needToBeRedrawn();
	    this.tgLocs.request();

			this.recalculateAndDraw();
		}
	}

	onPanEnd() {
		this.calBoundaryBox();

		if ((this.currentMode === 'DC') && (!this.tgOrigin.isOriginInTheBox())) {
    	console.log('origin is out of bouding box, so recover the previous pan.');

    	this.olMap.getView().setCenter(ol.proj.fromLonLat(
    		[this.currentCenter.lng, this.currentCenter.lat]));
			this.calBoundaryBox();
    }
    else {
    	let pt = this.olMap.getView().getCenter();
    	let pt2 = ol.proj.transform([pt[0], pt[1]], 'EPSG:3857', 'EPSG:4326');

    	this.currentCenter.lng = pt2[0];
    	this.currentCenter.lat = pt2[1];

    	this.log('pan'); // Logging

			console.log('onPanEnd.');

			this.tgRoads.calDispRoads();
			this.tgWater.calDispWater();
			this.tgLanduse.calDispLanduse();

			this.tgRoads.render();
			this.tgWater.render();
			this.tgLanduse.render();

			this.tgPlaces.needToBeRedrawn();
	    this.tgLocs.request();
    }
	}

	//
	// Recalculate information changed according to the interaction and draw it
	//
	recalculateAndDraw() {

		if (!this.tgOrigin.getOrigin()) return;

		//console.log('recalculateAndDraw');
		
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
			this.tgIsochrone.discard();
			//this.tgLocs.setHighLightMode(false, 0);
		}
		else {
			this.tgRoads.render();
			this.tgWater.render();
			this.tgLanduse.render();
			//this.tgPlaces.render();

		}

		this.requestControlPoints();
	}

	requestControlPoints() {
		this.readyControlPoints = false;
		this.disableSGapAndGapButtons(true);

	  this.tgControl.calculateControlPoints(() => {

	  	console.log('received: control points.');

	  	this.timerCheckGridSplitInTgMap = 
				setTimeout(
						this.calSplittedGrid.bind(this), 
						this.data.time.waitForFinishGettingWaterData);

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
				console.log('hei');
			}
			else {
				this.tgOrigin.render();
			}
		});
	}

	goToDcAgain(noNeedToCalFactor = false) {
		this.frame = 0;
		this.currentMode = 'EM';
		//this.moveElementsByValue('original', null, false);

		this.goToDc(false, noNeedToCalFactor);
	}

	calSplittedGrid() {
		this.tgControl.currentSplitLevel = 0;
		this.tgWater.checkPointsInWater(this.tgControl.controlPoints);
		this.tgControl.checkGridSplit();
	}

  dispMapInfo() {

  	// map level and center position
  	const centerLat = (this.data.box.top + this.data.box.bottom)/2
		const centerLng = (this.data.box.left + this.data.box.right)/2
  	const str = 'Map Level (' + this.data.zoom.current 
  		+ '), Center (' + centerLat.toPrecision(8) + ', ' + centerLng.toPrecision(9) + ')'
  	$("#mapInfo1").text(str)
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

		
		this.tgBB.render();

		//console.log('updateLayers : ' + ((new Date()).getTime() - s) + 'ms')
	}

	goToEm(animation = true) {
		if (this.currentMode === 'EM') return;

		if (animation) {
			this.timerFrame = 
					setInterval(this.goToEmByFrame.bind(this), this.animationSpeed);
		}
		else {
			this.frame = 0;
			this.currentMode = 'EM'
			this.moveElementsByValue('original', null);
			this.reachEm();
		}
	}

	goToDc(animation = true, noNeedToCalFactor = false) {

		/*if (!this.tgOrigin.isOriginInTheBox()) {
			// move the center		
			this.olView.setCenter(ol.proj.fromLonLat(
					[this.tgOrigin.origin.original.lng, this.tgOrigin.origin.original.lat]));
		}*/
		
		// cal warping
		this.tg.graph.calWarping(noNeedToCalFactor);

		//this.tgControl.makeOriginalDCGrid();


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
		}
		else {
			alert('fail: TPS...');
		}

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
	  	this.tgLocs.calTargetAndRealNodes();
	  	this.tgOrigin.calRealNodes();
		}

		if (this.tgRoads.waitForTps) {
			this.tgRoads.processWatingRoadObjects();
			this.tgRoads.waitForTps = false;
		}

		if (this.tgWater.waitForTps) {
			this.tgWater.processWaitingWaterObjects();
			this.tgWater.waitForTps = false;
		}

		if (this.tgLocs.waitForTps) {
			this.tgLocs.displayLocsInDc();
			this.tgLocs.waitForTps = false;
		}

		// calculate time of all locations
		this.tgLocs.setTimeOfLocations();
		this.tgLocs.setTimeOfLocationGroups();

		if (animation) {
			this.timerFrame = 
					setInterval(this.goToDcByFrame.bind(this), this.animationSpeed);
		}
		else {
			this.frame = 10;
			this.currentMode = 'DC';
			this.moveElementsByValue('real', null);
			this.reachDc();
		}

		// test
		/*let sum = 0;
		for(let pt of this.tgControl.controlPoints) {
			if (pt.travelTime) {
				const expectedTime = 
						parseInt(this.calTimeFromLatLng(pt.target.lat, pt.target.lng));
				const dif = Math.abs(pt.travelTime - expectedTime);
				sum += dif;
				console.log(pt.travelTime + ' , ' + expectedTime + ' : ' + dif);
			}
		}
		console.log('dif sum: ' + sum);*/
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
		this.tgGrids.calDispNodes(intermediate, value);

		if (render) {
			this.tgWater.render();
			this.tgRoads.render();
  		this.tgLanduse.render();
  		this.tgOrigin.render();
			this.tgLocs.render();
			this.tgPlaces.render();
			this.tgGrids.render();
		}
	}

	goToDcByFrame() {
		//this.frame += 1;
		this.frame += this.deltaFrame;
		const value = this.frame * 0.1;

		if (this.frame < 10) {
			// intermediate mode
			this.moveElementsByValue('intermediateReal', value);
			this.betweenDcAndEm();
		}
		else {
			// completely go to dc mode
			this.currentMode = 'DC';
			this.moveElementsByValue('real', value);
			this.reachDc();
		}
	}

	goToEmByFrame() {
		//this.frame -= 1;
		this.frame -= this.deltaFrame;

		const value = this.frame * 0.1;

		if (this.frame > 0) {
			// intermediate mode
			this.moveElementsByValue('intermediateReal', value);
			this.betweenDcAndEm();
		}
		else {
			// completely go to em mode
			this.currentMode = 'EM';
			this.moveElementsByValue('original', value);
			this.reachEm();
		}
	}

	betweenDcAndEm() {
		this.currentMode = 'INTERMEDIATE';
		this.tgIsochrone.disabled(true);
		this.tgIsochrone.render();
		this.tgLocs.setHighLightMode(false, 0);
		this.tgLocs.dispNameLayer = false;
		this.tgLocs.removeNameLayer();
		this.tgLocs.render();
	}

	reachDc() {
		console.log('@reach DC');
		//this.currentMode = 'DC';
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
		//this.tgBB.cleanBB();
		//this.tgBB.addBBOfLocations();
		this.tgLocs.dispNameLayer = true;
		//this.tgLocs.updateNonOverlappedLocationNames();
		this.tgLocs.render();
		this.tgBB.render();

	}

	resetUI() {
		const tf = (this.currentMode === 'EM');
		//this.olMap.dragPan.setActive(tf);
		$('#dispIsochroneCB').prop('disabled', tf);
		//this.disableSGapAndGapButtons(tf);
	}

	disableSGapAndGapButtons(tf) {
		$('#dcGapModeRB').prop('disabled', tf);
		$('#dcSGapModeRB').prop('disabled', tf);
	}

	initMap() {
		this.tgBB.cleanBB();
		this.tgLocs.removeLayer();
		this.tgLocs.removeNameLayer();
		this.tgLocs.render();

		console.log('init locs.');

		if (this.currentMode === 'DC') {
			this.currentMode = 'EM';
			this.resetUI();
			this.tgIsochrone.disabled(true);
			this.tgIsochrone.render();
			this.tgLocs.setHighLightMode(false, 0);

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
  	//this.tgGrids.calDispNodes('original');
	}

	calLenFromLatLng(lat, lng) {
  	const cLat = this.tgOrigin.origin.original.lat;
  	const cLng = this.tgOrigin.origin.original.lng;
  	const dLat = (cLat - lat) * this.graph.shrink();
  	const dLng = (cLng - lng);
  	//const dLng = (cLng - lng) * this.graph.shrink();
	  return Math.sqrt(dLat * dLat + dLng * dLng);

	}

	calTimeFromLatLng(lat, lng) {
		if (!this.tg.graph.factor) return 0;

  	const cLat = this.tgOrigin.origin.original.lat;
  	const cLng = this.tgOrigin.origin.original.lng;
  	
  	const dLat = (cLat - lat);
  	const dLng = (cLng - lng) * this.graph.shrink();
	 	const dist = Math.sqrt(dLat * dLat + dLng * dLng);

  	return dist * this.tg.graph.factor;
	}

	calDistanceFromLatLng(lat, lng) {
		const centerLat = this.tgOrigin.origin.original.lat;
  	const centerLng = this.tgOrigin.origin.original.lng;
  	return TgUtil.distance(centerLat, centerLng, lat, lng); // km
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

//module.exports = TgMap;