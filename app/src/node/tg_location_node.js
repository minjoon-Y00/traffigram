//const TgNode = require('./tg_node');

class TgLocationNode extends TgNode {
	constructor(orgLat, orgLng) {
		super(orgLat, orgLng);
		this.dispAnchor = {lat: orgLat, lng: orgLng};
		this.dispLoc = {lat: orgLat, lng: orgLng};
		this.dispName = true;
		this.nameOffsetX = 0;
		this.nameOffsetY = 0;
		this.nameAlign = 'center';
		this.group = null;
		this.time = 0;
	}

	reset(lat, lng) {
		this.dispAnchor = {lat: lat, lng: lng};
		this.dispLoc = {lat: lat, lng: lng};
		this.group = null;
		this.time = 0;
	}
}

//module.exports = TgLocationNode;