/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgUtil = function () {
	function TgUtil() {
		// do nothing

		_classCallCheck(this, TgUtil);
	}

	_createClass(TgUtil, [{
		key: "distance",
		value: function distance(lat1, lng1, lat2, lng2) {
			var R = 6371; // km
			//var R = 3959 // 6371*0.621371 // miles
			var dLat = (lat2 - lat1) * Math.PI / 180;
			var dLng = (lng2 - lng1) * Math.PI / 180;
			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c;
			return d;
		}
	}, {
		key: "D2",
		value: function D2(lat1, lng1, lat2, lng2) {
			return Math.sqrt((lat1 - lat2) * (lat1 - lat2) + (lng1 - lng2) * (lng1 - lng2));
		}
	}, {
		key: "D2_s",
		value: function D2_s(lat1, lng1, lat2, lng2) {
			return (lat1 - lat2) * (lat1 - lat2) + (lng1 - lng2) * (lng1 - lng2);
		}
	}, {
		key: "getRandomInt",
		value: function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		}

		// clone object

	}, {
		key: "clone",
		value: function clone(obj) {
			return JSON.parse(JSON.stringify(obj));
		}
	}, {
		key: "degrees",
		value: function degrees(radians) {
			return radians * 180 / Math.PI;
		}
	}, {
		key: "median",
		value: function median(values) {
			values.sort(function (a, b) {
				return a - b;
			});
			var half = Math.floor(values.length / 2);

			if (values.length % 2) return values[half];else return (values[half - 1] + values[half]) / 2.0;
		}
	}, {
		key: "average",
		value: function average(values) {
			var sum = 0;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var v = _step.value;
					sum += v;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			if (values.length > 0) return sum / values.length;else return 0;
		}

		// i_sLat, i_sLng, i_eLat, i_eLng, j_sLat, j_sLng, j_eLat, j_eLng

	}, {
		key: "intersects",
		value: function intersects(a, b, c, d, p, q, r, s) {
			var det, gamma, lambda;
			det = (c - a) * (s - q) - (r - p) * (d - b);
			if (det === 0) {
				return false;
			} else {
				lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
				gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
				return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
			}
		}
	}, {
		key: "intersectRect",
		value: function intersectRect(r1, r2) {
			return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
		}
	}, {
		key: "RDPSimp3D",
		value: function RDPSimp3D(point3DArray, eps) {
			for (var index = 0; index < point3DArray.length; index++) {
				for (var index2 = 0; index2 < point3DArray[index].length; index2++) {
					point3DArray[index][index2] = this.RDPSimp1D(point3DArray[index][index2], eps);
				}
			}
			return point3DArray;
		}
	}, {
		key: "RDPSimp2D",
		value: function RDPSimp2D(point2DArray, eps) {
			for (var index = 0; index < point2DArray.length; index++) {
				//console.log('before: ' + point2DArray[index].length);
				point2DArray[index] = this.RDPSimp1D(point2DArray[index], eps);
				//console.log('after: ' + point2DArray[index].length);
			}
			return point2DArray;
		}

		// pointArray: [[lng, lat], ..., [lng, lat]]

	}, {
		key: "RDPSimp1D",
		value: function RDPSimp1D(pointArray, eps) {
			// Find the point with the maximum distance

			var dmax = 0;
			var index = 0;
			var startPoint = pointArray[0];
			var endPoint = pointArray[pointArray.length - 1];

			//console.log(startPoint);
			//console.log(endPoint);

			for (var i = 1; i < pointArray.length - 1; i++) {
				var testPoint = pointArray[i];
				var d = this.distanceBetweenLineAndPoint(startPoint, endPoint, testPoint);

				if (d > dmax) {
					index = i;
					dmax = d;
				}
			}

			// If max distance is greater than eps, recursively simplify
			if (dmax > eps) {
				// Recursive call
				var result1 = this.RDPSimp1D(pointArray.slice(0, index + 1), eps);
				var result2 = this.RDPSimp1D(pointArray.slice(index, pointArray.length), eps);

				// Build the result list
				return result1.concat(result2.slice(1));
			} else {
				return [startPoint, endPoint];
			}
		}
	}, {
		key: "RDPSimp3DLoop",
		value: function RDPSimp3DLoop(point3DArray, eps) {
			for (var index = 0; index < point3DArray.length; index++) {
				point3DArray[index] = this.RDPSimp2DLoop(point3DArray[index], eps);
			}
			return point3DArray;
		}
	}, {
		key: "RDPSimp2DLoop",
		value: function RDPSimp2DLoop(point2DArray, eps) {
			for (var index = 0; index < point2DArray.length; index++) {

				var nodes = point2DArray[index];
				var pivot = nodes[0];
				var max = 0.0;
				var maxK = 0;
				for (var k = 1; k < nodes.length; k++) {
					var d = this.distance(nodes[0][0], nodes[0][1], nodes[k][0], nodes[k][1]);
					//const d = this.D2_s(nodes[0][0], nodes[0][1], nodes[k][0], nodes[k][1])
					if (d > max) {
						max = d;
						maxK = k;
					}
				}

				/*const distance = 0.1;
    if (max < distance) {
    	point2DArray[index] = [];
    	continue;
    }*/

				//console.log('max: ' + max);

				var nodes1 = nodes.slice(0, maxK + 1);
				var nodes2 = nodes.slice(maxK, nodes.length);

				var simplifiedNodes1 = this.RDPSimp1D(nodes1, eps);
				var simplifiedNodes2 = this.RDPSimp1D(nodes2, eps);
				simplifiedNodes1.pop();

				//console.log('before: ' + point2DArray[index].length);
				point2DArray[index] = simplifiedNodes1.concat(simplifiedNodes2);
				//console.log('after: ' + point2DArray[index].length);

				//point2DArray[index] = [];
			}
			return point2DArray;
		}
	}, {
		key: "distanceBetweenLineAndPoint",
		value: function distanceBetweenLineAndPoint(L1, L2, P) {
			var t = Math.abs((L2[1] - L1[1]) * P[0] - (L2[0] - L1[0]) * P[1] + L2[0] * L1[1] - L2[1] * L1[0]);
			var b = Math.sqrt((L2[1] - L1[1]) * (L2[1] - L1[1]) + (L2[0] - L1[0]) * (L2[0] - L1[0]));
			return t / b;
		}

		/*distanceBetweenLineAndPoint(L1x, L1y, L2x, L2y, Px, Py) {
  	//console.log(L1x + ',' + L1y)
  	//console.log(L2x + ',' + L2y)
  	//console.log(Px + ',' + Py)
  	var t = Math.abs((L2y - L1y) * Px - (L2x - L1x) * Py + L2x * L1y - L2y * L1x)
  	var b = Math.sqrt((L2y - L1y) * (L2y - L1y) + (L2x - L1x) * (L2x - L1x))
  	//console.log(t + ' / ' + b)
  	return t / b
  }*/

	}, {
		key: "abByFFT",
		value: function abByFFT(p, type, d) {
			var a = function a(k, angs, ts, r) {
				var sum = 0;
				for (var i = 0; i < angs.length; i++) {
					sum += Math.sin(k * (ts[i] + angs[i] * r / 2)) - Math.sin(k * (ts[i] - angs[i] * r / 2));
				}
				return sum / (Math.PI * k * r);
			};

			var b = function b(k, angs, ts, r) {
				var sum = 0;
				for (var i = 0; i < angs.length; i++) {
					sum += Math.cos(k * (ts[i] + angs[i] * r / 2)) - Math.cos(k * (ts[i] - angs[i] * r / 2));
				}
				return -sum / (Math.PI * k * r);
			};

			var D2 = function D2(x1, y1, x2, y2) {
				return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
			};

			var lenVector = function lenVector(x, y) {
				return Math.sqrt(x * x + y * y);
			};

			// arclength parameterization
			var numPoints = p.length;
			var r = Math.PI / 50;

			var dists = new Array(numPoints);
			for (var i = 0; i < numPoints - 1; i++) {
				dists[i] = D2(p[i][type].lat, p[i][type].lng, p[i + 1][type].lat, p[i + 1][type].lng);
			}
			dists[numPoints - 1] = D2(p[numPoints - 1][type].lat, p[numPoints - 1][type].lng, p[0][type].lat, p[0][type].lng);

			var sumDist = 0;
			for (var _i = 0; _i < numPoints; _i++) {
				sumDist += dists[_i];
			}

			var ts = new Array(numPoints);
			ts[0] = 0;
			var partialDist = 0;

			for (var _i2 = 0; _i2 < numPoints - 1; _i2++) {
				partialDist += dists[_i2];
				ts[_i2 + 1] = partialDist / sumDist;
			}

			// calculate angles
			var vs = new Array(numPoints);
			for (var _i3 = 0; _i3 < numPoints; _i3++) {
				vs[_i3] = new Array(2);
			}for (var _i4 = 0; _i4 < numPoints - 1; _i4++) {
				vs[_i4][0] = p[_i4][type].lat - p[_i4 + 1][type].lat;
				vs[_i4][1] = p[_i4][type].lng - p[_i4 + 1][type].lng;
			}
			vs[numPoints - 1][0] = p[numPoints - 1][type].lat - p[0][type].lat;
			vs[numPoints - 1][1] = p[numPoints - 1][type].lng - p[0][type].lng;

			var angs = new Array(numPoints);

			angs[0] = Math.acos(vs[0][0] * vs[numPoints - 1][0] + vs[0][1] * vs[numPoints - 1][1] / (lenVector(vs[0][0], vs[0][1]) * lenVector(vs[numPoints - 1][0], vs[numPoints - 1][1])));

			for (var _i5 = 1; _i5 < numPoints; _i5++) {
				angs[_i5] = Math.acos(vs[_i5][0] * vs[_i5 - 1][0] + vs[_i5][1] * vs[_i5 - 1][1] / (lenVector(vs[_i5][0], vs[_i5][1]) * lenVector(vs[_i5 - 1][0], vs[_i5 - 1][1])));
			}

			var as = new Array(d - 1);
			var bs = new Array(d - 1);
			for (var k = 1; k <= d; k++) {
				as[k - 1] = a(k, angs, ts, r);
				bs[k - 1] = b(k, angs, ts, r);
			}

			//console.log('type: ' + type);
			//console.log('dists: ');
			//console.log(dists);
			//console.log('ts: ');
			//console.log(ts);
			//console.log('angs: ');
			//console.log(angs);

			//console.log('as: ');
			//console.log(as);
			//console.log('bs: ');
			//console.log(bs);

			return { as: as, bs: bs };
		}
	}, {
		key: "saveTextAsFile",
		value: function saveTextAsFile(textToWrite, fileNameToSaveAs) {
			textToWrite = JSON.stringify(textToWrite);
			var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			downloadLink.innerHTML = "Download File";
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);

			/*
   if (window.webkitURL != null) {
     // Chrome allows the link to be clicked
     // without actually adding it to the DOM.
     downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob)
   }
   else {
     // Firefox requires the link to be added to the DOM
     // before it can be clicked.
     downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
     downloadLink.onclick = destroyClickedElement
     downloadLink.style.display = "none"
     document.body.appendChild(downloadLink)
   }
   */
			downloadLink.click();
		}
	}, {
		key: "randomGaussian",
		value: function randomGaussian(mean, standardDeviation) {
			//mean = defaultTo(mean, 0.0);
			//standardDeviation = defaultTo(standardDeviation, 1.0);

			if (Math.randomGaussian.nextGaussian !== undefined) {
				var nextGaussian = Math.randomGaussian.nextGaussian;
				delete Math.randomGaussian.nextGaussian;
				return nextGaussian * standardDeviation + mean;
			} else {
				var v1, v2, s, multiplier;
				do {
					v1 = 2 * Math.random() - 1; // between -1 and 1
					v2 = 2 * Math.random() - 1; // between -1 and 1
					s = v1 * v1 + v2 * v2;
				} while (s >= 1 || s == 0);
				multiplier = Math.sqrt(-2 * Math.log(s) / s);
				Math.randomGaussian.nextGaussian = v2 * multiplier;
				return v1 * multiplier * standardDeviation + mean;
			}
		}
	}]);

	return TgUtil;
}();

module.exports = new TgUtil();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgNode = function TgNode(orgLat, orgLng) {
	_classCallCheck(this, TgNode);

	this.original = { lat: orgLat, lng: orgLng };
	this.target = { lat: orgLat, lng: orgLng };
	this.real = { lat: orgLat, lng: orgLng };
	this.disp = { lat: orgLat, lng: orgLng
		// [optional] this.degree = 0
		// [optional] this.travelTime = 0
	};
};

module.exports = TgNode;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgData = __webpack_require__(17);
var TgMap = __webpack_require__(19);
var TgGraph = __webpack_require__(18);

var TgApp = function () {
	function TgApp(map_id) {
		_classCallCheck(this, TgApp);

		this.graph = new TgGraph(this);
		this.data = TgData;
		this.map = new TgMap(this, map_id);

		//this.map.setArea('seattleDowntown');
		//this.map.setArea('seattleUw');
		//this.map.setArea('nyNyu');
		//this.map.setArea('sfLombard');
	}

	_createClass(TgApp, [{
		key: 'setCurrentLocationToOrigin',
		value: function setCurrentLocationToOrigin() {
			this.map.setOriginByCurrentLocation();
		}
	}, {
		key: 'setOriginAndGo',
		value: function setOriginAndGo(param) {
			this.map.setOrigin(param);
		}
	}, {
		key: 'initMap',
		value: function initMap() {
			this.map.initMap();
		}
	}, {
		key: 'goToEm',
		value: function goToEm() {
			this.map.goToEm();
		}
	}, {
		key: 'goToDc',
		value: function goToDc(dcMode) {
			this.map.warpingMode = dcMode;
			if (this.map.currentMode !== 'DC') this.map.goToDc(true); // animation
			else this.map.goToDc(false); // no animation
		}
	}, {
		key: 'setTransportTypeAndGo',
		value: function setTransportTypeAndGo(type) {
			this.map.changeTransportType(type);
		}
	}, {
		key: 'zoomIn',
		value: function zoomIn() {
			this.map.zoomIn();
		}
	}, {
		key: 'zoomOut',
		value: function zoomOut() {
			this.map.zoomOut();
		}
	}]);

	return TgApp;
}();

module.exports = TgApp;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgTavelTimeApi = function () {
	function TgTavelTimeApi() {
		_classCallCheck(this, TgTavelTimeApi);

		this.centerLocation = {};
		this.locations = [];
		this.maxNumLocation = 48;
		this.totalNumOfRequest = 0;
		this.numOfRequest = 0;
		this.timeoutTime = 500; //ms
		this.times = [];
		this.callbackFunction = null;
	}

	_createClass(TgTavelTimeApi, [{
		key: 'setStartLocation',
		value: function setStartLocation(lat, lng) {
			this.centerLocation = { lat: lat, lon: lng };
		}
	}, {
		key: 'addEndLocation',
		value: function addEndLocation(lat, lng) {
			this.locations.push({ lat: lat, lon: lng });
		}
	}, {
		key: 'clearLocations',
		value: function clearLocations() {
			this.centerLocation = {};
			this.locations = [];
		}
	}, {
		key: 'clearEndLocations',
		value: function clearEndLocations() {
			this.locations = [];
		}
	}, {
		key: 'getTravelTime',
		value: function getTravelTime(mode, cb) {
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
	}, {
		key: 'deepClone',
		value: function deepClone(input) {
			return JSON.parse(JSON.stringify(input));
		}

		// mode: 'auto', 'bicycle' or 'pedestrian'

	}, {
		key: 'requestTravelTime',
		value: function requestTravelTime(mode) {

			var locations = void 0;

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

			var json = { locations: locations, costing: mode };
			//const json = {locations:locations, costing:'auto'};
			//const json = {locations:locations, costing:'bicycle'};
			//const json = {locations:locations, costing:'pedestrian'};

			var str = 'https://matrix.mapzen.com/one_to_many?json=';
			str += JSON.stringify(json);
			str += '&api_key=matrix-qUpjg6W';
			//str += '&api_key=matrix-AGvGZKs';

			//console.log(str);
			$.get(str, this.processTravelTime.bind(this));
		}
	}, {
		key: 'processTravelTime',
		value: function processTravelTime(result) {
			//console.log('result: ');
			//console.log(result);

			for (var index = 1; index < result.one_to_many[0].length; index++) {
				this.times.push(result.one_to_many[0][index].time);
			}

			//console.log('this.numOfRequest + 1: ' + this.numOfRequest + 1);
			//console.log('this.totalNumOfRequest: ' + this.totalNumOfRequest);

			if (++this.numOfRequest === this.totalNumOfRequest) {
				this.finishGettingTravelTime();
			} else {
				//console.log('requesting...');
				setTimeout(this.requestTravelTime.bind(this), this.timeoutTime);
			}
		}
	}, {
		key: 'finishGettingTravelTime',
		value: function finishGettingTravelTime() {
			console.log('received travel time data.');
			//console.log(this.times);
			this.callbackFunction(this.times);
		}
	}]);

	return TgTavelTimeApi;
}();

module.exports = TgTavelTimeApi;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var TgApp = __webpack_require__(2);

// create the main app object
var tg = new TgApp('ol_map');

/*
 * For the origin setting
 */
var myHome = {
	address: '4225 24th Ave. NE, Seattle, WA',
	lat: 47.6631772,
	lng: -122.3104933
};

/* 
followings are also possible:

const myHome = {
	address: '4225 24th Ave. NE Seattle',
	// if lat and lng are omitted, the app search them automatically.
};

const myHome = {
	lat: 47.706846,
	lng: -122.302471,
	// providing lat and lng make the app faster.
};*/

var myOffice = {
	address: '3960 Benton Lane NE, Seattle, WA'
};

var otherPlace = {
	address: '1000 4th Ave, Seattle, WA 98104'

	// default: myHome
};tg.setOriginAndGo(myHome);
//tg.setOriginAndGo(myOffice);
//tg.setOriginAndGo(otherPlace);

// ui for origin setting
$("#yourHomeInput").val(myHome.address);
$("#yourOfficeInput").val(myOffice.address);
$("#otherPlaceInput").val(otherPlace.address);

$("#originYourLocationRB").change(function (ev) {
	if (ev.target.checked) {
		tg.initMap();
		tg.setCurrentLocationToOrigin();
	}
});

$("#originYourHomeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.initMap();
		tg.setOriginAndGo(myHome);
	}
});

$("#originYourOfficeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.initMap();
		tg.setOriginAndGo(myOffice);
	}
});

$("#originOtherPlaceRB").change(function (ev) {
	if (ev.target.checked) {
		tg.initMap();
		otherPlace.address = $("#otherPlaceInput").val();
		tg.setOriginAndGo(otherPlace);
	}
});

/*
 * For the mode of the map (EM <-> DC)
 */

$("#emModeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.goToEm();
	}
});

$("#dcSGapModeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.goToDc('shapePreserving');
	}
});

$("#dcGapModeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.goToDc('noIntersection');
	}
});

$("#dcOriginalModeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.goToDc('originalDC');
	}
});

$("#dcNoWarpModeRB").change(function (ev) {
	if (ev.target.checked) {
		tg.goToDc('noWarping');
	}
});

/*
 * For the mode of the transportation
 */
$("#transportVehiclesRB").change(function (ev) {
	if (ev.target.checked) {
		tg.setTransportTypeAndGo('auto');
	}
});

$("#transportBicyclesRB").change(function (ev) {
	if (ev.target.checked) {
		tg.setTransportTypeAndGo('bicycle');
	}
});

$("#transportOnFootRB").change(function (ev) {
	if (ev.target.checked) {
		tg.setTransportTypeAndGo('pedestrian');
	}
});

/*
 * For the type of the destination
 */
$("#locationRestaurantRB").change(function (ev) {
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('food');
	}
});

$("#locatioBarRB").change(function (ev) {
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('bar');
	}
});

$("#locationParkRB").change(function (ev) {
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('park');
	}
});

$("#locationMuseumRB").change(function (ev) {
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('museum');
	}
});

/*
 * For general ui
 */

function zoomIn() {
	tg.zoomIn();
}

function zoomOut() {
	tg.zoomOut();
}

// Visual Elements Representation Options (For debugging)

$("#dispWaterCB").change(function (ev) {
	tg.map.tgWater.turn(ev.target.checked);
	tg.map.tgWater.render();
});

$("#dispRoadsCB").change(function (ev) {
	tg.map.tgRoads.turn(ev.target.checked);
	tg.map.tgRoads.render();
});

$("#dispLanduseCB").change(function (ev) {
	tg.map.tgLanduse.turn(ev.target.checked);
	tg.map.tgLanduse.render();
});

$("#dispLocationCB").change(function (ev) {
	tg.map.tgLocs.turn(ev.target.checked);
	tg.map.tgLocs.render();
});

$("#dispPlaceCB").change(function (ev) {
	tg.map.tgPlaces.turn(ev.target.checked);
	tg.map.tgPlaces.render();
});

$("#dispNodesCB").change(function (ev) {
	tg.map.dispNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispOriginCB").change(function (ev) {
	tg.map.tgOrigin.turn(ev.target.checked);
	tg.map.tgOrigin.render();
});

$("#dispBoundingBoxCB").change(function (ev) {
	tg.map.tgBB.turn(ev.target.checked);
	tg.map.tgBB.render();
});

$("#dispControlPointsCB").change(function (ev) {
	tg.map.dispControlPointLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispGridCB").change(function (ev) {
	tg.map.tgGrids.turn(ev.target.checked);
	tg.map.tgGrids.render();
});

$("#dispIsochroneCB").change(function (ev) {
	tg.map.tgIsochrone.turn(ev.target.checked);
	tg.map.tgIsochrone.render();
});

/*$("#dispWaterNodeCB").change(function(ev){ 
	tg.map.dispWaterNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispRoadNodeCB").change(function(ev){ 
	tg.map.dispRoadNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispLanduseNodeCB").change(function(ev){ 
	tg.map.dispLanduseNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});*/

function debug() {
	tg.map.debug();
}

/*
// Center Options
$("#centerDowntownSeattleRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('seattleDowntown');
  }
});

$("#centerUWSeattleRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('seattleUw');
  }
});

$("#centerLombardSFRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('sfLombard');
  }
});

$("#centerNYUNYRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('nyNyu');
  }
});

$("#centerStanfordPaloAltoRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('paloAltoStanford');
  }
});

$("#centerCitadelleQuebecRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('quebecCitadelle');
  }
});

$("#centerYourPositionRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setCenterUserPosition();
  }
});*/

/*
// Roads Options
$("#roadTypeHighwayCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('highway');
	else tg.map.removeRoadType('highway');
	tg.map.updateLayers();
})

$("#roadTypePrimaryCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('primary');
	else tg.map.removeRoadType('primary');
	tg.map.updateLayers(); 
})

$("#roadTypeSecondaryCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('secondary');
	else tg.map.removeRoadType('secondary');
	tg.map.updateLayers(); 
})

$("#roadTypeTertiaryCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('tertiary');
	else tg.map.removeRoadType('tertiary');
	tg.map.updateLayers(); 
})

$("#roadTypeResidentialCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('residential');
	else tg.map.removeRoadType('residential');
	tg.map.updateLayers();  
})

$("#roadTypeLinksCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('links');
	else tg.map.removeRoadType('links');
	tg.map.updateLayers();  
})*/

/*var randomSlider = new Slider("#randomSlider");
//$("#randomSlider").on("change", function(evt) {
$("#randomSlider").on("slideStop", function(evt) {
  tg.data.randomness = evt.value / 100;
  tg.data.moveControlPoints();
  tg.map.updateLayers();
});*/

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tgUtil = __webpack_require__(0);
var TgLocationNode = __webpack_require__(16);

var TgMapBoundingBox = function () {
	function TgMapBoundingBox(map, data, graph) {
		_classCallCheck(this, TgMapBoundingBox);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.display = false;
		this.boundingBoxLayer = null;

		this.BBs = [];
		this.locs = [];
	}

	_createClass(TgMapBoundingBox, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.display) this.updateLayer();else this.removeLayer();
		}

		/*getOverlappedBB(inBB) {
  	for(let bb of this.BBs) {
  		if (tgUtil.intersectRect(inBB, bb)) return bb;
  	}
  	return null;
  }*/

	}, {
		key: 'calBBOfOrigin',
		value: function calBBOfOrigin() {
			var iconLatPx = 50;
			var iconLngPx = 55;
			var dLat = iconLatPx * this.data.var.latPerPx / 2;
			var dLng = iconLngPx * this.data.var.lngPerPx / 2;
			var dispOrigin = this.map.tgOrigin.origin.disp;

			return {
				left: dispOrigin.lng - dLng,
				right: dispOrigin.lng + dLng,
				top: dispOrigin.lat - dLat,
				bottom: dispOrigin.lat + dLat
			};
		}
	}, {
		key: 'calBBOfLocations',
		value: function calBBOfLocations(locations) {
			var iconLatPx = 30;
			var iconLngPx = 30;
			var dLat = iconLatPx * this.data.var.latPerPx / 2;
			var dLng = iconLngPx * this.data.var.lngPerPx / 2;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = locations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var loc = _step.value;

					var disp = loc.node.dispLoc;
					loc.bb = {
						left: disp.lng - dLng,
						right: disp.lng + dLng,
						top: disp.lat - dLat,
						bottom: disp.lat + dLat
					};
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'calClusteredLocations',
		value: function calClusteredLocations(locations) {
			var clusteredLocations = [];

			for (var i = 0; i < locations.length; i++) {
				var targetLoc = locations[i];

				// check overlapped bb
				var overlappedLoc = null;
				for (var j = i + 1; j < locations.length; j++) {
					var loc = locations[j];

					if (tgUtil.intersectRect(targetLoc.bb, loc.bb)) {
						overlappedLoc = loc;
						break;
					}
				}

				if (overlappedLoc) {
					// if there is any overlapped location

					// if the overlapped loc already exists in the cluster
					var found = false;
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = clusteredLocations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var cLocs = _step2.value;
							var _iteratorNormalCompletion3 = true;
							var _didIteratorError3 = false;
							var _iteratorError3 = undefined;

							try {
								for (var _iterator3 = cLocs.locs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
									var cLoc = _step3.value;

									if (cLoc === targetLoc) {
										cLocs.locs.push(overlappedLoc);
										found = true;
										break;
									}
								}
							} catch (err) {
								_didIteratorError3 = true;
								_iteratorError3 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion3 && _iterator3.return) {
										_iterator3.return();
									}
								} finally {
									if (_didIteratorError3) {
										throw _iteratorError3;
									}
								}
							}

							if (found) break;
						}

						// if the overlapped loc doesn't exist in the cluster
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					if (!found) {
						clusteredLocations.push({
							locs: [targetLoc, overlappedLoc]
						});
					}
				}
			}

			// set isInCluster property
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = locations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var _loc = _step4.value;

					_loc.isInCluster = false;
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = clusteredLocations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var _cLocs = _step5.value;
					var _iteratorNormalCompletion6 = true;
					var _didIteratorError6 = false;
					var _iteratorError6 = undefined;

					try {
						for (var _iterator6 = _cLocs.locs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
							var _cLoc = _step6.value;

							_cLoc.isInCluster = true;
						}
					} catch (err) {
						_didIteratorError6 = true;
						_iteratorError6 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion6 && _iterator6.return) {
								_iterator6.return();
							}
						} finally {
							if (_didIteratorError6) {
								throw _iteratorError6;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			return clusteredLocations;
		}
	}, {
		key: 'updateNodeOfClusteredLocations',
		value: function updateNodeOfClusteredLocations(locationClusters) {
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = locationClusters[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var cLocs = _step7.value;

					var dispLoc = { lat: 0, lng: 0 };
					var dispAnchor = { lat: 0, lng: 0 };

					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = cLocs.locs[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var cLoc = _step8.value;

							dispLoc.lat += cLoc.node.dispLoc.lat;
							dispLoc.lng += cLoc.node.dispLoc.lng;
							dispAnchor.lat += cLoc.node.dispAnchor.lat;
							dispAnchor.lng += cLoc.node.dispAnchor.lng;
						}
					} catch (err) {
						_didIteratorError8 = true;
						_iteratorError8 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion8 && _iterator8.return) {
								_iterator8.return();
							}
						} finally {
							if (_didIteratorError8) {
								throw _iteratorError8;
							}
						}
					}

					var len = cLocs.locs.length;
					dispLoc.lat /= len;
					dispLoc.lng /= len;
					dispAnchor.lat /= len;
					dispAnchor.lng /= len;

					cLocs.node = new TgLocationNode(dispLoc.lat, dispLoc.lng);
					cLocs.node.dispAnchor = dispAnchor;
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		}
	}, {
		key: 'calBBOfClusterLocations',
		value: function calBBOfClusterLocations(locationClusters) {
			var clusterLatPx = 45;
			var clusterLngPx = 45;
			var cLat = clusterLatPx * this.data.var.latPerPx / 2;
			var cLng = clusterLngPx * this.data.var.lngPerPx / 2;

			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = locationClusters[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var cLocs = _step9.value;

					var disp = cLocs.node.dispLoc;
					cLocs.bb = {
						left: disp.lng - cLng,
						right: disp.lng + cLng,
						top: disp.lat - cLat,
						bottom: disp.lat + cLat
					};
				}
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9.return) {
						_iterator9.return();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}
		}
	}, {
		key: 'calNonOverlappedLocationNames',
		value: function calNonOverlappedLocationNames(locations, locationClusters) {
			// location names in the cluster are not displayed
			var _iteratorNormalCompletion10 = true;
			var _didIteratorError10 = false;
			var _iteratorError10 = undefined;

			try {
				for (var _iterator10 = locationClusters[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
					var cLoc = _step10.value;
					var _iteratorNormalCompletion12 = true;
					var _didIteratorError12 = false;
					var _iteratorError12 = undefined;

					try {
						for (var _iterator12 = cLoc.locs[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
							var loc = _step12.value;
							loc.dispName = false;
						}
					} catch (err) {
						_didIteratorError12 = true;
						_iteratorError12 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion12 && _iterator12.return) {
								_iterator12.return();
							}
						} finally {
							if (_didIteratorError12) {
								throw _iteratorError12;
							}
						}
					}
				}

				// calculate non-overlapped location names
			} catch (err) {
				_didIteratorError10 = true;
				_iteratorError10 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion10 && _iterator10.return) {
						_iterator10.return();
					}
				} finally {
					if (_didIteratorError10) {
						throw _iteratorError10;
					}
				}
			}

			var _iteratorNormalCompletion11 = true;
			var _didIteratorError11 = false;
			var _iteratorError11 = undefined;

			try {
				for (var _iterator11 = locations[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
					var _loc2 = _step11.value;


					if (_loc2.isInCluster) continue;

					for (var i = 0; i < 8; i++) {
						var ret = this.getCandidatePosition(i, _loc2.node.dispLoc.lat, _loc2.node.dispLoc.lng, _loc2.name);

						if (this.isItNotOverlappedByLocs(locations, locationClusters, ret.bb)) {
							_loc2.dispName = true;
							_loc2.nameOffsetX = ret.offset.x;
							_loc2.nameOffsetY = ret.offset.y;
							_loc2.nameAlign = ret.offset.align;
							_loc2.nameBB = ret.bb;
							break;
						}

						// if not possible
						if (i === 7) {
							_loc2.dispName = false;
							console.log('fail to put a loc.');
						}
					}
				}
			} catch (err) {
				_didIteratorError11 = true;
				_iteratorError11 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion11 && _iterator11.return) {
						_iterator11.return();
					}
				} finally {
					if (_didIteratorError11) {
						throw _iteratorError11;
					}
				}
			}
		}
	}, {
		key: 'isItNotOverlappedByLocs',
		value: function isItNotOverlappedByLocs(locations, locationClusters, inBB) {
			var _iteratorNormalCompletion13 = true;
			var _didIteratorError13 = false;
			var _iteratorError13 = undefined;

			try {
				for (var _iterator13 = locations[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
					var loc = _step13.value;

					if (loc.bb && tgUtil.intersectRect(inBB, loc.bb)) return false;
					if (loc.nameBB && tgUtil.intersectRect(inBB, loc.nameBB)) return false;
				}
			} catch (err) {
				_didIteratorError13 = true;
				_iteratorError13 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion13 && _iterator13.return) {
						_iterator13.return();
					}
				} finally {
					if (_didIteratorError13) {
						throw _iteratorError13;
					}
				}
			}

			var _iteratorNormalCompletion14 = true;
			var _didIteratorError14 = false;
			var _iteratorError14 = undefined;

			try {
				for (var _iterator14 = locationClusters[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
					var cLoc = _step14.value;

					if (cLoc.bb && tgUtil.intersectRect(inBB, cLoc.bb)) return false;
				}
			} catch (err) {
				_didIteratorError14 = true;
				_iteratorError14 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion14 && _iterator14.return) {
						_iterator14.return();
					}
				} finally {
					if (_didIteratorError14) {
						throw _iteratorError14;
					}
				}
			}

			return true;
		}
	}, {
		key: 'isItNotOverlappedPlaces',
		value: function isItNotOverlappedPlaces(places, inBB) {
			for (var name in places) {
				var bb = places[name].bb;
				if (bb && tgUtil.intersectRect(inBB, bb)) return false;
			}
			return true;
		}
	}, {
		key: 'getNonOverlappedPlaces',
		value: function getNonOverlappedPlaces(placesByZoom) {
			var locations = this.map.tgLocs.getCurrentLocations();
			var locationClusters = this.map.tgLocs.getCurrentLocationClusters();
			var minZoom = this.map.tgPlaces.minZoomOfPlaces;
			var maxZoom = this.map.tgPlaces.maxZoomOfPlaces;
			var currentZoom = this.data.zoom.current;
			var latPerPx = this.data.var.latPerPx;
			var lngPerPx = this.data.var.lngPerPx;

			//const top = this.data.box.top + this.data.var.latMargin;
			//const bottom = this.data.box.bottom - this.data.var.latMargin;
			//const right = this.data.box.right + this.data.var.lngMargin;
			//const left = this.data.box.left - this.data.var.lngMargin;
			var top = this.data.box.top;
			var bottom = this.data.box.bottom;
			var right = this.data.box.right;
			var left = this.data.box.left;

			var dispPlaces = {};

			for (var zoom = minZoom; zoom <= currentZoom; zoom++) {
				for (var name in placesByZoom[zoom]) {
					var place = placesByZoom[zoom][name];
					var lng = place.node.disp.lng;
					var lat = place.node.disp.lat;

					if (!(lat < top && lat > bottom && lng < right && lng > left)) continue;

					//if (!place.bb) {
					var widthPx = name.length * 8;
					var heightPx = 14;

					var bb = {
						left: lng - widthPx * lngPerPx,
						right: place.node.disp.lng + widthPx * lngPerPx,
						top: place.node.disp.lat - heightPx * latPerPx,
						bottom: place.node.disp.lat + heightPx * latPerPx
					};
					place.bb = bb;
					//}

					if (this.isItNotOverlappedByLocs(locations, locationClusters, place.bb) && this.isItNotOverlappedPlaces(dispPlaces, place.bb)) {
						dispPlaces[name] = place;
						//console.log('z: ' + zoom + ' n: ' + name);
					}
				}
			}
			return dispPlaces;
		}

		/*calClusteredLocations2(locations) {
  	const iconLatPx = 30;
  	const iconLngPx = 30;
  	const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
  	const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;
  	let clusteredLocations = [];
  		// make clusterdLocations array
  	for(let loc of locations) {
  		const bb = {
  			left: loc.lng - dLng, 
  			right: loc.lng + dLng,
  			top: loc.lat - dLat,
  			bottom: loc.lat + dLat,
  			type: 'location',
  			source: loc,
  		};
  			// check overlapping
  		const overlappedBB = this.getOverlappedBB(bb);
  			if (overlappedBB) {
  			// if any bb is overlaped by loc
  			for(let cLocs of clusteredLocations) {
  				for(let cLoc of cLocs) {
  					if (cLoc === overlappedBB.source) {
  						cLocs.push(loc);
  						break;
  					}
  				}
  			}
  		}
  		else {
  			// not overlapped
  			clusteredLocations.push([loc]);
  		}
  		this.BBs.push(bb);
  	}
  		// update bbs
  	const clusterLatPx = 45;
  	const clusterLngPx = 45;
  	const cLat = (clusterLatPx * this.data.var.latPerPx) / 2;
  	const cLng = (clusterLngPx * this.data.var.lngPerPx) / 2;
  		for(let cLocs of clusteredLocations) {
  		if (cLocs.length !== 1) {
  			let avgLng = 0;
  			let avgLat = 0;
  				for(let cLoc of cLocs) {
  				avgLng += cLoc.lng;
  				avgLat += cLoc.lat;
  					for(let bb of this.BBs) {
  					if (bb.source === cLoc) {
  						bb.deleted = true;
  						break;
  					}
  				}
  			}
  				avgLng /= cLocs.length;
  			avgLat /= cLocs.length;
  				const bb = {
  				left: avgLng - cLng, 
  				right: avgLng + cLng,
  				top: avgLat - cLat,
  				bottom: avgLat + cLat,
  				type: 'locationCluster',
  				source: cLocs,
  			};
  			this.BBs.push(bb);
  		}
  	}
  		let newBBs = [];
  	for(let bb of this.BBs) {
  		if (!bb.deleted) newBBs.push(bb);
  	}
  	this.BBs = newBBs;
  		return clusteredLocations;	
  }*/

		/*getNonOverlappedLocations(locations) {
  	const iconLatPx = 30;
  	const iconLngPx = 30;
  	const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
  	const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;
  	let nonOverlappedLocations = [];
  		for(let loc of locations) {
  		const bb = {
  			left: loc.lng - dLng, 
  			right: loc.lng + dLng,
  			top: loc.lat - dLat,
  			bottom: loc.lat + dLat,
  			type: 'location',
  		};
  			if (this.isItNotOverlapped(bb)) {
  			nonOverlappedLocations.push(loc);
  			this.BBs.push(bb);
  		}
  	}
  	return nonOverlappedLocations;
  }*/

	}, {
		key: 'addBBOfLocations',
		value: function addBBOfLocations() {
			var locations = this.map.tgLocs.locations[this.map.tgLocs.currentType];

			var iconLatPx = 30;
			var iconLngPx = 30;
			var dLat = iconLatPx * this.data.var.latPerPx / 2;
			var dLng = iconLngPx * this.data.var.lngPerPx / 2;

			var _iteratorNormalCompletion15 = true;
			var _didIteratorError15 = false;
			var _iteratorError15 = undefined;

			try {
				for (var _iterator15 = locations[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
					var loc = _step15.value;

					this.BBs.push({
						left: loc.node.dispLoc.lng - dLng,
						right: loc.node.dispLoc.lng + dLng,
						top: loc.node.dispLoc.lat - dLat,
						bottom: loc.node.dispLoc.lat + dLat,
						type: 'location'
					});
				}
			} catch (err) {
				_didIteratorError15 = true;
				_iteratorError15 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion15 && _iterator15.return) {
						_iterator15.return();
					}
				} finally {
					if (_didIteratorError15) {
						throw _iteratorError15;
					}
				}
			}
		}
	}, {
		key: 'getCandidatePosition',
		value: function getCandidatePosition(index, lat, lng, name) {
			var latPerPx = this.data.var.latPerPx;
			var lngPerPx = this.data.var.lngPerPx;

			var widthPx = name.length * 8;
			var heightPx = 14;

			var lngMarginPx = 20; // left/right margin
			var latMarginPx = 25; // top/bottom margin
			var extraLatMarginPx = 10;

			var dLng = widthPx * lngPerPx / 2;
			var dLat = heightPx * latPerPx / 2;

			switch (index) {
				case 0:
					// right
					return {
						bb: {
							left: lng + lngMarginPx * lngPerPx,
							right: lng + lngMarginPx * lngPerPx + 2 * dLng,
							top: lat - dLat,
							bottom: lat + dLat
						},
						offset: {
							x: lngMarginPx, y: 0, align: 'left'
						}
					};
				case 1:
					// up
					return {
						bb: {
							left: lng - dLng,
							right: lng + dLng,
							top: lat + latMarginPx * latPerPx - dLat,
							bottom: lat + latMarginPx * latPerPx + dLat
						},
						offset: {
							x: 0, y: -latMarginPx, align: 'center'
						}
					};
				case 2:
					// left
					return {
						bb: {
							left: lng - lngMarginPx * lngPerPx - 2 * dLng,
							right: lng - lngMarginPx * lngPerPx,
							top: lat - dLat,
							bottom: lat + dLat
						},
						offset: {
							x: -lngMarginPx, y: 0, align: 'right'
						}
					};
				case 3:
					// bottom
					return {
						bb: {
							left: lng - dLng,
							right: lng + dLng,
							top: lat - latMarginPx * latPerPx - dLat,
							bottom: lat - latMarginPx * latPerPx + dLat
						},
						offset: {
							x: 0, y: latMarginPx, align: 'center'
						}
					};
				case 4:
					// right - up
					return {
						bb: {
							left: lng + lngMarginPx * lngPerPx,
							right: lng + lngMarginPx * lngPerPx + 2 * dLng,
							top: lat + extraLatMarginPx * latPerPx - dLat,
							bottom: lat + extraLatMarginPx * latPerPx + dLat
						},
						offset: {
							x: lngMarginPx, y: -extraLatMarginPx, align: 'left'
						}
					};
				case 5:
					// left - up
					return {
						bb: {
							left: lng - lngMarginPx * lngPerPx - 2 * dLng,
							right: lng - lngMarginPx * lngPerPx,
							top: lat + extraLatMarginPx * latPerPx - dLat,
							bottom: lat + extraLatMarginPx * latPerPx + dLat
						},
						offset: {
							x: -lngMarginPx, y: -extraLatMarginPx, align: 'right'
						}
					};
				case 6:
					// left - bottom
					return {
						bb: {
							left: lng - lngMarginPx * lngPerPx - 2 * dLng,
							right: lng - lngMarginPx * lngPerPx,
							top: lat - extraLatMarginPx * latPerPx - dLat,
							bottom: lat - extraLatMarginPx * latPerPx + dLat
						},
						offset: {
							x: -lngMarginPx, y: extraLatMarginPx, align: 'right'
						}
					};
				case 7:
					// right - bottom
					return {
						bb: {
							left: lng + lngMarginPx * lngPerPx,
							right: lng + lngMarginPx * lngPerPx + 2 * dLng,
							top: lat - extraLatMarginPx * latPerPx - dLat,
							bottom: lat - extraLatMarginPx * latPerPx + dLat
						},
						offset: {
							x: lngMarginPx, y: extraLatMarginPx, align: 'left'
						}
					};
			}
		}
	}, {
		key: 'cleanBB',
		value: function cleanBB() {
			this.BBs = [];
		}
	}, {
		key: 'deleteBBByType',
		value: function deleteBBByType(type) {
			var newBBs = [];

			while (this.BBs.length > 0) {
				var bb = this.BBs.shift();
				if (bb.type !== type) newBBs.push(bb);
			}
			this.BBs = newBBs;
		}
	}, {
		key: 'calNonOverlappedPlaces',
		value: function calNonOverlappedPlaces(places) {
			this.deleteBBByType('place');

			var currentZoom = this.data.zoom.current;
			var latPerPx = this.data.var.latPerPx;
			var lngPerPx = this.data.var.lngPerPx;
			var nonOverlappedPlaces = {};

			for (var name in places) {
				var place = places[name];

				if (currentZoom < place.minZoom) {
					console.log('zoooooooom!');
					continue;
				}

				if (currentZoom > place.maxZoom) {
					console.log('zoooooooom?');
					continue;
				}

				var lat = place.node.disp.lat;
				var lng = place.node.disp.lng;
				var pxLat = 14;
				var pxLng = name.length * 7;
				var _heightLat = pxLat * latPerPx;
				var _widthLng = pxLng * lngPerPx;
				var _dLat = pxLat * latPerPx / 2;
				var _dLng = pxLng * lngPerPx / 2;
				var bb = {
					left: lng - _dLng,
					right: lng + _dLng,
					top: lat - _dLat,
					bottom: lat + _dLat,
					type: 'place'
				};

				if (this.isItNotOverlappedByLocs(bb)) {
					this.BBs.push(bb);
					nonOverlappedPlaces[name] = place;
				}
			}
			return nonOverlappedPlaces;
		}
	}, {
		key: 'addBB',
		value: function addBB(lat, lng, pxLat, pxLng) {
			var offsetPxLat = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
			var offsetPxLng = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
			var kind = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'center';
			var loc = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
			var noCheck = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;


			var bb = void 0;
			if (kind === 'center') {
				bb = {
					left: offsetLng + lng - dLng,
					right: offsetLng + lng + dLng,
					top: offsetLat + lat - dLat,
					bottom: offsetLat + lat + dLat
				};
			} else if (kind === 'left') {
				bb = {
					left: offsetLng + lng,
					right: offsetLng + lng + widthLng,
					top: offsetLat + lat - dLat,
					bottom: offsetLat + lat + dLat
				};
			}

			var offsetX = 17;
			var offsetY = 0;
			var align = 'left';
			var ok = true;
			if (!noCheck) {

				// try original (right) position
				ok = this.isItNotOverlappedByLocs(bb);

				// try upper position
				if (!ok) {
					bb = {
						left: lng - dLng,
						right: lng + dLng,
						top: 25 * latPerPx + lat - dLat,
						bottom: 25 * latPerPx + lat + dLat
					};
					ok = this.isItNotOverlappedByLocs(bb);
					//ok = false;

					if (ok) {
						console.log('upper position ok.');
						offsetX = 0;
						offsetY = -25;
						align = 'center';
					}
				}

				// try left position
				if (!ok) {
					bb = {
						left: -(20 * lngPerPx) + lng - widthLng,
						right: -(20 * lngPerPx) + lng,
						top: lat - dLat,
						bottom: lat + dLat
					};
					ok = this.isItNotOverlappedByLocs(bb);
					//ok = false;

					if (ok) {
						console.log('left position ok.');
						offsetX = -20;
						offsetY = 0;
						align = 'right';
					}
				}

				// try bottom position
				if (!ok) {
					bb = {
						left: lng - dLng,
						right: lng + dLng,
						top: -(25 * latPerPx) + lat - dLat,
						bottom: -(25 * latPerPx) + lat + dLat
					};
					ok = this.isItNotOverlappedByLocs(bb);
					//ok = false;

					if (ok) {
						console.log('bottom position ok.');
						offsetX = 0;
						offsetY = 25;
						align = 'center';
					}
				}

				// try right - top position
				if (!ok) {
					bb = {
						left: offsetLng + lng,
						right: offsetLng + lng + widthLng,
						top: 5 * latPerPx + offsetLat + lat,
						bottom: 5 * latPerPx + offsetLat + lat + heightLat
					};
					ok = this.isItNotOverlappedByLocs(bb);
					//ok = false;

					if (ok) {
						console.log('right - top position ok.');
						offsetX = 17;
						offsetY = -10;
						align = 'left';
					}
				}

				// try left - top position
				if (!ok) {
					bb = {
						left: -(17 * lngPerPx) + lng - widthLng,
						right: -(17 * lngPerPx) + lng,
						top: 5 * latPerPx + offsetLat + lat,
						bottom: 5 * latPerPx + offsetLat + lat + heightLat
					};
					ok = this.isItNotOverlappedByLocs(bb);
					//ok = true;

					if (ok) {
						console.log('right - top position ok.');
						offsetX = -17;
						offsetY = -10;
						align = 'right';
					}
				}
			}

			if (ok) {
				this.BBs.push(bb);

				this.BBPolygons.push([[bb.right, bb.top], [bb.right, bb.bottom], [bb.left, bb.bottom], [bb.left, bb.top], [bb.right, bb.top]]);

				if (loc) {
					var obj = { name: loc.name,
						lat: loc.node.dispLoc.lat,
						lng: loc.node.dispLoc.lng,
						offsetX: offsetX,
						offsetY: offsetY,
						align: align };
					this.locs.push(obj);
				}
			}

			//console.log('heightLat: ' + heightLat);
			//console.log('widthLng: ' + widthLng);
			//console.log('dLat: ' + dLat);
			//console.log('dLng: ' + dLng);

		}
	}, {
		key: 'addLocationsToBB',
		value: function addLocationsToBB() {
			var _iteratorNormalCompletion16 = true;
			var _didIteratorError16 = false;
			var _iteratorError16 = undefined;

			try {
				for (var _iterator16 = this.map.tgLocs.locations[this.map.tgLocs.currentType][Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
					//console.log(loc);
					//this.addBB(loc.node.original.lat, loc.node.original.lng)

					var loc = _step16.value;
				}
			} catch (err) {
				_didIteratorError16 = true;
				_iteratorError16 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion16 && _iterator16.return) {
						_iterator16.return();
					}
				} finally {
					if (_didIteratorError16) {
						throw _iteratorError16;
					}
				}
			}
		}
	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var BBPolygons = [];

			// for locations
			var locs = this.map.tgLocs.getCurrentLocations();
			var _iteratorNormalCompletion17 = true;
			var _didIteratorError17 = false;
			var _iteratorError17 = undefined;

			try {
				for (var _iterator17 = locs[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
					var loc = _step17.value;

					var _bb = loc.bb;
					if (_bb) {
						BBPolygons.push([[_bb.right, _bb.top], [_bb.right, _bb.bottom], [_bb.left, _bb.bottom], [_bb.left, _bb.top], [_bb.right, _bb.top]]);
					}

					_bb = loc.nameBB;
					if (_bb) {
						BBPolygons.push([[_bb.right, _bb.top], [_bb.right, _bb.bottom], [_bb.left, _bb.bottom], [_bb.left, _bb.top], [_bb.right, _bb.top]]);
					}
				}
			} catch (err) {
				_didIteratorError17 = true;
				_iteratorError17 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion17 && _iterator17.return) {
						_iterator17.return();
					}
				} finally {
					if (_didIteratorError17) {
						throw _iteratorError17;
					}
				}
			}

			var cLocs = this.map.tgLocs.getCurrentLocationClusters();
			var _iteratorNormalCompletion18 = true;
			var _didIteratorError18 = false;
			var _iteratorError18 = undefined;

			try {
				for (var _iterator18 = cLocs[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
					var cLoc = _step18.value;

					var _bb2 = cLoc.bb;
					if (_bb2) {
						BBPolygons.push([[_bb2.right, _bb2.top], [_bb2.right, _bb2.bottom], [_bb2.left, _bb2.bottom], [_bb2.left, _bb2.top], [_bb2.right, _bb2.top]]);
					}
				}

				// for places
			} catch (err) {
				_didIteratorError18 = true;
				_iteratorError18 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion18 && _iterator18.return) {
						_iterator18.return();
					}
				} finally {
					if (_didIteratorError18) {
						throw _iteratorError18;
					}
				}
			}

			var places = this.map.tgPlaces.dispPlaceObjects;
			for (var name in places) {
				var bb = places[name].bb;
				if (bb) {
					BBPolygons.push([[bb.right, bb.top], [bb.right, bb.bottom], [bb.left, bb.bottom], [bb.left, bb.top], [bb.right, bb.top]]);
				}
			}

			var viz = this.data.viz;
			var arr = [];
			var styleFunc = this.mapUtil.polygonStyleFunc(viz.color.boundingBox);

			var _iteratorNormalCompletion19 = true;
			var _didIteratorError19 = false;
			var _iteratorError19 = undefined;

			try {
				for (var _iterator19 = BBPolygons[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
					var _bb3 = _step19.value;

					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Polygon([_bb3]), styleFunc);
				}
			} catch (err) {
				_didIteratorError19 = true;
				_iteratorError19 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion19 && _iterator19.return) {
						_iterator19.return();
					}
				} finally {
					if (_didIteratorError19) {
						throw _iteratorError19;
					}
				}
			}

			this.mapUtil.removeLayer(this.boundingBoxLayer);
			this.boundingBoxLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.boundingBoxLayer.setZIndex(viz.z.boundingBox);
			this.mapUtil.addLayer(this.boundingBoxLayer);
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.boundingBoxLayer);
		}
	}, {
		key: 'repositionElements',
		value: function repositionElements() {

			var locations = this.map.tgLocs.locations[this.map.tgLocs.currentType];

			this.getNonOverlappedLocations(locations);

			this.map.tgLocs.removeLocationLayer();
			this.drawLocationLayer();

			// name
			var _iteratorNormalCompletion20 = true;
			var _didIteratorError20 = false;
			var _iteratorError20 = undefined;

			try {
				for (var _iterator20 = this.nonOverlappedLocations[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
					var loc = _step20.value;

					this.addBB(loc.node.dispLoc.lat, loc.node.dispLoc.lng, 14, loc.name.length * 9, 0, 17, 'left', loc);
				}

				//this.addLayer();
			} catch (err) {
				_didIteratorError20 = true;
				_iteratorError20 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion20 && _iterator20.return) {
						_iterator20.return();
					}
				} finally {
					if (_didIteratorError20) {
						throw _iteratorError20;
					}
				}
			}

			this.drawLocationNameLayer();
		}
	}, {
		key: 'repositionPlaces',
		value: function repositionPlaces() {
			this.map.tgPlaces.clearLayers();
			this.calNonOverlappedPlaces(this.map.tgPlaces.dispPlaceObjects);
			this.drawPlaceLayer();
		}
	}, {
		key: 'drawLocationNameLayer',
		value: function drawLocationNameLayer() {
			var viz = this.data.viz;
			var arr = [];

			var _iteratorNormalCompletion21 = true;
			var _didIteratorError21 = false;
			var _iteratorError21 = undefined;

			try {
				for (var _iterator21 = this.locs[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
					var loc = _step21.value;

					var nameStyleFunc = this.mapUtil.textStyle({
						text: loc.name,
						color: viz.color.textLocation,
						font: viz.font.text,
						offsetX: loc.offsetX,
						offsetY: loc.offsetY,
						align: loc.align
					});

					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([loc.lng, loc.lat]), nameStyleFunc);
				}
			} catch (err) {
				_didIteratorError21 = true;
				_iteratorError21 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion21 && _iterator21.return) {
						_iterator21.return();
					}
				} finally {
					if (_didIteratorError21) {
						throw _iteratorError21;
					}
				}
			}

			if (arr.length > 0) {
				this.mapUtil.removeLayer(this.locationNameLayer);
				this.locationNameLayer = this.mapUtil.olVectorFromFeatures(arr);
				this.locationNameLayer.setZIndex(viz.z.location);
				this.mapUtil.addLayer(this.locationNameLayer);
			}
		}
	}, {
		key: 'drawLocationLayer',
		value: function drawLocationLayer() {
			var viz = this.data.viz;
			var arr = [];
			var anchorStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.anchor, viz.radius.anchor);
			var locationStyleFunc = this.mapUtil.imageStyleFunc(viz.image.location);
			var lineStyleFunc = this.mapUtil.lineStyleFunc(viz.color.locationLine, viz.width.locationLine);

			var _iteratorNormalCompletion22 = true;
			var _didIteratorError22 = false;
			var _iteratorError22 = undefined;

			try {
				for (var _iterator22 = this.nonOverlappedLocations[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
					var loc = _step22.value;


					if (loc.node.target.lng != loc.node.dispAnchor.lng || loc.node.target.lat != loc.node.dispAnchor.lat) {

						// lines
						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString([[loc.node.dispAnchor.lng, loc.node.dispAnchor.lat], [loc.node.dispLoc.lng, loc.node.dispLoc.lat]]), lineStyleFunc);

						// anchor images
						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([loc.node.dispAnchor.lng, loc.node.dispAnchor.lat]), anchorStyleFunc);
					}

					// circle images
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([loc.node.dispLoc.lng, loc.node.dispLoc.lat]), locationStyleFunc);
				}
			} catch (err) {
				_didIteratorError22 = true;
				_iteratorError22 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion22 && _iterator22.return) {
						_iterator22.return();
					}
				} finally {
					if (_didIteratorError22) {
						throw _iteratorError22;
					}
				}
			}

			if (arr.length > 0) {
				this.mapUtil.removeLayer(this.locationLayer);
				this.locationLayer = this.mapUtil.olVectorFromFeatures(arr);
				this.locationLayer.setZIndex(viz.z.location);
				this.mapUtil.addLayer(this.locationLayer);
			}
		}
	}, {
		key: 'drawPlaceLayer',
		value: function drawPlaceLayer() {
			var viz = this.data.viz;
			var arr = [];

			this.mapUtil.removeLayer(this.placeLayer);

			for (var name in this.nonOverlappedPlaces) {
				var place = this.nonOverlappedPlaces[name];
				var styleFunc = this.mapUtil.textStyle({
					text: name,
					color: viz.color.textPlace,
					font: viz.font.places
				});

				this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(place), styleFunc);
			}

			this.placeLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.placeLayer.setZIndex(viz.z.places);
			this.mapUtil.addLayer(this.placeLayer);
		}
	}]);

	return TgMapBoundingBox;
}();

module.exports = TgMapBoundingBox;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class for control points.
 */
var tgUtil = __webpack_require__(0);
var TgTravelTimeApi = __webpack_require__(3);
var TgControlPoint = __webpack_require__(15);

var TgMapControl = function () {
	function TgMapControl(map, data, graph) {
		_classCallCheck(this, TgMapControl);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		/** 
   * one dimension array for ControlPoint object.
   * @type {Array<ControlPoint>} 
   */
		this.controlPoints = [];

		/** 
  * one dimension array for Grid Lines.
  * @type {Array<ObjTypes>} 
  */
		this.gridLines = [];

		/** 
   * number of control points in a row. (horizontally)
   * @private @type {number} 
   */
		this.numLngInRow = 0;

		/** 
   * number of control points in a column. (vertically)
   * @private @type {number} 
   */
		this.numLatInColumn = 0;

		/** 
   * grid objects
   * @private @type {Array} 
   */
		this.grids = [];

		this.transportTypes = ['auto', 'bicycle', 'pedestrian'];
		this.currentTransport = 'auto';

		/** 
   * api object for getting travel time.
   * @private @type {!TravelTimeApi>} 
   */
		this.travelTimeApi = new TgTravelTimeApi();

		/** 
   * Map object to cache travel time.
   * @private @type {!Map>} 
   */
		this.travelTimeCache = {};
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = this.transportTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var type = _step.value;

				this.travelTimeCache[type] = new Map();
			}

			/** 
    * Current Split Level.
    * @public @type {!Number>} 
    */
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		this.currentSplitLevel = 0;
	}

	_createClass(TgMapControl, [{
		key: 'calUniformControlPoints',
		value: function calUniformControlPoints() {
			var box = this.data.box;
			var eps = 0.000001;
			var marginRate = 0.1; // 10%
			var center = {
				lat: this.map.tgOrigin.origin.original.lat,
				lng: this.map.tgOrigin.origin.original.lng };
			var half = {
				lat: box.top - center.lat,
				lng: box.right - center.lng };
			var apprHalf = {
				lat: half.lat - half.lat * marginRate,
				lng: half.lng - half.lng * marginRate };
			var step = {
				lat: apprHalf.lat / 2,
				lng: apprHalf.lng / 2 };
			var start = {
				lat: center.lat - apprHalf.lat,
				lng: center.lng - apprHalf.lng };
			var end = {
				lat: center.lat + apprHalf.lat,
				lng: center.lng + apprHalf.lng };

			this.controlPoints = [];
			this.numLatInColumn = 0;
			var indexOfControlPoint = 0;

			for (var lat = end.lat; lat > start.lat - eps; lat -= step.lat) {
				this.numLngInRow = 0;

				for (var lng = start.lng; lng < end.lng + eps; lng += step.lng) {

					var point = new TgControlPoint(lat, lng);
					point.index = indexOfControlPoint++;
					this.controlPoints.push(point);
					this.numLngInRow++;
				}
				this.numLatInColumn++;
			}
		}
	}, {
		key: 'calGridLines',
		value: function calGridLines() {
			// make an array for grid lines
			this.gridLines = [];

			for (var indexLat = 0; indexLat < this.numLatInColumn - 1; indexLat++) {
				for (var indexLng = 0; indexLng < this.numLngInRow; indexLng++) {
					this.gridLines.push({
						start: this.getControlPoint2D_(indexLat, indexLng),
						end: this.getControlPoint2D_(indexLat + 1, indexLng)
					});
				}
			}

			for (var _indexLat = 0; _indexLat < this.numLatInColumn; _indexLat++) {
				for (var _indexLng = 0; _indexLng < this.numLngInRow - 1; _indexLng++) {
					this.gridLines.push({
						start: this.getControlPoint2D_(_indexLat, _indexLng),
						end: this.getControlPoint2D_(_indexLat, _indexLng + 1)
					});
				}
			}

			// console.log('# of gridLines: ' + this.gridLines.length);
			// console.log(this.gridLines);
		}
	}, {
		key: 'calConnectedNodes',
		value: function calConnectedNodes() {
			// find connected nodes per each control point.
			for (var indexLat = 0; indexLat < this.numLatInColumn; indexLat++) {
				for (var indexLng = 0; indexLng < this.numLngInRow; indexLng++) {
					var candidate = this.getControlPoint2D_(indexLat, indexLng + 1);
					if (candidate) this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);

					candidate = this.getControlPoint2D_(indexLat + 1, indexLng);
					if (candidate) this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);

					candidate = this.getControlPoint2D_(indexLat, indexLng - 1);
					if (candidate) this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);

					candidate = this.getControlPoint2D_(indexLat - 1, indexLng);
					if (candidate) this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);
				}
			}
		}
	}, {
		key: 'calGrids',
		value: function calGrids() {
			// make grids object
			// 0 - 1 - 6 - 5
			//1 - 2 - 7 - 6
			//...
			//5 - 6 - 11 - 10
			//...
			//25 - 26 - 31 - 30
			//...
			//28 - 29 - 34 - 33

			// inrow = 5, incoloumn = 7
			this.grids = [];
			for (var indexLat = 0; indexLat < this.numLatInColumn - 1; indexLat++) {
				for (var indexLng = 0; indexLng < this.numLngInRow - 1; indexLng++) {
					var pointIndexes = [this.numLngInRow * indexLat + indexLng, this.numLngInRow * indexLat + (indexLng + 1), this.numLngInRow * (indexLat + 1) + (indexLng + 1), this.numLngInRow * (indexLat + 1) + indexLng];

					this.makeGridObjectByPointIndexes(pointIndexes);
				}
			}
			//console.log(this.grids);
		}
	}, {
		key: 'getTravelTimeOfControlPoints',
		value: function getTravelTimeOfControlPoints(cb) {
			var _this = this;

			// check locations that need a travel time by looking in cache.
			var newPointsArray = [];
			this.travelTimeApi.clearEndLocations();

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.controlPoints[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var point = _step2.value;

					var key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);

					// if a point is not in the cache, add it to travelTimeApi.
					if (!this.travelTimeCache[this.currentTransport].has(key)) {
						this.travelTimeApi.addEndLocation(point.original.lat, point.original.lng);
						newPointsArray.push(point);
					}
					// if a point is in the cache, assign traveltime to it.
					else {
							point.travelTime = this.travelTimeCache[this.currentTransport].get(key);
						}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			console.log('numNewPoints: ' + newPointsArray.length);
			//console.log(newPointsArray);

			// if there is points of which we need travel time,
			if (newPointsArray.length > 0) {
				this.map.setTime('travelTimeLoading', 'start', new Date().getTime());

				this.travelTimeApi.getTravelTime(this.currentTransport, function (times) {

					if (times.length !== newPointsArray.length) {
						console.log('ERROR: times.length !== newPointsArray.length');
						console.log('times.length: ' + times.length);
						console.log('newPointsArray.length: ' + newPointsArray.length);
						return;
					}

					for (var index = 0; index < newPointsArray.length; index++) {
						var point = newPointsArray[index];
						var key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
						point.travelTime = times[index];
						_this.travelTimeCache[_this.currentTransport].set(key, point.travelTime);
					}

					_this.map.setDataInfo('numNewTravelTime', 'set', newPointsArray.length);
					_this.map.setTime('travelTimeLoading', 'end', new Date().getTime());
					//this.checkGridSplit();

					if (cb) cb();
				});
			}
			// if we don't need to request traveltime,
			else {
					if (cb) cb();
				}
		}

		/**
   * Calculate the control points.
   */

	}, {
		key: 'calculateControlPoints',
		value: function calculateControlPoints(cb) {
			this.calUniformControlPoints();
			this.calGridLines();
			this.calConnectedNodes();
			this.calGrids();
			this.getTravelTimeOfControlPoints(cb);
		}

		/*calculateAnglesOfControlPoints() {
  	for(let point of this.controlPoints) {
  		point.angles = [];
  		const cLat = point.original.lat;
  		const cLng = point.original.lng;
  		for(let i = 0; i < point.connectedNodes.length; i++) {
  			const eLat = point.connectedNodes[i].original.lat;
  			const eLng = point.connectedNodes[i].original.lng;
  			point.angles.push(
  					Math.abs(this.calAngleByTwoPoints(cLng, cLat, eLng, eLat)));
  		}
  			point.difAngles = [];
  		for(let i = 0; i < point.angles.length - 1; i++) {
  			point.difAngles.push(Math.abs(point.angles[i] - point.angles[i + 1]));
  		}
  		point.difAngles.push(
  				Math.abs(point.angles[0] - point.angles[point.angles.length - 1]));
  	}
  }*/

	}, {
		key: 'checkGridSplit',
		value: function checkGridSplit() {
			var _this2 = this;

			if (this.currentSplitLevel >= this.data.var.maxSplitLevel) {
				console.log('complete: grid checking and control points.');
				this.map.readyControlPoints = true;
				this.map.disableSGapAndGapButtons(false);
				this.map.tgGrids.render();

				if (this.map.currentMode === 'DC') {
					this.map.goToDcAgain();
				}
				return;
			}

			console.log(this.grids);

			/* let sumTimes = [];
   for(let grid of this.grids) {
   	// check if it is not visible.
   	if (!grid.visible) {
   		sumTimes.push(null);
   		continue;
   	}
   		// check if there is any null traveltime.
   	let hasNull = false;
   	for(let index of grid.pointIndexes) {
   		if (this.controlPoints[index].travelTime === null) {
   			hasNull = true;
   			break;
   		}
   	}
   	if (hasNull) {
   		sumTimes.push(null);
   		continue;
   	}
   		// calculate sum of travel time
   	let sumTime = 0;
   	for(let index = 0; index < grid.pointIndexes.length - 1; index++) {
   		const time1 = this.controlPoints[grid.pointIndexes[index]].travelTime;
   		const time2 = this.controlPoints[grid.pointIndexes[index + 1]].travelTime;
   		sumTime += Math.abs(time1 - time2);
   	}
   		const time1 = this.controlPoints[grid.pointIndexes[0]].travelTime;
   	const time2 = this.controlPoints[grid.pointIndexes[grid.pointIndexes.length - 1]].travelTime;
   	sumTime += Math.abs(time1 - time2);
   		sumTimes.push(sumTime);
   	//console.log(sumTime);
   }
   console.log(sumTimes);
   	const threshold = 0.5; // std * threshold, usually 1
   const outlinerIndex = this.selectOutliner(sumTimes, threshold);
   console.log(outlinerIndex);
   */

			var avgTimes = [];
			var indexGrid = 0;
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.grids[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var grid = _step3.value;


					var _str = indexGrid + ':';
					for (var _index = 0; _index < grid.pointIndexes.length; _index++) {
						_str += this.controlPoints[grid.pointIndexes[_index]].travelTime + ' ';
					}
					indexGrid++;
					console.log(_str);

					// check if it is not visible.
					if (!grid.visible) {
						avgTimes.push(null);
						continue;
					}

					// calculate avg of travel time
					var sumTime = 0;
					var count = 0;
					for (var _index2 = 0; _index2 < grid.pointIndexes.length - 1; _index2++) {
						var _time = this.controlPoints[grid.pointIndexes[_index2]].travelTime;
						var _time2 = this.controlPoints[grid.pointIndexes[_index2 + 1]].travelTime;
						if (_time && _time2) {
							sumTime += Math.abs(_time - _time2);
							count++;
						}
					}

					var time1 = this.controlPoints[grid.pointIndexes[0]].travelTime;
					var time2 = this.controlPoints[grid.pointIndexes[grid.pointIndexes.length - 1]].travelTime;
					if (time1 && time2) {
						sumTime += Math.abs(time1 - time2);
						count++;
					}

					//console.log('sumTime: ' + sumTime);
					//console.log('count: ' + count);

					if (count) {
						avgTimes.push(sumTime / count);
					} else {
						avgTimes.push(null);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			console.log(avgTimes);

			var threshold = 0.3; // std * threshold, usually 1
			var outlinerIndex = this.selectOutliner(avgTimes, threshold);
			console.log(outlinerIndex);
			var str = '';
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = outlinerIndex[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var _index3 = _step4.value;

					str += avgTimes[_index3] + ' ';
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			console.log('outliners: ' + str);

			var newIndexObject = {};
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = outlinerIndex[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var _index4 = _step5.value;

					console.log('index: ' + _index4);
					this.splitGrid(this.grids[_index4], newIndexObject);
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			console.log('newIndexObject: ');
			console.log(newIndexObject);

			var newControlPoints = [];
			for (var index in newIndexObject) {
				newControlPoints.push(this.controlPoints[parseInt(index)]);
			}

			this.travelTimeApi.clearEndLocations();
			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = newControlPoints[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var point = _step6.value;

					this.travelTimeApi.addEndLocation(point.original.lat, point.original.lng);
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}

			this.travelTimeApi.getTravelTime(function (times) {

				console.log('Got the travel time, again.');

				var index = 0;
				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = newControlPoints[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var point = _step7.value;

						var key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
						point.travelTime = times[index];
						_this2.travelTimeCache[_this2.currentTransport].set(key, times[index]);
						index++;
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}

				_this2.map.updateLayers();

				_this2.currentSplitLevel++;
				if (_this2.currentSplitLevel < _this2.data.var.maxSplitLevel) {
					_this2.map.tgWater.checkPointsInWater(newControlPoints);
					_this2.checkGridSplit();
				}
			});
		}
	}, {
		key: 'splitGrid',
		value: function splitGrid(grid, newIndexObject) {

			// add new control points and get indexes
			var indexTop = this.addNewControlPoint(grid.pointIndexes[0], grid.pointIndexes[1]);
			var indexRight = this.addNewControlPoint(grid.pointIndexes[1], grid.pointIndexes[2]);
			var indexBottom = this.addNewControlPoint(grid.pointIndexes[2], grid.pointIndexes[3]);
			var indexLeft = this.addNewControlPoint(grid.pointIndexes[3], grid.pointIndexes[0]);
			var indexCenter = this.addNewControlPoint(indexTop, indexBottom);

			// modify gridLines
			this.modifyGridLine(grid.pointIndexes[0], grid.pointIndexes[1], indexTop);
			this.modifyGridLine(grid.pointIndexes[1], grid.pointIndexes[2], indexRight);
			this.modifyGridLine(grid.pointIndexes[2], grid.pointIndexes[3], indexBottom);
			this.modifyGridLine(grid.pointIndexes[3], grid.pointIndexes[0], indexLeft);

			// add gridLines to the center point
			this.addGridLineBetween(indexTop, indexCenter);
			this.addGridLineBetween(indexRight, indexCenter);
			this.addGridLineBetween(indexBottom, indexCenter);
			this.addGridLineBetween(indexLeft, indexCenter);

			// modify connectedNodes
			this.modifyConnectedNodes(grid.pointIndexes[0], grid.pointIndexes[3], indexLeft);
			this.modifyConnectedNodes(grid.pointIndexes[0], grid.pointIndexes[1], indexTop);
			this.modifyConnectedNodes(grid.pointIndexes[1], grid.pointIndexes[0], indexTop);
			this.modifyConnectedNodes(grid.pointIndexes[1], grid.pointIndexes[2], indexRight);
			this.modifyConnectedNodes(grid.pointIndexes[2], grid.pointIndexes[1], indexRight);
			this.modifyConnectedNodes(grid.pointIndexes[2], grid.pointIndexes[3], indexBottom);
			this.modifyConnectedNodes(grid.pointIndexes[3], grid.pointIndexes[2], indexBottom);
			this.modifyConnectedNodes(grid.pointIndexes[3], grid.pointIndexes[0], indexLeft);

			// add connectedNodes of new control points
			this.addConnectedNodes(indexTop, [grid.pointIndexes[1], indexCenter, grid.pointIndexes[0]]);
			this.addConnectedNodes(indexRight, [grid.pointIndexes[2], indexCenter, grid.pointIndexes[1]]);
			this.addConnectedNodes(indexBottom, [grid.pointIndexes[2], grid.pointIndexes[3], indexCenter]);
			this.addConnectedNodes(indexLeft, [indexCenter, grid.pointIndexes[3], grid.pointIndexes[0]]);
			this.addConnectedNodes(indexCenter, [indexRight, indexBottom, indexLeft, indexTop]);

			// remove a grid object
			this.removeGridObject(grid.pointIndexes[0]);

			// add grid objects

			var pointIndexes = [grid.pointIndexes[0], indexTop, indexCenter, indexLeft];
			this.makeGridObjectByPointIndexes(pointIndexes);
			pointIndexes = [indexTop, grid.pointIndexes[1], indexRight, indexCenter];
			this.makeGridObjectByPointIndexes(pointIndexes);
			pointIndexes = [indexCenter, indexRight, grid.pointIndexes[2], indexBottom];
			this.makeGridObjectByPointIndexes(pointIndexes);
			pointIndexes = [indexLeft, indexCenter, indexBottom, grid.pointIndexes[3]];
			this.makeGridObjectByPointIndexes(pointIndexes);

			// calculate angles of control points again.
			//this.calculateAnglesOfControlPoints();

			// add new points into array to get the travel time
			newIndexObject[indexTop] = 0;
			newIndexObject[indexRight] = 0;
			newIndexObject[indexBottom] = 0;
			newIndexObject[indexLeft] = 0;
			newIndexObject[indexCenter] = 0;

			// put key into newIndexArray -> newIndexObject?

			//this.map.updateLayers();

			// 3,4,9,8

		}
	}, {
		key: 'makeGridObjectByPointIndexes',
		value: function makeGridObjectByPointIndexes(pointIndexes) {
			var newGrid = this.addGridObject(pointIndexes);
			var pointsArray = new Array(4);

			for (var i = 0; i < pointIndexes.length; i++) {
				this.controlPoints[pointIndexes[i]].connectedGrids.push(newGrid);
				pointsArray[i] = this.controlPoints[pointIndexes[i]];
			}

			var ab = tgUtil.abByFFT(pointsArray, 'original', 5);
			newGrid.a = ab.as;
			newGrid.b = ab.bs;
		}
	}, {
		key: 'addGridObject',
		value: function addGridObject(indexes) {
			this.grids.push({ type: 'grid', pointIndexes: indexes, visible: true });
			return this.grids[this.grids.length - 1];
		}
	}, {
		key: 'removeGridObject',
		value: function removeGridObject(startIndex) {
			var originalIndex = -1;
			for (var index = 0; index < this.grids.length; index++) {
				if (this.grids[index].pointIndexes[0] === startIndex) {
					originalIndex = index;
				}
			}

			if (originalIndex >= 0) {
				this.grids.visible = false;
			} else {
				console.log('## NOT FOUND!');
			}
		}
	}, {
		key: 'addConnectedNodes',
		value: function addConnectedNodes(indexPivot, connectedIndexes) {
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = connectedIndexes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var index = _step8.value;

					this.controlPoints[indexPivot].connectedNodes.push(this.controlPoints[index]);
				}
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8.return) {
						_iterator8.return();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}
		}
	}, {
		key: 'modifyConnectedNodes',
		value: function modifyConnectedNodes(indexStart, indexEnd, indexNew) {
			var nodes = this.controlPoints[indexStart].connectedNodes;
			for (var index = 0; index < nodes.length; index++) {
				if (nodes[index] === this.controlPoints[indexEnd]) {
					nodes[index] = this.controlPoints[indexNew];
					break;
				}
			}
		}
	}, {
		key: 'addGridLineBetween',
		value: function addGridLineBetween(index1, index2) {
			this.gridLines.push({
				start: this.controlPoints[index1],
				end: this.controlPoints[index2]
			});
		}
	}, {
		key: 'modifyGridLine',
		value: function modifyGridLine(indexStart, indexEnd, indexNew) {
			var pointStart = this.controlPoints[indexStart];
			var pointEnd = this.controlPoints[indexEnd];

			//console.log('pointStart.index: ' + pointStart.index);
			//console.log('pointEnd.index: ' + pointEnd.index);
			//console.log('indexNew: ' + indexNew);

			var originalLineIndexes = [];
			for (var index = 0; index < this.gridLines.length; index++) {

				//console.log('s: ' + this.gridLines[index].start.index);
				//console.log('e: ' + this.gridLines[index].end.index);

				if (this.gridLines[index].start.index === pointStart.index && this.gridLines[index].end.index === pointEnd.index || this.gridLines[index].start.index === pointEnd.index && this.gridLines[index].end.index === pointStart.index) {
					originalLineIndexes.push(index);
				}
			}

			if (originalLineIndexes.length > 0) {
				// delete the original grid line

				originalLineIndexes.sort(function (a, b) {
					return b - a;
				}); // sort by desc
				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = originalLineIndexes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var _index5 = _step9.value;

						this.gridLines.splice(_index5, 1);
					}

					// add new two grid lines
				} catch (err) {
					_didIteratorError9 = true;
					_iteratorError9 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion9 && _iterator9.return) {
							_iterator9.return();
						}
					} finally {
						if (_didIteratorError9) {
							throw _iteratorError9;
						}
					}
				}

				this.addGridLineBetween(indexStart, indexNew);
				this.addGridLineBetween(indexNew, indexEnd);
			}
		}
	}, {
		key: 'addNewControlPoint',
		value: function addNewControlPoint(index1, index2) {
			var p1 = this.controlPoints[index1];
			var p2 = this.controlPoints[index2];
			var newLat = (p1.original.lat + p2.original.lat) / 2;
			var newLng = (p1.original.lng + p2.original.lng) / 2;

			// check if there is a same point in the controlPoints
			var _iteratorNormalCompletion10 = true;
			var _didIteratorError10 = false;
			var _iteratorError10 = undefined;

			try {
				for (var _iterator10 = this.controlPoints[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
					var point = _step10.value;

					if (point.original.lat === newLat && point.original.lng === newLng) {
						//console.log('found.');
						return point.index;
					}
				}
			} catch (err) {
				_didIteratorError10 = true;
				_iteratorError10 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion10 && _iterator10.return) {
						_iterator10.return();
					}
				} finally {
					if (_didIteratorError10) {
						throw _iteratorError10;
					}
				}
			}

			var newPoint = new TgControlPoint(newLat, newLng);
			newPoint.index = this.controlPoints[this.controlPoints.length - 1].index + 1;
			this.controlPoints.push(newPoint);
			return newPoint.index;
		}
	}, {
		key: 'selectOutliner',
		value: function selectOutliner(data, threshold) {
			var calAvg = function calAvg(array) {
				var sum = 0;
				var count = 0;
				var _iteratorNormalCompletion11 = true;
				var _didIteratorError11 = false;
				var _iteratorError11 = undefined;

				try {
					for (var _iterator11 = array[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
						var element = _step11.value;

						if (element !== null) {
							sum += element;
							count++;
						}
					}
				} catch (err) {
					_didIteratorError11 = true;
					_iteratorError11 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion11 && _iterator11.return) {
							_iterator11.return();
						}
					} finally {
						if (_didIteratorError11) {
							throw _iteratorError11;
						}
					}
				}

				return sum / count;
			};

			var avg = calAvg(data);
			var squaredDif = [];
			var _iteratorNormalCompletion12 = true;
			var _didIteratorError12 = false;
			var _iteratorError12 = undefined;

			try {
				for (var _iterator12 = data[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
					var value = _step12.value;

					if (value !== null) {
						squaredDif.push((value - avg) * (value - avg));
					} else {
						squaredDif.push(null);
					}
				}
			} catch (err) {
				_didIteratorError12 = true;
				_iteratorError12 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion12 && _iterator12.return) {
						_iterator12.return();
					}
				} finally {
					if (_didIteratorError12) {
						throw _iteratorError12;
					}
				}
			}

			var std = Math.sqrt(calAvg(squaredDif));
			var normalized = [];
			var _iteratorNormalCompletion13 = true;
			var _didIteratorError13 = false;
			var _iteratorError13 = undefined;

			try {
				for (var _iterator13 = data[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
					var _value = _step13.value;

					if (_value !== null) {
						normalized.push((_value - avg) / std);
					} else {
						normalized.push(null);
					}
				}
			} catch (err) {
				_didIteratorError13 = true;
				_iteratorError13 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion13 && _iterator13.return) {
						_iterator13.return();
					}
				} finally {
					if (_didIteratorError13) {
						throw _iteratorError13;
					}
				}
			}

			var selected = [];
			for (var index = 0; index < normalized.length; index++) {
				if (normalized[index] >= threshold) selected.push(index);
			}

			return selected;
		}

		/**
   * get control point by index of lat and lng.
   * @param {number} indexLat
   * @param {number} indexLng
   */

	}, {
		key: 'getControlPoint2D_',
		value: function getControlPoint2D_(indexLat, indexLng) {
			if (indexLat < 0 || indexLat >= this.numLatInColumn) return null;
			if (indexLng < 0 || indexLng >= this.numLngInRow) return null;
			return this.controlPoints[this.numLngInRow * indexLat + indexLng];
		}

		/*setDefaultTime() {
  	for(var i = 0; i < this.controlPoints.length; i++) {
  		this.controlPoints[i].travelTime 
  			= this.defaulTravelTime_.one_to_many[0][i + 1].time
  	}
  		// make travel time for center position = 0 
  	console.log(this.getCenterControlPoint())
  	this.controlPoints[this.getCenterControlPoint()].travelTime = 0
  }*/

		/**
   * (re)set origin. It also reset TravelTimeApi.
   * @param {number} lat
   * @param {number} lng
   */

	}, {
		key: 'setOrigin',
		value: function setOrigin(lat, lng) {
			this.travelTimeApi.setStartLocation(lat, lng);
			this.travelTimeApi.clearEndLocations();
			var _iteratorNormalCompletion14 = true;
			var _didIteratorError14 = false;
			var _iteratorError14 = undefined;

			try {
				for (var _iterator14 = this.transportTypes[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
					var type = _step14.value;

					this.travelTimeCache[type].clear();
				}
			} catch (err) {
				_didIteratorError14 = true;
				_iteratorError14 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion14 && _iterator14.return) {
						_iterator14.return();
					}
				} finally {
					if (_didIteratorError14) {
						throw _iteratorError14;
					}
				}
			}
		}

		/*getTravelTime() {
  	this.travelTimeApi.setStartLocation(
  		this.map.centerPosition.lat, this.map.centerPosition.lng)
  		for(var i = 0; i < this.controlPoints.length; i++) {
  		this.travelTimeApi.addDestLocation(
  			this.controlPoints[i].original.lng, this.controlPoints[i].original.lat) 
  	}
  
  	//var startIdx = this.getStartIndexBySplitLevel(this.splitLevel)
  	//for(var i = startIdx; i < this.controlPoints.length; i++) {
  	//	this.tt.addDestLocation(
  	//		this.controlPoints[i].original.lng, 
  	//		this.controlPoints[i].original.lat)
  	//}
  		//console.log('startIdx = ' + startIdx)
  	//console.log('num = ' + (this.controlPoints.length - startIdx))
  		var start = (new Date()).getTime()
  	this.travelTimeApi.getTravelTime(func.bind(this))
  		function func(data) {
  		console.log('?????');
  			var end = (new Date()).getTime()
  		console.log('elapsed: ' + (end - start)/1000 + ' sec.')
  		console.log(data)
  		
  		//this.travelTime = data
  			for(var i = 0; i < this.controlPoints.length; i++) {
  			this.controlPoints[i].travelTime = data.one_to_many[0][i + 1].time
  		}
  		this.map.updateLayers();
  		this.checkGridSplit();
  
  			//tgUtil.saveTextAsFile(data, 'data_tt.js')
  			//this.travelTime = data
  		//this.setTravelTime()
  		//this.map.updateLayers()
  	}
  }*/

		/*saveTravelTimeToFile() {
  	tgUtil.saveTextAsFile(this.travelTime, 'data_tt.js')
  }*/

	}, {
		key: 'getCenterControlPoint',
		value: function getCenterControlPoint() {
			var threshold = 0.0001;
			var dist;

			for (var i = 0; i < this.controlPoints.length; i++) {
				dist = tgUtil.D2(this.controlPoints[i].original.lat, this.controlPoints[i].original.lng, this.map.tgOrigin.origin.original.lat, this.map.tgOrigin.origin.original.lng);
				if (dist < threshold) return i;
			}

			if (i == this.controlPoints.length) {
				console.log('could not find center control point');
				return -1;
			}
		}
	}, {
		key: 'calAngleByTwoPoints',
		value: function calAngleByTwoPoints(cx, cy, ex, ey) {
			var dy = ey - cy;
			var dx = ex - cx;
			var theta = Math.atan2(dy, dx); // range (-PI, PI]
			theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
			//if (theta < 0) theta = 360 + theta; // range [0, 360)
			return theta;
		}
	}, {
		key: 'calTargets',
		value: function calTargets() {
			var target;
			for (var i = 0; i < this.controlPoints.length; i++) {
				target = this.graph.transform(this.controlPoints[i].original.lat, this.controlPoints[i].original.lng);
				this.controlPoints[i].target.lat = target.lat;
				this.controlPoints[i].target.lng = target.lng;
			}
		}

		//////////////////////////////////////////////////////////////////////////////////////////
		// Drawing Part
		//////////////////////////////////////////////////////////////////////////////////////////

		/** 
   * create a control point layer and add to olMap.
   */
		/*drawControlPointLayer() {
  	let features = [];
  	const viz = this.data.viz;
  		for(let point of this.controlPoints) {
  		// draw control points
  		this.mapUtil.addFeatureInFeatures(
  				features,
  				new ol.geom.Point(
  						[point.disp.lng, point.disp.lat]), 
  						this.mapUtil.nodeStyle(
  								viz.color.controlPoint, 
  								viz.radius.controlPoint));
  			// draw additional lines if there is a difference between target and real.
  		if ((point.target.lng != point.disp.lng) 
  			|| (point.target.lat != point.disp.lat)) {
  				this.mapUtil.addFeatureInFeatures(
  					features, 
  					new ol.geom.LineString(
  							[[point.disp.lng, point.disp.lat], [point.target.lng, point.target.lat]]), 
  							this.mapUtil.lineStyle(
  								viz.color.controlPointLine, viz.width.controlPointLine));
  		}
  			// add text
  		let text = (point.travelTime != null) ? point.travelTime.toString() : '-';
  		text += ',' + point.index;
  		this.mapUtil.addFeatureInFeatures(
  				features,
  				new ol.geom.Point(
  						[point.disp.lng, point.disp.lat]), 
  						this.mapUtil.textStyle({
  								text: text, color: viz.color.text, font: viz.font.text
  							}));
  	}
  		this.removeControlPointLayer();
  	this.controlPointLayer = this.mapUtil.olVectorFromFeatures(features);
  	this.controlPointLayer.setZIndex(viz.z.controlPoint);
    this.mapUtil.addLayer(this.controlPointLayer);
  }*/

		/** 
   * remove a control point layer if exists.
   */
		/*removeControlPointLayer() {
  	this.mapUtil.removeLayer(this.controlPointLayer);
  }*/

		/** 
   * create a grid layer and add to olMap.
   */
		/*drawGridLayer() {
  	let features = [];
  	const viz = this.data.viz;
  		for(let line of this.gridLines) {
  		this.mapUtil.addFeatureInFeatures(
  				features, 
  				new ol.geom.LineString(
  						[[line.start.disp.lng, line.start.disp.lat], 
  						[line.end.disp.lng, line.end.disp.lat]]), 
  						this.mapUtil.lineStyle(viz.color.grid, viz.width.grid));
  	}
  		this.removeGridLayer();
  	this.gridLayer = this.mapUtil.olVectorFromFeatures(features);
  	this.gridLayer.setZIndex(viz.z.grid);
  	this.mapUtil.addLayer(this.gridLayer);
  }*/

		/** 
   * remove a control point layer if exists.
   */
		/*removeGridLayer() {
  	this.mapUtil.removeLayer(this.gridLayer)
  }*/

		/*calDispNodes(type, value) {
  	if (type === 'intermediateReal') {
  		for(let point of this.controlPoints) {
  			point.disp.lat = (1 - value) * point.original.lat + value * point.real.lat;
  			point.disp.lng = (1 - value) * point.original.lng + value * point.real.lng;
  		}
  	}
  	else if (type === 'intermediateTarget') {
  		for(let point of this.controlPoints) {
  			point.disp.lat = (1 - value) * point.original.lat + value * point.target.lat;
  			point.disp.lng = (1 - value) * point.original.lng + value * point.target.lng;
  		}
  	}
  	else {
  		for(let point of this.controlPoints) {
  			point.disp.lat = point[type].lat;
  			point.disp.lng = point[type].lng;
  		}
  	}
  }*/

	}, {
		key: 'getIJ',
		value: function getIJ(idx) {
			return {
				i: parseInt(idx / (this.data.var.resolution.gridLng + 1)),
				j: idx % (this.data.var.resolution.gridLng + 1)
			};
		}
	}, {
		key: 'makeNoWarpedGrid',
		value: function makeNoWarpedGrid() {
			var _iteratorNormalCompletion15 = true;
			var _didIteratorError15 = false;
			var _iteratorError15 = undefined;

			try {
				for (var _iterator15 = this.controlPoints[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
					var point = _step15.value;

					point.real.lat = point.original.lat;
					point.real.lng = point.original.lng;
				}
			} catch (err) {
				_didIteratorError15 = true;
				_iteratorError15 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion15 && _iterator15.return) {
						_iterator15.return();
					}
				} finally {
					if (_didIteratorError15) {
						throw _iteratorError15;
					}
				}
			}

			console.log('makeNoWarpedGrid');
		}
	}, {
		key: 'makeOriginalDCGrid',
		value: function makeOriginalDCGrid() {
			var _iteratorNormalCompletion16 = true;
			var _didIteratorError16 = false;
			var _iteratorError16 = undefined;

			try {
				for (var _iterator16 = this.controlPoints[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
					var point = _step16.value;

					point.real.lat = point.target.lat;
					point.real.lng = point.target.lng;
				}
			} catch (err) {
				_didIteratorError16 = true;
				_iteratorError16 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion16 && _iterator16.return) {
						_iterator16.return();
					}
				} finally {
					if (_didIteratorError16) {
						throw _iteratorError16;
					}
				}
			}

			console.log('makeOriginalDCGrid');
		}
	}, {
		key: 'makeNonIntersectedGrid',
		value: function makeNonIntersectedGrid() {
			//const s = (new Date()).getTime();

			var dt = 0.1;
			var eps = 0.000001;
			var margin = 0.0; //0.3;
			var setRealPosition = function setRealPosition(point, pct) {
				point.real.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
				point.real.lng = point.original.lng * (1 - pct) + point.target.lng * pct;
			};

			var _iteratorNormalCompletion17 = true;
			var _didIteratorError17 = false;
			var _iteratorError17 = undefined;

			try {
				for (var _iterator17 = this.controlPoints[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
					var _point = _step17.value;
					_point.intersected = false;
				} // 0.1, ..., 0.7 (if margin = 0.3)
			} catch (err) {
				_didIteratorError17 = true;
				_iteratorError17 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion17 && _iterator17.return) {
						_iterator17.return();
					}
				} finally {
					if (_didIteratorError17) {
						throw _iteratorError17;
					}
				}
			}

			for (var pct = dt; pct + margin < 1 + eps; pct += dt) {
				//console.log('pct = ' + pct);

				// change the real position of all control points.
				var _iteratorNormalCompletion18 = true;
				var _didIteratorError18 = false;
				var _iteratorError18 = undefined;

				try {
					for (var _iterator18 = this.controlPoints[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
						var point = _step18.value;

						if (!point.intersected) {
							setRealPosition(point, pct);
						} else {
							//console.log('frozen: ' + point.index);
						}
					}

					// TODO: Check lat, lng before calculating intersections
					// check intersections between grid lines.
				} catch (err) {
					_didIteratorError18 = true;
					_iteratorError18 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion18 && _iterator18.return) {
							_iterator18.return();
						}
					} finally {
						if (_didIteratorError18) {
							throw _iteratorError18;
						}
					}
				}

				var _iteratorNormalCompletion19 = true;
				var _didIteratorError19 = false;
				var _iteratorError19 = undefined;

				try {
					for (var _iterator19 = this.gridLines[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
						var line1 = _step19.value;
						var _iteratorNormalCompletion20 = true;
						var _didIteratorError20 = false;
						var _iteratorError20 = undefined;

						try {
							for (var _iterator20 = this.gridLines[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
								var line2 = _step20.value;


								//if ((line1.start.intersected)||(line1.end.intersected)||
								//(line2.start.intersected)||(line2.end.intersected)) continue;

								if (tgUtil.intersects(line1.start.real.lat, line1.start.real.lng, line1.end.real.lat, line1.end.real.lng, line2.start.real.lat, line2.start.real.lng, line2.end.real.lat, line2.end.real.lng)) {

									if (line1.end.index !== line2.start.index && line1.start.index !== line2.end.index) {

										// if intersected, move it back.

										if (!line1.start.intersected) {
											setRealPosition(line1.start, pct - dt);
											line1.start.intersected = true;
										}

										if (!line1.end.intersected) {
											setRealPosition(line1.end, pct - dt);
											line1.end.intersected = true;
										}

										if (!line2.start.intersected) {
											setRealPosition(line2.start, pct - dt);
											line2.start.intersected = true;
										}

										if (!line2.end.intersected) {
											setRealPosition(line2.end, pct - dt);
											line2.end.intersected = true;
										}

										//console.log('intersected: ');
										//console.log(line1.start.index + ' ' + line1.end.index);
										//console.log(line2.start.index + ' ' + line2.end.index);
									}
								}
							}
						} catch (err) {
							_didIteratorError20 = true;
							_iteratorError20 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion20 && _iterator20.return) {
									_iterator20.return();
								}
							} finally {
								if (_didIteratorError20) {
									throw _iteratorError20;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError19 = true;
					_iteratorError19 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion19 && _iterator19.return) {
							_iterator19.return();
						}
					} finally {
						if (_didIteratorError19) {
							throw _iteratorError19;
						}
					}
				}
			}
			//const e = (new Date()).getTime();
			//console.log('### time: ' + (e - s) + ' ms.');
		}
	}, {
		key: 'makeShapePreservingGridByFFT',
		value: function makeShapePreservingGridByFFT() {
			//const s = (new Date()).getTime();

			var threshold = this.data.var.shapePreservingDegree;
			var dt = 0.1;
			var eps = 0.000001;
			var setRealPosition = function setRealPosition(point, pct) {
				point.real.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
				point.real.lng = point.original.lng * (1 - pct) + point.target.lng * pct;
			};

			var _iteratorNormalCompletion21 = true;
			var _didIteratorError21 = false;
			var _iteratorError21 = undefined;

			try {
				for (var _iterator21 = this.controlPoints[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
					var _point2 = _step21.value;
					_point2.done = false;
				}
			} catch (err) {
				_didIteratorError21 = true;
				_iteratorError21 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion21 && _iterator21.return) {
						_iterator21.return();
					}
				} finally {
					if (_didIteratorError21) {
						throw _iteratorError21;
					}
				}
			}

			for (var pct = dt; pct < 1 + eps; pct += dt) {
				//console.log('pct = ' + pct);

				// change the real position of all control points.
				var _iteratorNormalCompletion22 = true;
				var _didIteratorError22 = false;
				var _iteratorError22 = undefined;

				try {
					for (var _iterator22 = this.controlPoints[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
						var point = _step22.value;


						if (point.done) {
							//console.log('done: ' + point.index);
							continue;
						}

						setRealPosition(point, pct);

						var _iteratorNormalCompletion23 = true;
						var _didIteratorError23 = false;
						var _iteratorError23 = undefined;

						try {
							for (var _iterator23 = point.connectedGrids[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
								var grid = _step23.value;


								var pointsArray = new Array(4);
								for (var i = 0; i < grid.pointIndexes.length; i++) {
									pointsArray[i] = this.controlPoints[grid.pointIndexes[i]];
								}
								var abReal = tgUtil.abByFFT(pointsArray, 'real', 5);

								var dif = 0;
								for (var _i = 0; _i < abReal.as.length; _i++) {
									dif += tgUtil.D2(grid.a[_i], grid.b[_i], abReal.as[_i], abReal.bs[_i]);
								}
								//console.log('dif: ' + dif);
								if (dif > threshold) {
									setRealPosition(point, pct - dt);
									point.done = true;
									break;
								}
							}
						} catch (err) {
							_didIteratorError23 = true;
							_iteratorError23 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion23 && _iterator23.return) {
									_iterator23.return();
								}
							} finally {
								if (_didIteratorError23) {
									throw _iteratorError23;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError22 = true;
					_iteratorError22 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion22 && _iterator22.return) {
							_iterator22.return();
						}
					} finally {
						if (_didIteratorError22) {
							throw _iteratorError22;
						}
					}
				}
			}
			//const e = (new Date()).getTime();
			//console.log('### time: ' + (e - s) + ' ms.');
		}

		/*
  makeShapePreservingGrid() {
  	const threshold = this.data.var.shapePreservingDegree;
  	const ctlPt = this.controlPoints;
  	const dt = 0.1;
  	const eps = 0.000001;
  	const setRealPosition = function(point, pct) {
  		point.real.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
  		point.real.lng = point.original.lng * (1 - pct) + point.target.lng * pct;
  	}
  		for(let pct = dt; pct < 1 + eps; pct += dt) {
  		console.log('pct = ' + pct);
  			// change the real position of all control points.
  		for(let point of this.controlPoints) {
  				if (point.done) {
  				//console.log('done: ' + point.index);
  				continue;
  			}
  				// moving a point
  			setRealPosition(point, pct);
  				let angles = [];
  			const cLat = point.real.lat;
  			const cLng = point.real.lng;
  			for(let i = 0; i < point.connectedNodes.length; i++) {
  				const eLat = point.connectedNodes[i].real.lat;
  				const eLng = point.connectedNodes[i].real.lng;
  				angles.push(Math.abs(this.calAngleByTwoPoints(cLng, cLat, eLng, eLat)));
  			}
  				let difAngles = [];
  			for(let i = 0; i < angles.length - 1; i++) {
  				difAngles.push(Math.abs(angles[i] - angles[i + 1]));
  			}
  			difAngles.push(
  					Math.abs(angles[0] - angles[angles.length - 1]));
  				for(let i = 0; i < difAngles.length; i++) {
  				//console.log(Math.abs(point.difAngles[i] - difAngles[i]));
  				if (Math.abs(point.difAngles[i] - difAngles[i]) > threshold) {
  						let d = Math.abs(point.difAngles[i] - difAngles[i]);
  					//console.log('p:' + point.index + ' i: ' + i  + ' d: ' + d);
  					// set back
  					setRealPosition(point, pct - dt);
  					//point.real.lat = preLat;
  					//point.real.lng = preLng;
  						point.done = true;
  					break;
  				}
  			}
  		}
  	}
  }
  */

	}]);

	return TgMapControl;
}();

module.exports = TgMapControl;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgMapIsochrone = function () {
	function TgMapIsochrone(map, data, graph) {
		_classCallCheck(this, TgMapIsochrone);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;
	}

	_createClass(TgMapIsochrone, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) this.discard();else this.updateLayer();
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.removeLayer();
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.layer);
		}
	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			if (!this.graph.factor) return;

			console.log('@ isochrone updateLayer');

			var viz = this.data.viz;
			var box = this.data.box;
			var features = [];
			var originLat = this.map.tgOrigin.origin.real.lat;
			var originLng = this.map.tgOrigin.origin.real.lng;

			var heightLat = box.top - box.bottom; // 0.11
			var latPerPx = heightLat / this.map.olMapHeightPX;
			var maxTime = this.map.calTimeFromLatLng(originLat + heightLat / 2, originLng); // 749.4
			var pxPerTime = this.map.olMapHeightPX / 2 / maxTime; // 0.64

			var widthLng = box.right - box.left; // 0.09784
			var lngPerPx = widthLng / this.map.olMapWidthPX;

			/*const latPerTime = (heightLat / 2) / maxTime; // 0.056
   const maxLngTime = 
   	this.map.calTimeFromLatLng(originLat, originLng + widthLng/2);
   const lngPerTime = (widthLng / 2) / maxLngTime;
   console.log('lngPerPx: ' + lngPerPx);
   console.log('widthLng: ' + widthLng);
   console.log('maxLngTime: ' + maxLngTime);
   console.log('lngPerTime: ' + lngPerTime);*/

			var minUnitTime = 300; // 5 min
			var numIsochrone = 0;
			for (var time = 0; time < maxTime; time += minUnitTime) {
				numIsochrone++;
			}while (numIsochrone > 8) {
				minUnitTime *= 2;
				numIsochrone /= 2;
			}

			for (var num = 0; num < numIsochrone; num++) {
				var _time = (num + 1) * minUnitTime; // e.g. 300, 600, ...
				var radiusPx = _time * pxPerTime;

				// circle
				this.mapUtil.addFeatureInFeatures(features, new ol.geom.Point([originLng, originLat]), this.mapUtil.isochroneStyle(radiusPx, viz.color.isochrone, viz.width.isochrone));

				// red box
				//let offsetLng = (radiusPx + 3) * lngPerPx
				var offsetLng = 0;
				var offsetLat = radiusPx * latPerPx;
				this.mapUtil.addFeatureInFeatures(features, new ol.geom.Point([originLng + offsetLng, originLat + offsetLat]), this.mapUtil.imageStyle(viz.image.red10min));

				// text
				//offsetLng = (radiusPx - 13) * lngPerPx;
				offsetLng = -17 * lngPerPx;
				offsetLat = radiusPx * latPerPx;
				var text = _time / 60 + '';
				this.mapUtil.addFeatureInFeatures(features, new ol.geom.Point([originLng + offsetLng, originLat + offsetLat]), this.mapUtil.textStyle({
					text: text,
					color: viz.color.isochroneText,
					font: viz.font.isochroneText
				}));
			}

			this.removeLayer();
			this.layer = this.mapUtil.olVectorFromFeatures(features);
			this.layer.setZIndex(viz.z.isochrone);
			this.mapUtil.addLayer(this.layer);
		}
	}]);

	return TgMapIsochrone;
}();

module.exports = TgMapIsochrone;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tgUtil = __webpack_require__(0);
var TgNode = __webpack_require__(1);

var TgMapLanduse = function () {
	function TgMapLanduse(map, data, graph) {
		_classCallCheck(this, TgMapLanduse);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.simplify = false;
		this.dispNodeLayer = false;
		this.nodeLayer = null;

		this.landuseObjects = this.initLanduseArray();
		this.newLanduseObjects = this.initLanduseArray();
		this.dispLanduseObjects = this.initLanduseArray();
		this.timerGetLanduseData = null;
		this.dispLayers = [];
		this.rdpThreshold = this.data.var.rdpThreshold.landuse;
	}

	_createClass(TgMapLanduse, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) this.clearLayers();else this.updateLayer();
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.clearLayers();
		}
	}, {
		key: 'initLanduseArray',
		value: function initLanduseArray() {
			// 6 classes of landuse
			var numClass = this.data.var.numLanduseClasses;
			var outArray = new Array(6);
			for (var index = 0; index < outArray.length; index++) {
				outArray[index] = [];
			}
			return outArray;
		}
	}, {
		key: 'init',
		value: function init() {
			var source = new ol.source.VectorTile({
				format: new ol.format.TopoJSON(),
				projection: 'EPSG:3857',
				tileGrid: new ol.tilegrid.createXYZ({ maxZoom: 22 }),
				url: 'https://tile.mapzen.com/mapzen/vector/v1/landuse/{z}/{x}/{y}.topojson?' + 'api_key=vector-tiles-c1X4vZE'
			});

			this.mapUtil.addLayer(new ol.layer.VectorTile({
				source: source,
				style: this.addToLanduseObject.bind(this)
			}));
		}
	}, {
		key: 'addToLanduseObject',
		value: function addToLanduseObject(feature, resolution) {
			if (this.timerGetLanduseData) clearTimeout(this.timerGetLanduseData);
			this.timerGetLanduseData = setTimeout(this.processNewLanduseObjects.bind(this), this.data.time.waitForGettingData);

			var kind = feature.get('kind');
			var landuseClass = -1;

			switch (kind) {
				case 'recreation_ground':
				case 'park':
				case 'garden':
					landuseClass = 0;
					break;
				case 'cemetery':
				case 'golf_course':
				case 'zoo':
					landuseClass = 1;
					break;
				case 'university':
				case 'college':
				case 'school':
					landuseClass = 2;
					break;
				case 'stadium':
					landuseClass = 3;
					break;
				case 'hospital':
					landuseClass = 4;
					break;
				case 'retail':
					landuseClass = 5;
					break;
				default:
					return null;
			}

			var geoType = feature.getGeometry().getType();
			var name = feature.get('name');
			// console.log('kind: ' + kind + ' type: ' + geoType + ' name: ' + name);
			// console.log('kind: ' + kind + ' minZoom: ' + minZoom);

			// class 0: recreation_ground, park, garden
			// class 1: cemetery, golf_course, zoo
			// class 2: university, college, school
			// class 3: stadium
			// class 4: hospital
			// class 5: retail
			// ignore: library, fuel, theatre, residential, recreation_track, footway, 
			//   commercial, industrial, railway, enclosure, military, hedge, pier
			//   caravan_site, picnic_site, dog_park, bridge, wetland, scrub, grass
			//   natural_wood, nature_reserve, meadow, forest, sports_centre, attraction
			//	 water_park, city_wall, prison, apron, grave_yard


			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

			var coords = feature.getGeometry().getCoordinates();
			coords.minZoom = feature.get('min_zoom');
			if (name) coords.name = name;

			//const lenCoords = coords.length;

			if (geoType === 'Polygon') {

				if (this.simplify && this.map.simplify) {
					coords = tgUtil.RDPSimp2DLoop(coords, this.rdpThreshold);
				}

				for (var i = 0; i < coords.length; i++) {
					for (var j = 0; j < coords[i].length; j++) {
						coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
					}
				}

				this.landuseObjects[landuseClass].push(coords);
				this.newLanduseObjects[landuseClass].push(coords);
				this.dispLanduseObjects[landuseClass].push(coords);
			}
			return null;
		}
	}, {
		key: 'processNewLanduseObjects',
		value: function processNewLanduseObjects() {
			this.map.setDataInfo('numLanduseLoading', 'increase');
			this.map.setTime('landuseLoading', 'end', new Date().getTime());

			if (this.map.currentMode === 'EM') {
				this.addNewLayer();
			}
			this.newLanduseObjects = this.initLanduseArray();
		}
	}, {
		key: 'calDispLanduse',
		value: function calDispLanduse() {
			var currentZoom = this.data.zoom.current;
			var top = this.data.box.top;
			var bottom = this.data.box.bottom;
			var right = this.data.box.right;
			var left = this.data.box.left;
			var numClass = this.data.var.numLanduseClasses;

			this.dispLanduseObjects = this.initLanduseArray();

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this.landuseObjects[cl][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var landuse = _step.value;

						if (currentZoom < landuse.minZoom) {
							continue;
						}

						var isIn = false;
						if (landuse[0][0].node) {
							// Polygon
							for (var i = 0; i < landuse.length; i++) {
								for (var j = 0; j < landuse[i].length; j++) {
									var lat = landuse[i][j].node.original.lat;
									var lng = landuse[i][j].node.original.lng;

									if (lat < top && lat > bottom && lng < right && lng > left) {
										this.dispLanduseObjects[cl].push(landuse);
										isIn = true;
										break;
									}
								}
								if (isIn) break;
							}
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}

			//console.log('/# of landuse : ' + this.landuseObjects.length);
			//console.log('/# of disp landuse: ' + this.dispLanduseObjects.length);
		}
	}, {
		key: 'updateDispLanduse',
		value: function updateDispLanduse() {
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.dispLanduseObjects[cl][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var landuse = _step2.value;

						if (landuse[0][0].node) {
							// Polygon
							for (var i = 0; i < landuse.length; i++) {
								for (var j = 0; j < landuse[i].length; j++) {
									landuse[i][j][0] = landuse[i][j].node.disp.lng;
									landuse[i][j][1] = landuse[i][j].node.disp.lat;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}
		}
	}, {
		key: 'addNewLayer',
		value: function addNewLayer() {
			var viz = this.data.viz;
			var arr = [];
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var styleFunc = this.mapUtil.polygonStyleFunc(viz.color.landuse[cl]);

				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = this.newLanduseObjects[cl][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var landuse = _step3.value;

						if (landuse[0][0].node) {
							// Polygon
							this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Polygon(landuse), styleFunc);
						}
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			}

			var layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z.landuse);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);

			//console.log('+ new landuse layer: ' + arr.length);
			if (this.dispNodeLayer) this.addNewNodeLayer();
		}
	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			this.clearLayers();
			this.updateDispLanduse();

			var viz = this.data.viz;
			var arr = [];
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var styleFunc = this.mapUtil.polygonStyleFunc(viz.color.landuse[cl]);

				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = this.dispLanduseObjects[cl][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var landuse = _step4.value;

						if (landuse[0][0].node) {
							// Polygon
							this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Polygon(landuse), styleFunc);
						}
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			}

			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.landuse);
			this.mapUtil.addLayer(this.layer);
			this.dispLayers.push(this.layer);

			if (this.dispNodeLayer) this.addNodeLayer();
		}
	}, {
		key: 'clearLayers',
		value: function clearLayers() {
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = this.dispLayers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var layer = _step5.value;

					this.mapUtil.removeLayer(layer);
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.layer);
		}
	}, {
		key: 'calRealNodes',
		value: function calRealNodes() {
			this.calModifiedNodes('real');
		}
	}, {
		key: 'calTargetNodes',
		value: function calTargetNodes() {
			this.calModifiedNodes('target');
		}
	}, {
		key: 'calModifiedNodes',
		value: function calModifiedNodes(kind) {
			var transformFuncName = void 0;
			if (kind === 'real') transformFuncName = 'transformReal';else if (kind === 'target') transformFuncName = 'transformTarget';else throw 'ERROR in calModifiedNodes()';

			var transform = this.graph[transformFuncName].bind(this.graph);
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = this.dispLanduseObjects[cl][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var landuse = _step6.value;

						var modified = void 0;

						if (landuse[0][0].node) {
							// Polygon
							for (var i = 0; i < landuse.length; i++) {
								for (var j = 0; j < landuse[i].length; j++) {
									modified = transform(landuse[i][j].node.original.lat, landuse[i][j].node.original.lng);
									landuse[i][j].node[kind].lat = modified.lat;
									landuse[i][j].node[kind].lng = modified.lng;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}
			}
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = this.dispLanduseObjects[cl][Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var landuse = _step7.value;


						if (landuse[0][0].node) {
							// Polygon
							if (kind === 'intermediateReal') {
								for (var i = 0; i < landuse.length; i++) {
									for (var j = 0; j < landuse[i].length; j++) {
										landuse[i][j].node.disp.lat = (1 - value) * landuse[i][j].node.original.lat + value * landuse[i][j].node.real.lat;
										landuse[i][j].node.disp.lng = (1 - value) * landuse[i][j].node.original.lng + value * landuse[i][j].node.real.lng;
									}
								}
							} else if (kind === 'intermediateTarget') {
								for (var _i = 0; _i < landuse.length; _i++) {
									for (var _j = 0; _j < landuse[_i].length; _j++) {
										landuse[_i][_j].node.disp.lat = (1 - value) * landuse[_i][_j].node.original.lat + value * landuse[_i][_j].node.target.lat;
										landuse[_i][_j].node.disp.lng = (1 - value) * landuse[_i][_j].node.original.lng + value * landuse[_i][_j].node.target.lng;
									}
								}
							} else {
								for (var _i2 = 0; _i2 < landuse.length; _i2++) {
									for (var _j2 = 0; _j2 < landuse[_i2].length; _j2++) {
										landuse[_i2][_j2].node.disp.lat = landuse[_i2][_j2].node[kind].lat;
										landuse[_i2][_j2].node.disp.lng = landuse[_i2][_j2].node[kind].lng;
									}
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}
			}
		}
	}, {
		key: 'calNumberOfNode',
		value: function calNumberOfNode() {
			var count = 0;
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion8 = true;
				var _didIteratorError8 = false;
				var _iteratorError8 = undefined;

				try {
					for (var _iterator8 = this.dispLanduseObjects[cl][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
						var landuse = _step8.value;

						if (landuse[0].length === 0 || landuse[0][0].length === 0) continue;

						if (landuse[0][0].node) {
							var _iteratorNormalCompletion9 = true;
							var _didIteratorError9 = false;
							var _iteratorError9 = undefined;

							try {
								for (var _iterator9 = landuse[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
									var nodes = _step9.value;

									count += nodes.length;
								}
							} catch (err) {
								_didIteratorError9 = true;
								_iteratorError9 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion9 && _iterator9.return) {
										_iterator9.return();
									}
								} finally {
									if (_didIteratorError9) {
										throw _iteratorError9;
									}
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError8 = true;
					_iteratorError8 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion8 && _iterator8.return) {
							_iterator8.return();
						}
					} finally {
						if (_didIteratorError8) {
							throw _iteratorError8;
						}
					}
				}
			}
			return count;
		}
	}, {
		key: 'addNewNodeLayer',
		value: function addNewNodeLayer() {
			var viz = this.data.viz;
			var arr = [];
			var edgeStyleFunc = this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
			var nodeStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.landuseNode, viz.radius.node);
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = this.newLanduseObjects[cl][Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var landuse = _step10.value;

						if (landuse[0][0].node) {
							// Polygon
							var _iteratorNormalCompletion11 = true;
							var _didIteratorError11 = false;
							var _iteratorError11 = undefined;

							try {
								for (var _iterator11 = landuse[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
									var nodes = _step11.value;

									// edge
									this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(nodes), edgeStyleFunc);

									// node
									var _iteratorNormalCompletion12 = true;
									var _didIteratorError12 = false;
									var _iteratorError12 = undefined;

									try {
										for (var _iterator12 = nodes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
											var node = _step12.value;

											this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(node), nodeStyleFunc);
										}
									} catch (err) {
										_didIteratorError12 = true;
										_iteratorError12 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion12 && _iterator12.return) {
												_iterator12.return();
											}
										} finally {
											if (_didIteratorError12) {
												throw _iteratorError12;
											}
										}
									}
								}
							} catch (err) {
								_didIteratorError11 = true;
								_iteratorError11 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion11 && _iterator11.return) {
										_iterator11.return();
									}
								} finally {
									if (_didIteratorError11) {
										throw _iteratorError11;
									}
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError10 = true;
					_iteratorError10 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion10 && _iterator10.return) {
							_iterator10.return();
						}
					} finally {
						if (_didIteratorError10) {
							throw _iteratorError10;
						}
					}
				}
			}

			var layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z.roadNode);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);
		}
	}, {
		key: 'addNodeLayer',
		value: function addNodeLayer() {
			var viz = this.data.viz;

			this.mapUtil.removeLayer(this.nodeLayer);

			var arr = [];
			var edgeStyleFunc = this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
			var nodeStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.landuseNode, viz.radius.node);
			var numClass = this.data.var.numLanduseClasses;

			for (var cl = 0; cl < numClass; cl++) {
				var _iteratorNormalCompletion13 = true;
				var _didIteratorError13 = false;
				var _iteratorError13 = undefined;

				try {
					for (var _iterator13 = this.dispLanduseObjects[cl][Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
						var landuse = _step13.value;

						if (landuse[0][0].node) {
							// Polygon
							var _iteratorNormalCompletion14 = true;
							var _didIteratorError14 = false;
							var _iteratorError14 = undefined;

							try {
								for (var _iterator14 = landuse[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
									var nodes = _step14.value;

									// edge
									this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(nodes), edgeStyleFunc);

									// node
									var _iteratorNormalCompletion15 = true;
									var _didIteratorError15 = false;
									var _iteratorError15 = undefined;

									try {
										for (var _iterator15 = nodes[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
											var node = _step15.value;

											this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(node), nodeStyleFunc);
										}
									} catch (err) {
										_didIteratorError15 = true;
										_iteratorError15 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion15 && _iterator15.return) {
												_iterator15.return();
											}
										} finally {
											if (_didIteratorError15) {
												throw _iteratorError15;
											}
										}
									}
								}
							} catch (err) {
								_didIteratorError14 = true;
								_iteratorError14 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion14 && _iterator14.return) {
										_iterator14.return();
									}
								} finally {
									if (_didIteratorError14) {
										throw _iteratorError14;
									}
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError13 = true;
					_iteratorError13 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion13 && _iterator13.return) {
							_iterator13.return();
						}
					} finally {
						if (_didIteratorError13) {
							throw _iteratorError13;
						}
					}
				}
			}

			this.nodeLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.nodeLayer.setZIndex(viz.z.roadNode);
			this.mapUtil.addLayer(this.nodeLayer);
			this.dispLayers.push(this.nodeLayer);
		}
	}, {
		key: 'removeNodeLayer',
		value: function removeNodeLayer() {
			this.mapUtil.removeLayer(this.nodeLayer);
		}
	}]);

	return TgMapLanduse;
}();

module.exports = TgMapLanduse;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tgUtil = __webpack_require__(0);
var TgLocationNode = __webpack_require__(16);

var TgMapLocations = function () {
	function TgMapLocations(map, data, graph) {
		_classCallCheck(this, TgMapLocations);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.dispNameLayer = true;
		this.nameLayer = null;

		this.locationTypes = ['food', 'bar', 'park', 'museum'];
		this.currentType = 'food';
		this.locations = {};
		this.locationClusters = {};
		this.needToDisplayLocs = false;

		this.initLocations();
	}

	_createClass(TgMapLocations, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) {
				this.discard();
			} else {
				this.updateLayer();
				if (this.dispNameLayer) this.updateNameLayer();
			}
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.removeLayer();
			this.removeNameLayer();
		}
	}, {
		key: 'initLocations',
		value: function initLocations() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.locationTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var type = _step.value;

					this.locations[type] = [];
					this.locationClusters[type] = [];
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'request',
		value: function request() {
			var _this = this;

			this.readyLocs = false;
			this.data.var.readyLocation = false;

			var options = {
				term: this.currentType,
				lat: this.map.tgOrigin.origin.original.lat,
				lng: this.map.tgOrigin.origin.original.lng,
				radius: parseInt(this.map.calMaxDistance('lat') * 1000)
			};

			var s = new Date().getTime();

			$.post("http://citygram.smusic.nyu.edu:2999/yelpSearch", options).done(function (locations) {

				var elapsed = new Date().getTime() - s;
				console.log('received: locations (' + elapsed + ' ms)');

				// calculate tgLocationNode of locations
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = locations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var loc = _step2.value;

						loc.node = new TgLocationNode(loc.lat, loc.lng);
						delete loc.lat;
						delete loc.lng;
					}

					// calculate BB of locations
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				_this.map.tgBB.calBBOfLocations(locations);

				// calculate clusters of locations
				var locationClusters = _this.map.tgBB.calClusteredLocations(locations);

				// calculate average node in clusterLocations
				_this.map.tgBB.updateNodeOfClusteredLocations(locationClusters);

				// calculate BB for clusterLocations
				_this.map.tgBB.calBBOfClusterLocations(locationClusters);

				// calculate non-overlapped location names
				_this.map.tgBB.calNonOverlappedLocationNames(locations, locationClusters);

				// assign locations and locationClusters
				_this.locations[_this.currentType] = locations;
				_this.locationClusters[_this.currentType] = locationClusters;

				/*console.log('locations: ');
    console.log(locations);
    console.log('clusteredLocations: ');
    console.log(locationClusters);*/

				if (_this.map.currentMode !== 'EM') {
					if (!_this.map.tpsReady) {
						console.log('@ Not ready so wait.');
						_this.needToDisplayLocs = true;
					} else {
						_this.displayLocsInDc();
					}
				} else {
					_this.render();
					_this.map.tgBB.render();
				}

				_this.data.var.readyLocation = true;

				if (!_this.data.var.placeProcessed) {
					_this.map.tgPlaces.processPlaceObjects();
				}
			});
		}
	}, {
		key: 'displayLocsInDc',
		value: function displayLocsInDc() {
			console.log('@ displayLocsInDc');
			this.calTargetNodes();
			this.calRealNodes();
			this.calDispNodes(null, 1);

			this.map.tgBB.cleanBB();
			this.map.tgBB.addBBOfLocations();
			this.updateNonOverlappedLocationNames();

			this.render();
			this.map.tgBB.render();
		}
	}, {
		key: 'changeType',
		value: function changeType(type) {
			if (this.currentType === type) return;

			this.currentType = type;
			if (this.locations[this.currentType].length === 0) {
				this.request();
			} else {
				this.map.tgBB.cleanBB();
				this.map.tgBB.addBBOfLocations();
				this.updateNonOverlappedLocationNames();

				this.render();
				this.map.tgBB.render();
			}
		}
	}, {
		key: 'getCurrentLocations',
		value: function getCurrentLocations() {
			return this.locations[this.currentType];
		}
	}, {
		key: 'getCurrentLocationClusters',
		value: function getCurrentLocationClusters() {
			return this.locationClusters[this.currentType];
		}
	}, {
		key: 'updateNonOverlappedLocationNames',
		value: function updateNonOverlappedLocationNames() {
			this.locations[this.currentType] = this.map.tgBB.getNonOverlappedLocationNames(this.locations[this.currentType]);
		}
	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var viz = this.data.viz;
			var arr = [];
			var anchorStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.anchor, viz.radius.anchor);
			var locationStyleFunc = this.mapUtil.imageStyleFunc(viz.image.location[this.currentType]);
			var locationClusterStyleFunc = this.mapUtil.imageStyleFunc(viz.image.location.cluster);
			var lineStyleFunc = this.mapUtil.lineStyleFunc(viz.color.locationLine, viz.width.locationLine);

			// display locationClusters
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.locationClusters[this.currentType][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var cLocs = _step3.value;

					var dispLoc = cLocs.node.dispLoc;
					var dispAnchor = cLocs.node.dispAnchor;

					// lines
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString([[dispAnchor.lng, dispAnchor.lat], [dispLoc.lng, dispLoc.lat]]), lineStyleFunc);

					// anchor images
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([dispAnchor.lng, dispAnchor.lat]), anchorStyleFunc);

					// circle images
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), locationClusterStyleFunc, 'cLoc', cLocs);

					// number of locations
					var numberStyleFunc = this.mapUtil.textStyle({
						text: cLocs.locs.length + '',
						color: viz.color.textNumberOfLocations,
						font: viz.font.text
					});
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([dispLoc.lng, dispLoc.lat]), numberStyleFunc, 'cLoc', cLocs);
				}

				// display locations
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.locations[this.currentType][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var loc = _step4.value;


					// pass though if the location in the cluster
					if (loc.isInCluster) continue;

					var _dispLoc = loc.node.dispLoc;
					var _dispAnchor = loc.node.dispAnchor;

					// lines
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString([[_dispAnchor.lng, _dispAnchor.lat], [_dispLoc.lng, _dispLoc.lat]]), lineStyleFunc);

					// anchor images
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([_dispAnchor.lng, _dispAnchor.lat]), anchorStyleFunc);

					// circle images
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([_dispLoc.lng, _dispLoc.lat]), locationStyleFunc, 'loc', loc);
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			if (arr.length > 0) {
				this.removeLayer();
				this.layer = this.mapUtil.olVectorFromFeatures(arr);
				this.layer.setZIndex(viz.z.location);
				this.mapUtil.addLayer(this.layer);
				console.log('tgLocs.updateLayer():' + arr.length);
			}
		}
	}, {
		key: 'updateNameLayer',
		value: function updateNameLayer() {
			var viz = this.data.viz;
			var arr = [];

			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = this.locations[this.currentType][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var loc = _step5.value;

					if (!loc.dispName) continue;

					// only in final EM/DC map
					if (this.map.currentMode !== 'INTERMEDIATE') {
						var nameStyleFunc = this.mapUtil.textStyle({
							text: loc.name,
							color: viz.color.textLocation,
							font: viz.font.text,
							offsetX: loc.nameOffsetX,
							offsetY: loc.nameOffsetY,
							align: loc.nameAlign
						});

						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([loc.node.dispLoc.lng, loc.node.dispLoc.lat]), nameStyleFunc);
					}
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			if (arr.length > 0) {
				this.removeNameLayer();
				this.nameLayer = this.mapUtil.olVectorFromFeatures(arr);
				this.nameLayer.setZIndex(viz.z.location);
				this.mapUtil.addLayer(this.nameLayer);
			}
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.layer);
		}
	}, {
		key: 'removeNameLayer',
		value: function removeNameLayer() {
			this.mapUtil.removeLayer(this.nameLayer);
		}
	}, {
		key: 'calRealNodes',
		value: function calRealNodes() {
			var transform = this.graph.transformReal.bind(this.graph);

			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = this.locations[this.currentType][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var loc = _step6.value;

					var modified = transform(loc.node.original.lat, loc.node.original.lng);
					loc.node.real.lat = modified.lat;
					loc.node.real.lng = modified.lng;
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}
		}
	}, {
		key: 'calTargetNodes',
		value: function calTargetNodes() {
			var originLat = this.map.tgOrigin.origin.original.lat;
			var originLng = this.map.tgOrigin.origin.original.lng;
			var transformTarget = this.graph.transformTarget.bind(this.graph);
			var transformReal = this.graph.transformReal.bind(this.graph);

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = this.locations[this.currentType][Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var loc = _step7.value;

					var targetPos = transformTarget(loc.node.original.lat, loc.node.original.lng);
					var realPos = transformReal(loc.node.original.lat, loc.node.original.lng);
					var targetLen = tgUtil.D2(originLat, originLng, targetPos.lat, targetPos.lng);
					var realDegree = degreeToOrigin(realPos.lat, realPos.lng);

					loc.node.target.lat = originLat + targetLen * Math.cos(realDegree);
					loc.node.target.lng = originLng + targetLen * Math.sin(realDegree);
					//originLng + targetLen * Math.sin(realDegree) * this.graph.toLat();
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}

			function degreeToOrigin(lat, lng) {
				var deg = Math.atan((lng - originLng) / (lat - originLat));
				if (originLat == lat && originLng == lng) deg = 0;
				if (lat - originLat < 0) deg = deg + Math.PI;
				return deg;
			}
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			// update disp for locations
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = this.locations[this.currentType][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var loc = _step8.value;

					loc.node.dispAnchor = { lat: (1 - value) * loc.node.original.lat + value * loc.node.real.lat,
						lng: (1 - value) * loc.node.original.lng + value * loc.node.real.lng };
					loc.node.dispLoc = { lat: (1 - value) * loc.node.original.lat + value * loc.node.target.lat,
						lng: (1 - value) * loc.node.original.lng + value * loc.node.target.lng };
				}

				// update disp for location clusters
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8.return) {
						_iterator8.return();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}

			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = this.locationClusters[this.currentType][Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var cLocs = _step9.value;

					var dispLoc = cLocs.node.dispLoc;
					var dispAnchor = cLocs.node.dispAnchor;
					dispLoc.lat = 0;
					dispLoc.lng = 0;
					dispAnchor.lat = 0;
					dispAnchor.lng = 0;

					var _iteratorNormalCompletion10 = true;
					var _didIteratorError10 = false;
					var _iteratorError10 = undefined;

					try {
						for (var _iterator10 = cLocs.locs[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
							var cLoc = _step10.value;

							dispLoc.lat += cLoc.node.dispLoc.lat;
							dispLoc.lng += cLoc.node.dispLoc.lng;
							dispAnchor.lat += cLoc.node.dispAnchor.lat;
							dispAnchor.lng += cLoc.node.dispAnchor.lng;
						}
					} catch (err) {
						_didIteratorError10 = true;
						_iteratorError10 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion10 && _iterator10.return) {
								_iterator10.return();
							}
						} finally {
							if (_didIteratorError10) {
								throw _iteratorError10;
							}
						}
					}

					var len = cLocs.locs.length;
					dispLoc.lat /= len;
					dispLoc.lng /= len;
					dispAnchor.lat /= len;
					dispAnchor.lng /= len;
				}
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9.return) {
						_iterator9.return();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}
		}
	}, {
		key: 'showModal',
		value: function showModal(loc) {
			$('#modal-name').text(loc.name);
			$('#modal-img').attr('src', loc.imge_url);
			$('#modal-category').text(loc.categories);
			$('#modal-address').text(loc.address);
			$('#modal-phone').text(loc.phone);
			$('#modal-price').text(loc.price);
			$('#modal-rating').text(loc.rating);
			$('#modal-review-count').text(loc.rating);
			$('#modal-yelp-url').attr('href', loc.url);
			$('#modal-distance').text('appr. ' + parseInt(loc.dist / 1000) + ' km');

			var time = this.map.calTimeFromLatLng(loc.node.target.lat, loc.node.target.lng);
			//loc.node.original.lat, loc.node.original.lng);

			if (time > 0) {
				$('#modal-travel-time').text('appr. ' + parseInt(time / 60) + ' min.');
			} else {
				$('#modal-travel-time').text('-');
			}

			var modal = $('[data-remodal-id=modal]').remodal({});
			modal.open();
		}
	}]);

	return TgMapLocations;
}();

module.exports = TgMapLocations;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgNode = __webpack_require__(1);

var TgMapOrigin = function () {
	function TgMapOrigin(map, data, graph) {
		_classCallCheck(this, TgMapOrigin);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;
		this.origin = null;
		this.bb = null;
	}

	_createClass(TgMapOrigin, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) this.removeLayer();else this.updateLayer();
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.removeLayer();
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.layer);
		}
	}, {
		key: 'setOrigin',
		value: function setOrigin(lat, lng) {
			this.origin = new TgNode(lat, lng);
			this.BB = this.map.tgBB.calBBOfOrigin();
		}
	}, {
		key: 'getOrigin',
		value: function getOrigin() {
			return this.origin;
		}
	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var viz = this.data.viz;
			var arr = [];

			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([this.origin.disp.lng, this.origin.disp.lat]), this.mapUtil.imageStyleFunc(viz.image.origin[this.map.tgControl.currentTransport]), 'origin');

			this.removeLayer();
			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.origin);
			this.mapUtil.addLayer(this.layer);
		}
	}, {
		key: 'calRealNodes',
		value: function calRealNodes() {
			this.calModifiedNodes('real');
		}
	}, {
		key: 'calTargetNodes',
		value: function calTargetNodes() {
			this.calModifiedNodes('target');
		}
	}, {
		key: 'calModifiedNodes',
		value: function calModifiedNodes(kind) {
			var transformFuncName = void 0;
			if (kind === 'real') transformFuncName = 'transformReal';else if (kind === 'target') transformFuncName = 'transformTarget';else throw 'ERROR in calModifiedNodes()';

			var transform = this.graph[transformFuncName].bind(this.graph);
			var modified = transform(this.origin.original.lat, this.origin.original.lng);
			this.origin[kind].lat = modified.lat;
			this.origin[kind].lng = modified.lng;
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			if (kind === 'intermediateReal') {
				this.origin.disp.lat = (1 - value) * this.origin.original.lat + value * this.origin.real.lat;
				this.origin.disp.lng = (1 - value) * this.origin.original.lng + value * this.origin.real.lng;
			} else if (kind === 'intermediateTarget') {
				this.origin.disp.lat = (1 - value) * this.origin.original.lat + value * this.origin.target.lat;
				this.origin.disp.lng = (1 - value) * this.origin.original.lng + value * this.origin.target.lng;
			} else {
				this.origin.disp.lat = this.origin[kind].lat;
				this.origin.disp.lng = this.origin[kind].lng;
			}
		}
	}, {
		key: 'searchLatLngByAddress',
		value: function searchLatLngByAddress(address) {
			return new Promise(function (resolve, reject) {
				var key = 'vector-tiles-c1X4vZE';
				var url = 'https://search.mapzen.com/v1/search?api_key=' + key + '&text=' + address;
				$.get(url).done(function (data) {
					resolve({
						lat: (data.bbox[1] + data.bbox[3]) / 2,
						lng: (data.bbox[0] + data.bbox[2]) / 2
					});
				}).fail(function (error) {
					reject(error);
				});
			});
		}
	}, {
		key: 'getCurrentLocation',
		value: function getCurrentLocation() {
			return new Promise(function (resolve, reject) {
				var timeOutForGettingLocation = 5000; // 5 sec
				var timeOutTimer = void 0;

				if (!navigator.geolocation) {
					reject('Geolocation is not supported by this browser.');
				} else {
					navigator.geolocation.getCurrentPosition(function (pos) {
						clearTimeout(timeOutTimer);
						resolve({
							lat: pos.coords.latitude,
							lng: pos.coords.longitude
						});
					});

					timeOutTimer = setTimeout(function () {
						reject('Time out for getting geolocation');
					}, timeOutForGettingLocation);
				}
			});
		}
	}]);

	return TgMapOrigin;
}();

module.exports = TgMapOrigin;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgNode = __webpack_require__(1);

var TgMapPlaces = function () {
	function TgMapPlaces(map, data, graph) {
		_classCallCheck(this, TgMapPlaces);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.placeObjectNames = [];
		this.placeObjectsByZoom = null;
		//this.newPlaceObjects = {};
		this.dispPlaceObjects = {};
		this.placeLayer = {};
		this.timerGetPlacesData = null;
		this.dispLayers = [];

		this.minZoomOfPlaces = 100;
		this.maxZoomOfPlaces = 0;
	}

	_createClass(TgMapPlaces, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) this.clearLayers();else this.updateLayer();
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.clearLayers();
		}
	}, {
		key: 'init',
		value: function init() {
			var source = new ol.source.VectorTile({
				format: new ol.format.TopoJSON(),
				projection: 'EPSG:3857',
				tileGrid: new ol.tilegrid.createXYZ({ maxZoom: 22 }),
				url: 'https://tile.mapzen.com/mapzen/vector/v1/places/{z}/{x}/{y}.topojson?' + 'api_key=vector-tiles-c1X4vZE'
			});

			this.mapUtil.addLayer(new ol.layer.VectorTile({
				source: source,
				style: this.addToPlacesObject.bind(this)
			}));

			this.placeObjectsByZoom = new Array(this.data.zoom.max);
			for (var i = 0; i < this.data.zoom.max; i++) {
				this.placeObjectsByZoom[i] = {};
			}
		}
	}, {
		key: 'addToPlacesObject',
		value: function addToPlacesObject(feature, resolution) {
			if (this.timerGetPlacesData) clearTimeout(this.timerGetPlacesData);
			this.timerGetPlacesData = setTimeout(this.processPlaceObjects.bind(this), this.data.time.waitForGettingData);

			var name = feature.get('name').toUpperCase();

			// if there is the same place, skip it.
			if (this.placeObjectNames.indexOf(name) >= 0) return null;

			this.placeObjectNames.push(name);

			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
			var coords = feature.getGeometry().getCoordinates();
			coords.minZoom = feature.get('min_zoom') || 0;
			coords.maxZoom = feature.get('max_zoom') || this.data.zoom.max;
			coords.node = new TgNode(coords[1], coords[0]);

			if (coords.minZoom < this.minZoomOfPlaces) this.minZoomOfPlaces = coords.minZoom;
			if (coords.maxZoom > this.maxZoomOfPlaces) this.maxZoomOfPlaces = coords.maxZoom;

			this.placeObjectsByZoom[coords.minZoom][name] = coords;

			//this.newPlaceObjects[name] = coords;
			//this.placeObjects[name] = coords;
			//this.dispPlaceObjects[name] = coords;

			/*for(let zoom = minZoom; zoom <= maxZoom; zoom++) {
   	if (this.placeObjects[zoom][name]) return null;
   		//for(let i = 0; i < coords.length; i++) {
   	//coords[i].node = new TgNode(coords[i][1], coords[i][0]);
   	//}
   coords.node = new TgNode(coords[1], coords[0]);
    	this.placeObjects[zoom][name] = coords;
   }*/

			//const kind = feature.get('kind');

			//this.placeObjects[zoom][name] = 
			//{kind: kind, minZoom: minZoom, maxZoom: maxZoom,
			//coordinates: new TgNode(coords[1], coords[0])};

			//const kind_detail = feature.get('kind_detail');
			//const currentZoom = tg.map.currentZoom;
			//console.log('kind: ' + kind + ' name: ' + name);
			//console.log('zoom [' + min_zoom + ', ' + max_zoom + '] detail: ' + kind_detail);

			//if ((current_zoom < min_zoom)||(current_zoom > max_zoom)) return null;

			// ignores dock, swimming_pool
			// so Landuse, ocean, riverbank, and lake are considered.
			//if ((kind == 'dock')||(kind == 'swimming_pool')) return null

			return null;
		}
	}, {
		key: 'processPlaceObjects',
		value: function processPlaceObjects() {

			//console.log('p');

			if (this.map.currentMode === 'EM') {

				if (this.data.var.readyLocation) {
					console.log('processPlaceObjects: loc ready so process places');

					this.dispPlaceObjects = this.map.tgBB.getNonOverlappedPlaces(this.placeObjectsByZoom);

					//console.log('dispPlaces: ');
					//console.log(this.dispPlaceObjects);

					this.updateLayer();
					this.data.var.placeProcessed = true;
				} else {
					console.log('processPlaceObjects: loc is not ready so wait');
				}
			}
		}
	}, {
		key: 'needToBeRedrawn',
		value: function needToBeRedrawn() {
			this.clearLayers();
			this.data.var.placeProcessed = false;
		}

		/*calDispPlace() {
  	const currentZoom = this.data.zoom.current;
  	const top = this.data.box.top;
  	const bottom = this.data.box.bottom;
  	const right = this.data.box.right;
  	const left = this.data.box.left;
  		this.dispPlaceObjects = {};
  		for(let name in this.placeObjects) {
  		if (currentZoom < this.placeObjects[name].minZoom) {
  			continue;
  		}
  			if (currentZoom > this.placeObjects[name].maxZoom) {
  			continue;
  		}
  			const lat = this.placeObjects[name].node.original.lat;
  		const lng = this.placeObjects[name].node.original.lng;
  			if ((lat < top) && (lat > bottom) && (lng < right) && (lng > left)) {
  			this.dispPlaceObjects[name] = this.placeObjects[name];
  		}
  	}
  }*/

	}, {
		key: 'updateDispPlaces',
		value: function updateDispPlaces() {
			for (var name in this.dispPlaceObjects) {
				var place = this.dispPlaceObjects[name];
				place[0] = place.node.disp.lng;
				place[1] = place.node.disp.lat;
			}
		}

		/*addNewLayer() {
  	const viz = this.data.viz;
  	let arr = [];
  		for(let name in this.dispPlaceObjects) {
  		const place = this.dispPlaceObjects[name];
  		const styleFunc = this.mapUtil.textStyle({
  				text: name, 
  				color: viz.color.textPlace, 
  				strokeColor: viz.color.textPlaceStroke,
  				strokeWidth: viz.width.textPlaceStroke,
  				font: viz.font.places,
  			});
  			this.mapUtil.addFeatureInFeatures(
  			arr, new ol.geom.Point(place), styleFunc);
  	}
  		const layer = this.mapUtil.olVectorFromFeatures(arr);
  	layer.setZIndex(viz.z.places);
  	this.mapUtil.addLayer(layer);
  	this.dispLayers.push(layer);
  		console.log('+ new place layer: ' + arr.length);
  }*/

	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var viz = this.data.viz;
			var arr = [];

			this.clearLayers();
			this.updateDispPlaces();

			for (var name in this.dispPlaceObjects) {
				var place = this.dispPlaceObjects[name];
				var styleFunc = this.mapUtil.textStyle({
					text: name,
					color: viz.color.textPlace,
					strokeColor: viz.color.textPlaceStroke,
					strokeWidth: viz.width.textPlaceStroke,
					font: viz.font.places
				});

				this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(place), styleFunc);
			}

			if (arr.length > 0) {
				this.placeLayer = this.mapUtil.olVectorFromFeatures(arr);
				this.placeLayer.setZIndex(viz.z.places);
				this.mapUtil.addLayer(this.placeLayer);
				this.dispLayers.push(this.placeLayer);
				console.log('tgPlaces.updateLayer():' + arr.length);
			}
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.placesZooms[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var zoom = _step.value;

					this.mapUtil.removeLayer(this.placeLayer[zoom]);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'clearLayers',
		value: function clearLayers() {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.dispLayers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var layer = _step2.value;

					this.mapUtil.removeLayer(layer);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	}, {
		key: 'calRealNodes',
		value: function calRealNodes() {
			this.calModifiedNodes('real');
		}
	}, {
		key: 'calTargetNodes',
		value: function calTargetNodes() {
			this.calModifiedNodes('target');
		}
	}, {
		key: 'calModifiedNodes',
		value: function calModifiedNodes(kind) {
			var transformFuncName = void 0;
			if (kind === 'real') transformFuncName = 'transformReal';else if (kind === 'target') transformFuncName = 'transformTarget';else throw 'ERROR in calModifiedNodes()';

			var transform = this.graph[transformFuncName].bind(this.graph);

			for (var name in this.dispPlaceObjects) {
				var place = this.dispPlaceObjects[name];
				var modified = transform(place.node.original.lat, place.node.original.lng);
				place.node[kind].lat = modified.lat;
				place.node[kind].lng = modified.lng;
			}
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			if (kind === 'intermediateReal') {
				for (var name in this.dispPlaceObjects) {
					var place = this.dispPlaceObjects[name];
					place.node.disp.lat = (1 - value) * place.node.original.lat + value * place.node.real.lat;
					place.node.disp.lng = (1 - value) * place.node.original.lng + value * place.node.real.lng;
				}
			} else if (kind === 'intermediateTarget') {
				for (var _name in this.dispPlaceObjects) {
					var _place = this.dispPlaceObjects[_name];
					_place.node.disp.lat = (1 - value) * _place.node.original.lat + value * _place.node.target.lat;
					_place.node.disp.lng = (1 - value) * _place.node.original.lng + value * _place.node.target.lng;
				}
			} else {
				for (var _name2 in this.dispPlaceObjects) {
					var _place2 = this.dispPlaceObjects[_name2];
					_place2.node.disp.lat = _place2.node[kind].lat;
					_place2.node.disp.lng = _place2.node[kind].lng;
				}
			}
		}
	}]);

	return TgMapPlaces;
}();

module.exports = TgMapPlaces;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tgUtil = __webpack_require__(0);
var TgNode = __webpack_require__(1);

var TgMapRoads = function () {
	function TgMapRoads(map, data, graph) {
		_classCallCheck(this, TgMapRoads);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = {};

		this.simplify = true;
		this.dispNodeLayer = false;
		this.nodeLayer = null;

		this.roadTypes = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential'];
		this.roadObjects = {};
		this.newRoadObjects = {};
		this.dispRoads = {};
		this.dispRoadTypes = [];
		this.timerGetRoadData = null;
		this.dispLayers = [];
		this.rdpThreshold = this.data.var.rdpThreshold.road;

		for (var zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
			this.roadObjects[zoom] = {};
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.roadTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var type = _step.value;
					this.roadObjects[zoom][type] = [];
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = this.roadTypes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var _type = _step2.value;

				this.layer[_type] = null;
				this.newRoadObjects[_type] = [];
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	}

	_createClass(TgMapRoads, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) this.clearLayers();else this.updateLayer();
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.clearLayers();
		}
	}, {
		key: 'init',
		value: function init() {
			var roadSource = new ol.source.VectorTile({
				format: new ol.format.TopoJSON(),
				projection: 'EPSG:3857',
				tileGrid: new ol.tilegrid.createXYZ({ maxZoom: 22 }),
				url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?' + 'api_key=vector-tiles-c1X4vZE'
			});

			this.mapUtil.addLayer(new ol.layer.VectorTile({
				source: roadSource,
				style: this.addToRoadObject.bind(this)
			}));
		}
	}, {
		key: 'addToRoadObject',
		value: function addToRoadObject(feature) {
			if (this.timerGetRoadData) clearTimeout(this.timerGetRoadData);
			this.timerGetRoadData = setTimeout(this.processNewRoadObjects.bind(this), this.data.time.waitForGettingRoadData);

			// only types we want to consider are passed.
			var kind_detail = feature.get('kind_detail');
			if (this.roadTypes.indexOf(kind_detail) < 0) return null;

			var geoType = feature.getGeometry().getType();
			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

			var coords = feature.getGeometry().getCoordinates();
			//const minZoom = feature.get('min_zoom');
			//coords.minZoom = feature.get('min_zoom');

			var minZoom = feature.get('min_zoom');
			//console.log(minZoom);
			//const id = feature.get('id');
			//console.log(id);
			//if (!id) return null;

			// TODO: test lenCoords vs coords.length

			var zoom = this.data.zoom.current;

			if (geoType === 'LineString') {

				if (this.simplify && this.map.simplify) {
					coords = tgUtil.RDPSimp1D(coords, this.rdpThreshold);
				}
				coords.minZoom = feature.get('min_zoom');
				//coords.minZoom = minZoom;


				for (var i = 0; i < coords.length; i++) {
					coords[i].node = new TgNode(coords[i][1], coords[i][0]);
				}
				this.roadObjects[zoom][kind_detail].push(coords);
				this.newRoadObjects[kind_detail].push(coords);

				if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
					this.dispRoads[kind_detail].push(coords);
				}
			} else if (geoType === 'MultiLineString') {

				if (this.simplify && this.map.simplify) {
					coords = tgUtil.RDPSimp2D(coords, this.rdpThreshold);
				}
				coords.minZoom = feature.get('min_zoom');
				//coords.minZoom = minZoom;


				for (var _i = 0; _i < coords.length; _i++) {
					for (var j = 0; j < coords[_i].length; j++) {
						coords[_i][j].node = new TgNode(coords[_i][j][1], coords[_i][j][0]);
					}
				}
				this.roadObjects[zoom][kind_detail].push(coords);
				this.newRoadObjects[kind_detail].push(coords);

				if (this.dispRoadTypes.indexOf(kind_detail) >= 0) {
					this.dispRoads[kind_detail].push(coords);
				}
			}

			return null;
		}
	}, {
		key: 'processNewRoadObjects',
		value: function processNewRoadObjects() {
			/*
   this.map.setDataInfo(
   	'numHighwayLoading', 'set', 
   	this.roadObjects.motorway.length + this.roadObjects.trunk.length);
   this.map.setDataInfo(
   	'numPrimaryLoading', 'set', this.roadObjects.primary.length);
   this.map.setDataInfo(
   	'numSecondaryLoading', 'set', this.roadObjects.secondary.length);
   this.map.setDataInfo(
   	'numTertiaryLoading', 'set', this.roadObjects.tertiary.length);
   this.map.setDataInfo(
   	'numResidentialLoading', 'set', this.roadObjects.residential.length);
   this.map.setDataInfo('numRoadLoading', 'increase');
   this.map.setTime('roadLoading', 'end', (new Date()).getTime());
   */

			if (this.map.currentMode === 'EM') {
				this.addNewLayer();
			}

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.roadTypes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var type = _step3.value;

					this.newRoadObjects[type] = [];
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}, {
		key: 'updateDisplayedRoadType',
		value: function updateDisplayedRoadType(currentZoom) {
			this.dispRoadTypes = [];
			for (var type in this.data.zoom.disp) {
				if (currentZoom >= this.data.zoom.disp[type].min) {
					this.dispRoadTypes.push(type);
				}
			}
		}
	}, {
		key: 'calDispRoads',
		value: function calDispRoads() {
			var currentZoom = this.data.zoom.current;
			var top = this.data.box.top + this.data.var.latMargin;
			var bottom = this.data.box.bottom - this.data.var.latMargin;
			var right = this.data.box.right + this.data.var.lngMargin;
			var left = this.data.box.left - this.data.var.lngMargin;

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.roadTypes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var type = _step4.value;

					this.dispRoads[type] = [];
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = this.dispRoadTypes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var _type2 = _step5.value;
					var _iteratorNormalCompletion6 = true;
					var _didIteratorError6 = false;
					var _iteratorError6 = undefined;

					try {
						for (var _iterator6 = this.roadObjects[currentZoom][_type2][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
							var road = _step6.value;

							if (currentZoom < road.minZoom) {
								continue;
							}

							if (road[0].node) {
								// LineString
								for (var i = 0; i < road.length; i++) {
									var lat = road[i].node.original.lat;
									var lng = road[i].node.original.lng;
									if (lat < top && lat > bottom && lng < right && lng > left) {
										this.dispRoads[_type2].push(road);
										break;
									}
								}
							} else if (road[0][0].node) {
								// MultiLineString
								var isIn = false;
								for (var _i2 = 0; _i2 < road.length; _i2++) {
									for (var j = 0; j < road[_i2].length; j++) {
										var _lat = road[_i2][j].node.original.lat;
										var _lng = road[_i2][j].node.original.lng;
										if (_lat < top && _lat > bottom && _lng < right && _lng > left) {
											this.dispRoads[_type2].push(road);
											isIn = true;
											break;
										}
									}
									if (isIn) break;
								}
							}
						}
					} catch (err) {
						_didIteratorError6 = true;
						_iteratorError6 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion6 && _iterator6.return) {
								_iterator6.return();
							}
						} finally {
							if (_didIteratorError6) {
								throw _iteratorError6;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}
	}, {
		key: 'updateDispRoads',
		value: function updateDispRoads() {
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = this.dispRoadTypes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var type = _step7.value;
					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = this.dispRoads[type][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var road = _step8.value;

							if (road[0].node) {
								// LineString
								for (var i = 0; i < road.length; i++) {
									road[i][0] = road[i].node.disp.lng;
									road[i][1] = road[i].node.disp.lat;
								}
							} else if (road[0][0].node) {
								// MultiLineString
								for (var _i3 = 0; _i3 < road.length; _i3++) {
									for (var j = 0; j < road[_i3].length; j++) {
										road[_i3][j][0] = road[_i3][j].node.disp.lng;
										road[_i3][j][1] = road[_i3][j].node.disp.lat;
									}
								}
							} else {
								console.log('not known geotype in createDispRoas()');
							}
						}
					} catch (err) {
						_didIteratorError8 = true;
						_iteratorError8 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion8 && _iterator8.return) {
								_iterator8.return();
							}
						} finally {
							if (_didIteratorError8) {
								throw _iteratorError8;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		}
	}, {
		key: 'addNewLayer',
		value: function addNewLayer() {
			var viz = this.data.viz;

			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = this.dispRoadTypes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var type = _step9.value;

					var arr = [];
					var styleFunc = this.mapUtil.lineStyleFunc(viz.color.road[type], viz.width.road[type]);

					var _iteratorNormalCompletion10 = true;
					var _didIteratorError10 = false;
					var _iteratorError10 = undefined;

					try {
						for (var _iterator10 = this.newRoadObjects[type][Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
							var road = _step10.value;

							if (road[0].node) {
								// LineString
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(road), styleFunc);
							} else if (road[0][0].node) {
								// MultiLineString
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.MultiLineString(road), styleFunc);
							} else {
								console.log('not known geotype in createDispRoas()');
							}
						}
					} catch (err) {
						_didIteratorError10 = true;
						_iteratorError10 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion10 && _iterator10.return) {
								_iterator10.return();
							}
						} finally {
							if (_didIteratorError10) {
								throw _iteratorError10;
							}
						}
					}

					var layer = this.mapUtil.olVectorFromFeatures(arr);
					layer.setZIndex(viz.z[type]);
					this.mapUtil.addLayer(layer);
					this.dispLayers.push(layer);
				}
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9.return) {
						_iterator9.return();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}

			if (this.dispNodeLayer) this.addNewNodeLayer();
		}

		//

	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var viz = this.data.viz;
			//this.removeLayer();
			this.clearLayers();
			this.updateDispRoads();

			var _iteratorNormalCompletion11 = true;
			var _didIteratorError11 = false;
			var _iteratorError11 = undefined;

			try {
				for (var _iterator11 = this.dispRoadTypes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
					var type = _step11.value;

					var arr = [];
					var styleFunc = this.mapUtil.lineStyleFunc(viz.color.road[type], viz.width.road[type]);

					var _iteratorNormalCompletion12 = true;
					var _didIteratorError12 = false;
					var _iteratorError12 = undefined;

					try {
						for (var _iterator12 = this.dispRoads[type][Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
							var road = _step12.value;

							if (road[0].node) {
								// LineString
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(road), styleFunc);
							} else if (road[0][0].node) {
								// MultiLineString
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.MultiLineString(road), styleFunc);
							} else {
								console.log('not known geotype in createDispRoas()');
							}
						}
					} catch (err) {
						_didIteratorError12 = true;
						_iteratorError12 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion12 && _iterator12.return) {
								_iterator12.return();
							}
						} finally {
							if (_didIteratorError12) {
								throw _iteratorError12;
							}
						}
					}

					this.layer[type] = this.mapUtil.olVectorFromFeatures(arr);
					this.layer[type].setZIndex(viz.z[type]);
					this.mapUtil.addLayer(this.layer[type]);
					this.dispLayers.push(this.layer[type]);
				}
			} catch (err) {
				_didIteratorError11 = true;
				_iteratorError11 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion11 && _iterator11.return) {
						_iterator11.return();
					}
				} finally {
					if (_didIteratorError11) {
						throw _iteratorError11;
					}
				}
			}

			if (this.dispNodeLayer) this.addNodeLayer();
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			var _iteratorNormalCompletion13 = true;
			var _didIteratorError13 = false;
			var _iteratorError13 = undefined;

			try {
				for (var _iterator13 = this.roadTypes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
					var type = _step13.value;

					this.mapUtil.removeLayer(this.layer[type]);
				}
			} catch (err) {
				_didIteratorError13 = true;
				_iteratorError13 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion13 && _iterator13.return) {
						_iterator13.return();
					}
				} finally {
					if (_didIteratorError13) {
						throw _iteratorError13;
					}
				}
			}

			;
		}
	}, {
		key: 'clearLayers',
		value: function clearLayers() {
			var _iteratorNormalCompletion14 = true;
			var _didIteratorError14 = false;
			var _iteratorError14 = undefined;

			try {
				for (var _iterator14 = this.dispLayers[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
					var layer = _step14.value;

					this.mapUtil.removeLayer(layer);
				}
			} catch (err) {
				_didIteratorError14 = true;
				_iteratorError14 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion14 && _iterator14.return) {
						_iterator14.return();
					}
				} finally {
					if (_didIteratorError14) {
						throw _iteratorError14;
					}
				}
			}
		}
	}, {
		key: 'calRealNodes',
		value: function calRealNodes() {
			this.calModifiedNodes('real');
		}
	}, {
		key: 'calTargetNodes',
		value: function calTargetNodes() {
			this.calModifiedNodes('target');
		}
	}, {
		key: 'calModifiedNodes',
		value: function calModifiedNodes(kind) {

			var transformFuncName = void 0;
			if (kind === 'real') transformFuncName = 'transformReal';else if (kind === 'target') transformFuncName = 'transformTarget';else throw 'ERROR in calModifiedNodes()';

			var transform = this.graph[transformFuncName].bind(this.graph);

			var _iteratorNormalCompletion15 = true;
			var _didIteratorError15 = false;
			var _iteratorError15 = undefined;

			try {
				for (var _iterator15 = this.dispRoadTypes[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
					var type = _step15.value;
					var _iteratorNormalCompletion16 = true;
					var _didIteratorError16 = false;
					var _iteratorError16 = undefined;

					try {
						for (var _iterator16 = this.dispRoads[type][Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
							var road = _step16.value;

							var modified = void 0;

							if (road[0].node) {
								// LineString {
								for (var i = 0; i < road.length; i++) {
									modified = transform(road[i].node.original.lat, road[i].node.original.lng);
									road[i].node[kind].lat = modified.lat;
									road[i].node[kind].lng = modified.lng;
								}
							} else if (road[0][0].node) {
								// MultiLineString
								for (var _i4 = 0; _i4 < road.length; _i4++) {
									for (var j = 0; j < road[_i4].length; j++) {
										modified = transform(road[_i4][j].node.original.lat, road[_i4][j].node.original.lng);
										road[_i4][j].node[kind].lat = modified.lat;
										road[_i4][j].node[kind].lng = modified.lng;
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError16 = true;
						_iteratorError16 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion16 && _iterator16.return) {
								_iterator16.return();
							}
						} finally {
							if (_didIteratorError16) {
								throw _iteratorError16;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError15 = true;
				_iteratorError15 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion15 && _iterator15.return) {
						_iterator15.return();
					}
				} finally {
					if (_didIteratorError15) {
						throw _iteratorError15;
					}
				}
			}
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			var _iteratorNormalCompletion17 = true;
			var _didIteratorError17 = false;
			var _iteratorError17 = undefined;

			try {

				for (var _iterator17 = this.dispRoadTypes[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
					var type = _step17.value;
					var _iteratorNormalCompletion18 = true;
					var _didIteratorError18 = false;
					var _iteratorError18 = undefined;

					try {
						for (var _iterator18 = this.dispRoads[type][Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
							var road = _step18.value;


							if (road[0].node) {
								// LineString {
								if (kind === 'intermediateReal') {
									for (var i = 0; i < road.length; i++) {
										road[i].node.disp.lat = (1 - value) * road[i].node.original.lat + value * road[i].node.real.lat;
										road[i].node.disp.lng = (1 - value) * road[i].node.original.lng + value * road[i].node.real.lng;
									}
								} else if (kind === 'intermediateTarget') {
									for (var _i5 = 0; _i5 < road.length; _i5++) {
										road[_i5].node.disp.lat = (1 - value) * road[_i5].node.original.lat + value * road[_i5].node.target.lat;
										road[_i5].node.disp.lng = (1 - value) * road[_i5].node.original.lng + value * road[_i5].node.target.lng;
									}
								} else {
									for (var _i6 = 0; _i6 < road.length; _i6++) {
										road[_i6].node.disp.lat = road[_i6].node[kind].lat;
										road[_i6].node.disp.lng = road[_i6].node[kind].lng;
									}
								}
							} else if (road[0][0].node) {
								// MultiLineString
								if (kind === 'intermediateReal') {
									for (var _i7 = 0; _i7 < road.length; _i7++) {
										for (var j = 0; j < road[_i7].length; j++) {
											road[_i7][j].node.disp.lat = (1 - value) * road[_i7][j].node.original.lat + value * road[_i7][j].node.real.lat;
											road[_i7][j].node.disp.lng = (1 - value) * road[_i7][j].node.original.lng + value * road[_i7][j].node.real.lng;
										}
									}
								} else if (kind === 'intermediateTarget') {
									for (var _i8 = 0; _i8 < road.length; _i8++) {
										for (var _j = 0; _j < road[_i8].length; _j++) {
											road[_i8][_j].node.disp.lat = (1 - value) * road[_i8][_j].node.original.lat + value * road[_i8][_j].node.target.lat;
											road[_i8][_j].node.disp.lng = (1 - value) * road[_i8][_j].node.original.lng + value * road[_i8][_j].node.target.lng;
										}
									}
								} else {
									for (var _i9 = 0; _i9 < road.length; _i9++) {
										for (var _j2 = 0; _j2 < road[_i9].length; _j2++) {
											road[_i9][_j2].node.disp.lat = road[_i9][_j2].node[kind].lat;
											road[_i9][_j2].node.disp.lng = road[_i9][_j2].node[kind].lng;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError18 = true;
						_iteratorError18 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion18 && _iterator18.return) {
								_iterator18.return();
							}
						} finally {
							if (_didIteratorError18) {
								throw _iteratorError18;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError17 = true;
				_iteratorError17 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion17 && _iterator17.return) {
						_iterator17.return();
					}
				} finally {
					if (_didIteratorError17) {
						throw _iteratorError17;
					}
				}
			}
		}
	}, {
		key: 'calNumberOfNode',
		value: function calNumberOfNode() {
			var count = 0;

			var _iteratorNormalCompletion19 = true;
			var _didIteratorError19 = false;
			var _iteratorError19 = undefined;

			try {
				for (var _iterator19 = this.dispRoadTypes[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
					var type = _step19.value;
					var _iteratorNormalCompletion20 = true;
					var _didIteratorError20 = false;
					var _iteratorError20 = undefined;

					try {
						for (var _iterator20 = this.dispRoads[type][Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
							var road = _step20.value;

							if (road[0].node) {
								// LineString
								count += road.length;
							} else if (road[0][0].node) {
								// MultiLineString
								var _iteratorNormalCompletion21 = true;
								var _didIteratorError21 = false;
								var _iteratorError21 = undefined;

								try {
									for (var _iterator21 = road[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
										var road2 = _step21.value;

										count += road2.length;
									}
								} catch (err) {
									_didIteratorError21 = true;
									_iteratorError21 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion21 && _iterator21.return) {
											_iterator21.return();
										}
									} finally {
										if (_didIteratorError21) {
											throw _iteratorError21;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError20 = true;
						_iteratorError20 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion20 && _iterator20.return) {
								_iterator20.return();
							}
						} finally {
							if (_didIteratorError20) {
								throw _iteratorError20;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError19 = true;
				_iteratorError19 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion19 && _iterator19.return) {
						_iterator19.return();
					}
				} finally {
					if (_didIteratorError19) {
						throw _iteratorError19;
					}
				}
			}

			return count;
		}
	}, {
		key: 'addNewNodeLayer',
		value: function addNewNodeLayer() {
			var viz = this.data.viz;
			var arr = [];
			var edgeStyleFunc = this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
			var nodeStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

			var _iteratorNormalCompletion22 = true;
			var _didIteratorError22 = false;
			var _iteratorError22 = undefined;

			try {
				for (var _iterator22 = this.dispRoadTypes[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
					var type = _step22.value;
					var _iteratorNormalCompletion23 = true;
					var _didIteratorError23 = false;
					var _iteratorError23 = undefined;

					try {
						for (var _iterator23 = this.newRoadObjects[type][Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
							var roads = _step23.value;


							if (roads[0].node) {
								// LineString
								// edge
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(roads), edgeStyleFunc);

								// node
								var _iteratorNormalCompletion24 = true;
								var _didIteratorError24 = false;
								var _iteratorError24 = undefined;

								try {
									for (var _iterator24 = roads[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
										var node = _step24.value;

										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(node), nodeStyleFunc);
									}
								} catch (err) {
									_didIteratorError24 = true;
									_iteratorError24 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion24 && _iterator24.return) {
											_iterator24.return();
										}
									} finally {
										if (_didIteratorError24) {
											throw _iteratorError24;
										}
									}
								}
							} else if (roads[0][0].node) {
								// MultiLineString
								var _iteratorNormalCompletion25 = true;
								var _didIteratorError25 = false;
								var _iteratorError25 = undefined;

								try {
									for (var _iterator25 = roads[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
										var nodes = _step25.value;

										// edge
										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(nodes), edgeStyleFunc);

										// node
										var _iteratorNormalCompletion26 = true;
										var _didIteratorError26 = false;
										var _iteratorError26 = undefined;

										try {
											for (var _iterator26 = nodes[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
												var _node = _step26.value;

												this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(_node), nodeStyleFunc);
											}
										} catch (err) {
											_didIteratorError26 = true;
											_iteratorError26 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion26 && _iterator26.return) {
													_iterator26.return();
												}
											} finally {
												if (_didIteratorError26) {
													throw _iteratorError26;
												}
											}
										}
									}
								} catch (err) {
									_didIteratorError25 = true;
									_iteratorError25 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion25 && _iterator25.return) {
											_iterator25.return();
										}
									} finally {
										if (_didIteratorError25) {
											throw _iteratorError25;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError23 = true;
						_iteratorError23 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion23 && _iterator23.return) {
								_iterator23.return();
							}
						} finally {
							if (_didIteratorError23) {
								throw _iteratorError23;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError22 = true;
				_iteratorError22 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion22 && _iterator22.return) {
						_iterator22.return();
					}
				} finally {
					if (_didIteratorError22) {
						throw _iteratorError22;
					}
				}
			}

			var layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z.roadNode);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);
		}
	}, {
		key: 'addNodeLayer',
		value: function addNodeLayer() {
			var viz = this.data.viz;
			this.mapUtil.removeLayer(this.nodeLayer);

			var arr = [];
			var edgeStyleFunc = this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
			var nodeStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.roadNode, viz.radius.node);

			var _iteratorNormalCompletion27 = true;
			var _didIteratorError27 = false;
			var _iteratorError27 = undefined;

			try {
				for (var _iterator27 = this.dispRoadTypes[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
					var type = _step27.value;
					var _iteratorNormalCompletion28 = true;
					var _didIteratorError28 = false;
					var _iteratorError28 = undefined;

					try {
						for (var _iterator28 = this.dispRoads[type][Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
							var roads = _step28.value;

							if (roads[0].node) {
								// LineString
								// edge
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(roads), edgeStyleFunc);

								// node
								var _iteratorNormalCompletion29 = true;
								var _didIteratorError29 = false;
								var _iteratorError29 = undefined;

								try {
									for (var _iterator29 = roads[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
										var node = _step29.value;

										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(node), nodeStyleFunc);
									}
								} catch (err) {
									_didIteratorError29 = true;
									_iteratorError29 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion29 && _iterator29.return) {
											_iterator29.return();
										}
									} finally {
										if (_didIteratorError29) {
											throw _iteratorError29;
										}
									}
								}
							} else if (roads[0][0].node) {
								// MultiLineString
								var _iteratorNormalCompletion30 = true;
								var _didIteratorError30 = false;
								var _iteratorError30 = undefined;

								try {
									for (var _iterator30 = roads[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
										var nodes = _step30.value;

										// edge
										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(nodes), edgeStyleFunc);

										// node
										var _iteratorNormalCompletion31 = true;
										var _didIteratorError31 = false;
										var _iteratorError31 = undefined;

										try {
											for (var _iterator31 = nodes[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
												var _node2 = _step31.value;

												this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(_node2), nodeStyleFunc);
											}
										} catch (err) {
											_didIteratorError31 = true;
											_iteratorError31 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion31 && _iterator31.return) {
													_iterator31.return();
												}
											} finally {
												if (_didIteratorError31) {
													throw _iteratorError31;
												}
											}
										}
									}
								} catch (err) {
									_didIteratorError30 = true;
									_iteratorError30 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion30 && _iterator30.return) {
											_iterator30.return();
										}
									} finally {
										if (_didIteratorError30) {
											throw _iteratorError30;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError28 = true;
						_iteratorError28 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion28 && _iterator28.return) {
								_iterator28.return();
							}
						} finally {
							if (_didIteratorError28) {
								throw _iteratorError28;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError27 = true;
				_iteratorError27 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion27 && _iterator27.return) {
						_iterator27.return();
					}
				} finally {
					if (_didIteratorError27) {
						throw _iteratorError27;
					}
				}
			}

			this.nodeLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.nodeLayer.setZIndex(viz.z.roadNode);
			this.mapUtil.addLayer(this.nodeLayer);
			this.dispLayers.push(this.nodeLayer);
		}
	}, {
		key: 'removeNodeLayer',
		value: function removeNodeLayer() {
			this.mapUtil.removeLayer(this.nodeLayer);
		}
	}]);

	return TgMapRoads;
}();

module.exports = TgMapRoads;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgMapUtil = function () {
	function TgMapUtil(data, map) {
		_classCallCheck(this, TgMapUtil);

		this.data = data;
		this.map = map; // OL map

		this.lineStyle = this.lineStyleFunc;
		this.nodeStyle = this.nodeStyleFunc;
		this.polygonStyle = this.polygonStyleFunc;
		this.imageStyle = this.imageStyleFunc;
		this.textStyle = this.textStyleFunc;
		this.isochroneStyle = this.isochroneStyleFunc;
	}

	_createClass(TgMapUtil, [{
		key: 'addFeatureInFeatures',
		value: function addFeatureInFeatures(arr, geometry, styleFunc, type, source) {
			var feature = new ol.Feature({ geometry: geometry });
			feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			feature.setStyle(styleFunc);
			if (type) feature.type = type;
			if (source) feature.source = source;
			arr.push(feature);
		}
	}, {
		key: 'isInTheBox',
		value: function isInTheBox(lat, lng) {
			var box = this.data.box;

			if (lat < box.top && lat > box.bottom && lng < box.right && lng > box.left) return true;else return false;
		}
	}, {
		key: 'printElapsedTime',
		value: function printElapsedTime(times, type) {
			var str = type + ' : ';
			if (times[type].elapsed != undefined) {
				str += times[type].elapsed + ' ms.';
			} else {
				str += times[type].end - times[type].start + ' ms.';
			}
			console.log(str);
		}
	}, {
		key: 'addLayer',
		value: function addLayer(layer) {
			if (layer) {
				this.map.addLayer(layer);
			}
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer(layer) {
			if (layer) {
				this.map.removeLayer(layer);
				layer = null;
			}
		}
	}, {
		key: 'removeAllLayers',
		value: function removeAllLayers() {
			this.map.getLayers().clear();
		}
	}, {
		key: 'olVectorFromFeatures',
		value: function olVectorFromFeatures(arr) {
			return new ol.layer.Vector({
				source: new ol.source.Vector({
					features: arr
				})
			});
		}
	}, {
		key: 'lineStyleFunc',
		value: function lineStyleFunc(color, width) {
			return new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: color,
					width: width
				})
			});
		}
	}, {
		key: 'nodeStyleFunc',
		value: function nodeStyleFunc(color, radius) {
			return new ol.style.Style({
				image: new ol.style.Circle({
					radius: radius,
					fill: new ol.style.Fill({
						color: color
					})
				})
			});
		}
	}, {
		key: 'polygonStyleFunc',
		value: function polygonStyleFunc(color) {
			return new ol.style.Style({
				fill: new ol.style.Fill({
					color: color
				})
			});
		}
	}, {
		key: 'imageStyleFunc',
		value: function imageStyleFunc(src) {
			var xPixel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

			return new ol.style.Style({
				image: new ol.style.Icon({
					src: src
					//anchor: [0.5, 0.5],
					//anchorXUnits: 'pixels'
				})
			});
		}
	}, {
		key: 'textStyleFunc',
		value: function textStyleFunc(param) {
			var textOptions = {};
			var color = param.color || '#F00';
			var strokeColor = null;
			var strokeWidth = 2;

			textOptions.fill = new ol.style.Fill({ color: color });
			textOptions.font = param.font || '16pt Source Sans Pro';
			textOptions.text = param.text || 'unknown';
			textOptions.textAlign = param.align || 'center';

			if (param.offsetX) textOptions.offsetX = param.offsetX;
			if (param.offsetY) textOptions.offsetY = param.offsetY;
			if (param.strokeColor) strokeColor = param.strokeColor;
			if (param.strokeWidth) strokeWidth = param.strokeWidth;
			if (strokeColor) textOptions.stroke = new ol.style.Stroke({ color: strokeColor, width: strokeWidth });

			return new ol.style.Style({
				text: new ol.style.Text(textOptions)
			});
		}
	}, {
		key: 'isochroneStyleFunc',
		value: function isochroneStyleFunc(radius, color, width) {
			return new ol.style.Style({
				image: new ol.style.Circle({
					radius: radius,
					stroke: new ol.style.Stroke({
						color: color,
						width: width
					})
				})
			});
		}
	}]);

	return TgMapUtil;
}();

module.exports = TgMapUtil;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tgUtil = __webpack_require__(0);
var TgNode = __webpack_require__(1);

var TgMapWater = function () {
	function TgMapWater(map, data, graph) {
		_classCallCheck(this, TgMapWater);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.simplify = false;
		this.dispNodeLayer = false;
		this.nodeLayer = null;

		this.waterObjects = {};
		this.newWaterObjects = [];
		this.dispWaterObjects = [];
		this.timerGetWaterData = null;
		this.timerFinishGettingWaterData = null;
		this.dispLayers = [];
		this.rdpThreshold = this.data.var.rdpThreshold.water;
		this.timeInterval = 0;
		this.timeIntervalArray = [];

		for (var zoom = this.data.zoom.min; zoom <= this.data.zoom.max; zoom++) {
			this.waterObjects[zoom] = [];
		}
	}

	_createClass(TgMapWater, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) this.clearLayers();else this.updateLayer();
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.clearLayers();
		}
	}, {
		key: 'init',
		value: function init() {
			var waterSource = new ol.source.VectorTile({
				format: new ol.format.TopoJSON(),
				projection: 'EPSG:3857',
				//preload: 1,
				tileGrid: new ol.tilegrid.createXYZ({ maxZoom: 22 }),
				url: 'https://tile.mapzen.com/mapzen/vector/v1/water/{z}/{x}/{y}.topojson?' + 'api_key=vector-tiles-c1X4vZE'
			});

			this.mapUtil.addLayer(new ol.layer.VectorTile({
				source: waterSource,
				style: this.addToWaterObject.bind(this)
			}));
		}
	}, {
		key: 'addToWaterObject',
		value: function addToWaterObject(feature, resolution) {

			if (this.timerGetWaterData) clearTimeout(this.timerGetWaterData);
			this.timerGetWaterData = setTimeout(this.processNewWaterObjects.bind(this), this.data.time.waitForGettingWaterData);

			if (this.map.timerCheckGridSplitInTgMap) {
				clearTimeout(this.map.timerCheckGridSplitInTgMap);
			}

			var geoType = feature.getGeometry().getType();
			var zoom = this.data.zoom.current;

			// ignores LineString, Point, ...
			if (geoType == 'Polygon' || geoType == 'MultiPolygon') {

				var kind = feature.get('kind');

				// ignores dock, swimming_pool
				// so water, ocean, riverbank, and lake are considered.
				if (kind === 'dock' || kind === 'swimming_pool') return null;

				feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');

				var coords = feature.getGeometry().getCoordinates();
				coords.minZoom = feature.get('min_zoom');

				//console.log(coords.minZoom + ' : ' + kind);

				//const lenCoords = coords.length;

				if (geoType === 'Polygon') {

					if (this.simplify && this.map.simplify) {
						coords = tgUtil.RDPSimp2DLoop(coords, this.rdpThreshold);
					}

					for (var i = 0; i < coords.length; i++) {
						for (var j = 0; j < coords[i].length; j++) {
							coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
						}
					}

					this.waterObjects[zoom].push(coords);
					this.newWaterObjects.push(coords);
					this.dispWaterObjects.push(coords);
				} else if (geoType == 'MultiPolygon') {

					if (this.simplify && this.map.simplify) {
						coords = tgUtil.RDPSimp3DLoop(coords, this.rdpThreshold);
					}

					for (var _i = 0; _i < coords.length; _i++) {
						for (var _j = 0; _j < coords[_i].length; _j++) {
							for (var k = 0; k < coords[_i][_j].length; k++) {
								coords[_i][_j][k].node = new TgNode(coords[_i][_j][k][1], coords[_i][_j][k][0]);
							}
						}
					}

					this.waterObjects[zoom].push(coords);
					this.newWaterObjects.push(coords);
					this.dispWaterObjects.push(coords);
				}
			}
			return null;
		}
	}, {
		key: 'processNewWaterObjects',
		value: function processNewWaterObjects() {

			//console.log('w');

			if (this.timerFinishGettingWaterData) {
				clearTimeout(this.timerFinishGettingWaterData);
			}
			this.timerFinishGettingWaterData = setTimeout(this.finishGettingWaterObjects.bind(this), this.data.time.waitForFinishGettingWaterData);

			this.map.setDataInfo('numWaterLoading', 'increase');
			this.map.setTime('waterLoading', 'end', new Date().getTime());

			if (this.map.currentMode === 'EM') {
				this.addNewLayer();
			}
			this.newWaterObjects = [];

			var cur = new Date().getTime();
			if (this.timeInterval !== 0) {
				var dif = cur - this.timeInterval;
				this.timeIntervalArray.push(dif);
				//console.log('### elapsed: ' + dif + ' ms');
			}
			this.timeInterval = cur;
		}
	}, {
		key: 'calDispWater',
		value: function calDispWater() {
			var currentZoom = this.data.zoom.current;
			var top = this.data.box.top + this.data.var.latMargin;
			var bottom = this.data.box.bottom - this.data.var.latMargin;
			var right = this.data.box.right + this.data.var.lngMargin;
			var left = this.data.box.left - this.data.var.lngMargin;

			this.dispWaterObjects = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.waterObjects[currentZoom][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var water = _step.value;

					if (currentZoom < water.minZoom) {
						continue;
					}

					var isIn = false;
					if (water[0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						for (var i = 0; i < water.length; i++) {
							for (var j = 0; j < water[i].length; j++) {
								var lat = water[i][j].node.original.lat;
								var lng = water[i][j].node.original.lng;

								if (lat < top && lat > bottom && lng < right && lng > left) {
									this.dispWaterObjects.push(water);
									isIn = true;
									break;
								}
							}
							if (isIn) break;
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						for (var _i2 = 0; _i2 < water.length; _i2++) {
							for (var _j2 = 0; _j2 < water[_i2].length; _j2++) {
								for (var k = 0; k < water[_i2][_j2].length; k++) {
									var _lat = water[_i2][_j2][k].node.original.lat;
									var _lng = water[_i2][_j2][k].node.original.lng;
									if (_lat < top && _lat > bottom && _lng < right && _lng > left) {
										this.dispWaterObjects.push(water);
										isIn = true;
										break;
									}
								}
								if (isIn) break;
							}
							if (isIn) break;
						}
					}
				}

				//console.log('/# of water : ' + this.waterObjects.length);
				//console.log('/# of disp water: ' + this.dispWaterObjects.length);
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'updateDispWater',
		value: function updateDispWater() {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.dispWaterObjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var water = _step2.value;

					if (water[0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						for (var i = 0; i < water.length; i++) {
							for (var j = 0; j < water[i].length; j++) {
								water[i][j][0] = water[i][j].node.disp.lng;
								water[i][j][1] = water[i][j].node.disp.lat;
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						for (var _i3 = 0; _i3 < water.length; _i3++) {
							for (var _j3 = 0; _j3 < water[_i3].length; _j3++) {
								for (var k = 0; k < water[_i3][_j3].length; k++) {
									water[_i3][_j3][k][0] = water[_i3][_j3][k].node.disp.lng;
									water[_i3][_j3][k][1] = water[_i3][_j3][k].node.disp.lat;
								}
							}
						}
					} else {
						console.log('not known geotype in createDispRoas()');
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	}, {
		key: 'addNewLayer',
		value: function addNewLayer() {
			var viz = this.data.viz;
			var arr = [];
			var styleFunc = this.mapUtil.polygonStyleFunc(viz.color.water);

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.newWaterObjects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var water = _step3.value;


					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Polygon(water), styleFunc);
					} else if (water[0][0][0].node) {
						// MultiPolygon
						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.MultiPolygon(water), styleFunc);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			var layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z.water);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);

			//console.log('+ new water layer: ' + arr.length);
			if (this.dispNodeLayer) this.addNewNodeLayer();
		}

		//

	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var viz = this.data.viz;
			var arr = [];
			var styleFunc = this.mapUtil.polygonStyleFunc(viz.color.water);

			this.clearLayers();
			this.updateDispWater();

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.dispWaterObjects[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var water = _step4.value;

					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Polygon(water), styleFunc);
					} else if (water[0][0][0].node) {
						// MultiPolygon
						this.mapUtil.addFeatureInFeatures(arr, new ol.geom.MultiPolygon(water), styleFunc);
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.water);
			this.mapUtil.addLayer(this.layer);
			this.dispLayers.push(this.layer);

			if (this.dispNodeLayer) this.addNodeLayer();
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.layer);
		}
	}, {
		key: 'clearLayers',
		value: function clearLayers() {
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = this.dispLayers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var layer = _step5.value;

					this.mapUtil.removeLayer(layer);
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}
	}, {
		key: 'calRealNodes',
		value: function calRealNodes() {
			this.calModifiedNodes('real');
		}
	}, {
		key: 'calTargetNodes',
		value: function calTargetNodes() {
			this.calModifiedNodes('target');
		}
	}, {
		key: 'calModifiedNodes',
		value: function calModifiedNodes(kind) {
			var transformFuncName = void 0;
			if (kind === 'real') transformFuncName = 'transformReal';else if (kind === 'target') transformFuncName = 'transformTarget';else throw 'ERROR in calModifiedNodes()';

			var transform = this.graph[transformFuncName].bind(this.graph);

			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = this.dispWaterObjects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var water = _step6.value;

					var modified = void 0;

					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						for (var i = 0; i < water.length; i++) {
							for (var j = 0; j < water[i].length; j++) {
								modified = transform(water[i][j].node.original.lat, water[i][j].node.original.lng);
								water[i][j].node[kind].lat = modified.lat;
								water[i][j].node[kind].lng = modified.lng;
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						for (var _i4 = 0; _i4 < water.length; _i4++) {
							for (var _j4 = 0; _j4 < water[_i4].length; _j4++) {
								for (var k = 0; k < water[_i4][_j4].length; k++) {
									modified = transform(water[_i4][_j4][k].node.original.lat, water[_i4][_j4][k].node.original.lng);
									water[_i4][_j4][k].node[kind].lat = modified.lat;
									water[_i4][_j4][k].node[kind].lng = modified.lng;
								}
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {

				for (var _iterator7 = this.dispWaterObjects[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var water = _step7.value;


					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						if (kind === 'intermediateReal') {
							for (var i = 0; i < water.length; i++) {
								for (var j = 0; j < water[i].length; j++) {
									water[i][j].node.disp.lat = (1 - value) * water[i][j].node.original.lat + value * water[i][j].node.real.lat;
									water[i][j].node.disp.lng = (1 - value) * water[i][j].node.original.lng + value * water[i][j].node.real.lng;
								}
							}
						} else if (kind === 'intermediateTarget') {
							for (var _i5 = 0; _i5 < water.length; _i5++) {
								for (var _j5 = 0; _j5 < water[_i5].length; _j5++) {
									water[_i5][_j5].node.disp.lat = (1 - value) * water[_i5][_j5].node.original.lat + value * water[_i5][_j5].node.target.lat;
									water[_i5][_j5].node.disp.lng = (1 - value) * water[_i5][_j5].node.original.lng + value * water[_i5][_j5].node.target.lng;
								}
							}
						} else {
							for (var _i6 = 0; _i6 < water.length; _i6++) {
								for (var _j6 = 0; _j6 < water[_i6].length; _j6++) {
									water[_i6][_j6].node.disp.lat = water[_i6][_j6].node[kind].lat;
									water[_i6][_j6].node.disp.lng = water[_i6][_j6].node[kind].lng;
								}
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						if (kind === 'intermediateReal') {
							for (var _i7 = 0; _i7 < water.length; _i7++) {
								for (var _j7 = 0; _j7 < water[_i7].length; _j7++) {
									for (var k = 0; k < water[_i7][_j7].length; k++) {
										water[_i7][_j7][k].node.disp.lat = (1 - value) * water[_i7][_j7][k].node.original.lat + value * water[_i7][_j7][k].node.real.lat;
										water[_i7][_j7][k].node.disp.lng = (1 - value) * water[_i7][_j7][k].node.original.lng + value * water[_i7][_j7][k].node.real.lng;
									}
								}
							}
						} else if (kind === 'intermediateTarget') {
							for (var _i8 = 0; _i8 < water.length; _i8++) {
								for (var _j8 = 0; _j8 < water[_i8].length; _j8++) {
									for (var _k = 0; _k < water[_i8][_j8].length; _k++) {
										water[_i8][_j8][_k].node.disp.lat = (1 - value) * water[_i8][_j8][_k].node.original.lat + value * water[_i8][_j8][_k].node.target.lat;
										water[_i8][_j8][_k].node.disp.lng = (1 - value) * water[_i8][_j8][_k].node.original.lng + value * water[_i8][_j8][_k].node.target.lng;
									}
								}
							}
						} else {
							for (var _i9 = 0; _i9 < water.length; _i9++) {
								for (var _j9 = 0; _j9 < water[_i9].length; _j9++) {
									for (var _k2 = 0; _k2 < water[_i9][_j9].length; _k2++) {
										water[_i9][_j9][_k2].node.disp.lat = water[_i9][_j9][_k2].node[kind].lat;
										water[_i9][_j9][_k2].node.disp.lng = water[_i9][_j9][_k2].node[kind].lng;
									}
								}
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		}
	}, {
		key: 'checkPointsInWater',
		value: function checkPointsInWater(points) {
			var original = this.map.tgOrigin.origin.original;
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = points[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var point = _step8.value;

					this.isPointInWater(original, point);
				}
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8.return) {
						_iterator8.return();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}

			console.log('complete: points in water');
		}
	}, {
		key: 'isPointInWater',
		value: function isPointInWater(original, point) {
			var countIntersection = 0;
			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = this.dispWaterObjects[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var water = _step9.value;


					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						for (var i = 0; i < water.length; i++) {
							for (var j = 0; j < water[i].length - 1; j++) {

								if (tgUtil.intersects(original.lat, original.lng, point.original.lat, point.original.lng, water[i][j][1], water[i][j][0], water[i][j + 1][1], water[i][j + 1][0])) {
									countIntersection++;
								}
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						for (var _i10 = 0; _i10 < water.length; _i10++) {
							for (var _j10 = 0; _j10 < water[_i10].length; _j10++) {
								for (var k = 0; k < water[_i10][_j10].length - 1; k++) {

									if (tgUtil.intersects(original.lat, original.lng, point.original.lat, point.original.lng, water[_i10][_j10][k][1], water[_i10][_j10][k][0], water[_i10][_j10][k + 1][1], water[_i10][_j10][k + 1][0])) {
										countIntersection++;
									}
								}
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9.return) {
						_iterator9.return();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}

			if (countIntersection % 2 === 1) {
				point.travelTime = null;
				//console.log('i: ' + point.index + ' #: ' + countIntersection);
			}
		}
	}, {
		key: 'calNumberOfNode',
		value: function calNumberOfNode() {
			var count = 0;

			var _iteratorNormalCompletion10 = true;
			var _didIteratorError10 = false;
			var _iteratorError10 = undefined;

			try {
				for (var _iterator10 = this.dispWaterObjects[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
					var water = _step10.value;


					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						var _iteratorNormalCompletion11 = true;
						var _didIteratorError11 = false;
						var _iteratorError11 = undefined;

						try {
							for (var _iterator11 = water[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
								var water2 = _step11.value;

								count += water2.length;
							}
						} catch (err) {
							_didIteratorError11 = true;
							_iteratorError11 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion11 && _iterator11.return) {
									_iterator11.return();
								}
							} finally {
								if (_didIteratorError11) {
									throw _iteratorError11;
								}
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						var _iteratorNormalCompletion12 = true;
						var _didIteratorError12 = false;
						var _iteratorError12 = undefined;

						try {
							for (var _iterator12 = water[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
								var _water = _step12.value;
								var _iteratorNormalCompletion13 = true;
								var _didIteratorError13 = false;
								var _iteratorError13 = undefined;

								try {
									for (var _iterator13 = _water[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
										var water3 = _step13.value;

										count += water3.length;
									}
								} catch (err) {
									_didIteratorError13 = true;
									_iteratorError13 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion13 && _iterator13.return) {
											_iterator13.return();
										}
									} finally {
										if (_didIteratorError13) {
											throw _iteratorError13;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError12 = true;
							_iteratorError12 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion12 && _iterator12.return) {
									_iterator12.return();
								}
							} finally {
								if (_didIteratorError12) {
									throw _iteratorError12;
								}
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError10 = true;
				_iteratorError10 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion10 && _iterator10.return) {
						_iterator10.return();
					}
				} finally {
					if (_didIteratorError10) {
						throw _iteratorError10;
					}
				}
			}

			return count;
		}
	}, {
		key: 'finishGettingWaterObjects',
		value: function finishGettingWaterObjects() {

			var sum = 0;
			var _iteratorNormalCompletion14 = true;
			var _didIteratorError14 = false;
			var _iteratorError14 = undefined;

			try {
				for (var _iterator14 = this.timeIntervalArray[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
					var time = _step14.value;
					sum += time;
				} //console.log('################ FIN.');
				//console.log('AVG: ' + ());
			} catch (err) {
				_didIteratorError14 = true;
				_iteratorError14 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion14 && _iterator14.return) {
						_iterator14.return();
					}
				} finally {
					if (_didIteratorError14) {
						throw _iteratorError14;
					}
				}
			}

			var t = parseInt(sum / this.timeIntervalArray.length);
			console.log('complete: getting water(' + t + ' ms)');
			this.timeInterval = 0;
			this.timeIntervalArray = [];

			this.map.calSplittedGrid();
		}
	}, {
		key: 'addNewNodeLayer',
		value: function addNewNodeLayer() {
			var viz = this.data.viz;
			var arr = [];
			var edgeStyleFunc = this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
			var nodeStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.waterNode, viz.radius.node);

			var _iteratorNormalCompletion15 = true;
			var _didIteratorError15 = false;
			var _iteratorError15 = undefined;

			try {
				for (var _iterator15 = this.newWaterObjects[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
					var water = _step15.value;

					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						var _iteratorNormalCompletion16 = true;
						var _didIteratorError16 = false;
						var _iteratorError16 = undefined;

						try {
							for (var _iterator16 = water[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
								var nodes = _step16.value;

								// edge
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(nodes), edgeStyleFunc);

								// node
								var _iteratorNormalCompletion17 = true;
								var _didIteratorError17 = false;
								var _iteratorError17 = undefined;

								try {
									for (var _iterator17 = nodes[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
										var node = _step17.value;

										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(node), nodeStyleFunc);
									}
								} catch (err) {
									_didIteratorError17 = true;
									_iteratorError17 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion17 && _iterator17.return) {
											_iterator17.return();
										}
									} finally {
										if (_didIteratorError17) {
											throw _iteratorError17;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError16 = true;
							_iteratorError16 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion16 && _iterator16.return) {
									_iterator16.return();
								}
							} finally {
								if (_didIteratorError16) {
									throw _iteratorError16;
								}
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						var _iteratorNormalCompletion18 = true;
						var _didIteratorError18 = false;
						var _iteratorError18 = undefined;

						try {
							for (var _iterator18 = water[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
								var water2 = _step18.value;
								var _iteratorNormalCompletion19 = true;
								var _didIteratorError19 = false;
								var _iteratorError19 = undefined;

								try {
									for (var _iterator19 = water2[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
										var _nodes = _step19.value;

										// edge
										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(_nodes), edgeStyleFunc);

										// node
										var _iteratorNormalCompletion20 = true;
										var _didIteratorError20 = false;
										var _iteratorError20 = undefined;

										try {
											for (var _iterator20 = _nodes[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
												var _node = _step20.value;

												this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(_node), nodeStyleFunc);
											}
										} catch (err) {
											_didIteratorError20 = true;
											_iteratorError20 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion20 && _iterator20.return) {
													_iterator20.return();
												}
											} finally {
												if (_didIteratorError20) {
													throw _iteratorError20;
												}
											}
										}
									}
								} catch (err) {
									_didIteratorError19 = true;
									_iteratorError19 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion19 && _iterator19.return) {
											_iterator19.return();
										}
									} finally {
										if (_didIteratorError19) {
											throw _iteratorError19;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError18 = true;
							_iteratorError18 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion18 && _iterator18.return) {
									_iterator18.return();
								}
							} finally {
								if (_didIteratorError18) {
									throw _iteratorError18;
								}
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError15 = true;
				_iteratorError15 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion15 && _iterator15.return) {
						_iterator15.return();
					}
				} finally {
					if (_didIteratorError15) {
						throw _iteratorError15;
					}
				}
			}

			var layer = this.mapUtil.olVectorFromFeatures(arr);
			layer.setZIndex(viz.z.waterNode);
			this.mapUtil.addLayer(layer);
			this.dispLayers.push(layer);
		}
	}, {
		key: 'addNodeLayer',
		value: function addNodeLayer() {
			var viz = this.data.viz;

			this.mapUtil.removeLayer(this.nodeLayer);

			var arr = [];
			var edgeStyleFunc = this.mapUtil.lineStyleFunc(viz.color.edge, viz.width.edge);
			var nodeStyleFunc = this.mapUtil.nodeStyleFunc(viz.color.waterNode, viz.radius.node);

			var _iteratorNormalCompletion21 = true;
			var _didIteratorError21 = false;
			var _iteratorError21 = undefined;

			try {
				for (var _iterator21 = this.dispWaterObjects[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
					var water = _step21.value;

					if (water[0].length === 0 || water[0][0].length === 0) continue;

					if (water[0][0].node) {
						// Polygon
						var _iteratorNormalCompletion22 = true;
						var _didIteratorError22 = false;
						var _iteratorError22 = undefined;

						try {
							for (var _iterator22 = water[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
								var nodes = _step22.value;

								// edge
								this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(nodes), edgeStyleFunc);

								// node
								var _iteratorNormalCompletion23 = true;
								var _didIteratorError23 = false;
								var _iteratorError23 = undefined;

								try {
									for (var _iterator23 = nodes[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
										var node = _step23.value;

										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(node), nodeStyleFunc);
									}
								} catch (err) {
									_didIteratorError23 = true;
									_iteratorError23 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion23 && _iterator23.return) {
											_iterator23.return();
										}
									} finally {
										if (_didIteratorError23) {
											throw _iteratorError23;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError22 = true;
							_iteratorError22 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion22 && _iterator22.return) {
									_iterator22.return();
								}
							} finally {
								if (_didIteratorError22) {
									throw _iteratorError22;
								}
							}
						}
					} else if (water[0][0][0].node) {
						// MultiPolygon
						var _iteratorNormalCompletion24 = true;
						var _didIteratorError24 = false;
						var _iteratorError24 = undefined;

						try {
							for (var _iterator24 = water[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
								var water2 = _step24.value;
								var _iteratorNormalCompletion25 = true;
								var _didIteratorError25 = false;
								var _iteratorError25 = undefined;

								try {
									for (var _iterator25 = water2[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
										var _nodes2 = _step25.value;

										// edge
										this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(_nodes2), edgeStyleFunc);

										// node
										var _iteratorNormalCompletion26 = true;
										var _didIteratorError26 = false;
										var _iteratorError26 = undefined;

										try {
											for (var _iterator26 = _nodes2[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
												var _node2 = _step26.value;

												this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(_node2), nodeStyleFunc);
											}
										} catch (err) {
											_didIteratorError26 = true;
											_iteratorError26 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion26 && _iterator26.return) {
													_iterator26.return();
												}
											} finally {
												if (_didIteratorError26) {
													throw _iteratorError26;
												}
											}
										}
									}
								} catch (err) {
									_didIteratorError25 = true;
									_iteratorError25 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion25 && _iterator25.return) {
											_iterator25.return();
										}
									} finally {
										if (_didIteratorError25) {
											throw _iteratorError25;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError24 = true;
							_iteratorError24 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion24 && _iterator24.return) {
									_iterator24.return();
								}
							} finally {
								if (_didIteratorError24) {
									throw _iteratorError24;
								}
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError21 = true;
				_iteratorError21 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion21 && _iterator21.return) {
						_iterator21.return();
					}
				} finally {
					if (_didIteratorError21) {
						throw _iteratorError21;
					}
				}
			}

			this.nodeLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.nodeLayer.setZIndex(viz.z.waterNode);
			this.mapUtil.addLayer(this.nodeLayer);
			this.dispLayers.push(this.nodeLayer);
		}
	}, {
		key: 'removeNodeLayer',
		value: function removeNodeLayer() {
			this.mapUtil.removeLayer(this.nodeLayer);
		}
	}]);

	return TgMapWater;
}();

module.exports = TgMapWater;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TgNode = __webpack_require__(1);

var TgControlPoint = function (_TgNode) {
	_inherits(TgControlPoint, _TgNode);

	function TgControlPoint(orgLat, orgLng) {
		_classCallCheck(this, TgControlPoint);

		var _this = _possibleConstructorReturn(this, (TgControlPoint.__proto__ || Object.getPrototypeOf(TgControlPoint)).call(this, orgLat, orgLng));

		_this.connectedNodes = [];
		_this.connectedGrids = [];
		_this.index = -1;
		_this.intersected = false;
		return _this;
	}

	return TgControlPoint;
}(TgNode);

module.exports = TgControlPoint;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TgNode = __webpack_require__(1);

var TgLocationNode = function (_TgNode) {
	_inherits(TgLocationNode, _TgNode);

	function TgLocationNode(orgLat, orgLng) {
		_classCallCheck(this, TgLocationNode);

		var _this = _possibleConstructorReturn(this, (TgLocationNode.__proto__ || Object.getPrototypeOf(TgLocationNode)).call(this, orgLat, orgLng));

		_this.dispAnchor = { lat: orgLat, lng: orgLng };
		_this.dispLoc = { lat: orgLat, lng: orgLng };
		_this.dispName = true;
		_this.nameOffsetX = 0;
		_this.nameOffsetY = 0;
		_this.nameAlign = 'center';
		return _this;
	}

	return TgLocationNode;
}(TgNode);

module.exports = TgLocationNode;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
	zoom: {
		max: 18,
		min: 10,
		init: 14,
		current: 0,
		disp: {
			motorway: { min: 1, max: 20 },
			trunk: { min: 1, max: 20 },
			primary: { min: 12, max: 20 },
			secondary: { min: 13, max: 20 },
			tertiary: { min: 14, max: 20 },
			residential: { min: 15, max: 20 }
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
			places: 19,
			location: 20,
			isochrone: 25,
			origin: 30,
			boundingBox: 40,
			grid: 50,
			controlPoint: 51
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
			landuse: ['rgb(203, 230, 163)', // recreation_ground, park, garden
			'rgb(214, 233, 185)', // cemetery, golf_course, zoo
			'rgb(228, 228, 223)', // university, college, school
			'rgb(236, 239, 234)', // stadium
			'rgb(249, 237, 241)', // hospital
			'rgb(240, 224, 200)'],
			landuseNode: '#009245',
			locationLine: 'rgba(0, 0, 0, 0.5)',
			road: {
				motorway: 'rgb(254, 216, 157)',
				trunk: 'rgb(254, 241, 185)',
				primary: '#FFF',
				secondary: '#FFF',
				tertiary: '#FFF',
				residential: '#FFF'
			},
			roadNode: '#E00B62',
			text: '#000', // '#686453',
			textPlace: 'rgba(0, 0, 0, 0.5)', //'#000'
			textPlaceStroke: 'rgba(255, 255, 255, 0.5)', //'#FFF',
			textLocation: '#000', //'rgb(122, 62, 44)', 
			textNumberOfLocations: '#FFF',
			water: 'rgb(163, 204, 255)',
			waterNode: '#0071BC'
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
				residential: 1
			},
			textPlaceStroke: 2
		},

		radius: {
			anchor: 5,
			controlPoint: 13,
			node: 3
		},

		image: {
			anchor: 'img/anchor.png',
			location: {
				food: 'img/location_food.png',
				bar: 'img/location_bar.png',
				park: 'img/location_park.png',
				museum: 'img/location_museum.png',
				cluster: 'img/dest_group.png'
			},
			origin: {
				auto: 'img/origin_car.png',
				bicycle: 'img/origin_bicycles.png',
				pedestrian: 'img/origin_foot.png'
			},
			red10min: 'img/10min.png'
			//red100min: 'img/100min.png',
		},

		font: {
			isochroneText: '24px PT Sans Narrow',
			places: '14pt Source Sans Pro Regular',
			text: '12pt Source Sans Pro Regular'
		}
	},

	origin: {
		default: {
			lat: 47.6631772,
			lng: -122.3104933
		}
	},

	center: {
		seattleDowntown: {
			lat: 47.6115744,
			lng: -122.343777
		},
		seattleUw: {
			lat: 47.658316,
			lng: -122.312035
		},
		sfLombard: {
			lat: 37.802139,
			lng: -122.4209287
		},
		nyNyu: {
			lat: 40.72946,
			lng: -73.995708
		},
		paloAltoStanford: {
			lat: 37.4275172,
			lng: -122.170233
		},
		quebecCitadelle: {
			lat: 46.8078034,
			lng: -71.2090926
		}
	},

	box: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	},

	var: {
		latPerPx: 0,
		lngPerPx: 0,
		latMargin: 0,
		lngMargin: 0,
		numLanduseClasses: 6,
		marginPercent: 30,
		maxSplitLevel: 0,
		placeProcessed: false,
		shapePreservingDegree: 1.0,
		readyLocation: false,
		resolution: {
			gridLng: 4, // horiozontal resolution. even number is recommended
			gridLat: 8 // vertical resolution. even number is recommended
		},
		rdpThreshold: {
			road: 0.001, //0.0001 (about 10 meter)
			water: 0.0005,
			landuse: 0.001
		}
	},

	time: {
		waitForFinishGettingWaterData: 500, // ms
		waitForGettingData: 20, // ms
		waitForGettingRoadData: 50, // ms
		waitForGettingWaterData: 0 // ms
	}

};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tgUtil = __webpack_require__(0);

var TgGraph = function () {
	function TgGraph(tg) {
		_classCallCheck(this, TgGraph);

		this.tg = tg;
		this.tpsTarget = null;
		this.tpsReal = null;
	}

	_createClass(TgGraph, [{
		key: 'calWarping',
		value: function calWarping(noNeedToCalFactor) {
			this.tg.map.setTime('controlPointWarping', 'start', new Date().getTime());

			var ctlPts = this.tg.map.tgControl.controlPoints;
			this.calDegrees(ctlPts);
			if (!noNeedToCalFactor) this.factor = this.calFactor(ctlPts);
			this.calTargetNodesOfCtlPts();

			this.tg.map.setTime('controlPointWarping', 'end', new Date().getTime());
			//console.log('factor = ' + this.factor);
		}

		//
		// calculate the degrees of all nodes.
		//

	}, {
		key: 'calDegrees',
		value: function calDegrees(nodes) {
			var xLat = this.tg.map.tgOrigin.origin.original.lat;
			var xLng = this.tg.map.tgOrigin.origin.original.lng;
			var yLat, yLng, deg;

			for (var i = 0; i < nodes.length; i++) {
				yLat = nodes[i].original.lat;
				yLng = nodes[i].original.lng;

				deg = Math.atan((yLng - xLng) / (yLat - xLat));
				if (xLat == yLat && xLng == yLng) deg = 0;
				if (yLat - xLat < 0) deg = deg + Math.PI;
				nodes[i].deg = deg;
			}
		}
	}, {
		key: 'calFactor',
		value: function calFactor(nodes) {
			var cLat = this.tg.map.tgOrigin.origin.original.lat;
			var cLng = this.tg.map.tgOrigin.origin.original.lng;
			var MAX_ITERATION = 20;
			var start = 1000;
			var end = 100000;
			var eps = 10;

			for (var time = 0; time < MAX_ITERATION; time++) {

				//console.log('[' + start + ', ' + end + ']');

				var half = (start + end) / 2;
				var dif = this.calDifference(half, nodes, cLat, cLng);
				var after_dif = this.calDifference(half + eps, nodes, cLat, cLng);

				//console.log(dif + ' - ' + after_dif);

				if (dif < after_dif) {
					end = half; // '/'
				} else {
					start = half; // '\'
				}
			}
			return (start + end) / 2;
		}
	}, {
		key: 'calDifference',
		value: function calDifference(factor, nodes, cLat, cLng) {
			var lenNodes = nodes.length;
			var target = Array(lenNodes);
			var len;

			for (var i = 0; i < lenNodes; i++) {
				target[i] = { lat: 0, lng: 0 };
			}

			for (var i = 0; i < lenNodes; i++) {
				if (nodes[i].travelTime) {
					len = nodes[i].travelTime / factor;
					target[i].lat = cLat + len * Math.cos(nodes[i].deg);
					target[i].lng = cLng + len * Math.sin(nodes[i].deg) * this.toLat();
				}
			}

			var sum = 0;
			for (var i = 0; i < lenNodes; i++) {
				if (nodes[i].travelTime) {
					sum += tgUtil.D2(nodes[i].original.lat, nodes[i].original.lng, target[i].lat, target[i].lng);
				}
			}
			return sum;
		}
	}, {
		key: 'calTargetNodesOfCtlPts',
		value: function calTargetNodesOfCtlPts() {
			var nodes = this.tg.map.tgControl.controlPoints;
			var xLat = this.tg.map.tgOrigin.origin.original.lat;
			var xLng = this.tg.map.tgOrigin.origin.original.lng;

			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].travelTime) {
					nodes[i].len = nodes[i].travelTime / this.factor;
					nodes[i].target.lat = xLat + nodes[i].len * Math.cos(nodes[i].deg);
					nodes[i].target.lng = xLng + nodes[i].len * Math.sin(nodes[i].deg) * this.toLat();
				} else {
					nodes[i].target.lat = nodes[i].original.lat;
					nodes[i].target.lng = nodes[i].original.lng;
				}

				if (xLat == nodes[i].original.lat && xLng == nodes[i].original.lng) {
					nodes[i].len = 0;
					nodes[i].target.lat = xLat;
					nodes[i].target.lng = xLng;
				}

				nodes[i].real.lat = nodes[i].target.lat;
				nodes[i].real.lng = nodes[i].target.lng;
			}
		}
	}, {
		key: 'toLat',
		value: function toLat() {
			/*
   let heightPX = $('#ol_map').css('height'); 
   	heightPX = Number(heightPX.slice(0, heightPX.length - 2));
   const heightLat = this.data.box.top - this.data.box.bottom;
   const latPerPx = heightLat / heightPX;
   	let widthPX = $('#ol_map').css('width');  
   	widthPX = Number(widthPX.slice(0, widthPX.length - 2));
   	const widthLng = this.data.box.right - this.data.box.left;
   const lngPerPx = widthLng / widthPX;
   	return lngPerPx / latPerPx;
   */

			return 0.00016965364355785907 / 0.00011481966468342245; //org
		}

		//
		//
		//

	}, {
		key: 'TPSSolve',
		value: function TPSSolve() {

			/*
   // rearrangement
   var dLat = (this.data.box.top - this.data.box.bottom) / (this.data.var.resolution.gridLat - 1)
   var dLng = (this.data.box.right - this.data.box.left) / (this.data.var.resolution.gridLng - 1)
   var lngL, latB
   var nodes = [];
   	for(var i = 0; i < this.data.var.resolution.gridLat; i++) {
   	for(var j = 0; j < this.data.var.resolution.gridLng; j++) {
   			lngL = this.data.box.left + dLng * j
   		latB = this.data.box.bottom + dLat * i
   			var min_dist = Number.MAX_VALUE
   		var dist, min_k = 0
   			for(var k = 0; k < ctlPts.length; k++) {
   			dist = tgUtil.D2(latB, lngL, ctlPts[k].original.lat, ctlPts[k].original.lng)
   				if (dist < min_dist) {
   				min_dist = dist
   				min_k = k
   			}
   		}
   		nodes.push(ctlPts[min_k])
   	}
   }
   	console.log(nodes)
   */

			this.tg.map.setTime('tpsCalculating', 'start', new Date().getTime());

			var nodes = this.tg.map.tgControl.controlPoints;
			var ptTarget = [];
			var ptReal = [];
			var counter = 0;

			for (var i = 0; i < nodes.length; i++) {
				ptTarget[counter] = [[nodes[i].original.lat, nodes[i].original.lng], [nodes[i].target.lat, nodes[i].target.lng]];
				ptReal[counter] = [[nodes[i].original.lat, nodes[i].original.lng], [nodes[i].real.lat, nodes[i].real.lng]];
				counter++;
				//console.log(nodes[i].original.lat + '->' + nodes[i].target.lat)
				//console.log(nodes[i].original.lng + '->' + nodes[i].target.lng)
			}

			this.tpsTarget = new ThinPlateSpline();
			this.tpsTarget.push_points(ptTarget);
			this.tpsTarget.solve();

			this.tpsReal = new ThinPlateSpline();
			this.tpsReal.push_points(ptReal);
			this.tpsReal.solve();

			this.tg.map.setTime('tpsCalculating', 'end', new Date().getTime());
		}
	}, {
		key: 'TPSTest',
		value: function TPSTest() {
			if (!this.tpsTarget || !this.tpsReal) {
				console.log('TPS is null');
				return false;
			}

			var lat = this.tg.map.tgOrigin.origin.original.lat;
			var lng = this.tg.map.tgOrigin.origin.original.lng;
			var trpt = this.tpsTarget.transform([lat, lng], false);
			var d = tgUtil.D2(lat, lng, trpt[0], trpt[1]);

			if (d < 0.1) {
				return true;
			} else {
				console.log(lat + '->' + trpt[0]);
				console.log(lng + '->' + trpt[1]);
				console.log('d = ' + d);
				return false;
			}
		}
	}, {
		key: 'transformTarget',
		value: function transformTarget(lat, lng) {
			var trpt = this.tpsTarget.transform([lat, lng], false);
			return { lat: trpt[0], lng: trpt[1] };
		}
	}, {
		key: 'transformReal',
		value: function transformReal(lat, lng) {
			var trpt = this.tpsReal.transform([lat, lng], false);
			return { lat: trpt[0], lng: trpt[1] };
		}
	}, {
		key: 'transform',
		value: function transform(lat, lng) {
			var trpt = this.tpsReal.transform([lat, lng], false);
			return { lat: trpt[0], lng: trpt[1] };
		}
	}]);

	return TgGraph;
}();

module.exports = TgGraph;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgControl = __webpack_require__(6);
var TgRoads = __webpack_require__(12);
var TgWater = __webpack_require__(14);
var TgLanduse = __webpack_require__(8);
var TgPlaces = __webpack_require__(11);
var TgLocations = __webpack_require__(9);
var TgIsochrone = __webpack_require__(7);
var TgBoundingBox = __webpack_require__(5);
var TgOrigin = __webpack_require__(10);
var TgGrid = __webpack_require__(20);
var tgUtil = __webpack_require__(0);
var TgMapUtil = __webpack_require__(13);
var TgInteraction = __webpack_require__(21);

var TgMap = function () {
	function TgMap(tg, map_id) {
		var _this = this;

		_classCallCheck(this, TgMap);

		this.tg = tg;
		this.data = tg.data;
		this.graph = tg.graph;

		this.olView = new ol.View({
			center: ol.proj.fromLonLat([0, 0]),
			maxZoom: this.data.zoom.max,
			minZoom: this.data.zoom.min,
			zoom: this.data.zoom.init
		});

		this.olMap = new ol.Map({
			interactions: ol.interaction.defaults().extend([new TgInteraction(this)]),
			target: map_id,
			//controls: [],
			layers: [],
			view: this.olView
		});

		this.olMap.getInteractions().forEach(function (interaction) {
			if (interaction instanceof ol.interaction.DragPan) {
				_this.olMap.dragPan = interaction;
			}
		}, this);

		// modules

		this.mapUtil = new TgMapUtil(this.data, this.olMap);
		this.tgWater = new TgWater(this, this.data, this.graph);
		this.tgRoads = new TgRoads(this, this.data, this.graph);
		this.tgLanduse = new TgLanduse(this, this.data, this.graph);
		this.tgLocs = new TgLocations(this, this.data, this.graph);
		this.tgControl = new TgControl(this, this.data, this.graph);
		this.tgGrids = new TgGrid(this, this.data, this.graph);
		this.tgPlaces = new TgPlaces(this, this.data, this.graph);
		this.tgBB = new TgBoundingBox(this, this.data, this.graph);
		this.tgOrigin = new TgOrigin(this, this.data, this.graph);
		this.tgIsochrone = new TgIsochrone(this, this.data, this.graph);

		// initialization

		this.tgWater.init();
		this.tgRoads.init();
		this.tgLanduse.init();
		this.tgPlaces.init();

		// variables

		this.tgWater.turn(true);
		$('#dispWaterCB').prop('checked', true);

		this.tgRoads.turn(true);
		$('#dispRoadsCB').prop('checked', true);

		this.tgLanduse.turn(true);
		$('#dispLanduseCB').prop('checked', true);

		this.tgPlaces.turn(true);
		$('#dispPlaceCB').prop('checked', true);

		this.tgLocs.turn(true);
		$('#dispLocationCB').prop('checked', true);

		this.tgOrigin.turn(true);
		$('#dispOriginCB').prop('checked', true);

		this.tgIsochrone.turn(true);
		$('#dispIsochroneCB').prop('checked', true);

		//this.tgGrids.turn(true);
		//$('#dispGridCB').prop('checked', true);

		//this.tgBB.turn(true);
		//$('#dispBoundingBoxCB').prop('checked', true);

		this.warpingMode = 'shapePreserving';
		this.needToCalWarping = false;

		this.currentMode = 'EM';
		this.data.zoom.current = this.olMap.getView().getZoom();
		this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);

		this.olMapHeightPX = $('#ol_map').css('height');
		this.olMapHeightPX = Number(this.olMapHeightPX.slice(0, this.olMapHeightPX.length - 2)); // 900
		this.olMapWidthPX = $('#ol_map').css('width');
		this.olMapWidthPX = Number(this.olMapWidthPX.slice(0, this.olMapWidthPX.length - 2)); // 600

		// Event Handlers
		this.olMap.on('moveend', this.onMoveEnd.bind(this));

		this.times = {};
		this.tempTimes = {};
		this.frame = 0; // [0 (EM), 10 (DC)]
		this.timerFrame = null;
		this.animationSpeed = 50; // ms
		this.tpsReady = false;
		this.timerCheckGridSplitInTgMap = null;

		this.readyControlPoints = false;

		this.displayString = { roadLoadingTime: 'Road Loading:',
			waterLoadingTime: 'Water Loading:',
			landuseLoadingTime: 'Landuse Loading:',
			placeLoadingTime: 'Place Loading:',
			travelTimeLoadingTime: 'Travel Time Loading:',
			locationLoadingTime: 'Location Loading:',
			controlPointWarpingTime: 'Control Points Warping:',
			tpsCalculatingTime: 'TPS Calculating:',
			elementsWarpingTime: 'Elements Warping (avg):',
			waterWarpingTime: 'Water Warping (avg):',
			roadWarpingTime: 'Road Warping (avg):',
			placeWarpingTime: 'Place Warping (avg):',
			landuseWarpingTime: 'Landuse Warping (avg):',
			etcWarpingTime: 'Etc Warping (avg):',

			numRoadLoading: '# of Road:',
			numHighwayLoading: '# of Highway:',
			numPrimaryLoading: '# of Primary Road:',
			numSecondaryLoading: '# of Secondary Road:',
			numTertiaryLoading: '# of Tertiary Road:',
			numResidentialLoading: '# of Residential Road:',
			numWaterLoading: '# of Water Loading:',
			numLanduseLoading: '# of Landuse Loading:',
			numPlaceLoading: '# of Place Loading:',
			numNewTravelTime: '# of New Travel Time:'
		};

		this.resetTime();
		this.resetTempTime();
	}

	_createClass(TgMap, [{
		key: 'debug',
		value: function debug() {
			//console.log(this.tgWater.waterLayer.getZIndex())
			//console.log(this.tgRoads.roadLayer.getZIndex())
			//console.log(this.tgControl.gridLayer.getZIndex())

			//console.log(this.tgRoads.dispRoads);
			//console.log(this.tgWater.dispWater);

			//tg.util.saveTextAsFile(this.tgRoads.dispRoads, 'dispRoads.json');
			//tg.util.saveTextAsFile(this.tgRoads.dispWater, 'dispWater.json');

			//console.log(this.olMap.getLayers().clear());
			//this.tgRoads.clearLayers();

			//this.tgWater.isPointInWater();
			//this.tgWater.arePointsInWater();

			/*console.log('# of road node: ');
   console.log(this.tgRoads.calNumberOfNode());
   console.log('# of water node: ');
   console.log(this.tgWater.calNumberOfNode());
   console.log('# of landuse node: ');
   console.log(this.tgLanduse.calNumberOfNode());
   */

			//this.tgBB.repositionElements();
			//console.log(this.calMaxDistance('lat'));
			//console.log(this.calMaxDistance('lng'));
		}
	}, {
		key: 'setArea',
		value: function setArea(area) {
			this.setCenter(this.data.center[area].lat, this.data.center[area].lng);
		}
	}, {
		key: 'setOrigin',
		value: function setOrigin(param) {
			var _this2 = this;

			if (param.lat && param.lng) {
				this.setCenter(param.lat, param.lng);
			} else if (param.address) {
				var s = new Date().getTime();

				this.tgOrigin.searchLatLngByAddress(param.address).then(function (data) {
					var elapsed = new Date().getTime() - s;
					console.log('received: lat & lng (' + elapsed + ' ms)');
					_this2.setCenter(data.lat, data.lng);
				}).catch(function (error) {
					console.error(error);
					if (!_this2.tgOrigin.getOrigin()) setDefaultOrigin();
				});
			} else {
				console.error('invalid param in setOrigin()');
				if (!this.tgOrigin.getOrigin()) setDefaultOrigin();
			}

			function setDefaultOrigin() {
				console.log('use default lat & lng.');
				this.setCenter(this.data.origin.default.lat, this.data.origin.default.lng);
			}
		}
	}, {
		key: 'setOriginByCurrentLocation',
		value: function setOriginByCurrentLocation() {
			var _this3 = this;

			this.tgOrigin.getCurrentLocation().then(function (data) {
				console.log('got lat & lng from geolocation.');
				_this3.setCenter(data.lat, data.lng);
			}).catch(function (error) {
				console.error(error);
				if (!_this3.tgOrigin.getOrigin()) setDefaultOrigin();
			});
		}
	}, {
		key: 'setCenter',
		value: function setCenter(lat, lng) {
			this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
			this.tgOrigin.setOrigin(lat, lng);
			this.tgControl.setOrigin(lat, lng);
			this.tgOrigin.render();
			this.calBoundaryBox();
			this.requestControlPoints();

			this.tgPlaces.needToBeRedrawn();
			this.tgLocs.request();
		}

		//
		// When finising the mouse move or zoom in/out
		//

	}, {
		key: 'onMoveEnd',
		value: function onMoveEnd(e) {
			if (this.data.zoom.current != this.olMap.getView().getZoom()) {
				this.data.zoom.current = this.olMap.getView().getZoom();
				this.onZoomEnd();
			} else {
				this.onPanEnd();
			}
		}
	}, {
		key: 'onZoomEnd',
		value: function onZoomEnd() {
			console.log('onZoomEnd');

			this.tgWater.tempCount = 0;

			this.tgRoads.updateDisplayedRoadType(this.data.zoom.current);
			this.calBoundaryBox();
			this.tgPlaces.needToBeRedrawn();
			this.tgLocs.request();

			this.tgLocs.initLocations();
			this.recalculateAndDraw();
		}
	}, {
		key: 'onPanEnd',
		value: function onPanEnd() {
			console.log('onPanEnd.');
			this.calBoundaryBox();

			this.resetTime();
			this.resetDataInfo();

			this.tgRoads.calDispRoads();
			this.tgWater.calDispWater();
			this.tgLanduse.calDispLanduse();

			this.tgRoads.render();
			this.tgWater.render();
			this.tgLanduse.render();
			//this.recalculateAndDraw();

		}

		//
		// Recalculate information changed according to the interaction and draw it
		//

	}, {
		key: 'recalculateAndDraw',
		value: function recalculateAndDraw() {

			if (!this.tgOrigin.getOrigin()) return;

			console.log('recalculateAndDraw');

			//this.tpsReady = false;
			this.resetTime();
			this.resetDataInfo();

			this.tgRoads.calDispRoads();
			this.tgWater.calDispWater();
			this.tgLanduse.calDispLanduse();
			//this.tgPlaces.calDispPlace();


			if (this.currentMode === 'DC') {
				this.calAllDispNodeAsOriginal();
				//this.tgRoads.discard();
				//this.tgWater.discard();
				//this.tgLanduse.discard();

				this.tgLocs.discard();
				this.tgOrigin.discard();
				this.tgIsochrone.discard();
			} else {
				this.tgRoads.render();
				this.tgWater.render();
				this.tgLanduse.render();
				//this.tgPlaces.render();
			}

			this.requestControlPoints();
		}
	}, {
		key: 'requestControlPoints',
		value: function requestControlPoints() {
			var _this4 = this;

			this.readyControlPoints = false;
			this.disableSGapAndGapButtons(true);

			this.tgControl.calculateControlPoints(function () {

				console.log('received: control points.');

				_this4.timerCheckGridSplitInTgMap = setTimeout(_this4.calSplittedGrid.bind(_this4), _this4.data.time.waitForFinishGettingWaterData);

				if (_this4.currentMode === 'DC') {
					//if (this.tgLocs.readyLocs) this.goToDcAgain();
					//this.goToDcAgain();
				} else if (_this4.currentMode === 'EM') {
					//this.tgControl.calDispNodes('original');
				}

				_this4.updateLayers();
				_this4.dispMapInfo();
			});
		}
	}, {
		key: 'changeTransportType',
		value: function changeTransportType(type) {
			var _this5 = this;

			if (this.tgControl.currentTransport === type) return;

			this.disableSGapAndGapButtons(true);

			this.tgControl.currentTransport = type;
			this.tgControl.getTravelTimeOfControlPoints(function () {

				_this5.disableSGapAndGapButtons(false);

				if (_this5.currentMode === 'DC') {
					_this5.goToDcAgain(false);
					//this.goToDcAgain(true);
				} else {
					_this5.tgOrigin.render();
				}

				/*
    if (this.currentMode === 'EM') {
     	this.tgControl.calDispNodes('original');
     }
      this.updateLayers();
    this.dispMapInfo();
    */
			});
		}
	}, {
		key: 'goToDcAgain',
		value: function goToDcAgain() {
			var noNeedToCalFactor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this.frame = 0;
			this.moveElementsByValue('intermediateReal', 0.0, false);
			this.currentMode = 'EM';
			/*
   this.tgBB.cleanBB();
   this.tgBB.addBBOfLocations();
   this.tgLocs.dispNameLayer = true;
   this.tgLocs.updateNonOverlappedLocationNames();
   this.tgLocs.render();
   this.tgBB.render();
   */
			this.goToDc(false, noNeedToCalFactor);

			if (this.tgLocs.needToDisplayLocs) {
				this.tgLocs.displayLocsInDc();
				this.tgLocs.needToDisplayLocs = false;
			}
		}
	}, {
		key: 'calSplittedGrid',
		value: function calSplittedGrid() {
			this.tgControl.currentSplitLevel = 0;
			this.tgWater.checkPointsInWater(this.tgControl.controlPoints);
			this.tgControl.checkGridSplit();
		}
	}, {
		key: 'dispMapInfo',
		value: function dispMapInfo() {

			// map level and center position
			var centerLat = (this.data.box.top + this.data.box.bottom) / 2;
			var centerLng = (this.data.box.left + this.data.box.right) / 2;
			var str = 'Map Level (' + this.data.zoom.current + '), Center (' + centerLat.toPrecision(8) + ', ' + centerLng.toPrecision(9) + ')';
			$("#mapInfo1").text(str);

			/*
   // Display the total number of nodes & roads
   var orgN = this.tg.data.nodes.length
   var orgR = this.tg.data.roads.length
   var str = 'Total Nodes (' + orgN + '), Roads (' + orgR + ')'
   $('#mapInfo2').text(str)
   // Display the displayed number of nodes & roads
   var localN = this.tg.data.localNodes.length
   var localR = this.tg.data.localRoads.length
   var str = 'Displayed Nodes (' + localN + '), Roads (' + localR + ')'
   $('#mapInfo3').text(str)
   */
		}
	}, {
		key: 'setZoom',
		value: function setZoom(zoom) {
			this.olMap.getView().setZoom(zoom);
		}
	}, {
		key: 'zoomIn',
		value: function zoomIn() {
			this.setZoom(this.data.zoom.current + 1);
		}
	}, {
		key: 'zoomOut',
		value: function zoomOut() {
			this.setZoom(this.data.zoom.current - 1);
		}
	}, {
		key: 'calBoundaryBox',
		value: function calBoundaryBox() {
			var box = this.data.box;
			var vars = this.data.var;
			var extent = this.olMap.getView().calculateExtent(this.olMap.getSize());
			var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
			var topRight = ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

			box.left = bottomLeft[0];
			box.bottom = bottomLeft[1];
			box.right = topRight[0];
			box.top = topRight[1];

			vars.latPerPx = (box.top - box.bottom) / this.olMapHeightPX;
			vars.lngPerPx = (box.right - box.left) / this.olMapWidthPX;
			vars.latMargin = (box.top - box.bottom) * (vars.marginPercent * 0.01);
			vars.lngMargin = (box.right - box.left) * (vars.marginPercent * 0.01);
		}

		//
		// Redraw all layers of displayed elements
		//		

	}, {
		key: 'updateLayers',
		value: function updateLayers() {
			var s = new Date().getTime();

			/*if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
   	if (this.currentMode === 'EM') this.tgControl.calDispNodes('original');
   	else if (this.currentMode === 'DC') {
   		if (this.warpingMode === 'none') this.tgControl.calDispNodes('target');
   		else this.tgControl.calDispNodes('real');
   	}
   }*/

			/*if (this.dispPlaceLayer) {
   	this.tgPlaces.calDispPlace();
   	this.tgPlaces.addPlaceLayer();
   }
   else this.tgPlaces.clearLayers();
   */

			//if (this.dispWaterNodeLayer) this.tgWater.addWaterNodeLayer();
			//else this.tgWater.removeWaterNodeLayer();

			//if (this.dispRoadNodeLayer) this.tgRoads.addNodeLayer();
			//else this.tgRoads.removeNodeLayer();

			//if (this.dispLanduseNodeLayer) this.tgLanduse.addLanduseNodeLayer();
			//else this.tgLanduse.removeLanduseNodeLayer();

			/*if (this.dispGridLayer) this.tgControl.drawGridLayer()
   else this.tgControl.removeGridLayer()
   if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer()
   else this.tgControl.removeControlPointLayer()*/

			//if (this.dispCenterPositionLayer) this.tgAux.drawCenterPositionLayer()
			//else this.tgAux.removeCenterPositionLayer();

			//if (this.dispLocationLayer) this.tgLocs.drawLocationLayer()
			//else this.tgLocs.removeLocationLayer();

			//if (this.dispLocationNameLayer) this.tgLocs.drawLocationNameLayer()
			//else this.tgLocs.removeLocationNameLayer();

			//if (this.dispIsochroneLayer) this.tgAux.drawIsochroneLayer();
			//else this.tgAux.removeIsochroneLayer();

			//this.tgOrigin.render();
			this.tgBB.render();

			console.log('updateLayers : ' + (new Date().getTime() - s) + 'ms');
		}
	}, {
		key: 'goToEm',
		value: function goToEm() {
			var animation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			if (this.currentMode === 'EM') return;

			if (animation) {
				this.timerFrame = setInterval(this.goToEmByFrame.bind(this), this.animationSpeed);
			} else {
				this.frame = 0;
				this.moveElementsByValue('intermediateReal', 0.0);
				this.reachEm();
			}
		}
	}, {
		key: 'goToDc',
		value: function goToDc() {
			var animation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
			var noNeedToCalFactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


			// move the center		
			this.olView.setCenter(ol.proj.fromLonLat([this.tgOrigin.origin.original.lng, this.tgOrigin.origin.original.lat]));

			//if (this.currentMode === 'DC') return;

			//if ((this.needToCalWarping)||(!this.tpsReady)) {
			// cal warping
			this.tg.graph.calWarping(noNeedToCalFactor);

			switch (this.warpingMode) {
				case 'shapePreserving':
					this.tgControl.makeShapePreservingGridByFFT();
					break;
				case 'noIntersection':
					this.tgControl.makeNonIntersectedGrid();
					break;
				case 'noWarping':
					this.tgControl.makeNoWarpedGrid();
					break;
				case 'originalDC':
					this.tgControl.makeOriginalDCGrid();
					break;
			}

			// tps calculation
			this.tg.graph.TPSSolve();

			if (this.tg.graph.TPSTest()) {
				console.log('complete: TPS(' + parseInt(this.tg.graph.factor) + ')');
				this.tpsReady = true;

				// TODO: if locations are not ready...
			} else {
				//console.log('fail: TPS...');
				alert('fail: TPS...');
			}
			//this.needToCalWarping = false;

			this.tgLocs.calTargetNodes();

			if (this.warpingMode === 'none') {
				this.tgWater.calTargetNodes();
				this.tgRoads.calTargetNodes();
				this.tgPlaces.calTargetNodes();
				this.tgLanduse.calTargetNodes();
				this.tgOrigin.calTargetNodes();
			} else {
				this.tgWater.calRealNodes();
				this.tgRoads.calRealNodes();
				this.tgPlaces.calRealNodes();
				this.tgLanduse.calRealNodes();
				this.tgLocs.calRealNodes();
				this.tgOrigin.calRealNodes();
			}

			if (animation) {
				this.timerFrame = setInterval(this.goToDcByFrame.bind(this), this.animationSpeed);
			} else {
				this.frame = 10;
				this.moveElementsByValue('intermediateReal', 1.0);
				this.reachDc();
			}
		}

		/*
   * move elements by value 0 - 1
   * intermediate: 'intermediateReal' or 'intermediateTarget'
   * value: 0.0 - 1.0
   * render: t/f
   */

	}, {
		key: 'moveElementsByValue',
		value: function moveElementsByValue(intermediate, value) {
			var render = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

			this.tgWater.calDispNodes(intermediate, value);
			this.tgRoads.calDispNodes(intermediate, value);
			this.tgLanduse.calDispNodes(intermediate, value);
			this.tgOrigin.calDispNodes(intermediate, value);
			this.tgLocs.calDispNodes(intermediate, value);
			this.tgPlaces.calDispNodes(intermediate, value);
			this.tgGrids.calDispNodes(intermediate, value);

			if (render) {
				this.tgWater.render();
				this.tgRoads.render();
				this.tgLanduse.render();
				this.tgOrigin.render();
				this.tgLocs.render();
				this.tgPlaces.render();
				this.tgGrids.render();
			}

			/*if (this.dispPlaceLayer) {
   	this.tgPlaces.clearLayers();
    	this.tgPlaces.calDispNodes(intermediate, value);
    	this.tgPlaces.updateDispPlaces(true);
    	this.tgPlaces.addPlaceLayer();
    }*/

			/*if ((this.dispGridLayer)||(this.dispControlPointLayer)) {
   	this.tgControl.calDispNodes(intermediate, value);
   		if (this.dispGridLayer) this.tgControl.drawGridLayer();
   	if (this.dispControlPointLayer) this.tgControl.drawControlPointLayer();
   }*/
		}
	}, {
		key: 'goToDcByFrame',
		value: function goToDcByFrame() {
			this.frame += 1;
			var value = this.frame * 0.1;
			this.moveElementsByValue('intermediateReal', value);

			if (this.frame < 10) {
				// intermediate mode
				this.betweenDcAndEm();
			} else {
				// completely go to dc mode
				this.reachDc();
			}
		}
	}, {
		key: 'goToEmByFrame',
		value: function goToEmByFrame() {
			this.frame -= 1;
			var value = this.frame * 0.1;
			this.moveElementsByValue('intermediateReal', value);

			if (this.frame > 1) {
				// intermediate mode
				this.betweenDcAndEm();
			} else {
				// completely go to em mode
				this.reachEm();
			}
		}
	}, {
		key: 'betweenDcAndEm',
		value: function betweenDcAndEm() {
			this.currentMode = 'INTERMEDIATE';
			this.tgIsochrone.disabled(true);
			this.tgIsochrone.render();
			this.tgLocs.dispNameLayer = false;
			this.tgLocs.removeNameLayer();
			this.tgLocs.render();
		}
	}, {
		key: 'reachDc',
		value: function reachDc() {
			console.log('@reach DC');
			this.currentMode = 'DC';
			this.tgIsochrone.disabled(false);
			this.tgIsochrone.render();
			this.reachDcOrEm();
			this.resetUI();
		}
	}, {
		key: 'reachEm',
		value: function reachEm() {
			this.currentMode = 'EM';
			this.reachDcOrEm();
			this.resetUI();
		}
	}, {
		key: 'reachDcOrEm',
		value: function reachDcOrEm() {
			clearInterval(this.timerFrame);
			this.tgOrigin.render();
			this.tgBB.cleanBB();
			this.tgBB.addBBOfLocations();
			this.tgLocs.dispNameLayer = true;
			//this.tgLocs.updateNonOverlappedLocationNames();
			this.tgLocs.render();
			this.tgBB.render();
		}
	}, {
		key: 'resetUI',
		value: function resetUI() {
			var tf = this.currentMode === 'EM';
			this.olMap.dragPan.setActive(tf);
			$('#dispIsochroneCB').prop('disabled', tf);
			//this.disableSGapAndGapButtons(tf);
		}
	}, {
		key: 'disableSGapAndGapButtons',
		value: function disableSGapAndGapButtons(tf) {
			$('#dcGapModeRB').prop('disabled', tf);
			$('#dcSGapModeRB').prop('disabled', tf);
		}

		/*moveElementsByFrame(direction) {
  	if (direction === 'forward') this.frame += 1;
  	else if (direction === 'backward') this.frame -= 1;
  		const value = this.frame * 0.1;
  		// let intermediate;
  	// if (this.warpingMode === 'none') intermediate = 'intermediateTarget';
  	// else intermediate = 'intermediateReal';
  		this.moveElementsByValue('intermediateReal', value);
  	
  	if ((direction === 'forward') && (this.frame >= 10)) {
  		// completely go to dc mode
  		this.currentMode = 'DC';
  		this.tgIsochrone.disabled(false);
  		this.tgIsochrone.render();
  		this.reachDCOrEM();
  		this.resetUI();
  	}
  	else if ((direction === 'backward') && (this.frame <= 0)) {
  		// completely go to em mode
  		this.currentMode = 'EM';
  		this.reachDCOrEM();
  		this.resetUI();
  	}
  	else {
  		
  	}
  }*/

	}, {
		key: 'initMap',
		value: function initMap() {
			this.tgBB.cleanBB();
			this.tgLocs.initLocations();
			this.tgLocs.removeLayer();
			this.tgLocs.removeNameLayer();
			this.tgLocs.render();

			console.log('init locs.');

			if (this.currentMode === 'DC') {
				this.currentMode = 'EM';
				this.resetUI();
				this.tgIsochrone.disabled(true);
				this.tgIsochrone.render();
				this.calAllDispNodeAsOriginal();
				this.frame = 0;

				$('#emModeRB').prop('checked', true);
				$('#dcSGapModeRB').prop('checked', false);
				$('#dcGapModeRB').prop('checked', false);
			}
		}
	}, {
		key: 'calAllDispNodeAsOriginal',
		value: function calAllDispNodeAsOriginal() {
			this.tgWater.calDispNodes('original');
			this.tgRoads.calDispNodes('original');
			this.tgLanduse.calDispNodes('original');
			this.tgPlaces.calDispNodes('original');
			this.tgOrigin.calDispNodes('original');
			this.tgControl.calDispNodes('original');
		}
	}, {
		key: 'resetTime',
		value: function resetTime() {
			var currentTime = new Date().getTime();
			this.times = { roadLoading: { start: currentTime, end: currentTime },
				waterLoading: { start: currentTime, end: currentTime },
				landuseLoading: { start: currentTime, end: currentTime },
				placeLoading: { start: currentTime, end: currentTime },
				travelTimeLoading: { start: 0, end: 0 },
				locationLoading: { start: 0, end: 0 },
				controlPointWarping: { start: 0, end: 0 },
				tpsCalculating: { start: 0, end: 0 },
				elementsWarping: { start: 0, end: 0 },
				waterWarping: { start: 0, end: 0 },
				roadWarping: { start: 0, end: 0 },
				placeWarping: { start: 0, end: 0 },
				landuseWarping: { start: 0, end: 0 },
				etcWarping: { start: 0, end: 0 }
			};

			for (var time in this.times) {
				$('#' + time + 'Time').html(this.displayString[time + 'Time'] + ' - ms');
			}
		}
	}, {
		key: 'resetTempTime',
		value: function resetTempTime() {
			this.tempTimes = { totalWarping: [], waterWarping: [], roadWarping: [], placeWarping: [],
				landuseWarping: [], etcWarping: [] };
		}
	}, {
		key: 'resetDataInfo',
		value: function resetDataInfo() {
			this.dataInfo = { numRoadLoading: 0, numHighwayLoading: 0, numPrimaryLoading: 0,
				numSecondaryLoading: 0, numTertiaryLoading: 0, numResidentialLoading: 0,
				numWaterLoading: 0, numLanduseLoading: 0,
				numPlaceLoading: 0, numNewTravelTime: 0
			};

			for (var info in this.dataInfo) {
				$('#' + info).html(this.displayString[info] + ' -');
			}
		}
	}, {
		key: 'setTime',
		value: function setTime(type, se, time) {
			this.times[type][se] = time;

			if (se === 'end') {
				var str = this.displayString[type + 'Time'];
				str += ' ' + (this.times[type].end - this.times[type].start) + ' ms';
				$('#' + type + 'Time').html(str);
			} else if (se === 'set') {
				var _str = this.displayString[type + 'Time'] + ' ' + time + ' ms';
				$('#' + type + 'Time').html(_str);
			}
		}
	}, {
		key: 'setDataInfo',
		value: function setDataInfo(type, action, value) {
			switch (action) {
				case 'increase':
					this.dataInfo[type]++;
					break;
				case 'set':
					this.dataInfo[type] = value;
					break;
			}

			var str = this.displayString[type] + ' ' + this.dataInfo[type];
			$('#' + type).html(str);
		}
	}, {
		key: 'calTimeFromLatLng',
		value: function calTimeFromLatLng(lat, lng) {
			if (!this.tg.graph.factor) return 0;

			var centerLat = this.tgOrigin.origin.original.lat;
			var centerLng = this.tgOrigin.origin.original.lng; // / this.tg.graph.toLat();
			var inLat = lat;
			var inLng = lng; // / this.tg.graph.toLat();
			//return tgUtil.D2(centerLat, centerLng, lat, lng) * this.tg.graph.factor;
			return tgUtil.D2(centerLat, centerLng, inLat, inLng) * this.tg.graph.factor;
		}
	}, {
		key: 'calDistanceFromLatLng',
		value: function calDistanceFromLatLng(lat, lng) {
			var centerLat = this.tgOrigin.origin.original.lat;
			var centerLng = this.tgOrigin.origin.original.lng;
			return tgUtil.distance(centerLat, centerLng, lat, lng); // km
		}
	}, {
		key: 'calMaxDistance',
		value: function calMaxDistance() {
			var latOrLng = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'lat';

			var centerLat = this.tgOrigin.origin.original.lat;
			var centerLng = this.tgOrigin.origin.original.lng;

			if (latOrLng === 'lat') {
				var halfHeightLat = (this.data.box.top - this.data.box.bottom) / 2;
				return this.calDistanceFromLatLng(centerLat + halfHeightLat, centerLng);
			} else if (latOrLng === 'lng') {
				var halfWidthLng = (this.data.box.right - this.data.box.left) / 2;
				return this.calDistanceFromLatLng(centerLat, centerLng + halfWidthLng);
			}
		}
	}]);

	return TgMap;
}();

module.exports = TgMap;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TgNode = __webpack_require__(1);

var TgMapGrid = function () {
	function TgMapGrid(map, data, graph) {
		_classCallCheck(this, TgMapGrid);

		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.displayControlPoints = true;
		this.controlPointLayer = null;
	}

	_createClass(TgMapGrid, [{
		key: 'turn',
		value: function turn(tf) {
			this.display = tf;
		}
	}, {
		key: 'disabled',
		value: function disabled(tf) {
			this.isDisabled = tf;
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.isDisabled || !this.display) {
				this.discard();
			} else {
				this.updateLayer();
				if (this.displayControlPoints) this.updateControlPointLayer();
			}
		}
	}, {
		key: 'discard',
		value: function discard() {
			this.removeLayer();
			this.removeControlPointLayer();
		}
	}, {
		key: 'updateLayer',
		value: function updateLayer() {
			var gridLines = this.map.tgControl.gridLines;
			var viz = this.data.viz;
			var arr = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = gridLines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var line = _step.value;

					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString([[line.start.disp.lng, line.start.disp.lat], [line.end.disp.lng, line.end.disp.lat]]), this.mapUtil.lineStyle(viz.color.grid, viz.width.grid));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			this.removeLayer();
			this.layer = this.mapUtil.olVectorFromFeatures(arr);
			this.layer.setZIndex(viz.z.grid);
			this.mapUtil.addLayer(this.layer);
		}
	}, {
		key: 'updateControlPointLayer',
		value: function updateControlPointLayer() {
			var controlPoints = this.map.tgControl.controlPoints;
			var viz = this.data.viz;
			var arr = [];

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = controlPoints[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var point = _step2.value;

					// draw control points
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([point.disp.lng, point.disp.lat]), this.mapUtil.nodeStyle(viz.color.controlPoint, viz.radius.controlPoint));

					// draw additional lines meaning difference between target and real.
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString([[point.disp.lng, point.disp.lat], [point.target.lng, point.target.lat]]), this.mapUtil.lineStyle(viz.color.controlPointLine, viz.width.controlPointLine));

					// add text
					var text = point.travelTime != null ? point.travelTime.toString() : '-';
					//text += ',' + point.index;
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([point.disp.lng, point.disp.lat]), this.mapUtil.textStyle({
						text: text, color: viz.color.text, font: viz.font.text
					}));
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			this.removeControlPointLayer();
			this.controlPointLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.controlPointLayer.setZIndex(viz.z.controlPoint);
			this.mapUtil.addLayer(this.controlPointLayer);
		}
	}, {
		key: 'removeLayer',
		value: function removeLayer() {
			this.mapUtil.removeLayer(this.layer);
		}
	}, {
		key: 'removeControlPointLayer',
		value: function removeControlPointLayer() {
			this.mapUtil.removeLayer(this.controlPointLayer);
		}
	}, {
		key: 'calDispNodes',
		value: function calDispNodes(kind, value) {
			var controlPoints = this.map.tgControl.controlPoints;

			if (kind === 'intermediateReal') {
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = controlPoints[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var point = _step3.value;

						point.disp.lat = (1 - value) * point.original.lat + value * point.real.lat;
						point.disp.lng = (1 - value) * point.original.lng + value * point.real.lng;
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			} else if (kind === 'intermediateTarget') {
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = controlPoints[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var _point = _step4.value;

						_point.disp.lat = (1 - value) * _point.original.lat + value * _point.target.lat;
						_point.disp.lng = (1 - value) * _point.original.lng + value * _point.target.lng;
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			} else {
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = this.controlPoints[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var _point2 = _step5.value;

						_point2.disp.lat = _point2[type].lat;
						_point2.disp.lng = _point2[type].lng;
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}
			}
		}
	}]);

	return TgMapGrid;
}();

module.exports = TgMapGrid;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TgMapInteraction = function (_ol$interaction$Point) {
  _inherits(TgMapInteraction, _ol$interaction$Point);

  function TgMapInteraction(map) {
    _classCallCheck(this, TgMapInteraction);

    var _this = _possibleConstructorReturn(this, (TgMapInteraction.__proto__ || Object.getPrototypeOf(TgMapInteraction)).call(this));

    _this.map = map;
    _this.data = map.data;
    _this.coordinate_ = null;
    _this.cursor_ = 'pointer';
    _this.feature_ = null;
    _this.previousCursor_ = undefined;
    _this.dragging = false;
    _this.draggedObject = null;

    ol.interaction.Pointer.call(_this, {
      handleDownEvent: _this.handleDownEvent,
      handleDragEvent: _this.handleDragEvent,
      handleMoveEvent: _this.handleMoveEvent,
      handleUpEvent: _this.handleUpEvent
    });
    return _this;
  }

  _createClass(TgMapInteraction, [{
    key: 'handleDownEvent',
    value: function handleDownEvent(evt) {
      var feature = evt.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });

      if (feature) {

        switch (feature.type) {
          case 'origin':
            this.dragging = true;
            this.draggedObject = feature.type;
            this.coordinate_ = evt.coordinate;
            this.feature_ = feature;
            break;
          case 'loc':
            console.log(feature.source);
            this.map.tgLocs.showModal(feature.source);
            break;
          case 'cLoc':
            console.log(feature.source);
            break;
        }

        //console.log('handleDown');
        //console.log(feature.type);
        //console.log(feature);
      }

      return !!feature;
    }
  }, {
    key: 'handleDragEvent',
    value: function handleDragEvent(evt) {
      if (this.dragging) {
        var deltaX = evt.coordinate[0] - this.coordinate_[0];
        var deltaY = evt.coordinate[1] - this.coordinate_[1];
        var geometry = this.feature_.getGeometry();
        geometry.translate(deltaX, deltaY);

        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];

        //console.log('handleDrag');
      }
    }
  }, {
    key: 'handleMoveEvent',
    value: function handleMoveEvent(evt) {
      if (this.cursor_) {
        var feature = evt.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          return feature;
        });
        var element = evt.map.getTargetElement();

        if (feature) {
          if (feature.type === 'origin') {
            if (element.style.cursor != this.cursor_) {
              this.previousCursor_ = element.style.cursor;
              element.style.cursor = this.cursor_;
            }
          } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
          }
        }
        //console.log('handleMove');
      }
    }
  }, {
    key: 'handleUpEvent',
    value: function handleUpEvent(evt) {
      this.coordinate_ = null;
      this.feature_ = null;

      if (this.dragging) {
        this.dragging = false;
        var pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 'EPSG:3857', 'EPSG:4326');

        switch (this.draggedObject) {
          case 'origin':
            this.map.setCenter(pt[1], pt[0]);
            break;
        }
      }

      return false;
    }
  }]);

  return TgMapInteraction;
}(ol.interaction.Pointer);

module.exports = TgMapInteraction;

/***/ })
/******/ ]);