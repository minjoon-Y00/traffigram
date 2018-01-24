//const TgData = require('./tg_data');
//const TgMap = require('./tg_map');
//const TgGraph = require('./tg_graph');

class TgApp {
	constructor(map_id) {
		console.log(TgData);
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