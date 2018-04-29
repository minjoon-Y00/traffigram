class TgMap {
	constructor(tg, map_id) {
		this.tg = tg;
		this.data = tg.data;

		this.olView = new ol.View({
      center: ol.proj.fromLonLat([0,0]),
      maxZoom: this.data.zoom.max,
    	minZoom: this.data.zoom.min,
    	zoom: this.data.zoom.init,
    });

	  this.olMap = new ol.Map({
	    target: map_id,
	    controls: [], // don't show zoom buttons
	    layers: [],
	    view: this.olView,
	  });

		// modules

		this.mapUtil = new TgMapUtil(this.data, this.olMap);
	  this.tgVecTile = new TgMapVectorTile(this, this.data);
	  this.tgWater = new TgMapWater(this, this.data, this.graph);
	  this.tgRoads = new TgMapRoads(this, this.data, this.graph);
	  this.tgLanduse = new TgMapLanduse(this, this.data, this.graph);
		this.tgDistTime = new TgMapDistTime(this, this.data);

	  this.currentMode = 'EM'
	  this.warpingMode = 'shapePreserving'; 
	  this.needToCalWarping = false;

		this.data.zoom.current = this.olMap.getView().getZoom();
		this.data.zoom.previous = this.data.zoom.current;
	  this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);

	  this.currentCenter = {};
	  this.readyControlPoints = true;

  	// this.olMapHeightPX = $('#ol_map').css('height'); 
  	// this.olMapHeightPX = 
  	// 		Number(this.olMapHeightPX.slice(0, this.olMapHeightPX.length - 2)); // 900
  	// this.olMapWidthPX = $('#ol_map').css('width');  
  	// this.olMapWidthPX = 
  	// 		Number(this.olMapWidthPX.slice(0, this.olMapWidthPX.length - 2)); // 600

	  // Event Handlers
		this.olMap.on('moveend', this.onMoveEnd.bind(this));

		// this.frame = 0; // [0 (EM), 10 (DC)]
		// this.timerFrame = null;
		// this.deltaFrame = this.data.var.deltaFrame;
		// this.animationSpeed = this.data.var.animationSpeed;
		// this.tpsReady = false;
		// this.timerCheckGridSplitInTgMap = null;

		// this.readyControlPoints = false;
		// this.currentCenter = {lat :0, lng :0};

		// initialization

		this.tgVecTile.init();
  	this.tgWater.turn(true);
	  this.tgRoads.turn(true);
	  this.tgDistTime.turn(true);
	  this.tgLanduse.turn(false);

		// this.tgLocs.turn(false);
		// // this.tgLocs.turn(true);
	 //  // $('#dispLocationCB').prop('checked', true);

	 //  this.tgIsochrone.turn(false);
	 //  // this.tgIsochrone.turn(true);
	 //  // $('#dispIsochroneCB').prop('checked', true);

		//this.tgPerc.turn(true);


	  /*
	  this.tgPlaces.turn(this.data.elements.place.disp);
	  $('#dispPlaceCB').prop('checked', this.data.elements.place.disp);	  

	  

	  

	  
*/
	  // this.tgGrids.turn(true);
	  //$('#dispGridCB').prop('checked', true);

	 	//this.tgBB.turn(true);
	  //$('#dispBoundingBoxCB').prop('checked', true);


	}

	debug() {

	}

	setCenter(lat, lng) {
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.currentCenter.lat = lat;
		this.currentCenter.lng = lng;
		this.calBoundaryBox();
	}

	//
	// When finising the mouse move or zoom in/out
	//
	onMoveEnd(e) {

		console.log('here.');


		//console.log(this.olMap.getView().getZoom());
		
		// const intZoom = Math.round(this.olMap.getView().getZoom());

		// // zooming.
		// if (this.data.zoom.current != intZoom) {

		// 	if (intZoom < this.data.zoom.min) {
		// 		this.olMap.getView().setZoom(this.data.zoom.min);

		// 		if (this.data.zoom.current !== this.data.zoom.min) {
		// 			this.data.zoom.previous = this.data.zoom.current;
		// 			this.data.zoom.current = this.data.zoom.min;
		// 			this.onZoomEnd();
		// 		}
		// 	}
		// 	else {
		// 		this.data.zoom.previous = this.data.zoom.current;
	 //    	this.data.zoom.current = intZoom;
	 //    	this.onZoomEnd();
		// 	}
	 //  }
		// // panning.
	 //  else {
		// 	this.data.zoom.previous = this.data.zoom.current;
	 //  	this.onPanEnd();
	 //  }
	this.recalculateAndDraw();

	}

	//type: zoom, pan


	onZoomEnd() {

		console.log('here.');

		this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);

		this.calBoundaryBox();
		this.recalculateAndDraw();

		// if ((this.currentMode === 'DC') && (this.tgLocs.getHighLightMode())) {
		// 	// return the normal isochrone mode
		// 	this.tgInteraction.disableHighlightMode();
  //     this.tgLocs.resetCurrentSet();
		// }

		// if ((this.currentMode === 'DC') && (!this.tgOrigin.isOriginInTheBox())) {
  //   	console.log('origin is out of bouding box, so recover the previous zoom.');
  //   	this.olMap.getView().setZoom(this.data.zoom.previous);
		// }
		// else {
		// 	this.log('zoom'); // Logging

	 //    console.log('onZoomEnd : ' + this.data.zoom.previous + '->' 
	 //    		+ this.data.zoom.current);

	 //    this.tpsReady = false;

	 //    this.tgWater.tempCount = 0;

		// 	this.tgPlaces.needToBeRedrawn();
	 //    this.tgLocs.request();

		// }
	}

	onPanEnd() {
		this.calBoundaryBox();
		this.recalculateAndDraw();

		// if ((this.currentMode === 'DC') && (!this.tgOrigin.isOriginInTheBox())) {
  //   	console.log('origin is out of bouding box, so recover the previous pan.');

  //   	this.olMap.getView().setCenter(ol.proj.fromLonLat(
  //   		[this.currentCenter.lng, this.currentCenter.lat]));
		// 	this.calBoundaryBox();
  //   }
  //   else {
  //   	let pt = this.olMap.getView().getCenter();
  //   	let pt2 = ol.proj.transform([pt[0], pt[1]], 'EPSG:3857', 'EPSG:4326');

  //   	this.currentCenter.lng = pt2[0];
  //   	this.currentCenter.lat = pt2[1];

  //   	this.log('pan'); // Logging

  		this.tgRoads.calDispRoads();
			//this.tgWater.calDispWater();

			this.tgRoads.render();
			//this.tgWater.render();

		// 	console.log('onPanEnd.');

		// 	this.tgRoads.calDispRoads();
		// 	this.tgWater.calDispWater();
		// 	this.tgLanduse.calDispLanduse();

		// 	this.tgRoads.render();
		// 	this.tgWater.render();
		// 	this.tgLanduse.render();

		// 	this.tgPlaces.needToBeRedrawn();
	 //    this.tgLocs.request();
  //   }
	}

	//
	// Recalculate information changed according to the interaction and draw it
	//
	recalculateAndDraw() {

		//if (!this.tgOrigin.getOrigin()) return;

		//console.log('recalculateAndDraw');


		
	  //this.tgRoads.calDispRoads();
		this.tgWater.calDispWater();
		//this.tgLanduse.calDispLanduse();

		//this.tgRoads.render();
		this.tgWater.render();
		//this.tgLanduse.render();
		

		// if (this.currentMode === 'DC') {
		// 	this.calAllDispNodeAsOriginal();
		// 	//this.tgRoads.discard();
		// 	//this.tgWater.discard();
		// 	//this.tgLanduse.discard();

		// 	this.tgLocs.discard();
		// 	this.tgIsochrone.discard();
		// 	//this.tgLocs.setHighLightMode(false, 0);
		// }
		// else {
		// 	this.tgRoads.render();
		// 	this.tgWater.render();
		// 	this.tgLanduse.render();
		// 	//this.tgPlaces.render();

		// }

		// this.requestControlPoints();
	}

	changeTransportType(type) {
		// if (this.tgControl.currentTransport === type) return;

		// this.disableSGapAndGapButtons(true);

		// this.tgControl.currentTransport = type;
		// this.tgControl.getTravelTimeOfControlPoints(() => {

		// 	this.disableSGapAndGapButtons(false);

		// 	if (this.currentMode === 'DC') {
		// 		this.goToDcAgain(false);
		// 		//this.goToDcAgain(true);
		// 	}
		// 	else {
		// 		this.tgOrigin.render();
		// 	}
		// });
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

  // 	vars.latPerPx = (box.top - box.bottom) / this.olMapHeightPX;
  // 	vars.lngPerPx = (box.right - box.left) / this.olMapWidthPX;
  // 	vars.latMargin = (box.top - box.bottom) * (vars.marginPercent * 0.01);
		// vars.lngMargin = (box.right - box.left) * (vars.marginPercent * 0.01);
	}


	//
	// Redraw all layers of displayed elements
	//		
	updateLayers() {
		//var s = (new Date()).getTime();


		this.tgWater.render();
		this.tgRoads.render();
		this.tgLanduse.render();

		// this.tgOrigin.render();
		// this.tgLocs.render();
		// this.tgPerc.render();
		// this.tgPlaces.render();
		// this.tgGrids.render();
		// this.tgPerc.render();
		
		// this.tgBB.render();

		//console.log('updateLayers : ' + ((new Date()).getTime() - s) + 'ms')
	}

	

	initMap() {
		// this.tgBB.cleanBB();
		// this.tgLocs.removeLayer();
		// this.tgLocs.removeNameLayer();
		// this.tgLocs.render();
		// this.tgPerc.removeLayer();
		// this.tgPerc.render();


		// console.log('init locs.');

		// if (this.currentMode === 'DC') {
		// 	this.currentMode = 'EM';
		// 	this.resetUI();
		// 	this.tgIsochrone.disabled(true);
		// 	this.tgIsochrone.render();
		// 	this.tgLocs.setHighLightMode(false, 0);

		// 	this.calAllDispNodeAsOriginal();
		// 	this.frame = 0;

		//   $('#emModeRB').prop('checked', true);
		//   $('#dcSGapModeRB').prop('checked', false);
		//   $('#dcGapModeRB').prop('checked', false);
		// }
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