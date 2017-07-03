module.exports = {
	zoom: {
		max: 18,
		min: 10,
		init: 14,
		current: 0,
		disp: {
			motorway: {min: 1, max: 20},
			trunk: {min: 1, max: 20},
			primary: {min: 12, max: 20},
			secondary: {min: 13, max: 20},
			tertiary: {min: 14, max: 20},
			residential: {min: 15, max: 20}
		}
	},

	viz: {
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

		color: {
			anchor: 'rgba(0, 0, 0, 0.5)',
			boundingBox: 'rgba(75,0,130, 0.5)',
			controlPoint: '#FFD700',
			controlPointLine: '#FFD700', 
			edge: '#888',
			grid: '#000', //'#FFA07A',
			isochrone: 'rgba(255, 0, 0, 0.5)',
			isochroneText: '#FFF',
			landuse: [
				'rgb(203, 230, 163)', // recreation_ground, park, garden
				'rgb(214, 233, 185)', // cemetery, golf_course, zoo
				'rgb(228, 228, 223)', // university, college, school
				'rgb(236, 239, 234)', // stadium
				'rgb(249, 237, 241)', // hospital
				'rgb(240, 224, 200)', // retail
			],
			landuseNode: '#009245',
			locationLine: 'rgba(0, 0, 0, 0.5)',
			road: {
				motorway: 'rgb(254, 216, 157)',
				trunk: 'rgb(254, 241, 185)',
				primary: '#FFF',
				secondary: '#FFF',
				tertiary: '#FFF',
				residential: '#FFF',
			},
			roadNode: '#E00B62',
			text: '#000', // '#686453',
			textPlace: '#000', //'rgb(150, 122, 89)',
			textPlaceStroke: '#FFF',
			textLocation: '#000', //'rgb(122, 62, 44)', 
			water: 'rgb(163, 204, 255)',
			waterNode: '#0071BC',
		},

		width: {
			controlPointLine: 2,
			edge: 2,
			grid: 2,
			isochrone: 1,
			locationLine: 1,
			road: {
				motorway: 4,
				trunk: 4,
				primary: 3,
				secondary: 2,
				tertiary: 2,
				residential: 1,
			},
			textPlaceStroke: 2,
		},

		radius: {
			anchor: 5,
			controlPoint: 5,
			node: 3,
		},

		image: {
			anchor: 'img/anchor.png',
			location: {
				'food': 'img/location_food.png',
				'bar': 'img/location_bar.png',
				'park': 'img/location_park.png',
				'museum': 'img/location_museum.png',
			},
			origin: 'img/map_origin.png',
			red10min: 'img/10min.png',
			//red100min: 'img/100min.png',
		},

		font: {
			isochroneText: '24px Source Sans Pro',
			places: '20pt Source Sans Pro Regular',
			text: '16pt Source Sans Pro Regular',
		},
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

	box: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	},

	var: {
		clickRangePX: 10,
		latPerPx: 0,
		lngPerPx: 0,	
		latMargin: 0,
		lngMargin: 0,
		numLanduseClasses: 6,
		marginPercent: 30, 
		maxSplitLevel: 0, 
		shapePreservingDegree: 1.0, 
		resolution: {
			gridLng: 4, // horiozontal resolution. even number is recommended
			gridLat: 8, // vertical resolution. even number is recommended
		},
		rdpThreshold: {
			road: 0.001, //0.0001 (about 10 meter)
			water: 0.0005,
			landuse: 0.001,
		},
	},

	time: {
		waitForFinishGettingWaterData: 500, // ms
		waitForGettingData: 20, // ms
		waitForGettingRoadData: 50, // ms
		waitForGettingWaterData: 0, // ms
	}
	
}