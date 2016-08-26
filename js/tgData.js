class TGData {

	constructor(graph, util, options) {
		this.graph = graph;
		this.util = util;
		this.opt = options;

		this.original = {};
		this.level0 = {};
		this.level1 = {};
		this.level2 = {};
		this.locations = {};
		//this.locations.restaurants = restaurants.locations;
		this.locations.japanese = uw_japanese.locations;
		this.locations.french = uw_french.locations;
	  //this.locationType = 'restaurants';
	  this.locationType = 'japanese';
	  this.randomness = 0;
	  this.simpDistanceRDP = 1;
	  this.centerPosition = {};

	  this.tt = new TravelTime();
	  this.noi = [];
	  this.grids = [];
	  this.controlPointType = 'grid'; //'location', 'node'
	  this.controlPoints = [];

	  this.simple = {};

	  //this.initGrids();
	}

	//
	//
	//
	calNOI() {
		var nodes = this.locations[this.locationType];
		var len = nodes.length;
		var lng, lat;
		this.noi = [];

		for(var i = 0; i < len; i++) {
			lat = Number(nodes[i].loc_y);
			lng = Number(nodes[i].loc_x);

			if ((lat < this.opt.box.top) && (lat > this.opt.box.bottom) 
				&& (lng < this.opt.box.right)	&& (lng > this.opt.box.left)) {
				this.noi.push(new Node(lat, lng));
			}
		}
	}

	//
	// Calculate displayed roads
	//
	calDispRoads() {
		this.original.dispRoads = this.calDispRoadsByKind(this.original.nodes, this.original.roads);
		this.simple.dispRoads = this.calDispRoadsByKind(this.simple.nodes, this.simple.roads);
	}

	calDispRoadsByKind(nodes, roads) {
		var len = roads.length;
		var lat, lng;
		var dispRoads = [];

		for(var i = 0; i < len; i++) {

			// If the start node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[0]].lat;
			lng = nodes[roads[i].nodes[0]].lng;

			if ((lat < this.opt.box.top) && (lat > this.opt.box.bottom) 
				&& (lng < this.opt.box.right)	&& (lng > this.opt.box.left)) {
				dispRoads.push(roads[i]);
				continue;
			}

			// If the last node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lat;
			lng = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lng;

			if ((lat < this.opt.box.top) && (lat > this.opt.box.bottom) 
				&& (lng < this.opt.box.right)	&& (lng > this.opt.box.left)) {
				dispRoads.push(roads[i]);
			}
		}
		return dispRoads;
	}

	//
	// Calculate the number of unique nodes in roads
	//
	calUniqueNodesLength(nodes, roads) {
		var len = roads.length;
		var unqNodes = [];

		for(var i = 0; i < len; i++) {
			for(var j = 0; j < roads[i].nodes.length; j++) {
				if (unqNodes.indexOf(roads[i].nodes[j]) === -1) {
					unqNodes.push(roads[i].nodes[j]);
				}
			}
		}
		return unqNodes.length;
	}

	//
	//
	//
	initGrids() {
		/*
		this.cpGrid = new Array(this.opt.resolution.gridX);
		for(var i = 0; i < this.opt.resolution.gridX; i++) {
			this.cpGrid[i] = new Array(this.opt.resolution.gridY);
		}

		this.gridPoints = new Array(this.opt.resolution.gridX + 1);
		for(var i = 0; i < this.opt.resolution.gridX + 1; i++) {
			this.gridPoints[i] = new Array(this.opt.resolution.gridY + 1);
		}
		*/

	}

	resetGrids() {
		/*for(var i = 0; i < this.opt.resolution.gridX; i++) {
			for(var j = 0; j < this.opt.resolution.gridY; j++) {
				this.cpGrid[i][j] = [];
			}
		}

		for(var i = 0; i < this.opt.resolution.gridX + 1; i++) {
			for(var j = 0; j < this.opt.resolution.gridY + 1; j++) {
				this.gridPoints[i][j] = [];
			}
		}*/
	}

	calControlPointsGrid() {
		var candidates = this.locations[this.locationType];
		var dLat = (this.opt.box.top - this.opt.box.bottom) / this.opt.resolution.gridLat;
		var dLng = (this.opt.box.right - this.opt.box.left) / this.opt.resolution.gridLng;
		var latB, latT, lngL, lngR, lat, lng;

		this.grids = [];

		for(var i = 0; i < this.opt.resolution.gridLng; i++) {
			for(var j = 0; j < this.opt.resolution.gridLat; j++) {

				lngL = this.opt.box.left + dLng * i;
				lngR = this.opt.box.left + dLng * (i + 1);
				latB = this.opt.box.bottom + dLat * j;
				latT = this.opt.box.bottom + dLat * (j + 1);

				this.grids.push({
					latT:latT, latB:latB, 
					lngL:lngL, lngR:lngR,
					locs:[]
				});
			}
		}

		for(var i = 0; i < candidates.length; i++) {
			lat = Number(candidates[i].loc_y);
			lng = Number(candidates[i].loc_x);

			if ((lat >= this.opt.box.bottom) && (lat < this.opt.box.top)
			  && (lng >= this.opt.box.left) && (lng < this.opt.box.right)) {

				for(var j = 0; j < this.grids.length; j++) {
					if ((lat >= this.grids[j].latB) && (lat < this.grids[j].latT)
						&& (lng >= this.grids[j].lngL) && (lng < this.grids[j].lngR)) {
						this.grids[j].locs.push({i:i, lat:lat, lng:lng});
						break;
					}
				}
			}
		}

		// To Do: seperation and adaptive grids
		/*
		var removedGrids = [];
		var latBTM, lngLRM, grid;
		for(var i = 0; i < this.grids.length; i++) {
			if (this.grids[i].locs.length >= 10) {
				latT = this.grids[i].latT;
				latB = this.grids[i].latB;
				lngL = this.grids[i].lngL;
				lngR = this.grids[i].lngR;
				latBTM = (latB + latT) / 2;
				lngLRM = (lngL + lngR) / 2;
				grid = {latT:latT, latB:latBTM, lngL:lngL, lngR:lngLRM, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.util.clone);
				this.grids.push(grid);

				grid = {latT:latT, latB:latBTM, lngL:lngLRM, lngR:lngR, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.util.clone);
				this.grids.push(grid);

				grid = {latT:latBTM, latB:latB, lngL:lngL, lngR:lngLRM, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.util.clone);
				this.grids.push(grid);

				grid = {latT:latBTM, latB:latB, lngL:lngLRM, lngR:lngR, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.util.clone);
				this.grids.push(grid);

				removedGrids.push(i);
			}
		}

		for(var i = removedGrids.length - 1; i >= 0; i--) {
			this.grids.splice(removedGrids[i], 1);
		}
		*/


		this.controlPoints = [];	
		var cLng, cLat, r;
		for(var i = 0; i < this.grids.length; i++) {

			if (this.controlPointType == 'location') {
				if (this.grids[i].locs.length > 0) {
					cLng = (this.grids[i].lngL + this.grids[i].lngR) / 2;
					cLat = (this.grids[i].latB + this.grids[i].latT) / 2;
					r = findNearestCenterLatLng(this.grids[i].locs, cLng, cLat, this.util.D2);
					this.controlPoints.push(new Node(r.lat, r.lng));
				}
			}
			else if (this.controlPointType == 'grid') {
				cLng = (this.grids[i].lngL + this.grids[i].lngR) / 2;
				cLat = (this.grids[i].latB + this.grids[i].latT) / 2;
				this.controlPoints.push(new Node(cLat, cLng));
			}
			else if (this.controlPointType == 'node') {
				// TO DO: implementation
			}

			
		}	

		//console.log(this.grids);
		console.log(this.controlPoints);


		function pushLocsInGrid(grid, locs, clone) {
			for(var j = 0; j < locs.length; j++) {
				if ((locs[j].lat >= grid.latB) && (locs[j].lat < grid.latT)
					&& (locs[j].lng >= grid.lngL) && (locs[j].lng < grid.lngR)) {
					grid.locs.push(clone(locs[j]));
				}
			}
		}


		function findNearestCenterLatLng(arr, cLng, cLat, D2) {
			var len = arr.length;
			var min = 1000;
			var min_i = -1;
			var dist;
			
			for(var i = 0; i < len; i++) {
				dist = D2(arr[i].lat, arr[i].lng, cLat, cLng);
				if (dist < min) {
					min = dist;
					min_i = i;
				}
			}
			return {lat: arr[min_i].lat, lng: arr[min_i].lng};
		}

		function avgLatLng(arr) {
			var len = arr.length;
			var sumLat = 0, sumLng = 0;
			for(var i = 0; i < len; i++) {
				sumLat += arr[i].lat;
				sumLng += arr[i].lng;
			}
			return {lat: sumLat / len, lng: sumLng / len};
		}
	}

	getTravelTime() {

		//for(var i = 0; i < this.controlPoints.length; i++) {
		for(var i = 0; i < 49; i++) {
			this.tt.addDestLocation(this.controlPoints[i].original.lat, this.controlPoints[i].original.lng);
		}

		var func = function(data) {
			console.log('TT = ');
			console.log(data);
		}
		this.tt.getTravelTime(func);
	}

	//
	//
	//
	moveControlPoints() {
		for(var i = 0; i < this.controlPoints.length; i++) {
			this.controlPoints[i].target.lat = this.controlPoints[i].original.lat + Math.randomGaussian(0, 1) * tg.opt.constant.randomness * this.randomness;
			this.controlPoints[i].target.lng = this.controlPoints[i].original.lng + Math.randomGaussian(0, 1) * tg.opt.constant.randomness * this.randomness;

			//console.log(this.controlPoints[i].original.lat + ' -> ' + this.controlPoints[i].target.lat);
		}
	}

	calTPS() {
		this.graph.TPSSolve(this.controlPoints);
	}

	testTPS() {
		return this.graph.TPSTest(this.opt.center.seattle.lat, this.opt.center.seattle.lng);
	}

	moveLocations() {
		var pos;
		for(var i = 0; i < this.noi.length; i++) {
			pos = this.graph.transform(this.noi[i].original.lat, this.noi[i].original.lng);
			this.noi[i].target.lat = pos.lat;
			this.noi[i].target.lng = pos.lng;
		}

		for(var i = 0; i < this.gridPoints.length; i++) {
			for(var j = 0; j < this.gridPoints[i].length; j++) {
				pos = this.graph.transform(this.gridPoints[i][j].lat, this.gridPoints[i][j].lng);
				this.gridPoints[i][j].lat = pos.lat;
				this.gridPoints[i][j].lng = pos.lng;
			}
		}

	}


	

}