class EvalLocations {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.display = true;
		this.layer = null;

		this.dispNameLayer = true;
		this.nameLayer = null;
		this.favoriteLayer = null;

		this.currentTOD = 0;
		this.isHighlightMode = false;
		this.waitForTps = false;
	  this.displayTimeOfLocs = false; // for debug
	  this.highLightMode = false;
		this.highLightTime = 0;

		this.locations = [];
		this.locationsInBox = [];
		this.locationGroups = [];
		this.favorites = [];

		this.locsArr = [];
	}

	calLocsInBox() {
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;

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

		const numLocsInBox = this.locationsInBox.length;
		const numLocs = this.locations.length;
		console.log('LOCS [' + numLocsInBox + ' -> ' + numLocsInStage1 + 
				' -> ' + numLocs + ']');
		console.log('LOCS Top(' + countTops + ') Hot(' + countHots + 
				') Others(' + (countTotal - countTops - countHots) + ')');
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

	update() {
		this.calLocsInBox();
		this.calFilteredLocs();
		this.assignTimes();
		this.updateLayer();

		let arr = [{
			lat: this.map.tgOrigin.getOrigin().original.lat, 
			lon: this.map.tgOrigin.getOrigin().original.lng,
		}];

		for(let loc of this.locations) {
			arr.push({
				lat: loc.lng,
				lon: loc.lat,
			});
		}

		console.log(arr);
		this.locsArr.push(arr);
		console.log('len of locsArr: ' + this.locsArr.length);
	}

	assignTimes() {
		const currentZoom = this.data.zoom.current;
		let locs;
		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) locs = locs_lv0;
		if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) locs = locs_lv1;
	  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) locs = locs_lv2;

	  const timeLocs = locs[this.map.currentOrigin];

		for(let loc of this.locations) {
			let found = false;
			for(let timeLoc of timeLocs) {

				if (!timeLoc.time) {
					console.log('time loc is not defined.');
					//return;
					continue;
				}

				if (TgUtil.same(loc.lng, timeLoc.lat) && 
						TgUtil.same(loc.lat, timeLoc.lon)) {
					loc.time = timeLoc.time;
					found = true;
					break;
				}
			}

			if (!found) console.log('time of loc is not found...');
		}
	}

	updateLayer() {
		const viz = this.data.viz;
		var arr = [];
		
		const locStyleFunc = 
			this.mapUtil.imageStyleFunc(viz.image.location[this.currentTOD]);

		// display locations
		for(let loc of this.locations) {
			const dispLoc = loc.node.dispLoc;

			// images
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), locStyleFunc);

			let timeStr = '';
			if (loc.time) timeStr += loc.time;
			const timeStyleFunc = 
				this.mapUtil.textStyle({text: timeStr, color: '#000', font: viz.font.text});
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), timeStyleFunc);
		}

		this.removeLayer();
		if (arr.length > 0) {
			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.location);
		  this.mapUtil.addLayer(this.layer);
			//console.log('tgLocs.updateLayer():' + arr.length);
		}
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	foundNearestNodeOfOrigin() {
		const dispRoads = this.map.tgRoads.dispRoads;
		let min = 987654321;
		let minRoadIndex = -1;
		const cLat = this.map.tgOrigin.getOrigin().original.lat;
		const cLng = this.map.tgOrigin.getOrigin().original.lng;

		for(let type in dispRoads) {
			for(let road of dispRoads[type]) {
				let dist = TgUtil.D2_s(cLat, cLng, road.startNode.lat, road.startNode.lng);
				if (dist < min) {
					min = dist;
					minRoadIndex = road.startNode.index;
				}
				dist = TgUtil.D2_s(cLat, cLng, road.endNode.lat, road.endNode.lng);
				if (dist < min) {
					min = dist;
					minRoadIndex = road.endNode.index;
				}
			}
		}
		return minRoadIndex;
	}

	foundNearestNodeOfLocs() {
		const dispRoads = this.map.tgRoads.dispRoads;
		
		for(let loc of this.locations) {
			let min = 987654321;
			let minRoadIndex = -1;

			for(let type in dispRoads) {
				for(let road of dispRoads[type]) {
					let dist = TgUtil.D2_s(loc.lng, loc.lat, road.startNode.lat, road.startNode.lng);
					if (dist < min) {
						min = dist;
						minRoadIndex = road.startNode.index;
					}
					dist = TgUtil.D2_s(loc.lng, loc.lat, road.endNode.lat, road.endNode.lng);
					if (dist < min) {
						min = dist;
						minRoadIndex = road.endNode.index;
					}
				}
			}
			loc.minRoadIndex = minRoadIndex;
		}
	}

	foundMaxIndex() {
		let maxIndex = -1;
		for(let type in this.map.tgRoads.dispRoads) {
			for(let road of this.map.tgRoads.dispRoads[type]) {
				if (road.startNode.index > maxIndex) maxIndex = road.startNode.index;
				if (road.endNode.index > maxIndex) maxIndex = road.endNode.index;
			}
		}
		return maxIndex;
	}

	makeTgObj() {
		let arr = new Array(this.foundMaxIndex());

		// add original edges 
		for(let type in this.map.tgRoads.dispRoads) {
			for(let road of this.map.tgRoads.dispRoads[type]) {
				const idx = road.startNode.index;
				if (!arr[idx]) arr[idx] = [];
				arr[idx].push({e: road.endNode.index, t: road.time});
			}
		}

		// make bidirectional edges
		for(let sIdx = 0; sIdx < arr.length; sIdx++) {
			if (!arr[sIdx]) continue;

			// [16] {e:17, t:100}
			for(let edge of arr[sIdx]) {
				const eIdx = edge.e;

				if (!arr[eIdx]) arr[eIdx] = [];

				// check if [17] {e:16, t:101}
				let found = false;
				for(let tempEdge of arr[eIdx]) {
					if (sIdx === tempEdge.e) {
						found = true;
						//console.log('found!');
						//console.log('sIdx: ' + sIdx);
						break;
					}
				}

				if (!found) arr[eIdx].push({e: sIdx, t: edge.t});
			}
		}

		// make mapping(m) and inverse mapping(im)
		// e.g. m[4] = 0, m[16] = 1, m[17] = 2, ...
		// e.g. im[0] = 4, im[1] = 16, 
		this.m = new Array(this.foundMaxIndex());
		this.im = [];
		for(let idx = 0, c = 0; idx < arr.length; idx++) {
			if (!arr[idx]) continue;
			this.m[idx] = c;
			this.im[c++] = idx;
		}

		// change indexes
		let newArr = [];
		for(let idx = 0; idx < arr.length; idx++) {
			if (!arr[idx]) continue;

			let newEdges = [];
			for(let edges of arr[idx]) {
				newEdges.push({e: this.m[edges.e], t: edges.t});
			}
			newArr.push(newEdges);
		}

		// make a Graph
		let tgObj = [];
		for(let node of newArr) {
			let obj = {};
			for(let edges of node) obj[edges.e] = edges.t;
			tgObj.push(obj);
		}
		this.tgObj = tgObj;
		this.graph = new Graph(tgObj);

		//console.log(arr);
		//console.log(newArr);
		//console.log(m);
		//console.log(im);
		console.log(this.tgObj);
	}

	calcTime(start, end) {
		const tgObj = this.tgObj;
	  const nodes = this.graph.findShortestPath(start + '', end + '');
	  let t = 0;
	  let times = [];
	  let sumTime = 0;

	  if (!nodes) {
	  	//console.log('start=' + start + ' end=' + end);
	  	console.log('do not reach there...');
	  	return;
	  }

	  $.each(nodes, function(k,v) {
	    if (k < nodes.length-1) {
	    	t = tgObj[v][nodes[k + 1]];
	    	sumTime += t;
	      times.push(t);
	    }
	  });

	  //console.log('nodes', nodes);    
	  //console.log('times', times);    
	  //console.log('sumTime', sumTime);  
	  return sumTime;
	}

	debug() {
		//console.log(this.map.tgRoads.dispRoads);

		let result = [];

		this.makeTgObj();

		const centerRoadIndex = this.foundNearestNodeOfOrigin();
		this.foundNearestNodeOfLocs();

		for(let loc of this.locations) {
			//console.log('---');
			//console.log('actual time: ' + loc.time);
			//console.log('minRoadIndex ' + this.m[loc.minRoadIndex]);
			const cal = this.calcTime(this.m[centerRoadIndex], this.m[loc.minRoadIndex]);
			result.push({actual: loc.time, dijk: cal});
		}
		
		console.log(result);



		//console.log(this.locations);


	}
}

