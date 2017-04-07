class TGMapLocs {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.locationTypes = ['food'];
		this.currentType = 'food';
		this.locations = {};
		this.locationLayer = null;
		this.locationNameLayer = null;

		for(let type of this.locationTypes) {
			this.locations[type] = [];
		}
	}

	request() {
		this.tg.map.setTime('locationLoading', 'start', (new Date()).getTime());
		
		const options = {
			term: this.tg.opt.constant.locationType, //'museum', 'food', 'park'
			lat: this.tg.map.centerPosition.lat,
			lng: this.tg.map.centerPosition.lng,
			radius: parseInt(this.tg.map.calMaxDistance('lat') * 1000),
		}

		$.post("http://citygram.smusic.nyu.edu:2999/yelpSearch", options)
		.done((data) => {

			this.tg.map.setTime('locationLoading', 'end', (new Date()).getTime());

			for(let element of data) {
				element.node = new LocationNode(element.lat, element.lng);
				delete element.lat;
				delete element.lng;
			}
		  this.locations[this.currentType] = data;

		  if (this.tg.map.dispLocationLayer) {
		  	this.drawLocationLayer();
		  }

		  if (this.tg.map.dispLocationNameLayer) {
		  	this.drawLocationNameLayer();
		  }

		  console.log('received location data.');
		  //console.log(data);
		});
	}

	drawLocationLayer() {
		var arr = [];
		const anchorStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.anchor, this.tg.opt.radius.anchor);
		const locationStyleFunc = this.mapUtil.imageStyleFunc(this.tg.opt.image.location);
		const lineStyleFunc = 
			this.mapUtil.lineStyleFunc(
				this.tg.opt.color.locationLine, this.tg.opt.width.locationLine);

		for(let loc of this.locations[this.currentType]) {

			if ((loc.node.target.lng != loc.node.dispAnchor.lng) 
				|| (loc.node.target.lat != loc.node.dispAnchor.lat)) {

				// lines
				this.mapUtil.addFeatureInFeatures(arr, 
					new ol.geom.LineString(
						[[loc.node.dispAnchor.lng, loc.node.dispAnchor.lat], 
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]]), lineStyleFunc);

				// anchor images
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point([loc.node.dispAnchor.lng, loc.node.dispAnchor.lat]), anchorStyleFunc);
			}

			// circle images
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([loc.node.dispLoc.lng, loc.node.dispLoc.lat]), locationStyleFunc);
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationLayer);
			this.locationLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationLayer.setZIndex(this.tg.opt.z.location);
		  this.olMap.addLayer(this.locationLayer);
		}
	}

	drawLocationNameLayer() {
		var arr = [];
		
		for(let loc of this.locations[this.currentType]) {
			// only in final EM/DC map
			if ((this.tg.map.frame === 0)||(this.tg.map.frame >= 10)) {
				const nameStyleFunc = 
					this.mapUtil.textStyle(
					loc.name, this.tg.opt.color.textLocation, 
					this.tg.opt.font.text, 17, 0, 'left');

				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point(
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]), nameStyleFunc);
			}
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationNameLayer);
			this.locationNameLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationNameLayer.setZIndex(this.tg.opt.z.location);
		  this.olMap.addLayer(this.locationNameLayer);
		}
	}

	removeLocationLayer() {
		this.mapUtil.removeLayer(this.locationLayer);

		console.log('hey!');
	}

	removeLocationNameLayer() {
		this.mapUtil.removeLayer(this.locationNameLayer);
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
		for(let loc of this.locations[this.currentType]) {
			loc.node.dispAnchor = 
				{lat: (1 - value) * loc.node.original.lat + value * loc.node.real.lat,
				 lng: (1 - value) * loc.node.original.lng + value * loc.node.real.lng }
			loc.node.dispLoc = 
				{lat: (1 - value) * loc.node.original.lat + value * loc.node.target.lat,
				 lng: (1 - value) * loc.node.original.lng + value * loc.node.target.lng }
		}


		/*if (kind === 'intermediateReal') {
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
		}*/
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
			if ((Math.abs(loc.node.disp.lat - lat) <= clickRange.lat)
				&&(Math.abs(loc.node.disp.lng - lng) <= clickRange.lng)) {

				this.updateModal(loc);
				const modal = $('[data-remodal-id=modal]').remodal({});
				modal.open();
				return;
			}
		}

		console.log('no location.');
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

	/*
address
"219 Broadway E, Seattle, WA 98102"
categories
:
"[object Object], [object Object]"
dist
:
4253.7202617719995
imge_url
:
"https://s3-media2.fl.yelpcdn.com/bphoto/X4tDiDhO-Q4JhvFRUaN2-g/o.jpg"
name
:
"Tacos Chukis"
node
:
Node
phone
:
"(206) 328-4447"
price
:
"$"
rating
:
4.5
review_count
:
900
url
:
"https://www.yelp.com/biz/tacos-chukis-seattle?adjust_creative=YbrQpXXmE1UKSUEMMm8ErQ&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=YbrQpXXmE1UKSUEMMm8ErQ"
__p
	*/
}

