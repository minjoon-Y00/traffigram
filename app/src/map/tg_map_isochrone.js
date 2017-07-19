class TgMapIsochrone {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

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
		if (!this.graph.factor) return;

		console.log('@ isochrone updateLayer');

		const viz = this.data.viz;
		const box = this.data.box;
		let features = [];
		const originLat = this.map.tgOrigin.origin.real.lat;
  	const originLng = this.map.tgOrigin.origin.real.lng;

  	const heightLat = box.top - box.bottom; // 0.11
  	const latPerPx = heightLat / this.map.olMapHeightPX;
  	const maxTime = 
  		this.map.calTimeFromLatLng(originLat + heightLat/2, originLng); // 749.4
		const pxPerTime = (this.map.olMapHeightPX / 2) / maxTime; // 0.64

		const widthLng = box.right - box.left; // 0.09784
		const lngPerPx = widthLng / this.map.olMapWidthPX;

		/*const latPerTime = (heightLat / 2) / maxTime; // 0.056
		const maxLngTime = 
			this.map.calTimeFromLatLng(originLat, originLng + widthLng/2);
		const lngPerTime = (widthLng / 2) / maxLngTime;
		console.log('lngPerPx: ' + lngPerPx);
		console.log('widthLng: ' + widthLng);
		console.log('maxLngTime: ' + maxLngTime);
		console.log('lngPerTime: ' + lngPerTime);*/

		let minUnitTime = 300; // 5 min
		let numIsochrone = 0;
		for(let time = 0; time < maxTime; time += minUnitTime) numIsochrone++;

		while(numIsochrone > 8) {
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
					this.mapUtil.isochroneStyle(radiusPx, 
						viz.color.isochrone, viz.width.isochrone));

			// red box
			//let offsetLng = (radiusPx + 3) * lngPerPx
			let offsetLng = 0;
			let offsetLat = radiusPx * latPerPx
			this.mapUtil.addFeatureInFeatures(
					features, new ol.geom.Point(
							[originLng + offsetLng, originLat + offsetLat]),
							this.mapUtil.imageStyle(viz.image.red10min));

			// text
			//offsetLng = (radiusPx - 13) * lngPerPx;
			offsetLng = -17 * lngPerPx;
			offsetLat = radiusPx * latPerPx;
			const text = (time / 60) + '';
			this.mapUtil.addFeatureInFeatures(
					features, new ol.geom.Point(
							[originLng + offsetLng, originLat + offsetLat]),
							this.mapUtil.textStyle({
									text: text, 
									color: viz.color.isochroneText, 
									font: viz.font.isochroneText,
								}));
		}

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(features);
		this.layer.setZIndex(viz.z.isochrone);
	  this.mapUtil.addLayer(this.layer);
	}
}

module.exports = TgMapIsochrone;