class TGRoadNetwork {

	constructor(data, util, options) {
		this.data = data;
		this.util = util;
		this.opt = options;
		this.alg = new TGRoadNetworkAlgorithm(data, this, util, options);
	}

	//
	// 1. parse rawData
	// nodes = {lat, lng, roads} (# 67205)
	// roads = {nodes, type, [oneway]} (# 8530)
	//
	parseRawData(raw) {
		var fin = false;
		var lenNodes = raw.nodes.length;
		var lenEdges = raw.edges.length;

		console.log(raw);

		for(var i = 0; i < lenNodes; i++) {
			raw.nodes[i].id = parseInt(raw.nodes[i].id);
			raw.nodes[i].lat = Number(raw.nodes[i].lat);
			raw.nodes[i].lng = Number(raw.nodes[i].lon);
			raw.nodes[i].roads = [];

			delete raw.nodes[i].lon;
			delete raw.nodes[i].tag;
		}

		for(var i = 0; i < lenEdges; i++) {
			raw.edges[i].nodes = this.convNodes(raw.edges[i].nodes, raw.nodes);
			if (this.isOneway(raw.edges[i].tag)) raw.edges[i].oneway = true;
			raw.edges[i].type = this.getTypeByTag(raw.edges[i].tag[0]);
			raw.nodes[raw.edges[i].nodes[0]].roads.push(i);
	  	raw.nodes[raw.edges[i].nodes[raw.edges[i].nodes.length - 1]].roads.push(i);

			delete raw.edges[i].id;
			delete raw.edges[i].tag;
		}
		
		for(var i = 0; i < lenNodes; i++) {
			delete raw.nodes[i].id;
		}

		console.log(raw);
		this.util.saveTextAsFile(raw, 'rawData.js');
	}

	convNodes(nodes, rawNodes) {
		var lenNodes = nodes.length;

		for(var i = 0; i < lenNodes; i++) {
			nodes[i] = this.findIndexById(Number(nodes[i]), rawNodes);
		}
		return nodes;
	}

	findIndexById(node, rawNodes) {
		var lenNodes = rawNodes.length;

		for(var i = 0; i < lenNodes; i++) {
			if (node == rawNodes[i].id) {
				return i;
			}
		}
	}

	getTypeByTag(tag) {
		// motorway(1), trunk(2), primary(11), secondary(12), tertiary(13)
		// motorway_link(21), trunk_link(22), primary_link(23), secondary_link(24)
		// tertiary_link(25)
		var type = -1;

		switch(tag) {
			case 'highway_IS_motorway': type = this.opt.type.motorway; break;
			case 'highway_IS_trunk': type = this.opt.type.trunk; break;
			case 'highway_IS_primary': type = this.opt.type.primary; break;
			case 'highway_IS_secondary': type = this.opt.type.secondary; break;
			case 'highway_IS_tertiary': type = this.opt.type.tertiary; break;
			case 'highway_IS_motorway_link': type = this.opt.type.motorway_link; break;
			case 'highway_IS_trunk_link': type = this.opt.type.trunk_link; break;
			case 'highway_IS_primary_link': type = this.opt.type.primary_link; break;
			case 'highway_IS_secondary_link': type = this.opt.type.secondary_link; break;
			case 'highway_IS_tertiary_link': type = this.opt.type.tertiary_link; break;
			default: console.log('unknown tag : ' + tag);
		}
		return type;
	}

	isOneway(tags) {
		return (tags.indexOf('oneway_IS_yes') != -1)
	}

	//
	// 2. Seperate roads which have intersections.
	// nodes (# = 67205)
	// roads (# = 8530 -> 10816)
	//
	separateRoads(nodes, roads) {
		var lenNodes = nodes.length;
		var lenRoads = roads.length;
		var outRoads = [];

		for(var i = 0; i < lenRoads; i++) {

			// For each road, cutIdx = [0,n], or [0,k,n] if order(k) > 0
			var cutIdx = [0];
			for(var j = 1; j < roads[i].nodes.length - 1; j++) {
				if (nodes[roads[i].nodes[j]].roads.length > 0) {
					cutIdx.push(j);
				}
			}
			cutIdx.push(roads[i].nodes.length - 1);

			// If [0, k, n], seperate it [0, k], [k, n]
			if (cutIdx.length > 2) {
				for(var j = 0; j < cutIdx.length - 1; j++) {
					var r = {type:roads[i].type};
					if (roads[i].oneway) r.oneway = true;
					r.nodes = roads[i].nodes.slice(cutIdx[j], cutIdx[j + 1] + 1);
					outRoads.push(r);
				}
			} 
			// If [0, n], just [0, n]
			else {
				outRoads.push(roads[i]);
			}
		}

		nodes = this.calRoadsOfNodes(nodes, outRoads);

		console.log('separateRoads R(' + roads.length + ') => (' + outRoads.length + ')');
		console.log(outRoads);

		var raw = {nodes:nodes, roads:outRoads};
		this.util.saveTextAsFile(raw, 'rawData_separate.js');
	}

	calRoadsOfNodes(nodes, roads) {
		var lenNodes = nodes.length;
		var lenRoads = roads.length;

		for(var i = 0; i < lenNodes; i++) {
			nodes[i].roads = [];
		}

		for(var i = 0; i < lenRoads; i++) {
			nodes[roads[i].nodes[0]].roads.push(i);
			nodes[roads[i].nodes[roads[i].nodes.length - 1]].roads.push(i);
		}
		return nodes;
	}




	//
	// 3. Eliminate Links.
	// nodes (# = 67205 -> 55332)
	// roads (# = 10816 -> 8758)
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
	  			//outRoads.push(roads[i]);
	  		}
	  	}
	  	else {
	  		outRoads.push(roads[i]);
	  	}
	  }

	  outNodes = this.eliminateEmptyNodes(nodes, outRoads);

	  console.log('eliminateLinks N(' + nodes.length + ') => (' + outNodes.length + ')');
	  console.log('eliminateLinks R(' + roads.length + ') => (' + outRoads.length + ')');

		var raw = {nodes:outNodes, roads:outRoads};
		this.util.saveTextAsFile(raw, 'nr_seattle_el.js');
	}

	eliminateEmptyNodes(nodes, roads) {
		var lenNodes = nodes.length;
		var lenRoads = roads.length;
		var outNodes = [];

		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < roads[i].nodes.length; j++) {
				nodes[roads[i].nodes[j]].alive = true;
			}
		}

		for(var i = 0; i < lenNodes; i++) {
			if (nodes[i].alive) {
				delete nodes[i].alive;
				nodes[i].orgI = i;
				outNodes.push(nodes[i]);
			}
		}

		var lenOutNodes = outNodes.length;
		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < roads[i].nodes.length; j++) {
				for(var k = 0; k < lenOutNodes; k++) {
					if (outNodes[k].orgI == roads[i].nodes[j]) {
						roads[i].nodes[j] = k;
						break;
					}
				}
			}
		}

		for(var i = 0; i < lenOutNodes; i++) {
			delete outNodes[i].orgI;
		}
		return outNodes;
	}

	//
	//
	//
	eliminate2Orders(nodes, roads) {
		var outRoads = [];
		var lenRoads = roads.length;
		var startNodeIdx, endNodeIdx;
		var startNodeRoads, endNodeRoads;

		nodes = this.calRoadsOfNodes(nodes, roads);

		var cnt = 0;
		var cnt2 = 0;

		// Check if each end node has 2 order
		for(var i = 0; i < lenRoads; i++) {
			startNodeIdx = roads[i].nodes[0]; 
			startNodeRoads = nodes[startNodeIdx].roads;
			endNodeIdx = roads[i].nodes[roads[i].nodes.length - 1];
			endNodeRoads = nodes[endNodeIdx].roads;

			if (startNodeRoads.length == 2) {
				roads[i].startNodeOrder2 = true;
				cnt++;
				if (startNodeRoads[0] == i) {
					roads[i].connectedRoad = startNodeRoads[1];
				}
				else if (startNodeRoads[1] == i) {
					roads[i].connectedRoad = startNodeRoads[0];
				}
				else {
					console.log('weird...');
				}
			}

			if (endNodeRoads.length == 2) {
				roads[i].endNodeOrder2 = true;
				cnt2++;
				if (endNodeRoads[0] == i) {
					roads[i].connectedRoad = endNodeRoads[1];
				}
				else if (endNodeRoads[1] == i) {
					roads[i].connectedRoad = endNodeRoads[0];
				}
				else {
					console.log('weird...');
				}
			}
			roads[i].deleted = false;
		}

		//console.log(cnt);
		//console.log(cnt2);

		//return;

		var startNodeIdxI, startNodeIdxJ;
		var endNodeIdxI, endNodeIdxJ;

		//while(true) {

			for(var i = 0; i < lenRoads; i++) {
				if (roads[i].deleted) continue;

				if (roads[i].startNodeOrder2) {

					startNodeIdxI = roads[i].nodes[0];
					var found = false;

					for(var j = 0; j < lenRoads; j++) {
						if (roads[j].deleted) continue;
						if (i == j) continue;

						startNodeIdxJ = roads[j].nodes[0];
						endNodeIdxJ = roads[j].nodes[roads[j].nodes.length - 1];

						if (startNodeIdxI == startNodeIdxJ) {
							console.log('s - s');
							found = true;
							break;
						}
						else if (startNodeIdxI == endNodeIdxJ) {
							console.log('s - e');
							found = true;
							break;
						}
						else {
							//console.log('weird2...');
						}

					}

					if (!found) {
						console.log('not found');
					}



					
					//startNodeIdxJ = roads[roads[i].connectedRoad].nodes[0];
					//endNodeIdxJ = roads[roads[i].connectedRoad].nodes[roads[roads[i].connectedRoad].nodes.length - 1];

					//var startNodeRoadsI = nodes[startNodeIdxI].roads;

					/*console.log('i = ' + i);
					console.log('startNodeIdxI = ' + startNodeIdxI);
					console.log('startNodeRoadsI = ' + startNodeRoadsI);
					console.log('roads[i].connectedRoad = ' + roads[i].connectedRoad);
					console.log(roads[roads[i].connectedRoad]);*/

					


					//break;
				}
			}

		//}

		return;

		var modified = true;
		var startNodeIdxI, startNodeIdxJ;
		var endNodeIdxI, endNodeIdxJ;

		//while(modified) {
		while(true) {

			var finish = true;
			for(var i = 0; i < lenRoads; i++) {
				if (roads[i].deleted) continue;
				if ((roads[i].startNodeOrder2)||(roads[i].endNodeOrder2)) {
					finish = false;
					break;
				}
			}
			if (finish) break;


			modified = false;
			
			for(var i = 0; i < lenRoads; i++) {
				if (roads[i].deleted) continue;
				//if ((!roads[i].startNodeOrder2)&&(!roads[i].endNodeOrder2)) continue;

				// If the start node needs to be checked
				if (roads[i].startNodeOrder2) {

					startNodeIdxI = roads[i].nodes[0]; 

					for(var j = 0; j < lenRoads; j++) {
						if (roads[j].deleted) continue;
						if (i == j) continue;

						startNodeIdxJ = roads[j].nodes[0];
						endNodeIdxJ = roads[j].nodes[roads[j].nodes.length - 1];

						if (startNodeIdxI == endNodeIdxJ) { 
							// j----> i---->
							if (roads[i].type > roads[j].type) roads[i].type = roads[j].type;
							roads[i].nodes = roads[j].nodes.concat(roads[i].nodes);
							roads[i].startNodeOrder2 = roads[j].startNodeOrder2;
							roads[j].deleted = true;
							modified = true;
							break;
						}
						else if (startNodeIdxI == startNodeIdxJ) {
							// <----j i---->
							if (roads[i].type > roads[j].type) roads[i].type = roads[j].type;
							roads[j].nodes.reverse();
							roads[i].nodes = roads[j].nodes.concat(roads[i].nodes);
							roads[i].startNodeOrder2 = roads[j].endNodeOrder2;
							roads[j].deleted = true;
							modified = true;
							break;
						}
					}
				}

				// If the end node needs to be checked
				if (roads[i].endNodeOrder2) {

					endNodeIdxI = roads[i].nodes[roads[i].nodes.length - 1]; 

					for(var j = 0; j < lenRoads; j++) {
						if (roads[j].deleted) continue;
						if (i == j) continue;

						startNodeIdxJ = roads[j].nodes[0];
						endNodeIdxJ = roads[j].nodes[roads[j].nodes.length - 1];

						if (endNodeIdxI == startNodeIdxJ) {
							// i----> j----> 
							if (roads[i].type > roads[j].type) roads[i].type = roads[j].type;
							roads[i].nodes = roads[i].nodes.concat(roads[j].nodes);
							roads[i].endNodeOrder2 = roads[j].endNodeOrder2;
							roads[j].deleted = true;
							modified = true;
							break;
						}
						else if (endNodeIdxI == endNodeIdxJ) {
							// i----> <----J 
							if (roads[i].type > roads[j].type) roads[i].type = roads[j].type;
							roads[j].nodes.reverse();
							roads[i].nodes = roads[i].nodes.concat(roads[j].nodes);
							roads[i].endNodeOrder2 = roads[j].startNodeOrder2;
							roads[j].deleted = true;
							modified = true;
							break;
						}
					}

				}

			}
		}

		var lenRoads = roads.length;
		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) {
				delete roads[i].deleted;
				delete roads[i].startNodeOrder2;
				delete roads[i].endNodeOrder2;
				outRoads.push(roads[i]);
			}
		}
		
		nodes = this.calRoadsOfNodes(nodes, outRoads);

		console.log('mergeRoads R(' + roads.length + ') => (' + outRoads.length + ')');

		var raw = {nodes:nodes, roads:outRoads};
		this.util.saveTextAsFile(raw, 'nr_seattle_merge.js');
		return raw;
	}



	//
	// 4. Merge 2-order nodes.
	// nodes (# = 55332 -> 55332)
	// roads (# = 8758 -> 4745)
	//
	mergeRoads(nodes, roads) {
		var outRoads = [];
		var lenRoads = roads.length;
		var startNodeIdx, endNodeIdx;

		nodes = this.calRoadsOfNodes(nodes, roads);

		// Check if each end node has 2 order
		for(var i = 0; i < lenRoads; i++) {
			startNodeIdx = roads[i].nodes[0]; 
			endNodeIdx = roads[i].nodes[roads[i].nodes.length - 1];

			roads[i].haveToCheckStartNode = (nodes[startNodeIdx].roads.length == 2);
			roads[i].haveToCheckEndNode = (nodes[endNodeIdx].roads.length == 2);
			roads[i].deleted = false;
		}

		var modified = true;
		while(modified) {

			modified = false;
			// 
			var lenRoads = roads.length;
			for(var i = 0; i < lenRoads; i++) {
				if (roads[i].deleted) continue;
				if ((!roads[i].haveToCheckStartNode)&&(!roads[i].haveToCheckEndNode)) continue;

				// If the start node needs to be checked
				if (roads[i].haveToCheckStartNode) {

					startNodeIdx = roads[i].nodes[0]; 

					// Find a road with the end node which is the same to the start node of i
					for(var j = 0; j < lenRoads; j++) {
						if (roads[j].deleted) continue;
						if (i == j) continue;
						endNodeIdx = roads[j].nodes[roads[j].nodes.length - 1];

						// If find a pair of roads
						if (startNodeIdx == endNodeIdx) {
							/*
							if (!validateTagAndOneway(roads[i], roads[j])) {
								roads[i].haveToCheckStartNode = false;
								roads[j].haveToCheckEndNode = false;
								modified = true;
								break;
							}
							*/

							// j----> i---->
							if (roads[i].type > roads[j].type) roads[i].type = roads[j].type;
							roads[i].nodes = roads[j].nodes.concat(roads[i].nodes);
							roads[i].haveToCheckStartNode = roads[j].haveToCheckStartNode;
							roads[j].deleted = true;
							modified = true;
							//console.log('j----> i---->');
							break;
						}
					}
				}

				// If the end node needs to be checked
				if (roads[i].haveToCheckEndNode) {

					endNodeIdx = roads[i].nodes[roads[i].nodes.length - 1]; 

					// Find a road with the start node which is the same to the end node of i
					for(var j = 0; j < lenRoads; j++) {
						if (roads[j].deleted) continue;
						if (i == j) continue;
						startNodeIdx = roads[j].nodes[0];

						// If find a pair of roads
						if (startNodeIdx == endNodeIdx) {

							// i----> j----> 
							if (roads[i].type > roads[j].type) roads[i].type = roads[j].type;
							roads[i].nodes = roads[i].nodes.concat(roads[j].nodes);
							roads[i].haveToCheckEndNode = roads[j].haveToCheckEndNode;
							roads[j].deleted = true;
							modified = true;
							//console.log('i----> j---->');
							break;
						}
					}
				}

			}
		}

		var lenRoads = roads.length;
		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) {
				delete roads[i].deleted;
				delete roads[i].haveToCheckStartNode;
				delete roads[i].haveToCheckEndNode;
				outRoads.push(roads[i]);
			}
		}
		
		nodes = this.calRoadsOfNodes(nodes, outRoads);

		console.log('mergeRoads R(' + roads.length + ') => (' + outRoads.length + ')');

		var raw = {nodes:nodes, roads:outRoads};
		this.util.saveTextAsFile(raw, 'nr_seattle_merge.js');
		return raw;


		function validateTagAndOneway(road1, road2) {
			// type equality test
			if (road1.type != road2.type) return false;

			// oneway equality test
			if (road1.oneway != road2.oneway) return false;
			
			return true;
		}
	}

	//
	// 5. RDP Simplification.
	// nodes (# = 55332 -> 5162)
	// roads (# = 4745 -> 4745)
	//
	simplifyRDP(nodes, roads) {
		var lenNodes = nodes.length;
		var lenRoads = roads.length;
		//var eps = this.data.simpDistanceRDP * 0.0001; // 0-20 --> 0.0000-0.0020
		var eps = 0.0005; // about 50 meter

		for(var i = 0; i < lenRoads; i++) {
			roads[i].nodes = RDPSimp(roads[i].nodes, eps);
		}

		var outNodes = this.eliminateEmptyNodes(nodes, roads);
		outNodes = this.calRoadsOfNodes(outNodes, roads);

	  console.log('eliminateLinks N(' + nodes.length + ') => (' + outNodes.length + ')');

		var raw = {nodes:outNodes, roads:roads};
		this.util.saveTextAsFile(raw, 'nr_seattle_rdp.js');
		return raw;



		function RDPSimp(nodeArr, eps) {
			// Find the point with the maximum distance
			var dmax = 0;
			var index = 0;
			var startNode = nodes[nodeArr[0]];
			var endNode = nodes[nodeArr[nodeArr.length - 1]];

			for(var i = 1; i < nodeArr.length - 1; i++) {
				var testNode = nodes[nodeArr[i]];
				var d = distanceBetweenLineAndPoint(
					startNode.lat, startNode.lng, endNode.lat, endNode.lng, testNode.lat, testNode.lng);
				if (d > dmax) {
					index = i;
					dmax = d;
				}
			}

			// If max distance is greater than eps, recursively simplify
			if (dmax > eps) {
				// Recursive call
				var result1 = RDPSimp(nodeArr.slice(0, index + 1), eps);
				var result2 = RDPSimp(nodeArr.slice(index, nodeArr.length), eps);

				// Build the result list
				var results = result1.concat(result2);
			}
			else {
				results = [nodeArr[0], nodeArr[nodeArr.length - 1]];
			}
			return results;
		}

		function distanceBetweenLineAndPoint(L1x, L1y, L2x, L2y, Px, Py) {
			var t = Math.abs((L2y - L1y) * Px - (L2x - L1x) * Py + L2x * L1y - L2y * L1x);
			var b = Math.sqrt((L2y - L1y) * (L2y - L1y) + (L2x - L1x) * (L2x - L1x));
			return t / b;
		}
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

	



	calOrderOfNodes(nodes, roads) {
		var lenNodes = nodes.length;
		var lenRoads = roads.length;

		for(var i = 0; i < lenNodes; i++) {
			nodes[i].order = 0;
		}

		for(var i = 0; i < lenRoads; i++) {
			nodes[roads[i].nodes[0]].order++;
			nodes[roads[i].nodes[roads[i].nodes.length - 1]].order++;
		}
	}





	saveFileOfSaperateRoads() {

		this.data.simple.nodes = this.util.clone(this.data.original.nodes);
		this.data.simple.roads = this.util.clone(this.data.original.roads);
		this.calOrderOfNodes(this.data.simple.nodes, this.data.simple.roads);

		console.log(':' + this.data.simple.roads.length);

		this.data.simple.roads = this.alg.separateRoads(this.data.simple.nodes, this.data.simple.roads);
		this.calOrderOfNodes(this.data.simple.nodes, this.data.simple.roads);

		console.log('::' + this.data.simple.roads.length);

		this.data.simple.roads = this.alg.mergeRoads(this.data.simple.nodes, this.data.simple.roads);
		this.calOrderOfNodes(this.data.simple.nodes, this.data.simple.roads);

		console.log(':::' + this.data.simple.roads.length);



		console.log(this.data.simple.nodes.length);
		console.log(this.data.simple.roads.length);

		//console.log(this.data.simple.nodes);
		//console.log(this.data.simple.roads);

		var out = {'nodes':[], 'roads':[]};
		var lenNodes = this.data.simple.nodes.length;
		var lenRoads = this.data.simple.roads.length;

		for(var i = 0; i < lenNodes; i++) {
			out.nodes.push({
				lat: this.data.simple.nodes[i].lat,
				lng: this.data.simple.nodes[i].lng,
				order: this.data.simple.nodes[i].order 
			});
		}

		for(var i = 0; i < lenRoads; i++) {
			out.roads.push({
				nodes: this.data.simple.roads[i].nodes,
				oneway: this.data.simple.roads[i].oneway,
				tag: this.data.simple.roads[i].tag
			});
		}
		//this.data.simple.roads = simpData.roads;
		this.util.saveTextAsFile(out, 'simpData.js');

		console.log(out.nodes.length);
		console.log(out.roads.length);

		// separation & merge : N(67205) -> N(//), R(8530) -> R(7821) 



	}





	
}