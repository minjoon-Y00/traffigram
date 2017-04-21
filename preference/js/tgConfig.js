const options = {
	maxZoom: 18,
	minZoom: 10,
	zoom: 14,

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
		waterNode: 20,
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
		isochrone: 25,
		origin: 30,
		boundingBox: 50,
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
		landuse: [
			'rgb(203, 230, 163)', // recreation_ground, park, garden
			'rgb(214, 233, 185)', // cemetery, golf_course, zoo
			'rgb(228, 228, 223)', // university, college, school
			'rgb(236, 239, 234)', // stadium
			'rgb(249, 237, 241)', // hospital
			'rgb(240, 224, 200)', // retail
		],
		textPlace: 'rgb(150, 122, 89)',
		textLocation: 'rgb(122, 62, 44)',

		minorNode: '#666',
		majorNode: '#000',
		boundingBox: 'rgba(75,0,130, 0.5)',

		highway: '#969696',
		arterial: '#969696',
		link: '#BBB', //'#00ADEE'

		//node: '#A52A2A',
		roadNode: '#E00B62',
		waterNode: '#0071BC',
		landuseNode: '#009245',
		edge: '#888',
		anchor: 'rgba(0, 0, 0, 0.5)',
		
		text: '#686453', //'#000',
		isochrone: 'rgba(255, 0, 0, 0.5)',
		isochroneText: '#FFF',
		grid: '#000', //'#FFA07A',

		location: '#33cc33',
		locationLine: 'rgba(0, 0, 0, 0.5)',
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
		edge: 2,

		locationLine: 1,
		controlPointLine: 2,
		isochrone: 1,
		
	},

	radius: {
		minorNode: 2,
		majorNode: 2,

		node: 3,
		controlPoint: 5,
		location: 5,
		anchor: 5,
	},

	image: {
		origin: 'img/map_origin.png',
		anchor: 'img/anchor.png',
		red10min: 'img/10min.png',
		red100min: 'img/100min.png',
		location: {
			'food': 'img/location_food.png',
			'bar': 'img/location_bar.png',
			'park': 'img/location_park.png',
			'museum': 'img/location_museum.png',
		},
	},

	font: {
		text: '14px Source Sans Pro',
		places: '14px Source Sans Pro',
		isochroneText: '24px Source Sans Pro',
	},

	center: {
		seattleDowntown: {
			lat: 47.6115744,
			lng: -122.343777,
		},
		seattleUw: {
			lat: 47.658316,
			lng: -122.312035,
		},
		sfLombard: {
			lat: 37.802139,
			lng: -122.4209287,
		},
		nyNyu: {
			lat: 40.72946,
			lng: -73.995708,
		},
		paloAltoStanford: {
			lat: 37.4275172,
			lng: -122.170233,
		},
		quebecCitadelle: {
			lat: 46.8078034,
			lng: -71.2090926,
		},
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

	variable: {
		latPerPx: 0,
		lngPerPx: 0,	
		latMargin: 0,
		lngMargin: 0,
	},

	constant: {
		randomness: 0.01,
		clickRangePX: 10,
		splitThreshold: 200,
		timeToWaitForGettingWaterData: 0, // ms
		timeToWaitForGettingRoadData: 50, // ms
		timeToWaitForGettingData: 20, // ms
		timeToWaitForFinishGettingWaterData: 1000, // ms
		rdpThreshold: {
			road: 0.001, //0.0001 (about 10 meter)
			water: 0.0005,
			landuse: 0.001,
		}, 
		numLanduseClasses: 6,
		shapePreservingDegree: 1.0,
		maxSplitLevel: 0,
		marginPercent: 30,
	},

}

