class TGMapPlaces {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

	  this.placeObjects = {};
	  this.newPlaceObjects = {};
	  this.dispPlaceObjects = {};
		this.placeLayer = {};
  	this.timerGetPlacesData = null;
  	this.dispLayers = [];
	}

	start() {
		const source = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/places/{z}/{x}/{y}.topojson?' 
		    + 'api_key=vector-tiles-c1X4vZE',
		});

		this.olMap.addLayer(new ol.layer.VectorTile({
		  source: source,
		  style: this.addToPlacesObject.bind(this),
		}));
	}

	addToPlacesObject(feature, resolution) {
		if (this.timerGetPlacesData) clearTimeout(this.timerGetPlacesData);
		this.timerGetPlacesData = 
				setTimeout(
						this.processNewPlaceObjects.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingData);

		const name = feature.get('name');

		if (this.placeObjects[name]) return null;

		const kind = feature.get('kind');

		//let minZoom = feature.get('min_zoom');
		//let maxZoom = feature.get('max_zoom');
		//if (!minZoom) minZoom = tg.opt.minZoom;
		//if (!maxZoom) maxZoom = tg.opt.maxZoom;
		//if (minZoom < tg.opt.minZoom) minZoom = tg.opt.minZoom;
		//if (maxZoom > tg.opt.maxZoom) maxZoom = tg.opt.maxZoom;

		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		const coords = feature.getGeometry().getCoordinates();
		coords.minZoom = feature.get('min_zoom');
		coords.maxZoom = feature.get('max_zoom');
		coords.node = new Node(coords[1], coords[0]);

	  this.placeObjects[name] = coords;
	  this.newPlaceObjects[name] = coords;
	  this.dispPlaceObjects[name] = coords;

  	/*for(let zoom = minZoom; zoom <= maxZoom; zoom++) {
  		if (this.placeObjects[zoom][name]) return null;

  		//for(let i = 0; i < coords.length; i++) {
				//coords[i].node = new Node(coords[i][1], coords[i][0]);
  		//}
			coords.node = new Node(coords[1], coords[0]);

	  	this.placeObjects[zoom][name] = coords;
  	}*/

  	//this.placeObjects[zoom][name] = 
				//{kind: kind, minZoom: minZoom, maxZoom: maxZoom,
				//coordinates: new Node(coords[1], coords[0])};

		//const kind_detail = feature.get('kind_detail');
		//const currentZoom = tg.map.currentZoom;
		//console.log('kind: ' + kind + ' name: ' + name);
		//console.log('zoom [' + min_zoom + ', ' + max_zoom + '] detail: ' + kind_detail);

		//if ((current_zoom < min_zoom)||(current_zoom > max_zoom)) return null;

		// ignores dock, swimming_pool
		// so Landuse, ocean, riverbank, and lake are considered.
		//if ((kind == 'dock')||(kind == 'swimming_pool')) return null

		return null;
	}

	processNewPlaceObjects() {
		this.tg.map.setDataInfo('numPlaceLoading', 'increase');
		this.tg.map.setTime('placeLoading', 'end', (new Date()).getTime());

		this.addNewPlaceLayer();
		this.newPlaceObjects = [];
	}

	/*createDispPlaces() {
		this.updateDispPlaces();
		this.addPlaceLayer();
	}*/

	calDispPlace() {
		const currentZoom = this.tg.map.currentZoom;
		const opt = this.tg.opt;
		const top = opt.box.top;
		const bottom = opt.box.bottom;
		const right = opt.box.right;
		const left = opt.box.left;

		this.dispPlaceObjects = {};

		for(let name in this.placeObjects) {
			if (currentZoom < this.placeObjects[name].minZoom) {
				continue;
			}

			if (currentZoom > this.placeObjects[name].maxZoom) {
				continue;
			}

			const lat = this.placeObjects[name].node.original.lat;
			const lng = this.placeObjects[name].node.original.lng;

			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
				this.dispPlaceObjects[name] = this.placeObjects[name];
				break;
			}
		}
	}


	updateDispPlaces() {
		for(let name in this.dispPlaceObjects) {
			const place = this.dispPlaceObjects[name];
			place[0] = place.node.disp.lng;
			place[1] = place.node.disp.lat;
		}
	}


	addNewPlaceLayer() {
		let arr = [];

		for(let name in this.newPlaceObjects) {
			const place = this.newPlaceObjects[name];
			const styleFunc = this.mapUtil.textStyleFunc(
					name, this.tg.opt.color.places, this.tg.opt.font.places);

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point(place), styleFunc);
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(this.tg.opt.z.places);
		this.olMap.addLayer(layer);
		this.dispLayers.push(layer);

		console.log('+ new place layer: ' + arr.length);
	}

	addPlaceLayer() {
		let arr = [];

		this.mapUtil.removeLayer(this.placeLayer);

		for(let name in this.dispPlaceObjects) {
			const place = this.dispPlaceObjects[name];
			const styleFunc = this.mapUtil.textStyleFunc(
					name, this.tg.opt.color.places, this.tg.opt.font.places);

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point(place), styleFunc);
		}

		this.placeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.placeLayer.setZIndex(this.tg.opt.z.places);
		this.olMap.addLayer(this.placeLayer);
		this.dispLayers.push(this.placeLayer);
	}

	clearLayers() {
		for(let layer of this.dispLayers) {
			this.mapUtil.removeLayer(layer);
		}
	}

	removePlaceLayer() {
		for(let zoom of this.placesZooms) {
			this.mapUtil.removeLayer(this.placeLayer[zoom]);
		}
	}

	/*setVisibleByCurrentZoom(currentZoom) {
		for(let zoom of this.placesZooms) {
			if (Object.keys(this.placeLayer[zoom]).length > 0) {
				this.placeLayer[zoom].setVisible(false);
			}
		}
		if (Object.keys(this.placeLayer[currentZoom]).length > 0) {
			this.placeLayer[currentZoom].setVisible(true);
		}
	}*/

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

		for(let name in this.dispPlaceObjects) {
			let place = this.dispPlaceObjects[name];
			const modified = transform(place.node.original.lat, place.node.original.lng);
			place.node[kind].lat = modified.lat;
			place.node[kind].lng = modified.lng;
		}
	}

	calDispNodes(kind, value) {
		if (kind === 'intermediateReal') {
			for(let name in this.dispPlaceObjects) {
				let place = this.dispPlaceObjects[name];
				place.node.disp.lat = 
					(1 - value) * place.node.original.lat + value * place.node.real.lat;
				place.node.disp.lng = 
					(1 - value) * place.node.original.lng + value * place.node.real.lng;
			}
		}
		else if (kind === 'intermediateTarget') {
			for(let name in this.dispPlaceObjects) {
				let place = this.dispPlaceObjects[name];
				place.node.disp.lat = 
					(1 - value) * place.node.original.lat + value * place.node.target.lat;
				place.node.disp.lng = 
					(1 - value) * place.node.original.lng + value * place.node.target.lng;
			}
		}
		else {
			for(let name in this.dispPlaceObjects) {
				let place = this.dispPlaceObjects[name];
				place.node.disp.lat = place.node[kind].lat;
				place.node.disp.lng = place.node[kind].lng;
			}
		}
	}
}