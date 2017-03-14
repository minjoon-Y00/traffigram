class TGMapWater {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.waterObjects = [];
		this.newWaterObjects = {};
		this.dispWaterObjects = {};
		this.waterLayer = null;
		this.waterNodeLayer = null;
  	this.timerGetWaterData = null;
  	this.dispLayers = [];
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
						this.createDispWater.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingWaterData);

		const geoType = feature.getGeometry().getType();

		// ignores LineString, Point, ...
		if ((geoType == 'Polygon')||(geoType == 'MultiPolygon')) {

			const kind = feature.get('kind');

			// ignores dock, swimming_pool
			// so water, ocean, riverbank, and lake are considered.
			if ((kind === 'dock')||(kind === 'swimming_pool')) return null;

			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

			let coords = feature.getGeometry().getCoordinates();
			const lenCoords = coords.length;

			if (geoType === 'Polygon') {
				for(let i = 0; i < lenCoords; i++) {
					for(let j = 0; j < coords[i].length; j++) {
						coords[i][j].node = new Node(coords[i][j][1], coords[i][j][0]);
					}
				}
				this.waterObjects.push(coords);
				this.newWaterObjects.push(coords);
				this.dispWaterObjects.push(coords);
			}
			else if (geoType == 'MultiPolygon') {
				for(let i = 0; i < lenCoords; i++) {
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

	createDispWater() {
		this.tg.map.setDataInfo('numWaterLoading', 'increase');
		this.tg.map.setTime('waterLoading', 'end', (new Date()).getTime());

		this.updateDispWater();
		this.addWaterLayer();
		//this.addWaterNodeLayer();
	}

	updateDispWater() {
		for(let water of this.waterObjects) {
			if (water[0][0].node) { // Polygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						water[i][j][0] = water[i][j].node.disp.lng;
						water[i][j][1] = water[i][j].node.disp.lat;
					}
				}
			} 
			else if (water[0][0][0].node) { // MultiPolygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length; j++) {
						for(let k = 0; k < water[i][j].length; k++) {
							water[i][j][k][0] = water[i][j][k].node.disp.lng;
							water[i][j][k][1] = water[i][j][k].node.disp.lat;
						}
					}
				}
			}
			else {
				console.log('not known geotype in createDispRoas()');
			}
		}
	}

	//
	addWaterLayer() {
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.water);

		this.mapUtil.removeLayer(this.waterLayer);

		for(let water of this.waterObjects) {
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

		for(let water of this.waterObjects) {
			let modified;

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
		for(let water of this.waterObjects) {

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