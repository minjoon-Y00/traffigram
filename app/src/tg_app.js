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

	goToEm() {
		this.map.goToEm();
		//this.map.goToEm(false); // no animation
	}

	goToDc(dcMode) {
		this.map.warpingMode = dcMode;
		//this.map.goToDc(false); // no animation

  	if (this.map.currentMode !== 'DC') this.map.goToDc(true); // animation
  	else this.map.goToDc(false); // no animation
	}

	setTransportTypeAndGo(type) {
		this.map.changeTransportType(type);
	}

	setCenter(obj) {
		this.map.setCenter(obj.lat, obj.lng);
	}

	zoomIn() {
		this.map.zoomIn();
	}

	zoomOut() {
		this.map.zoomOut();
	}

	randomCtlPts(val) {
		this.map.tgControl.addRandomnessToCtlPts(val);

		if (this.map.currentMode === 'DC') {
			this.map.goToDc(false);
		}
	}

	randomLocs(val) {
		console.log(val);
		this.map.tgLocs.numRandomLoc = val;

		//this.map.tgLocs.calLocs();
		this.map.tgLocs.request();

		this.map.tgLocs.render();

		if (this.map.currentMode === 'DC') {
			//this.map.goToDc(false);
		}
	}

	changeMarkers() {
		this.map.tgLocs.calRandomImages();
		this.map.tgLocs.updateLayer();

		console.log('here!');
	}

	turn(type, on) {
		console.log('type: ' + type + ' on: ' + on);

		switch(type) {
			case 'water':
  			this.map.tgWater.turn(on);
  			break;
  		case 'road':
  			this.map.tgRoads.turn(on);
  			break;
  		case 'landuse':
  			this.map.tgLanduse.turn(on);
  			break;
  		case 'location':
  			this.map.tgLocs.turn(on);
  			break;
  		case 'origin':
  			this.map.tgOrigin.turn(on);
  			break;
  		case 'grid':
  			this.map.tgGrids.turn(on);
  			break;
  		case 'isochrone':
  			this.map.tgIsochrone.turn(on);
  			break;
  		case 'perc':
  			this.map.tgPerc.turn(on);
  			break;

  		case 'gridOriginal':
  			this.map.tgGrids.dispType.o = on;
  			break;
  		case 'gridTarget':
  			this.map.tgGrids.dispType.t = on;
  			break;
  		case 'gridGAP':
  			this.map.tgGrids.dispType.gap = on;
  			break;
  		case 'gridPGAP':
  			this.map.tgGrids.dispType.pgap = on;
  			break;
  		case 'gridCtlPts':
  			this.map.tgGrids.displayControlPoints = on;
  			break;
		}
	}

	updateLayer() {
		this.map.updateLayers();
	}
}

//module.exports = TgApp;