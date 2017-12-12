class TgMapIsochrone {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;
		this.highLightLayer = null;
  	this.mobile = (this.data.var.appMode === 'mobile');
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}

	render() {
		if (this.isDisabled||(!this.display)) this.discard();
		else {
			if (this.map.tgLocs.getHighLightMode()) 
				this.updateHighLightLayer(this.map.tgLocs.highLightTime);
			else this.updateLayer();
		}
	}

	discard() {
		if (this.map.tgLocs.getHighLightMode()) this.removeHightLightLayer();
		else this.removeLayer();
	}

	removeHightLightLayer() {
		this.mapUtil.removeLayer(this.highLightLayer);
	}

	updateHighLightLayer(time) {
		if (!this.graph.factor) return;

		const viz = this.data.viz;
		const box = this.data.box;
		const originLat = this.map.tgOrigin.origin.real.lat;
  	const originLng = this.map.tgOrigin.origin.real.lng;
  	const heightLat = box.top - box.bottom; // 0.11
  	const latPerPx = heightLat / this.map.olMapHeightPX;
		const maxTime = (heightLat / 2) * this.graph.factor;
		const pxPerTime = (this.map.olMapHeightPX / 2) / maxTime; // 0.64
		const widthLng = box.right - box.left; // 0.09784
		const lngPerPx = widthLng / this.map.olMapWidthPX;

		const radiusPx = time * pxPerTime;
		let features = [];
		let offsetLng;
		let offsetLat;

		// circle
		this.mapUtil.addFeatureInFeatures(
			features, new ol.geom.Point(
				[originLng, originLat]),
				this.mapUtil.isochroneStyle(radiusPx, 
					viz.color.isochrone, viz.width.highLightIsochrone));

	  // red box
		offsetLng = 0;
		offsetLat = radiusPx * latPerPx;

		this.mapUtil.addFeatureInFeatures(
				features, new ol.geom.Point(
						[originLng + offsetLng, originLat + offsetLat]),
						this.mapUtil.imageStyle(viz.image.red10min),
						'isochrone');
		
		offsetLng = -17 * lngPerPx;
		offsetLat = radiusPx * latPerPx;
		const text = parseInt(time / 60) + '';
		this.mapUtil.addFeatureInFeatures(
				features, new ol.geom.Point(
						[originLng + offsetLng, originLat + offsetLat]),
						this.mapUtil.textStyle({
								text: text, 
								color: viz.color.isochroneText, 
								font: viz.font.isochroneText,
						}), 'isochrone');

		// cancel button
  	offsetLng = 47 * lngPerPx;
		offsetLat = radiusPx * latPerPx
		this.mapUtil.addFeatureInFeatures(
				features, new ol.geom.Point(
						[originLng + offsetLng, originLat + offsetLat]),
						this.mapUtil.imageStyle(viz.image.cancelCustomIsochrone),
						'cancelIsochrone');

		this.removeHightLightLayer();
		this.highLightLayer = this.mapUtil.olVectorFromFeatures(features);
		this.highLightLayer.setZIndex(viz.z.isochrone + 1);
	  this.mapUtil.addLayer(this.highLightLayer);
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	updateLayer() {
		if (!this.graph.factor) return;

		const viz = this.data.viz;
		const box = this.data.box;
		let features = [];
		const originLat = this.map.tgOrigin.origin.real.lat;
  	const originLng = this.map.tgOrigin.origin.real.lng;

  	const heightLat = box.top - box.bottom; // 0.11
  	const latPerPx = heightLat / this.map.olMapHeightPX;
		const maxTime = (heightLat / 2) * this.graph.factor;
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

		let minUnitTime = 0;
		let numIsochrone = 0;


		// (90 min <= maxTime): 30 min * N
		// (60 min <= maxTime < 90 min): 20 min * N
		// (30 min <= maxTime < 60 min): 10 min * N
		// (15 min <= maxTime < 30 min) : 5 min * N
		// (12 min <= maxTime < 15 min): 4 min * 3
		// (9 min <= maxTime < 12 min): 3 min * 3
		// (6 min <= maxTime < 9 min): 2 min * 3
		// (maxTime < 6 min): 1 min * 3

		if (maxTime >= (90 * 60)) {
			minUnitTime = 30 * 60; // 30 min
		}
		else if (maxTime >= (60 * 60)) {
			minUnitTime = 20 * 60; // 20 min
		}
		else if (maxTime >= (30 * 60)) {
			minUnitTime = 10 * 60; // 10 min
		}
		else if (maxTime >= (15 * 60)) {
			minUnitTime = 5 * 60; // 5 min
		}
		else if (maxTime >= (12 * 60)) {
			minUnitTime = 4 * 60; // 4 min
		}
		else if (maxTime >= (9 * 60)) {
			minUnitTime = 3 * 60; // 3 min
		}
		else if (maxTime >= (6 * 60)) {
			minUnitTime = 2 * 60; // 2 min
		}
		else {
			minUnitTime = 1 * 60; // 1 min
		}

		for(let time = 0; time < maxTime; time += minUnitTime) numIsochrone++;

		/*while(numIsochrone > this.data.var.maxNumIsochrone) {
			minUnitTime *= 2;
			numIsochrone /= 2;
		}*/

		for(let num = 0; num < numIsochrone; num++) {
			const time = (num + 1) * minUnitTime; // e.g. 300, 600, ...
			const radiusPx = time * pxPerTime;
			let offsetLng;
			let offsetLat;

			// circle
			this.mapUtil.addFeatureInFeatures(
				features, new ol.geom.Point(
					[originLng, originLat]),
					this.mapUtil.isochroneStyle(radiusPx, 
						viz.color.isochrone, viz.width.isochrone));

			// red box
			if (this.mobile) {
				offsetLng = 0;
				offsetLat = radiusPx * latPerPx;
			}
			else {
				offsetLng = (radiusPx + 33) * lngPerPx;
				offsetLat = 0;
			}
			console.log('new');
			
			this.mapUtil.addFeatureInFeatures(
					features, new ol.geom.Point(
							[originLng + offsetLng, originLat + offsetLat]),
							this.mapUtil.imageStyle(viz.image.red10min),
							'isochrone', time);

			// text
			if (this.mobile) {
				offsetLng = -this.data.var.isochroneTextPx * lngPerPx;
				offsetLat = radiusPx * latPerPx;
			}
			else {
				offsetLng = (radiusPx + 19) * lngPerPx;
				offsetLat = 0; //-this.data.var.isochroneTextPx * lngPerPx;
			}
			
			const text = (time / 60) + '';
			this.mapUtil.addFeatureInFeatures(
					features, new ol.geom.Point(
							[originLng + offsetLng, originLat + offsetLat]),
							this.mapUtil.textStyle({
									text: text, 
									color: viz.color.isochroneText, 
									font: viz.font.isochroneText,
							}),
					'isochrone', time);
		}

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(features);
		this.layer.setZIndex(viz.z.isochrone);
	  this.mapUtil.addLayer(this.layer);
	}
}

//module.exports = TgMapIsochrone;