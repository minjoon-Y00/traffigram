class TgTravelTimeApi {
	constructor(data) {
		this.data = data;
		this.centerLocation = {};
		this.locations = [];
		this.maxNumLocation = 48;
		this.totalNumOfRequest = 0;
		this.numOfRequest = 0;
		this.timeoutTime = 500; //ms
		this.times = [];
		this.callbackFunction = null;
	}

	setStartLocation(lat, lng) {
		this.centerLocation = {lat:lat, lon:lng};
	}

	addEndLocation(lat, lng) {
		this.locations.push({lat:lat, lon:lng});
	}

	clearLocations() {
		this.centerLocation = {};
		this.locations = [];
	}

	clearEndLocations() {
		this.locations = [];
	}

	getTravelTime(mode, cb) {
		//console.log('***');
		//console.log(this.locations);

		// [0, max) -> 1
		// [max, max*2) -> 2
		// ...
		this.times = [];
		this.numOfRequest = 0;
		this.totalNumOfRequest = parseInt(this.locations.length / this.maxNumLocation) + 1;
		this.callbackFunction = cb;
		this.queuedLocations = this.deepClone(this.locations);

		this.requestTravelTime(mode);
	}

	deepClone(input) {
		return JSON.parse(JSON.stringify(input));
	}

	// mode: 'auto', 'bicycle' or 'pedestrian'
	requestTravelTime(mode) {

		let locations;

		// if locations.length > max (e.g. 49, 50, ...)
		if (this.locations.length > this.maxNumLocation) {
			locations = this.locations.slice(0, this.maxNumLocation); // [0, max) (e.g. [0, 47])
			this.locations = this.locations.slice(this.maxNumLocation); // [max, len] (e.g. [48, ...])
		}
		// if queuedLocations.length <= max
		else {
			locations = this.locations;
		}

		locations.unshift(this.centerLocation);

		const json = {locations: locations, costing: mode};

		let str = 'https://matrix.mapzen.com/one_to_many?json=';
		str += JSON.stringify(json);
		str += '&api_key=' + this.data.var.apiKeyTimeMatrix;

		$.get(str, this.processTravelTime.bind(this))
		.fail((error) => {
			//console.log(error);
			console.log('make fake result.');
			this.makeFakeResult(locations);
  	});
	}

	makeFakeResult(locations) {
		let result = {};
		result.one_to_many = [];
		result.one_to_many.push(new Array(locations.length));

		const origin = {lat: locations[0].lat, lng: locations[0].lon};

		for(let i = 0; i < locations.length; i++) {
			result.one_to_many[0][i] = {
				time: TgUtil.distance(origin.lat, origin.lng, 
					locations[i].lat, locations[i].lon) * 1000
			};
		}

		this.processTravelTime(result);
	}

	processTravelTime(result) {
		//console.log('result: ');
		//console.log(result);

		for(let index = 1; index < result.one_to_many[0].length; index++) {
			this.times.push(result.one_to_many[0][index].time);
		}

		//console.log('this.numOfRequest + 1: ' + this.numOfRequest + 1);
		//console.log('this.totalNumOfRequest: ' + this.totalNumOfRequest);

		if (++this.numOfRequest === this.totalNumOfRequest) {
			this.finishGettingTravelTime();
		}
		else {
			//console.log('requesting...');
			setTimeout(this.requestTravelTime.bind(this), this.timeoutTime);
		}
	}

	finishGettingTravelTime() {
		console.log('received travel time data.');
		this.callbackFunction(this.times);
	}
}	

//module.exports = TgTravelTimeApi;