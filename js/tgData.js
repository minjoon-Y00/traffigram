class TGData {

	constructor(options) {
		this.opt = options;

		this.verbose = {};
		this.level0 = {};
		this.level1 = {};
		this.level2 = {};
		this.locations = {};
		this.locations.restaurants = restaurants.locations;
	  this.locationType = 'restaurants';
	  this.randomness = 0;
	  this.centerPosition = {};

	  this.noi = [];
	  this.cpGrid = [];
	  this.controlPoints = [];

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
			lng = Number(nodes[i].loc_y);
			lat = Number(nodes[i].loc_x);

			if ((lng < this.opt.box.top) && (lng > this.opt.box.bottom) 
				&& (lat < this.opt.box.right)	&& (lat > this.opt.box.left)) {
				this.noi.push(new Node(lat, lng));
			}
		}
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
					var r = avgLatLng(this.cpGrid[i][j]);
					//var r = this.cpGrid[i][j][0];
					this.cpGrid[i][j] = [];
					this.cpGrid[i][j].push({"lat":r.lat, "lng":r.lng});
				}
			}
		}

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


	

}