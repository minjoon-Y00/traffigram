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
}

module.exports = TgApp;