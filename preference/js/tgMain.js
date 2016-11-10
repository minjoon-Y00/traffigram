class TGPreference {

	constructor(map_id) {
		this.opt = options
		this.util = new TGUtil()
		this.graph = new TGGraph(this)
		this.data = new TGData(this)
		this.map = new TGMap(this, map_id)

	  //this.setArea('Seattle');
	  //this.map.setCenter(47.468419, -122.217903); // intersection
	  //this.map.setCenter(47.462007, -122.265110); // intersection2
	  //this.map.setCenter(47.611476, -122.340284); // downtown
	  this.map.setCenter(47.658316, -122.312035) // UW

		this.start()
	}

		
	//
	//
	//
	start() {
	  this.data.nodes = nr.nodes
	  this.data.roads = nr.roads	
	  this.data.travelTime = default_tt  
	}

	
	//
	//
	//
	readFilesAndStart() {
		this.numberOfFiles = 0; //5;
		this.readCnt = 0;
		
		this.readScript('data/nodes_filtered.js', 'verbose', 'nodes');
		this.readScript('data/edges_filtered.js', 'verbose', 'edges');
		this.readScript('data/edges_lv0.js', 'level0', 'edges');
		this.readScript('data/edges_lv1.js', 'level1', 'edges');
		this.readScript('data/edges_lv2.js', 'level2', 'edges');
	}

	//
	//
	//
	readScript(filename, prop1, prop2) {
	  $.getScript(filename, function(data, textStatus, jqxhr) {
	    this.data[prop1][prop2] = JSON.parse(data);
	    console.log(filename + " is loaded.");
	    this.checkForStart();
	  }.bind(this));
	}

	//
	//
	//	
	checkForStart() {
	  if (++this.readCnt >= this.numberOfFiles) {
	  	this.start();
	  }
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