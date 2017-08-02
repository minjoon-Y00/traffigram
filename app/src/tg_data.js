var TgData = {
	zoom: {
		max: 18,
		min: 11,
		init: 15,
		current: 0,
		disp: {
			motorway: {min: 1, max: 20},
			trunk: {min: 1, max: 20},
			primary: {min: 13, max: 20},
			secondary: {min: 14, max: 20},
			tertiary: {min: 15, max: 20},
			residential: {min: 16, max: 20}
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
			presets: 9,
			places: 10,
			origin: 15,
			location: 20,
			isochrone: 25,
			boundingBox: 40,
			grid: 50,
			controlPoint: 51,
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
			textPlace: 'rgba(0, 0, 0, 0.5)', //'#000'
			textPlaceStroke: 'rgba(255, 255, 255, 0.5)', //'#FFF',
			textLocation: '#000', //'rgb(122, 62, 44)', 
			textNumberOfLocations: '#000', //'#FFF',
			water: 'rgb(163, 204, 255)',
			waterNode: '#0071BC',
		},

		width: {
			controlPointLine: 2,
			edge: 2,
			grid: 2,
			isochrone: 1,
			highLightIsochrone: 2,
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
			controlPoint: 13,
			node: 3,
		},

		image: {
			anchor: 'img/anchor.png',
			favorite: 'img/mapbtn_dest_favorite@2x.png',
			location: [
				'img/mapbtn_dest_menu1_big@2x.png', // restaurant
				'img/mapbtn_dest_menu2_big@2x.png', // cafe
				'img/mapbtn_dest_menu3_big@2x.png', // travel attractions
				'img/mapbtn_dest_menu4_big@2x.png', // shopping
				'img/mapbtn_dest_menu5_big@2x.png' // night life
			],
			locationCluster: 'img/mapbtn_dest_cluster@2x.png',
			origin: {
				auto: 'img/mapbtn_origin_vehicle@2x.png',
				bicycle: 'img/mapbtn_origin_bicycles@2x.png',
				pedestrian: 'img/mapbtn_origin_foot@2x.png',
				home: 'img/mapbtn_dest_home@2x.png',
				office: 'img/mapbtn_dest_office@2x.png',
			}, 
			red10min: 'img/10min.png',
			//red100min: 'img/100min.png',
		},

		font: {
			isochroneText: '24px PT Sans Narrow',
			places: '14pt Source Sans Pro Regular',
			text: '12pt Source Sans Pro Regular',
		},
	},

	origin: {
		default: {
			lat: 47.6631772,
			lng: -122.3104933,
		},
		home: {
			address: '4225 24th Ave. NE, Seattle, WA',
			lat: 47.6631772,
			lng: -122.3104933,
		},
		office: {
			address: '3960 Benton Lane NE, Seattle, WA',
			lat: 47.6549064,
			lng: -122.3086493,
		}
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
		apiKeyVectorTile: 'vector-tiles-c1X4vZE', // mine
		//apiKeyVectorTile: 'mapzen-dKpzpj5', // Ray's
		apiKeyTimeMatrix: 'matrix-AGvGZKs', // mine
		//apiKeyTimeMatrix: 'matrix-qUpjg6W', // Ray's

		latPerPx: 0,
		lngPerPx: 0,	
		latMargin: 0,
		lngMargin: 0,
		longPressTime: 1000, // 1 sec
		longPressSensitivity: 100,
		numLanduseClasses: 6,
		numRatings: [5, 1000],
		marginPercent: 3.0, 
		maxNumLocations: 20,
		maxSplitLevel: 0, 
		placeProcessed: false,
		priceRange: [1, 4], // 1 ~ 4
		shapePreservingDegree: 1.0,
		ratings: [3, 5], // 1 ~ 5
		readyLocation: false,
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
		waitForGettingRoadData: 100, // ms // 50
		waitForGettingWaterData: 100, // ms // 50
	}
	
}

//module.exports = TgData;