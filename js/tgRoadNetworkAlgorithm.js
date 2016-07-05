class TGRoadNetworkAlgorithm {

	constructor(data, util, options) {
		this.data = data;
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

	reduceByAngle() {
		var nodes = this.data.original.nodes;
		var edges = this.data.simpEdges;
		var len = edges.length;

		/*for(var i = 0; i < len; i++) {
			var firstNode = edges[i].nodes[0];
			var endNode = edges[i].nodes[edges[i].nodes.length - 1];
			edges[i].nodes = [firstNode, endNode];
		}*/

		for(var i = 0; i < len; i++) {
			edges[i].nodes = this.reduceNodesByAngleInEdgeNodes(edges[i].nodes, nodes, this.data.simpThresholdAngle);
		}
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

}


