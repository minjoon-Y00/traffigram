class TGMapWater {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.waterObjects = [];
		this.newWaterObjects = [];
		this.dispWaterObjects = [];
		this.waterLayer = null;
		this.waterNodeLayer = null;
  	this.timerGetWaterData = null;
  	this.timerFinishGettingWaterData = null;
  	this.dispLayers = [];
  	this.rdpThreshold = this.tg.opt.constant.rdpThreshold.water;

  	this.timeInterval = 0;
  	this.timeIntervalArray = [];
	}

	start() {
		const waterSource = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/water/{z}/{x}/{y}.topojson?' 
		    + 'api_key=vector-tiles-c1X4vZE'
		})

		this.olMap.addLayer(new ol.layer.VectorTile({
		  source: waterSource,
		  style: this.addToWaterObject.bind(this)
		}))
	}

	addToWaterObject(feature, resolution) {
		if (this.timerGetWaterData) clearTimeout(this.timerGetWaterData);
		this.timerGetWaterData = 
				setTimeout(
						this.processNewWaterObjects.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingWaterData);

		if (this.tg.map.timerCheckGridSplitInTgMap) {
			clearTimeout(this.tg.map.timerCheckGridSplitInTgMap);
		}

		const geoType = feature.getGeometry().getType();

		// ignores LineString, Point, ...
		if ((geoType == 'Polygon')||(geoType == 'MultiPolygon')) {

			const kind = feature.get('kind');

			// ignores dock, swimming_pool
			// so water, ocean, riverbank, and lake are considered.
			if ((kind === 'dock')||(kind === 'swimming_pool')) return null;

			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

			let coords = feature.getGeometry().getCoordinates();
			coords.minZoom = feature.get('min_zoom');
			

			//console.log(coords.minZoom + ' : ' + kind);

			//const lenCoords = coords.length;

			if (geoType === 'Polygon') {

				if (this.tg.map.simplify) {
					coords = this.tg.util.RDPSimp2DLoop(coords, this.rdpThreshold);
				}

				for(let i = 0; i < coords.length; i++) {
					for(let j = 0; j < coords[i].length; j++) {
						coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
					}
				}
				
				this.waterObjects.push(coords);
				this.newWaterObjects.push(coords);
				this.dispWaterObjects.push(coords);
			}
			else if (geoType == 'MultiPolygon') {

				if (this.tg.map.simplify) {
					coords = this.tg.util.RDPSimp3DLoop(coords, this.rdpThreshold);
				}

				for(let i = 0; i < coords.length; i++) {
					for(let j = 0; j < coords[i].length; j++) {
						for(let k = 0; k < coords[i][j].length; k++) {
							coords[i][j][k].node = new Node(coords[i][j][k][1], coords[i][j][k][0]);
						}
					}
				}

				this.waterObjects.push(coords);
				this.newWaterObjects.push(coords);
				this.dispWaterObjects.push(coords);
			}			
		}
		return null;
	}

	processNewWaterObjects() {
		if (this.timerFinishGettingWaterData) {
			clearTimeout(this.timerFinishGettingWaterData);
		}
		this.timerFinishGettingWaterData = 
				setTimeout(
						this.finishGettingWaterObjects.bind(this), 
						this.tg.opt.constant.timeToWaitForFinishGettingWaterData);

		this.tg.map.setDataInfo('numWaterLoading', 'increase');
		this.tg.map.setTime('waterLoading', 'end', (new Date()).getTime());

		this.addNewWaterLayer();
		this.newWaterObjects = [];

		const cur = (new Date()).getTime();
		if (this.timeInterval !== 0) {
			const dif = (cur - this.timeInterval);
			this.timeIntervalArray.push(dif)
			//console.log('### elapsed: ' + dif + ' ms');
		}
		this.timeInterval = cur;

	}

	/*createDispWater() {
		this.updateDispWater();
		this.addWaterLayer();
		//this.addWaterNodeLayer();
	}*/



	calDispWater() {
		const currentZoom = this.tg.map.currentZoom;
		const opt = this.tg.opt;
		const top = opt.box.top;
		const bottom = opt.box.bottom;
		const right = opt.box.right;
		const left = opt.box.left;

		this.dispWaterObjects = [];

		for(let water of this.waterObjects) {
			if (currentZoom < water.minZoom) {
				continue;
			}
			
			let isIn = false;
			if (water[0].length === 0) continue;

			if (water[0][0].node) { // Polygon
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
			else if (water[0][0][0].node) { // MultiPolygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						for(let k = 0; k < water[i][j].length; k++) {
							const lat = water[i][j][k].node.original.lat;
							const lng = water[i][j][k].node.original.lng;
							if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
								this.dispWaterObjects.push(water);
								isIn = true;
								break;
							}
						}
						if (isIn) break;
					}
					if (isIn) break;
				}
			}
		}

		console.log('/# of water : ' + this.waterObjects.length);
		console.log('/# of disp water: ' + this.dispWaterObjects.length);
	}

	updateDispWater() {
		for(let water of this.dispWaterObjects) {
			if (water[0].length === 0) continue;

			if (water[0][0].node) { // Polygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						water[i][j][0] = water[i][j].node.disp.lng;
						water[i][j][1]	= water[i][j].node.disp.lat;
					}
				}
			}
			else if (water[0][0][0].node) { // MultiPolygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						for(let k = 0; k < water[i][j].length; k++) {
							water[i][j][k][0] = water[i][j][k].node.disp.lng;
							water[i][j][k][1]	= water[i][j][k].node.disp.lat;
						}
					}
				}
			}
			else {
				console.log('not known geotype in createDispRoas()');
			}
		}
	}

	addNewWaterLayer() {
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.water);

		for(let water of this.newWaterObjects) {

			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;


			if (water[0][0].node) { // Polygon
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Polygon(water), styleFunc);
			}
			else if (water[0][0][0].node) { // MultiPolygon
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.MultiPolygon(water), styleFunc);
			}
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(this.tg.opt.z.water);
		this.olMap.addLayer(layer);
		this.dispLayers.push(layer);
		
		console.log('+ new water layer: ' + arr.length);
		if (this.tg.map.dispWaterNodeLayer) this.addNewWaterNodeLayer();
	}

	//
	addWaterLayer() {
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.water);

		this.mapUtil.removeLayer(this.waterLayer);

		for(let water of this.dispWaterObjects) {
			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Polygon(water), styleFunc);
			}
			else if (water[0][0][0].node) { // MultiPolygon
				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.MultiPolygon(water), styleFunc);
			}
		}

		this.waterLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.waterLayer.setZIndex(this.tg.opt.z.water);
		this.olMap.addLayer(this.waterLayer);
		this.dispLayers.push(this.waterLayer);

		console.log('+ water layer: ' + arr.length);
		if (this.tg.map.dispWaterNodeLayer) this.addWaterNodeLayer();
	}

	removeWaterLayer() {
		this.mapUtil.removeLayer(this.waterLayer);
	}

	clearLayers() {
		for(let layer of this.dispLayers) {
			this.mapUtil.removeLayer(layer);
		}
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

		for(let water of this.dispWaterObjects) {
			let modified;

			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						modified = 
							transform(water[i][j].node.original.lat, water[i][j].node.original.lng);
						water[i][j].node[kind].lat = modified.lat;
						water[i][j].node[kind].lng = modified.lng;
					}
				}
			}
			else if (water[0][0][0].node) { // MultiPolygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						for(let k = 0; k < water[i][j].length; k++) {
							modified = transform(
									water[i][j][k].node.original.lat, water[i][j][k].node.original.lng);
							water[i][j][k].node[kind].lat = modified.lat;
							water[i][j][k].node[kind].lng = modified.lng;
						}
					}
				}
			}
		}
	}

	calDispNodes(kind, value) {

		for(let water of this.dispWaterObjects) {

			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
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
			else if (water[0][0][0].node) { // MultiPolygon
				if (kind === 'intermediateReal') {
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							for(let k = 0; k < water[i][j].length; k++) {
								water[i][j][k].node.disp.lat = 
									(1 - value) * water[i][j][k].node.original.lat +
									value * water[i][j][k].node.real.lat;
								water[i][j][k].node.disp.lng = 
									(1 - value) * water[i][j][k].node.original.lng + 
									value * water[i][j][k].node.real.lng;
							}
						}
					}
				}
				else if (kind === 'intermediateTarget') {
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							for(let k = 0; k < water[i][j].length; k++) {
								water[i][j][k].node.disp.lat = 
									(1 - value) * water[i][j][k].node.original.lat +
									value * water[i][j][k].node.target.lat;
								water[i][j][k].node.disp.lng = 
									(1 - value) * water[i][j][k].node.original.lng + 
									value * water[i][j][k].node.target.lng;
							}
						}
					}
				}
				else {
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							for(let k = 0; k < water[i][j].length; k++) {
								water[i][j][k].node.disp.lat = water[i][j][k].node[kind].lat;
								water[i][j][k].node.disp.lng = water[i][j][k].node[kind].lng;
							}
						}
					}
				}
			}
		}
	}

	checkPointsInWater(points) {

		const s = (new Date()).getTime();

		const centerPoint = this.tg.map.centerPosition;
		for(let point of points) {
			this.isPointInWater(centerPoint, point);
		}

		const e = (new Date()).getTime();
		console.log('checkPointsInWater: ' + (e - s) + ' ms');
	}

	isPointInWater(centerPoint, point) {

		let countIntersection = 0;
		for(let water of this.dispWaterObjects) {
			
			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length - 1; j++) {

						if (this.tg.util.intersects(
							centerPoint.lat, centerPoint.lng, 
							point.original.lat, point.original.lng, 
		        	water[i][j][1], water[i][j][0], 
		        	water[i][j + 1][1], water[i][j + 1][0])) {
							countIntersection++;
						}
					}
				}
			}
			else if (water[0][0][0].node) { // MultiPolygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						for(let k = 0; k < water[i][j].length - 1; k++) {

							if (this.tg.util.intersects(
								centerPoint.lat, centerPoint.lng, 
								point.original.lat, point.original.lng, 
			        	water[i][j][k][1], water[i][j][k][0], 
			        	water[i][j][k + 1][1], water[i][j][k + 1][0])) {
								countIntersection++;
							}
						}
					}
				}
			}
		}

		if ((countIntersection % 2) === 1) {
			point.travelTime = null;
			console.log('i: ' + point.index + ' #: ' + countIntersection);
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
			else if (water[0][0][0].node) { // MultiPolygon
				for(let water2 of water) {
					for(let water3 of water2) {
						count += water3.length;
					}
				}
			}
		}
		return count;
	}

	finishGettingWaterObjects() {

		let sum = 0;
		for(let time of this.timeIntervalArray) sum += time;
		console.log('################ FIN.');
		console.log('AVG: ' + (sum / this.timeIntervalArray.length));
		this.timeInterval = 0;
		this.timeIntervalArray = [];

		this.tg.map.calSplittedGrid();
	}

	addNewWaterNodeLayer() {
		let arr = [];
		const edgeStyleFunc = 
			this.mapUtil.lineStyleFunc(this.tg.opt.color.edge, this.tg.opt.width.edge);
		const nodeStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.waterNode, this.tg.opt.radius.node);

		for(let water of this.newWaterObjects) {
			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
				for(let nodes of water) {
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
			else if (water[0][0][0].node) { // MultiPolygon
				for(let water2 of water) {
					for(let nodes of water2) {
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
		layer.setZIndex(this.tg.opt.z.waterNode);
		this.olMap.addLayer(layer);
		this.dispLayers.push(layer);
	}

	addWaterNodeLayer() {

		this.mapUtil.removeLayer(this.waterNodeLayer);

		let arr = [];
		const edgeStyleFunc = 
			this.mapUtil.lineStyleFunc(this.tg.opt.color.edge, this.tg.opt.width.edge);
		const nodeStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.waterNode, this.tg.opt.radius.node);

		for(let water of this.dispWaterObjects) {
			if ((water[0].length === 0)||(water[0][0].length === 0)) continue;

			if (water[0][0].node) { // Polygon
				for(let nodes of water) {
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
			else if (water[0][0][0].node) { // MultiPolygon
				for(let water2 of water) {
					for(let nodes of water2) {
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
		this.waterNodeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.waterNodeLayer.setZIndex(this.tg.opt.z.waterNode);
		this.olMap.addLayer(this.waterNodeLayer);
		this.dispLayers.push(this.waterNodeLayer);
	}

	removeWaterNodeLayer() {
		this.mapUtil.removeLayer(this.waterNodeLayer);
	}




	/*isPointInWater(point) {

		const s = (new Date()).getTime();

		const centerPoint = this.tg.map.centerPosition;

		for(let point of this.tg.map.tgControl.controlPoints) {


			let countIntersection = 0;
			for(let water of this.dispWaterObjects) {

				if (water[0][0].node) { // Polygon
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length - 1; j++) {

							if (this.tg.util.intersects(
								centerPoint.lat, centerPoint.lng, 
								point.original.lat, point.original.lng, 
			        	water[i][j][1], water[i][j][0], 
			        	water[i][j + 1][1], water[i][j + 1][0])) {
								countIntersection++;
							}
						}
					}
				}
				else if (water[0][0][0].node) { // MultiPolygon
					for(let i = 0; i < water.length; i++) {
						for(let j = 0; j < water[i].length; j++) {
							for(let k = 0; k < water[i][j].length - 1; k++) {

								if (this.tg.util.intersects(
									centerPoint.lat, centerPoint.lng, 
									point.original.lat, point.original.lng, 
				        	water[i][j][k][1], water[i][j][k][0], 
				        	water[i][j][k + 1][1], water[i][j][k + 1][0])) {
									countIntersection++;
								}
							}
						}
					}
				}
			}
			console.log('i: ' + point.index + ' #: ' + countIntersection);
		}


		const e = (new Date()).getTime();
		console.log('time: ' + (e - s) + ' ms');

		
	}*/



	/*addWaterNodeLayer() {

		if (this.waterNodeLayer) 
			this.olMap.removeLayer(this.waterNodeLayer)

		var arr = []
		var clrMinor = '#333'
		var clrMajor = '#F33'
		var radiusMinor = 1
		var radiusMajor = 2
		var eps = 0.0001

		var originalNodeCount = 0


		for(var i = 0; i < this.waterObject.length; i++) {
			var geoType = this.waterObject[i].geoType

			if (geoType == 'Polygon') {
				for(var j = 0; j < this.waterObject[i].coordinates.length; j++) {
					originalNodeCount += this.waterObject[i].coordinates[j].length

					var nodes = this.waterObject[i].coordinates[j]
					var pivot = nodes[0]
					var max = -987654321
					var maxK = 0
					for(var k = 1; k < nodes.length; k++) {
						var d = tg.util.D2_s(nodes[0].original.lat, nodes[0].original.lng, 
							nodes[k].original.lat, nodes[k].original.lng)
						if (d > max) {
							max = d
							maxK = k
						}
					}

					var arr1 = this.waterObject[i].coordinates[j].slice(0, maxK + 1)
					var arr2 = this.waterObject[i].coordinates[j].slice(maxK, nodes.length)

					var simple_arr1 = this.tg.util.RDPSimp(arr1, eps)
					var simple_arr2 = this.tg.util.RDPSimp(arr2, eps)
					simple_arr1.pop()
					//this.waterObject[i].coordinates[j] = simple_arr1.concat(simple_arr2)


					//console.log('maxK = ' + maxK + ' , len = ' + nodes.length) // 42, 63
					//console.log(this.waterObject[i].coordinates[j])
					//break

					this.olFeaturesFromPoints(arr, 
						this.waterObject[i].coordinates[j][0].original.lng, 
						this.waterObject[i].coordinates[j][0].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					this.olFeaturesFromPoints(arr, 
						this.waterObject[i].coordinates[j][this.waterObject[i].coordinates[j].length - 1].original.lng, 
						this.waterObject[i].coordinates[j][this.waterObject[i].coordinates[j].length - 1].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					for(var k = 1; k < this.waterObject[i].coordinates[j].length - 1; k++) {
						this.olFeaturesFromPoints(arr, 
							this.waterObject[i].coordinates[j][k].original.lng, 
							this.waterObject[i].coordinates[j][k].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))
					}
				}
			} 
			else if (geoType == 'MultiPolygon') {
				for(var j = 0; j < this.waterObject[i].coordinates.length; j++) {
					for(var k = 0; k < this.waterObject[i].coordinates[j].length; k++) {
						originalNodeCount += this.waterObject[i].coordinates[j][k].length

						this.waterObject[i].coordinates[j][k] 
							= this.tg.util.RDPSimp(this.waterObject[i].coordinates[j][k], eps)

						this.olFeaturesFromPoints(arr, 
							this.waterObject[i].coordinates[j][k][0].original.lng, 
							this.waterObject[i].coordinates[j][k][0].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

						this.olFeaturesFromPoints(arr, 
							this.waterObject[i].coordinates[j][k][this.waterObject[i].coordinates[j][k].length - 1].original.lng, 
							this.waterObject[i].coordinates[j][k][this.waterObject[i].coordinates[j][k].length - 1].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))


						for(var l = 1; l < this.waterObject[i].coordinates[j][k].length - 1; l++) {
							this.olFeaturesFromPoints(arr, 
								this.waterObject[i].coordinates[j][k][l].original.lng, 
								this.waterObject[i].coordinates[j][k][l].original.lat, 
								this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))
						}
					}
				}
			}
		}

		console.log('# of original node: ' + originalNodeCount)
		console.log('# of waterNode : ' + arr.length)

		this.waterNodeLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
		    features: arr
			})
		})

		this.waterNodeLayer.setZIndex(1) // z-index of water node is 1
		this.olMap.addLayer(this.waterNodeLayer)

	}*/

}