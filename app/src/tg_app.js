const TgData = require('./tg_data');
const TgMap = require('./tg_map');
const TgGraph = require('./tg_graph');

class TgApp {
	constructor(map_id) {
		this.graph = new TgGraph(this);
		this.data = TgData;
		this.map = new TgMap(this, map_id);

	  //this.map.setArea('seattleDowntown');
	  //this.map.setArea('seattleUw');
	  //this.map.setArea('nyNyu');
	  //this.map.setArea('sfLombard');
	}

	setCurrentLocationToOrigin() {
		this.map.setOriginByCurrentLocation();
	}

	setOriginAndGo(param) {
		this.map.setOrigin(param);
	}

	initMap() {
		this.map.initMap();
	}

	goToEm() {
		this.map.goToEm();
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
}

module.exports = TgApp;