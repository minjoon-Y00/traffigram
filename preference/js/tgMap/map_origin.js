class TGMapOrigin {
	constructor(tg, mapUtil) {
		this.tg = tg;
		this.mapUtil = mapUtil;
		this.isDisabled = false;
		this.display = false;
		this.layer = null;
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

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	updateLayer() {
		let arr = [];

		this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.tg.map.origin.lng, this.tg.map.origin.lat]), 
			this.mapUtil.imageStyleFunc(this.tg.opt.image.origin));

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(this.tg.opt.z.origin);
	  this.mapUtil.addLayer(this.layer);
	}
}