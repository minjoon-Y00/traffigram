const options = {
	maxZoom: 18,
	minZoom: 10,
	zoom: 14, //13,

	type: {
		motorway: 1,
		trunk: 2,
		primary: 11,
		secondary: 12,
		tertiary: 13,
		motorway_link: 21,
		trunk_link: 22,
		primary_link: 23,
		secondary_link: 24,
		tertiary_link: 25
	},

	color: {
		water: 'rgba(146, 219, 238, 1)',
		edge: '#F90047',
		node: '#000',
		nodeOrder: [
			'#CCC', '#000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'],
			// grey, black, red, green, blue, yellow, cyan, magenta

		//selectedNode: '#A00',
		//location: '#33cc33',
		//locationLine: '#33cc33',
		//controlPoint: '#FFD700',
		//controlPointLine: '#FFD700',
		//gridPoint: '#FFA07A',
		//gridLine: '#FFA07A',

		motorway: '#969696',
		trunk: '#969696',
		primary: '#969696',
		secondary: '#969696',
		tertiary: '#969696',
		rail: '#969696',
		monorail: '#969696',
		light_rail: '#969696',
		tram: '#969696',
		disused: '#969696',
		motorway_link: '#00ADEE',
		trunk_link: '#00ADEE',
		primary_link: '#00ADEE',
		secondary_link: '#00ADEE',
		tertiary_link: '#00ADEE',
		
		originalNode: '#FFA500',
		originalRoad: '#FF69B4',
		simplifiedNode: '#A52A2A',
		simplifiedRoad: '#8A2BE2',
		
	},

	width: {
		motorway: 7, //7,
		trunk: 7, //7,
		primary: 1, //5,
		secondary: 1, //3,
		tertiary: 1,
		rail: 1,
		monorail: 1,
		light_rail: 1,
		tram: 1,
		disused: 1,
		motorway_link: 1,
		trunk_link: 1,
		primary_link: 1,
		secondary_link: 1, 
		tertiary_link: 1,
		edge: 1,
		locationLine: 1,
		controlPointLine: 1,
		gridLine: 1,
		originalRoad: 1,
		simplifiedRoad: 1,
	},

	radius: {
		intermediateNode: 2,
		terminalNode: 2,
		//node: 4,
		//location: 5,
		//controlPoint: 6,
		//gridPoint: 2,
		originalNode: 2,
		simplifiedNode: 2,
	},

	image: {
		center: 'img/icon_origin.png',
		location: 'img/map_loc.png',
	},

	center: {
		seattle: {
			lat: 47.6080445,
			lng: -122.334108
		},
		NY: {
			lat: 40.76702,
			lng: -73.97644
		},
		SF: {
			lat: 37.7794,
			lng: -122.45636
		}
	},

	boundary: {
		seattle: {
			east: -122.0791,
			west: -122.4379,
			south: 47.3956,
			north: 47.8591
		}
	},

	box: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	},

	resolution: {
		gridLng: 5,
		gridLat: 9,
	},

	constant: {
		randomness: 0.01,
		clickSensibility: 0.01,
	},

}

