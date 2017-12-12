//const TgNode = require('../node/tg_node');

class EvalOrigin {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.display = true;
		this.layer = null;
		this.origin = null;
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	setOrigin(lat, lng) {
		if (!this.origin) {
			this.origin = new TgNode(lat, lng);
		}
		else {
			this.origin.set(lat, lng);
		}
	}

	getOrigin() {
		return this.origin;
	}

	updateLayer(param) {
		const viz = this.data.viz;
		let arr = [];

		this.feature = this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.origin.disp.lng, this.origin.disp.lat]), 
				this.mapUtil.imageStyleFunc(
					viz.image.origin.auto, 1.0),
			'origin');

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(viz.z.origin);
	  this.mapUtil.addLayer(this.layer);
	}
	
}
