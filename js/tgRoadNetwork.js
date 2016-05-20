class TGRoadNetwork {

	constructor(data, options) {
		this.data = data;
		this.opt = options;
		this.alg = new TGRoadNetworkAlgorithm(data, options);
	}

	//
	//
	//
	filterRect(orgData, east, west, south, north) {
		var new_features = [];

		for(var i in orgData.features) {
	    if (((orgData.features[i].geometry.coordinates[0][0] > west)
	    		&&(orgData.features[i].geometry.coordinates[0][0] < east)
	    		&&(orgData.features[i].geometry.coordinates[0][1] > south)
	    		&&(orgData.features[i].geometry.coordinates[0][1] < north))&&
	      ((orgData.features[i].geometry.coordinates[1][0] > west)
	      	&&(orgData.features[i].geometry.coordinates[1][0] < east)
	      	&&(orgData.features[i].geometry.coordinates[1][1] > south)
	      	&&(orgData.features[i].geometry.coordinates[1][1] < north))) {

	      new_features.push(orgData.features[i]);
	    }
		}
		return new_features;
	}

	//
	//
	//
	convFeaturesToEdges(features) {
		var edges = []; 
  
	  // put nodes and edges of orgData into the edge structure.
	  for(var i in features) {
	    var o = {}, p = {};
	    o.lng = parseFloat(features[i].geometry.coordinates[0][0]);
	    o.lat = parseFloat(features[i].geometry.coordinates[0][1]);
	    p.lng = parseFloat(features[i].geometry.coordinates[1][0]);
	    p.lat = parseFloat(features[i].geometry.coordinates[1][1]);

	    var e = {};
	    e.startNode = o;
	    e.endNode = p;
	    e.type = features[i].properties.type;
	    e.name = features[i].properties.name;
	    e.z_order = features[i].properties.z_order;
	    e.oneway = features[i].properties.oneway;
	    edges.push(e);
	  }
	  return edges;
	}

	//
	//
	//
	calNodes(edges) {
		var nodes = [];

		for(var i = 0; i < edges.length; i++) {
			nodes.push({
				lng:edges[i].startNode.lng, 
				lat:edges[i].startNode.lat
			});

			nodes.push({
				lng:edges[i].endNode.lng, 
				lat:edges[i].endNode.lat
			});
		}
		return this.alg.reduceDuplicatedNodes(nodes);
	}


	//
	//
	//
	makeNEobjects(edges) {
		var nodes = this.calNodes(edges);

		for (var i = 0; i < edges.length; i++) {
			for (var j = 0; j < nodes.length; j++) {
				if ((edges[i].startNode.lat === nodes[j].lat)
					&& (edges[i].startNode.lng === nodes[j].lng)) {
				edges[i].startNode.index = j;
				}

				if ((edges[i].endNode.lat === nodes[j].lat)
					&& (edges[i].endNode.lng === nodes[j].lng)) {
				edges[i].endNode.index = j;
				}
			}
		}
		return {nodes: nodes, edges: edges};
	}

	
}