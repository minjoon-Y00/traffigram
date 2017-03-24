class TGMapAux {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg
		this.olMap = olMap
		this.mapUtil = mapUtil

		this.centerPositionLayer = null
	}

	//
	// center position layer
	//
	drawCenterPositionLayer() {
		var arr = []

		this.mapUtil.removeLayer(this.centerPositionLayer)

		this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.tg.map.centerPosition.lng, this.tg.map.centerPosition.lat]), 
			this.mapUtil.imageStyleFunc(this.tg.opt.image.center))

		this.centerPositionLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.centerPositionLayer.setZIndex(this.tg.opt.z.centerPosition)
	  this.olMap.addLayer(this.centerPositionLayer)
	}

	removeCenterPositionLayer() {
		this.mapUtil.removeLayer(this.centerPositionLayer)
	}

	drawIsochroneLayer() {
		
		if (!this.tg.graph.factor) return;

		this.mapUtil.removeLayer(this.isochroneLayer);

		const opt = this.tg.opt;
		let features = [];
		const centerLat = this.tg.map.centerPosition.lat;
  	const centerLng = this.tg.map.centerPosition.lng;

		

		
		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2)); // 960
  	const heightLat = opt.box.top - opt.box.bottom; // 0.11
  	const maxTime = this.calTimeFromLatLng(centerLat + heightLat/2, centerLng); // 749.4

  	/*
  	let widthPX = $('#ol_map').css('width');  
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2)); //
  	const widthLng = opt.box.right - opt.box.left; // 0.0967
  	const halfWidthPX = widthPX / 2; //
  	*/

		const pxPerTime = (heightPX / 2) / maxTime; // 0.64
		const latPerTime = (heightLat / 2) / maxTime; // 0.056

		// 749 -> 700 -> 150(2.5m), 300(5m), 450(7.5m), 600(10m)
		// 1400 -> 300(5m) 600(10m), 900(15m) 1200(20m)
		// 600, 1200, 1800, 2400

		let quantizedMaxTime = 300;
		while(quantizedMaxTime < maxTime) quantizedMaxTime += 300;
		quantizedMaxTime -= 300; // e.g.600

		// quantizedMaxTime: 300 -> numCircle: 5 ( * 60)
		// quantizedMaxTime: 600 -> numCircle: 5 ( * 120)
		// quantizedMaxTime: 900 -> numCircle: 5 ( * 180)

		const dTime = quantizedMaxTime / 5; // e.g.120

		for(let num = 1; num <= 5; num++) {
			const time = num * dTime; // e.g. 120, 240, 360, 480, 600
			// circle
			const clr = 
					'rgba(255,0,0,' + (opt.alpha.isochrone * this.tg.map.frame * 0.1) + ')';
			this.mapUtil.addFeatureInFeatures(
					features,
					new ol.geom.Point(
							[centerLng, centerLat]),
							this.mapUtil.isochroneStyle(time * pxPerTime, clr, opt.width.isochrone));
		}

		// only in DC map
		if (this.tg.map.frame >= 10) {
			for(let num = 1; num <= 5; num++) {
				const time = num * dTime; // e.g. 150, 300, 450, 600

				// red box
				this.mapUtil.addFeatureInFeatures(
						features,
						new ol.geom.Point(
								[centerLng, centerLat + (time - 30) * latPerTime]),
								this.mapUtil.imageStyle(opt.image.redBackground));

				// text
				this.mapUtil.addFeatureInFeatures(
						features,
						new ol.geom.Point(
								[centerLng, centerLat + (time - 30) * latPerTime]),
								this.mapUtil.textStyle(time + '', opt.color.isochroneText, opt.font.isochroneText));
			}
		}

		//console.log('widthLng: ' + widthLng);
		//console.log('halfHeightPX: ' + halfHeightPX);
		//console.log('px: ' + px);
		console.log('maxTime: ' + maxTime);
		console.log('quantizedMaxTime: ' + quantizedMaxTime);
		console.log('dTime: ' + dTime);

		this.isochroneLayer = this.mapUtil.olVectorFromFeatures(features);
		this.isochroneLayer.setZIndex(this.tg.opt.z.isochrone);
	  this.olMap.addLayer(this.isochroneLayer);
	}

	

	calTimeFromLatLng(lat, lng) {
		const centerLat = this.tg.map.centerPosition.lat;
  	const centerLng = this.tg.map.centerPosition.lng;
  	return this.tg.util.D2(centerLat, centerLng, lat, lng) * this.tg.graph.factor;
	}

	
}

