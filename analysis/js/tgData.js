class TGData {

	constructor(tg, util, options) {
		this.tg = tg;
		this.util = util;
		this.opt = options;

		this.original = {};
	  this.simple = {};

		this.level0 = {};
		this.level1 = {};
		this.level2 = {};
		
	  this.simpDistanceRDP = 1;

	  


	  // [TYPE]
	  // motorway(1), trunk(2), primary(11), secondary(12), tertiary(13)
		// motorway_link(21), trunk_link(22), primary_link(23), secondary_link(24)
		// tertiary_link(25)

	}



	//
	// Calculate displayed roads
	//
	calDispRoads() {
		this.original.dispRoads = this.calDispRoadsByKind(this.original.nodes, this.original.roads);
		this.simple.dispRoads = this.calDispRoadsByKind(this.simple.nodes, this.simple.roads);

	}

	calDispRoadsByKind(nodes, roads) {
		var len = roads.length;
		var lat, lng;
		var dispRoads = [];

		for(var i = 0; i < len; i++) {

			// put all motorway and trunks.
			if ((roads[i].type == 1)||(roads[i].type == 2)) {
				dispRoads.push(roads[i]);
				continue;
			}

			// If the start node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[0]].lat;
			lng = nodes[roads[i].nodes[0]].lng;

			if ((lat < this.opt.box.top) && (lat > this.opt.box.bottom) 
				&& (lng < this.opt.box.right)	&& (lng > this.opt.box.left)) {
				dispRoads.push(roads[i]);
				continue;
			}

			// If the last node of a road is in the screen, add the road.
			lat = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lat;
			lng = nodes[roads[i].nodes[roads[i].nodes.length - 1]].lng;

			if ((lat < this.opt.box.top) && (lat > this.opt.box.bottom) 
				&& (lng < this.opt.box.right)	&& (lng > this.opt.box.left)) {
				dispRoads.push(roads[i]);
			}
		}
		return dispRoads;
	}

	//
	// Calculate the number of unique nodes in roads
	//
	calUniqueNodesLength(nodes, roads) {
		var len = roads.length;
		var unqNodes = [];

		for(var i = 0; i < len; i++) {
			for(var j = 0; j < roads[i].nodes.length; j++) {
				if (unqNodes.indexOf(roads[i].nodes[j]) === -1) {
					unqNodes.push(roads[i].nodes[j]);
				}
			}
		}
		return unqNodes.length;
	}

	saveSimpleNR() {
		var nr = {nodes:this.simple.nodes, roads:this.simple.roads}
		this.util.saveTextAsFile(nr, 'nr_simple.js')
	}

	printSimpleNR() {
		console.log({nodes:this.simple.nodes, roads:this.simple.roads})
	}

	
	

}