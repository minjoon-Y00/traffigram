const options = {
	maxZoom: 18,
	minZoom: 8,
	zoom: 13,

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

	z: {
		water: 0,
		waterNode: 1,
		landuse: 2,
		residential: 5,
		tertiary: 5,
		secondary: 5,
		primary: 5,
		trunk: 6,
		motorway: 7,
		roadNode: 8,
		grid: 10,
		controlPoint: 15,
		places: 19,
		location: 20,
		centerPosition: 50,
	},

	dispZoom: {
		motorway: {minZoom:1, maxZoom:20},
		trunk: {minZoom:1, maxZoom:20},
		primary: {minZoom:12, maxZoom:20},
		secondary: {minZoom:13, maxZoom:20},
		tertiary: {minZoom:14, maxZoom:20},
		residential: {minZoom:15, maxZoom:20}
	},

	color: {
		water: 'rgb(163, 204, 255)',
		road: {
			motorway: 'rgb(254, 216, 157)',
			trunk: 'rgb(254, 241, 185)',
			primary: '#FFF',
			secondary: '#FFF',
			tertiary: '#FFF',
			residential: '#FFF',
		},
		landuse: 'rgb(203, 230, 163)',
		places: '#686453', //'#000',

		highway: '#969696',
		arterial: '#969696',
		link: '#BBB', //'#00ADEE'
		node: '#A52A2A',
		text: '#686453', //'#000',
		grid: '#FFA07A',

		location: '#33cc33',
		locationLine: '#33cc33',
		controlPoint: '#FFD700',
		controlPointLine: '#FFD700',
	},

	width: {
		road: {
			motorway: 4,
			trunk: 4,
			primary: 3,
			secondary: 2,
			tertiary: 2,
			residential: 1,
		},
		highway: 1,
		arterial: 1,
		link: 1,
		grid: 2,

		locationLine: 2,
		controlPointLine: 2,
		
	},

	radius: {
		node: 3,
		controlPoint: 5,
		location: 5,
	},

	image: {
		center: 'img/icon_origin.png',
		location: 'img/map_loc.png',
	},

	font: {
		text: '14px Source Sans Pro',
		places: '14px Source Sans Pro',
	},

	center: {
		seattle_uw: {
			lat: 47.658316,
			lng: -122.312035
		},
		seattle_downtown: {
			lat: 47.6115744,
			lng: -122.343777
		},
		ny_nyu: {
			lat: 40.72946,
			lng: -73.995708
		},
		sf_lombard: {
			lat: 37.802139,
			lng: -122.4209287
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
		gridLng: 4, // horiozontal resolution. even number is recommended
		gridLat: 8, // vertical resolution. even number is recommended
	},

	networkByZoom: {
		'level1': [11],
		'level2': [12],
		'level3': [13, 14],
		'level4': [15, 16, 17, 18]
	},

	constant: {
		randomness: 0.01,
		clickSensibility: 0.01,
		splitThreshold: 200,
		timeToWaitForGettingWaterData: 0, // ms
		timeToWaitForGettingRoadData: 50, // ms
		timeToWaitForGettingData: 20 // ms
	},

}

