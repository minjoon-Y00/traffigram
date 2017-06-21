class TgNode {
	constructor(orgLat, orgLng) {
		this.original = {lat: orgLat, lng:orgLng}
		this.target = {lat: orgLat, lng:orgLng}
		this.real = {lat: orgLat, lng:orgLng}
		this.disp = {lat: orgLat, lng:orgLng}
		// [optional] this.degree = 0
		// [optional] this.travelTime = 0
	}
}

module.exports = TgNode;