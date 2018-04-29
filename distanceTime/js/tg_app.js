class TgApp {
	constructor(map_id) {
		this.data = TgData;
		this.map = new TgMap(this, map_id);
	}

	cal() {
		this.map.tgDistTime.cal();
	}

	run() {
		this.map.tgDistTime.run();
	}

	initMap() {
		this.map.initMap();
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

	turn(type, on) {
		//console.log('type: ' + type + ' on: ' + on);

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
		}
	}

	updateLayer() {
		this.map.updateLayers();
	}
}