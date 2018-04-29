class TgTravelTimeApi {
	constructor(data) {
		this.data = data;
		this.org = {lat: null, lng: null};
		this.locations = [];

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

	getTravelTime(mode) {
		return new Promise((resolve, reject) => {

			if (this.locations.length === 0) 
				reject('travel time api: no locations.');
			else if (this.locations.length > this.maxNumLocation - 1) 
				reject('travel time api: locations > max locations.');
			else {

				let str = 'https://api.mapbox.com/directions-matrix/v1/mapbox/';
		
				if (mode === 'traffic') str += 'driving-traffic/';
				else str += mode + '/';

				str += this.org.lng + ',' + this.org.lat + ';';

				for(let i = 0; i < this.locations.length; ++i) { 
					str += this.locations[i].lng + ',' + this.locations[i].lat;
					if (i < this.locations.length - 1) str += ';';
				}

				str += '?sources=0&destinations=all&access_token=' + this.data.var.apiKeyVectorTile;
			
				$.get(str, (ret) => {
					console.log('result: ', ret);
					this.resetLocation();
					resolve(ret.durations[0]);
				})
				.fail((err) => {
					this.resetLocation();
					reject(err);
		  	});
			}
		});
	}
}