class TGMapLanduse {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.landuseObjects = [];
		this.landuseLayer = null;
  	this.timerGetLanduseData = null;
	}

	start() {
		const source = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.topojson?' 
		    + 'api_key=vector-tiles-c1X4vZE',
		});

		this.olMap.addLayer(new ol.layer.VectorTile({
		  source: source,
		  style: this.addToLanduseObject.bind(this),
		}));
	}

	addToLanduseObject(feature, resolution) {
		if (this.timerGetLanduseData) clearTimeout(this.timerGetLanduseData);
		this.timerGetLanduseData = 
				setTimeout(
						this.createDispLanduse.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingData);

		const geoType = feature.getGeometry().getType();
		const kind = feature.get('kind');
		const name = feature.get('name');
		const minZoom = feature.get('min_zoom');

		//console.log('kind: ' + kind + ' type: ' + geoType + ' name: ' + name);

		//console.log('kind: ' + kind + ' minZoom: ' + minZoom);

		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		
		const coords = feature.getGeometry().getCoordinates();
		const lenCoords = coords.length;

		if (geoType === 'Polygon') {
			for(let i = 0; i < lenCoords; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
				}
			}
			if (name) coords.name = name;
			this.landuseObjects.push(coords);
		}
		return null;
	}

	createDispLanduse() {
		this.tg.map.setDataInfo('numLanduseLoading', 'increase');
		this.tg.map.setTime('landuseLoading', 'end', (new Date()).getTime());

		this.updateDispLanduse();
		this.addLanduseLayer();
	}

	updateDispLanduse() {
		for(let landuse of this.landuseObjects) {
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

	addLanduseLayer() {
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.landuse);

		this.mapUtil.removeLayer(this.landuseLayer);

		for(let landuse of this.landuseObjects) {
			if (landuse[0][0].node) { // Polygon
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Polygon(landuse), styleFunc);
			}
		}

		this.landuseLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.landuseLayer.setZIndex(this.tg.opt.z.landuse);
		this.olMap.addLayer(this.landuseLayer);
	}

	removeLanduseLayer() {
		this.mapUtil.removeLayer(this.landuseLayer);
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

		for(let landuse of this.landuseObjects) {
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

	calDispNodes(kind, value) {
		for(let landuse of this.landuseObjects) {

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