//const TgNode = require('./tg_node');

class TgControlPoint extends TgNode {
	constructor(orgLat, orgLng) {
		super(orgLat, orgLng);
		this.connectedNodes = [];
		this.connectedGrids = [];
		this.index = -1;
		this.intersected = false;
	}
}

//module.exports = TgControlPoint;