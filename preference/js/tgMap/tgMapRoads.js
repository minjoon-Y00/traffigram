class TGMapRoads {
	constructor(tg, map, mapUtil) {
		this.tg = tg
		this.olMap = map
		this.mapUtil = mapUtil

		this.roadNodeLayer = null
	  this.roadTypes = 
	  		['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential'];
		this.roadLayer = {};
	  this.roadObject = {};
	  this.dispRoads = {};
  	this.timerGetRoadData = null;
  	this.roads = {};

	  for(let type of this.roadTypes) {
	  	this.roads[type] = [];
	  	this.roadLayer[type] = null;
			this.roadObject[type] = [];
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

		let road;
		const geoType = feature.getGeometry().getType();
		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

		let coords = feature.getGeometry().getCoordinates();
		const lenCoords = coords.length;

		if (geoType === 'LineString') {
			for(let i = 0; i < lenCoords; i++) {
				coords[i].node = new Node(coords[i][1], coords[i][0]);
			}
			this.roads[kind_detail].push(coords);
		}
		else if (geoType === 'MultiLineString') {
			for(let i = 0; i < lenCoords; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
				}
			}
			this.roads[kind_detail].push(coords);
		}

		//this.roads.push(road);





		//var obj = {'geoType':geoType, 'kind':kind_detail,
		//	'coordinates':new Array(lenCoords), 'visible':true}

		/*if (geoType === 'LineString') {
			for(var i = 0; i < lenCoords; i++) {
				obj.coordinates[i] = new Node(coords[i][1], coords[i][0])
			}
		}
		else if (geoType == 'MultiLineString') {
			for(var i = 0; i < lenCoords; i++) {
				obj.coordinates[i] = new Array(coords[i].length)

				for(var j = 0; j < coords[i].length; j++) {
					obj.coordinates[i][j] = new Node(coords[i][j][1], coords[i][j][0])
				}
			}
		}

		this.roadObject[kind_detail].push(obj)	*/

		//const e = (new Date()).getTime();
		//console.log('addToRoadObject: ' + (e - s) + ' ms');

		return null;
	}

	createDispRoads() {

		//console.log(this.roads);

		this.tg.map.setDataInfo(
			'numHighwayLoading', 'set', this.roads.motorway.length + this.roads.trunk.length);
		this.tg.map.setDataInfo(
			'numPrimaryLoading', 'set', this.roads.primary.length);
		this.tg.map.setDataInfo(
			'numSecondaryLoading', 'set', this.roads.secondary.length);
		this.tg.map.setDataInfo(
			'numTertiaryLoading', 'set', this.roads.tertiary.length);
		this.tg.map.setDataInfo(
			'numResidentialLoading', 'set', this.roads.residential.length);

		const s = (new Date()).getTime();

		const t = (new Date()).getTime();
		this.tg.map.setDataInfo('numRoadLoading', 'increase');
		this.tg.map.setTime('roadLoading', 'end', t);
 		
	  for(let type of this.roadTypes) {
			for(let road of this.roads[type]) {

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
		
				/*

				const geoType = road.getGeometry().getType();
				let coords = road.getGeometry().getCoordinates();

				if (geoType === 'LineString') {

					//console.log(coords);

					
				} 
				else if (geoType === 'MultiLineString') {
					for(let j = 0; j < coords.length; j++) {
						for(let k = 0; k < coords[j].length; k++) {
							coords[j][k][1] = coords[j][k].node.disp.lng;
							coords[j][k][0]	= coords[j][k].node.disp.lat;
						}
					}
				}*/


		//for(var i = 0; i < this.roadTypes.length; i++) {
		//	this.dispRoads[this.roadTypes[i]] = []
		//}
		/*
		for(var kind in this.roadObject) {
			for(var i = 0; i < this.roadObject[kind].length; i++) {
				var geoType = this.roadObject[kind][i].geoType
				var coords = this.roadObject[kind][i].coordinates
				var obj = {'geoType':geoType, 'coordinates':new Array(coords.length)}

				if (geoType == 'LineString') {
					for(var j = 0; j < coords.length; j++) {
						obj.coordinates[j] = [coords[j].disp.lng, coords[j].disp.lat]
					}
				} 
				else if (geoType == 'MultiLineString') {
					for(var j = 0; j < coords.length; j++) {
						obj.coordinates[j] = new Array(coords[j].length)

						for(var k = 0; k < coords[j].length; k++) {
							obj.coordinates[j][k] 
								= [coords[j][k].disp.lng, coords[j][k].disp.lat]
						}
					}
				}
				this.dispRoads[kind].push(obj)
			}
		}
		*/

		this.addRoadLayer()
		//this.addRoadNodeLayer()

		const e = (new Date()).getTime();
		console.log('createDispRoads: ' + (e - s) + ' ms');

	}

	updateDispRoads() {

		for(let type of this.roadTypes) {
			for(let road of this.roads[type]) {

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

		/*
		const s = (new Date()).getTime();

		for(let kind in this.roadObject) {
			for(let i = 0; i < this.roadObject[kind].length; i++) {
				const geoType = this.roadObject[kind][i].geoType;
				const coords = this.roadObject[kind][i].coordinates;

				if (!this.dispRoads[kind][i]) {
					console.log('no this.dispRoads[kind][i]');
					console.log('i: ' + i);
					console.log(this.dispRoads[kind][i]);
					continue;
				}

				if (geoType === 'LineString') {
					for(let j = 0; j < coords.length; j++) {
						this.dispRoads[kind][i].coordinates[j] = 
								[coords[j].disp.lng, coords[j].disp.lat];
					}
				} 
				else if (geoType === 'MultiLineString') {
					for(let j = 0; j < coords.length; j++) {
						for(let k = 0; k < coords[j].length; k++) {
							this.dispRoads[kind][i].coordinates[j][k] =
									[coords[j][k].disp.lng, coords[j][k].disp.lat];
						}
					}
				}
			}
		}

		const e = (new Date()).getTime();
		console.log('updateDispRoads: ' + (e - s) + ' ms');
		*/
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

			for(let road of this.roads[type]) {
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
			this.olMap.addLayer(this.roadLayer[type])
	  }

		/*for(var kind in this.dispRoads) {
			const styleFunc = this.mapUtil.lineStyleFunc(
				this.tg.opt.color.road[kind], this.tg.opt.width.road[kind])

			for(var i = 0; i < this.dispRoads[kind].length; i++) {
				if (this.dispRoads[kind][i].geoType == 'LineString') {
					this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.LineString(this.dispRoads[kind][i].coordinates), styleFunc)
				}
				else if (this.dispRoads[kind][i].geoType == 'MultiLineString') {
					this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.MultiLineString(this.dispRoads[kind][i].coordinates), styleFunc)
				}
			}
			this.roadLayer[kind] = this.mapUtil.olVectorFromFeatures(arr)
			this.roadLayer[kind].setZIndex(this.tg.opt.z[kind]);
			this.setVisibleByCurrentZoom(tg.map.currentZoom);
			this.olMap.addLayer(this.roadLayer[kind])
		}*/

		const e = (new Date()).getTime();
		console.log('addRoadLayer: ' + (e - s) + ' ms');
	}

	setVisibleByCurrentZoom(currentZoom) {
  	for(let type of this.roadTypes) {
		  if (this.roadLayer[type])
				this.roadLayer[type].setVisible(true);
  	}

  	switch(currentZoom) {
  		case 11:
  		case 12: // when zoom = 11 or 12, no secondary, tertiary and residential.
				if (this.roadLayer.secondary)
					this.roadLayer.secondary.setVisible(false);
				// pass through
			case 13: // when zoom = 13, no tertiary and residential.
				if (this.roadLayer.tertiary)
					this.roadLayer.tertiary.setVisible(false);
				// pass through
  		case 14: // when zoom = 14, no residential.
	  		if (this.roadLayer.residential)
					this.roadLayer.residential.setVisible(false);
				break;
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
			for(let road of this.roads[type]) {
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

		/*for(let kind in this.roadObject) {
			for(let road of this.roadObject[kind]) {
				let coords = road.coordinates;
				let modified;

				if (road.geoType === 'LineString') {
					for(let j = 0; j < coords.length; j++) {
						modified = transform(coords[j].original.lat, coords[j].original.lng);
						coords[j][type].lat = modified.lat;
						coords[j][type].lng = modified.lng;
					}
				} 
				else if (road.geoType === 'MultiLineString') {
					for(let j = 0; j < coords.length; j++) {
						for(let k = 0; k < coords[j].length; k++) {
							modified = transform(coords[j][k].original.lat, coords[j][k].original.lng);
							coords[j][k][type].lat = modified.lat;
							coords[j][k][type].lng = modified.lng;
						}
					}
				}
			}
		}*/

		const e = (new Date()).getTime();
		console.log('calModifiedNodes: ' + (e - s) + ' ms');
	}

	calDispNodes(type, value) {

		const s = (new Date()).getTime();

	  for(let type of this.roadTypes) {
			for(let road of this.roads[type]) {

				if (road[0].node) { // LineString {
					if (type === 'intermediateReal') {
						for(let i = 0; i < road.length; i++) {
							road[i].node.disp.lat = 
								(1 - value) * road[i].node.original.lat + value * road[i].node.real.lat;
							road[i].node.disp.lng = 
								(1 - value) * road[i].node.original.lng + value * road[i].node.real.lng;
						}
					}
					else if (type === 'intermediateTarget') {
						for(let i = 0; i < road.length; i++) {
							road[i].node.disp.lat = 
								(1 - value) * road[i].node.original.lat + value * road[i].node.target.lat;
							road[i].node.disp.lng = 
								(1 - value) * road[i].node.original.lng + value * road[i].node.target.lng;
						}
					}
					else {
						for(let i = 0; i < road.length; j++) {
							road[i].node.disp.lat = road[i].node[type].lat;
							road[i].node.disp.lng = road[i].node[type].lng;
						}
					}
				} 
				else if (road[0][0].node) { // MultiLineString
					if (type === 'intermediateReal') {
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
					else if (type === 'intermediateTarget') {
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
								road[i][j].node.disp.lat = road[i][j].node[type].lat;
								road[i][j].node.disp.lng = road[i][j].node[type].lng;
							}
						}
					}
				}
			}
		}

		/*for(let kind in this.roadObject) {
			for(let road of this.roadObject[kind]) {
				let coords = road.coordinates;

				if (road.geoType === 'LineString') {
					if (type === 'intermediateReal') {
						for(let j = 0; j < coords.length; j++) {
							coords[j].disp.lat = 
								(1 - value) * coords[j].original.lat + value * coords[j].real.lat;
							coords[j].disp.lng = 
								(1 - value) * coords[j].original.lng + value * coords[j].real.lng;
						}
					}
					else if (type === 'intermediateTarget') {
						for(let j = 0; j < coords.length; j++) {
							coords[j].disp.lat = 
								(1 - value) * coords[j].original.lat + value * coords[j].target.lat;
							coords[j].disp.lng = 
								(1 - value) * coords[j].original.lng + value * coords[j].target.lng;
						}
					}
					else {
						for(let j = 0; j < coords.length; j++) {
							coords[j].disp.lat = coords[j][type].lat;
							coords[j].disp.lng = coords[j][type].lng;
						}
					}
				} 
				else if (road.geoType === 'MultiLineString') {
					if (type === 'intermediateReal') {
						for(let j = 0; j < coords.length; j++) {
							for(let k = 0; k < coords[j].length; k++) {
								coords[j][k].disp.lat = 
									(1 - value) * coords[j][k].original.lat + value * coords[j][k].real.lat;
								coords[j][k].disp.lng = 
									(1 - value) * coords[j][k].original.lng + value * coords[j][k].real.lng;
							}
						}
					}
					else if (type === 'intermediateTarget') {
						for(let j = 0; j < coords.length; j++) {
							for(let k = 0; k < coords[j].length; k++) {
								coords[j][k].disp.lat = 
									(1 - value) * coords[j][k].original.lat + value * coords[j][k].target.lat;
								coords[j][k].disp.lng = 
									(1 - value) * coords[j][k].original.lng + value * coords[j][k].target.lng;
							}
						}
					}
					else {
						for(let j = 0; j < coords.length; j++) {
							for(let k = 0; k < coords[j].length; k++) {
								coords[j][k].disp.lat = coords[j][k][type].lat;
								coords[j][k].disp.lng = coords[j][k][type].lng;
							}
						}
					}
				}
			}
		}*/

		const e = (new Date()).getTime();
		//console.log('calDispNodes: ' + (e - s) + ' ms');
	}

	addRoadNodeLayer() {

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


	}
}
