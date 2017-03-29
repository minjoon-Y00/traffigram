class TGMapLocs {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.locationTypes = ['food'];
		this.currentType = 'food';
		this.locations = {};
		this.locationLayer = null;

		for(let type of this.locationTypes) {
			this.locations[type] = [];
		}
	}

	request() {
		console.log('!!!!request');
		const options = {
			term: 'food',
			lat: this.tg.map.centerPosition.lat,
			lng: this.tg.map.centerPosition.lng,
			radius: parseInt(this.tg.map.calMaxDistance('lat') * 1000),
		}

		$.post("http://citygram.smusic.nyu.edu:2999/yelpSearch", options)
		.done((data) => {

			for(let element of data) {
				element.node = new Node(element.lat, element.lng);
				delete element.lat;
				delete element.lng;
			}
		  this.locations[this.currentType] = data;
		  this.drawLocationLayer();

		  console.log('received location data.');
		});
	}

	drawLocationLayer() {
		console.log('!!!!drawLocationLayer');
		var arr = [];

		for(let loc of this.locations[this.currentType]) {
			// circle images
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([loc.node.disp.lng, loc.node.disp.lat]), 
				this.mapUtil.imageStyleFunc(this.tg.opt.image.location));

			// only in DC map
			if (this.tg.map.frame >= 10) {

				if ((loc.node.target.lng != loc.node.disp.lng) 
					|| (loc.node.target.lat != loc.node.disp.lat)) {

					// lines
					this.mapUtil.addFeatureInFeatures(arr, 
						new ol.geom.LineString(
							[[loc.node.disp.lng, loc.node.disp.lat], 
							[loc.node.target.lng, loc.node.target.lat]]), 
							this.mapUtil.lineStyleFunc(this.tg.opt.color.locationLine, 
							this.tg.opt.width.locationLine));

					// anchor images
					this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.Point([loc.node.target.lng, loc.node.target.lat]), 
						this.mapUtil.imageStyleFunc(this.tg.opt.image.anchor));
				}
			}
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationLayer);
			this.locationLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationLayer.setZIndex(this.tg.opt.z.location);
		  this.olMap.addLayer(this.locationLayer);
		}
	}

	removeLocationLayer() {
		this.mapUtil.removeLayer(this.locationLayer);
	}

	calRealNodes() {
		this.calModifiedNodes('real');
	}

	calTargetNodes() {
		//this.calModifiedNodes('target');
		
		const centerLat = this.tg.map.centerPosition.lat;
  	const centerLng = this.tg.map.centerPosition.lng;

		const transformTarget = this.tg.graph.transformTarget.bind(this.tg.graph);
		const transformReal = this.tg.graph.transformReal.bind(this.tg.graph);

		for(let loc of this.locations[this.currentType]) {
			const targetPos = transformTarget(loc.node.original.lat, loc.node.original.lng);
			const realPos = transformReal(loc.node.original.lat, loc.node.original.lng);
			
			const targetLen = this.tg.util.D2(centerLat, centerLng, targetPos.lat, targetPos.lng);
			const realDegree = degreeToCenterPosition(realPos.lat, realPos.lng);

			const targetDegree = degreeToCenterPosition(targetPos.lat, targetPos.lng);


			loc.node.target.lat = centerLat + targetLen * Math.cos(realDegree);
			loc.node.target.lng = 
					centerLng + targetLen * Math.sin(realDegree);
					//centerLng + targetLen * Math.sin(realDegree) * this.tg.graph.toLat();
		}
		
		function degreeToCenterPosition(lat, lng) {
			let deg = Math.atan((lng - centerLng) / (lat - centerLat));
	    if ((centerLat == lat) && (centerLng == lng)) deg = 0;
	    if ((lat - centerLat) < 0) deg = deg + Math.PI;
	    return deg;
		}
	}

	calModifiedNodes(kind) {
		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.tg.graph[transformFuncName].bind(this.tg.graph);

		for(let loc of this.locations[this.currentType]) {
			const modified = transform(loc.node.original.lat, loc.node.original.lng);
			loc.node[kind].lat = modified.lat;
			loc.node[kind].lng = modified.lng;
		}
	}

	calDispNodes(kind, value) {
		if (kind === 'intermediateReal') {
			for(let loc of this.locations[this.currentType]) {
				loc.node.disp.lat = 
					(1 - value) * loc.node.original.lat + value * loc.node.real.lat;
				loc.node.disp.lng = 
					(1 - value) * loc.node.original.lng + value * loc.node.real.lng;
			}
		}
		else if (kind === 'intermediateTarget') {
			for(let loc of this.locations[this.currentType]) {
				loc.node.disp.lat = 
					(1 - value) * loc.node.original.lat + value * loc.node.target.lat;
				loc.node.disp.lng = 
					(1 - value) * loc.node.original.lng + value * loc.node.target.lng;
			}
		}
		else {
			for(let loc of this.locations[this.currentType]) {
				loc.node.disp.lat = loc.node[kind].lat;
				loc.node.disp.lng = loc.node[kind].lng;
			}
		}
	}
}

