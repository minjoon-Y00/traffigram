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
		var found
		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < outRoads[i].nodes.length; j++) {
				found = false
				for(var k = 0; k < lenOutNodes; k++) {
					if (outNodes[k].orgI == outRoads[i].nodes[j]) {
						outRoads[i].nodes[j] = k
						found = true
						break
					}
				}
				if (!found) {
					console.log('# not found ')
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
	// remove dead links (that has order-1 nodes)
	// in nodes, edges
	// out nr = {nodes, roads}
	//
	removeDeadLinks(nodes, roads) {
		var maxIter = 100
		var n = nodes
		var r = roads
		var out, difNodeNum, difRoadNum

		for(var i = 0; i < maxIter; i++) {
			out = this.stepRemoveDeadLinks(n, r)

			difNodeNum = out.new.nodes.length - out.old.nodes.length
			difRoadNum = out.new.roads.length - out.old.roads.length

			if ((difNodeNum == 0)&&(difRoadNum == 0)) {
				return out.new
			}
			else {
				console.log('step ' + i)
				console.log('removeDeadLinks N(' + out.old.nodes.length + ') => (' + out.new.nodes.length + ') R(' 
					+ out.old.roads.length + ') => (' + out.new.roads.length + ')')

				n = out.new.nodes
				r = out.new.roads
			}
		}
	}

	//
	// subfunction of removeDeadLinks()
	//
	stepRemoveDeadLinks(nodes, roads) {
		var lenRoads = roads.length
	  var nIdx1, nIdx2
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

	  nodes = this.calRoadsOfNodes(nodes, outRoads)
	  var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads)

		return {old:{nodes:nodes, roads:roads}, new:nr}
	}


	//
	// RDP Simplification
	// in nodes, edges, eps (= 0.0001)
	// out nr = {nodes, roads}
	//
	simplifyRDP(nodes, roads, eps) {
		var lenNodes = nodes.length
		var lenRoads = roads.length
		var eps = eps || 0.0001 // about 10 meter
		//var eps = this.data.simpDistanceRDP * 0.0001; // 0-20 --> 0.0000-0.0020

		for(var i = 0; i < lenRoads; i++) {
			roads[i].nodes = RDPSimp(roads[i].nodes, eps)
		}

		var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, roads)
		var outNodes = this.calRoadsOfNodes(nr.nodes, nr.roads)

	  console.log('eliminateLinks N(' + nodes.length + ') => (' + outNodes.length + ')')

		return {nodes:outNodes, roads:roads}


		function RDPSimp(nodeArr, eps) {
			// Find the point with the maximum distance
			var dmax = 0
			var index = 0
			var startNode = nodes[nodeArr[0]]
			var endNode = nodes[nodeArr[nodeArr.length - 1]]

			for(var i = 1; i < nodeArr.length - 1; i++) {
				var testNode = nodes[nodeArr[i]]
				var d = distanceBetweenLineAndPoint(
					startNode.lat, startNode.lng, endNode.lat, endNode.lng, testNode.lat, testNode.lng)
				if (d > dmax) {
					index = i
					dmax = d
				}
			}

			// If max distance is greater than eps, recursively simplify
			if (dmax > eps) {
				// Recursive call
				var result1 = RDPSimp(nodeArr.slice(0, index + 1), eps)
				var result2 = RDPSimp(nodeArr.slice(index, nodeArr.length), eps)

				// Build the result list
				var results = result1.concat(result2.slice(1))
			}
			else {
				results = [nodeArr[0], nodeArr[nodeArr.length - 1]]
			}
			return results
		}

		function distanceBetweenLineAndPoint(L1x, L1y, L2x, L2y, Px, Py) {
			var t = Math.abs((L2y - L1y) * Px - (L2x - L1x) * Py + L2x * L1y - L2y * L1x)
			var b = Math.sqrt((L2y - L1y) * (L2y - L1y) + (L2x - L1x) * (L2x - L1x))
			return t / b
		}
	}


	//
	// clusterNodes
	// in nodes, edges, types (e.g. [1,2]), threshold (= 0.005)
	// out nr = {nodes, roads}
	//
	clusterNodes(nodes, roads, types, threshold) {
		var threshold = threshold || 0.005 // about 50 meter
		var selNodes = []
	  var lenRoads = roads.length
	  var orgLenRoads = roads.length
	  var orgLenNodes = nodes.length

	  for(var i = 0; i < lenRoads; i++) {
	  	if (types.indexOf(roads[i].type) >= 0) {
	  		roads[i].deleted = true
	
	  		for(var j = 0; j < roads[i].nodes.length - 1; j++) {
	  			roads.push({
	  				nodes:[roads[i].nodes[j], roads[i].nodes[j + 1]],
	  				oneway: roads[i].oneway,
	  				type: roads[i].type
	  			})
	  		}
	  	}
	  }

	  var outRoads = []
	  for(var i = 0; i < roads.length; i++) {
			if (!roads[i].deleted) {
				outRoads.push(roads[i])
			}
		}
		roads = outRoads
	  nodes = this.calRoadsOfNodes(nodes, roads)

		lenRoads = roads.length;

		for(var i = 0; i < lenRoads; i++) {
	  	if (types.indexOf(roads[i].type) >= 0) {

	  		var found = false;
	  		for(var j = 0; j < selNodes.length; j++) {
	  			if (selNodes[j] == roads[i].nodes[0]) {
	  				found = true
	  				break
	  			}
	  		}
	  		if (!found) {
	  			selNodes.push(roads[i].nodes[0])
	  		}

	  		found = false;
	  		for(var j = 0; j < selNodes.length; j++) {
	  			if (selNodes[j] == roads[i].nodes[1]) {
	  				found = true
	  				break
	  			}
	  		}
	  		if (!found) {
	  			selNodes.push(roads[i].nodes[1])
	  		}

	  	}
	  }

	  while(true) {
		  var minD = 1000
		  var dist
		  var minNode1 = -1
		  var minNode2 = -1

		  for(var i = 0; i < selNodes.length; i++) {
		  	for(var j = i + 1; j < selNodes.length; j++) {
		  		dist = this.util.D2(
		  			nodes[selNodes[i]].lat, nodes[selNodes[i]].lng, 
		  			nodes[selNodes[j]].lat, nodes[selNodes[j]].lng)
		  		if (minD > dist) {
		  			minD = dist
		  			minNode1 = selNodes[i]
		  			minNode2 = selNodes[j]
		  		}
		  	}
		  }

		  if (minD > threshold) break

		  // make new node
		  nodes.push({
		  	lat: (nodes[minNode1].lat + nodes[minNode2].lat)/2,
		  	lng: (nodes[minNode1].lng + nodes[minNode2].lng)/2,
		  	roads: []
		  })

		  var lastIndex = nodes.length - 1

		  //console.log('(' + minNode1 + ',' + minNode2 + ') => ' + lastIndex)

		  for(var i = 0; i < nodes[minNode1].roads.length; i++) {
		  	nodes[lastIndex].roads.push(nodes[minNode1].roads[i])
		  }

		  for(var i = 0; i < nodes[minNode2].roads.length; i++) {
		  	if (nodes[lastIndex].roads.indexOf(nodes[minNode2].roads[i]) < 0)
		  		nodes[lastIndex].roads.push(nodes[minNode2].roads[i])
		  }
		  
		  for(var i = 0; i < nodes[minNode1].roads.length; i++) {
		  	for(var j = 0; j < roads[nodes[minNode1].roads[i]].nodes.length; j++) {
			  	if(roads[nodes[minNode1].roads[i]].nodes[j] == minNode1) {
			  		roads[nodes[minNode1].roads[i]].nodes[j] = lastIndex
			  		break
			  	}
			  }
		  }

		  for(var i = 0; i < nodes[minNode2].roads.length; i++) {
		  	for(var j = 0; j < roads[nodes[minNode2].roads[i]].nodes.length; j++) {
			  	if(roads[nodes[minNode2].roads[i]].nodes[j] == minNode2) {
			  		roads[nodes[minNode2].roads[i]].nodes[j] = lastIndex
			  		break
			  	}
			  }
		  }

		  nodes[minNode1].deleted = true
		  nodes[minNode2].deleted = true

		  var slicedIdx = selNodes.indexOf(minNode1)
		  selNodes.splice(slicedIdx, 1)
		  slicedIdx = selNodes.indexOf(minNode2)
		  selNodes.splice(slicedIdx, 1)
		  selNodes.push(lastIndex)
		}

		nr = this.removeDeletedNode(nodes, roads)
		nodes = nr.nodes
		roads = nr.roads

	  roads = this.cleanupRoads(nodes, roads)
	  nodes = this.calRoadsOfNodes(nodes, roads)

	  console.log('eliminateLinks N(' + orgLenNodes + ') => (' + nodes.length + ')')
	  console.log('eliminateLinks R(' + orgLenRoads + ') => (' + roads.length + ')')

		return {nodes:nodes, roads:roads}
	}

	//
	// sub functions of clusterNodes()
	//
	removeDeletedNode(nodes, roads) {
		var outNodes = []
		var lenNodes = nodes.length
		var lenRoads = roads.length

		for(var i = 0; i < lenNodes; i++) {
			if (!nodes[i].deleted) {
				outNodes.push({lat:nodes[i].lat, lng:nodes[i].lng, roads:[]})
				nodes[i].newIndex = outNodes.length - 1
			}
			else {
				nodes[i].newIndex = -1
			}
		}

		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < roads[i].nodes.length; j++) {
				roads[i].nodes[j] = nodes[roads[i].nodes[j]].newIndex
			}
		}
		return {nodes:outNodes, roads:roads}
	}

	cleanupRoads(nodes, roads) {
		var outRoads = []
		var lenRoads = roads.length
		var cnt = 0

		// remove empty roads
		
		for(var i = 0; i < lenRoads; i++) {
			if (roads[i].nodes[0] == roads[i].nodes[1]) {
				roads[i].deleted = true
				cnt++
			}
		}
		//console.log('cnt = ' + cnt)
		cnt = 0

		// remove duplicate roads

		for(var i = 0; i < lenRoads; i++) {
			if (roads[i].deleted) continue

			for(var j = i + 1; j < lenRoads; j++) {
				if ((roads[i].nodes[0] == roads[j].nodes[0])
					&&(roads[i].nodes[roads[i].nodes.length - 1] == roads[j].nodes[roads[j].nodes.length - 1])) {
					roads[j].deleted = true
					cnt++
				}
				else if ((roads[i].nodes[0] == roads[j].nodes[roads[j].nodes.length - 1])
					&&(roads[i].nodes[roads[i].nodes.length - 1] == roads[j].nodes[0])) {
					roads[j].deleted = true
					cnt++
				}
			}
		}
		//console.log('cnt = ' + cnt)
		cnt = 0

		// remove deleted roads

		for(var i = 0; i < lenRoads; i++) {
			if ((roads[i].nodes[0] == -1)||(roads[i].nodes[roads[i].nodes.length - 1] == -1)) {
				roads[i].deleted = true
				cnt++
			}
		}
		//console.log('cnt = ' + cnt)

		// make new roads

		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) outRoads.push(roads[i])
		}

		console.log('clean up : ' + lenRoads + ' -> ' + outRoads.length)
		return outRoads
	}


	removeMultipleRoads(nodes, roads) {
		var orgLenNodes = nodes.length
		var orgLenRoads = roads.length
		var lenNodes = nodes.length

		// part I: [A - B(order = 2) - C, A - C] => [A - C]

		var cnt = 0
		var r1, r2, n1, n2, intersections
		for(var i = 0; i < lenNodes; i++) {

			if (nodes[i].roads.length == 2) {

				r1 = roads[nodes[i].roads[0]]
				r2 = roads[nodes[i].roads[1]]
				n1 = (r1.nodes[0] == i) ? r1.nodes[1] : r1.nodes[0] 
				n2 = (r2.nodes[0] == i) ? r2.nodes[1] : r2.nodes[0]

				intersections = $.arrayIntersect(nodes[n1].roads, nodes[n2].roads)

				if (intersections.length > 0) {
					roads[nodes[i].roads[0]].deleted = true
					roads[nodes[i].roads[1]].deleted = true
					cnt++
				}
			}
		}	

		console.log('cnt I = ' + cnt)
		
		var outRoads = []
		var lenRoads = roads.length

		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) outRoads.push(roads[i])
		}

		var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads)
		var outNodes = this.calRoadsOfNodes(nr.nodes, nr.roads)

		nodes = outNodes
		roads = outRoads


		// part II: [A - B(order > 2) - C, A - C] => [A - B - C]

		cnt = 0
		lenNodes = nodes.length
		var nArr, connectedRoad, r1, r2, r3
		var len1, len2, len3

		for(var i = 0; i < lenNodes; i++) {
			if (nodes[i].roads.length > 2) {

				nArr = []

				for(var j = 0; j < nodes[i].roads.length; j++) {
					if (roads[nodes[i].roads[j]].nodes[0] == i) {
						nArr.push(roads[nodes[i].roads[j]].nodes[1])
					}
					else {
						nArr.push(roads[nodes[i].roads[j]].nodes[0])
					}
				}

				
				for(var j = 0; j < nArr.length; j++) {
					for(var k = j + 1; k < nArr.length; k++) {
						connectedRoad = isDirectlyConnected(nArr[j], nArr[k], nodes, roads)
						if (connectedRoad != null) {
							r1 = connectedRoad

							for(var l = 0; l < nodes[nArr[j]].roads.length; l++) {
								if ((roads[nodes[nArr[j]].roads[l]].nodes[0] == i)
									||(roads[nodes[nArr[j]].roads[l]].nodes[1] == i)) {
									r2 = roads[nodes[nArr[j]].roads[l]]
									break
								}
							}

							for(var l = 0; l < nodes[nArr[k]].roads.length; l++) {
								if ((roads[nodes[nArr[k]].roads[l]].nodes[0] == i)
									||(roads[nodes[nArr[k]].roads[l]].nodes[1] == i)) {
									r3 = roads[nodes[nArr[k]].roads[l]]
									break
								}
							}

							len1 = this.lengthOfRoad(r1, nodes)
							len2 = this.lengthOfRoad(r2, nodes)
							len3 = this.lengthOfRoad(r3, nodes)

							if ((len1 > len2)&&(len1 > len3)) {
								r1.deleted = true
								r2.deleted = false
								r3.deleted = false
							}
							else if ((len2 > len1)&&(len2 > len3)) {
								r1.deleted = false
								r2.deleted = true
								r3.deleted = false
							}
							else if ((len3 > len1)&&(len3 > len2)) {
								r1.deleted = false
								r2.deleted = false
								r3.deleted = true
							}

							cnt++
						}
					}
				}
			}			
		}

		console.log('cnt II = ' + cnt)
		
		var outRoads = []
		var lenRoads = roads.length

		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) outRoads.push(roads[i])
		}

		var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads)
		var outNodes = this.calRoadsOfNodes(nr.nodes, nr.roads)

		nodes = outNodes
		roads = outRoads


		// part III: [A - B - C, A - D - C] => [A - E(B + D / 2) - C]

		cnt = 0
		lenNodes = nodes.length
		var n1, n2, m1, m2
		var r1, r2, s1, s2
		var lenR, lenS

		for(var i = 0; i < lenNodes; i++) {
			if (nodes[i].roads.length == 2) {

				r1 = roads[nodes[i].roads[0]]
				r2 = roads[nodes[i].roads[1]]
				n1 = (r1.nodes[0] == i) ? r1.nodes[1] : r1.nodes[0] 
				n2 = (r2.nodes[0] == i) ? r2.nodes[1] : r2.nodes[0]

				for(var j = i + 1; j < lenNodes; j++) {
					if (nodes[j].roads.length == 2) {

						s1 = roads[nodes[j].roads[0]]
						s2 = roads[nodes[j].roads[1]]
						m1 = (s1.nodes[0] == j) ? s1.nodes[1] : s1.nodes[0] 
						m2 = (s2.nodes[0] == j) ? s2.nodes[1] : s2.nodes[0]

						if (((n1 == m1)&&(n2 == m2))||((n1 == m2)&&(n2 == m1))) {

							lenR = this.lengthOfRoad(r1, nodes) + this.lengthOfRoad(r2, nodes)
							lenS = this.lengthOfRoad(s1, nodes) + this.lengthOfRoad(s2, nodes)

							if (lenR > lenS) {
								r1.deleted = true
								r2.deleted = true
							}
							else {
								s1.deleted = true
								s2.deleted = true
							}
							cnt++
						}

					}
				}
			}
		}
		console.log('cnt III = ' + cnt)

		var outRoads = []
		var lenRoads = roads.length

		for(var i = 0; i < lenRoads; i++) {
			if (!roads[i].deleted) outRoads.push(roads[i])
		}

		var nr = this.cleanEmptyNodesAndCalNodesOfRoads(nodes, outRoads)
		var outNodes = this.calRoadsOfNodes(nr.nodes, nr.roads)

		console.log('removeMultipleRoads N(' + orgLenNodes + ') => (' + outNodes.length + ')')
	  console.log('removeMultipleRoads R(' + orgLenRoads + ') => (' + outRoads.length + ')')

		return {nodes:outNodes, roads:outRoads}



		function isDirectlyConnected(n1, n2, nodes, roads) {
			for(var i = 0; i < nodes[n1].roads.length; i++) {
				if (roads[nodes[n1].roads[i]].nodes[0] == n1) {
					if (roads[nodes[n1].roads[i]].nodes[1] == n2) {
						return roads[nodes[n1].roads[i]]
					}
				}
				else {
					if (roads[nodes[n1].roads[i]].nodes[0] == n2) {
						return roads[nodes[n1].roads[i]]
					}
				}
			}
			return null
		}
	}

	lengthOfRoad(road, nodes) {
		return this.util.D2(nodes[road.nodes[0]].lat, nodes[road.nodes[0]].lng, 
	  	nodes[road.nodes[1]].lat, nodes[road.nodes[1]].lng)
	}



	divideRoads(nodes, roads) {
		var lenRoads = roads.length
		var outRoads = []

		for(var i = 0; i < lenRoads; i++) {
			for(var j = 0; j < roads[i].nodes.length - 1; j++) {
				var obj = {}
				obj.nodes = [roads[i].nodes[j], roads[i].nodes[j + 1]]
				obj.oneway = roads[i].oneway
				obj.type = roads[i].type
				outRoads.push(obj)
			}
		}

		nodes = this.calRoadsOfNodes(nodes, outRoads)

	  console.log('divideRoads R(' + roads.length + ') => (' + outRoads.length + ')')

		return {nodes:nodes, roads:outRoads}
	}




	









	saveFileOfSaperateRoads() {

		this.data.simple.nodes = this.util.clone(this.data.original.nodes);
		this.data.simple.roads = this.util.clone(this.data.original.roads);
		calOrderOfNodes(this.data.simple.nodes, this.data.simple.roads);

		console.log(':' + this.data.simple.roads.length);

		this.data.simple.roads = this.alg.separateRoads(this.data.simple.nodes, this.data.simple.roads);
		calOrderOfNodes(this.data.simple.nodes, this.data.simple.roads);

		console.log('::' + this.data.simple.roads.length);

		this.data.simple.roads = this.alg.mergeRoads(this.data.simple.nodes, this.data.simple.roads);
		calOrderOfNodes(this.data.simple.nodes, this.data.simple.roads);

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

		function 	calOrderOfNodes(nodes, roads) {
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



	}


	//
	// gen0 version - parsing old data (need to be tested)
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

		var ne = makeNEobjects(edges);
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

		function makeNEobjects(edges) {
			var nodes = calNodes(edges)

			for (var i = 0; i < edges.length; i++) {
				for (var j = 0; j < nodes.length; j++) {
					if ((edges[i].startNode.lat === nodes[j].lat)
						&& (edges[i].startNode.lng === nodes[j].lng)) {
					edges[i].startNode.index = j
					}

					if ((edges[i].endNode.lat === nodes[j].lat)
						&& (edges[i].endNode.lng === nodes[j].lng)) {
					edges[i].endNode.index = j
					}
				}
			}
			return {nodes: nodes, edges: edges}
		}

		function calNodes(edges) {
			var nodes = []

			for(var i = 0; i < edges.length; i++) {
				nodes.push({
					lng:edges[i].startNode.lng, 
					lat:edges[i].startNode.lat
				})

				nodes.push({
					lng:edges[i].endNode.lng, 
					lat:edges[i].endNode.lat
				})
			}
			return reduceDuplicatedNodes(nodes)
		}

		function 	reduceDuplicatedNodes(nodes) {
			var unique = []

			for(var i = 0; i < nodes.length; i++) {
				var found = false
				for(var j = 0; j < unique.length; j++) {
					if ((unique[j].lat === nodes[i].lat)&&(unique[j].lng === nodes[i].lng)) {
						found = true
						break;
					}
				}
				if (!found) {
					unique.push({
						lat: nodes[i].lat,
						lng: nodes[i].lng
					})
				}
			}
			return unique
		}
	}


	
}
