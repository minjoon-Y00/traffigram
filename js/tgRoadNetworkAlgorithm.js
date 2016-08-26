class TGRoadNetworkAlgorithm {

	constructor(data, net, util, options) {
		this.data = data;
		this.net = net;
		this.util = util;
		this.opt = options;
	}

	//
	//
	//
	reduceDuplicatedNodes(nodes) {
		var unique = [];

		for(var i = 0; i < nodes.length; i++) {
			var found = false;
			for(var j = 0; j < unique.length; j++) {
				if ((unique[j].lat === nodes[i].lat)&&(unique[j].lng === nodes[i].lng)) {
					found = true;
					break;
				}
			}
			if (!found) {
				unique.push({
					lat: nodes[i].lat,
					lng: nodes[i].lng
				});
			}
		}
		return unique;
	}

	seperateAndMerge() {
		//var nodes = this.data.original.nodes;
		//var edges = this.data.simpEdges;
		//var len = edges.length;

		/*for(var i = 0; i < len; i++) {
			var firstNode = edges[i].nodes[0];
			var endNode = edges[i].nodes[edges[i].nodes.length - 1];
			edges[i].nodes = [firstNode, endNode];
		}*/

		/*
		for(var i = 0; i < len; i++) {
			edges[i].nodes = this.reduceNodesByAngleInEdgeNodes(edges[i].nodes, nodes, this.data.simpThresholdAngle);
		}
		*/
		this.net.calOrderOfNodes(null, this.data.dispRoads);
		this.separateRoads();
		this.net.calOrderOfNodes(null, this.data.dispRoads);
		this.mergeRoads();
	}

	reduceNodesByAngleInEdgeNodes(nodes, refNode, threshold_angle) {

		var isDeleted = true;

		while(isDeleted) {

			isDeleted = false;

			for(var i = 0; i < nodes.length - 2; i++) {
				var line1EndPoint = refNode[nodes[i]];
				var touchPoint = refNode[nodes[i + 1]];
				var line2EndPoint = refNode[nodes[i + 2]];
				var angle = this.getAngleBetweenTwoTouchingLineSegments(touchPoint, line1EndPoint, line2EndPoint);
				angle = 180 - Math.abs(this.util.degrees(angle));

				if (angle < threshold_angle) {
					nodes.splice(i + 1, 1);
					isDeleted = true;
					break;
				}
			}
		}
		return nodes;
	}

	calNodeOrder() {

	}

	remove2DegreeNodes() {
		var nodes = this.data.original.nodes;
		var edges = this.data.simpEdges;
		var len = edges.length;

		for(var i = 0; i < len; i++) {
			if (edges[i].nodes.length == 2) {

			}
			var firstNode = edges[i].nodes[0];
			var endNode = edges[i].nodes[edges[i].nodes.length - 1];
			edges[i].nodes = [firstNode, endNode];
		}

	}

	getAngleBetweenTwoTouchingLineSegments(touchPoint, line1EndPoint, line2EndPoint) {
	  var line2EndPointVector = {lat: line2EndPoint.lat - touchPoint.lat, lng: line2EndPoint.lng - touchPoint.lng};
	  var line1EndPointVector = {lat: line1EndPoint.lat - touchPoint.lat, lng: line1EndPoint.lng - touchPoint.lng};
	  var aSq = pythagSquared(line1EndPoint, line2EndPoint);
	  var b = pythag(line2EndPoint, touchPoint);
	  var c = pythag(line1EndPoint, touchPoint);
	  var crossProduct = line2EndPointVector.lat * line1EndPointVector.lng - line1EndPointVector.lat * line2EndPointVector.lng;
	 
		return (crossProduct < 0 ? -1 : 1) * Math.acos((b * b + c * c  - aSq) / (2 * b * c)); // cosine rule
		
	  function pythagSquared(point1, point2) {
	    return Math.pow(point1.lat - point2.lat, 2) + Math.pow(point1.lng - point2.lng, 2);
	  }
	   
	  function pythag(point1, point2) {
	    return Math.sqrt(pythagSquared(point1, point2));
	  }
	}


	//
	// make links straight lines
	//
	straightenLink(roads) {
		var links = ['motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link'];
		var lenRoads = roads.length;

		for(var i = 0; i < lenRoads; i++) {
			// If road type is link
			if (links.indexOf(roads[i].tag[0]) >= 0) {
				console.log(roads[i].tag[0]);
				roads[i].nodes = [roads[i].nodes[0], roads[i].nodes[roads[i].nodes.length - 1]];
			}
		}
		return roads;
	}

	/*
	mergeRoads2(nodes, roads) {
		var nodes = nodes || this.data.original.nodes;
		var roads = roads || this.data.simple.roads;
		//var nodes = this.data.original.nodes;
		//var roads = this.util.clone(this.data.dispRoads);
		var outRoads = [];
		var startNodeIdx, endNodeIdx;

		for(var i = 0; i < roads.length; i++) {
			startNodeIdx = roads[i].nodes[0]; 
			endNodeIdx = roads[i].nodes[roads[i].nodes.length - 1];

			roads[i].haveToCheckStartNode = (nodes[startNodeIdx].order == 2);
			roads[i].haveToCheckEndNode = (nodes[endNodeIdx].order == 2);
		}

		while(roads.length > 0) {
			var road = roads.shift();

			if (road.haveToCheckStartNode) {
				findAndMerge('start', road);
			}
			else if (road.haveToCheckEndNode) {
				findAndMerge('end', road);
			}
			else {
				outRoads.push(road);
			}
		}
		console.log('R(' + this.data.dispRoads.length + ') => (' + outRoads.length + ')');
		this.data.dispRoads = outRoads;

		//

		function findAndMerge(startOrEnd, r) {
			var found = 'none';
			var nodeIdx, isStartPoint;

			if (startOrEnd == 'start') isStartPoint = true;
			else if (startOrEnd == 'end') isStartPoint = false;
			else console.log('ERR');

			if (isStartPoint) nodeIdx = r.nodes[0];
			else nodeIdx = r.nodes[r.nodes.length - 1];

			for(var i = 0; i < roads.length; i++) {
				var sIdx = roads[i].nodes[0];
				var eIdx = roads[i].nodes[roads[i].nodes.length - 1];

				// if startIdx = nodeIdx
				if (sIdx == nodeIdx) {

					// validation
					if (!validateTagAndOneway(r, roads[i])) {
						if (isStartPoint) r.haveToCheckStartNode = false;
						else r.haveToCheckEndNode = false;
						roads[i].haveToCheckStartNode = false;
						roads.push(r);
						break;
					} 

					found = 'startPoint';
					break;
				}
				// if endIdx = nodeIdx
				else if (eIdx == nodeIdx) {

					// validation
					if (!validateTagAndOneway(r, roads[i])) {
						if (isStartPoint) r.haveToCheckStartNode = false;
						else r.haveToCheckEndNode = false;
						roads[i].haveToCheckEndNode = false;
						roads.push(r);
						break;
					} 

					found = 'endPoint';
					break;
				}
			}

			if (found != 'none') {

				if (isStartPoint && (found == 'startPoint')) {
					//console.log('s - s');

					r.startNodeChecked = true;
					roads[i].startNodeChecked = true;
					roads.push(r);
				}
				else if (isStartPoint && (found == 'endPoint')) {
					//console.log('!!s - e');

					r.nodes.shift();
					r.nodes = roads[i].nodes.concat(r.nodes);

					r.haveToCheckStartNode = roads[i].haveToCheckStartNode;
					roads.push(r);
					nodes[nodeIdx].order = 0;
					roads.splice(i, 1);

				}
				else if (!isStartPoint && (found == 'startPoint')) {
					//console.log('!!e - s');

					roads[i].nodes.shift()
					r.nodes = r.nodes.concat(roads[i].nodes);

					r.haveToCheckEndNode = roads[i].haveToCheckEndNode;
					roads.push(r);
					nodes[nodeIdx].order = 0;
					roads.splice(i, 1);
				}
				else if (!isStartPoint && (found == 'endPoint')) {
					//console.log('e - e');

					r.endNodeChecked = true;
					roads[i].endNodeChecked = true;
					roads.push(r);
				}
				else {
					console.log('wrong');
				}
			}
		}

		function validateTagAndOneway(road1, road2) {
			// type equality test
			if (road1.tag[0] != road2.tag[0]) {
				//console.log('tag is not same');
				//console.log('roads[i].tag[0] = ' + road1.tag[0]);
				//console.log('roads[j].tag[0] = ' + road2.tag[0]);
				return false;
			}
			// oneway equality test
			if (road1.oneway != road2.oneway) {
				//console.log('oneway is not same');
				//console.log('roads[i].oneway = ' + roads[i].oneway);
				//console.log('roads[j].oneway= ' + roads[j].oneway);
				return false;
			}
			return true;
		}
	}
	*/

	//
	//
	//
	

	//
	//
	//
	simpMergeRoads() {
		var nodes = this.data.original.nodes;
		//var roads = this.data.original.roads;
		var roads = this.data.dispRoads;
		var lenNodes = nodes.length;
		var lenRoads = roads.length;
		var links = ['motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link'];

		var edges = [];

		for(var i = 0; i < lenRoads; i++) {
			var lenNodes = roads[i].nodes.length;

			for(var j = 0; j < lenNodes - 1; j++) {
				if (links.indexOf(roads[i].tag[0]) != -1) continue;

				var e = {};
				e.s = roads[i].nodes[j];
				e.e = roads[i].nodes[j + 1];
				e.oneway = roads[i].oneway;
				e.type = roads[i].tag[0];
				edges.push(e);
			}
		}

		var threshold = 0.0002;
		var mergeObjs = [];
		var mobj = {};
		var cntMergeObj = 0;
		var lenEdges = edges.length;

		for(var i = 0; i < lenEdges; i++) {

			cntMergeObj = 0;
			mobj = {};

			for(var j = i + 1; j < lenEdges; j++) {

				if (edges[i].type != edges[j].type) continue;

				var sLat1 = nodes[edges[i].s].lat;
				var sLng1 = nodes[edges[i].s].lng;
				var eLat1 = nodes[edges[i].e].lat;
				var eLng1 = nodes[edges[i].e].lng;

				var sLat2 = nodes[edges[j].s].lat;
				var sLng2 = nodes[edges[j].s].lng;
				var eLat2 = nodes[edges[j].e].lat;
				var eLng2 = nodes[edges[j].e].lng;

				var dSS = this.util.D2(sLat1, sLng1, sLat2, sLng2);
				var dSE = this.util.D2(sLat1, sLng1, eLat2, eLng2);
				var dES = this.util.D2(eLat1, eLng1, sLat2, sLng2);
				var dEE = this.util.D2(eLat1, eLng1, eLat2, eLng2);

				if ((dSS < threshold)&&(dEE < threshold)) {

					if ((edges[i].s == edges[j].s)||(edges[i].e == edges[j].e)
						||(edges[i].s == edges[j].e)||(edges[i].e == edges[j].s)) continue;

					mobj.type = 'se-se';
					mobj.s1 = edges[i].s;
					mobj.e1 = edges[i].e;
					mobj.s2 = edges[j].s;
					mobj.e2 = edges[j].e;
					cntMergeObj++;

					//console.log('dSS - dEE d = ' + dSS);
					//console.log('i = ' + i + ' j = ' + j);
				}
				else if ((dSE < threshold)&&(dES < threshold)) {

					if ((edges[i].s == edges[j].s)||(edges[i].e == edges[j].e)
						||(edges[i].s == edges[j].e)||(edges[i].e == edges[j].s)) continue;

					mobj.type = 'se-es';
					mobj.s1 = edges[i].s;
					mobj.e1 = edges[i].e;
					mobj.s2 = edges[j].s;
					mobj.e2 = edges[j].e;
					cntMergeObj++;

					//console.log('dSE - dES d = ' + dSE);
					//console.log('i = ' + i + ' j = ' + j);
				}

				//console.log(dSS);

				//if (dSS < minSS) minSS = dSS;
				//if (dSE < minSE) minSE = dSE;
				//if (dES < minES) minES = dES;
				//if (dEE < minEE) minEE = dEE;
			}

			if (cntMergeObj == 1) {
				mergeObjs.push(mobj);
			}
			else {
				console.log('len > 1');
			}
		}

		for(var m = 0; m < mergeObjs.length; m++) {
			//nodes[mergeObjs[m].s1].special = true;
			//nodes[mergeObjs[m].s2].special = true;
			//nodes[mergeObjs[m].e1].special = true;
			//nodes[mergeObjs[m].e2].special = true;

			console.log('# m = ' + m);

			for(var i = 0; i < lenRoads; i++) {
				var lenNodes = roads[i].nodes.length;
				var found = false;
				var found1 = false;
				var found2 = false;

				for(var j = 0; j < lenNodes - 1; j++) {
					if ((roads[i].nodes[j] == mergeObjs[m].s1)
						&&(roads[i].nodes[j + 1] == mergeObjs[m].e1)) {
						console.log('s1-e1, i = ' + i);
						mergeObjs[m].ij1 = {i:i, j:j};
						found1 = true;	
					}	
					else if ((roads[i].nodes[j] == mergeObjs[m].s2)
						&&(roads[i].nodes[j + 1] == mergeObjs[m].e2)) {
						console.log('s2-e2, i = ' + i);
						mergeObjs[m].ij2 = {i:i, j:j};
						found2 = true;
					}	

					if (found1 && found2) {
						break;
						found = true;
					}
				}

				if (found) break;
			}
		}

		for(var m = 0; m < mergeObjs.length; m++) {
			if (mergeObjs[m].ij1.i == mergeObjs[m].ij2.i) continue;

			
			if (mergeObjs[m].type == 'se-se') {
				var sn = {};
				sn.lat = (nodes[mergeObjs[m].s1].lat + nodes[mergeObjs[m].s2].lat)/2;
				sn.lng = (nodes[mergeObjs[m].s1].lng + nodes[mergeObjs[m].s2].lng)/2;
				sn.special = true;
				nodes.push(sn);
				roads[mergeObjs[m].ij1.i].nodes[mergeObjs[m].ij1.j] = nodes.length - 1;
				roads[mergeObjs[m].ij2.i].nodes[mergeObjs[m].ij2.j] = nodes.length - 1;

				var en = {};
				en.lat = (nodes[mergeObjs[m].e1].lat + nodes[mergeObjs[m].e2].lat)/2;
				en.lng = (nodes[mergeObjs[m].e1].lng + nodes[mergeObjs[m].e2].lng)/2;
				en.special = true;
				nodes.push(en);
				roads[mergeObjs[m].ij1.i].nodes[mergeObjs[m].ij1.j + 1] = nodes.length - 1;
				roads[mergeObjs[m].ij2.i].nodes[mergeObjs[m].ij2.j + 1] = nodes.length - 1;

			} 
			else if (mergeObjs[m].type == 'se-es'){
				var sn = {};
				sn.lat = (nodes[mergeObjs[m].s1].lat + nodes[mergeObjs[m].e2].lat)/2;
				sn.lng = (nodes[mergeObjs[m].s1].lng + nodes[mergeObjs[m].e2].lng)/2;
				sn.special = true;
				nodes.push(sn);
				roads[mergeObjs[m].ij1.i].nodes[mergeObjs[m].ij1.j] = nodes.length - 1;
				roads[mergeObjs[m].ij2.i].nodes[mergeObjs[m].ij2.j + 1] = nodes.length - 1;

				var en = {};
				en.lat = (nodes[mergeObjs[m].e1].lat + nodes[mergeObjs[m].s2].lat)/2;
				en.lng = (nodes[mergeObjs[m].e1].lng + nodes[mergeObjs[m].s2].lng)/2;
				en.special = true;
				nodes.push(en);
				roads[mergeObjs[m].ij1.i].nodes[mergeObjs[m].ij1.j + 1] = nodes.length - 1;
				roads[mergeObjs[m].ij2.i].nodes[mergeObjs[m].ij2.j] = nodes.length - 1;
			}
			

		}


		console.log(mergeObjs);

		//console.log('minSS = ' + minSS);
		//console.log('minSE = ' + minSE);
		//console.log('minES = ' + minES);
		//console.log('minEE = ' + minEE);
	}


}


