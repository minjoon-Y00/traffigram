class TGMapRoads {
	constructor(tg, map, mapUtil) {
		this.tg = tg;
		this.olMap = map;
		this.mapUtil = mapUtil;

	  this.roadTypes = 
	  		['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential'];
	  this.roadObjects = {};
	  this.newRoadObjects = {};
	  this.dispRoads = {};
	  this.dispRoadTypes = [];
		this.roadLayer = {};
		this.roadNodeLayer = null;
  	this.timerGetRoadData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.tg.opt.constant.rdpThreshold;

	  for(let type of this.roadTypes) {
	  	this.roadObjects[type] = [];
	  	this.roadLayer[type] = null;
	  	this.newRoadObjects[type] = [];
		}

		this.simplifyRoads = false;
		this.showRoadNodeLayer = false;
	}

	start() {
		const roadSource = new ol.source.VectorTile({
	    format: new ol.format.TopoJSON(),
	    projection: 'EPSG:3857',
	    tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
	    url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?' 
	    	+ 'api_key=vector-tiles-c1X4vZE'
	  })

		this.olMap.addLayer(new ol.layer.VectorTile({
		  source: roadSource,
		  style: this.addToRoadObject.bind(this)
		}))
	}

	addToRoadObject(feature) {
		if (this.timerGetRoadData) clearTimeout(this.timerGetRoadData);
		this.timerGetRoadData = 
				setTimeout(
						this.processNewRoadObjects.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingRoadData);

		// only types we want to consider are passed.
		const kind_detail = feature.get('kind_detail');
		if (this.roadTypes.indexOf(kind_detail) < 0) return null;

		const geoType = feature.getGeometry().getType();
		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

		let coords = feature.getGeometry().getCoordinates();

		// TODO: test lenCoords vs coords.length

		if (geoType === 'LineString') {

			if (this.simplifyRoads) {
				//console.log('before: ' + coords.length);
				coords = this.tg.util.RDPSimp1D(coords, this.rdpThreshold);
				//console.log('after: ' + coords.length);
			}

			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new Node(coords[i][1], coords[i][0]);
			}
			this.roadObjects[kind_detail].push(coords);
			this.newRoadObjects[kind_detail].push(coords);

			if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
				this.dispRoads[kind_detail].push(coords);
			}
		}
		else if (geoType === 'MultiLineString') {

			if (this.simplifyRoads) {
				//console.log('before: ' + coords.length);
				coords = this.tg.util.RDPSimp2D(coords, this.rdpThreshold);
				//console.log('after: ' + coords.length);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
				}
			}
			this.roadObjects[kind_detail].push(coords);
			this.newRoadObjects[kind_detail].push(coords);

			if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
				this.dispRoads[kind_detail].push(coords);
			}
		}

		return null;
	}

	processNewRoadObjects() {
		this.tg.map.setDataInfo(
			'numHighwayLoading', 'set', 
			this.roadObjects.motorway.length + this.roadObjects.trunk.length);
		this.tg.map.setDataInfo(
			'numPrimaryLoading', 'set', this.roadObjects.primary.length);
		this.tg.map.setDataInfo(
			'numSecondaryLoading', 'set', this.roadObjects.secondary.length);
		this.tg.map.setDataInfo(
			'numTertiaryLoading', 'set', this.roadObjects.tertiary.length);
		this.tg.map.setDataInfo(
			'numResidentialLoading', 'set', this.roadObjects.residential.length);
		this.tg.map.setDataInfo('numRoadLoading', 'increase');
		this.tg.map.setTime('roadLoading', 'end', (new Date()).getTime());

	  this.addNewRoadLayer();

	  for(let type of this.roadTypes) {
	  	this.newRoadObjects[type] = [];
		}

 		//this.calDispRoads();
	  //this.updateDispRoads();
		//this.addRoadLayer();
		//this.addRoadNodeLayer();
	}

	calDispRoadType(currentZoom) {
		this.dispRoadTypes = [];
		for(let type in this.tg.opt.dispZoom) {
			if (currentZoom >= this.tg.opt.dispZoom[type].minZoom) {
				this.dispRoadTypes.push(type);
			}
		}
		//console.log(this.dispRoadTypes);
	}

	calDispRoads() {
		const currentZoom = this.tg.map.currentZoom;
		const opt = this.tg.opt;
		const top = opt.box.top;
		const bottom = opt.box.bottom;
		const right = opt.box.right;
		const left = opt.box.left;

		for(let type of this.roadTypes) {
	  	this.dispRoads[type] = [];
		}

		for(let type of this.dispRoadTypes) {
			for(let road of this.roadObjects[type]) {
				
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

		/*
		let numRoad = 0;
		for(let type of this.roadTypes) {
			for(let road of this.roadObjects[type]) {
				numRoad++;
			}
		}


		let numDispRoad = 0;
		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {
				numDispRoad++;
			}
		}

		console.log('/# of road : ' + numRoad);
		console.log('/# of disp road: ' + numDispRoad);
		*/
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

	addNewRoadLayer() {
		//let totalNumArr = 0;
		for(let type of this.dispRoadTypes) {
			let arr = [];
			const styleFunc = this.mapUtil.lineStyleFunc(
				this.tg.opt.color.road[type], this.tg.opt.width.road[type]);

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
			//totalNumArr += arr.length;
			const layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(this.tg.opt.z[type]);
			this.olMap.addLayer(layer);
			this.dispLayers.push(layer);
		}
		//console.log('+ new road layer: ' + totalNumArr);
		if (this.showRoadNodeLayer) this.addNewRoadNodeLayer();
	}

	//
	addRoadLayer() {
	  for(let type of this.roadTypes) {
			this.mapUtil.removeLayer(this.roadLayer[type]);
		}

		for(let type of this.dispRoadTypes) {
			let arr = [];
			const styleFunc = this.mapUtil.lineStyleFunc(
				this.tg.opt.color.road[type], this.tg.opt.width.road[type]);

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
			this.roadLayer[type] = this.mapUtil.olVectorFromFeatures(arr);
			this.roadLayer[type].setZIndex(this.tg.opt.z[type]);
			//this.setVisibleByCurrentZoom(tg.map.currentZoom);
			this.olMap.addLayer(this.roadLayer[type]);
			this.dispLayers.push(this.roadLayer[type]);

			//console.log('### ' + type + ' : ' + arr.length);
		}
		if (this.showRoadNodeLayer) this.addRoadNodeLayer();
	}

	clearLayers() {
		for(let layer of this.dispLayers) {
			this.mapUtil.removeLayer(layer);
		}
	}

	setVisibleByCurrentZoom(currentZoom) {
		return;
  	for(let type of this.roadTypes) {
		  if (this.roadLayer[type])
				this.roadLayer[type].setVisible(true);
  	}

  	if (currentZoom <= 14) {
  		if (this.roadLayer.residential)
				this.roadLayer.residential.setVisible(false);
  	}
  	if (currentZoom <= 13) {
  		if (this.roadLayer.tertiary)
				this.roadLayer.tertiary.setVisible(false);
  	} 
  	if (currentZoom <= 12) {
  		if (this.roadLayer.secondary)
				this.roadLayer.secondary.setVisible(false);
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

		const transform = this.tg.graph[transformFuncName].bind(this.tg.graph);

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

	addNewRoadNodeLayer() {
		let arr = [];
		const clrMinor = this.tg.opt.color.minorNode;
		const clrMajor = this.tg.opt.color.majorNode;
		const radiusMinor = this.tg.opt.radius.minorNode;
		const radiusMajor = this.tg.opt.radius.majorNode;

		for(let type of this.dispRoadTypes) {
			for(let road of this.newRoadObjects[type]) {
				if (road[0].node) { // LineString
					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point(road[0]), 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point(road[road.length - 1]), 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

					for(let index = 1; index < road.length - 1; index++) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(road[index]), 
							this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor));
					}
				}
				else if (road[0][0].node) { // MultiLineString
					for(let road2 of road) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(road2[0]), 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(road2[road2.length - 1]), 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

						for(let index = 1; index < road2.length - 1; index++) {
							this.mapUtil.addFeatureInFeatures(
								arr, new ol.geom.Point(road2[index]), 
								this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor));
						}
					}
				}
				else {
					console.log('not known geotype in createDispRoas()');
				}
			}
		}
		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(this.tg.opt.z.roadNode);
		this.olMap.addLayer(layer);
		this.dispLayers.push(layer);
	}



	addRoadNodeLayer() {

		this.mapUtil.removeLayer(this.roadNodeLayer);

		let arr = [];
		const clrMinor = this.tg.opt.color.minorNode;
		const clrMajor = this.tg.opt.color.majorNode;
		const radiusMinor = this.tg.opt.radius.minorNode;
		const radiusMajor = this.tg.opt.radius.majorNode;

		for(let type of this.dispRoadTypes) {
			for(let road of this.dispRoads[type]) {

				if (road[0].node) { // LineString

					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point(road[0]), 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

					this.mapUtil.addFeatureInFeatures(
						arr, new ol.geom.Point(road[road.length - 1]), 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

					for(let index = 1; index < road.length - 1; index++) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(road[index]), 
							this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor));
					}
				}
				else if (road[0][0].node) { // MultiLineString
					for(let road2 of road) {
						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(road2[0]), 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

						this.mapUtil.addFeatureInFeatures(
							arr, new ol.geom.Point(road2[road2.length - 1]), 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor));

						for(let index = 1; index < road2.length - 1; index++) {
							this.mapUtil.addFeatureInFeatures(
								arr, new ol.geom.Point(road2[index]), 
								this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor));
						}
					}
				}
				else {
					console.log('not known geotype in createDispRoas()');
				}
			}
		}
		this.roadNodeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.roadNodeLayer.setZIndex(this.tg.opt.z.roadNode);
		this.olMap.addLayer(this.roadNodeLayer);
		this.dispLayers.push(this.roadNodeLayer);
	}
}
