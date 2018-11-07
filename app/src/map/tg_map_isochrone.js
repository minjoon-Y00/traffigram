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

	calIsochrone() {
		const ctrPts = this.map.tgControl.controlPoints;

		// let maxTime = 0;
		// for(let pt of ctrPts)
		// 	if (maxTime < pt.travelTime) maxTime = pt.travelTime;
		// console.log('maxTime: ' + maxTime);

		const intervals = [1, 2, 3, 4, 5, 10, 15, 20, 30];
		for(let itv = 0; itv < intervals.length; ++itv) intervals[itv] *= 60;

		let minDist = 987654321; 
		let minItv = -1;
		let minTimes = -1;

		for(let itv of intervals) {
			for(let times = 3; times <= 5; ++times) {

				let sum = 0;
				for(let pt of ctrPts) {
					if (!pt.travelTime) continue;

					let minDif = 987654321;
					for(let i = 0; i <= times; ++i) {
						const dif = Math.abs(pt.travelTime - itv * i);
						if (dif < minDif) minDif = dif;
					}
					sum += minDif;
					//if (sum > minDist) break;
				}
				
				// console.log(itv + ' ' + times + ' = ' + sum);

				if (sum < minDist) {
					minDist = sum;
					minItv = itv;
					minTimes = times;
				}
			}
		}

		//console.log('minItv: ' + minItv);
		//console.log('minTimes: ' + minTimes);

		return {interval: minItv, num: minTimes};
	}

	updateLayer() {
		if (!this.graph.factor) return;
		const itvNum = this.calIsochrone();
		this.drawIsochrone(itvNum);
	}
		
	drawIsochrone(itvNum) {

	/*	console.log('control points', this.map.tgControl.controlPoints);

		const org = {lat: this.map.tgOrigin.origin.original.lat, 
			  lng: this.map.tgOrigin.origin.original.lng};

		let sumD = 0;
		let sumT = 0;
		let idx = 0;
		for(let pt of this.map.tgControl.controlPoints) {

			pt.target.m = TgUtil.distance(org.lat, org.lng, pt.target.lat, pt.target.lng) * 1000;
			idx++;
			if (!pt.travelTime) continue;

			sumT += pt.travelTime;
	  	sumD += pt.target.m;

	  	const t = pt.travelTime;
	  	const d = pt.target.m;
			console.log((idx - 1) + ' T_D: ' + (t / d));

		}

		const sumT_D = sumT / sumD;
		console.log('sumT_D: ' + sumT_D);

	  const d = TgUtil.distance(org.lat, org.lng, 
	  		org.lat + (this.data.box.heightLat / 2), org.lng) * 1000;
	  console.log('d * sumT_D: ' + d * sumT_D);
*/

		const viz = this.data.viz;
		let features = [];
		const originLat = this.map.tgOrigin.origin.original.lat;
  	const originLng = this.map.tgOrigin.origin.original.lng;
		const lngPerPx = this.data.box.widthLng  / this.map.olMapWidthPX;
		//const maxTime = (this.data.box.heightLat / 2) * this.graph.factor;
		//const maxTime = (this.data.box.widthLng / 2) * this.graph.factor;
		//const maxTime = d * sumT_D;
		//const pxPerTime = (this.map.olMapHeightPX / 2) / maxTime; // 0.64

		//console.log('maxTime2: ' + maxTime);
		//console.log('pxPerTime: ' + pxPerTime);
		//console.log('')

		// maxTime2: 494.33920460317927
		// maxTime: 1058.9

		/*
		node.len = node.travelTime / this.factor;

				const yPx = this.tg.map.hMapHalfPx + node.len * Math.cos(node.deg);
				const xPx = this.tg.map.wMapHalfPx + node.len * Math.sin(node.deg);
	    	const latlng = this.tg.map.pxToLatlng(yPx, xPx);
		*/



		for(let num = 0; num < itvNum.num; num++) {
			const time = (num + 1) * itvNum.interval; // e.g. 300, 600, ...
			//const radiusPx = time * pxPerTime;
			const radiusPx = time / this.graph.factor;
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


	updateLayer_old() {
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