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

	separateRoads() {
		var nodes = this.data.original.nodes;
		//var roads = this.data.original.roads;
		var roads = this.data.dispRoads;
		var outRoads = [];
		var lenNodes = nodes.length;
		var lenRoads = roads.length;

		for(var i = 0; i < lenRoads; i++) {
			var cutIdx = [0];
			for(var j = 1; j < roads[i].nodes.length - 1; j++) {
				if (nodes[roads[i].nodes[j]].order > 0) {
					cutIdx.push(j);
				}
			}
			cutIdx.push(roads[i].nodes.length - 1);

			if (cutIdx.length > 2) {
				for(var j = 0; j < cutIdx.length - 1; j++) {
					var road = {tag:roads[i].tag, oneway:roads[i].oneway};
					road.nodes = roads[i].nodes.slice(cutIdx[j], cutIdx[j + 1] + 1);
					outRoads.push(road);
				}
			} 
			else {
				outRoads.push(roads[i]);
			}
		}

		console.log('R(' + this.data.dispRoads.length + ') => (' + outRoads.length + ')');
		this.data.dispRoads = outRoads;
	}

	mergeRoads() {
		var nodes = this.data.original.nodes;
		var roads = this.util.clone(this.data.dispRoads);
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

	//
	//
	//
	simplifyRDP() {
		var nodes = this.data.original.nodes;
		//var roads = this.data.original.roads;
		var roads = this.data.dispRoads;
		var lenNodes = nodes.length;
		var lenRoads = roads.length;

		var eps = this.data.simpDistanceRDP * 0.0001; // 0-20 --> 0.0000-0.0020
		 //0.0005; //0.0015598972646812205;

		for(var i = 0; i < lenRoads; i++) {
			roads[i].nodes = RDPSimp(roads[i].nodes, eps);
		}

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



}


