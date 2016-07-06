const options = {
	maxZoom: 18,
	minZoom: 10,
	zoom: 16, //13,

	color: {
		water: 'rgba(146, 219, 238, 1)',
		edge: '#F90047',
		node: '#000',
		selectedNode: '#A00',
		location: '#33cc33',
		locationLine: '#33cc33',
		controlPoint: '#FFD700',
		controlPointLine: '#FFD700',

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
		nodeOrder: [
			'#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'],
			// black, red, green, blue, yellow, cyan, magenta
	},

	width: {
		motorway: 1, //7,
		trunk: 1, //7,
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
		originalRoad: 1,
		simplifiedRoad: 1,
	},

	radius: {
		node: 4,
		location: 5,
		controlPoint: 6,
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
		gridX: 10,
		gridY: 10,
	},

	constant: {
		randomness: 0.01,
		clickSensibility: 0.01,
	},

}

