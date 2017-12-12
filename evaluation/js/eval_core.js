class EvalCore {
	constructor(map, data) {
		this.map = map;
		this.data = data;
		this.queue = [];
		//this.apiKeyTimeMatrix = 'matrix-AGvGZKs'; // mine
		this.apiKeyTimeMatrix = 'matrix-qUpjg6W'; // Ray's
		this.timerSec = null;
		this.timeInterval = 1000 // ms
		this.travelTimeApi = new TgTravelTimeApi(this.data);


	}

	do() {
		let pts;
		let locs;
		let nodes;
		let type;

		/*pts = ctlPt_lv0;
		type = 'pt_lv0';
		this.addRequestPtCosts(pts, type);
		this.addSavePtCosts(pts, 'pts_lv0_costs');

		pts = ctlPt_lv1;
		type = 'pt_lv1';
		this.addRequestPtCosts(pts, type);
		this.addSavePtCosts(pts, 'pts_lv1_costs');

		pts = ctlPt_lv2;
		type = 'pt_lv2';
		this.addRequestPtCosts(pts, type);
		this.addSavePtCosts(pts, 'pts_lv2_costs');
		*/

		/*locs = locs_lv0;
		type = 'loc_lv0';
		this.addRequestLocCosts(locs, type);
		this.addSaveLocCosts(locs, 'locs_lv0_costs');

		locs = locs_lv1;
		type = 'loc_lv1';
		this.addRequestLocCosts(locs, type);
		this.addSaveLocCosts(locs, 'locs_lv1_costs');

		locs = locs_lv2;
		type = 'loc_lv2';
		this.addRequestLocCosts(locs, type);
		this.addSaveLocCosts(locs, 'locs_lv2_costs');*/

		/*nodes = nodes_lv0;
		type = 'node_lv0';
		this.addRequestAllEdgeCosts(nodes, type);
		this.addSaveAllEdgeCosts(nodes, 'node_lv0_costs');

		nodes = nodes_lv1;
		type = 'node_lv1';
		this.addRequestAllEdgeCosts(nodes, type);
		this.addSaveAllEdgeCosts(nodes, 'node_lv1_costs');*/

		/*nodes = nodes_lv2;
		type = 'node_lv2';
		this.addRequestAllEdgeCosts(nodes, type);
		this.addSaveAllEdgeCosts(nodes, 'node_lv2_costs');*/

		console.log('queue:');
		console.log(this.queue);

		this.timerSec = setInterval(this.processQueue.bind(this), this.timeInterval);
	}

	addRequestPtCosts(pts10, type) {

		//console.log('pts', pts10);

		for(let orgIdx = 0; orgIdx < pts10.length; orgIdx++) {
			let validPts = [];
			let validIndexes = [];
			let idx = 0;
			for(let pt of pts10[orgIdx].ctlPt) {
				if (!pt.inWater) {
					validPts.push(pt);
					validIndexes.push(idx);
				}
				idx++;
			}

			//console.log('cnt: ' + validPts.length);

			const numSegments = Math.ceil(validPts.length / 45);
			//console.log('numSegments: ' + numSegments);
			//console.log('---');

			for(let segIdx = 0; segIdx < numSegments; segIdx++) {
				let q = {
					type: type,
					origin: pts10[orgIdx].origin,
					pts: validPts.slice(segIdx * 45, (segIdx + 1) * 45),
					indexes: validIndexes.slice(segIdx * 45, (segIdx + 1) * 45),
					orgIdx: orgIdx,
					segIdx: segIdx,
					pts10: pts10,
				};	
				this.queue.push(q);
			}
		}
		console.log('- addRequestPtCosts');
	}

	addSavePtCosts(pts, filename) {
		const q = {
			type: 'savePtTimes',
			pts: pts,
			filename: filename,
		}
		this.queue.push(q);
		console.log('- addSavePtCosts');
	}

	addRequestLocCosts(locs, type) {
		for(let i = 0; i < locs.length; ++i) {
			let q = {
				type: type,
				loc: locs[i],
				index: i,
			};
			this.queue.push(q);
		}
		console.log('- addRequestLocCosts: ' + locs.length);
	}

	addSaveLocCosts(locs, filename) {
		const q = {
			type: 'saveLocTimes',
			locs: locs,
			filename: filename,
		}
		this.queue.push(q);
		console.log('- addSaveLocCosts');
	}

	addRequestAllEdgeCosts(nodes, type) {
		for(let idx = 0; idx < nodes.length; idx++) {
			if (nodes[idx].conIndexes) {
				let q = {
					type: type,
					index: idx, 
					conIndexes: nodes[idx].conIndexes,
					startLoc: {lat: nodes[idx].lat, lon: nodes[idx].lng},
					endLocs: [],
					nodes: nodes,
				};

				for(let conIdx of nodes[idx].conIndexes) {
					q.endLocs.push({lat: nodes[conIdx].lat, lon: nodes[conIdx].lng});
				}
				this.queue.push(q);
			}
		}
		console.log('- addRequestAllEdgeCosts: ' + nodes.length);
	}

	addSaveAllEdgeCosts(nodes, filename) {
		const q = {
			type: 'saveEdgeTimes',
			nodes: nodes,
			filename: filename,
		}
		this.queue.push(q);
		console.log('- addSaveAllEdgeCosts');
	}

	processQueue() {
		if (this.queue.length > 0) {
			const q = this.queue.shift();

			switch(q.type) {
				case 'node_lv0':
				case 'node_lv1':
				case 'node_lv2':
					this.requestEdgeTimes(q);
					break;
				case 'saveEdgeTimes':
					this.saveEdgeTimes(q);
					break;
				case 'loc_lv0':
				case 'loc_lv1':
				case 'loc_lv2':
					this.requestLocTimes(q);
					break;
				case 'saveLocTimes':
					this.saveLocTimes(q);
					break;
				case 'pt_lv0':
				case 'pt_lv1':
				case 'pt_lv2':
					this.requestPtTimes(q);
					break;
				case 'savePtTimes':
					this.savePtTimes(q);
					break;
			}
		}
		else {
			clearInterval(this.timerSec);
			this.map.tgRoads.assignTimes();
			this.map.tgRoads.updateLayer();
			this.map.tgRoads.addNodeLayer();
			this.map.tgLocs.assignTimes();
			this.map.tgLocs.updateLayer();
		}
	}

	getJsonStr(locations) {
		const json = {locations: locations, costing: 'auto'};
		let str = 'https://matrix.mapzen.com/one_to_many?json=';
		str += JSON.stringify(json);
		str += '&api_key=' + this.apiKeyTimeMatrix;
		return str;
	}

	requestPtTimes(q) {
		// q = {type, origin, pts, indexes, orgIdx, segIdx, pts10}
		//console.log(q);
		let locations = [];
		locations.push({lat: q.origin.lat, lon: q.origin.lng});
		for(let loc of q.pts) locations.push({lat: loc.lat, lon: loc.lng});
		//console.log(locations);

		
		$.get(this.getJsonStr(locations))
		.done((ret) => {
			for(let idx = 1; idx < ret.one_to_many[0].length; idx++) {
				q.pts10[q.orgIdx].ctlPt[q.indexes[idx - 1]].time = ret.one_to_many[0][idx].time;
			}
		})
		.fail((error) => {
			console.log(error);
  	});
 
		console.log('processed: ' + q.type + ' ' + q.orgIdx + ' ' + q.segIdx);
	}

	savePtTimes(q) {
		const name = (new Date()) + '_' + q.filename;
		TgUtil.saveTextAsFile(q.pts, name);

		console.log('q.pts: ', q.pts);
	}

	requestLocTimes(q) {
		// q = {type, loc, index}
		const locations = q.loc;

		$.get(this.getJsonStr(locations))
		.done((ret) => {
			for(let idx = 1; idx < ret.one_to_many[0].length; idx++) {
				locations[idx].time = ret.one_to_many[0][idx].time;
			}
		})
		.fail((error) => {
			console.log(error);
  	});

		//for(let loc of locations) loc.time = 1;
		console.log('processed: ' + q.type + ' ' + q.index);
	}

	saveLocTimes(q) {
		const name = (new Date()) + '_' + q.filename;
		TgUtil.saveTextAsFile(q.locs, name);

		console.log('q.locs: ', q.locs);
	}

	requestEdgeTimes(q) {
		let locations = [];
		locations.push(q.startLoc);
		for(let loc of q.endLocs) locations.push(loc);

		$.get(this.getJsonStr(locations))
		.done((ret) => {
			q.nodes[q.index].endTimes = [];

			for(let idx = 1; idx < ret.one_to_many[0].length; idx++) {
				q.nodes[q.index].endTimes.push(ret.one_to_many[0][idx].time);
			}
		})
		.fail((error) => {
			console.log(error);
  	});

		//q.nodes[q.index].endTimes = [];
		//for(let loc of q.endLocs) q.nodes[q.index].endTimes.push(1);
		
		console.log('processed: ' + q.type + ' ' + q.index);
	}

	saveEdgeTimes(q) {
		const name = (new Date()) + '_' + q.filename;
		TgUtil.saveTextAsFile(q.nodes, name);

		console.log(q.nodes);
	}


	addConIndexes() {
		const edges = edges_lv0;
		const nodes = nodes_lv0;

		let cnt = 0;

		for(let road of edges) {
	  	if (road.time === 0) {

	  		cnt++;

	  		const sIdx = road.startNode.index;
	  		const eIdx = road.endNode.index;

	  		if (!nodes[sIdx].conIndexes) nodes[sIdx].conIndexes = [];
	  		nodes[sIdx].conIndexes.push(eIdx);
			}
		}
		console.log('cnt - road: ' + cnt);


		cnt = 0;
		for(let node of nodes) {
			if (node.conIndexes) cnt++;
		}
		console.log('cnt - conindexes: ' + cnt);

		TgUtil.saveTextAsFile(nodes_lv0, 'con_nodes_lv0.js');
	}
}