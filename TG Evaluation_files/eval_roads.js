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

  	this.dispNodeLayer = false;
		this.nodeLayer = null;

	  this.roadObjects = {};
	  this.newRoadObjects = {};
	  this.dispRoads = [];
  	this.dispLayers = [];
  	this.styleFunc = {};

	  /*for(let type of this.roadTypes) {
	  	this.layer[type] = null;
	  	this.newRoadObjects[type] = [];
	  	this.styleFunc[type] = this.mapUtil.lineStyleFunc(
				this.data.viz.color.road[type], this.data.viz.width.road[type]
			);
		}*/
	}

	calDispRoads() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;

		console.log(this.data.zoom.current);

	  this.dispRoads = [];

	  const edges = edges_lv0;

	  console.log(edges);

		for(let road of edges) {
			let lat = road.startNode.lat;
			let lng = road.startNode.lng;
			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispRoads.push(road);
				break;
			}

			lat = road.endNode.lat;
			lng = road.endNode.lng;
			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispRoads.push(road);
				break;
			}

			console.log(lat + ' ' + lng);
			console.log(top + ' ' + bottom);
			console.log(left + ' ' + right);
			console.log('-----');
		}
	}

	//
	updateLayer() {
		const viz = this.data.viz;
		let arr = [];

		this.clearLayers();

		this.calDispRoads();


		console.log(this.dispRoads);

		for(road of this.dispRoads) {
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
				[[road.startNode.lng, road.startNode.lat], 
				[road.endNode.lng, road.endNode.lat]]), 
				this.mapUtil.lineStyle(viz.color.road.primary, viz.width.road.primary));

			console.log(road.type);
		}

		//this.layer[type] = this.mapUtil.olVectorFromFeatures(arr);
		//this.layer[type].setZIndex(viz.z[type]);
		//this.mapUtil.addLayer(this.layer[type]);
		//this.dispLayers.push(this.layer[type]);

		

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
		const viz = this.data.viz;
		this.mapUtil.removeLayer(this.nodeLayer);

		let arr = [];
		const edgeStyleFunc = 
				this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
		const nodeStyleFunc = 
				this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

		for(let type of this.dispRoadTypes) {
			for(let roads of this.dispRoads[type]) {
				if (roads[0].node) { // LineString
					// edge
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(roads), edgeStyleFunc, 'e');

					// node
					for(let node of roads) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(node), nodeStyleFunc, 'n');
					}
				}
				else if (roads[0][0].node) { // MultiLineString
					for(let nodes of roads) {
						// edge
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.LineString(nodes), edgeStyleFunc, 'e');

						// node
						for(let node of nodes) {
							this.mapUtil.addFeatureInFeatures(
								arr, new ol.geom.Point(node), nodeStyleFunc, 'n');
						}
					}
				}
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