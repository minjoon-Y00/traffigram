//const TgUtil = require('../tg_util');
//const TgNode = require('../node/tg_node');

class TgMapSRC {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = {};

  	this.dispNodeLayer = true;
		this.nodeLayer = null;

		this.roadObjects = {};
	  this.newRoadObjects = {};
	  this.dispRoads = {};
  	this.dispLayers = [];
  	this.styleFunc = {};
  	this.nodes = {};

  	this.dispLevel = 'auto';

  	this.addTgNodes();

  	// console.log('edges:');
  	// console.log(edges_lv0);
  	// console.log(edges_lv1);
  	// console.log(edges_lv2);
	}

	addTgNodes() {
		const addTwoNodes = function(edges) {
			for(let edge of edges) {
				edge.s = new TgNode(edge.startNode.lat, edge.startNode.lng);
				edge.e = new TgNode(edge.endNode.lat, edge.endNode.lng);
			}
		}
		addTwoNodes(edges_lv0);
		addTwoNodes(edges_lv1);
		addTwoNodes(edges_lv2);
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}
	
	render() {
		if (this.isDisabled||(!this.display)) this.clearLayers();
		else this.updateLayer();
	}

	discard() {
		this.clearLayers();
	}

	calDispRoads() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;

	  this.dispRoads = {};

	  let edges;
	  if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) edges = edges_lv0;
		else if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) edges = edges_lv1;
		else if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) edges = edges_lv2;

	  for(let road of edges) {
	  	if (!this.dispRoads[road.type]) {
				this.dispRoads[road.type] = [];
			}
		}

		for(let road of edges) {
			let lat = road.startNode.lat; 
			let lng = road.startNode.lng;
			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispRoads[road.type].push(road);
				continue;
			}

			lat = road.endNode.lat;
			lng = road.endNode.lng;
			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispRoads[road.type].push(road);
			}
		}

		//if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) edges_lv0 = edges;
		//else if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) edges_lv1 = edges;
		//else if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) edges_lv2 = edges;
	}

	updateDispRoads() {
		let mode;
		if (this.map.currentMode === 'EM') mode = 'original';
		else if (this.map.currentMode === 'DC') mode = 'real';
		else mode = 'disp';

		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				road.startNode.lat = road.s[mode].lat;
				road.startNode.lng = road.s[mode].lng;
				road.endNode.lat = road.e[mode].lat;
				road.endNode.lng = road.e[mode].lng;
			}
		}
	}

	updateLayer() {
		const viz = this.data.viz;

		this.clearLayers();
		this.calDispRoads();
		this.updateDispRoads();
		this.analysisDispRoads();
		this.assignTimes();

		for(let type in this.dispRoads) {
			let arr = [];

			for(let road of this.dispRoads[type]) {
				this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[road.startNode.lng, road.startNode.lat], 
					[road.endNode.lng, road.endNode.lat]]), 
					this.mapUtil.lineStyle(viz.color.road[type], viz.width.road[type]));
			}

			this.layer[type] = this.mapUtil.olVectorFromFeatures(arr);
			this.layer[type].setZIndex(viz.z[type]);
			this.mapUtil.addLayer(this.layer[type]);
			this.dispLayers.push(this.layer[type]);
		}

		if (this.dispNodeLayer) this.addNodeLayer();
	}

	removeLayer() {
		for(let type of this.roadTypes) {
			this.mapUtil.removeLayer(this.layer[type]);
		};
	}

	clearLayers() {
		for(let layer of this.dispLayers) {
			this.mapUtil.removeLayer(layer);
		}
	}

	calRealNodes() {
		this.calModifiedNodes('real');
	}

	calTargetNodes() {
		this.calModifiedNodes('target');
	}

	calModifiedNodes(kind) {

		let transformFuncName = null;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.graph[transformFuncName].bind(this.graph);

		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {


				let modified = transform(road.s.original.lat, road.s.original.lng);
				road.s[kind].lat = modified.lat;
				road.s[kind].lng = modified.lng;

				modified = transform(road.e.original.lat, road.e.original.lng);
				road.e[kind].lat = modified.lat;
				road.e[kind].lng = modified.lng
			}
		}
	}

	calDispNodes(kind, value) {
		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {

				if (kind === 'intermediateReal') {
					road.s.disp.lat = (1 - value) * road.s.original.lat + value * road.s.real.lat;
					road.s.disp.lng = (1 - value) * road.s.original.lng + value * road.s.real.lng;
					road.e.disp.lat = (1 - value) * road.e.original.lat + value * road.e.real.lat;
					road.e.disp.lng = (1 - value) * road.e.original.lng + value * road.e.real.lng;
				}
				else if (kind === 'intermediateTarget') {
					road.s.disp.lat = (1 - value) * road.s.original.lat + value * road.s.target.lat;
					road.s.disp.lng = (1 - value) * road.s.original.lng + value * road.s.target.lng;
					road.e.disp.lat = (1 - value) * road.e.original.lat + value * road.e.target.lat;
					road.e.disp.lng = (1 - value) * road.e.original.lng + value * road.e.target.lng;
				}
				else {
					road.s.disp.lat = road.s[kind].lat;
					road.s.disp.lng = road.s[kind].lng;
					road.e.disp.lat = road.e[kind].lat;
					road.e.disp.lng = road.e[kind].lng;
				}
			}
		}
	}

	assignTimes() {
		const currentZoom = this.data.zoom.current;
		let nodes;
		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) nodes = nodes_lv0;
		if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) nodes = nodes_lv1;
	  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) nodes = nodes_lv2;

		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				const sIndex = road.startNode.index;
				const eIndex = road.endNode.index;

				let time = -1;
				for(let i = 0; i < nodes[sIndex].conIndexes.length; ++i) {

					if (!nodes[sIndex].endTimes) {
						console.log('nodes[i].endTimes is not found.');
						return;
					}

					if (nodes[sIndex].conIndexes[i] === eIndex) {
						time = nodes[sIndex].endTimes[i];
						break;
					}
				}
				if (time === -1) console.log('not found...');
				road.time = time;
			}
		}

		//console.log('-----');
		//console.log(this.dispRoads);
		//console.log(nodes_lv2);
	}

	analysisDispRoads() {

		this.nodes = {};

		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				if (!this.nodes[road.startNode.index]) this.nodes[road.startNode.index] = 0;
				else this.nodes[road.startNode.index]++;

				if (!this.nodes[road.endNode.index]) this.nodes[road.endNode.index] = 0;
				else this.nodes[road.endNode.index]++;
			}
		}
	}

	addNodeLayer() {
		const currentZoom = this.data.zoom.current;
		const viz = this.data.viz;
		this.mapUtil.removeLayer(this.nodeLayer);

		// nodes 

		// let nodes;
		// if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) nodes = nodes_lv0;
	 //  else if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) nodes = nodes_lv1;
	 //  else if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) nodes = nodes_lv2;

		// let arr = [];
		// const nodeStyleFunc = 
		// 		this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

		// for(let index in this.nodes) {
		// 	this.mapUtil.addFeatureInFeatures(
		// 		arr, new ol.geom.Point([nodes[index].lng, nodes[index].lat]), nodeStyleFunc);
		// }

		const nodeStyleFunc = 
		 		this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

		let arr = [];
		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(
					[road.startNode.lng, road.startNode.lat]), nodeStyleFunc);
				this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(
					[road.endNode.lng, road.endNode.lat]), nodeStyleFunc);
			}
		}

		// texts

		// for(let type in this.dispRoads) {
		// 	for(let road of this.dispRoads[type]) {
		// 		const textStyleFunc = 
		// 			this.mapUtil.textStyle({
		// 				text: road.time + '', color: '#000', font: viz.font.text, 
		// 			});
		// 		const lng = (road.startNode.lng + road.endNode.lng) / 2;
		// 		const lat = (road.startNode.lat + road.endNode.lat) / 2;
		// 		this.mapUtil.addFeatureInFeatures(
		// 			arr, new ol.geom.Point([lng, lat]), textStyleFunc);
		// 	}
		// }

		this.nodeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.nodeLayer.setZIndex(viz.z.roadNode);
		this.mapUtil.addLayer(this.nodeLayer);
		this.dispLayers.push(this.nodeLayer);
	}

	removeNodeLayer() {
		this.mapUtil.removeLayer(this.nodeLayer);
	}

	foundNearestNodeOfOrigin() {
		let min = 987654321;
		let minRoadIndex = -1;
		const cLat = this.map.tgOrigin.getOrigin().original.lat;
		const cLng = this.map.tgOrigin.getOrigin().original.lng;

		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				let dist = TgUtil.D2_s(cLat, cLng, road.startNode.lat, road.startNode.lng);
				if (dist < min) {
					min = dist;
					minRoadIndex = road.startNode.index;
				}
				dist = TgUtil.D2_s(cLat, cLng, road.endNode.lat, road.endNode.lng);
				if (dist < min) {
					min = dist;
					minRoadIndex = road.endNode.index;
				}
			}
		}
		return minRoadIndex;
	}

	foundNearestNodeOfLocs() {
		const locations = this.map.tgLocs.locations;

		for(let loc of locations) {
			let min = 987654321;
			let minRoadIndex = -1;

			for(let type in this.dispRoads) {
				for(let road of this.dispRoads[type]) {
					let dist = TgUtil.D2_s(loc.lng, loc.lat, road.startNode.lat, road.startNode.lng);
					if (dist < min) {
						min = dist;
						minRoadIndex = road.startNode.index;
					}
					dist = TgUtil.D2_s(loc.lng, loc.lat, road.endNode.lat, road.endNode.lng);
					if (dist < min) {
						min = dist;
						minRoadIndex = road.endNode.index;
					}
				}
			}
			loc.minRoadIndex = minRoadIndex;
		}
	}

	foundMaxIndex() {
		let maxIndex = -1;
		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				if (road.startNode.index > maxIndex) maxIndex = road.startNode.index;
				if (road.endNode.index > maxIndex) maxIndex = road.endNode.index;
			}
		}
		return maxIndex;
	}

	makeTgObj() {
		let arr = new Array(this.foundMaxIndex());

		// add original edges 
		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				const idx = road.startNode.index;
				if (!arr[idx]) arr[idx] = [];
				arr[idx].push({e: road.endNode.index, t: road.time});
			}
		}

		// make bidirectional edges
		for(let sIdx = 0; sIdx < arr.length; sIdx++) {
			if (!arr[sIdx]) continue;

			// [16] {e:17, t:100}
			for(let edge of arr[sIdx]) {
				const eIdx = edge.e;

				if (!arr[eIdx]) arr[eIdx] = [];

				// check if [17] {e:16, t:101}
				let found = false;
				for(let tempEdge of arr[eIdx]) {
					if (sIdx === tempEdge.e) {
						found = true;
						//console.log('found!');
						//console.log('sIdx: ' + sIdx);
						break;
					}
				}

				if (!found) arr[eIdx].push({e: sIdx, t: edge.t});
			}
		}

		// make mapping(m) and inverse mapping(im)
		// e.g. m[4] = 0, m[16] = 1, m[17] = 2, ...
		// e.g. im[0] = 4, im[1] = 16, 
		this.m = new Array(this.foundMaxIndex());
		this.im = [];
		for(let idx = 0, c = 0; idx < arr.length; idx++) {
			if (!arr[idx]) continue;
			this.m[idx] = c;
			this.im[c++] = idx;
		}

		// change indexes
		let newArr = [];
		for(let idx = 0; idx < arr.length; idx++) {
			if (!arr[idx]) continue;

			let newEdges = [];
			for(let edges of arr[idx]) {
				newEdges.push({e: this.m[edges.e], t: edges.t});
			}
			newArr.push(newEdges);
		}

		// make a Graph
		let tgObj = [];
		for(let node of newArr) {
			let obj = {};
			for(let edges of node) obj[edges.e] = edges.t;
			tgObj.push(obj);
		}
		this.tgObj = tgObj;
		this.dijkgraph = new Graph(tgObj);

		//console.log(arr);
		//console.log(newArr);
		//console.log(m);
		//console.log(im);
		//console.log(this.tgObj);
	}

	calcTime(start, end) {
		const tgObj = this.tgObj;
	  const nodes = this.dijkgraph.findShortestPath(start + '', end + '');
	  let t = 0;
	  let times = [];
	  let sumTime = 0;

	  if (!nodes) {
	  	//console.log('start=' + start + ' end=' + end);
	  	console.log('do not reach there...');
	  	return;
	  }

	  $.each(nodes, function(k,v) {
	    if (k < nodes.length-1) {
	    	t = tgObj[v][nodes[k + 1]];
	    	sumTime += t;
	      times.push(t);
	    }
	  });

	  //console.log('nodes', nodes);    
	  //console.log('times', times);    
	  //console.log('sumTime', sumTime);  
	  return sumTime;
	}

	calDijks() {
		let result = [];
		const locations = this.map.tgLocs.locations;

		this.makeTgObj();

		const centerRoadIndex = this.foundNearestNodeOfOrigin();
		this.foundNearestNodeOfLocs();

		for(let loc of locations) {
			//console.log('---');
			//console.log('actual time: ' + loc.time);
			//console.log('minRoadIndex ' + this.m[loc.minRoadIndex]);
			const cal = this.calcTime(this.m[centerRoadIndex], this.m[loc.minRoadIndex]);
			result.push({actual: loc.time, dijk: cal});
		}
		
		return result;
	}
}

//module.exports = TgMapRoads;