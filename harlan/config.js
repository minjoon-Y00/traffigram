const TgData = {
	zoom: {
		max: 18,
		min: 12,
		init: 14, //13,
		previos: 0,
		current: 0,
		disp: {
			motorway: {min: 1, max: 20},
			motorway_link: {min: 1, max: 20},
			primary: {min: 11, max: 20},
			secondary: {min: 11, max: 20},
			tertiary: {min: 11, max: 20},
			residential: {min: 15, max: 20},
		}
	},

	viz: {
		z: {
			water: 3,
			waterNode: 20,
			landuse: 2,

			residential_bg: 4,
			residential: 4,
			tertiary_bg: 5,
			tertiary: 5,
			secondary_bg: 5,
			secondary: 5,
			primary_bg: 5,
			primary: 5,
			motorway_link: 6,
			motorway_bg: 7,
			motorway: 7,

			roadNode: 8,
			presets: 9,
			places: 10,
			isochrone: 30,
			origin: 15,
			//street: 19,
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
			grid: 'rgba(255, 0, 0)',
			gridS: 'rgba(0, 255, 0, 0.5)',
			gridT: 'rgba(0, 0, 255, 0.5)',
			isochrone: 'rgba(255, 0, 0, 0.5)',
			isochroneText: '#FFF',
			landuse: [
				'#d8e8c8', // park
				'#e0e4dd', // cemetery
				'#fde', // hospital 
				'#f0e8f8', // school
				'rgb(233,238,223)', // wood
			],
			landuseNode: '#009245',
			locationLine: 'rgba(0, 0, 0, 0.5)',
			road: {
				motorway: '#f79e20', //'rgb(254, 216, 157)',
				motorway_bg: 'rgba(231, 146, 8, 0.5)', //(#E79208), //'rgb(254, 216, 157)',
				motorway_link: '#FFF', //'rgb(254, 141, 15, 0.5)',
				primary: '#FFF',
				primary_bg: 'rgba(209, 209, 209, 0.5)', // (#d1d1d1)
				secondary: '#FFF',
				secondary_bg: 'rgba(209, 209, 209, 0.5)', // (#d1d1d1)
				tertiary: '#FFF',
				tertiary_bg: 'rgba(209, 209, 209, 0.5)', // (#d1d1d1)
				residential: '#d0c7bc'
			},
			roadNode: '#E00B62',
			text: '#000', // '#686453',
			textPlace: 'rgba(0, 0, 0, 0.5)', //'#000'
			textPlaceStroke: 'rgba(255, 255, 255, 0.8)', //'#FFF',
			textLocation: '#000', //'rgb(122, 62, 44)', 
			textStreet: 'rgba(0, 0, 0, 0.4)',
			textNumberOfLocations: '#FFF',
			water: 'rgb(163, 204, 255)',
			waterNode: '#0071BC',
		},

		width: {
			controlPointLine: 2,
			edge: 2,
			grid: 3,
			gridS: 2,
			gridT: 2,
			isochrone: 1,
			highLightIsochrone: 2,
			locationLine: 3,
			road: {
				motorway: 3,
				motorway_bg: 5, //4,
				motorway_link: 3, //2,
				primary: 3, 
				primary_bg: 5, //4,
				secondary: 2, 
				secondary_bg: 4, //3,
				tertiary: 2,
				tertiary_bg: 4, //3,
				residential: 1,
			},
			textPlaceStroke: 5,
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
				driving: 'img/mapbtn_origin_car.png',
				traffic: 'img/mapbtn_origin_car.png',
				cycling: 'img/mapbtn_origin_bicycle@2x.png',
				walking: 'img/mapbtn_origin_foot@2x.png',
				home: 'img/loc_home.png', // 'img/mapbtn_home_big@2x.png',
				office: 'img/loc_office.png', //'img/mapbtn_office_big@2x.png',
			}, 
			red10min: 'img/10min.png',
			//red100min: 'img/100min.png',
			randomMarkers: [
				'img/markers/marker0_small.png',
				'img/markers/marker1_small.png',
				'img/markers/marker2_small.png',
				'img/markers/marker3_small.png',
				'img/markers/marker4_small.png',
				'img/markers/marker5_small.png',
				'img/markers/marker6_small.png',
				'img/markers/marker7_small.png',
				'img/markers/marker8_small.png',
				'img/markers/marker9_small.png',
			],
		},

		font: {
			isochroneText: '24px Roboto Condensed',
			places: '14pt Roboto',
			text: '12pt Roboto Condensed',
			street: '12pt Roboto',
		},
	},

	origin: {
		default: {
			lat: 47.680275, // green lake
			lng: -122.327324, // gree lake
			//lat: 47.681291, // sand point
			//lng: -122.253665, // sand point
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

	center: [{
			name: 'Green Lake',
			lat: 47.680275,
			lng: -122.327324,
		},{
			name: 'Seattle Downtown',
			lat: 47.6115744,
			lng: -122.343777,
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
		},{
			name: 'Mountlake Terrace',
			lat: 47.787072, 
			lng: -122.308459,
		},{
			name: 'Burien',
			lat: 47.466827, 
			lng: -122.339007,
		},{
			name: 'Tukwila',
			lat: 47.473262, 
			lng: -122.262174,
		},{
			name: 'Shorline',
			lat: 47.756807, 
			lng: -122.345476,
		},{
			name: 'Edmonds',
			lat: 47.810278, 
			lng: -122.377953,
		}],

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
		landuse: {
			disp: true,
			simplify: false,
		},
		place: {
			disp: true,
		}
	},

	var: {
		animationSpeed: 50, // ms
		apiKeyVectorTile: 'pk.eyJ1IjoiYmFzc3QiLCJhIjoiY2pjamY0Y2RwMnk0cDJ3dDVqNHM4aWNqcCJ9.6_wLvPhbNLT_x4npXkWO2A',

		//apiKeyTimeMatrix: 'matrix-AGvGZKs', // mine
		apiKeyTimeMatrix: 'matrix-qUpjg6W', // Ray's
		appMode: 'pc', // 'mobile'
		appDispMode: 'normal',

		locBBPx: 15, //20,
		locGroupBBPx: 30, //30,
		locTextLngMarginPx: 10, //27, // left/right margin
		locTextLatMarginPx: 10, //27, // top/bottom margin
		isochroneTextPx: 14,


		deltaFrame: 1,
		latPerPx: 0,
		lngPerPx: 0,	
		latMargin: 0,
		lngMargin: 0,
		longPressTime: 1000, // 1 sec
		longPressSensitivity: 100,
		numLanduseClasses: 6,
		numRatings: [0, 1000],
		marginPercent: 3.0, 
		maxNumTops: 10,
		maxNumHots: 10,
		maxNumLocations: 20,
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
		waitForFinishGettingRoadData: 1000, // ms
		waitForGettingVectorTile: 20, // ms
		waitForGettingData: 100, // ms
		waitForGettingRoadData: 100, // ms // 50
		waitForGettingWaterData: 100, // ms // 50
	}
	
}

//module.exports = TgData;