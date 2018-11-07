class TgTravelTimeApi {
	constructor(data) {
		this.data = data;
		this.org = {lat: null, lng: null};
		this.locations = [];
		this.ret = [];
		this.iteration = 0;
		this.mode = 'traffic';

		this.maxNumLocation = 25;
		this.totalNumOfRequest = 0;
		this.numOfRequest = 0;
		this.timeoutTime = 500; //ms
		this.times = [];
		this.callbackFunction = null;
	}

	setOrigin(lat, lng) {
		this.org.lat = lat;
		this.org.lng = lng;
	}

	resetLocation() {
		this.locations = [];
	}

	addLocation(lat, lng) {
		this.locations.push({lat:lat, lng:lng});
	}


	getTravelTimeByLoc(locations) {
		return new Promise((resolve, reject) => {

			let str = 'https://api.mapbox.com/directions-matrix/v1/mapbox/';
			
			if (this.mode === 'traffic') str += 'driving-traffic/';
			else str += this.mode + '/';

			str += this.org.lng + ',' + this.org.lat + ';';

			for(let i = 0; i < locations.length; ++i) { 
				str += locations[i].lng + ',' + locations[i].lat;
				if (i < locations.length - 1) str += ';';
			}

			str += '?sources=0&destinations=all&access_token=' + this.data.var.apiKeyVectorTile;
		
			$.get(str, (ret) => {
				//console.log('result: ', ret.durations[0]);
				resolve(ret.durations[0]);
			})
			.fail((err) => {
				reject(err);
	  	});
		});
	}

	request(resolve, reject) {
		const locs = this.locations.splice(0, this.maxNumLocation - 1);

		this.getTravelTimeByLoc(locs)
		.then((ret) => {

			ret.splice(0, 1);
			this.ret = this.ret.concat(ret);
			this.iteration--;

			console.log('iteration: ' + this.iteration);

			if (this.iteration === 0) {
				this.ret.splice(0, 0, 0);
				resolve(this.ret);
			}
			else {
				setTimeout(this.request.bind(this, resolve, reject), this.timeoutTime);
			}
		})
		.catch((err) => {
			reject(err);
		})
	}

	getTravelTime(mode) {
		return new Promise((resolve, reject) => {

			this.mode = mode;

			if (this.locations.length === 0) 
				reject('travel time api: no locations.');
			else {
				// locs:24 => 1, locs:49 => 2
				this.ret = [];
				this.iteration = parseInt(this.locations.length / this.maxNumLocation) + 1;

				this.request(resolve, reject);

				

				/*let str = 'https://api.mapbox.com/directions-matrix/v1/mapbox/';
		
				if (mode === 'traffic') str += 'driving-traffic/';
				else str += mode + '/';

				str += this.org.lng + ',' + this.org.lat + ';';

				for(let i = 0; i < this.locations.length; ++i) { 
					str += this.locations[i].lng + ',' + this.locations[i].lat;
					if (i < this.locations.length - 1) str += ';';
				}

				str += '?sources=0&destinations=all&access_token=' + this.data.var.apiKeyVectorTile;
			
				$.get(str, (ret) => {
					console.log('result: ', ret.durations[0]);
					this.resetLocation();
					resolve(ret.durations[0]);
				})
				.fail((err) => {
					this.resetLocation();
					reject(err);
		  	});*/
			}
		});
	}
}