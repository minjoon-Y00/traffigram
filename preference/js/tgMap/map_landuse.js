class TGMapLanduse {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.landuseLayer = null;
	  this.landuseObject = [];
	  this.dispLanduse;
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

		//console.log('kind: ' + kind + ' type: ' + geoType + ' name: ' + name);

		// ignores dock, swimming_pool
		// so Landuse, ocean, riverbank, and lake are considered.
		//if ((kind == 'dock')||(kind == 'swimming_pool')) return null

		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		
		const coords = feature.getGeometry().getCoordinates();
		const lenCoords = coords.length;
		let obj = {'geoType': geoType, 'kind': kind, 
			'coordinates': new Array(lenCoords), 'visible': true};
		if (name) obj.name = name;

		if (geoType == 'Polygon') {
			for(let i = 0; i < lenCoords; i++) {
				obj.coordinates[i] = new Array(coords[i].length)
				for(let j = 0; j < coords[i].length; j++) {
					obj.coordinates[i][j] = new Node(coords[i][j][1], coords[i][j][0])
				}
			}
		}
		this.landuseObject.push(obj);			

		return null;
	}

	createDispLanduse() {
		const t = (new Date()).getTime();
		this.tg.map.setDataInfo('numLanduseLoading', 'increase');
		this.tg.map.setTime('landuseLoading', 'end', t);

		this.dispLanduse = [];

		for(let i = 0; i < this.landuseObject.length; i++) {
			const geoType = this.landuseObject[i].geoType;
			const coords = this.landuseObject[i].coordinates;
			let obj = {'geoType':geoType, 'coordinates':new Array(coords.length)};

			if (geoType === 'Polygon') {
				for(let j = 0; j < coords.length; j++) {
					obj.coordinates[j] = new Array(coords[j].length);

					for(let k = 0; k < coords[j].length; k++) {
						obj.coordinates[j][k] 
								= [coords[j][k].disp.lng, coords[j][k].disp.lat];
					}
				}
			} 
			this.dispLanduse.push(obj);
		}

		//console.log('# landuseObject : ' +  this.landuseObject.length)
		//console.log('# of dispLanduse : ' + this.dispLanduse.length)
		//console.log(this.tg.data.localLanduse)
		//console.log(this.dispLanduse)

		this.addLanduseLayer();
	}

	updateDispLanduse() {
		for(let i = 0; i < this.landuseObject.length; i++) {
			const geoType = this.landuseObject[i].geoType;
			const coords = this.landuseObject[i].coordinates;

			if (geoType === 'Polygon') {
				for(let j = 0; j < coords.length; j++) {
					for(let k = 0; k < coords[j].length; k++) {

						if (!this.dispLanduse[i]) {
							console.log('no this.dispLanduse[i]');
							console.log('i: ' + i);
							console.log(this.dispLanduse[i]);
							continue;
						}

						this.dispLanduse[i].coordinates[j][k] 
								= [coords[j][k].disp.lng, coords[j][k].disp.lat];
					}
				}
			} 
		}
	}

	addLanduseLayer() {
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.landuse);

		this.mapUtil.removeLayer(this.landuseLayer);

		for(let landuse of this.dispLanduse) {
			if (landuse.geoType == 'Polygon') {
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Polygon(landuse.coordinates), styleFunc);
			}
		}

		this.landuseLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.landuseLayer.setZIndex(this.tg.opt.z.landuse);
		this.olMap.addLayer(this.landuseLayer)
	}

	removeLanduseLayer() {
		this.mapUtil.removeLayer(this.landuseLayer);
	}

	calRealNodes() {
		this.calModifiedNodes('real');
	}

	calTargetNodes() {
		this.calModifiedNodes('target');
	}

	calModifiedNodes(type) {
		let transformFuncName;
		if (type === 'real') transformFuncName = 'transformReal';
		else if (type === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.tg.graph[transformFuncName].bind(this.tg.graph);

		for(let landuse of this.landuseObject) {
			let coords = landuse.coordinates;
			let modified;

			if (landuse.geoType === 'Polygon') {
				for(let j = 0; j < coords.length; j++) {
					for(let k = 0; k < coords[j].length; k++) {
						modified = transform(coords[j][k].original.lat, coords[j][k].original.lng);
						coords[j][k][type].lat = modified.lat;
						coords[j][k][type].lng = modified.lng;
					}
				}
			}
		}
	}

	calDispNodes(type, value) {
		for(let landuse of this.landuseObject) {
			let coords = landuse.coordinates;

			if (landuse.geoType === 'Polygon') {
				if (type === 'intermediateReal') {
					for(let j = 0; j < coords.length; j++) {
						for(let k = 0; k < coords[j].length; k++) {
							coords[j][k].disp.lat = 
								(1 - value) * coords[j][k].original.lat 
								+ value * coords[j][k].real.lat;
							coords[j][k].disp.lng = 
								(1 - value) * coords[j][k].original.lng 
								+ value * coords[j][k].real.lng;
						}
					}
				}
				else if (type === 'intermediateTarget') {
					for(let j = 0; j < coords.length; j++) {
						for(let k = 0; k < coords[j].length; k++) {
							coords[j][k].disp.lat = 
								(1 - value) * coords[j][k].original.lat 
								+ value * coords[j][k].target.lat;
							coords[j][k].disp.lng = 
								(1 - value) * coords[j][k].original.lng 
								+ value * coords[j][k].target.lng;
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
	}

}