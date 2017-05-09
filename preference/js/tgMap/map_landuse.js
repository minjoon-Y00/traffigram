class TGMapLanduse {
	constructor(tg, mapUtil) {
		this.tg = tg;
		this.mapUtil = mapUtil;
		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.simplify = false;
  	this.dispNodeLayer = false;
		this.nodeLayer = null;

		this.landuseObjects = this.initLanduseArray(); 
		this.newLanduseObjects = this.initLanduseArray(); 
		this.dispLanduseObjects = this.initLanduseArray(); 
  	this.timerGetLanduseData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.tg.opt.constant.rdpThreshold.landuse;
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
		const numClass = this.tg.opt.constant.numLanduseClasses;
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
		    + 'api_key=vector-tiles-c1X4vZE',
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
						this.tg.opt.constant.timeToWaitForGettingData);

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

			if ((this.simplify)&&(this.tg.map.simplify)) {
				coords = this.tg.util.RDPSimp2DLoop(coords, this.rdpThreshold);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
				}
			}
			
			this.landuseObjects[landuseClass].push(coords);
			this.newLanduseObjects[landuseClass].push(coords);
			this.dispLanduseObjects[landuseClass].push(coords);
		}
		return null;
	}

	processNewLanduseObjects() {
		this.tg.map.setDataInfo('numLanduseLoading', 'increase');
		this.tg.map.setTime('landuseLoading', 'end', (new Date()).getTime());

		if (tg.map.currentMode === 'EM') {
			this.addNewLayer();
		}
		this.newLanduseObjects = this.initLanduseArray();
	}

	calDispLanduse() {
		const currentZoom = this.tg.map.currentZoom;
		const opt = this.tg.opt;
		const top = opt.box.top;
		const bottom = opt.box.bottom;
		const right = opt.box.right;
		const left = opt.box.left;
		const numClass = this.tg.opt.constant.numLanduseClasses;

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
		const numClass = this.tg.opt.constant.numLanduseClasses;

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
		let arr = [];
		const numClass = this.tg.opt.constant.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.landuse[cl]);

			for(let landuse of this.newLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Polygon(landuse), styleFunc);
				}
			}
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(this.tg.opt.z.landuse);
		this.mapUtil.addLayer(layer);
		this.dispLayers.push(layer);
		
		//console.log('+ new landuse layer: ' + arr.length);
		if (this.dispNodeLayer) this.addNewNodeLayer();
	}

	updateLayer() {
		this.clearLayers();
		this.updateDispLanduse();

		let arr = [];
		const numClass = this.tg.opt.constant.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.landuse[cl]);

			for(let landuse of this.dispLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Polygon(landuse), styleFunc);
				}
			}
		}

		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(this.tg.opt.z.landuse);
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

	// TODO: setVisibleByCurrentZoom

	calTargetNodes() {
		this.calModifiedNodes('target');
	}

	calModifiedNodes(kind) {
		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.tg.graph[transformFuncName].bind(this.tg.graph);
		const numClass = this.tg.opt.constant.numLanduseClasses;

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
		const numClass = this.tg.opt.constant.numLanduseClasses;

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
		const numClass = this.tg.opt.constant.numLanduseClasses;

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
		let arr = [];
		const edgeStyleFunc = 
			this.mapUtil.lineStyleFunc(this.tg.opt.color.edge, this.tg.opt.width.edge);
		const nodeStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.landuseNode, this.tg.opt.radius.node);
		const numClass = this.tg.opt.constant.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.newLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					for(let nodes of landuse) {
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
		layer.setZIndex(this.tg.opt.z.roadNode);
		this.mapUtil.addLayer(layer);
		this.dispLayers.push(layer);
	}

	addNodeLayer() {
		this.mapUtil.removeLayer(this.nodeLayer);

		let arr = [];
		const edgeStyleFunc = 
			this.mapUtil.lineStyleFunc(this.tg.opt.color.edge, this.tg.opt.width.edge);
		const nodeStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.landuseNode, this.tg.opt.radius.node);
		const numClass = this.tg.opt.constant.numLanduseClasses;

		for(let cl = 0; cl < numClass; cl++) {
			for(let landuse of this.dispLanduseObjects[cl]) {
				if (landuse[0][0].node) { // Polygon
					for(let nodes of landuse) {
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
		this.nodeLayer.setZIndex(this.tg.opt.z.roadNode);
		this.mapUtil.addLayer(this.nodeLayer);
		this.dispLayers.push(this.nodeLayer);
	}

	removeNodeLayer() {
		this.mapUtil.removeLayer(this.nodeLayer);
	}

}