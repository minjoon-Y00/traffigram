class TGMapPlaces {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

	  this.placesZooms = [];
	  this.placesObjects = {};
		this.placesLayer = {};
  	this.timerGetPlacesData = null;

  	for(let zoom = tg.opt.minZoom; zoom <= tg.opt.maxZoom; zoom++) {
  		this.placesZooms.push(zoom);
  	}

	  for(let zoom of this.placesZooms) {
	  	this.placesLayer[zoom] = {};
  		this.placesObjects[zoom] = {};
  	}
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
						this.createDispPlaces.bind(this), 
						this.tg.opt.constant.timeToWaitForGettingData);

		const name = feature.get('name');
		const kind = feature.get('kind');
		let minZoom = feature.get('min_zoom');
		let maxZoom = feature.get('max_zoom');

		if (!minZoom) minZoom = tg.opt.minZoom;
		if (!maxZoom) maxZoom = tg.opt.maxZoom;
		if (minZoom < tg.opt.minZoom) minZoom = tg.opt.minZoom;
		if (maxZoom > tg.opt.maxZoom) maxZoom = tg.opt.maxZoom;

		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		const coords = feature.getGeometry().getCoordinates();

  	for(let zoom = minZoom; zoom <= maxZoom; zoom++) {
  		if (this.placesObjects[zoom][name]) return null;

  		//for(let i = 0; i < coords.length; i++) {
				//coords[i].node = new Node(coords[i][1], coords[i][0]);
  		//}
			coords.node = new Node(coords[1], coords[0]);

	  	this.placesObjects[zoom][name] = coords;
  	}

  	//this.placesObjects[zoom][name] = 
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

	createDispPlaces() {
		this.tg.map.setDataInfo('numPlaceLoading', 'increase');
		this.tg.map.setTime('placeLoading', 'end', (new Date()).getTime());

		this.updateDispPlaces();
		this.addPlacesLayer();
	}

	updateDispPlaces() {
		for(let zoom of this.placesZooms) {
			for(let name in this.placesObjects[zoom]) {
				const place = this.placesObjects[zoom][name];
				place[0] = place.node.disp.lng;
				place[1] = place.node.disp.lat;
			}
		}
	}



	addPlacesLayer() {
		let arr = [];

		for(let zoom of this.placesZooms) {
			this.mapUtil.removeLayer(this.placesLayer[zoom]);
		}

		for(let zoom of this.placesZooms) {
			for(let name in this.placesObjects[zoom]) {
				const place = this.placesObjects[zoom][name];
				const styleFunc = this.mapUtil.textStyleFunc(
						name, this.tg.opt.color.places, this.tg.opt.font.places);

				this.mapUtil.addFeatureInFeatures(
					arr, new ol.geom.Point(place), styleFunc);
			}

			this.placesLayer[zoom] = this.mapUtil.olVectorFromFeatures(arr);
			this.placesLayer[zoom].setZIndex(this.tg.opt.z.places);
			this.setVisibleByCurrentZoom(tg.map.currentZoom);
			this.olMap.addLayer(this.placesLayer[zoom]);
		}
	}

	removePlacesLayer() {
		for(let zoom of this.placesZooms) {
			this.mapUtil.removeLayer(this.placesLayer[zoom]);
		}
	}

	setVisibleByCurrentZoom(currentZoom) {
		for(let zoom of this.placesZooms) {
			if (Object.keys(this.placesLayer[zoom]).length > 0) {
				this.placesLayer[zoom].setVisible(false);
			}
		}
		if (Object.keys(this.placesLayer[currentZoom]).length > 0) {
			this.placesLayer[currentZoom].setVisible(true);
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

		for(let zoom of this.placesZooms) {
			for(let name in this.placesObjects[zoom]) {
				let place = this.placesObjects[zoom][name];
				const modified = transform(place.node.original.lat, place.node.original.lng);
				place.node[kind].lat = modified.lat;
				place.node[kind].lng = modified.lng;
			}
		}
	}

	calDispNodes(kind, value) {
		if (kind === 'intermediateReal') {
			for(let zoom of this.placesZooms) {
				for(let name in this.placesObjects[zoom]) {
					let place = this.placesObjects[zoom][name];
					place.node.disp.lat = 
						(1 - value) * place.node.original.lat + value * place.node.real.lat;
					place.node.disp.lng = 
						(1 - value) * place.node.original.lng + value * place.node.real.lng;
				}
			}
		}
		else if (kind === 'intermediateTarget') {
			for(let zoom of this.placesZooms) {
				for(let name in this.placesObjects[zoom]) {
					let place = this.placesObjects[zoom][name];
					place.node.disp.lat = 
						(1 - value) * place.node.original.lat + value * place.node.target.lat;
					place.node.disp.lng = 
						(1 - value) * place.node.original.lng + value * place.node.target.lng;
				}
			}
		}
		else {
			for(let zoom of this.placesZooms) {
				for(let name in this.placesObjects[zoom]) {
					let place = this.placesObjects[zoom][name];
					place.node.disp.lat = place.node[kind].lat;
					place.node.disp.lng = place.node[kind].lng;
				}
			}
		}
	}
}