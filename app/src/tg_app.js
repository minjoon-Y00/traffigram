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

//module.exports = TgApp;