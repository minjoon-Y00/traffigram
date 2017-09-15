//const TgData = require('./tg_data');
//const TgMap = require('./tg_map');
//const TgGraph = require('./tg_graph');

class TgApp {
	constructor(map_id) {
		this.data = TgData;
		this.graph = new TgGraph(this, this.data);
		this.map = new TgMap(this, map_id);

	  //this.map.setArea('seattleDowntown');
	  //this.map.setArea('seattleUw');
	  //this.map.setArea('nyNyu');
	  //this.map.setArea('sfLombard');


	  this.results = {}; // [11, 13, 15]

	}

	setCenter(type) {
  	this.map.currentOrigin = type;

		this.map.setCenter(
  		this.data.presetOrigin[type].lat, 
  		this.data.presetOrigin[type].lng
  	);
	}

	setZoom(level) {
		this.map.currentZoomLevel = level;

		switch(level) {
			case 0:
				this.map.setZoom(15);
				break;
			case 1:
				this.map.setZoom(13);
				break;
			case 2:
				this.map.setZoom(11);
				break;
		}
	}

	setOriginAsHome() {
		this.map.tgOrigin.setOriginByPreset('home');
	}

	setOriginAsOffice() {
		this.map.tgOrigin.setOriginByPreset('office');
	}

	setOriginAsCurrentLocation() {
		this.map.tgOrigin.setOriginByCurrentLocation();
	}

	setOriginByAddress(adress) {
		this.map.tgOrigin.setOriginByAddress(adress);
	}

	setOriginByOtherLatLng(lat, lng) {
		this.map.tgOrigin.setOriginByOtherLatLng(lat, lng);
	}

	setOriginAsDefault() {
		this.map.tgOrigin.setDefaultOrigin();
	}

	setHome(address, lat, lng) {
		this.map.tgOrigin.setHome(address, lat, lng);
	}

	setOffice(address, lat, lng) {
		this.map.tgOrigin.setOffice(address, lat, lng);
	}

	setHomeAndOffice(hAddress, hLat, hLng, oAddress, oLat, oLng) {
		this.map.tgOrigin.setHomeAndOffice(hAddress, hLat, hLng, oAddress, oLat, oLng);
	}

	addFavorite(favoriteId) {
		this.map.tgLocs.addFavorite(favoriteId);
	}

	removeFavorite(favoriteId) {
		this.map.tgLocs.removeFavorite(favoriteId);
	}

	setFavorites(favoriteIds) {
		this.map.tgLocs.setFavorites(favoriteIds);
	}

	getFavorites() {
		return this.map.tgLocs.getFavorites();
	}

	initMap() {
		this.map.initMap();
	}

	resetCurrentSet() {
		this.map.tgLocs.resetCurrentSet();
	}

	filter(type, low, high) {
    this.map.tgLocs.doFilter(type, low, high);
	}

	goToEm(animation = true) {
		this.map.goToEm(animation);
	}

	goToDc(dcMode) {
		this.map.warpingMode = dcMode;
  	if (this.map.currentMode !== 'DC') this.map.goToDc(true); // animation
  	else this.map.goToDc(false); // no animation
	}

	setTransportTypeAndGo(type) {
		this.map.changeTransportType(type);
	}

	zoomIn() {
		this.map.zoomIn();
	}

	zoomOut() {
		this.map.zoomOut();
	}

	setActualTime() {

	}

	calLocTimeByCtlPt() {
		this.map.tgLocs.assignTimes();
		const result = this.map.tgSRC.calDijks();

		this.map.warpingMode = 'shapePreserving';
		this.data.var.latDivider = 2;
		this.data.var.lngDivider = 2;
		this.map.tgControl.calculateControlPoints();
		this.map.goToDc(false);
		this.makeTimeLocs(result, '2-2');
		this.goToEm(false);

		
		// level 1
		this.data.var.latDivider = 4;
		this.data.var.lngDivider = 2;
		this.map.tgControl.calculateControlPoints();
		this.map.goToDc(false);
		this.makeTimeLocs(result, '4-2');
		this.goToEm(false);

		// level 2
		this.data.var.latDivider = 4;
		this.data.var.lngDivider = 4;
		this.map.tgControl.calculateControlPoints();
		this.map.goToDc(false);
		this.makeTimeLocs(result, '4-4');
		this.goToEm(false);

		// level 3
		this.data.var.latDivider = 8;
		this.data.var.lngDivider = 4;
		this.map.tgControl.calculateControlPoints();
		this.map.goToDc(false);
		this.makeTimeLocs(result, '8-4');
		this.goToEm(false);

		//console.log('result: ', result);
		this.resultAnalysis(result);

		this.results[this.data.zoom.current][this.map.currentOrigin] = result;
	}

	calLocTimeByOrigin(a, b) {
		for(let zoom = a; zoom < b; ++zoom) {
			this.setCenter(zoom);
	  	this.map.tgSRC.updateLayer();
			console.log('origin: ' + this.map.currentOrigin);
	  	this.calLocTimeByCtlPt();
		}

		//this.setCenter(1);
	  //this.map.tgRoads.calDispRoads();
	  //this.map.tgSRC.updateLayer()
		//this.map.tgWater.calDispWater();
		//this.map.tgLanduse.calDispLanduse();
	  //this.calLocTimeByCtlPt();
	}

	debug() {
	 //  this.results[this.data.zoom.current] = [];
		// //this.calLocTimeByOrigin(0, 5);
		// this.calLocTimeByOrigin(5, 10);

		// console.log('results: ', this.results);
		// TgUtil.saveTextAsFile(this.results, 'results_15b.js');
		

		let difEsRoad = [];
	  let difAsRoad = [];
	  let difEsWater = [];
	  let difAsWater = [];
	  let difEsLanduse = [];
	  let difAsLanduse = [];

	  this.map.warpingMode = 'shapePreserving';
		this.map.goToDc(false);

		let ea;
		ea = this.map.tgRoads.calSP();

		let difEsRoadObj = {sgap: ea.difEs};
		let difAsRoadObj = {sgap: ea.difAs};

		ea = this.map.tgWater.calSP();
		let difEsWaterObj = {sgap: ea.difEs};
		let difAsWaterObj = {sgap: ea.difAs};

		ea = this.map.tgLanduse.calSP();
		let difEsLanduseObj = {sgap: ea.difEs};
		let difAsLanduseObj = {sgap: ea.difAs};

		this.map.warpingMode = 'noIntersection';
		this.map.goToDc(false);

		ea = this.map.tgRoads.calSP();
		difEsRoadObj.gap = ea.difEs;
		difAsRoadObj.gap = ea.difAs;
		difEsRoad.push(difEsRoadObj);
		difAsRoad.push(difAsRoadObj);

		ea = this.map.tgWater.calSP();
		difEsWaterObj.gap = ea.difEs;
		difAsWaterObj.gap = ea.difAs;
		difEsWater.push(difEsWaterObj);
		difAsWater.push(difAsWaterObj);

		ea = this.map.tgLanduse.calSP();
		difEsLanduseObj.gap = ea.difEs;
		difAsLanduseObj.gap = ea.difAs;
		difEsLanduse.push(difEsLanduseObj);
		difAsLanduse.push(difAsLanduseObj);
		


		
		

		console.log('-- GAP <-> SGAP --');
		console.log('difEsRoad.gap: ' + difEsRoad[0].gap * 1000);
		console.log('difEsRoad.sgap: ' + difEsRoad[0].sgap * 1000);
		console.log('difAsRoad.gap: ' + difAsRoad[0].gap);
		console.log('difAsRoad.sgap: ' + difAsRoad[0].sgap);
		console.log('---');
		console.log('difEsWater.gap: ' + difEsWater[0].gap * 1000);
		console.log('difEsWater.sgap: ' + difEsWater[0].sgap * 1000);
		console.log('difAsWater.gap: ' + difAsWater[0].gap);
		console.log('difAsWater.sgap: ' + difAsWater[0].sgap);
		console.log('---');
		console.log('difEsLanduse.gap: ' + difEsLanduse[0].gap * 1000);
		console.log('difEsLanduse.sgap: ' + difEsLanduse[0].sgap * 1000);
		console.log('difAsLanduse.gap: ' + difAsLanduse[0].gap);
		console.log('difAsLanduse.sgap: ' + difAsLanduse[0].sgap);
	}

	resultAnalysis(result) {
		let analysis = {};
		for(let type in result[0]) {
			analysis[type] = 0;
		}

		for(let ret of result) {
			for(let type in ret) {
				analysis[type] += Math.abs(ret[type] - ret.actual);
			}
		}

		for(let type in analysis) {
			analysis[type] /= result.length;
		}
		console.log('analysis', analysis);
	}

	makeTimeLocs(result, lv) {
		for(let i = 0; i < this.map.tgLocs.locations.length; ++i) {
			result[i][lv] = this.map.tgLocs.locations[i].time;
		}
	}

	/*makeTimeLocs(timeLocs, difLocs, numLocs, avgLocs) {
		let arr = [];
		let dif = 0;
		console.log(this.map.tgLocs.locations);
		for(let loc of this.map.tgLocs.locations) {
			//if (!loc.actualTime) continue;
			dif += Math.abs(loc.actualTime - loc.time);
			arr.push({actual: loc.actualTime, cal: loc.time});
		}
		timeLocs.push(arr);
		difLocs.push(dif);
		numLocs.push(arr.length);

		if (arr.length !== 0) avgLocs.push(dif / arr.length);
		else avgLocs.push(undefined);
	}*/


	debug2() {
		TgUtil.saveTextAsFile(this.results, 'results_1.js');
	}
}

//module.exports = TgApp;