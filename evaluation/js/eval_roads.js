//const TgUtil = require('../tg_util');
//const TgNode = require('../node/tg_node');

class EvalRoads {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = true;
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
	}

	calDispRoads() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;

	  this.dispRoads = {};

	  let edges;

	  switch(this.dispLevel) {
	  	case 'auto':
	  		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) edges = edges_lv0;
			  if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) edges = edges_lv1;
			  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) edges = edges_lv2;
				break;
			case 'fine':
				edges = edges_lv0;
				break;
			case 'medium':
				edges = edges_lv1;
				break;
			case 'coarse':
				edges = edges_lv2;
				break;
	  }

	  //console.log(edges);

	  for(let road of edges) {
	  	if (!this.dispRoads[road.type]) {
				this.dispRoads[road.type] = [];
			}
			//if (road.time !== 0) delete road.time;
		}

		for(let road of edges) {
			let lat = road.startNode.lat;
			let lng = road.startNode.lng;
			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispRoads[road.type].push(road);
				//road.time = 0;
				continue;
			}

			lat = road.endNode.lat;
			lng = road.endNode.lng;
			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispRoads[road.type].push(road);
				//road.time = 0;
			}
		}

		//console.log(this.dispRoads);

		let len = 0;
		for(let type in this.dispRoads) {
			len += this.dispRoads[type].length;
		}

		//console.log('# roads: ' + len);

		len = 0;
		for(let road of edges) {
			if (road.time === 0) len++;
		}
		//console.log('# checked roads:' + len);

		switch(this.dispLevel) {
	  	case 'auto':
	  		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) edges_lv0 = edges;
			  if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) edges_lv1 = edges;
			  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) edges_lv2 = edges;
				break;
			case 'fine':
				edges_lv0 = edges;
				break;
			case 'medium':
				edges_lv1 = edges;
				break;
			case 'coarse':
				edges_lv2 = edges;
				break;
	  }
	}

	updateLayer() {
		const viz = this.data.viz;

		this.clearLayers();
		this.calDispRoads();
		this.analysisDispRoads();
		this.assignTimes();

		//console.log(this.dispRoads);

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

	assignTimes() {
		const currentZoom = this.data.zoom.current;
		let nodes;
		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) nodes = nodes_lv0_cost;
		if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) nodes = nodes_lv1_cost;
	  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) nodes = nodes_lv2_cost;

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

	clearLayers() {
		for(let layer of this.dispLayers) {
			this.mapUtil.removeLayer(layer);
		}
	}

	calNumberOfNode() {
		let count = 0;

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {
				if (road[0].node) { // LineString
					count += road.length;
				}
				else if (road[0][0].node) { // MultiLineString
					for(let road2 of road) {
						count += road2.length;
					}
				}
			}
		}
		return count;
	}

	addNodeLayer() {
		const currentZoom = this.data.zoom.current;
		const viz = this.data.viz;
		this.mapUtil.removeLayer(this.nodeLayer);

		// nodes 

		let nodes;
	  switch(this.dispLevel) {
	  	case 'auto':
	  		if (this.data.zoom.level[0].indexOf(currentZoom) >= 0) nodes = nodes_lv0;
			  if (this.data.zoom.level[1].indexOf(currentZoom) >= 0) nodes = nodes_lv1;
			  if (this.data.zoom.level[2].indexOf(currentZoom) >= 0) nodes = nodes_lv2;
				break;
			case 'fine':
				nodes = nodes_lv0;
				break;
			case 'medium':
				nodes = nodes_lv1;
				break;
			case 'coarse':
				nodes = nodes_lv2;
				break;
	  }

		let arr = [];
		const nodeStyleFunc = 
				this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

		for(let index in this.nodes) {
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point([nodes[index].lng, nodes[index].lat]), nodeStyleFunc);
		}

		// texts

		for(let type in this.dispRoads) {
			for(let road of this.dispRoads[type]) {
				const textStyleFunc = 
					this.mapUtil.textStyle({
						text: road.time + '', color: '#000', font: viz.font.text, 
					});
				const lng = (road.startNode.lng + road.endNode.lng) / 2;
				const lat = (road.startNode.lat + road.endNode.lat) / 2;
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Point([lng, lat]), textStyleFunc);
			}
		}

		this.nodeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.nodeLayer.setZIndex(viz.z.roadNode);
		this.mapUtil.addLayer(this.nodeLayer);
		this.dispLayers.push(this.nodeLayer);
	}

	removeNodeLayer() {
		this.mapUtil.removeLayer(this.nodeLayer);
	}
}