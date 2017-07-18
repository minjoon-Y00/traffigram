const TgNode = require('../node/tg_node');

class TgMapPlaces {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

	  this.placeObjects = {};
	  this.newPlaceObjects = {};
	  this.dispPlaceObjects = {};
		this.placeLayer = {};
  	this.timerGetPlacesData = null;
  	this.dispLayers = [];

  	this.minZoomOfPlaces = 100;
  	this.maxZoomOfPlaces = 0;
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

	init() {
		const source = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/places/{z}/{x}/{y}.topojson?' 
		    + 'api_key=vector-tiles-c1X4vZE',
		});

		this.mapUtil.addLayer(new ol.layer.VectorTile({
		  source: source,
		  style: this.addToPlacesObject.bind(this),
		}));
	}

	addToPlacesObject(feature, resolution) {
		if (this.timerGetPlacesData) clearTimeout(this.timerGetPlacesData);
		this.timerGetPlacesData = 
				setTimeout(
						this.processNewPlaceObjects.bind(this), 
						this.data.time.waitForGettingData);

		const name = feature.get('name').toUpperCase();

		// if there is the same place, skip it.
		if (this.placeObjects[name]) return null;

		const kind = feature.get('kind');

		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		const coords = feature.getGeometry().getCoordinates();
		coords.minZoom = feature.get('min_zoom');
		coords.maxZoom = feature.get('max_zoom');
		coords.node = new TgNode(coords[1], coords[0]);

		if (coords.minZoom < this.minZoomOfPlaces) this.minZoomOfPlaces = coords.minZoom;
		if (coords.maxZoom > this.maxZoomOfPlaces) this.maxZoomOfPlaces = coords.maxZoom;


	  this.placeObjects[name] = coords;
	  this.newPlaceObjects[name] = coords;
	  //this.dispPlaceObjects[name] = coords;

  	/*for(let zoom = minZoom; zoom <= maxZoom; zoom++) {
  		if (this.placeObjects[zoom][name]) return null;

  		//for(let i = 0; i < coords.length; i++) {
				//coords[i].node = new TgNode(coords[i][1], coords[i][0]);
  		//}
			coords.node = new TgNode(coords[1], coords[0]);

	  	this.placeObjects[zoom][name] = coords;
  	}*/

  	//this.placeObjects[zoom][name] = 
				//{kind: kind, minZoom: minZoom, maxZoom: maxZoom,
				//coordinates: new TgNode(coords[1], coords[0])};

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

		console.log('p');

		if (this.map.currentMode === 'EM') {

			if (this.data.var.readyLocation) {

				this.map.tgBB.getNonOverlappedPlaces(this.newPlaceObjects);



				this.addNewLayer();
				this.newPlaceObjects = [];
				this.data.var.placeProcessed = true;

				console.log('o loc ready and add new layer');
			} else {
				console.log('x loc is not ready so wait');
			}
		}
	}

	calDispPlace() {
		const currentZoom = this.data.zoom.current;
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;

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

	addNewLayer() {
		const viz = this.data.viz;
		let arr = [];

		for(let name in this.newPlaceObjects) {
			const place = this.newPlaceObjects[name];
			const styleFunc = this.mapUtil.textStyle({
					text: name, 
					color: viz.color.textPlace, 
					strokeColor: viz.color.textPlaceStroke,
					strokeWidth: viz.width.textPlaceStroke,
					font: viz.font.places,
				});

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point(place), styleFunc);
		}

		const layer = this.mapUtil.olVectorFromFeatures(arr);
		layer.setZIndex(viz.z.places);
		this.mapUtil.addLayer(layer);
		this.dispLayers.push(layer);

		console.log('+ new place layer: ' + arr.length);
	}

	updateLayer() {
		const viz = this.data.viz;
		let arr = [];

		this.clearLayers();
		this.updateDispPlaces();

		for(let name in this.dispPlaceObjects) {
			const place = this.dispPlaceObjects[name];
			const styleFunc = this.mapUtil.textStyle({
					text: name, 
					color: viz.color.textPlace, 
					strokeColor: viz.color.textPlaceStroke,
					strokeWidth: viz.width.textPlaceStroke,
					font: viz.font.places,
				});

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point(place), styleFunc);
		}

		this.placeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.placeLayer.setZIndex(viz.z.places);
		this.mapUtil.addLayer(this.placeLayer);
		this.dispLayers.push(this.placeLayer);
	}

	removeLayer() {
		for(let zoom of this.placesZooms) {
			this.mapUtil.removeLayer(this.placeLayer[zoom]);
		}
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
		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.graph[transformFuncName].bind(this.graph);

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

module.exports = TgMapPlaces;