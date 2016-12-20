class TGAnalysis {

	constructor(map_id) {
		this.opt = options;
		this.util = new TGUtil();
		this.data = new TGData(this, this.util, options);
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
		
	//
	//
	//
	start() {

		// I. parsing raw data
		// <script src="data/seattle_org_raw.js"></script>
		//
	  // var nr = this.net.parseRawData(rawData) // parse raw data
	  // console.log(nr)
		// this.util.saveTextAsFile(nr, 'seattle_raw.js')
		//
		// Seattle raw (n 67205, 8530)

		// II. filter raw data
		// <script src="data/seattle_raw.js"></script>
		// motorway(1), trunk(2), primary(11), secondary(12), tertiary(13)
		// motorway_link(21), trunk_link(22), primary_link(23), secondary_link(24), tertiary_link(25)
		//

		// for level 1
		//nr = this.net.filterRoads(nr.nodes, nr.roads, [1, 2, 21, 22]) // (n 15986, r 2165)
		//nr = this.net.separateRoads(nr.nodes, nr.roads) // (n 15986, r 2709)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 15986, r 1520)
		//nr = this.net.removeDeadLinks(nr.nodes, nr.roads) // (n 11294, r 1047)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 11294, r 743)
		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0001) // (n 2319, r 743)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[1,2], 0.005) // (n 1184, r 480)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[21, 22], 0.005) // (n 457, r 280)
		//nr = this.net.removeMultipleRoads(nr.nodes, nr.roads) // (n 225, r 231)

		// for level 2
		//nr = this.net.filterRoads(nr.nodes, nr.roads, [1, 2, 11, 21, 22, 23]) // (n 22866 , r 3245)
		//nr = this.net.separateRoads(nr.nodes, nr.roads) // (n 22866, r 3995)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 22866, r 2295)
		//nr = this.net.removeDeadLinks(nr.nodes, nr.roads) // (n 19529, r 1918)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 19529, r 1653)
		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0001) // (n 3700, r 1653)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[1,2], 0.005) // (n 2538 , r 1321)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[21, 22], 0.005) // (n 1397 , r 832)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[23], 0.005) // (n 1249 , r 644)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[11], 0.002) // (n 851 , r 722)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 851, r 245)
		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0005) // (n 486, r 245)
		//nr = this.net.divideRoads(nr.nodes, nr.roads) // (n 486, r 564)
		//nr = this.net.removeMultipleRoads(nr.nodes, nr.roads) // (n 474, r 525)

		// for level 3
		//nr = this.net.filterRoads(nr.nodes, nr.roads, [1, 2, 11, 12, 21, 22, 23]) // (n 39614 , r 5483)
		//nr = this.net.separateRoads(nr.nodes, nr.roads) // (n 39614, r 6530)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 39614, r 3705)
		//nr = this.net.removeDeadLinks(nr.nodes, nr.roads) // (n 38602, r 3564)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 38602, r 3455)
		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0001) // (n 6715, r 3455)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[1,2], 0.005) // (n 5499, r 3011)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[21, 22], 0.005) // (n 3782 , r 2022)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[23], 0.005) // (n 3602, r 1795)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[11], 0.001) // (n 3326, r 1947)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[12], 0.0005) // (n 3064, r 3325)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 3064, r 1190)
		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0005) // (n 1605, r 1190)
		//nr = this.net.divideRoads(nr.nodes, nr.roads) // (n 1605, r 2045)
		//nr = this.net.removeMultipleRoads(nr.nodes, nr.roads) // (n 1589, r 1932)

		// for level 4
		//nr = this.net.filterRoads(nr.nodes, nr.roads, [1, 2, 11, 12, 13, 21, 22, 23]) // (n 65824 , r 8196)
		//nr = this.net.separateRoads(nr.nodes, nr.roads) // (n 65824, r 10279)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 65824, r 6661)
		//nr = this.net.removeDeadLinks(nr.nodes, nr.roads) // (n 65647, r 6638)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 65647, r 6611)
		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0001) // (n 11547, r 6611)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[1,2], 0.005) // (n 10327, r 6090)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[21, 22], 0.001) // (n 9010, r 5934)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[23], 0.005) // (n 8798, r 5660)
		
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[11], 0.0005) // (n 8634, r 5861)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[12], 0.0005) // (n 8277, r 7022)
		//nr = this.net.clusterNodes(nr.nodes, nr.roads,[13], 0.0005) // (n 7757, r 9311)
		//nr = this.net.mergeRoads(nr.nodes, nr.roads) // (n 7757, r 4482)

		//nr = this.net.simplifyRDP(nr.nodes, nr.roads, 0.0005) // (n 4442, r 4482)
		//nr = this.net.divideRoads(nr.nodes, nr.roads) // (n 4442, r 6190)
		//nr = this.net.removeMultipleRoads(nr.nodes, nr.roads) // (n 4405, r 5785)





		//console.log(nr)









	 	
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







	  // For other steps
	  this.data.original.nodes = nr.nodes
	  this.data.original.roads = nr.roads
	  this.data.simple.nodes = this.util.clone(nr.nodes)
	  this.data.simple.roads = this.util.clone(nr.roads)




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