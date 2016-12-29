class TGData {

	constructor(tg) {
		this.tg = tg

		this.nodes = []
		this.roads = []
		this.localNodes = []

		this.localWater = []
		this.localRoads = {'motorway':[], 'trunk':[], 'motorway_link':[], 'trunk_link':[], 
			'primary':[], 'secondary':[], 'tertiary':[], 'primary_link':[], 
			'secondary_link':[], 'tertiary_link':[]}

	  
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

	  this.presetRoads = {'raw':[], 'level1':[], 'level2':[], 'level3':[], 'level4':[]}
	  this.autoSelectRoadLevel = true
		this.roadLevel = 'raw'

	  this.tt = new TravelTime()
	  this.travelTime
	  this.splitLevel = 0


	  // [TYPE]
	  // motorway(1), trunk(2), primary(11), secondary(12), tertiary(13)
		// motorway_link(21), trunk_link(22), primary_link(23), secondary_link(24)
		// tertiary_link(25)

	}

	//
	// Calculate local (displayed) nodes and roads
	//
	calLocalNodesRoads() {
		
		if (this.autoSelectRoadLevel) {
			for(var lv in this.tg.opt.networkByZoom) {
				if (this.tg.opt.networkByZoom[lv].indexOf(this.tg.map.currentZoom) != -1) {
					this.roadLevel = lv
					break
				}
			}
		}

		//console.log('lv = ' + this.roadLevel)

		this.nodes = this.presetRoads[this.roadLevel].nodes
	  this.roads = this.presetRoads[this.roadLevel].roads

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
				localRoads.push(tg.util.clone(roads[i]))
				continue
			}
			
			// If the last node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lat
			lng = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lng

			if ((lat < this.tg.opt.box.top) && (lat > this.tg.opt.box.bottom) 
				&& (lng < this.tg.opt.box.right)	&& (lng > this.tg.opt.box.left)) {
				localRoads.push(tg.util.clone(roads[i]))
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
		var dLat = (this.tg.opt.box.top - this.tg.opt.box.bottom) / this.tg.opt.resolution.gridLat // 8
		var dLng = (this.tg.opt.box.right - this.tg.opt.box.left) / this.tg.opt.resolution.gridLng // 4
		var latB, lngL, n
		var BL, BR, TR, TL

		// make a control point array
		for(var i = 0; i <= this.tg.opt.resolution.gridLat; i++) {
			for(var j = 0; j <= this.tg.opt.resolution.gridLng; j++) {
				latB = this.tg.opt.box.bottom + dLat * i
				lngL = this.tg.opt.box.left + dLng * j
				n = new Node(latB, lngL)
				n.level = this.splitLevel
				this.controlPoints.push(n)
			}
		}

		// make a grid structure
		var offset = this.tg.opt.resolution.gridLng + 1

		for(var i = 0; i < this.tg.opt.resolution.gridLat; i++) {
			for(var j = 0; j < this.tg.opt.resolution.gridLng; j++) {
				BL = this.controlPoints[offset * i + j]
				BR = this.controlPoints[offset * i + (j + 1)]
				TR = this.controlPoints[offset * (i + 1) + (j + 1)]
				TL = this.controlPoints[offset * (i + 1) + j]
				this.grids.push(new Grid(BL, BR, TR, TL))
			}
		}
	
		console.log(this.grids)
	}

	//
	//
	//
	splitGrid() {
		var threshold = this.tg.opt.constant.splitThreshold
		var latM, lngM, idx
		var idxBM, idxRM, idxTM, idxLM, idxMM
		var newGrids = []

		this.splitLevel++

		for(var i = 0; i < this.grids.length; i++) {
			if (isOverThreshold(this.grids[i].BL, this.grids[i].BR, threshold)
				||isOverThreshold(this.grids[i].BR, this.grids[i].TR, threshold)
				||isOverThreshold(this.grids[i].TR, this.grids[i].TL, threshold)
				||isOverThreshold(this.grids[i].TL, this.grids[i].BL, threshold)) {

				// add control points or get the indexes of existed points
				latM = (this.grids[i].BL.original.lat + this.grids[i].TL.original.lat) / 2
				lngM = (this.grids[i].BL.original.lng + this.grids[i].BR.original.lng) / 2

				idxBM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, this.grids[i].BL.original.lat, lngM) // BM
				idxRM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, latM, this.grids[i].BR.original.lng) // RM
				idxTM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, this.grids[i].TL.original.lat, lngM) // TM
				idxLM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, latM, this.grids[i].BL.original.lng) // LM
				idxMM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, latM, lngM) // MM

				// assign travel time (temp)
				//this.controlPoints[idxBM].travelTime = (this.grids[i].BL.travelTime + this.grids[i].BR.travelTime) / 2
				//this.controlPoints[idxRM].travelTime = (this.grids[i].BR.travelTime + this.grids[i].TR.travelTime) / 2
				//this.controlPoints[idxTM].travelTime = (this.grids[i].TL.travelTime + this.grids[i].TR.travelTime) / 2
				//this.controlPoints[idxLM].travelTime = (this.grids[i].TL.travelTime + this.grids[i].BL.travelTime) / 2
				//this.controlPoints[idxMM].travelTime = (this.controlPoints[idxBM].travelTime + this.controlPoints[idxTM].travelTime) / 2


				// split the grid

				/*console.log('idxBM : ' + idxBM)
				console.log('idxRM : ' + idxRM)
				console.log('idxTM : ' + idxTM)
				console.log('idxLM : ' + idxLM)
				console.log('idxLM : ' + idxMM)*/

				this.grids[i].splitted = true

				newGrids.push({BL:this.grids[i].BL, BR:this.controlPoints[idxBM], 
					TR:this.controlPoints[idxMM], TL:this.controlPoints[idxLM]})
				newGrids.push({BL:this.controlPoints[idxBM], BR:this.grids[i].BR, 
					TR:this.controlPoints[idxRM], TL:this.controlPoints[idxMM]})
				newGrids.push({BL:this.controlPoints[idxMM], BR:this.controlPoints[idxRM], 
					TR:this.grids[i].TR, TL:this.controlPoints[idxTM]})
				newGrids.push({BL:this.controlPoints[idxLM], BR:this.controlPoints[idxMM], 
					TR:this.controlPoints[idxTM], TL:this.grids[i].TL})	
			}
		}

		// add new grids
		for(var i = 0; i < newGrids.length; i++) {
			this.grids.push(new Grid(newGrids[i].BL, newGrids[i].BR, newGrids[i].TR, newGrids[i].TL))
		}

		// delete original grids
		this._grids = []
		for(var i = 0; i < this.grids.length; i++) {
			if (!this.grids[i].splitted) {
				this._grids.push(this.grids[i])
			}
		}
		this.grids = this._grids

		// re-rendering the map
		this.tg.map.updateLayers()

		console.log(this.controlPoints)


		// sub funcitons

		function isOverThreshold(pt1, pt2, threshold) {
			var t1 = pt1.travelTime
			var t2 = pt2.travelTime
			if ((t1 == null)||(t2 == null)) return false
			return Math.abs(t1 - t2) >= threshold
		}

		function findControlPointByLatLng(ctlPts, lat, lng) {
			for(var i = 0; i < ctlPts.length; i++) {
				if ((ctlPts[i].original.lat == lat)&&(ctlPts[i].original.lng == lng)) {
					return i
				}
			}
			return -1
		}	

		function getIndexOfControlPoint(ctlPts, level, lat, lng) {
			var idx = findControlPointByLatLng(ctlPts, lat, lng) 

			if (idx < 0) {
				// insert a new control point
				var n = new Node(lat, lng)
				n.level = level
				ctlPts.push(n)
				return ctlPts.length - 1
			}
			else {
				// already existed control point
				//console.log('existed')
				return idx
			}
		}	

	}

	//
	//
	//
	setTravelTime() {
		var startIdx = this.getStartIndexBySplitLevel(this.splitLevel)

		var idx = 1
		for(var i = startIdx; i < this.controlPoints.length; i++) {
			this.controlPoints[i].travelTime = this.travelTime.one_to_many[0][idx].time
			//this.controlPoints[i].travelLat = this.travelTime.locations[0][idx].lat
			//this.controlPoints[i].travelLng = this.travelTime.locations[0][idx].lon

			idx++
		}



		// make travel time for center position = 0 
		var centerIdx = this.getCenterControlPoint()
		if (centerIdx >= 0) {
			this.controlPoints[centerIdx].travelTime = 0
		}
	}

	//
	//
	//
	getTravelTime() {
		this.tt.setStartLocation(this.centerPosition.lat, this.centerPosition.lng)

		var startIdx = this.getStartIndexBySplitLevel(this.splitLevel)
		for(var i = startIdx; i < this.controlPoints.length; i++) {
			this.tt.addDestLocation(
				this.controlPoints[i].original.lng, 
				this.controlPoints[i].original.lat)
		}

		console.log('startIdx = ' + startIdx)
		console.log('num = ' + (this.controlPoints.length - startIdx))

		var start = (new Date()).getTime()
		this.tt.getTravelTime(func.bind(this))

		function func(data) {
			var end = (new Date()).getTime()
			console.log('elapsed: ' + (end - start)/1000 + ' sec.')

			//console.log(data)
			//this.tg.util.saveTextAsFile(data, 'data_tt.js')

			this.travelTime = data
			this.setTravelTime()
			this.tg.map.updateLayers()
		}
	}

	//
	//
	//
	getStartIndexBySplitLevel(level) {
		for(var i = 0; i < this.controlPoints.length; i++) {
			if (this.controlPoints[i].level == level) {
				return i
			}
		}
	}

	//
	//
	//
	getCenterControlPoint() {
		var threshold = 0.00001
		var dist

		for(var i = 0; i < this.controlPoints.length; i++) {
			dist = this.tg.util.D2(this.controlPoints[i].original.lat, this.controlPoints[i].original.lng,
				this.centerPosition.lat, this.centerPosition.lng)

			if (dist < threshold) {
				return i
			}
		}

		if (i == this.controlPoints.length) {
			console.log('could not find center control point');
			return -1
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