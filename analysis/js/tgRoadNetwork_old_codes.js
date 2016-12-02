	//
	// straighten links
	//
	straightenLinks(nodes, roads) {
		var lenRoads = roads.length

		for(var i = 0; i < lenRoads; i++) {
			if (roads[i].type > 20) { // links
				roads[i].nodes = [roads[i].nodes[0], roads[i].nodes[roads[i].nodes.length - 1]]
			}
		}

	  var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, roads)

	  console.log('straightenLinks N(' + nodes.length + ') => (' + nr.nodes.length + ')')

		return nr
	}


	//
	// Eliminate Links
	// 
	eliminateLinks(nodes, roads) {
	  var lenRoads = roads.length;
	  var outNodes = [];
	  var outRoads = [];

	  var isStartNodeMotorwayOrTrunk = false;
	  var isEndNodeMotorwayOrTrunk = false;

	  for(var i = 0; i < lenRoads; i++) {
	  	if (roads[i].type > 20) { // links

	  		isStartNodeMotorwayOrTrunk = false;
	  		for(var j = 0; j < nodes[roads[i].nodes[0]].roads.length; j++) {
	  			if ((roads[nodes[roads[i].nodes[0]].roads[j]].type == 1)
	  				||(roads[nodes[roads[i].nodes[0]].roads[j]].type == 2)) {
	  				isStartNodeMotorwayOrTrunk = true;
	  			}
	  		}

	  		isEndNodeMotorwayOrTrunk = false;
	  		for(var j = 0; j < nodes[roads[i].nodes[roads[i].nodes.length - 1]].roads.length; j++) {
	  			if ((roads[nodes[roads[i].nodes[roads[i].nodes.length - 1]].roads[j]].type == 1)
	  				||(roads[nodes[roads[i].nodes[roads[i].nodes.length - 1]].roads[j]].type == 2)) {
	  				isEndNodeMotorwayOrTrunk = true;
	  			}
	  		}

	  		if (isStartNodeMotorwayOrTrunk && isEndNodeMotorwayOrTrunk) {
	  			outRoads.push(roads[i]);
	  		}
	  	}
	  	else {
	  		outRoads.push(roads[i]);
	  	}
	  }

	  outNodes = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads);

	  console.log('eliminateLinks N(' + nodes.length + ') => (' + outNodes.length + ')');
	  console.log('eliminateLinks R(' + roads.length + ') => (' + outRoads.length + ')');

		var raw = {nodes:outNodes, roads:outRoads};
		this.util.saveTextAsFile(raw, 'nr_seattle_el.js');
		return raw;
	}
