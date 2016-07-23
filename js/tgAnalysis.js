class TGAnalysis {

	constructor(map_id) {
		this.opt = options;
		this.util = new TGUtil();
		this.graph = new TGGraph(this.util, options);
		this.data = new TGData(this.graph, this.util, options);
		this.net = new TGRoadNetwork(this.data, this.util, options);
		this.map = new TGMap('ol_map', this.data, this.net, options);

	  //this.setArea('Seattle');
	  this.map.setCenter(47.468419, -122.217903); // intersection
	  //this.map.setCenter(47.462007, -122.265110); // intersection2
	  //this.map.setCenter(47.611476, -122.340284); // downtown

		//this.readFilesAndStart();
		this.start();
	}

	//
	//
	//
	start() {

	  //this.net.parseRawData(rawData);
	  //return;
	  
	  this.data.original.nodes = rawData.nodes;
	  this.data.original.roads = rawData.edges;
	  this.data.original.dispRoads = [];

	  //this.data.simple.nodes = rawData.nodes;
	  //this.data.simple.roads = rawData.edges;
	  this.data.simple.nodes = simpData.nodes;
	  this.data.simple.roads = simpData.roads;
	  this.data.simple.dispRoads = [];

	  console.log(this.data.original);
	  console.log(this.data.original.roads.length);
	  console.log(this.data.simple.roads.length);

	  this.net.calOrderOfNodes(this.data.original.nodes, this.data.original.roads);
	  //this.net.separateRoads();

	  this.map.readAllObjects = true;
		//this.map.updateLayers();
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

	//
	//
	//
	makeFilteredNodesEdgesFromGen0() {
		// require: <script src="data/seattle_washington_roads_gen0.js"></script>
		var east = this.opt.boundary.seattle.east;
		var west = this.opt.boundary.seattle.west;
		var south = this.opt.boundary.seattle.south;
		var north = this.opt.boundary.seattle.north;
		console.log('[filterRect] Original features # : ' + gen0.features.length); // 28559
		var filtered_features = this.net.filterRect(gen0, east, west, south, north);
		console.log('[filterRect] Filtered features # : ' + filtered_features.length); // 10074

		var edges = this.net.convFeaturesToEdges(filtered_features);
		console.log('[convFeaturesToEdges] Edges # : ' + edges.length); // 10074

		this.util.saveTextAsFile(edges, 'roads_gen_filtered.js');

		var ne = this.net.makeNEobjects(edges);
		console.log('[makeNEobjects] Nodes # = ' + ne.nodes.length); // 10781
		console.log('[makeNEobjects] Edges # = ' + ne.edges.length); // 10074

		this.util.saveTextAsFile(ne.nodes, 'nodes_filtered.js');
		this.util.saveTextAsFile(ne.edges, 'edges_filtered.js');
	}
}