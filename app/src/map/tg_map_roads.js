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

		this.waitForTps = false;

		this.simplify = this.data.elements.road.simplify;
  	this.dispNodeLayer = false;
		this.nodeLayer = null;
		this.streetLayer = null;

	  this.roadTypes = [];

	  for(let type in this.data.zoom.disp) {
	  	//[motorway, motorway_link, main, street, street_limited];
	  	this.roadTypes.push(type);
	  }

	  this.roadObjects = {};
	  this.newRoadObjects = {};
	  this.dispRoads = {};
	  this.streetNames = {};
	  this.dispRoadTypes = [];
  	this.timerGetRoadData = null;
  	this.timerFinishGettingRoadData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.data.var.rdpThreshold.road;
  	this.styleFunc = {};

  	this.mobile = (this.data.var.appMode === 'mobile');

  	for(let zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
  		this.roadObjects[zoom] = {};
	  	for(let type of this.roadTypes) this.roadObjects[zoom][type] = [];
  	}

	  for(let type of this.roadTypes) {
	  	this.layer[type] = null;
	  	this.newRoadObjects[type] = [];
	  	this.dispRoads[type] = [];
	  	this.styleFunc[type] = this.mapUtil.lineStyleFunc(
				this.data.viz.color.road[type], this.data.viz.width.road[type]
			);
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

	addRoadObjects(type, zoom, coords) {

		if (this.roadTypes.indexOf(type) < 0) return null;

		coords.orgFeature.setStyle(this.styleFunc[type]);

		// TODO: needed?
		coords.type = 'r';

		this.roadObjects[zoom][type].push(coords);
		this.newRoadObjects[type].push(coords);

		// TODO: Check
		if (this.dispRoadTypes.indexOf(type) >= 0) {
			if (!this.dispRoads[type]) {
				console.log(type);
				console.log(this.dispRoads[type]);
			}
			else {
				this.dispRoads[type].push(coords);
			}
			
		}
	}

	/*addToRoadObject(feature) {

		//console.log('.');

		if (this.timerGetRoadData) clearTimeout(this.timerGetRoadData);
		this.timerGetRoadData = 
				setTimeout(
						this.processNewRoadObjects.bind(this), 
						this.data.time.waitForGettingRoadData);

		// only types we want to consider are passed.
		const kind_detail = feature.get('kind_detail');
		if (this.roadTypes.indexOf(kind_detail) < 0) return null;
		//if (this.dispRoadTypes.indexOf(kind_detail) < 0) return null;

		const geoType = feature.getGeometry().getType();
		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

		let coords = feature.getGeometry().getCoordinates();
		coords.minZoom = feature.get('min_zoom');

		if (!this.mobile) coords.name = feature.get('name');

		if (geoType === 'LineString') {

			if (this.simplify) {
				coords = TgUtil.RDPSimp1D(coords, this.rdpThreshold);
			}

			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new TgNode(coords[i][1], coords[i][0]);
			}

			coords.orgFeature = 
					new ol.Feature({geometry: new ol.geom.LineString(coords)});
		}
		else if (geoType === 'MultiLineString') {

			if (this.simplify) {
				coords = TgUtil.RDPSimp2D(coords, this.rdpThreshold);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}

			coords.orgFeature = 
					new ol.Feature({geometry: new ol.geom.MultiLineString(coords)});
		}

		coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		coords.orgFeature.setStyle(this.styleFunc[kind_detail]);
		coords.orgFeature.type = 'r';
		coords.dispMode = 1; // original
		//coords.realFeature = null;

		const zoom = this.data.zoom.current;

		this.roadObjects[zoom][kind_detail].push(coords);
		this.newRoadObjects[kind_detail].push(coords);

		if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
			this.dispRoads[kind_detail].push(coords);
		}

		return null;
	}*/

	/*processFeature(feature) {
		const kind_detail = feature.get('kind_detail');
		//if (this.roadTypes.indexOf(kind_detail) < 0) return null;
		if (this.dispRoadTypes.indexOf(kind_detail) < 0) return null;

		const geoType = feature.getGeometry().getType();
		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

		let coords = feature.getGeometry().getCoordinates();
		coords.minZoom = feature.get('min_zoom');

		if (geoType === 'LineString') {

			if (this.simplify) {
				coords = TgUtil.RDPSimp1D(coords, this.rdpThreshold);
			}

			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new TgNode(coords[i][1], coords[i][0]);
			}

			coords.orgFeature = 
					new ol.Feature({geometry: new ol.geom.LineString(coords)});
		}
		else if (geoType === 'MultiLineString') {

			if (this.simplify) {
				coords = TgUtil.RDPSimp2D(coords, this.rdpThreshold);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}

			coords.orgFeature = 
					new ol.Feature({geometry: new ol.geom.MultiLineString(coords)});
		}

		coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		coords.orgFeature.setStyle(this.styleFunc[kind_detail]);
		coords.orgFeature.type = 'r';
		coords.dispMode = 1; // original
		//coords.realFeature = null;

		const zoom = this.data.zoom.current;

		this.roadObjects[zoom][kind_detail].push(coords);
		this.newRoadObjects[kind_detail].push(coords);

		if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
			this.dispRoads[kind_detail].push(coords);
		}
	}*/

	processNewRoadObjects() {

		if (!this.mobile) {
			if (this.timerFinishGettingRoadData) {
				clearTimeout(this.timerFinishGettingRoadData);
			}
			this.timerFinishGettingRoadData = setTimeout(
				this.finishGettingRoadObjects.bind(this), 
				this.data.time.waitForFinishGettingRoadData);
			console.log('SET NEW TIMEOUT.');
		}

		if (this.map.currentMode === 'EM') {
			this.addNewLayer();
			for(let type of this.roadTypes) {
				this.newRoadObjects[type] = [];
			}
		}
		else if (this.map.currentMode === 'DC') {
			if (this.map.tpsReady) {
				this.processWatingRoadObjects();
			}
			else {
				this.waitForTps = true;
			}
		}
	}

	processWatingRoadObjects() {
		//this.makeRealFeatureOfNewRoadObjects();
		this.addNewLayer();
		for(let type of this.roadTypes) {
			this.newRoadObjects[type] = [];
		}
	}

	finishGettingRoadObjects() {

		// console.log('#FIN GETTING ROADS');
		this.addStreetLayer()

		// for(let type in this.dispRoads) {
			// console.log(type + ': ' + this.dispRoads[type].length);
		// }
	}

	addStreetLayer() {
		return;
		const currentZoom = this.data.zoom.current;
		if (currentZoom <= 14) return;

		this.mapUtil.removeLayer(this.streetLayer);

		const viz = this.data.viz;
		let arr = [];
		const maxNumStreet = 15;
		let dispNumStreet = 0;
		let fin = false;

	  this.streetNames = {};

		for(let type of this.dispRoadTypes) {
			this.streetNames[type] = {};

			for(let road of this.dispRoads[type]) {

				if (!road.name) continue;

				const obj = this.getMaxLenObj(road);
				if (!obj) continue;

				if (!this.streetNames[type][road.name]) {
					// if there is no obj with same street name,
					this.streetNames[type][road.name] = obj;
					obj.type = type;
				}
				else {
					// if exists, the obj with longer len wins.
					if (this.streetNames[type][road.name].len < obj.len) {
						this.streetNames[type][road.name] = obj;
						obj.type = type;
					}
				}
			}
		}

		for(let type in this.streetNames) {
			for(let name in this.streetNames[type]) {
				const obj = this.streetNames[type][name];

				this.map.tgBB.calBBOfAStreetName(obj, name);

				if (!this.map.tgBB.isItNotOverlappedWithLocsPlacesStreet(obj.bb, name)) {
					obj.bb = null;
					continue;
				}
				else {
					const streetStyleFunc = 
						this.mapUtil.textStyle({
							text: name, 
							color: viz.color.textStreet, 
							font: viz.font.text, 
							rotation: (obj.longLng) ? 0 : Math.PI / 2,
						});

					this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.Point(obj.center), streetStyleFunc);

					dispNumStreet++;
					if (dispNumStreet > maxNumStreet) {
						fin = true;
						break;
					}
				}
			}
			if (fin) break;
		}

		this.streetLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.streetLayer.setZIndex(viz.z.street);
		this.mapUtil.addLayer(this.streetLayer);
		this.dispLayers.push(this.streetLayer);

		this.map.tgBB.render();
	}

	removeStreetLayer() {
		this.mapUtil.removeLayer(this.streetLayer);
	}

	getMaxLenObj(roads) {
		const calMaxLen = function(rI, rJ) {
			const d0 = Math.abs(rI[0] - rJ[0]);
			const d1 = Math.abs(rI[1] - rJ[1]);
			const len = d0 + d1;
			if (len > maxLen) {
				maxLen = len;
				maxRI = rI;
				maxRJ = rJ;
				longLng = (d0 > d1);
			}
		}
		let maxLen = 0;
		let maxRI = null;
		let maxRJ = null;
		let longLng;

		if (roads[0].node) { // LineString
			for(let i = 0; i < roads.length - 1; i++) {
				calMaxLen(roads[i], roads[i + 1]);
			}
		}
		else if (roads[0][0].node) { // MultiLineString
			for(let i = 0; i < roads.length; i++) {
				for(let j = 0; j < roads[i].length - 1; j++) {
					calMaxLen(roads[i][j], roads[i][j + 1]);
				}
			}
		}

		if ((maxRI === null)||(maxRJ === null)) return null;

		return {
			center: [(maxRI[0] + maxRJ[0]) / 2, (maxRI[1] + maxRJ[1]) / 2],
			len: maxLen, longLng: longLng,
		};
	}

	/*makeRealFeatureOfNewRoadObjects() {
		const transform = this.graph.transformReal.bind(this.graph);

	  for(let type of this.roadTypes) {
			for(let road of this.newRoadObjects[type]) {
	  		if (road[0].node) {
			  
					for(let i = 0; i < road.length; i++) {
						const modified = 
								transform(road[i].node.original.lat, road[i].node.original.lng);
						road[i].node.real.lat = modified.lat;
						road[i].node.real.lng = modified.lng;
						road[i][1] = modified.lat;
						road[i][0] = modified.lng;
					}
					road.realFeature = 
							new ol.Feature({geometry: new ol.geom.LineString(road)});
					road.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
					road.realFeature.setStyle(this.styleFunc[type]);
					road.realFeature.type = 'r';
					road.dispMode = 2; // real
	  		}
	  		else if (road[0][0].node) {

	  			for(let i = 0; i < road.length; i++) {
						for(let j = 0; j < road[i].length; j++) {

							const modified = 
									transform(road[i][j].node.original.lat, road[i][j].node.original.lng);
							road[i][j].node.real.lat = modified.lat;
							road[i][j].node.real.lng = modified.lng;
							road[i][j][1] = modified.lat;
							road[i][j][0] = modified.lng;
						}
					}
					road.realFeature = 
							new ol.Feature({geometry: new ol.geom.MultiLineString(road)});
					road.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
					road.realFeature.setStyle(this.styleFunc[type]);
					road.realFeature.type = 'r';
					road.dispMode = 2; // real
	  		}
	  	}
		}
	}*/

	updateDisplayedRoadType(currentZoom) {
		this.dispRoadTypes = [];
		for(let type in this.data.zoom.disp) {
			if (currentZoom >= this.data.zoom.disp[type].min) {
				this.dispRoadTypes.push(type);
			}
		}
		console.log(this.dispRoadTypes);
	}

	calDispRoads() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top + this.data.var.latMargin;
		const bottom = this.data.box.bottom - this.data.var.latMargin;
		const right = this.data.box.right + this.data.var.lngMargin;
		const left = this.data.box.left - this.data.var.lngMargin;

		let dispMode;
		if (this.map.currentMode === 'EM') dispMode = 1; // original
		else if (this.map.currentMode === 'DC') dispMode = 2; // real
		else dispMode = 4;

		for(let type of this.roadTypes) {
	  	this.dispRoads[type] = [];
		}

		for(let type of this.dispRoadTypes) {
			for(let road of this.roadObjects[currentZoom][type]) {
				if (currentZoom < road.minZoom) {
					continue;
				}

				road.dispMode = dispMode;
				
				if (road.geo === 'ls') { // LineString
					for(let i = 0; i < road.length; i++) {
						const lat = road[i].node.original.lat;
						const lng = road[i].node.original.lng;
						if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
							this.dispRoads[type].push(road);
							break;
						}
					}
				}
				else if ((road.geo === 'mls')||(road.geo === 'p')) { // MultiLineString, Polygon
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

		//for(let type in this.dispRoads) {
		//	console.log(type + ': ' + this.dispRoads[type].length);
		//}
		//console.log('####calDispRoads');
	}

	updateDispRoads() {

		let mode;
		if (this.map.currentMode === 'EM') mode = 'original';
		else if (this.map.currentMode === 'DC') mode = 'real';
		else mode = 'disp';

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {
				if (road.geo === 'ls') { // LineString
					for(let i = 0; i < road.length; i++) {
						road[i][0] = road[i].node[mode].lng;
						road[i][1] = road[i].node[mode].lat;
					}

					/*if ((mode === 'real') && (!road.realFeature)) {
						road.realFeature = new ol.Feature({geometry: new ol.geom.LineString(road)});
						road.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
						road.realFeature.setStyle(this.styleFunc[type]);
						//console.log('made realFeature');
					}*/
				}
				else if ((road.geo === 'mls')||(road.geo === 'p')) { // MultiLineString, Polygon
					for(let i = 0; i < road.length; i++) {
						for(let j = 0; j < road[i].length; j++) {
							road[i][j][0] = road[i][j].node[mode].lng;
							road[i][j][1]	= road[i][j].node[mode].lat;
						}
					}

					/*if ((mode === 'real') && (!road.realFeature)) {
						road.realFeature = new ol.Feature({geometry: new ol.geom.MultiLineString(road)});
						road.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
						road.realFeature.setStyle(this.styleFunc[type]);
						//console.log('made realFeature');

					}*/
				}
				else {
					console.log('not known geotype in createDispRoas()');
				}
			}
		}
	}

	addNewLayer() {
		if (!this.display) return;

		const viz = this.data.viz;
		let transform;
		if (this.graph) transform = this.graph.transformReal.bind(this.graph);

		for(let type of this.dispRoadTypes) {
			let arr = [];

			for(let road of this.newRoadObjects[type]) {
				if (this.map.currentMode === 'EM') {
					arr.push(road.orgFeature);
				}
				else if (this.map.currentMode === 'DC') {
		  		if (road[0].node) {
				  
						for(let i = 0; i < road.length; i++) {
							const modified = 
									transform(road[i].node.original.lat, road[i].node.original.lng);
							road[i].node.real.lat = modified.lat;
							road[i].node.real.lng = modified.lng;
							road[i][1] = modified.lat;
							road[i][0] = modified.lng;
						}
						road.realFeature = 
								new ol.Feature({geometry: new ol.geom.LineString(road)});
						road.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
						road.realFeature.setStyle(this.styleFunc[type]);
						road.realFeature.type = 'r';
						road.dispMode = 2; // real
		  		}
		  		else if (road[0][0].node) {
		  			for(let i = 0; i < road.length; i++) {
							for(let j = 0; j < road[i].length; j++) {

								const modified = 
										transform(road[i][j].node.original.lat, road[i][j].node.original.lng);
								road[i][j].node.real.lat = modified.lat;
								road[i][j].node.real.lng = modified.lng;
								road[i][j][1] = modified.lat;
								road[i][j][0] = modified.lng;
							}
						}
						road.realFeature = 
								new ol.Feature({geometry: new ol.geom.MultiLineString(road)});
						road.realFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
						road.realFeature.setStyle(this.styleFunc[type]);
						road.realFeature.type = 'r';
						road.dispMode = 2; // real
		  		}
				arr.push(road.realFeature);
				}
			}

			const layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z[type]);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);
		}

		if (this.dispNodeLayer) this.addNewNodeLayer();

		/*
		let cnt = 0;
		for(let type of this.dispRoadTypes) cnt += this.newRoadObjects[type].length;
		console.log('@ road newRoad: ' + cnt);


	  let counts = [0, 0, 0, 0, 0, 0];
	  for(let i = 0; i < this.roadTypes.length; i++) {
			counts[i] += this.newRoadObjects[this.roadTypes[i]].length;
	  }

	  console.log('@ ' + counts[0] + ' ' + counts[1] + ' ' + counts[2] + ' ' + 
	  	counts[3] + ' ' + counts[4] + ' ' + counts[5] + ' ');*/
	}

	//
	updateLayer() {
		const viz = this.data.viz;
		this.clearLayers();
		this.updateDispRoads();

		for(let type of this.dispRoadTypes) {
			let arr = [];

			for(let road of this.dispRoads[type]) {
				if (road.dispMode === 1) { // original
					//console.log('skipped1.');
					arr.push(road.orgFeature);
				}
				/*else if (road.dispMode === 2) { // real
					//console.log('skipped2.');
					arr.push(road.realFeature);
				}*/
				else {
					if (road.geo === 'ls') { // LineString
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.LineString(road), this.styleFunc[type], 'r');
					}
					else if (road.geo === 'mls') { // MultiLineString
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.MultiLineString(road), this.styleFunc[type], 'r');
					}
					else if (road.geo === 'p') { // Polygon
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Polygon(road), this.styleFunc[type], 'r');
					}
				}
			}
			this.layer[type] = this.mapUtil.olVectorFromFeatures(arr);
			this.layer[type].setZIndex(viz.z[type]);
			this.mapUtil.addLayer(this.layer[type]);
			this.dispLayers.push(this.layer[type]);
		}

		//let cnt = 0;
		//for(let type of this.dispRoadTypes) cnt += this.dispRoads[type].length;
		//console.log('@ road dispRoad: ' + cnt);

		/*console.log('@@@@@@@@');

		let cnt = 0;
		for(let type of this.dispRoadTypes) {
			cnt += this.dispRoads[type].length;
		}

		console.log('@ road dispRoad: ' + cnt);

		cnt = 0;
		for(let zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
	  	for(let type of this.roadTypes) {
				cnt += this.roadObjects[zoom][type].length;
	  	}
  	}

		console.log('@ road road: ' + cnt);
		console.log('@@@@@@@@');*/


		if (this.dispNodeLayer) this.addNodeLayer();
		if (!this.mobile) this.addStreetLayer();
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

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {
				let modified;

				if (road.geo === 'ls') { // LineString
					for(let i = 0; i < road.length; i++) {
						modified = transform(road[i].node.original.lat, road[i].node.original.lng);
						road[i].node[kind].lat = modified.lat;
						road[i].node[kind].lng = modified.lng;
					}
				} 
				else if ((road.geo === 'mls')||(road.geo === 'p')) { // MultiLineString, Polygon
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

	/*updateDispModeOfAllObjects(dispMode) {
		if (this.data.zoom.previous != this.data.zoom.current) {
			for(let type of this.roadTypes) {
				for(let road of this.roadObjects[this.data.zoom.previous][type]) {
					road.dispMode = dispMode;
				}
			}
		}

		for(let type of this.roadTypes) {
			for(let road of this.roadObjects[this.data.zoom.current][type]) {
				road.dispMode = dispMode;
			}
		}
	}*/

	calDispNodes(kind, value) {
		let dispMode;

		if (kind === 'original') dispMode = 1; // original
		else if (kind === 'real') dispMode = 2; // real
		else if (kind === 'target') dispMode = 3; // target
		else dispMode = 4; // intermediate

		//if ((dispMode > 0) && (dispMode < 4)) {
			//this.updateDispModeOfAllObjects(dispMode);
		//}

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {

				road.dispMode = dispMode;

				if (road.geo === 'ls') { // LineString
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
				else if ((road.geo === 'mls')||(road.geo === 'p')) { // MultiLineString, Polygon
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

				if (road.geo === 'ls') { // LineString
					// edge
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(roads), edgeStyleFunc, 'e');

					// node
					for(let node of roads) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(node), nodeStyleFunc, 'n');
					}
				}
				else if ((road.geo === 'mls')||(road.geo === 'p')) { // MultiLineString, Polygon
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
				if (road.geo === 'ls') { // LineString
					// edge
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.LineString(roads), edgeStyleFunc, 'e');

					// node
					for(let node of roads) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(node), nodeStyleFunc, 'n');
					}
				}
				else if ((road.geo === 'mls')||(road.geo === 'p')) { // MultiLineString, Polygon
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

//module.exports = TgMapRoads;