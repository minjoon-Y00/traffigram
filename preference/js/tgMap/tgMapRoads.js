class TGMapRoads {
	constructor(tg, map, mapUtil) {
		this.tg = tg;
		this.olMap = map;
		this.mapUtil = mapUtil;

	  this.roadTypes = 
	  		['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential'];
	  this.roadObjects = {};
		this.roadLayer = {};
		this.roadNodeLayer = null;
  	this.timerGetRoadData = null;

	  for(let type of this.roadTypes) {
	  	this.roadObjects[type] = [];
	  	this.roadLayer[type] = null;
		}
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

		const s = (new Date()).getTime();
		
		if (this.timerGetRoadData) clearTimeout(this.timerGetRoadData);
		this.timerGetRoadData = 
				setTimeout(
						this.createDispRoads.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingRoadData);

		// only types we want to consider are passed.
		const kind_detail = feature.get('kind_detail');
		if (this.roadTypes.indexOf(kind_detail) < 0) return null;

		const geoType = feature.getGeometry().getType();
		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

		let coords = feature.getGeometry().getCoordinates();
		const lenCoords = coords.length;

		// TODO: test lenCoords vs coords.length

		if (geoType === 'LineString') {
			for(let i = 0; i < lenCoords; i++) {
				coords[i].node = new Node(coords[i][1], coords[i][0]);
			}
			this.roadObjects[kind_detail].push(coords);
		}
		else if (geoType === 'MultiLineString') {
			for(let i = 0; i < lenCoords; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
				}
			}
			this.roadObjects[kind_detail].push(coords);
		}

		return null;
	}

	createDispRoads() {

		//console.log(this.roadObjects);

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

		const s = (new Date()).getTime();

		this.tg.map.setDataInfo('numRoadLoading', 'increase');
		this.tg.map.setTime('roadLoading', 'end', (new Date()).getTime());
 		
	  this.updateDispRoads();
		this.addRoadLayer();
		//this.addRoadNodeLayer();

		const e = (new Date()).getTime();
		//console.log('createDispRoads: ' + (e - s) + ' ms');
	}

	updateDispRoads() {
		for(let type of this.roadTypes) {
			for(let road of this.roadObjects[type]) {
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

	//
	addRoadLayer() {

		const s = (new Date()).getTime();

	  for(let type of this.roadTypes) {
	  	this.mapUtil.removeLayer(this.roadLayer[type]);
		}

	  for(let type of this.roadTypes) {
	  	let arr = [];
			const styleFunc = this.mapUtil.lineStyleFunc(
				this.tg.opt.color.road[type], this.tg.opt.width.road[type]);

			for(let road of this.roadObjects[type]) {
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
			this.setVisibleByCurrentZoom(tg.map.currentZoom);
			this.olMap.addLayer(this.roadLayer[type]);

			console.log('### ' + type + ' : ' + arr.length);
	  }



		const e = (new Date()).getTime();
		//console.log('addRoadLayer: ' + (e - s) + ' ms');
	}

	setVisibleByCurrentZoom(currentZoom) {
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

		const s = (new Date()).getTime();

		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.tg.graph[transformFuncName].bind(this.tg.graph);

	  for(let type of this.roadTypes) {
			for(let road of this.roadObjects[type]) {
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

		const e = (new Date()).getTime();
		console.log('calModifiedNodes: ' + (e - s) + ' ms');
	}

	calDispNodes(kind, value) {

		const s = (new Date()).getTime();

	  for(let type of this.roadTypes) {
			for(let road of this.roadObjects[type]) {

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
						for(let i = 0; i < road.length; j++) {
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
						for(let i = 0; i < road.length; j++) {
							for(let j = 0; j < road[i].length; j++) {
								road[i][j].node.disp.lat = 
									(1 - value) * road[i][j].node.original.lat + 
									value * coords[j][k].node.target.lat;
								road[i][j].node.disp.lng = 
									(1 - value) * road[i][j].node.original.lng + 
									value * road[i][j].node.target.lng;
							}
						}
					}
					else {
						for(let i = 0; i < road.length; j++) {
							for(let j = 0; j < road[i].length; j++) {
								road[i][j].node.disp.lat = road[i][j].node[kind].lat;
								road[i][j].node.disp.lng = road[i][j].node[kind].lng;
							}
						}
					}
				}
			}
		}

		const e = (new Date()).getTime();
		//console.log('calDispNodes: ' + (e - s) + ' ms');
	}

	/*addRoadNodeLayer() {

		if (this.roadNodeLayer) 
			this.olMap.removeLayer(this.roadNodeLayer)

		var arr = []
		var clrMinor = '#333'
		var clrMajor = '#F33'
		var radiusMinor = 1
		var radiusMajor = 2
		var eps = 0.0001

		var originalNodeCount = 0


		for(var kind in this.roadObject) {
			var roadObj = this.roadObject[kind]

			for(var i = 0; i < roadObj.length; i++) {
				var geoType = roadObj[i].geoType
				var coords = roadObj[i].coordinates

				if (geoType == 'LineString') {

					originalNodeCount += coords.length
					coords = this.tg.util.RDPSimp(coords, eps)

					this.olFeaturesFromPoints(arr, 
						coords[0].original.lng, 
						coords[0].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					this.olFeaturesFromPoints(arr, 
						coords[coords.length - 1].original.lng, 
						coords[coords.length - 1].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					for(var k = 1; k < coords.length - 1; k++) {
						this.olFeaturesFromPoints(arr, 
							coords[k].original.lng, 
							coords[k].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))

					}
				}
				else if (geoType == 'MultiPolygon') {
					for(var j = 0; j < coords.length; j++) {

						originalNodeCount += coords[j].length
						coords[j] = this.tg.util.RDPSimp(coords[j], eps)

						this.olFeaturesFromPoints(arr, 
							coords[j][0].original.lng, 
							coords[j][0].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

						this.olFeaturesFromPoints(arr, 
							coords[j][coords[j].length - 1].original.lng, 
							coords[j][coords[j].length - 1].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

						for(var k = 1; k < coords[j].length - 1; k++) {
							this.olFeaturesFromPoints(arr, 
								coords[j][k].original.lng, 
								coords[j][k].original.lat, 
								this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))
						}
					}
				}
			
			}
		}

		console.log('# of original road node: ' + originalNodeCount)
		console.log('# of roadNode : ' + arr.length)

		this.roadNodeLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
		    features: arr
			})
		})

		this.roadNodeLayer.setZIndex(this.tg.opt.z.roadNode)
		this.olMap.addLayer(this.roadNodeLayer)
	}*/
}
