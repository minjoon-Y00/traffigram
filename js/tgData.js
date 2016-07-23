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
		this.locations.restaurants = restaurants.locations;
	  this.locationType = 'restaurants';
	  this.randomness = 0;
	  this.simpDistanceRDP = 1;
	  this.centerPosition = {};

	  this.noi = [];
	  this.cpGrid = [];
	  this.controlPoints = [];

	  this.simple = {};

	  this.initGrids();
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
		this.cpGrid = new Array(this.opt.resolution.gridX);
		for(var i = 0; i < this.opt.resolution.gridX; i++) {
			this.cpGrid[i] = new Array(this.opt.resolution.gridY);
		}
	}

	resetGrids() {
		for(var i = 0; i < this.opt.resolution.gridX; i++) {
			for(var j = 0; j < this.opt.resolution.gridY; j++) {
				this.cpGrid[i][j] = [];
			}
		}
	}

	calControlPointsGrid() {
		var candidates = this.locations[this.locationType];
		var dLat = (this.opt.box.top - this.opt.box.bottom) / this.opt.resolution.gridY;
		var dLng = (this.opt.box.right - this.opt.box.left) / this.opt.resolution.gridX;
		var lat, lng, latIdx, lngIdx;

		this.resetGrids();

		for(var i = 0; i < candidates.length; i++) {
			lat = Number(candidates[i].loc_y);
			lng = Number(candidates[i].loc_x);

			if ((lat <= this.opt.box.top) && (lat >= this.opt.box.bottom)
			  && (lng <= this.opt.box.right) && (lng >= this.opt.box.left)) {

				latIdx = Math.floor((lat - this.opt.box.bottom) / dLat);
				lngIdx = Math.floor((lng - this.opt.box.left) / dLng);

				this.cpGrid[latIdx][lngIdx].push({"lat":lat, "lng":lng});
			}
		}

		for(var i = 0; i < this.opt.resolution.gridX; i++) {
			for(var j = 0; j < this.opt.resolution.gridY; j++) {
				if (this.cpGrid[i][j].length > 1) {
					//var r = avgLatLng(this.cpGrid[i][j]);
					var r = this.cpGrid[i][j][0];
					this.cpGrid[i][j] = [];
					this.cpGrid[i][j].push({"lat":r.lat, "lng":r.lng});
				}
			}
		}

		this.controlPoints = [];
		for(var i = 0; i < this.opt.resolution.gridX; i++) {
			for(var j = 0; j < this.opt.resolution.gridY; j++) {
				if (this.cpGrid[i][j].length > 0) {
					this.controlPoints.push(new Node(this.cpGrid[i][j][0].lat, this.cpGrid[i][j][0].lng));
				}
			}
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
	}


	

}