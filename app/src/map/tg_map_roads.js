//const TgUtil = require('../tg_util');
//const TgNode = require('../node/tg_node');

class TgMapRoads {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = {};

		this.simplify = true;
  	this.dispNodeLayer = false;
		this.nodeLayer = null;

	  this.roadTypes = 
	  		['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential'];
	  this.roadObjects = {};
	  this.newRoadObjects = {};
	  this.dispRoads = {};
	  this.dispRoadTypes = [];
  	this.timerGetRoadData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.data.var.rdpThreshold.road;

  	for(let zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
  		this.roadObjects[zoom] = {};
	  	for(let type of this.roadTypes) this.roadObjects[zoom][type] = [];
  	}

	  for(let type of this.roadTypes) {
	  	this.layer[type] = null;
	  	this.newRoadObjects[type] = [];
		}
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

	init() {
		const roadSource = new ol.source.VectorTile({
	    format: new ol.format.TopoJSON(),
	    projection: 'EPSG:3857',
	    tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
	    url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?' 
	    	+ 'api_key=' + this.data.var.apiKeyVectorTile
	    //url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?' 
	    // 	+ 'api_key=vector-tiles-c1X4vZE'
	    //url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?' 
	    //	+ 'api_key=mapzen-dKpzpj5'
	  })

		this.mapUtil.addLayer(new ol.layer.VectorTile({
		  source: roadSource,
		  style: this.addToRoadObject.bind(this)
		}))
	}

	addToRoadObject(feature) {
		if (this.timerGetRoadData) clearTimeout(this.timerGetRoadData);
		this.timerGetRoadData = 
				setTimeout(
						this.processNewRoadObjects.bind(this), 
						this.data.time.waitForGettingRoadData);

		// only types we want to consider are passed.
		const kind_detail = feature.get('kind_detail');
		if (this.roadTypes.indexOf(kind_detail) < 0) return null;

		const geoType = feature.getGeometry().getType();
		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

		let coords = feature.getGeometry().getCoordinates();
		//const minZoom = feature.get('min_zoom');
		//coords.minZoom = feature.get('min_zoom');

		const minZoom = feature.get('min_zoom');
		//console.log(minZoom);
		//const id = feature.get('id');
		//console.log(id);
		//if (!id) return null;

		// TODO: test lenCoords vs coords.length

		const zoom = this.data.zoom.current;



		if (geoType === 'LineString') {

			if ((this.simplify)&&(this.map.simplify)) {
				coords = TgUtil.RDPSimp1D(coords, this.rdpThreshold);
				//console.log('simple.');
			}
			coords.minZoom = feature.get('min_zoom');
			//coords.minZoom = minZoom;


			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new TgNode(coords[i][1], coords[i][0]);
			}
			this.roadObjects[zoom][kind_detail].push(coords);
			this.newRoadObjects[kind_detail].push(coords);

			if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
				this.dispRoads[kind_detail].push(coords);
			}
		}
		else if (geoType === 'MultiLineString') {

			if ((this.simplify)&&(this.map.simplify)) {
				coords = TgUtil.RDPSimp2D(coords, this.rdpThreshold);
			}
			coords.minZoom = feature.get('min_zoom');
			//coords.minZoom = minZoom;


			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}
			this.roadObjects[zoom][kind_detail].push(coords);
			this.newRoadObjects[kind_detail].push(coords);

			if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
				this.dispRoads[kind_detail].push(coords);
			}
		}

		return null;
	}

	processNewRoadObjects() {
		/*
		this.map.setDataInfo(
			'numHighwayLoading', 'set', 
			this.roadObjects.motorway.length + this.roadObjects.trunk.length);
		this.map.setDataInfo(
			'numPrimaryLoading', 'set', this.roadObjects.primary.length);
		this.map.setDataInfo(
			'numSecondaryLoading', 'set', this.roadObjects.secondary.length);
		this.map.setDataInfo(
			'numTertiaryLoading', 'set', this.roadObjects.tertiary.length);
		this.map.setDataInfo(
			'numResidentialLoading', 'set', this.roadObjects.residential.length);
		this.map.setDataInfo('numRoadLoading', 'increase');
		this.map.setTime('roadLoading', 'end', (new Date()).getTime());
		*/

		if (this.map.currentMode === 'EM') {
	  	this.addNewLayer();
		}

	  for(let type of this.roadTypes) {
	  	this.newRoadObjects[type] = [];
		}
	}

	updateDisplayedRoadType(currentZoom) {
		this.dispRoadTypes = [];
		for(let type in this.data.zoom.disp) {
			if (currentZoom >= this.data.zoom.disp[type].min) {
				this.dispRoadTypes.push(type);
			}
		}
	}

	calDispRoads() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top + this.data.var.latMargin;
		const bottom = this.data.box.bottom - this.data.var.latMargin;
		const right = this.data.box.right + this.data.var.lngMargin;
		const left = this.data.box.left - this.data.var.lngMargin;

		for(let type of this.roadTypes) {
	  	this.dispRoads[type] = [];
		}

		for(let type of this.dispRoadTypes) {
			for(let road of this.roadObjects[currentZoom][type]) {
				if (currentZoom < road.minZoom) {
					continue;
				}
				
				if (road[0].node) { // LineString
					for(let i = 0; i < road.length; i++) {
						const lat = road[i].node.original.lat;
						const lng = road[i].node.original.lng;
						if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
							this.dispRoads[type].push(road);
							break;
						}
					}
				}
				else if (road[0][0].node) { // MultiLineString
					let isIn = false;
					for(let i = 0; i < road.length; i++) {
						for(let j = 0; j < road[i].length; j++) {
							const lat = road[i][j].node.original.lat;
							const lng = road[i][j].node.original.lng;
							if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
								this.dispRoads[type].push(road);
								isIn = true;
								break;
							}
						}
						if (isIn) break;
					}
				}
			}
		}
	}

	updateDispRoads() {
		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {
				if (road[0].node) { // LineString
					for(let i = 0; i < road.length; i++) {
						road[i][0] = road[i].node.disp.lng;
						road[i][1] = road[i].node.disp.lat;
					}
				}
				else if (road[0][0].node) { // MultiLineString
					for(let i = 0; i < road.length; i++) {
						for(let j = 0; j < road[i].length; j++) {
							road[i][j][0] = road[i][j].node.disp.lng;
							road[i][j][1]	= road[i][j].node.disp.lat;
						}
					}
				}
				else {
					console.log('not known geotype in createDispRoas()');
				}
			}
		}
	}

	addNewLayer() {
		const viz = this.data.viz;

		for(let type of this.dispRoadTypes) {
			let arr = [];
			const styleFunc = this.mapUtil.lineStyleFunc(
					viz.color.road[type], viz.width.road[type]);

			for(let road of this.newRoadObjects[type]) {
				if (road[0].node) { // LineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(road), styleFunc);
				}
				else if (road[0][0].node) { // MultiLineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.MultiLineString(road), styleFunc);
				}
				else {
					console.log('not known geotype in createDispRoas()');
				}
			}
			const layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z[type]);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);
			console.log('~~new roads: ' + arr.length);
		}

		if (this.dispNodeLayer) this.addNewNodeLayer();
	}

	//
	updateLayer() {
		const viz = this.data.viz;
		//this.removeLayer();
		this.clearLayers();
		this.updateDispRoads();

		for(let type of this.dispRoadTypes) {
			let arr = [];
			const styleFunc = this.mapUtil.lineStyleFunc(
				viz.color.road[type], viz.width.road[type]);

			for(let road of this.dispRoads[type]) {
				if (road[0].node) { // LineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(road), styleFunc);
				}
				else if (road[0][0].node) { // MultiLineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.MultiLineString(road), styleFunc);
				}
				else {
					console.log('not known geotype in createDispRoas()');
				}
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

		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.graph[transformFuncName].bind(this.graph);

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {
				let modified;

				if (road[0].node) { // LineString {
					for(let i = 0; i < road.length; i++) {
						modified = transform(road[i].node.original.lat, road[i].node.original.lng);
						road[i].node[kind].lat = modified.lat;
						road[i].node[kind].lng = modified.lng;
					}
				} 
				else if (road[0][0].node) { // MultiLineString
					for(let i = 0; i < road.length; i++) {
						for(let j = 0; j < road[i].length; j++) {
							modified = 
									transform(road[i][j].node.original.lat, road[i][j].node.original.lng);
							road[i][j].node[kind].lat = modified.lat;
							road[i][j].node[kind].lng = modified.lng;
						}
					}
				}
			}
		}
	}

	calDispNodes(kind, value) {

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {

				if (road[0].node) { // LineString {
					if (kind === 'intermediateReal') {
						for(let i = 0; i < road.length; i++) {
							road[i].node.disp.lat = 
								(1 - value) * road[i].node.original.lat + value * road[i].node.real.lat;
							road[i].node.disp.lng = 
								(1 - value) * road[i].node.original.lng + value * road[i].node.real.lng;
						}
					}
					else if (kind === 'intermediateTarget') {
						for(let i = 0; i < road.length; i++) {
							road[i].node.disp.lat = 
								(1 - value) * road[i].node.original.lat + value * road[i].node.target.lat;
							road[i].node.disp.lng = 
								(1 - value) * road[i].node.original.lng + value * road[i].node.target.lng;
						}
					}
					else {
						for(let i = 0; i < road.length; i++) {
							road[i].node.disp.lat = road[i].node[kind].lat;
							road[i].node.disp.lng = road[i].node[kind].lng;
						}
					}
				} 
				else if (road[0][0].node) { // MultiLineString
					if (kind === 'intermediateReal') {
						for(let i = 0; i < road.length; i++) {
							for(let j = 0; j < road[i].length; j++) {
								road[i][j].node.disp.lat = 
									(1 - value) * road[i][j].node.original.lat + 
									value * road[i][j].node.real.lat;
								road[i][j].node.disp.lng = 
									(1 - value) * road[i][j].node.original.lng + 
									value * road[i][j].node.real.lng;
							}
						}
					}
					else if (kind === 'intermediateTarget') {
						for(let i = 0; i < road.length; i++) {
							for(let j = 0; j < road[i].length; j++) {
								road[i][j].node.disp.lat = 
									(1 - value) * road[i][j].node.original.lat + 
									value * road[i][j].node.target.lat;
								road[i][j].node.disp.lng = 
									(1 - value) * road[i][j].node.original.lng + 
									value * road[i][j].node.target.lng;
							}
						}
					}
					else {
						for(let i = 0; i < road.length; i++) {
							for(let j = 0; j < road[i].length; j++) {
								road[i][j].node.disp.lat = road[i][j].node[kind].lat;
								road[i][j].node.disp.lng = road[i][j].node[kind].lng;
							}
						}
					}
				}
			}
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

	addNewNodeLayer() {
		const viz = this.data.viz;
		let arr = [];
		const edgeStyleFunc = 
			this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
		const nodeStyleFunc = 
			this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

		for(let type of this.dispRoadTypes) {
			for(let roads of this.newRoadObjects[type]) {

				if (roads[0].node) { // LineString
					// edge
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(roads), edgeStyleFunc);

					// node
					for(let node of roads) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(node), nodeStyleFunc);
					}
				}
				else if (roads[0][0].node) { // MultiLineString
					for(let nodes of roads) {
						// edge
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.LineString(nodes), edgeStyleFunc);

						// node
						for(let node of nodes) {
							this.mapUtil.addFeatureInFeatures(
								arr, new ol.geom.Point(node), nodeStyleFunc);
						}
					}
				}
			}
		}
		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(viz.z.roadNode);
		this.mapUtil.addLayer(layer);
		this.dispLayers.push(layer);
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
						arr, new ol.geom.LineString(roads), edgeStyleFunc);

					// node
					for(let node of roads) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(node), nodeStyleFunc);
					}
				}
				else if (roads[0][0].node) { // MultiLineString
					for(let nodes of roads) {
						// edge
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.LineString(nodes), edgeStyleFunc);

						// node
						for(let node of nodes) {
							this.mapUtil.addFeatureInFeatures(
								arr, new ol.geom.Point(node), nodeStyleFunc);
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

//module.exports = TgMapRoads;