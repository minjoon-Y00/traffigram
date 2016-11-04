class Node {
	constructor(orgLat, orgLng) {
		this.original = {lat: orgLat, lng:orgLng, len:0};
		this.target = {lat: orgLat, lng:orgLng};
		this.real = {lat: orgLat, lng:orgLng};
		this.disp = {lat: orgLat, lng:orgLng};
		this.degree = 0;
		this.travelTime = 0;
	}
}

class TravelTime {
	constructor() {
		this.locations = new Array(1);
	}

	setStartLocation(lat, lng) {
		this.locations[0] = {lat:lat, lon:lng};
	}

	addDestLocation(lat, lng) {
		//this.locations.push({lat:lat, lon:lng});
		this.locations.push({lat:lng, lon:lat});
	}

	clearLocations() {
		this.locations = new Array(1);
	}

	clearDestLocations() {
		var start = this.locations[0];
		clearLocations();
		setStartLocation(start.lat, start.lon);
	}

	getTravelTime(func) {
		var json = {locations:this.locations, costing:'auto'};
		var str = 'https://matrix.mapzen.com/one_to_many?json=';
		str += JSON.stringify(json);
		//str += '&api_key=matrix-qUpjg6W';
		str += '&api_key=matrix-AGvGZKs';

		console.log(str);
		$.get(str, function(data) {
		  func(data);
		});
	}
}	

