const TgNode = require('../node/tg_node');

class TgMapOrigin {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;
		this.origin = null;
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}
	
	render() {
		if (this.isDisabled||(!this.display)) this.removeLayer();
		else this.updateLayer();
	}

	discard() {
		this.removeLayer();
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	setOrigin(lat, lng) {
		this.origin = new TgNode(lat, lng);
	}

	updateLayer() {
		const viz = this.data.viz;
		let arr = [];

		this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.origin.disp.lng, this.origin.disp.lat]), 
			this.mapUtil.imageStyleFunc(viz.image.origin));

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(viz.z.origin);
	  this.mapUtil.addLayer(this.layer);
	}

	calRealNodes() {
		this.calModifiedNodes('real');
	}

	calTargetNodes() {
		this.calModifiedNodes('target');
	}

	calModifiedNodes(kind) {
		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.graph[transformFuncName].bind(this.graph);
		const modified = transform(this.origin.original.lat, this.origin.original.lng);
		this.origin[kind].lat = modified.lat;
		this.origin[kind].lng = modified.lng;
	}

	calDispNodes(kind, value) {
		if (kind === 'intermediateReal') {
			this.origin.disp.lat = 
				(1 - value) * this.origin.original.lat + value * this.origin.real.lat;
			this.origin.disp.lng = 
				(1 - value) * this.origin.original.lng + value * this.origin.real.lng;
		}
		else if (kind === 'intermediateTarget') {
			this.origin.disp.lat = 
				(1 - value) * this.origin.original.lat + value * this.origin.target.lat;
			this.origin.disp.lng = 
				(1 - value) * this.origin.original.lng + value * this.origin.target.lng;
		}
		else {
			this.origin.disp.lat = this.origin[kind].lat;
			this.origin.disp.lng = this.origin[kind].lng;
		}
	}
}

module.exports = TgMapOrigin;