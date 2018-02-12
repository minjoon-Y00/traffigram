//const TgUtil = require('../tg_util');
//const TgNode = require('../node/tg_node');

class TgMapWater {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.waitForTps = false;

		this.simplify = this.data.elements.water.simplify;
  	this.dispNodeLayer = false;
		this.nodeLayer = null;

		this.waterObjects = {};
		this.newWaterObjects = [];
		this.dispWaterObjects = [];
  	this.timerGetWaterData = null;
  	this.timerFinishGettingWaterData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.data.var.rdpThreshold.water;
  	this.timeInterval = 0;
  	this.timeIntervalArray = [];
  	this.polyStyleFunc = this.mapUtil.polygonStyleFunc(this.data.viz.color.water);
  	this.lineStyleFunc = this.mapUtil.lineStyleFunc(this.data.viz.color.water, 1);

  	for(let zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
  		this.waterObjects[zoom] = [];
  	}

  	this.temp = false;
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

	addWaterObjects(zoom, coords) {

		if (coords.geo === 'p') {
			coords.orgFeature.setStyle(this.polyStyleFunc);
		}
		else if ((coords.geo === 'ls')||(coords.geo === 'mls')) {
			coords.orgFeature.setStyle(this.lineStyleFunc);
		}

		// TODO: needed?
		coords.type = 'w';

		this.waterObjects[zoom].push(coords);
		this.newWaterObjects.push(coords);
		this.dispWaterObjects.push(coords);
	}

	init() {
		return;

		var key = 'pk.eyJ1IjoiYmFzc3QiLCJhIjoiY2pjamY0Y2RwMnk0cDJ3dDVqNHM4aWNqcCJ9.6_wLvPhbNLT_x4npXkWO2A';

		const waterSource = new ol.source.VectorTile({
			/*attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
        '© <a href="https://www.openstreetmap.org/copyright">' +
        'OpenStreetMap contributors</a>',*/
      format: new ol.format.MVT(),
      url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
          '{z}/{x}/{y}.vector.pbf?access_token=' + key
      //url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
      //    '{z}/{x}/{y}.mvt?access_token=' + key
    });

    // "https://tile.mapzen.com/mapzen/vector/v1/all/{z}/{x}/{y}.mvt?
		/*
		const waterSource = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  //preload: 1,
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
	    tileSize: [256, 256], //[512, 512],
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/water/{z}/{x}/{y}.topojson?' 
	    	+ 'api_key=' + this.data.var.apiKeyVectorTile
		})
		*/

		this.mapUtil.addLayer(new ol.layer.VectorTile({
      //declutter: true,
		  source: waterSource,
		  style: this.addToWaterObject.bind(this)
		}));
	}

	calCoords(arr) {
		const len = arr.length / 2;
		let coords = new Array(len);
		for(let i = 0; i < len; ++i) {
			coords[i] = ol.proj.transform(
				[arr[2 * i], arr[2 * i + 1]], 'EPSG:3857', 'EPSG:4326'
			);
		}
		return coords;
	}

	calMultiCoords(feature) {
		const len = feature.g.length;
		let coords = new Array(len);
		for(let i = 0; i < len; ++i) {
			//feature.g[i] // [20, 28]
			const s = (i === 0) ? 0 : feature.g[i - 1];
			coords[i] = this.calCoords(feature.b.slice(s, feature.g[i]));
		}		
		return coords;
	}

	addToWaterObject(feature, resolution) {

    const layer = feature.get('layer');
    if ((layer !== 'water')&&(layer !== 'waterway')) return;
    //if (layer !== 'waterway') return;
    //if (layer !== 'road') return;
    //if (layer !== 'landuse') return;

		const geoType = feature.getGeometry().getType();
		const zoom = this.data.zoom.current;
		let coords;

		//if (this.temp) return null;

		//console.log(geoType);

		if (geoType === 'Polygon') {
			//this.temp = true;
			//console.log(feature);
			
			if (feature.g.length === 1) {
				coords = [this.calCoords(feature.b)];
			}
			else {
				coords = this.calMultiCoords(feature);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}

			//const g = new ol.geom.Polygon(coords);
			//console.log(g);
			//console.log(g.getCoordinates());

			coords.orgFeature = 
				new ol.Feature({geometry: new ol.geom.Polygon(coords)});
			coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			coords.orgFeature.setStyle(this.polyStyleFunc);
			coords.geo = 'p';
			coords.type = 'w';
			coords.dispMode = 1; // original
			//coords.realFeature = null;
			
			this.waterObjects[zoom].push(coords);
			this.newWaterObjects.push(coords);
			this.dispWaterObjects.push(coords);
    }

    if (geoType === 'MultiLineString') {
    	//console.log('MultiLineString!!!');
			//console.log(feature);

			coords = this.calMultiCoords(feature);

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}

			coords.orgFeature = 
				new ol.Feature({geometry: new ol.geom.MultiLineString(coords)});
			coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			coords.orgFeature.setStyle(this.lineStyleFunc);
			coords.geo = 'mls'
			coords.type = 'w';
			coords.dispMode = 1; // original
			//coords.realFeature = null;
			
			this.waterObjects[zoom].push(coords);
			this.newWaterObjects.push(coords);
			this.dispWaterObjects.push(coords);


    }

    if (geoType === 'LineString') {
    	//console.log('LineString!!!');
			//console.log(feature);

			coords = this.calCoords(feature.b);

			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new TgNode(coords[i][1], coords[i][0]);
			}

			coords.orgFeature = 
				new ol.Feature({geometry: new ol.geom.LineString(coords)});
			coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			coords.orgFeature.setStyle(this.lineStyleFunc);
			coords.geo = 'ls'
			coords.type = 'w';
			coords.dispMode = 1; // original
			//coords.realFeature = null;
			
			this.waterObjects[zoom].push(coords);
			this.newWaterObjects.push(coords);
			this.dispWaterObjects.push(coords);

    }




		if (this.timerGetWaterData) clearTimeout(this.timerGetWaterData);
		this.timerGetWaterData = 
				setTimeout(
						this.processNewWaterObjects.bind(this), 
						this.data.time.waitForGettingWaterData);

		if (this.map.timerCheckGridSplitInTgMap) {
			clearTimeout(this.map.timerCheckGridSplitInTgMap);
		}



		return null;
		/*
		// ignores LineString, Point, ...
		if ((geoType == 'Polygon')||(geoType == 'MultiPolygon')) {

			const kind = feature.get('kind');

			// ignores dock, swimming_pool
			// so water, ocean, riverbank, and lake are considered.
			if ((kind === 'dock')||(kind === 'swimming_pool')) return null;

			//feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

			let coords = feature.getGeometry().getCoordinates();
			coords.minZoom = feature.get('min_zoom');
			

			//console.log(coords.minZoom + ' : ' + kind);

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

				coords.orgFeature = 
					new ol.Feature({geometry: new ol.geom.Polygon(coords)});
				coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
				coords.orgFeature.setStyle(this.polyStyleFunc);
				coords.type = 'w';
				coords.dispMode = 1; // original
				//coords.realFeature = null;
				
				this.waterObjects[zoom].push(coords);
				this.newWaterObjects.push(coords);
				this.dispWaterObjects.push(coords);
			}
			else if (geoType == 'MultiPolygon') {

				if (this.simplify) {
					coords = TgUtil.RDPSimp3DLoop(coords, this.rdpThreshold);
				}

				for(let i = 0; i < coords.length; i++) {
					for(let j = 0; j < coords[i].length; j++) {
						for(let k = 0; k < coords[i][j].length; k++) {
							coords[i][j][k].node = new TgNode(coords[i][j][k][1], coords[i][j][k][0]);
						}
					}
				}

				coords.orgFeature = 
					new ol.Feature({geometry: new ol.geom.MultiPolygon(coords)});
				//coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
				coords.orgFeature.setStyle(this.polyStyleFunc);
				coords.type = 'w';
				coords.dispMode = 1; // original
				//coords.realFeature = null;
				
				this.waterObjects[zoom].push(coords);
				this.newWaterObjects.push(coords);
				this.dispWaterObjects.push(coords);
			}			
		}
		return null;
		*/
	}

	processNewWaterObjects() {
		
		console.log('w');

		if (this.timerFinishGettingWaterData) {
			clearTimeout(this.timerFinishGettingWaterData);
		}
		this.timerFinishGettingWaterData = setTimeout(
			this.finishGettingWaterObjects.bind(this), 
			this.data.time.waitForFinishGettingWaterData);

		if (this.map.currentMode === 'EM') {
			this.addNewLayer();
			this.newWaterObjects = [];
		}
		if (this.map.currentMode === 'DC') {
			if (this.map.tpsReady) {
				this.processWaitingWaterObjects();
			}
			else {
				this.waitForTps = true;
			}
		} 

		const cur = (new Date()).getTime();
		if (this.timeInterval !== 0) {
			const dif = (cur - this.timeInterval);
			this.timeIntervalArray.push(dif)
			//console.log('### elapsed: ' + dif + ' ms');
		}
		this.timeInterval = cur;
	}

	processWaitingWaterObjects() {
		//this.makeRealFeatureOfNewWaterObjects();
		this.addNewLayer();
		this.newWaterObjects = [];
	}

	/*makeRealFeatureOfNewWaterObjects() {
		const transform = this.graph.transformReal.bind(this.graph);
		const currentZoom = this.data.zoom.current;

		for(let water of this.waterObjects[currentZoom]) {

  		if (water[0][0].node) { // Polygon
		  
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {

						const modified = 
								transform(water[i][j].node.original.lat, water[i][j].node.original.lng);
						water[i][j].node.real.lat = modified.lat;
						water[i][j].node.real.lng = modified.lng;
						water[i][j][1] = modified.lat;
						water[i][j][0] = modified.lng;
					}
				}
				water.realFeature = 
						new ol.Feature({geometry: new ol.geom.Polygon(water)});
				water.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
				water.realFeature.setStyle(this.styleFunc);
				water.type = 'w';
				water.dispMode = 2; // real
  		}
  		else if (water[0][0][0].node) { // MultiPolygon

  			for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						for(let k = 0; k < water[i][j].length; k++) {
							const modified = 
									transform(water[i][j][k].node.original.lat, water[i][j][k].node.original.lng);
							water[i][j][k].node.real.lat = modified.lat;
							water[i][j][k].node.real.lng = modified.lng;
							water[i][j][k][1] = modified.lat;
							water[i][j][k][0] = modified.lng;
						}
					}
				}
				water.realFeature = 
						new ol.Feature({geometry: new ol.geom.MultiPolygon(water)});
				water.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
				water.realFeature.setStyle(this.styleFunc);
				water.type = 'w';
				water.dispMode = 2; // real
  		}
		}
	}*/


	calDispWater() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top + this.data.var.latMargin;
		const bottom = this.data.box.bottom - this.data.var.latMargin;
		const right = this.data.box.right + this.data.var.lngMargin;
		const left = this.data.box.left - this.data.var.lngMargin;

		let dispMode;
		if (this.map.currentMode === 'EM') dispMode = 1; // original
		else if (this.map.currentMode === 'DC') dispMode = 2; // real
		else dispMode = 4;

		this.dispWaterObjects = [];

		for(let water of this.waterObjects[currentZoom]) {
			if (currentZoom < water.minZoom) {
				//continue;
			}
			
			let isIn = false;
			//if (water[0].length === 0) continue;

			water.dispMode = dispMode;

			if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						const lat = water[i][j].node.original.lat;
						const lng = water[i][j].node.original.lng;
						if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
							this.dispWaterObjects.push(water);
							isIn = true;
							break;
						}
					}
					if (isIn) break;
				}
			}
			else if (water.geo === 'ls') { // LineString
				for(let i = 0; i < water.length; i++) {
					const lat = water[i].node.original.lat;
					const lng = water[i].node.original.lng;
					if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
						this.dispWaterObjects.push(water);
						isIn = true;
						break;
					}
				}
			}
		}

		//console.log('/# of water : ' + this.waterObjects.length);
		//console.log('/# of disp water: ' + this.dispWaterObjects.length);
	}

	updateDispWater() {

		let mode;
		if (this.map.currentMode === 'EM') mode = 'original';
		else if (this.map.currentMode === 'DC') mode = 'real';
		else mode = 'disp';

		for(let water of this.dispWaterObjects) {
			//if (water[0].length === 0) continue;

			if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						water[i][j][0] = water[i][j].node[mode].lng;
						water[i][j][1]	= water[i][j].node[mode].lat;
					}
				}

				/*if ((mode === 'real') && (!water.realFeature)) {
					water.realFeature = new ol.Feature({geometry: new ol.geom.Polygon(water)});
					water.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
					water.realFeature.setStyle(this.styleFunc);
					water.realFeature.type = 'w';
					//console.log('made realFeature');
				}*/
			}
			else if (water.geo === 'ls') { // LineString
				for(let i = 0; i < water.length; i++) {
					water[i][0] = water[i].node[mode].lng;
					water[i][1]	= water[i].node[mode].lat;
				}
			}
		}
	}

	addNewLayer() {
		const viz = this.data.viz;
		let arr = [];
		const transform = this.graph.transformReal.bind(this.graph);

		for(let water of this.newWaterObjects) {

			//if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (this.map.currentMode === 'EM') {
				arr.push(water.orgFeature);
			}
			else if (this.map.currentMode === 'DC') {
				if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							const modified = 
									transform(water[i][j].node.original.lat, water[i][j].node.original.lng);
							water[i][j].node.real.lat = modified.lat;
							water[i][j].node.real.lng = modified.lng;
							water[i][j][1] = modified.lat;
							water[i][j][0] = modified.lng;
						}
					}

					if (water.geo === 'p') {
						water.realFeature = 
								new ol.Feature({geometry: new ol.geom.Polygon(water)});
						water.realFeature.setStyle(this.polyStyleFunc);
					}
					else if (water.geo === 'mls') {
						water.realFeature = 
								new ol.Feature({geometry: new ol.geom.MultiLineString(water)});
						water.realFeature.setStyle(this.lineStyleFunc);
					}

					water.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
					water.type = 'w';
					water.dispMode = 2; // real
	  		}
				else if (water.geo === 'ls') { // LineString
					for(let i = 0; i < water.length; i++) {
						const modified = 
								transform(water[i].node.original.lat, water[i].node.original.lng);
						water[i].node.real.lat = modified.lat;
						water[i].node.real.lng = modified.lng;
						water[i][1] = modified.lat;
						water[i][0] = modified.lng;
					}
					water.realFeature = 
							new ol.Feature({geometry: new ol.geom.LineString(water)});
					water.realFeature.setStyle(this.lineStyleFunc);
					water.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
					water.type = 'w';
					water.dispMode = 2; // real
				}
	  		
				arr.push(water.realFeature);
			}
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(viz.z.water);
		this.mapUtil.addLayer(layer);
		this.dispLayers.push(layer);
		
		//console.log('+ new water layer: ' + arr.length);
		if (this.dispNodeLayer) this.addNewNodeLayer();

  	//console.log('@ waterObjects: ' + arr.length);
	}

	//
	updateLayer() {

		const viz = this.data.viz;
		this.clearLayers();
		this.updateDispWater();

		let arr = [];

		for(let water of this.dispWaterObjects) {
			//if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water.dispMode === 1) { // original
				//console.log('skipped1.');
				arr.push(water.orgFeature);
			}
			/*else if (water.dispMode === 2) { // real
				//console.log('skipped2.');
				arr.push(water.realFeature);
			}*/
			else {
				if (water.geo === 'p') { // Polygon
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Polygon(water), this.polyStyleFunc, 'w');
				}
				else if (water.geo === 'ls') { // LineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(water), this.lineStyleFunc, 'w');
				}
				else if (water.geo === 'mls') { // MultiLineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.MultiLineString(water), this.lineStyleFunc, 'w');
				}
					
			}
		}
		//console.log(arr.length);
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(viz.z.water);
		this.mapUtil.addLayer(this.layer);
		this.dispLayers.push(this.layer);

		//console.log('water updateLayer: ' + arr.length);

		if (this.dispNodeLayer) this.addNodeLayer();

		/*let cnt = 0;
		for(let zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
  		cnt += this.waterObjects[zoom].length;
  	}*/

  	//console.log('@ waterObjects: ' + cnt);
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
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

		for(let water of this.dispWaterObjects) {
			let modified;

			if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						modified = 
							transform(water[i][j].node.original.lat, water[i][j].node.original.lng);
						water[i][j].node[kind].lat = modified.lat;
						water[i][j].node[kind].lng = modified.lng;
					}
				}
			}
			else if (water.geo === 'ls') { // LineString
				for(let i = 0; i < water.length; i++) {
					modified = 
						transform(water[i].node.original.lat, water[i].node.original.lng);
					water[i].node[kind].lat = modified.lat;
					water[i].node[kind].lng = modified.lng;
				}
			}
		}
	}

	calDispNodes(kind, value) {
		let dispMode;

		if (kind === 'original') dispMode = 1; // original
		else if (kind === 'real') dispMode = 2; // real
		else if (kind === 'target') dispMode = 3; // target
		else dispMode = 4; // intermediate

		for(let water of this.dispWaterObjects) {

			water.dispMode = dispMode;

			if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
				if (kind === 'intermediateReal') {
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							water[i][j].node.disp.lat = 
								(1 - value) * water[i][j].node.original.lat + 
								value * water[i][j].node.real.lat;
							water[i][j].node.disp.lng = 
								(1 - value) * water[i][j].node.original.lng +
								value * water[i][j].node.real.lng;
						}
					}
				}
				else if (kind === 'intermediateTarget') {
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							water[i][j].node.disp.lat = 
								(1 - value) * water[i][j].node.original.lat + 
								value * water[i][j].node.target.lat;
							water[i][j].node.disp.lng = 
								(1 - value) * water[i][j].node.original.lng +
								value * water[i][j].node.target.lng;
						}
					}
				}
				else {
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							water[i][j].node.disp.lat = water[i][j].node[kind].lat;
							water[i][j].node.disp.lng = water[i][j].node[kind].lng;
						}
					}
				}
			}
			else if (water.geo === 'ls') { // LineString
				if (kind === 'intermediateReal') {
					for(let i = 0; i < water.length; i++) {
						water[i].node.disp.lat = 
							(1 - value) * water[i].node.original.lat + 
							value * water[i].node.real.lat;
						water[i].node.disp.lng = 
							(1 - value) * water[i].node.original.lng +
							value * water[i].node.real.lng;
					}
				}
				else if (kind === 'intermediateTarget') {
					for(let i = 0; i < water.length; i++) {
						water[i].node.disp.lat = 
							(1 - value) * water[i].node.original.lat + 
							value * water[i].node.target.lat;
						water[i].node.disp.lng = 
							(1 - value) * water[i].node.original.lng +
							value * water[i].node.target.lng;
					}
				}
				else {
					for(let i = 0; i < water.length; i++) {
						water[i].node.disp.lat = water[i].node[kind].lat;
						water[i].node.disp.lng = water[i].node[kind].lng;
					}
				}
			}
		}
	}

	checkPointsInWater(points) {
		const original = this.map.tgOrigin.origin.original;
		for(let point of points) {
			this.isPointInWater(original, point);
		}
		
		console.log('complete: points in water');
	}

	isPointInWater(original, point) {
		let countIntersection = 0;
		for(let water of this.dispWaterObjects) {
			
			//if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water.geo === 'p') { // Polygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length - 1; j++) {

						if (TgUtil.intersects(
							original.lat, original.lng, 
							point.original.lat, point.original.lng, 
		        	water[i][j][1], water[i][j][0], 
		        	water[i][j + 1][1], water[i][j + 1][0])) {
							countIntersection++;
						}
					}
				}
			}
		}

		if ((countIntersection % 2) === 1) {
			point.travelTime = null;
			//console.log('i: ' + point.index + ' #: ' + countIntersection);
		}
	}

	calNumberOfNode() {
		let count = 0;

		for(let water of this.dispWaterObjects) {
			
			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
				for(let water2 of water) {
					count += water2.length;
				}
			}
		}
		return count;
	}

	finishGettingWaterObjects() {

		let sum = 0;
		for(let time of this.timeIntervalArray) sum += time;
		//console.log('################ FIN.');
		//console.log('AVG: ' + ());
		const t = parseInt(sum / this.timeIntervalArray.length);
		console.log('complete: getting water(' + t + ' ms)');
		this.timeInterval = 0;
		this.timeIntervalArray = [];

		if (!this.map.readyControlPoints) {
			this.map.calSplittedGrid();
		}
	}

	addNewNodeLayer() {
		const viz = this.data.viz;
		let arr = [];
		const edgeStyleFunc = 
			this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
		const nodeStyleFunc = 
			this.mapUtil.nodeStyleFunc(viz.color.waterNode, viz.radius.node);

		for(let water of this.newWaterObjects) {
			if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
				for(let nodes of water) {
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
			else if (water.geo === 'ls') { // LineString
				// edge
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(water), edgeStyleFunc, 'e');

				// node
				for(let node of water) {
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point(node), nodeStyleFunc, 'n');
				}
			}
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(viz.z.waterNode);
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
			this.mapUtil.nodeStyleFunc(viz.color.waterNode, viz.radius.node);

		for(let water of this.dispWaterObjects) {
			if ((water.geo === 'p')||(water.geo === 'mls')) { // Polygon, MultiLineString
				for(let nodes of water) {
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
			else if (water.geo === 'ls') { // LineString
				// edge
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(water), edgeStyleFunc, 'e');

				// node
				for(let node of water) {
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point(node), nodeStyleFunc, 'n');
				}
			}
		}
		this.nodeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.nodeLayer.setZIndex(viz.z.waterNode);
		this.mapUtil.addLayer(this.nodeLayer);
		this.dispLayers.push(this.nodeLayer);
	}

	removeNodeLayer() {
		this.mapUtil.removeLayer(this.nodeLayer);
	}
}

//module.exports = TgMapWater;