const TgNode = require('../node/tg_node');

class TgMapOrigin {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;
		this.presetLayer = null;
		this.origin = null;
		this.bb = null;
		this.type = 'home'; // 'office' // 'other'
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}
	
	render(param) {
		if (this.isDisabled||(!this.display)) {
			this.removeLayer();
			this.removePresetLayer();
		}
		else {
			this.updateLayer(param);
			this.updatePresetLayer();
		}
	}

	discard() {
		this.removeLayer();
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	removePresetLayer() {
		this.mapUtil.removeLayer(this.presetLayer);
	}

	setOrigin(lat, lng) {
		this.origin = new TgNode(lat, lng);
		this.BB = this.map.tgBB.calBBOfOrigin();
	}

	getOrigin() {
		return this.origin;
	}

	updateLayer(param) {
		const opacity = ((param) && (param.translucent)) ? 0.5 : 1.0;
		const viz = this.data.viz;
		let arr = [];

		this.feature = this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.origin.disp.lng, this.origin.disp.lat]), 
				this.mapUtil.imageStyleFunc(
					viz.image.origin[this.map.tgControl.currentTransport], opacity),
			'origin');

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(viz.z.origin);
	  this.mapUtil.addLayer(this.layer);
	}

	updatePresetLayer() {
		const opacityOfPreset = 0.5;
		const viz = this.data.viz;
		let arr = [];

		// display home icon
		if (this.type !== 'home') {
			this.feature = this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([this.data.origin.home.lng, this.data.origin.home.lat]), 
					this.mapUtil.imageStyleFunc(viz.image.origin.home, opacityOfPreset));
		}

		// display office icon
		if (this.type !== 'office') {
			this.feature = this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([this.data.origin.office.lng, this.data.origin.office.lat]), 
					this.mapUtil.imageStyleFunc(viz.image.origin.office, opacityOfPreset));	
		}

		this.removePresetLayer();
		this.presetLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.presetLayer.setZIndex(viz.z.presets);
	  this.mapUtil.addLayer(this.presetLayer);
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
		const modified = transform(this.origin.original.lat, this.origin.original.lng);
		this.origin[kind].lat = modified.lat;
		this.origin[kind].lng = modified.lng;
	}

	calDispNodes(kind, value) {
		if (kind === 'intermediateReal') {
			this.origin.disp.lat = 
				(1 - value) * this.origin.original.lat + value * this.origin.real.lat;
			this.origin.disp.lng = 
				(1 - value) * this.origin.original.lng + value * this.origin.real.lng;
		}
		else if (kind === 'intermediateTarget') {
			this.origin.disp.lat = 
				(1 - value) * this.origin.original.lat + value * this.origin.target.lat;
			this.origin.disp.lng = 
				(1 - value) * this.origin.original.lng + value * this.origin.target.lng;
		}
		else {
			this.origin.disp.lat = this.origin[kind].lat;
			this.origin.disp.lng = this.origin[kind].lng;
		}
	}

	searchLatLngByAddress(address) {
		return new Promise((resolve, reject) => {
			const key = this.data.var.apiKeyVectorTile;
			//const key = 'vector-tiles-c1X4vZE';
			//const key = 'mapzen-dKpzpj5';
			const url = 'https://search.mapzen.com/v1/search?api_key=' + 
					key + '&text=' + address;
			$.get(url)
			.done((data) => {
				resolve({
					lat: (data.bbox[1] + data.bbox[3]) / 2,
					lng: (data.bbox[0] + data.bbox[2]) / 2,
				});
			})
			.fail(function(error) {
		    reject(error);
		  });
		});
	}

	getCurrentLocation() {
		return new Promise((resolve, reject) => {
			const timeOutForGettingLocation = 5000; // 5 sec
			let timeOutTimer;

			if (!navigator.geolocation) {
		    reject('Geolocation is not supported by this browser.');
		  }
		  else {
		  	navigator.geolocation.getCurrentPosition((pos) => {
		  		clearTimeout(timeOutTimer);
		  		resolve({
		  			lat: pos.coords.latitude,
		  			lng: pos.coords.longitude,
		  		});
		  	});

		  	timeOutTimer = setTimeout(() => {
		  		reject('Time out for getting geolocation');
		  	}, timeOutForGettingLocation);
		  }
		});
	}

	/*setArea(area) {
		this.map.setCenter(this.data.center[area].lat, this.data.center[area].lng);
	}*/

	setDefaultOrigin() {
		console.log('use default lat & lng.')
		this.map.setCenter(this.data.origin.default.lat, this.data.origin.default.lng);
	}

	setOriginByLatLng(lat, lng) {
		this.map.setCenter(lat, lng);
	}

	setOriginByPreset(type) {
		if ((type === 'home') || (type === 'office')) {
			this.type = type;
			const org = this.data.origin[type];

			// if there are lat & lng
			if (org.lat && org.lng) {
				this.setOriginByLatLng(org.lat, org.lng);
			}
			// if there is address
			else if (org.address) {
				this.searchLatLngByAddress(org.address)
				.then((data) => {
					this.setOriginByLatLng(data.lat, data.lng);
					// TODO: save lat/lng to the server
				})
				.catch((error) => {
					console.error(error);
				});
			}
		}
	}

	setOriginByCurrentLocation() {
  	this.tgOrigin.getCurrentLocation()
  	.then((data) => {
  		console.log('got lat & lng from geolocation.');
			this.type = 'other';

			this.map.setCenter(data.lat, data.lng);
  	})
  	.catch((error) => {
			console.error(error);
			if (!this.origin) this.setDefaultOrigin();
		});
  }

  setOriginByAddress(address) {
		this.searchLatLngByAddress(address)
		.then((data) => {
			this.type = 'other';
			this.map.setCenter(data.lat, data.lng);
		})
		.catch((error) => {
			console.error(error);
			if (!this.origin) this.setDefaultOrigin();
		});
	}

	/*setOrigin(param) {
		if (param.lat && param.lng) {
			this.setOriginByLatLng(param.lat, param.lng);
		}
		else if (param.address) {
			this.setOriginByAddress(param.address);
		}
		else {
			console.error('invalid param in setOrigin()');
			if (!this.origin) this.setDefaultOrigin();
		}
	}*/
}

module.exports = TgMapOrigin;