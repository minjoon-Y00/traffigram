class TGMapLocs {
	constructor(tg, mapUtil) {
		this.tg = tg;
		this.mapUtil = mapUtil;
		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.dispNameLayer = true;
		this.nameLayer = null;

		this.locationTypes = ['food', 'bar', 'park', 'museum'];
		this.currentType = 'food';
		this.locations = {};

		this.initLocations();
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}

	render() {
		if (this.isDisabled||(!this.display)) {
			this.removeLayer();
			this.removeNameLayer();
		}
		else {
			this.updateLayer();
			if (this.dispNameLayer) this.updateNameLayer();
		}
	}

	initLocations() {
		for(let type of this.locationTypes) {
			this.locations[type] = [];
		}
	}

	request() {
		this.tg.map.setTime('locationLoading', 'start', (new Date()).getTime());
		
		const options = {
			term: this.currentType,
			lat: this.tg.map.origin.lat,
			lng: this.tg.map.origin.lng,
			radius: parseInt(this.tg.map.calMaxDistance('lat') * 1000),
		}

		$.post("http://citygram.smusic.nyu.edu:2999/yelpSearch", options)
		.done((locations) => {

			this.tg.map.setTime('locationLoading', 'end', (new Date()).getTime());

			//this.disabled(false);
			this.tg.map.tgBB.cleanBB();

			// save non-overlapped locations
			locations = this.tg.map.tgBB.getNonOverlappedLocations(locations);

			for(let element of locations) {
				element.node = new LocationNode(element.lat, element.lng);
				delete element.lat;
				delete element.lng;
			}

		  locations = this.tg.map.tgBB.getNonOverlappedLocationNames(locations);
		  this.locations[this.currentType] = locations;

		  if (this.tg.map.currentMode === 'DC') {
				this.calTargetNodes();
	  		this.calRealNodes();
	  		this.calDispNodes(null, 1);

	  		this.tg.map.tgBB.cleanBB();
				this.tg.map.tgBB.addBBOfLocations();
				this.updateNonOverlappedLocationNames();
		  }

		  this.render();
		  this.tg.map.tgBB.render();
		});
	}

	changeType(type) {
		if (this.currentType === type) return;

		this.currentType = type;
		if (this.locations[this.currentType].length === 0) {
			this.request();
		}
		else {
			this.tg.map.tgBB.cleanBB();
			this.tg.map.tgBB.addBBOfLocations();
			this.tg.map.tgLocs.updateNonOverlappedLocationNames();

			this.render();
		  this.tg.map.tgBB.render();
		}
	}

	updateNonOverlappedLocationNames() {
		this.locations[this.currentType] = 
				this.tg.map.tgBB.getNonOverlappedLocationNames(this.locations[this.currentType]);
	}

	updateLayer() {
		var arr = [];
		const anchorStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.anchor, this.tg.opt.radius.anchor);
		const locationStyleFunc = 
				this.mapUtil.imageStyleFunc(this.tg.opt.image.location[this.currentType]);
		const lineStyleFunc = 
			this.mapUtil.lineStyleFunc(
				this.tg.opt.color.locationLine, this.tg.opt.width.locationLine);

		for(let loc of this.locations[this.currentType]) {

			//if ((loc.node.target.lng != loc.node.dispAnchor.lng) 
			//	|| (loc.node.target.lat != loc.node.dispAnchor.lat)) {

				// lines
				this.mapUtil.addFeatureInFeatures(arr, 
					new ol.geom.LineString(
						[[loc.node.dispAnchor.lng, loc.node.dispAnchor.lat], 
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]]), lineStyleFunc);

				// anchor images
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point([loc.node.dispAnchor.lng, loc.node.dispAnchor.lat]), anchorStyleFunc);
			//}
 
			// circle images
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([loc.node.dispLoc.lng, loc.node.dispLoc.lat]), locationStyleFunc);
		}

		if (arr.length > 0) {
			this.removeLayer();
			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(this.tg.opt.z.location);
		  this.mapUtil.addLayer(this.layer);
		}
	}

	updateNameLayer() {
		var arr = [];
		
		for(let loc of this.locations[this.currentType]) {
			if (!loc.dispName) continue;

			// only in final EM/DC map
			if ((this.tg.map.frame === 0)||(this.tg.map.frame >= 10)) {
				const nameStyleFunc = 
					this.mapUtil.textStyle(
					loc.name, this.tg.opt.color.textLocation, 
					this.tg.opt.font.text, loc.nameOffsetX, loc.nameOffsetY, loc.nameAlign);

				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point(
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]), nameStyleFunc);
			}
		}

		if (arr.length > 0) {
			this.removeNameLayer();
			this.nameLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.nameLayer.setZIndex(this.tg.opt.z.location);
		  this.mapUtil.addLayer(this.nameLayer);
		}
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	removeNameLayer() {
		this.mapUtil.removeLayer(this.nameLayer);
	}

	calRealNodes() {
		const transform = this.tg.graph.transformReal.bind(this.tg.graph);

		for(let loc of this.locations[this.currentType]) {
			const modified = transform(loc.node.original.lat, loc.node.original.lng);
			loc.node.real.lat = modified.lat;
			loc.node.real.lng = modified.lng;
		}
	}

	calTargetNodes() {
		const originLat = this.tg.map.origin.lat;
  	const originLng = this.tg.map.origin.lng;
		const transformTarget = this.tg.graph.transformTarget.bind(this.tg.graph);
		const transformReal = this.tg.graph.transformReal.bind(this.tg.graph);

		for(let loc of this.locations[this.currentType]) {
			const targetPos = transformTarget(loc.node.original.lat, loc.node.original.lng);
			const realPos = transformReal(loc.node.original.lat, loc.node.original.lng);
			const targetLen = this.tg.util.D2(originLat, originLng, targetPos.lat, targetPos.lng);
			const realDegree = degreeToOrigin(realPos.lat, realPos.lng);

			loc.node.target.lat = originLat + targetLen * Math.cos(realDegree);
			loc.node.target.lng = 
					originLng + targetLen * Math.sin(realDegree);
					//originLng + targetLen * Math.sin(realDegree) * this.tg.graph.toLat();
		}
		
		function degreeToOrigin(lat, lng) {
			let deg = Math.atan((lng - originLng) / (lat - originLat));
	    if ((originLat == lat) && (originLng == lng)) deg = 0;
	    if ((lat - originLat) < 0) deg = deg + Math.PI;
	    return deg;
		}
	}

	calDispNodes(kind, value) {
		for(let loc of this.locations[this.currentType]) {
			loc.node.dispAnchor = 
				{lat: (1 - value) * loc.node.original.lat + value * loc.node.real.lat,
				 lng: (1 - value) * loc.node.original.lng + value * loc.node.real.lng }
			loc.node.dispLoc = 
				{lat: (1 - value) * loc.node.original.lat + value * loc.node.target.lat,
				 lng: (1 - value) * loc.node.original.lng + value * loc.node.target.lng }
		}
	}

	showModal(lat, lng) {

		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2));
		const heightLat = this.tg.opt.box.top - this.tg.opt.box.bottom;
		const latPerPx = heightLat / heightPX;

		let widthPX = $('#ol_map').css('width');  
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2));
  	const widthLng = this.tg.opt.box.right - this.tg.opt.box.left;
		const lngPerPx = widthLng / widthPX;

		const clickRange = {
			lat: this.tg.opt.constant.clickRangePX * latPerPx,
			lng: this.tg.opt.constant.clickRangePX * lngPerPx,
		};

		for(let loc of this.locations[this.currentType]) {
			if ((Math.abs(loc.node.dispLoc.lat - lat) <= clickRange.lat)
				&&(Math.abs(loc.node.dispLoc.lng - lng) <= clickRange.lng)) {

				this.updateModal(loc);
				const modal = $('[data-remodal-id=modal]').remodal({});
				modal.open();
				return;
			}
		}

		console.log('no infomation on this location.');
	}

	updateModal(loc) {
		$('#modal-name').text(loc.name);
		$('#modal-img').attr('src', loc.imge_url);
		$('#modal-category').text(loc.categories);
		$('#modal-address').text(loc.address);
		$('#modal-phone').text(loc.phone);
		$('#modal-price').text(loc.price);
		$('#modal-rating').text(loc.rating);
		$('#modal-review-count').text(loc.rating);
		$('#modal-yelp-url').attr('href', loc.url);
		$('#modal-distance').text('appr. ' + parseInt(loc.dist / 1000) + ' km');

		const time = this.tg.map.calTimeFromLatLng(
				loc.node.original.lat, loc.node.original.lng);

		if (time > 0) {
			$('#modal-travel-time').text('appr. ' + parseInt(time / 60) + ' min.');
		}
		else {
			$('#modal-travel-time').text('-');
		}
	}
}

