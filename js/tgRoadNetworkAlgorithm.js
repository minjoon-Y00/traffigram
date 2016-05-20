class TGRoadNetworkAlgorithm {

	constructor(data, options) {
		this.data = data;
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



}


