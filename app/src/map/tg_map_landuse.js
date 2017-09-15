//const TgUtil = require('../tg_util');
//const TgNode = require('../node/tg_node');

class TgMapLanduse {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.simplify = this.data.elements.landuse.simplify;
  	this.dispNodeLayer = false;
		this.nodeLayer = null;

		this.landuseObjects = this.initLanduseArray(); 
		this.newLanduseObjects = this.initLanduseArray(); 
		this.dispLanduseObjects = this.initLanduseArray(); 
  	this.timerGetLanduseData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.data.var.rdpThreshold.landuse;
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

	initLanduseArray() {
		// 6 classes of landuse
		const numClass = this.data.var.numLanduseClasses;
		let outArray = new Array(6);
		for(let index = 0; index < outArray.length; index++) {
			outArray[index] = [];
		}
		return outArray;
	}

	init() {
		const source = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.topojson?' 
	    	+ 'api_key=' + this.data.var.apiKeyVectorTile
		  //url: 'https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.topojson?' 
	    //	+ 'api_key=vector-tiles-c1X4vZE'
	    //url: 'https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.topojson?' 
	    //	+ 'api_key=mapzen-dKpzpj5'
		});

		this.mapUtil.addLayer(new ol.layer.VectorTile({
		  source: source,
		  style: this.addToLanduseObject.bind(this),
		}));
	}

	addToLanduseObject(feature, resolution) {
		if (this.timerGetLanduseData) clearTimeout(this.timerGetLanduseData);
		this.timerGetLanduseData = 
				setTimeout(
						this.processNewLanduseObjects.bind(this), 
						this.data.time.waitForGettingData);

		const kind = feature.get('kind');
		let landuseClass = -1;

		switch(kind) {
			case 'recreation_ground':
			case 'park':
			case 'garden':
				landuseClass = 0;
				break;
			case 'cemetery':
			case 'golf_course':
			case 'zoo':
				landuseClass = 1;
				break;	
			case 'university':
			case 'college':
			case 'school':
				landuseClass = 2;
				break;	
			case 'stadium':
				landuseClass = 3;
				break;
			case 'hospital':
				landuseClass = 4;
				break;
			case 'retail':
				landuseClass = 5;
				break;
			default:
				return null;
		}

		const geoType = feature.getGeometry().getType();
		const name = feature.get('name');
		// console.log('kind: ' + kind + ' type: ' + geoType + ' name: ' + name);
		// console.log('kind: ' + kind + ' minZoom: ' + minZoom);

		// class 0: recreation_ground, park, garden
		// class 1: cemetery, golf_course, zoo
		// class 2: university, college, school
		// class 3: stadium
		// class 4: hospital
		// class 5: retail
		// ignore: library, fuel, theatre, residential, recreation_track, footway, 
		//   commercial, industrial, railway, enclosure, military, hedge, pier
	  //   caravan_site, picnic_site, dog_park, bridge, wetland, scrub, grass
		//   natural_wood, nature_reserve, meadow, forest, sports_centre, attraction
		//	 water_park, city_wall, prison, apron, grave_yard


		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		
		let coords = feature.getGeometry().getCoordinates();
		coords.minZoom = feature.get('min_zoom');
		if (name) coords.name = name;

		//const lenCoords = coords.length;

		if (geoType === 'Polygon') {

			if (this.simplify) {
				coords = TgUtil.RDPSimp2DLoop(coords, this.rdpThreshold);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}
			
			this.landuseObjects[landuseClass].push(coords);
			this.newLanduseObjects[landuseClass].push(coords);
			this.dispLanduseObjects[landuseClass].push(coords);
		}
		return null;
	}

	processNewLanduseObjects() {
		if (this.map.currentMode === 'EM') {
			this.addNewLayer();
		}
		this.newLanduseObjects = this.initLanduseArray();
	}

	calDispLanduse() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;
		const numClass = this.data.var.numLanduseClasses;

		this.dispLanduseObjects = this.initLanduseArray();

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.landuseObjects[cl]) {
				if (currentZoom < landuse.minZoom) {
					continue;
				}
				
				let isIn = false;
				if (landuse[0][0].node) { // Polygon
					for(let i = 0; i < landuse.length; i++) {
						for(let j = 0; j < landuse[i].length; j++) {
							const lat = landuse[i][j].node.original.lat;
							const lng = landuse[i][j].node.original.lng;

							if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
								this.dispLanduseObjects[cl].push(landuse);
								isIn = true;
								break;
							}
						}
						if (isIn) break;
					}
				}
			}
		}

		//console.log('/# of landuse : ' + this.landuseObjects.length);
		//console.log('/# of disp landuse: ' + this.dispLanduseObjects.length);
	}

	updateDispLanduse() {
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.dispLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					for(let i = 0; i < landuse.length; i++) {
						for(let j = 0; j < landuse[i].length; j++) {
							landuse[i][j][0] = landuse[i][j].node.disp.lng; 
							landuse[i][j][1] = landuse[i][j].node.disp.lat; 
						}
					}
				} 
			}
		}
	}

	addNewLayer() {
		const viz = this.data.viz;
		let arr = [];
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			const styleFunc = this.mapUtil.polygonStyleFunc(viz.color.landuse[cl]);

			for(let landuse of this.newLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Polygon(landuse), styleFunc, 'l');
				}
			}
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(viz.z.landuse);
		this.mapUtil.addLayer(layer);
		this.dispLayers.push(layer);
		
		//console.log('+ new landuse layer: ' + arr.length);
		if (this.dispNodeLayer) this.addNewNodeLayer();
	}

	updateLayer() {
		this.clearLayers();
		this.updateDispLanduse();

		const viz = this.data.viz;
		let arr = [];
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			const styleFunc = this.mapUtil.polygonStyleFunc(viz.color.landuse[cl]);

			for(let landuse of this.dispLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Polygon(landuse), styleFunc, 'l');
				}
			}
		}

		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(viz.z.landuse);
		this.mapUtil.addLayer(this.layer);
		this.dispLayers.push(this.layer);

		if (this.dispNodeLayer) this.addNodeLayer();
	}

	clearLayers() {
		for(let layer of this.dispLayers) {
			this.mapUtil.removeLayer(layer);
		}
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
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
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.dispLanduseObjects[cl]) {
				let modified;

				if (landuse[0][0].node) { // Polygon
					for(let i = 0; i < landuse.length; i++) {
						for(let j = 0; j < landuse[i].length; j++) {
							modified = 
								transform(landuse[i][j].node.original.lat, landuse[i][j].node.original.lng);
							landuse[i][j].node[kind].lat = modified.lat;
							landuse[i][j].node[kind].lng = modified.lng;
						}
					}
				}
			}
		}
	}

	calDispNodes(kind, value) {
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.dispLanduseObjects[cl]) {

				if (landuse[0][0].node) { // Polygon
					if (kind === 'intermediateReal') {
						for(let i = 0; i < landuse.length; i++) {
							for(let j = 0; j < landuse[i].length; j++) {
								landuse[i][j].node.disp.lat = 
									(1 - value) * landuse[i][j].node.original.lat +
									value * landuse[i][j].node.real.lat;
								landuse[i][j].node.disp.lng = 
									(1 - value) * landuse[i][j].node.original.lng +
									value * landuse[i][j].node.real.lng;
							}
						}
					}
					else if (kind === 'intermediateTarget') {
						for(let i = 0; i < landuse.length; i++) {
							for(let j = 0; j < landuse[i].length; j++) {
								landuse[i][j].node.disp.lat = 
									(1 - value) * landuse[i][j].node.original.lat +
									value * landuse[i][j].node.target.lat;
								landuse[i][j].node.disp.lng = 
									(1 - value) * landuse[i][j].node.original.lng +
									value * landuse[i][j].node.target.lng;
							}
						}
					}
					else {
						for(let i = 0; i < landuse.length; i++) {
							for(let j = 0; j < landuse[i].length; j++) {
								landuse[i][j].node.disp.lat = landuse[i][j].node[kind].lat;
								landuse[i][j].node.disp.lng = landuse[i][j].node[kind].lng;
							}
						}
					}
				}
			}
		}
	}


	calNumberOfNode() {
		let count = 0;
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.dispLanduseObjects[cl]) {
				if ((landuse[0].length === 0)||(landuse[0][0].length === 0)) continue;

				if (landuse[0][0].node) {
					for(let nodes of landuse) {
						count += nodes.length;
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
			this.mapUtil.nodeStyleFunc(viz.color.landuseNode, viz.radius.node);
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.newLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					for(let nodes of landuse) {
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
			this.mapUtil.nodeStyleFunc(viz.color.landuseNode, viz.radius.node);
		const numClass = this.data.var.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.dispLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					for(let nodes of landuse) {
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

	calSP() {
		const numClass = this.data.var.numLanduseClasses;
		let difEs = [], difAs = [];
		let difE = 0, difA = 0;

		for(let cl = 0; cl < numClass; cl++) {
			//console.log(cl);
			for(let landuse of this.dispLanduseObjects[cl]) {
				//console.log('for');
				if (landuse[0][0].node) { // Polygon
					//console.log('here?');
					for(let nodes of landuse) {
						//console.log(difE);
						difE = this.calDifE(nodes);
						if (difE) difEs.push(difE);

						difA = this.calDifA(nodes);
						//console.log(difA);

						if (difA) difAs.push(difA);
					}
				}
			}
		}
		return {difEs: TgUtil.avg(difEs), difAs: TgUtil.avg(difAs)};
	}

	calDifE(ns) {
		if (ns.length < 3) {
			return 0;
		}
		else {
			// [e0, e1, e2] [q0, q1, q2]
			let difOrgArr = [];
			let difRealArr = [];
			for(let i = 0; i < ns.length - 1; i++) {
				difOrgArr.push(TgUtil.distance(ns[i].node.original.lat, ns[i].node.original.lng,
					ns[i + 1].node.original.lat, ns[i + 1].node.original.lng));
				difRealArr.push(TgUtil.distance(ns[i].node.real.lat, ns[i].node.real.lng,
					ns[i + 1].node.real.lat, ns[i + 1].node.real.lng));
			}
			const c = TgUtil.sum(difOrgArr) / TgUtil.sum(difRealArr);

			let sum = 0;
			for(let i = 0; i < difOrgArr.length; i++ ) {
				sum += Math.abs(difOrgArr[i] - c * difRealArr[i]);
			}
			return sum / difOrgArr.length;
		}
	}

	calDifA(ns) {
		if (ns.length < 3) {
			return 0;
		}
		else {
			let difOrgArr = [];
			let difRealArr = [];
			for(let i = 0; i < ns.length - 2; i++) {
				difOrgArr.push(TgUtil.angle(ns[i].node.original, ns[i + 1].node.original,
					ns[i + 2].node.original));
				difRealArr.push(TgUtil.angle(ns[i].node.real, ns[i + 1].node.real,
					ns[i + 2].node.real));
			}
			let sum = 0;
			for(let i = 0; i < difOrgArr.length; i++ ) {
				sum += Math.abs(difOrgArr[i] - difRealArr[i]);
			}
			return sum / difOrgArr.length;
		}
	}
}

//module.exports = TgMapLanduse;