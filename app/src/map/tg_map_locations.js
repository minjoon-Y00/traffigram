//const TgUtil = require('../tg_util');
//const TgLocationNode = require('../node/tg_location_node');

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
		this.favoriteLayer = null;

		this.currentTOD = 0;
		this.currentSubTOD = 0;
		this.isHighlightMode = false;
		this.waitForTps = false;
	  this.displayTimeOfLocs = true; // for debug
	  this.highLightMode = false;
		this.highLightTime = 0;

		this.locations = [];
		this.locationsInBox = [];
		this.locationGroups = [];
		this.favorites = [];
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}

	render(param) {
		if (this.isDisabled||(!this.display)) {
			this.discard();
		}
		else {
			this.updateLayer(param);
			this.updateFavoriteLayer();
			if (this.dispNameLayer) this.updateNameLayer();
		}
	}

	discard() {
		this.removeLayer();
		this.removeNameLayer();
		this.removeFavoriteLayer();
	}

	highLightMode(tf) {
		this.isHighlightMode = tf;
	}

	resetTimeOfLocations() {
		for(let loc of this.locationsInBox) loc.time = 0;
	}

	setTimeOfLocations() {
		//for(let loc of this.locationsInBox) {
		for(let loc of this.locations) {
			const lat = loc.node.target.lat;
			const lng = loc.node.target.lng;
			loc.time = this.map.calTimeFromLatLng(lat, lng);
		}

		// console.log('this.locations:');
		// console.log(this.locations);
	}

	setTimeOfLocationGroups() {
		this.map.tgBB.updateTimeOfLocationGroups(this.locationGroups);
	}

	addFavorite(favoriteId) {
		for(let loc of this.locations) {
			if (loc.id === favoriteId) {
				this.favorites.push(loc);
				break;
			}
		}
		this.updateFavoriteLayer();
	}

	removeFavorite(favoriteId) {
		let removedIdx = -1;
		for(let i = 0; i < this.favorites.length; i++) {
			if (this.favorites[i].id === favoriteId[0]) {
				removedIdx = i;
				break;
			}
		}

		if (removedIdx !== -1) this.favorites.splice(removedIdx, 1);
		else console.log('could not remove a favorite.');

		this.updateFavoriteLayer();
	}

	setFavorites(favoriteIds) {
		for(let t of tod) {
			for(let s of t) {
				for(let loc of s) {
					if (favoriteIds.indexOf(loc.id) >= 0) {
						this.favorites.push(loc);
					}
				}
			}
		}
		this.updateFavoriteLayer();
	}

	getFavorites() {
		return this.favorites;
	}

	calLocsInBox() {
		const top = this.data.box.top + this.data.var.latMargin;
		const bottom = this.data.box.bottom - this.data.var.latMargin;
		const right = this.data.box.right + this.data.var.lngMargin;
		const left = this.data.box.left - this.data.var.lngMargin;

		this.locationsInBox = [];

		for(let locs of tod[this.currentTOD]) {
			for(let loc of locs) {
				const lat = loc.lng; // original data is wrong, should be fixed.
				const lng = loc.lat; // original data is wrong, should be fixed.

				if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
					loc.node = new TgLocationNode(lat, lng);
					//loc.time = 0;
					this.locationsInBox.push(loc);
				}
			}
		}

		/*if (this.currentSubTOD >= 0) {
			for(let loc of tod[this.currentTOD][this.currentSubTOD]) {
				const lat = loc.lng; // original data is wrong, should be fixed.
				const lng = loc.lat; // original data is wrong, should be fixed.

				if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
					loc.node = new TgLocationNode(lat, lng);
					loc.time = 0;
					this.locationsInBox.push(loc);
				}
			}
		}
		else {
			// all 
			for(let locs of tod[this.currentTOD]) {
				for(let loc of locs) {
					const lat = loc.lng; // original data is wrong, should be fixed.
					const lng = loc.lat; // original data is wrong, should be fixed.

					if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
						loc.node = new TgLocationNode(lat, lng);
						loc.time = 0;
						this.locationsInBox.push(loc);
					}
				}
			}
		}*/
	}

	calFilteredLocs() {
		let locsByRRP = [];

		// I. Filter by rating, numRating, and Price
		for(let loc of this.locationsInBox) {
			// if current tod is not 'travel attractions'
			if (this.currentTOD !== 2) {
				if (!this.filterByRating(loc.rating)) continue;
				if (!this.filterByNumRating(loc.rating_cnt)) continue;
				if (!this.filterByPrice(loc.price_range)) continue;
			}
			locsByRRP.push(loc);
		}
		const numLocsInStage1 = locsByRRP.length;

		// II. Filter by total number
		this.locations = [];
		const maxTops = this.data.var.maxNumTops;
		const maxHots = this.data.var.maxNumHots;
		const maxNumLocs = this.data.var.maxNumLocations;

		let countTops = 0;
		let countHots = 0;
		let countTotal = 0;
		for(let loc of locsByRRP) {
			if (loc.top) {
				if ((countTops < maxTops) && (countTotal < maxNumLocs)) {
					this.locations.push(loc);
					countTops++;
					countTotal++;
				}
			}
			else if (loc.hot) {
				if ((countHots < maxHots) && (countTotal < maxNumLocs)) {
					this.locations.push(loc);
					countHots++;
					countTotal++;
				}
			}
			else {
				if (countTotal < maxNumLocs) {
					this.locations.push(loc);
					countTotal++;
				}
			}
		}


		/*if ((maxNumLocs !== 50) && (this.locations.length > maxNumLocs)) {
			this.locations.sort((a, b) => {return b.rating - a.rating});
			this.locations = this.locations.slice(0, maxNumLocs);
		}*/

		const numLocsInBox = this.locationsInBox.length;
		const numLocs = this.locations.length;
		console.log('LOCS [' + numLocsInBox + ' -> ' + numLocsInStage1 + 
				' -> ' + numLocs + ']');
		console.log('LOCS Top(' + countTops + ') Hot(' + countHots + 
				') Others(' + (countTotal - countTops - countHots) + ')');

		this.resetCurrentSet();
	}

	resetCurrentSet() {
		if (typeof data_currentset != 'undefined') {
      data_currentset = this.locations;
    }

    //console.log(data_currentset.length);

    if (this.data.var.appMode === 'pc') {
    	if (typeof openList != 'undefined') openList();
    }
	}

	filterByRating(rating) {
		const low = this.data.var.ratings[0];
		const high = this.data.var.ratings[1];

		if ((rating >= low)&&(rating <= high)) return true;
		else return false;
	}

	filterByNumRating(numRating) {
		const low = this.data.var.numRatings[0];
		const high = this.data.var.numRatings[1];

		if (high !== 1000) {
			if ((numRating >= low)&&(numRating <= high)) return true;
			else return false;
		}
		else {
			if (numRating >= low) return true;
			else return false;
		}
	}

	filterByPrice(price) {
		const low = this.data.var.priceRange[0];
		const high = this.data.var.priceRange[1];

		if ((price >= low)&&(price <= high)) return true;
		else return false;
	}

	doFilter(type, low, high) {
		if (type === 'maxLocs') {
			this.data.var.maxNumLocations = low;
			this.request({calLocsInBox: false});
		}
		else {
			// if current tod is not 'travel attractions'
			if (this.currentTOD !== 2) {
				switch(type) {
					case 'ratings':
						this.data.var.ratings = [low, high];
						break;
					case 'numRatings':
						this.data.var.numRatings = [low, high];
						break;
					case 'priceRange':
						this.data.var.priceRange = [low, high];
						break;
				}
				this.request({calLocsInBox: false});
			}
		}
	}

	assignTimes() {
		const currentZoom = this.data.zoom.current;
		let locs;
		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) locs = locs_lv0;
		if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) locs = locs_lv1;
	  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) locs = locs_lv2;

	  const timeLocs = locs[this.map.currentOrigin];

	  console.log('org: ' + this.map.currentOrigin);
	  console.log('cal locations:', this.locations);
		console.log('timeLocs: ', timeLocs);

		let temp = [];
		for(let i = 0; i < this.locations.length; ++i) {
			temp.push({loc: this.locations[i].lng, locs_lv0: timeLocs[i + 1].lat});
		}
		console.log('temp: ', temp);

		for(let loc of this.locations) {
			let found = false;
			for(let i = 1; i < timeLocs.length; i++) {

				if (!timeLocs[i].time) {
					console.log('time loc is not defined.');
					continue;
				}

				if (TgUtil.same(loc.lng, timeLocs[i].lat) && 
						TgUtil.same(loc.lat, timeLocs[i].lon)) {
					loc.time = timeLocs[i].time;
					found = true;
					break;
				}
			}

			if (!found) console.log('time of loc is not found...');
		}
	}

	locByPreset() {
		const currentZoom = this.data.zoom.current;
		let locs;
		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) locs = locs_lv0;
		if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) locs = locs_lv1;
	  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) locs = locs_lv2;

	  this.locations = [];
	  locs = locs[this.map.currentOrigin];

	  for(let i = 1; i < locs.length; ++i) {
	  	let obj = {};
	  	obj.lat = locs[i].lon;
	  	obj.lng = locs[i].lat;
	  	obj.node = new TgLocationNode(locs[i].lat, locs[i].lon);
	  	obj.time = locs[i].time;
	  	this.locations.push(obj);
	  }
	}

	request(param) {
		if ((!param) || (param.calLocsInBox)) {
			this.calLocsInBox();
		}

		//this.calFilteredLocs();
		this.locByPreset();

		//this.assignTimes();

		//console.log('this.locations:');
		//console.log(this.locations);

		// calculate BB of locations
		this.map.tgBB.calBBOfLocations(this.locations);

		// calculate clusters of locations
		//this.locationGroups = this.map.tgBB.calLocationGroup(this.locations);

		// calculate non-overlapped location names
		//this.map.tgBB.calNonOverlappedLocationNames(this.locations, this.locationGroups);

		//console.log(this.locationGroups);

		if (this.map.currentMode === 'EM') {
			this.render();
	  	this.map.tgBB.render();
		}
		else {
			if (this.map.tpsReady) {
				this.displayLocsInDc();
			}
			else {
				this.waitForTps = true;
			}
		}

		this.data.var.readyLocation = true;

		if (!this.data.var.placeProcessed) {
			this.map.tgPlaces.processPlaceObjects();
		}
	}

	displayLocsInDc() {
		console.log('displayLocsInDc()');
		this.calTargetAndRealNodes();
		this.calDispNodes(null, 1); // disp = real 

		// calculate time of all locations
		this.setTimeOfLocations();
		this.setTimeOfLocationGroups();

		//this.map.tgBB.cleanBB();
		//this.map.tgBB.addBBOfLocations();
		//this.updateNonOverlappedLocationNames();

		this.render();
  	this.map.tgBB.render();
	}

	changeType(type, subType) {

		if ((this.currentTOD === type) && (this.currentSubTOD === subType)) return;

		this.currentTOD = type;
		this.currentSubTOD = subType;
		this.request();
	}

	getCurrentLocations() {
		return this.locations;
	}

	getCurrentLocationClusters() {
		return this.locationGroups;
	}

	updateNonOverlappedLocationNames() {
		this.locations = this.map.tgBB.getNonOverlappedLocationNames(this.locations);
	}

	setHighLightMode(tf, time) {
		this.highLightMode = tf;
		this.highLightTime = time;
	}

	getHighLightMode() {
		return this.highLightMode;
	}

	updateLayer() {
		const viz = this.data.viz;
		var arr = [];
		const anchorStyleFunc = 
			this.mapUtil.nodeStyleFunc(viz.color.anchor, viz.radius.anchor);

		const locStyleFunc = 
			this.mapUtil.imageStyleFunc(viz.image.location[this.currentTOD]);
		const locStyleFuncTranslucent = 
			this.mapUtil.imageStyleFunc(viz.image.location[this.currentTOD], 0.3);

		const cLocStyleFunc = 
			this.mapUtil.imageStyleFunc(viz.image.locationCluster);
		const cLocStyleFuncTranslucent = 
			this.mapUtil.imageStyleFunc(viz.image.locationCluster, 0.3);

		const lineStyleFunc = 
			this.mapUtil.lineStyleFunc(viz.color.locationLine, viz.width.locationLine);

		let highlightedLocs = [];

		// display locationClusters
		for(let cLocs of this.locationGroups) {
			const dispLoc = cLocs.node.dispLoc;
			const dispAnchor = cLocs.node.dispAnchor;

			// for highlight mode
			let imageStyleFunc = cLocStyleFunc;
			let displayLinesAndAnchor = true;

			if (this.highLightMode) {
				if ((cLocs.time > this.highLightTime)) {
					displayLinesAndAnchor = false;
					imageStyleFunc = cLocStyleFuncTranslucent;
				}
				else {
					highlightedLocs = highlightedLocs.concat(cLocs.locs);
				}
			}

			if (displayLinesAndAnchor) {
				// lines
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.LineString(
						[[dispAnchor.lng, dispAnchor.lat], [dispLoc.lng, dispLoc.lat]]), 
					lineStyleFunc, 'cLocLine');

				// anchor images
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Point([dispAnchor.lng, dispAnchor.lat]), 
					anchorStyleFunc, 'cLocAnchor');
			}

			// circle images
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), imageStyleFunc,
				'cLoc', cLocs);

			let strText = cLocs.locs.length + '';
			if (this.displayTimeOfLocs) strText += ', ' + parseInt(cLocs.time/60);

			// number of locations
			const numberStyleFunc = 
				this.mapUtil.textStyle({
					text: strText, 
					color: viz.color.textNumberOfLocations, 
					font: viz.font.text, 
				});
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), numberStyleFunc, 
				'cLoc', cLocs);
		}

		// display locations
		for(let loc of this.locations) {

			// pass though if the location in the cluster
			if (loc.group) continue;

			const dispLoc = loc.node.dispLoc;
			const dispAnchor = loc.node.dispAnchor;

			// for highlight mode
			let imageStyleFunc = locStyleFunc;
			let displayLinesAndAnchor = true;

			if (this.highLightMode) {
				if ((loc.time > this.highLightTime)) {
					displayLinesAndAnchor = false;
					imageStyleFunc = locStyleFuncTranslucent;
				}
				else {
					highlightedLocs.push(loc);
				}
			}

			if (displayLinesAndAnchor) {
				// lines
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.LineString(
						[[dispAnchor.lng, dispAnchor.lat], [dispLoc.lng, dispLoc.lat]]), 
					lineStyleFunc, 'locLine');

				// anchor images
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Point([dispAnchor.lng, dispAnchor.lat]), 
					anchorStyleFunc, 'locAnchor');
			}

			// circle images
			let circleImageStyleFunc = imageStyleFunc;

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), circleImageStyleFunc,
				'loc', loc);

			// time display (for debugging)
			if (this.displayTimeOfLocs) {
				//const timeStr = parseInt(loc.time) + '';
				//const timeStr = Number(loc.time / 60).toFixed(1);
				const timeStr = loc.time.toFixed(0);
				const timeStyleFunc = 
					this.mapUtil.textStyle({text: timeStr, color: '#000', font: viz.font.text});
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), timeStyleFunc, 'loc');
			}
		}

		this.removeLayer();
		if (arr.length > 0) {
			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.location);
		  this.mapUtil.addLayer(this.layer);
			//console.log('tgLocs.updateLayer():' + arr.length);
		}

		if (this.highLightMode) {
			if (typeof data_currentset != 'undefined') {
				//console.log('highlightedLocs: ');
				//console.log(highlightedLocs);
	      data_currentset = highlightedLocs;

	      if (this.data.var.appMode === 'pc') {
          if (typeof openList != 'undefined') openList();
        }
	    }
		}
	}

	updateFavoriteLayer() {
		const viz = this.data.viz;
		var arr = [];
		const favStyleFunc = this.mapUtil.imageStyleFunc(viz.image.favorite);
		const favStyleFuncTranslucent = this.mapUtil.imageStyleFunc(viz.image.favorite, 0.3);
		let favImageStyleFunc = favStyleFunc;
	
		for(let loc of this.locations) {
			for(let fav of this.favorites) {
				if (fav.name === loc.name) {

					if ((this.highLightMode) && (loc.time > this.highLightTime)) {
						favImageStyleFunc = favStyleFuncTranslucent;
					}
					else {
						favImageStyleFunc = favStyleFunc;
					}

					const dispLoc = loc.node.dispLoc;
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), favImageStyleFunc,
						'loc', loc);
				}
			}
		}

		//console.log('num of this.favorites: ' + this.favorites.length);

		//console.log(arr.length);

		this.removeFavoriteLayer();
		if (arr.length > 0) {
			this.favoriteLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.favoriteLayer.setZIndex(viz.z.favorite);
		  this.mapUtil.addLayer(this.favoriteLayer);
		  console.log(this.favoriteLayer);
		}
	}

	updateNameLayer() {
		const viz = this.data.viz;
		var arr = [];
		
		for(let loc of this.locations) {
			if (!loc.dispName) continue;

			// only in final EM/DC map
			if (this.map.currentMode !== 'INTERMEDIATE') {

				if ((!this.highLightMode) || (loc.time <= this.highLightTime)) {
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
							[loc.node.dispLoc.lng, loc.node.dispLoc.lat]), nameStyleFunc, 'locName');
				}
			}
		}

		this.removeNameLayer();

		if (arr.length > 0) {
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

	removeFavoriteLayer() {
		this.mapUtil.removeLayer(this.favoriteLayer);
	}

	calRealNodes() {
		const transform = this.graph.transformReal.bind(this.graph);

		for(let loc of this.locations) {
			const modified = transform(loc.node.original.lat, loc.node.original.lng);
			loc.node.real.lat = modified.lat;
			loc.node.real.lng = modified.lng;
		}
	}

	calTargetAndRealNodes() {
		const cLat = this.map.tgOrigin.origin.original.lat;
  	const cLng = this.map.tgOrigin.origin.original.lng;
		const transformTarget = this.graph.transformTarget.bind(this.graph);
		const transformReal = this.graph.transformReal.bind(this.graph);

		for(let loc of this.locations) {
		//for(let loc of this.locationsInBox) {
			const targetPos = transformTarget(loc.node.original.lat, loc.node.original.lng);
			const realPos = transformReal(loc.node.original.lat, loc.node.original.lng);

			const targetLen = this.calLenFromLatLng(cLat, cLng, targetPos.lat, targetPos.lng);
			//const realLen = this.calLenFromLatLng(cLat, cLng, realPos.lat, realPos.lng);

			const realDegree = degreeToOrigin(realPos.lat, realPos.lng);
			//const targetDegree = degreeToOrigin(targetPos.lat, targetPos.lng);

			loc.node.real.lat = realPos.lat;
			loc.node.real.lng = realPos.lng;

			//loc.node.target.lat = targetPos.lat;
			//loc.node.target.lng = targetPos.lng;

			loc.node.target.lat = cLat + targetLen * Math.cos(realDegree);
			loc.node.target.lng = cLng + targetLen * Math.sin(realDegree);
		}

		function degreeToOrigin(lat, lng) {
			let deg = Math.atan((lng - cLng) / (lat - cLat));
			//let deg = Math.atan((lng - cLng) / ((lat - cLat) * this.graph.shrink());
	    if ((cLat === lat) && (cLng === lng)) deg = 0;
	    if ((lat - cLat) < 0) deg += Math.PI;
	    return deg;
		}
	}

	calLenFromLatLng(cLat, cLng, lat, lng) {
  	const dLat = (cLat - lat);
  	const dLng = (cLng - lng);
  	//const dLng = (cLng - lng) * this.graph.shrink();
	  return Math.sqrt(dLat * dLat + dLng * dLng);
	}

	calDispNodes(kind, value) {
		// update disp for locations
		for(let loc of this.locations) {
			loc.node.dispAnchor = 
				{lat: (1 - value) * loc.node.original.lat + value * loc.node.real.lat,
				 lng: (1 - value) * loc.node.original.lng + value * loc.node.real.lng }
			loc.node.dispLoc = 
				{lat: (1 - value) * loc.node.original.lat + value * loc.node.target.lat,
				 lng: (1 - value) * loc.node.original.lng + value * loc.node.target.lng }
		}

		// update disp for location clusters
		for(let cLocs of this.locationGroups) {
			const dispLoc = cLocs.node.dispLoc;
			const dispAnchor = cLocs.node.dispAnchor;
			dispLoc.lat = 0;
			dispLoc.lng = 0;
			dispAnchor.lat = 0;
			dispAnchor.lng = 0;

			for(let cLoc of cLocs.locs) {
				dispLoc.lat += cLoc.node.dispLoc.lat;
				dispLoc.lng += cLoc.node.dispLoc.lng;
				dispAnchor.lat += cLoc.node.dispAnchor.lat;
				dispAnchor.lng += cLoc.node.dispAnchor.lng;
			}

			const len = cLocs.locs.length;
			dispLoc.lat /= len;
			dispLoc.lng /= len;
			dispAnchor.lat /= len;
			dispAnchor.lng /= len;
		}
	}

	showModal(loc) {
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

		const modal = $('[data-remodal-id=modal]').remodal({});
		modal.open();
	}
}

//module.exports = TgMapLocations;