class TGAnalysis {

	constructor(map_id) {
		this.opt = options;
		this.util = new TGUtil();
		this.graph = new TGGraph(this);
		this.data = new TGData(this, this.graph, this.util, options);
		this.net = new TGRoadNetwork(this.data, this.util, options);
		this.map = new TGMap('ol_map', this.data, this.net, options);

	  //this.setArea('Seattle');
	  //this.map.setCenter(47.468419, -122.217903); // intersection
	  //this.map.setCenter(47.462007, -122.265110); // intersection2
	  //this.map.setCenter(47.611476, -122.340284); // downtown
	  this.map.setCenter(47.658316, -122.312035); // UW

		//this.readFilesAndStart();
		this.start();
	}


		// make control point
		// assign default travel time
		// display travel time
		// time -> travelTime
		
	//
	//
	//
	start() {

		


		//getTravelTime();

	  //this.net.parseRawData(rawData); // step 1
	  //var nr = this.net.separateRoads(rawData.nodes, rawData.edges); // step 2
	 	//nr = this.net.mergeRoads(nr.nodes, nr.roads); // step 3
	  //nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.00005); // step 4
	  //nr = this.net.eliminateLinks(nr.nodes, nr.roads); // step 5
	  //nr.roads = this.net.cleanupRoads(nr.nodes, nr.roads);
	  //nr = this.net.mergeRoads(nr.nodes, nr.roads); // step 3



	  //console.log('# nr.nodes = ' + nr.nodes.length);
	  //console.log('# nr.roads = ' + nr.roads.length);
	 
	  //nr = this.net.mergeNodes(nr.nodes, nr.roads,[1,2], 0.005); // 13843->12149, 4485->4027 
	  //nr = this.net.mergeRoads(nr.nodes, nr.roads);
	  //this.util.saveTextAsFile(nr, 'nr_seattle_cluster_1_2.js');

	 	//nr = this.net.mergeNodes(nr.nodes, nr.roads,[11], 0.0005); // 12149->11656, 4027->3826 
	  //nr = this.net.mergeRoads(nr.nodes, nr.roads);
	  //this.util.saveTextAsFile(nr, 'nr_seattle_cluster_11.js');

	  //nr = this.net.mergeNodes(nr.nodes, nr.roads,[12], 0.0005); // 11656->10666, 3826->3546 
	 	//nr = this.net.mergeRoads(nr.nodes, nr.roads);
	  //this.util.saveTextAsFile(nr, 'nr_seattle_cluster_12.js');

	  //nr = this.net.mergeNodes(nr.nodes, nr.roads,[13], 0.0005); // 10666->9194, 3546->3310
	 	//nr = this.net.mergeRoads(nr.nodes, nr.roads);
	  //this.util.saveTextAsFile(nr, 'nr_seattle_cluster_13.js');

	  //nr = this.net.mergeNodes(nr.nodes, nr.roads,[21], 0.0005); // 9194->9181, 3310->3293
	 	//nr = this.net.mergeRoads(nr.nodes, nr.roads);
	  //this.util.saveTextAsFile(nr, 'nr_seattle_cluster_21.js');

	  //nr = this.net.mergeNodes(nr.nodes, nr.roads,[22], 0.0005); // 9181, 3293->3291
	 	//nr = this.net.mergeRoads(nr.nodes, nr.roads);
	  //this.util.saveTextAsFile(nr, 'nr_seattle_cluster_22.js');
	  
	  //nr.roads = this.net.cleanupRoads(nr.nodes, nr.roads);

	  //nr.nodes = this.net.calRoadsOfNodes(nr.nodes, nr.roads);

	  //nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0005); // step 4 (eps = 0.00005)



	  //return;




	  // For other steps
	  this.data.original.nodes = nr.nodes;
	  this.data.original.roads = nr.roads;
	  this.data.simple.nodes = nr.nodes;
	  this.data.simple.roads = nr.roads;

	  // Only for step 1
	  //this.data.original.roads = nr.edges; 
	  //this.data.simple.roads = nr.edges;


	  this.data.original.dispRoads = [];
	  this.data.simple.dispRoads = [];

	  //console.log(this.data.original.nodes);
	  //console.log(this.data.original.roads);

	  


	  //console.log(this.data.simple.nodes);
	  //console.log(this.data.simple.roads);

	  

	  // data verification
	  /*
	  var lenNodes = nr.nodes.length;

	  for(var i = 0; i < lenNodes; i++) {
	  	nr.nodes[i].newRoads = [];
	  }

	  var lenRoads = nr.roads.length;
	  for(var i = 0; i < lenRoads; i++) {
	  	for(var j = 0; j < nr.roads[i].nodes.length; j++) {
	  		nr.nodes[nr.roads[i].nodes[j]].newRoads.push(i);
	  	}
	  }

	  for(var i = 0; i < lenNodes; i++) {
	  	if (nr.nodes[i].roads.length != nr.nodes[i].newRoads.length) {
	  		console.log('not matched: ' + i);
	  	}
	  }
	  */





	  
	  //console.log(this.data.original.roads.length);
	  //console.log(this.data.simple.roads.length);

	  //this.net.calOrderOfNodes(this.data.original.nodes, this.data.original.roads);
	  //this.net.separateRoads();

	  this.map.readAllObjects = true;
		//this.map.updateLayers();
	}

	saveTravelTime() {

		//console.log(data_0_39_3pm);
		//console.log(this.data.controlPoints);

		var data = data_0_39_3pm.one_to_many[0];
		for(var i = 1; i < data.length; i++) {
			this.data.controlPoints[i - 1].distance = data[i].distance;
			this.data.controlPoints[i - 1].time = data[i].time;
		}

		data = data_40_79_3pm.one_to_many[0];
		for(var i = 1; i < data.length; i++) {
			this.data.controlPoints[i - 1 + 40].distance = data[i].distance;
			this.data.controlPoints[i - 1 + 40].time = data[i].time;
		}

		data = data_80_99_3pm.one_to_many[0];
		for(var i = 1; i < data.length; i++) {
			this.data.controlPoints[i - 1 + 80].distance = data[i].distance;
			this.data.controlPoints[i - 1 + 80].time = data[i].time;
		}


		return;


		/*
		console.log(this.data.controlPoints);
		console.log(this.data.controlPoints.length);
		return;

		var points = []
		var grids = this.data.grids;


		for(var i = 0; i < this.data.grids.length; i++) {
			points.push({i:i, lat:this.data.grids[i].TL.lat, lng:this.data.grids[i].TL.lng})

			//console.log('i = ' + i)
			//console.log('TL.lng = ' + this.data.grids[i].TL.lng)
			//console.log('TL.lat = ' + this.data.grids[i].TL.lat)
			//console.log('TR.lng = ' + this.data.grids[i].TR.lng)
			//console.log('TR.lat = ' + this.data.grids[i].TR.lat)
		}	

		console.log(points);
		*/

		this.data.tt.setStartLocation(47.658316, -122.312035); // UW

		for(var i = 80; i < 100; i++) {
			this.data.tt.addDestLocation(
				this.data.controlPoints[i].original.lng, 
				this.data.controlPoints[i].original.lat);
		}

		var util = this.util;

		var start = (new Date()).getTime()

		var func = function(data) {

			var end = (new Date()).getTime()
			console.log('elapsed: ' + (end - start));

			console.log('TT = ');
			console.log(data);
			util.saveTextAsFile(data, 'data_80_99.js');
		}

		this.data.tt.getTravelTime(func);

		

	}

	// Position-based
	// 1. easily change type of locations
	// 2. not need to use tps (can deal with failure of tps)
	// 3. always uniform


	// Node-based
	// 1. more exact travel time of nodes
	// 2. just query once
	// 3. usually less number of query
	// 4. always can get travel time
 



	/*
	grids[i].TL.lng, grids[i].TL.lat, grids[i].TR.lng, grids[i].TR.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));

			this.olFeaturesFromLineStrings(arr, 
				grids[i].TR.lng, grids[i].TR.lat, grids[i].BR.lng, grids[i].BR.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));

			this.olFeaturesFromLineStrings(arr, 
				grids[i].BR.lng, grids[i].BR.lat, grids[i].BL.lng, grids[i].BL.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));

			this.olFeaturesFromLineStrings(arr, 
				grids[i].BL.lng, grids[i].BL.lat, grids[i].TL.lng, grids[i].TL.lat,
				this.lineStyleFunc(this.opt.color.gridLine, this.opt.width.gridLine));
		}

	*/

	getTravelTime() {
		//this.data.tt.setStartLocation(47.658316, -122.312035); // UW
		//this.data.tt.setStartLocation(47.648172, -122.336375); // Fremont
		//this.data.tt.setStartLocation(47.610409, -122.316805); // Capitol_hill
		this.data.tt.setStartLocation(47.620179, -122.185630); // Bellevue

		//8.19.9am
		this.data.tt.addDestLocation(-122.1631709, 47.58380614);
		this.data.tt.addDestLocation(-122.1662674, 47.6265411);
		this.data.tt.addDestLocation(-122.164508, 47.70398453);
		this.data.tt.addDestLocation(-122.15995, 47.758263);
		this.data.tt.addDestLocation(-122.1433615, 47.53523402);
		this.data.tt.addDestLocation(-122.144096, 47.580078);
		this.data.tt.addDestLocation(-122.141429, 47.732252);
		this.data.tt.addDestLocation(-122.1467983, 47.73423564);
		this.data.tt.addDestLocation(-122.1421007, 47.73236033);
		this.data.tt.addDestLocation(-122.1528538, 47.7332236);
		this.data.tt.addDestLocation(-122.12557, 47.64378);
		this.data.tt.addDestLocation(-122.1369629, 47.64598846);
		this.data.tt.addDestLocation(-122.1305771, 47.63682938);
		this.data.tt.addDestLocation(-122.13694, 47.6445084);
		this.data.tt.addDestLocation(-122.137603, 47.644348);
		this.data.tt.addDestLocation(-122.1274345, 47.67680772);
		this.data.tt.addDestLocation(-122.1296894, 47.6747227);
		this.data.tt.addDestLocation(-122.1204139, 47.4888823);
		this.data.tt.addDestLocation(-122.1248631, 47.67369925);
		this.data.tt.addDestLocation(-122.12394, 47.67387);
		this.data.tt.addDestLocation(-122.1211472, 47.6704102);
		this.data.tt.addDestLocation(-122.1194751, 47.67013304);
		this.data.tt.addDestLocation(-122.1204343, 47.66969939);
		this.data.tt.addDestLocation(-122.119592, 47.668776);
		this.data.tt.addDestLocation(-122.119173, 47.8472794);
		this.data.tt.addDestLocation(-122.09925, 47.6665599);
		this.data.tt.addDestLocation(-122.098319, 47.74987);

		var util = this.util;

		var func = function(data) {
			console.log('TT = ');
			console.log(data);
			util.saveTextAsFile(data, 'data_bell_9.js');
		}

		this.data.tt.getTravelTime(func);
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