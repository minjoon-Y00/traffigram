class TGMapIsochrone {
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
		if (this.isDisabled||(!this.display)) this.discard();
		else this.updateLayer();
	}

	discard() {
		this.removeLayer();
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	updateLayer() {
		if (!this.tg.graph.factor) return;

		console.log('@ isochrone updateLayer');

		const opt = this.tg.opt;
		let features = [];
		const originLat = this.tg.map.tgOrigin.origin.real.lat;
  	const originLng = this.tg.map.tgOrigin.origin.real.lng;

  	const heightLat = opt.box.top - opt.box.bottom; // 0.11
  	const maxTime = 
  		this.tg.map.calTimeFromLatLng(originLat + heightLat/2, originLng); // 749.4
		const pxPerTime = (this.tg.map.olMapHeightPX / 2) / maxTime; // 0.64

		const widthLng = opt.box.right - opt.box.left; // 0.09784
		const lngPerPx = widthLng / this.tg.map.olMapWidthPX;

		/*const latPerTime = (heightLat / 2) / maxTime; // 0.056
		const maxLngTime = 
			this.tg.map.calTimeFromLatLng(originLat, originLng + widthLng/2);
		const lngPerTime = (widthLng / 2) / maxLngTime;
		console.log('lngPerPx: ' + lngPerPx);
		console.log('widthLng: ' + widthLng);
		console.log('maxLngTime: ' + maxLngTime);
		console.log('lngPerTime: ' + lngPerTime);*/

		let minUnitTime = 300; // 5 min
		let numIsochrone = 0;
		for(let time = 0; time < maxTime; time += minUnitTime) numIsochrone++;

		if (numIsochrone > 8) {
			minUnitTime *= 2;
			numIsochrone /= 2;
		}

		for(let num = 0; num < numIsochrone; num++) {
			const time = (num + 1) * minUnitTime; // e.g. 300, 600, ...
			const radiusPx = time * pxPerTime;

			// circle
			this.mapUtil.addFeatureInFeatures(
				features, new ol.geom.Point(
					[originLng, originLat]),
					this.mapUtil.isochroneStyle(radiusPx, opt.color.isochrone, opt.width.isochrone));

			// red box
			let offsetLng = (radiusPx + 3) * lngPerPx
			this.mapUtil.addFeatureInFeatures(
					features, new ol.geom.Point(
							[originLng + offsetLng, originLat]),
							this.mapUtil.imageStyle(opt.image.red10min));

			// text
			offsetLng = (radiusPx - 13) * lngPerPx;
			const text = (time / 60) + '';
			this.mapUtil.addFeatureInFeatures(
					features, new ol.geom.Point(
							[originLng + offsetLng, originLat]),
							this.mapUtil.textStyle(text, opt.color.isochroneText, opt.font.isochroneText));
		}

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(features);
		this.layer.setZIndex(this.tg.opt.z.isochrone);
	  this.mapUtil.addLayer(this.layer);
	}
}