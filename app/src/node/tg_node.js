class TgNode {
	constructor(lat, lng) {
		this.original = {lat: lat, lng: lng}
		this.target = {lat: lat, lng: lng}
		this.real = {lat: lat, lng: lng}
		this.disp = {lat: lat, lng: lng}
		// [optional] this.degree = 0
		// [optional] this.travelTime = 0
	}

	set(lat, lng) {
		this.original.lat = lat;
		this.original.lng = lng;
		this.target.lat = lat;
		this.target.lng = lng;
		this.real.lat = lat;
		this.real.lng = lng;
		this.disp.lat = lat;
		this.disp.lng = lng;
	}
}

//module.exports = TgNode;