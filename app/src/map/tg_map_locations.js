const tgUtil = require('../tg_util');
const TgLocationNode = require('../node/tg_location_node');

class TgMapLocations {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.dispNameLayer = true;
		this.nameLayer = null;

		this.locationTypes = ['food', 'bar', 'park', 'museum'];
		this.currentType = 'food';
		this.locations = {};
		this.locationClusters = {};
	  this.needToDisplayLocs = false;

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
			this.discard();
		}
		else {
			this.updateLayer();
			if (this.dispNameLayer) this.updateNameLayer();
		}
	}

	discard() {
		this.removeLayer();
		this.removeNameLayer();
	}

	initLocations() {
		for(let type of this.locationTypes) {
			this.locations[type] = [];
			this.locationClusters[type] = [];
		}
	}

	request() {
		this.readyLocs = false;
		this.data.var.readyLocation = false;
		
		const options = {
			term: this.currentType,
			lat: this.map.tgOrigin.origin.original.lat,
			lng: this.map.tgOrigin.origin.original.lng,
			radius: parseInt(this.map.calMaxDistance('lat') * 1000), // 1000
		}

		const s = (new Date()).getTime();

		$.post("http://citygram.smusic.nyu.edu:2999/yelpSearch", options)
		.done((locations) => {

			const elapsed = (new Date()).getTime() - s;
			console.log('received: locations (' + elapsed + ' ms)');

			// calculate tgLocationNode of locations
			for(let loc of locations) {
				loc.node = new TgLocationNode(loc.lat, loc.lng);
				delete loc.lat;
				delete loc.lng;
			}

			// calculate BB of locations
			this.map.tgBB.calBBOfLocations(locations);

			// calculate clusters of locations
			const locationClusters = this.map.tgBB.calClusteredLocations(locations);

			// calculate average node in clusterLocations
			this.map.tgBB.updateNodeOfClusteredLocations(locationClusters);

			// calculate BB for clusterLocations
			this.map.tgBB.calBBOfClusterLocations(locationClusters);

			// calculate non-overlapped location names
			this.map.tgBB.calNonOverlappedLocationNames(locations, locationClusters);


			// assign locations and locationClusters
		  this.locations[this.currentType] = locations;
			this.locationClusters[this.currentType] = locationClusters;


			console.log('clusteredLocations: ');
			console.log(locationClusters);


			// 

			//this.disabled(false);
			//this.map.tgBB.cleanBB();
			//this.map.tgBB.deleteBBByType('location');
			//this.map.tgBB.deleteBBByType('locationluster');
			//this.map.tgBB.deleteBBByType('locationName');

			// save non-overlapped locations
			//locations = this.map.tgBB.getNonOverlappedLocations(locations);

			//const locationClusters = this.map.tgBB.calClusteredLocations2(locations);
			//this.locationClusters[this.currentType] = locationClusters;



		  //this.map.tgBB.calNonOverlappedLocationNames(locationClusters);

		  if (this.map.currentMode !== 'EM') {
		  	if (!this.map.tpsReady) {
		  		console.log('@ Not ready so wait.');
		  		this.needToDisplayLocs = true;
		  	}
		  	else {
					this.displayLocsInDc();
				}
		  }
		  else {
		  	this.render();
		  	this.map.tgBB.render();
		  }

			this.data.var.readyLocation = true;

			if (!this.data.var.placeProcessed) {
				this.map.tgPlaces.processNewPlaceObjects();
			}

		});
	}

	displayLocsInDc() {
		console.log('@ displayLocsInDc');
		this.calTargetNodes();
		this.calRealNodes();
		this.calDispNodes(null, 1);

		this.map.tgBB.cleanBB();
		this.map.tgBB.addBBOfLocations();
		this.updateNonOverlappedLocationNames();

		this.render();
  	this.map.tgBB.render();
	}

	changeType(type) {
		if (this.currentType === type) return;

		this.currentType = type;
		if (this.locations[this.currentType].length === 0) {
			this.request();
		}
		else {
			this.map.tgBB.cleanBB();
			this.map.tgBB.addBBOfLocations();
			this.updateNonOverlappedLocationNames();

			this.render();
		  this.map.tgBB.render();
		}
	}

	getCurrentLocations() {
		return this.locations[this.currentType];
	}

	getCurrentLocationClusters() {
		return this.locationClusters[this.currentType];
	}

	updateNonOverlappedLocationNames() {
		this.locations[this.currentType] = 
				this.map.tgBB.getNonOverlappedLocationNames(this.locations[this.currentType]);
	}

	updateLayer() {
		const viz = this.data.viz;
		var arr = [];
		const anchorStyleFunc = 
			this.mapUtil.nodeStyleFunc(viz.color.anchor, viz.radius.anchor);
		const locationStyleFunc = 
			this.mapUtil.imageStyleFunc(viz.image.location[this.currentType]);
		const locationClusterStyleFunc = 
			this.mapUtil.imageStyleFunc(viz.image.location.cluster);
		const lineStyleFunc = 
			this.mapUtil.lineStyleFunc(viz.color.locationLine, viz.width.locationLine);

		// display locationClusters
		for(let cLocs of this.locationClusters[this.currentType]) {
			const dispLoc = cLocs.node.dispLoc;
			const dispAnchor = cLocs.node.dispAnchor;

			// lines
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.LineString(
					[[dispAnchor.lng, dispAnchor.lat], [dispLoc.lng, dispLoc.lat]]), 
				lineStyleFunc);

			// anchor images
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispAnchor.lng, dispAnchor.lat]), 
				anchorStyleFunc);

			// circle images
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), locationClusterStyleFunc);
		}

		// display locations
		for(let loc of this.locations[this.currentType]) {

			// pass though if the location in the cluster
			if (loc.isInCluster) continue;

			const dispLoc = loc.node.dispLoc;
			const dispAnchor = loc.node.dispAnchor;

			// lines
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.LineString(
					[[dispAnchor.lng, dispAnchor.lat], [dispLoc.lng, dispLoc.lat]]), 
				lineStyleFunc);

			// anchor images
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispAnchor.lng, dispAnchor.lat]), 
				anchorStyleFunc);

			// circle images
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), locationStyleFunc);
		}

		if (arr.length > 0) {
			this.removeLayer();
			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.location);
		  this.mapUtil.addLayer(this.layer);
		}
	}

	updateNameLayer() {
		const viz = this.data.viz;
		var arr = [];
		
		for(let loc of this.locations[this.currentType]) {
			if (!loc.dispName) continue;

			// only in final EM/DC map
			if (this.map.currentMode !== 'INTERMEDIATE') {
				const nameStyleFunc = 
					this.mapUtil.textStyle({
						text: loc.name, 
						color: viz.color.textLocation, 
						font: viz.font.text, 
						offsetX: loc.nameOffsetX, 
						offsetY: loc.nameOffsetY, 
						align: loc.nameAlign
					});

				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point(
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]), nameStyleFunc);
			}
		}

		if (arr.length > 0) {
			this.removeNameLayer();
			this.nameLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.nameLayer.setZIndex(viz.z.location);
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
		const transform = this.graph.transformReal.bind(this.graph);

		for(let loc of this.locations[this.currentType]) {
			const modified = transform(loc.node.original.lat, loc.node.original.lng);
			loc.node.real.lat = modified.lat;
			loc.node.real.lng = modified.lng;
		}
	}

	calTargetNodes() {
		const originLat = this.map.tgOrigin.origin.original.lat;
  	const originLng = this.map.tgOrigin.origin.original.lng;
		const transformTarget = this.graph.transformTarget.bind(this.graph);
		const transformReal = this.graph.transformReal.bind(this.graph);

		for(let loc of this.locations[this.currentType]) {
			const targetPos = transformTarget(loc.node.original.lat, loc.node.original.lng);
			const realPos = transformReal(loc.node.original.lat, loc.node.original.lng);
			const targetLen = tgUtil.D2(originLat, originLng, targetPos.lat, targetPos.lng);
			const realDegree = degreeToOrigin(realPos.lat, realPos.lng);

			loc.node.target.lat = originLat + targetLen * Math.cos(realDegree);
			loc.node.target.lng = 
					originLng + targetLen * Math.sin(realDegree);
					//originLng + targetLen * Math.sin(realDegree) * this.graph.toLat();
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
		const heightLat = this.data.box.top - this.data.box.bottom;
		const latPerPx = heightLat / heightPX;

		let widthPX = $('#ol_map').css('width');  
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2));
  	const widthLng = this.data.box.right - this.data.box.left;
		const lngPerPx = widthLng / widthPX;

		const clickRange = {
			lat: this.data.var.clickRangePX * latPerPx,
			lng: this.data.var.clickRangePX * lngPerPx,
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

		const time = this.map.calTimeFromLatLng(
				loc.node.target.lat, loc.node.target.lng);
				//loc.node.original.lat, loc.node.original.lng);

		if (time > 0) {
			$('#modal-travel-time').text('appr. ' + parseInt(time / 60) + ' min.');
		}
		else {
			$('#modal-travel-time').text('-');
		}
	}

	addBBToLocations() {
		const iconLatPx = 50;
		const iconLngPx = 55;
		const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
		const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;
		const disp = this.origin.disp;

		this.bb = {
			left: disp.lng - dLng, 
			right: disp.lng + dLng,
			top: disp.lat - dLat,
			bottom: disp.lat + dLat,
		};
	}
}

module.exports = TgMapLocations;