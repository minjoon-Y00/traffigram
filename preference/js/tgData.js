class TGData {

	constructor(tg) {
		this.tg = tg


		this.locations = {}
		this.locations.japanese = uw_japanese
		this.locations.french = uw_french
	  this.locationType = '' //'japanese', 'french'
	  this.localLocations = []

	  this.autoSelectRoadLevel = true

	  this.tt = new TravelTime()
	  this.travelTime

	  console.log(this.locations.japanese)

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