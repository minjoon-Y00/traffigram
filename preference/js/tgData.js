class TGData {

	constructor(tg) {
		this.tg = tg

	  this.autoSelectRoadLevel = true

	  //this.tt = new TravelTime()
	  this.travelTime


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


	

}