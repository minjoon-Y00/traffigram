class TGData {

	constructor(tg) {
		this.tg = tg

		this.nodes = []
		this.roads = []
		this.localNodes = []
		this.localRoads = []
	  this.centerPosition = {}
	  this.controlPoints = []
	  this.grids = []

		this.locations = {}
		this.locations.japanese = uw_japanese
		this.locations.french = uw_french
	  this.locationType = '' //'japanese', 'french'
	  this.localLocations = []

	  this.tt = new TravelTime()

	  // [TYPE]
	  // motorway(1), trunk(2), primary(11), secondary(12), tertiary(13)
		// motorway_link(21), trunk_link(22), primary_link(23), secondary_link(24)
		// tertiary_link(25)

	}

	//
	// Calculate local (displayed) nodes and roads
	//
	calLocalNodesRoads() {
		this.localRoads = this.calLocalRoads(this.nodes, this.roads)
		this.localNodes = this.calLocalNodes(this.nodes, this.localRoads)
	}

	calLocalRoads(nodes, roads) {
		var len = roads.length
		var lat, lng
		var localRoads = []

		for(var i = 0; i < len; i++) {
			// put all motorway and trunks.
			/*if ((roads[i].type == 1)||(roads[i].type == 2)) {
				localRoads.push(roads[i])
				continue
			}*/

			// If the start node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[0]].lat
			lng = nodes[roads[i].nodes[0]].lng

			if ((lat < this.tg.opt.box.top) && (lat > this.tg.opt.box.bottom) 
				&& (lng < this.tg.opt.box.right)	&& (lng > this.tg.opt.box.left)) {
				localRoads.push(roads[i])
				continue
			}

			// If the last node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lat
			lng = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lng

			if ((lat < this.tg.opt.box.top) && (lat > this.tg.opt.box.bottom) 
				&& (lng < this.tg.opt.box.right)	&& (lng > this.tg.opt.box.left)) {
				localRoads.push(roads[i])
			}
		}
		return localRoads
	}

	calLocalNodes(nodes, localRoads) {
		var len = localRoads.length
		var localNodes = []

		for(var i = 0; i < len; i++) {
			for(var j = 0; j < localRoads[i].nodes.length; j++) {
				localNodes.push(new Node(nodes[localRoads[i].nodes[j]].lat, nodes[localRoads[i].nodes[j]].lng))
				localRoads[i].nodes[j] = localNodes.length - 1
			}
		}
		return localNodes
	}

	//
	//
	//
	calLocalLocations() {
		this.localLocations = []
		
		if (this.locationType == '') return

		var locs = this.locations[this.locationType]
		var len = locs.length
		var lng, lat
		
		for(var i = 0; i < len; i++) {
			lat = Number(locs[i].loc_y);
			lng = Number(locs[i].loc_x);

			if ((lat < this.tg.opt.box.top) && (lat > this.tg.opt.box.bottom) 
				&& (lng < this.tg.opt.box.right)	&& (lng > this.tg.opt.box.left)) {
				this.localLocations.push(new Node(lat, lng));
			}
		}
	}

	//
	//
	//
	calControlPoints() {
		this.controlPoints = []

		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length; j++) {
				this.controlPoints.push(
					new Node(this.grids[i].pts[j].original.lat, this.grids[i].pts[j].original.lng))
			}
		}

		//console.log(default_tt)

		for(var i = 0; i < this.controlPoints.length; i++) {
			this.controlPoints[i].travelTime = default_tt.one_to_many[0][i + 1].time
		}

		var centerIdx = parseInt(this.controlPoints.length / 2)
		this.controlPoints[centerIdx].travelTime = 0;


		
	}

	calGrids() {
		this.grids = []
		var dLat = (this.tg.opt.box.top - this.tg.opt.box.bottom) / (this.tg.opt.resolution.gridLat - 1)
		var dLng = (this.tg.opt.box.right - this.tg.opt.box.left) / (this.tg.opt.resolution.gridLng - 1)
		var latL, lngB
		
		for(var i = 0; i < this.tg.opt.resolution.gridLat; i++) {
			var obj = {level:0, pts:[]}

			for(var j = 0; j < this.tg.opt.resolution.gridLng; j++) {
				latL = this.tg.opt.box.bottom + dLat * i
				lngB = this.tg.opt.box.left + dLng * j
				obj.pts.push(new Node(latL, lngB))
			}
			this.grids.push(obj)
		}

		console.log(this.grids)





		/*
		var candidates = this.locations[this.locationType];
		var dLat = (this.tg.opt.box.top - this.tg.opt.box.bottom) / (this.tg.opt.resolution.gridLng - 1);
		var dLng = (this.tg.opt.box.right - this.tg.opt.box.left) / (this.tg.opt.resolution.gridLat - 1);
		var latB, latT, lngL, lngR, lat, lng;

		this.grids = [];

		for(var i = 0; i < this.tg.opt.resolution.gridLng - 1; i++) {
			for(var j = 0; j < this.tg.opt.resolution.gridLat - 1; j++) {

				lngL = this.tg.opt.box.left + dLng * i;
				lngR = this.tg.opt.box.left + dLng * (i + 1);
				latB = this.tg.opt.box.bottom + dLat * j;
				latT = this.tg.opt.box.bottom + dLat * (j + 1);

				this.grids.push({
					latT:latT,
					latB:latB,
					lngL:lngL,
					lngR:lngR,
					TL: {lat:latT, lng:lngL},
					TR: {lat:latT, lng:lngR},
					BR: {lat:latB, lng:lngR},
					BL: {lat:latB, lng:lngL},
					locs:[]
				});
			}
		}

		for(var i = 0; i < candidates.length; i++) {
			lat = Number(candidates[i].loc_y);
			lng = Number(candidates[i].loc_x);

			if ((lat >= this.tg.opt.box.bottom) && (lat < this.tg.opt.box.top)
			  && (lng >= this.tg.opt.box.left) && (lng < this.tg.opt.box.right)) {

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
				pushLocsInGrid(grid, this.grids[i].locs, this.tg.util.clone);
				this.grids.push(grid);

				grid = {latT:latT, latB:latBTM, lngL:lngLRM, lngR:lngR, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.tg.util.clone);
				this.grids.push(grid);

				grid = {latT:latBTM, latB:latB, lngL:lngL, lngR:lngLRM, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.tg.util.clone);
				this.grids.push(grid);

				grid = {latT:latBTM, latB:latB, lngL:lngLRM, lngR:lngR, locs:[]};
				pushLocsInGrid(grid, this.grids[i].locs, this.tg.util.clone);
				this.grids.push(grid);

				removedGrids.push(i);
			}
		}

		for(var i = removedGrids.length - 1; i >= 0; i--) {
			this.grids.splice(removedGrids[i], 1);
		}
		


		this.controlPoints = [];	
		var cLng, cLat, r;

		for(var i = 0; i < this.grids.length; i++) {

			if (this.controlPointType == 'location') {
				if (this.grids[i].locs.length > 0) {
					cLng = (this.grids[i].lngL + this.grids[i].lngR) / 2;
					cLat = (this.grids[i].latB + this.grids[i].latT) / 2;
					r = findNearestCenterLatLng(this.grids[i].locs, cLng, cLat, this.tg.util.D2);
					this.controlPoints.push(new Node(r.lat, r.lng));
				}
			}
			else if (this.controlPointType == 'grid') {

				//if (i > 13) continue;

				cLng = this.grids[i].lngL;
				cLat = this.grids[i].latT;
				this.controlPoints.push(new Node(cLat, cLng));

				if (i % 9 == 0) { 
					cLng = this.grids[i].lngL;
					cLat = this.grids[i].latB;
					this.controlPoints.push(new Node(cLat, cLng));
					//console.log('%9');
				}

				if (parseInt(i / 9) == 8) {  // 72-80
					cLng = this.grids[i].lngR;
					cLat = this.grids[i].latT;
					this.controlPoints.push(new Node(cLat, cLng));
				}

				if (i == 80) {
					cLng = this.grids[i].lngR;
					cLat = this.grids[i].latB;
					this.controlPoints.push(new Node(cLat, cLng));
				}

				//this.controlPoints.push(new Node(cLat, cLng));
			}
			else if (this.controlPointType == 'node') {
				// TO DO: implementation
			}

			
		}	
		*/

		//console.log(this.grids);
		//console.log(this.controlPoints);


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
		this.tt.setStartLocation(this.centerPosition.lat, this.centerPosition.lng)

		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length; j++) {
				this.tt.addDestLocation(
					this.grids[i].pts[j].original.lng, 
					this.grids[i].pts[j].original.lat)
			}
		}

		var util = this.tg.util
		var start = (new Date()).getTime()
		this.tt.getTravelTime(func.bind(this))

		function func(data) {
			var end = (new Date()).getTime()
			console.log('elapsed: ' + (end - start)/1000 + ' sec.')

			console.log(data)

			//util.saveTextAsFile(data, 'data_tt.js')

			for(var i = 0; i < this.controlPoints.length; i++) {
				this.controlPoints[i].travelTime = data.one_to_many[0][i + 1].time
			}

			var centerIdx = parseInt(this.controlPoints.length / 2)
			this.controlPoints[centerIdx].travelTime = 0
			this.tg.map.updateLayers()

		}
	}

	//
	//
	//
	
	moveGrids() {
		var pos

		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length - 1; j++) {
				pos = this.tg.graph.transform(this.grids[i].pts[j].original.lat, this.grids[i].pts[j].original.lng)
				this.grids[i].pts[j].target.lat = pos.lat
				this.grids[i].pts[j].target.lng = pos.lng
			}
		}



		/*for(var i = 0; i < this.controlPoints.length; i++) {
			pos = this.tg.graph.transform(this.controlPoints[i].original.lat, this.controlPoints[i].original.lng)
			this.controlPoints[i].target.lat = pos.lat
			this.controlPoints[i].target.lng = pos.lng
			
			console.log(this.controlPoints[i].original.lat + ' -> ' + this.controlPoints[i].target.lat);
		}*/
	}
	

	calTPS() {
		this.tg.graph.TPSSolve(this.controlPoints);
	}

	testTPS() {
		return this.tg.graph.TPSTest(this.centerPosition.lat, this.centerPosition.lng);
	}



	moveLocations() {
		var pos;
		for(var i = 0; i < this.noi.length; i++) {
			pos = this.tg.graph.transform(this.noi[i].original.lat, this.noi[i].original.lng);
			this.noi[i].target.lat = pos.lat;
			this.noi[i].target.lng = pos.lng;
		}

		for(var i = 0; i < this.grids.length; i++) {
			pos = this.tg.graph.transform(this.grids[i].TL.lat, this.grids[i].TL.lng);
			this.grids[i].TL.lat = pos.lat;
			this.grids[i].TL.lng = pos.lng;
			pos = this.tg.graph.transform(this.grids[i].TR.lat, this.grids[i].TR.lng);
			this.grids[i].TR.lat = pos.lat;
			this.grids[i].TR.lng = pos.lng;
			pos = this.tg.graph.transform(this.grids[i].BR.lat, this.grids[i].BR.lng);
			this.grids[i].BR.lat = pos.lat;
			this.grids[i].BR.lng = pos.lng;
			pos = this.tg.graph.transform(this.grids[i].BL.lat, this.grids[i].BL.lng);
			this.grids[i].BL.lat = pos.lat;
			this.grids[i].BL.lng = pos.lng;
		}

	}


	

}