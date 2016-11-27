class TGRoadNetwork {

	constructor(data, util, options) {
		this.data = data;
		this.util = util;
		this.opt = options;
		this.alg = new TGRoadNetworkAlgorithm(data, this, util, options);
	}

	//
	// parseRawData() : parse rawData
	// in raw = [{nodes, edges}, ...]
	// out nodes = [{lat, lng, roads}, ...]
	// out roads = [{nodes, type, [oneway]}, ...]
	//
	parseRawData(raw) {
		var fin = false;
		var lenNodes = raw.nodes.length;
		var lenEdges = raw.edges.length;

		for(var i = 0; i < lenNodes; i++) {
			raw.nodes[i].id = parseInt(raw.nodes[i].id);
			raw.nodes[i].lat = Number(raw.nodes[i].lat);
			raw.nodes[i].lng = Number(raw.nodes[i].lon);
			raw.nodes[i].roads = [];

			delete raw.nodes[i].lon;
			delete raw.nodes[i].tag;
		}

		for(var i = 0; i < lenEdges; i++) {
			raw.edges[i].nodes = convNodes(raw.edges[i].nodes, raw.nodes);
			if (isOneway(raw.edges[i].tag)) raw.edges[i].oneway = true;
			raw.edges[i].type = getTypeByTag(raw.edges[i].tag[0], this.opt);
			raw.nodes[raw.edges[i].nodes[0]].roads.push(i);
	  	raw.nodes[raw.edges[i].nodes[raw.edges[i].nodes.length - 1]].roads.push(i);

			delete raw.edges[i].id;
			delete raw.edges[i].tag;
		}
		
		for(var i = 0; i < lenNodes; i++) {
			delete raw.nodes[i].id;
		}

		return {nodes:raw.nodes, roads:raw.edges}


		// sub functions

		function convNodes(nodes, rawNodes) {
			var lenNodes = nodes.length;

			for(var i = 0; i < lenNodes; i++) {
				nodes[i] = findIndexById(Number(nodes[i]), rawNodes);
			}
			return nodes;
		}

		function findIndexById(node, rawNodes) {
			var lenNodes = rawNodes.length;

			for(var i = 0; i < lenNodes; i++) {
				if (node == rawNodes[i].id) {
					return i;
				}
			}
		}

		function getTypeByTag(tag, opt) {
			// motorway(1), trunk(2), primary(11), secondary(12), tertiary(13)
			// motorway_link(21), trunk_link(22), primary_link(23), secondary_link(24), tertiary_link(25)
			var type = -1;

			switch(tag) {
				case 'highway_IS_motorway': type = opt.type.motorway; break;
				case 'highway_IS_trunk': type = opt.type.trunk; break;
				case 'highway_IS_primary': type = opt.type.primary; break;
				case 'highway_IS_secondary': type = opt.type.secondary; break;
				case 'highway_IS_tertiary': type = opt.type.tertiary; break;
				case 'highway_IS_motorway_link': type = opt.type.motorway_link; break;
				case 'highway_IS_trunk_link': type = opt.type.trunk_link; break;
				case 'highway_IS_primary_link': type = opt.type.primary_link; break;
				case 'highway_IS_secondary_link': type = opt.type.secondary_link; break;
				case 'highway_IS_tertiary_link': type = opt.type.tertiary_link; break;
				default: console.log('unknown tag : ' + tag);
			}
			return type;
		}

		function isOneway(tags) {
			return (tags.indexOf('oneway_IS_yes') != -1)
		}
	}

	//
	// filterRoads() : filter roads by types
	// in nodes, edges, arr = [1, 2, 21, 22, ...]
	// out nr = {nodes, roads}
	//
	filterRoads(nodes, roads, typeArr) {
		var lenRoads = roads.length
		var outRoads = []

		for(var i = 0; i < lenRoads; i++) {
			if (typeArr.indexOf(roads[i].type) === -1) continue
			outRoads.push(roads[i])
		}

		//nr = {nodes:nodes, roads:outRoads}
		nodes = this.calRoadsOfNodes(nodes, outRoads)
		var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads)
		return nr
	}

	//
	// calRoadsOfNodes() : recalculate nodes.roads 
	// in nodes, edges
	// out nodes
	//
	calRoadsOfNodes(nodes, roads) {
		//var outNodes = this.util.clone(nodes)
		var outNodes = nodes
		var lenNodes = outNodes.length
		var lenRoads = roads.length

		for(var i = 0; i < lenNodes; i++) {
			outNodes[i].roads = []
		}

		for(var i = 0; i < lenRoads; i++) {
			outNodes[roads[i].nodes[0]].roads.push(i)
			outNodes[roads[i].nodes[roads[i].nodes.length - 1]].roads.push(i)
		}
		return outNodes
	}

	//
	// cleanEmptyNodesAndCalNodesOfRoads() : clean unneccesary nodes and recalculate node indexes of roads 
	// in nodes, edges
	// out nr = {nodes, roads}
	//
	cleanEmptyNodesAndCalNodesOfRoads(nodes, roads) {
		//var outNodes = this.util.clone(nodes)
		var outNodes = nodes
		//var outRoads = this.util.clone(roads)
		var outRoads = roads
		var lenNodes = outNodes.length
		var lenRoads = outRoads.length
		
		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < outRoads[i].nodes.length; j++) {
				outNodes[outRoads[i].nodes[j]].alive = true
			}
		}

		var tempNodes = []
		for(var i = 0; i < lenNodes; i++) {
			if (outNodes[i].alive) {
				delete outNodes[i].alive;
				outNodes[i].orgI = i;
				tempNodes.push(outNodes[i]);
			}
		}
		outNodes = tempNodes

		var lenOutNodes = outNodes.length
		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < outRoads[i].nodes.length; j++) {
				for(var k = 0; k < lenOutNodes; k++) {
					if (outNodes[k].orgI == outRoads[i].nodes[j]) {
						outRoads[i].nodes[j] = k
						break
					}
				}
			}
		}

		for(var i = 0; i < lenOutNodes; i++) {
			delete outNodes[i].orgI
		}
		return {nodes:outNodes, roads:outRoads}
	}

	//
	// Seperate roads which have intersections.
	// in nodes, edges
	// out nr = {nodes, roads}
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

		return {nodes:nodes, roads:outRoads}
	}

	//
	// Merge 2-order nodes.
	// in nodes, edges
	// out nr = {nodes, roads}
	//
	mergeRoads(nodes, roads) {
		var outRoads = [];
		var lenNodes = nodes.length;
		var lenRoads = roads.length;
		var startNodeIdx0, endNodeIdx0;
		var startNodeIdx1, endNodeIdx1;
		var cnt0 = 0, cnt1 = 0, cnt2 = 0, cnt3 = 0;
		var road0, road1;
		var modified = true;

		while(modified) {

			modified = false;
			// check if the node has 2 roads
			for(var i = 0; i < lenNodes; i++) {

				// if the node has 2 roads
				if (nodes[i].roads.length == 2) {

					startNodeIdx0 = roads[nodes[i].roads[0]].nodes[0];
					endNodeIdx0 = roads[nodes[i].roads[0]].nodes[roads[nodes[i].roads[0]].nodes.length - 1];
					startNodeIdx1 = roads[nodes[i].roads[1]].nodes[0];
					endNodeIdx1 = roads[nodes[i].roads[1]].nodes[roads[nodes[i].roads[1]].nodes.length - 1];
					road0 = roads[nodes[i].roads[0]];
					road1 = roads[nodes[i].roads[1]];
					
					// I. 0---> <---1 [3 4 5] [3 2 1]
					if (startNodeIdx0 == startNodeIdx1) {

						if (road0.type > road1.type) road0.type = road1.type;
						road1.nodes.reverse();
						road0.nodes = road1.nodes.concat(road0.nodes.slice(1));
						road1.deleted = true;

						var found = false;
						for(var j = 0; j < nodes[endNodeIdx1].roads.length; j++) {
							if (nodes[endNodeIdx1].roads[j] == nodes[i].roads[1]) {
								nodes[endNodeIdx1].roads[j] = nodes[i].roads[0];
								found = true;
								break;
							}
						}
						if (!found) console.log('not found!');
						
						nodes[i].roads = [];
						modified = true;
						cnt0++;
						break;
					}
					// II. 0---> --->1 [3 4 5] [1 2 3]
					else if (startNodeIdx0 == endNodeIdx1) {

						if (road0.type > road1.type) road0.type = road1.type;
						road0.nodes = road1.nodes.concat(road0.nodes.slice(1));
						road1.deleted = true;

						var found = false;
						for(var j = 0; j < nodes[startNodeIdx1].roads.length; j++) {
							if (nodes[startNodeIdx1].roads[j] == nodes[i].roads[1]) {
								nodes[startNodeIdx1].roads[j] = nodes[i].roads[0];
								found = true;
								break;
							}
						}
						if (!found) console.log('not found!');
						
						nodes[i].roads = [];										
						modified = true;
						cnt1++;
						break;
					}
					// III. 0<--- <---1 [1 2 3] [3 4 5]
					else if (endNodeIdx0 == startNodeIdx1) {

						if (road0.type > road1.type) road0.type = road1.type;
						road0.nodes = road0.nodes.concat(road1.nodes.slice(1));
						road1.deleted = true;
						
						var found = false;
						for(var j = 0; j < nodes[endNodeIdx1].roads.length; j++) {
							if (nodes[endNodeIdx1].roads[j] == nodes[i].roads[1]) {
								nodes[endNodeIdx1].roads[j] = nodes[i].roads[0];
								found = true;
								break;
							}
						}
						if (!found) console.log('not found!');		

						nodes[i].roads = [];						
						cnt2++;
						modified = true;
						break;
					}
					// IV. 0<--- --->1 [1 2 3] [5 4 3]
					else if (endNodeIdx0 == endNodeIdx1) {

						if (road0.type > road1.type) road0.type = road1.type;
						road1.nodes.reverse();
						road0.nodes = road0.nodes.concat(road1.nodes.slice(1));
						road1.deleted = true;

						var found = false;
						for(var j = 0; j < nodes[startNodeIdx1].roads.length; j++) {
							if (nodes[startNodeIdx1].roads[j] == nodes[i].roads[1]) {
								nodes[startNodeIdx1].roads[j] = nodes[i].roads[0];
								found = true;
								break;
							}
						}
						if (!found) console.log('not found!');
						
						nodes[i].roads = [];											
						modified = true;
						cnt3++;
						break;
					}
					else {
						console.log('?!?');
					}
				}
			}
		}

		console.log('0---> <---1 : ' + cnt0);
		console.log('0---> --->1 : ' + cnt1);
		console.log('0<--- <---1 : ' + cnt2);
		console.log('0<--- --->1 : ' + cnt3);

		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) {
				outRoads.push(roads[i]);
			}
		}
		
		nodes = this.calRoadsOfNodes(nodes, outRoads);

		console.log('mergeRoads R(' + roads.length + ') => (' + outRoads.length + ')');

		return {nodes:nodes, roads:outRoads}
	}


	//
	// remove dead links
	// in nodes, edges
	// out nr = {nodes, roads}
	//
	removeDeadLinks(nodes, roads) {
		var lenRoads = roads.length
	  var outNodes, nIdx1, nIdx2
	  var outRoads = []
	  var isDeadLink = false

	  for(var i = 0; i < lenRoads; i++) {
	  	if (roads[i].type > 20) { // links
	  		nIdx1 = roads[i].nodes[0]
	  		nIdx2 = roads[i].nodes[roads[i].nodes.length - 1]

	  		if ((nodes[nIdx1].roads.length != 1)&&(nodes[nIdx2].roads.length != 1)) {
	  			outRoads.push(roads[i])
	  		}
	  	}
	  	else {
	  		outRoads.push(roads[i])
	  	}
	  }

	  var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads);

	  console.log('eliminateLinks N(' + nodes.length + ') => (' + nr.nodes.length + ')');
	  console.log('eliminateLinks R(' + roads.length + ') => (' + nr.roads.length + ')');

		return nr
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
	// 5. RDP Simplification.
	// nodes (# = 55332 -> 5037)
	// roads (# = 4426 -> 4426)
	//
	simplifyRDP(nodes, roads, eps) {
		var lenNodes = nodes.length;
		var lenRoads = roads.length;
		//var eps = this.data.simpDistanceRDP * 0.0001; // 0-20 --> 0.0000-0.0020
		//var eps = 0.0005; // about 50 meter
		//var eps = 0.0001; 
		//var eps = 0.00005; 


		for(var i = 0; i < lenRoads; i++) {
			roads[i].nodes = RDPSimp(roads[i].nodes, eps);
			//console.log(roads[i].nodes);
		}

		var outNodes = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, roads);
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
				var results = result1.concat(result2.slice(1));
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
	// 6. mergeNodes
	// nodes (# = 5037 -> )
	// roads (# = 4426 -> )
	//
	mergeNodes(nodes, roads, types, threshold) {
		var selNodes = [];
	  var lenRoads = roads.length;

	  var orgLenRoads = roads.length;
	  var orgLenNodes = nodes.length;

	  for(var i = 0; i < lenRoads; i++) {
	  	if (types.indexOf(roads[i].type) >= 0) {
	  		roads[i].deleted = true;
	
	  		for(var j = 0; j < roads[i].nodes.length - 1; j++) {
	  			roads.push({
	  				nodes:[roads[i].nodes[j], roads[i].nodes[j + 1]],
	  				oneway: roads[i].oneway,
	  				type: roads[i].type
	  			});
	  		}
	  	}
	  }

	  var outRoads = [];
	  for(var i = 0; i < roads.length; i++) {
			if (!roads[i].deleted) {
				outRoads.push(roads[i]);
			}
		}
		roads = outRoads; 
	  nodes = this.calRoadsOfNodes(nodes, roads);

	  //console.log('# nodes = ' + nodes.length); // 13843
	  //console.log('# roads = ' + roads.length); // 4485 -> 6271


		var lenRoads = roads.length;

		for(var i = 0; i < lenRoads; i++) {
	  	if (types.indexOf(roads[i].type) >= 0) {

	  		var found = false;
	  		for(var j = 0; j < selNodes.length; j++) {
	  			if (selNodes[j] == roads[i].nodes[0]) {
	  				found = true;
	  				break;
	  			}
	  		}
	  		if (!found) {
	  			selNodes.push(roads[i].nodes[0]);
	  		}

	  		found = false;
	  		for(var j = 0; j < selNodes.length; j++) {
	  			if (selNodes[j] == roads[i].nodes[1]) {
	  				found = true;
	  				break;
	  			}
	  		}
	  		if (!found) {
	  			selNodes.push(roads[i].nodes[1]);
	  		}

	  	}
	  }

	  //console.log('selNodes.length = ' + selNodes.length);
	  //console.log(selNodes);


	  while(true) {

		  var minD = 1000;
		  var dist;
		  var minNode1 = -1;
		  var minNode2 = -1;
		  for(var i = 0; i < selNodes.length; i++) {
		  	for(var j = i + 1; j < selNodes.length; j++) {
		  		dist = this.util.D2(
		  			nodes[selNodes[i]].lat, nodes[selNodes[i]].lng, 
		  			nodes[selNodes[j]].lat, nodes[selNodes[j]].lng);
		  		if (minD > dist) {
		  			minD = dist;
		  			minNode1 = selNodes[i];
		  			minNode2 = selNodes[j];
		  		}
		  	}
		  }

		  //console.log('minD = ' + minD);

		  if (minD > threshold) break;

		  // make new node
		  nodes.push({
		  	lat: (nodes[minNode1].lat + nodes[minNode2].lat)/2,
		  	lng: (nodes[minNode1].lng + nodes[minNode2].lng)/2,
		  	roads: []
		  });

		  var lastIndex = nodes.length - 1;

		  //console.log('(' + minNode1 + ',' + minNode2 + ') => ' + lastIndex);

		  for(var i = 0; i < nodes[minNode1].roads.length; i++) {
		  	nodes[lastIndex].roads.push(nodes[minNode1].roads[i]);
		  }

		  for(var i = 0; i < nodes[minNode2].roads.length; i++) {
		  	if (nodes[lastIndex].roads.indexOf(nodes[minNode2].roads[i]) < 0)
		  		nodes[lastIndex].roads.push(nodes[minNode2].roads[i]);
		  }
		  
		  for(var i = 0; i < nodes[minNode1].roads.length; i++) {
		  	for(var j = 0; j < roads[nodes[minNode1].roads[i]].nodes.length; j++) {
			  	if(roads[nodes[minNode1].roads[i]].nodes[j] == minNode1) {
			  		roads[nodes[minNode1].roads[i]].nodes[j] = lastIndex;
			  		break;
			  	}
			  }
		  }

		  for(var i = 0; i < nodes[minNode2].roads.length; i++) {
		  	for(var j = 0; j < roads[nodes[minNode2].roads[i]].nodes.length; j++) {
			  	if(roads[nodes[minNode2].roads[i]].nodes[j] == minNode2) {
			  		roads[nodes[minNode2].roads[i]].nodes[j] = lastIndex;
			  		break;
			  	}
			  }
		  }

		  nodes[minNode1].deleted = true;
		  nodes[minNode2].deleted = true;

		  var slicedIdx = selNodes.indexOf(minNode1);
		  selNodes.splice(slicedIdx, 1);
		  slicedIdx = selNodes.indexOf(minNode2);
		  selNodes.splice(slicedIdx, 1);
		  selNodes.push(lastIndex);
		}

		//console.log('# nodes = ' + nodes.length); // 13843 -> 15537

		nr = this.removeDeletedNode(nodes, roads);
		nodes = nr.nodes;
		roads = nr.roads;

		//console.log('# nodes = ' + nodes.length); // 15537 -> 12149
	  
	  roads = this.cleanupRoads(nodes, roads);

	  //console.log('# roads = ' + roads.length); // 6271 -> 4423

	  nodes = this.calRoadsOfNodes(nodes, roads);

	  console.log('eliminateLinks N(' + orgLenNodes + ') => (' + nodes.length + ')');
	  console.log('eliminateLinks R(' + orgLenRoads + ') => (' + roads.length + ')');

		var raw = {nodes:nodes, roads:roads};
		//this.util.saveTextAsFile(raw, 'nr_seattle_cluster.js');
		return raw;
	}

	cleanupRoads(nodes, roads) {
		var outRoads = [];
		var lenRoads = roads.length;

		// removeEmptyRoads
		var cnt = 0;
		for(var i = 0; i < lenRoads; i++) {
			if (roads[i].nodes[0] == roads[i].nodes[1]) {
				roads[i].deleted = true;
				cnt++;
			}
		}
		console.log('cnt = ' + cnt);
		cnt = 0;

		// removeDuplicateRoads
		for(var i = 0; i < lenRoads; i++) {
			if (roads[i].deleted) continue;

			for(var j = i + 1; j < lenRoads; j++) {
				if ((roads[i].nodes[0] == roads[j].nodes[0])
					&&(roads[i].nodes[roads[i].nodes.length - 1] == roads[j].nodes[roads[j].nodes.length - 1])) {
					roads[j].deleted = true;
					cnt++;
				}
				else if ((roads[i].nodes[0] == roads[j].nodes[roads[j].nodes.length - 1])
					&&(roads[i].nodes[roads[i].nodes.length - 1] == roads[j].nodes[0])) {
					roads[j].deleted = true;
					cnt++;
				}
			}
		}
		console.log('cnt = ' + cnt);
		cnt = 0;

		
		// removeDeletedRoads
		for(var i = 0; i < lenRoads; i++) {
			if ((roads[i].nodes[0] == -1)||(roads[i].nodes[roads[i].nodes.length - 1] == -1)) {
				roads[i].deleted = true;
				cnt++;
			}
		}
		console.log('cnt = ' + cnt);

		

		// make new roads
		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) {
				outRoads.push(roads[i]);
			}
		}

		console.log('clean up : ' + lenRoads + ' -> ' + outRoads.length);
		return outRoads;
	}

	//
	//
	//
	removeDeletedNode(nodes, roads) {
		var outNodes = [];
		var lenNodes = nodes.length;
		var lenRoads = roads.length;

		for(var i = 0; i < lenNodes; i++) {
			if (!nodes[i].deleted) {
				outNodes.push({lat:nodes[i].lat, lng:nodes[i].lng, roads:[]});
				nodes[i].newIndex = outNodes.length - 1;
			}
			else {
				nodes[i].newIndex = -1;
			}
		}

		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < roads[i].nodes.length; j++) {
				roads[i].nodes[j] = nodes[roads[i].nodes[j]].newIndex;
			}
		}
		return {nodes:outNodes, roads:roads};
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


	//
	// gen0 version - parsing old data
	//
	makeFilteredNodesEdgesFromGen0() {
		// require: <script src="data/seattle_washington_roads_gen0.js"></script>
		var east = this.opt.boundary.seattle.east;
		var west = this.opt.boundary.seattle.west;
		var south = this.opt.boundary.seattle.south;
		var north = this.opt.boundary.seattle.north;
		console.log('[filterRect] Original features # : ' + gen0.features.length); // 28559
		var filtered_features = filterRect(gen0, east, west, south, north);
		console.log('[filterRect] Filtered features # : ' + filtered_features.length); // 10074

		var edges = convFeaturesToEdges(filtered_features);
		console.log('[convFeaturesToEdges] Edges # : ' + edges.length); // 10074

		this.util.saveTextAsFile(edges, 'roads_gen_filtered.js');

		var ne = this.net.makeNEobjects(edges);
		console.log('[makeNEobjects] Nodes # = ' + ne.nodes.length); // 10781
		console.log('[makeNEobjects] Edges # = ' + ne.edges.length); // 10074

		this.util.saveTextAsFile(ne.nodes, 'nodes_filtered.js');
		this.util.saveTextAsFile(ne.edges, 'edges_filtered.js');


		// sub functions

		function filterRect(orgData, east, west, south, north) {
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

		function convFeaturesToEdges(features) {
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
	}


	
}