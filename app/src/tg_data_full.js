var TgData = {
	zoom: {
		max: 18,
		min: 11,
		init: 13,
		previos: 0,
		current: 0,
		level: [[17, 16, 15], [14, 13], [12, 11]],

		disp: {
			motorway: {min: 1, max: 20},
			trunk: {min: 1, max: 20},
			primary: {min: 11, max: 20},
			secondary: {min: 13, max: 20},
			tertiary: {min: 14, max: 20},
			residential: {min: 15, max: 20}
		}
	},

	viz: {
		z: {
			water: 3,
			waterNode: 20,
			landuse: 2,
			residential: 5,
			tertiary: 5,
			secondary: 5,
			primary: 5,
			motorway_link: 4,
			trunk_link: 4,
			trunk: 6,
			motorway: 7,
			roadNode: 40,
			presets: 9,
			places: 10,
			isochrone: 14,
			origin: 15,
			location: 20,
			favorite: 21,
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
				motorway: '#E5E5E5', //'rgb(254, 216, 157)',
				trunk: '#E5E5E5', //'rgb(254, 241, 185)',
				motorway_link: '#E5E5E5', //'#EEE',
				trunk_link: '#E5E5E5',  //'#EEE',
				primary: '#E5E5E5',  //'#FFF',
				secondary: '#E5E5E5',  //'#FFF',
				tertiary: '#E5E5E5',  //'#FFF',
				residential: '#E5E5E5',  //'#FFF',
			},
			roadNode: '#7C7C7C', //'#E00B62',
			text: '#000', // '#686453',
			textPlace: 'rgba(0, 0, 0, 0.5)', //'#000'
			textPlaceStroke: 'rgba(255, 255, 255, 0.5)', //'#FFF',
			textLocation: '#000', //'rgb(122, 62, 44)', 
			textNumberOfLocations: '#FFF',
			water: '#A8D0F8', //'rgb(163, 204, 255)', 
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
			cancelCustomIsochrone: 'img/cancel_isochrone.png',
			favorite: 'img/mapbtn_dest_favorite@2x.png',
			location: [
				//'img/mapbtn_dest_menu1_big@2x.png', // restaurant
				'img/mapbtn_dest_menu1_big.png', // restaurant
				//'img/mapbtn_dest_menu2_big@2x.png', // cafe
				'img/mapbtn_dest_menu2_big.png',
				//'img/mapbtn_dest_menu3_big@2x.png', // travel attractions
				'img/mapbtn_dest_menu3_big.png', // travel attractions
				//'img/mapbtn_dest_menu4_big@2x.png', // shopping
				'img/mapbtn_dest_menu4_big.png', // shopping
				//'img/mapbtn_dest_menu5_big@2x.png' // night life
				'img/mapbtn_dest_menu5_big.png' // night life
			],
			locationCluster: 'img/mapbtn_dest_cluster.png',
				//'img/mapbtn_dest_cluster@2x.png',
			origin: {
				//auto: 'img/mapbtn_origin_vehicle_big@2x.png',
				//auto: 'img/mapbtn_origin_vehicle@2x.png',
				auto: 'img/mapbtn_origin_car.png',
				bicycle: 'img/mapbtn_origin_bicycle@2x.png',
				pedestrian: 'img/mapbtn_origin_foot@2x.png',
				home: 'img/loc_home.png', // 'img/mapbtn_home_big@2x.png',
				office: 'img/loc_office.png', //'img/mapbtn_office_big@2x.png',
			}, 
			red10min: 'img/10min.png',
			//red100min: 'img/100min.png',
		},

		font: {
			isochroneText: '24px PT Sans Narrow',
			places: '14pt Source Sans Pro',
			//places: '14pt Source Sans Pro Regular',
			text: '12pt Source Sans Pro Regular', 
		},
	},

	presetOrigin: [{
		name: 'City Hall',
		lat: 47.6038998,
		lng: -122.3320382,
	},{
		name: 'Bellevue',
    lat: 47.614384, 
    lng: -122.202651,
	},{
		name: 'Mercer Island',
		lat: 47.569846, 
		lng: -122.222216,
	},{
		name: 'Redmond',
		lat: 47.673169, 
		lng: -122.121536,
	},{
		name: 'Kirkland',
		lat: 47.677125, 
		lng: -122.203785,
	}, {
		name: 'Mountlake Terrace',
		lat: 47.787072, 
		lng: -122.308459,
	}, {
		name: 'Burien',
		lat: 47.466827, 
		lng: -122.339007,
	}, {
		name: 'Tukwila',
		lat: 47.473262, 
		lng: -122.262174,
	}, {
		name: 'Shorline',
		lat: 47.756807, 
		lng: -122.345476,
	}, {
		name: 'Edmonds',
		lat: 47.810278, 
		lng: -122.377953,
	}],

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

	elements: {
		water: {
			disp: true,
			simplify: false,
		},
		road: {
			disp: true,
			simplify: false,
		},
		src: {
			disp: true,
		},
		landuse: {
			disp: true,
			simplify: false,
		},
		place: {
			disp: false,
		}
	},

	var: {
		animationSpeed: 50, // ms
		//apiKeyVectorTile: 'vector-tiles-c1X4vZE', // mine
		apiKeyVectorTile: 'mapzen-dKpzpj5', // Ray's
		//apiKeyTimeMatrix: 'matrix-AGvGZKs', // mine
		apiKeyTimeMatrix: 'matrix-qUpjg6W', // Ray's
		appMode: 'pc', // 'mobile'
		appDispMode: 'normal',

		locBBPx: 50,
		locGroupBBPx: 45,
		locTextLngMarginPx: 27, // left/right margin
		locTextLatMarginPx: 27, // top/bottom margin
		isochroneTextPx: 14,


		deltaFrame: 1,
		latDivider: 2,
		lngDivider: 2,
		latPerPx: 0,
		lngPerPx: 0,	
		latMargin: 0,
		lngMargin: 0,
		longPressTime: 1000, // 1 sec
		longPressSensitivity: 100,
		numLanduseClasses: 6,
		numRatings: [0, 1000],
		marginPercent: 3.0, 
		maxNumTops: 30,
		maxNumHots: 0,
		maxNumLocations: 30,
		maxNumIsochrone: 6,
		maxSplitLevel: 0, 
		placeProcessed: false,
		priceRange: [0, 4], // 1 ~ 4
		shapePreservingDegree: 1.0,
		startMode: 'EM',
		ratings: [0, 5], // 1 ~ 5
		readyLocation: false,
		resolution: {
			gridLng: 4, // horiozontal resolution. even number is recommended
			gridLat: 8, // vertical resolution. even number is recommended
		},
		rdpThreshold: {
			road: 0.001, //0.0001 (about 10 meter)
			water: 0.0003,
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