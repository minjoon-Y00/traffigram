class TGRoadNetwork {

	constructor(data, util, options) {
		this.data = data;
		this.util = util;
		this.opt = options;
		this.alg = new TGRoadNetworkAlgorithm(data, util, options);
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

	//
	//
	//
	parseRawData(raw) {
		var fin = false;

		console.log(raw);

		for(var i = 0; i < raw.nodes.length; i++) {
			raw.nodes[i].id = parseInt(raw.nodes[i].id);
			raw.nodes[i].lat = Number(raw.nodes[i].lat);
			raw.nodes[i].lng = Number(raw.nodes[i].lon);
			raw.nodes[i].tag = this.convTags(raw.nodes[i].tag);
			delete raw.nodes[i].lon;
		}

		for(var i = 0; i < raw.edges.length; i++) {
			raw.edges[i].nodes = this.convNodes(raw.edges[i].nodes, raw.nodes);
			raw.edges[i].oneway = this.isOneway(raw.edges[i].tag);
			raw.edges[i].tag = this.convTags(raw.edges[i].tag);
			delete raw.edges[i].id;
		}
		
		for(var i = 0; i < raw.nodes.length; i++) {
			delete raw.nodes[i].id;
		}

		console.log(raw);
		this.util.saveTextAsFile(raw, 'rawData.js');
	}

	convNodes(nodes, rawNodes) {
		for(var i = 0; i < nodes.length; i++) {
			nodes[i] = this.findIndexById(Number(nodes[i]), rawNodes);
		}
		return nodes;
	}

	findIndexById(node, rawNodes) {
		for(var i = 0; i < rawNodes.length; i++) {
			if (node == rawNodes[i].id) {
				return i;
			}
		}
	}

	convTags(tags) {
		var outTags = [];

		for(var i = 0; i < tags.length; i++) {
			switch(tags[i]) {
				case 'highway_IS_motorway':
					outTags.push('motorway');
					break;
				case 'highway_IS_motorway_link':
					outTags.push('motorway_link');
					break;
				case 'highway_IS_trunk':
					outTags.push('trunk');
					break;
				case 'highway_IS_trunk_link':
					outTags.push('trunk_link');
					break;
				case 'highway_IS_primary':
					outTags.push('primary');
					break;
				case 'highway_IS_primary_link':
					outTags.push('primary_link');
					break;
				case 'highway_IS_secondary':
					outTags.push('secondary');
					break;
				case 'highway_IS_secondary_link':
					outTags.push('secondary_link');
					break;
				case 'highway_IS_tertiary':
					outTags.push('tertiary');
					break;
				case 'highway_IS_tertiary_link':
					outTags.push('tertiary_link');
					break;
				case 'oneway_IS_yes':
					break;
				default:
					console.log('unknown tag : ' + tags[i]);
			}
		}
		return outTags;
	}

	isOneway(tags) {
		return (tags.indexOf('oneway_IS_yes') != -1)
	}

	
}