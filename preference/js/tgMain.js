class TGPreference {

	constructor(map_id) {
		this.opt = options
		this.util = new TGUtil()
		this.graph = new TGGraph(this)
		this.data = new TGData(this)
		this.map = new TGMap(this, map_id)

	  //this.setArea('Seattle')
	  //this.map.setCenter(47.468419, -122.217903) // intersection
	  //this.map.setCenter(47.462007, -122.265110) // intersection2
	  this.map.setCenter(47.611476, -122.340284) // downtown
	  //this.map.setCenter(47.658316, -122.312035) // UW
	  //this.map.setCenter(40.72946, -73.995708) // NYU, NY

		this.data.travelTime = default_tt 
	}

	//
	//
	//
	setArea(area) {
		switch(area) {
			case 'Seattle':
				this.map.setCenter(this.opt.center.seattle.lat, this.opt.center.seattle.lng);
			break;
			case 'NY':
				this.map.setCenter(this.opt.center.NY.lat, this.opt.center.NY.lng);
			break;
			case 'SF':
				this.map.setCenter(this.opt.center.SF.lat, this.opt.center.SF.lng);
			break;
		}
	}
}