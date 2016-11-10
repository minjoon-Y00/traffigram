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
	  this.gridLinesX = []
	  this.gridLinesY = []

		this.locations = {}
		this.locations.japanese = uw_japanese
		this.locations.french = uw_french
	  this.locationType = '' //'japanese', 'french'
	  this.localLocations = []

	  this.tt = new TravelTime()
	  this.travelTime


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
	initGrids() {
		this.grids = []
		var dLat = (this.tg.opt.box.top - this.tg.opt.box.bottom) / (this.tg.opt.resolution.gridLat - 1)
		var dLng = (this.tg.opt.box.right - this.tg.opt.box.left) / (this.tg.opt.resolution.gridLng - 1)
		var latL, lngB
		
		// make a grid structure

		for(var i = 0; i < this.tg.opt.resolution.gridLat; i++) {
			var obj = {level:0, pts:[]}

			for(var j = 0; j < this.tg.opt.resolution.gridLng; j++) {
				latL = this.tg.opt.box.bottom + dLat * i
				lngB = this.tg.opt.box.left + dLng * j
				obj.pts.push(new Node(latL, lngB))
			}
			this.grids.push(obj)
		}

		// make a object for grid lines 

		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length - 1; j++) {
				this.gridLinesX.push({
					from:this.grids[i].pts[j], 
					to:this.grids[i].pts[j + 1]})
			}
		}
		for(var i = 0; i < this.grids[0].pts.length; i++) {
			for(var j = 0; j < this.grids.length - 1; j++) {
				this.gridLinesY.push({
					from:this.grids[j].pts[i], 
					to:this.grids[j + 1].pts[i]})
			}
		}

		
		console.log(this.grids)
	}

	//
	//
	//
	getControlPointsFromGrid() {
		var controlPoints = []

		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length; j++) {
				var n = new Node(this.grids[i].pts[j].original.lat, this.grids[i].pts[j].original.lng)
				n.travelTime = this.grids[i].pts[j].travelTime
				controlPoints.push(n)
			}
		}
		return controlPoints
	}

	//
	//
	//
	splitGrid() {
		var t1, t2, dif, curLng
		var splitGridIndexes = []

		// split according Lat

		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length - 1; j++) {
				t1 = this.grids[i].pts[j].travelTime
				t2 = this.grids[i].pts[j + 1].travelTime
				if ((t1 == null)||(t2 == null)) continue
				dif = Math.abs(t1 - t2)

				if (dif >= this.tg.opt.constant.splitThreshold) {
					splitGridIndexes.push({i:i, j:j})
					//console.log(i + ' [' + j + ',' + (j + 1) + '] ' + dif)
				}

			}
		}
		for(var i = 0; i < splitGridIndexes.length; i++) {
			this.splitGridLineHorizontal(splitGridIndexes[i].i, splitGridIndexes[i].j)
		}

		// split according Lng

		/*
		splitGridIndexes = []
		for(var i = 0; i < this.grids.length - 1; i++) {
			for(var j = 0; j < this.grids[i].pts.length; j++) {
				curLng = this.grids[i].pts[j].original.lng

				for(var k = 0; k < this.grids[i + 1].pts.length; k++) {
					//console.log(curLng + ', ' + grids[i + 1].pts[k].original.lng)
					if (this.grids[i + 1].pts[k].original.lng == curLng) {

						t1 = this.grids[i].pts[j].travelTime
						t2 = this.grids[i + 1].pts[k].travelTime
						if ((t1 == null)||(t2 == null)) continue
						dif = Math.abs(t1 - t2)

						if (dif >= this.tg.opt.constant.splitThreshold) {
							//splitGridIndexes.push({i:i, j:j})
							console.log(i + ' [' + j + ',' + (j + 1) + '] ' + dif)
						}
						

						break
					}

				}
			}
		}
		*/


		
		this.tg.map.updateLayers()
	}

	splitGridLineHorizontal(i, j) {
		var lat = this.grids[i].pts[j].original.lat
		var lng1 = this.grids[i].pts[j].original.lng
		var lng2 = this.grids[i].pts[j + 1].original.lng
		var lng = (lng1 + lng2) / 2
		var newNode = new Node(lat, lng)

		// delete original line
		var deletedK
		for(var k = 0; k < this.gridLinesX.length; k++) {
			if ((this.gridLinesX[k].from.original.lat == lat)
				&& (this.gridLinesX[k].from.original.lng == lng1)
				&& (this.gridLinesX[k].to.original.lat == lat)
				&& (this.gridLinesX[k].to.original.lng == lng2)) {
			deletedK = k
			break
			}
		}
		this.gridLinesX.splice(deletedK, 1)

		// insert two new lines
		this.gridLinesX.push({from:this.grids[i].pts[j], to:newNode})
		this.gridLinesX.push({from:newNode, to:this.grids[i].pts[j + 1]})

		// insert a new node in the grid structure
		this.grids[i].pts.splice(j + 1, 0, newNode)

		console.log(i + ',' + j)
	}

	splitGridLineVertical(i, j) {


		console.log(i + ',' + j)
		console.log(this.grids[i].pts[j])
		console.log(this.grids[i].pts[j + 1])

		var lat = this.grids[i].pts[j].original.lat
		var lng = (this.grids[i].pts[j].original.lng + this.grids[i].pts[j + 1].original.lng)/2
		var newNode = new Node(lat, lng)
		this.grids[i].pts.splice(j + 1, 0, newNode)

		console.log(newNode)
	}


	//
	//
	//
	setTravelTime() {
		var idx = 1
		for(var i = 0; i < this.grids.length; i++) {
			for(var j = 0; j < this.grids[i].pts.length; j++) {
				this.grids[i].pts[j].travelTime = this.travelTime.one_to_many[0][idx].time
				idx++
			}
		}

		// make travel time for center position = 0 
		var centerCol = parseInt(this.tg.opt.resolution.gridLat / 2)
		var centerRow = parseInt(this.tg.opt.resolution.gridLng / 2)
		this.grids[centerCol].pts[centerRow].travelTime = 0
	}

	//
	//
	//
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

			//console.log(data)
			//util.saveTextAsFile(data, 'data_tt.js')

			this.travelTime = data
			this.setTravelTime()
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