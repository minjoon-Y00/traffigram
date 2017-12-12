//const TgNode = require('../node/tg_node');

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
		this.origin = null;
		this.presetType = ['home', 'office'];
		this.preset = {};

		for(let type of this.presetType) {
			this.preset[type] = null;
		}
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

	setHome(address, lat, lng) {
		this.data.origin.home.address = address;
		this.data.origin.home.lat = lat;
		this.data.origin.home.lng = lng;
		this.setPresets();
		this.updatePresetLayer();
	}

	setOffice(address, lat, lng) {
		this.data.origin.office.address = address;
		this.data.origin.office.lat = lat;
		this.data.origin.office.lng = lng;
		this.setPresets();
		this.updatePresetLayer();
	}

	setHomeAndOffice(hAddress, hLat, hLng, oAddress, oLat, oLng) {
		this.data.origin.home.address = hAddress;
		this.data.origin.home.lat = hLat;
		this.data.origin.home.lng = hLng;
		this.data.origin.office.address = oAddress;
		this.data.origin.office.lat = oLat;
		this.data.origin.office.lng = oLng;
		this.setPresets();
		this.updatePresetLayer();
	}


	setOrigin(lat, lng) {
		if (!this.origin) {
			this.origin = new TgNode(lat, lng);
		}
		else {
			this.origin.set(lat, lng);
		}

		this.BB = this.map.tgBB.calBBOfOrigin();
	}

	setPresets() {
		for(let type of this.presetType) {
			this.setPresetByType(type, this.data.origin[type].lat, this.data.origin[type].lng);
		}
	}

	setPresetByType(type, lat, lng) {
		if (!this.preset[type]) {
			this.preset[type] = new TgNode(lat, lng);
		}
		else {
			this.preset[type].set(lat, lng);
		}
	}

	getOrigin() {
		return this.origin;
	}

	isOriginInTheBox() {
		const box = this.data.box;
		const lat = this.origin.disp.lat;
		const lng = this.origin.disp.lng;

		if ((lat < box.top) && (lat > box.bottom) && (lng < box.right)	&& (lng > box.left))
			return true;
		else
			return false;
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
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([this.preset.home.disp.lng, this.preset.home.disp.lat]), 
					this.mapUtil.imageStyleFunc(viz.image.origin.home, opacityOfPreset), 'home');
		}

		// display office icon
		if (this.type !== 'office') {
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([this.preset.office.disp.lng, this.preset.office.disp.lat]), 
					this.mapUtil.imageStyleFunc(viz.image.origin.office, opacityOfPreset), 'office');	
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

		// origin is not changed.
		/*const modified = transform(this.origin.original.lat, this.origin.original.lng);
		this.origin[kind].lat = modified.lat;
		this.origin[kind].lng = modified.lng;*/

		for(let type of this.presetType) {
			const modified = 
				transform(this.preset[type].original.lat, this.preset[type].original.lng);
			this.preset[type][kind].lat = modified.lat;
			this.preset[type][kind].lng = modified.lng;
		}
	}

	calDispNodes(kind, value) {
		if (kind === 'intermediateReal') {
			/*this.origin.disp.lat = 
				(1 - value) * this.origin.original.lat + value * this.origin.real.lat;
			this.origin.disp.lng = 
				(1 - value) * this.origin.original.lng + value * this.origin.real.lng;*/

			for(let type of this.presetType) {
				this.preset[type].disp.lat = 
						(1 - value) * this.preset[type].original.lat + 
						value * this.preset[type].real.lat;
				this.preset[type].disp.lng = 
						(1 - value) * this.preset[type].original.lng + 
						value * this.preset[type].real.lng;
			}


		}
		else if (kind === 'intermediateTarget') {
			/*this.origin.disp.lat = 
				(1 - value) * this.origin.original.lat + value * this.origin.target.lat;
			this.origin.disp.lng = 
				(1 - value) * this.origin.original.lng + value * this.origin.target.lng;*/

			for(let type of this.presetType) {
				this.preset[type].disp.lat = 
						(1 - value) * this.preset[type].original.lat + 
						value * this.preset[type].target.lat;
				this.preset[type].disp.lng = 
						(1 - value) * this.preset[type].original.lng + 
						value * this.preset[type].target.lng;
			}
		}
		else {
			/*this.origin.disp.lat = this.origin[kind].lat;
			this.origin.disp.lng = this.origin[kind].lng;*/

			for(let type of this.presetType) {
				this.preset[type].disp.lat = this.preset[type][kind].lat;
				this.preset[type].disp.lng = this.preset[type][kind].lng;
			}
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

	setOriginByOtherLatLng(lat, lng) {
		this.type = 'other';
		this.map.setCenter(lat, lng);
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
  	this.getCurrentLocation()
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

//module.exports = TgMapOrigin;