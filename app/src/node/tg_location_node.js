const TgNode = require('./tg_node');

class TgLocationNode extends TgNode {
	constructor(orgLat, orgLng) {
		super(orgLat, orgLng);
		this.dispAnchor = {lat: orgLat, lng: orgLng};
		this.dispLoc = {lat: orgLat, lng: orgLng};
		this.dispName = true;
		this.nameOffsetX = 0;
		this.nameOffsetY = 0;
		this.nameAlign = 'center';
	}
}

module.exports = TgLocationNode;