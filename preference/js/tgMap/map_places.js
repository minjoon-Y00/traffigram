class TGMapPlaces {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.placesLayer = {};
	  this.placesObject = {};
	  this.placesZooms = [];
	  this.dispPlaces = {};
  	this.timerGetPlacesData = null;

  	for(let zoom = tg.opt.minZoom; zoom <= tg.opt.maxZoom; zoom++) {
  		this.placesZooms.push(zoom);
  	}

	  for(let zoom of this.placesZooms) {
	  	this.placesLayer[zoom] = {};
  		this.placesObject[zoom] = {};
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

		//source.on('tileloadstart', function(){
			//console.log('@@@@@@ tileloadstart');
		//});

		//source.on('tileloadend', function(){
			//console.log('@@@@@@ tileloadend');
		//});
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
  		if (this.placesObject[zoom][name]) return null;

  		this.placesObject[zoom][name] = 
					{kind: kind, minZoom: minZoom, maxZoom: maxZoom,
					coordinates: new Node(coords[1], coords[0])};
  	}

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
		const t = (new Date()).getTime();
		this.tg.map.setDataInfo('numPlaceLoading', 'increase');
		this.tg.map.setTime('placeLoading', 'end', t);

		for(let zoom of this.placesZooms) {
	  	this.dispPlaces[zoom] = [];
  	}

		for(let zoom of this.placesZooms) {
			for(let name in this.placesObject[zoom]) {
				this.dispPlaces[zoom].push(
						{name: name, 
						coordinates: [this.placesObject[zoom][name].coordinates.disp.lng, 
								this.placesObject[zoom][name].coordinates.disp.lat]});
			}
		}

		//console.log(this.placesObject);
		//console.log(this.dispPlaces);

		this.addPlacesLayer();
	}

	updateDispPlaces() {
		for(let zoom of this.placesZooms) {
			let index = 0;
			for(let name in this.placesObject[zoom]) {

				if (!this.dispPlaces[zoom][index]) {
					console.log('no this.dispPlaces[zoom][index]');
					console.log('index: ' + index);
					console.log(this.dispPlaces[zoom][index]);
					continue;
				}

				this.dispPlaces[zoom][index].coordinates = 
						[this.placesObject[zoom][name].coordinates.disp.lng, 
								this.placesObject[zoom][name].coordinates.disp.lat];
				index++;
			}
		}
	}



	addPlacesLayer() {
		let arr = [];

		for(let zoom of this.placesZooms) {
			this.mapUtil.removeLayer(this.placesLayer[zoom]);
		}

		for(let zoom of this.placesZooms) {
			for(let place of this.dispPlaces[zoom]) {
				const styleFunc = this.mapUtil.textStyleFunc(
						place.name, this.tg.opt.color.places, this.tg.opt.font.places);

				this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.Point(place.coordinates), styleFunc);
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

	calModifiedNodes(type) {
		let transformFuncName;
		if (type === 'real') transformFuncName = 'transformReal';
		else if (type === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.tg.graph[transformFuncName].bind(this.tg.graph);

		for(let zoom of this.placesZooms) {
			for(let name in this.placesObject[zoom]) {
				let coords = this.placesObject[zoom][name].coordinates;
				const modified = transform(coords.original.lat, coords.original.lng);
				coords[type].lat = modified.lat;
				coords[type].lng = modified.lng;
			}
		}
	}

	calDispNodes(type, value) {
		if (type === 'intermediateReal') {
			for(let zoom of this.placesZooms) {
				for(let name in this.placesObject[zoom]) {
					let coords = this.placesObject[zoom][name].coordinates;
					coords.disp.lat = 
						(1 - value) * coords.original.lat + value * coords.real.lat;
					coords.disp.lng = 
						(1 - value) * coords.original.lng + value * coords.real.lng;
				}
			}
		}
		else if (type === 'intermediateTarget') {
			for(let zoom of this.placesZooms) {
				for(let name in this.placesObject[zoom]) {
					let coords = this.placesObject[zoom][name].coordinates;
					coords.disp.lat = 
						(1 - value) * coords.original.lat + value * coords.target.lat;
					coords.disp.lng = 
						(1 - value) * coords.original.lng + value * coords.target.lng;
				}
			}
		}
		else {
			for(let zoom of this.placesZooms) {
				for(let name in this.placesObject[zoom]) {
					let coords = this.placesObject[zoom][name].coordinates;
					coords.disp.lat = coords[type].lat;
					coords.disp.lng = coords[type].lng;
				}
			}
		}
	}
}