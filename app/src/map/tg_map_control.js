/**
 * Class for control points.
 */
//const TgUtil = require('../tg_util');
//const TgTravelTimeApi = require('../api/tg_travel_time_api');
//const TgControlPoint = require('../node/tg_control_point');


class TgMapControl {
	constructor(map, data, graph) {
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

		this.transportTypes = ['driving', 'cycling', 'walking', 'traffic'];
		this.currentTransport = 'driving';

		/** 
		 * api object for getting travel time.
		 * @private @type {!TravelTimeApi>} 
		 */
		this.travelTimeApi = new TgTravelTimeApi(this.data);

		/** 
		 * Map object to cache travel time.
		 * @private @type {!Map>} 
		 */
		this.travelTimeCache = {};
		for(let type of this.transportTypes) {
			this.travelTimeCache[type] = new Map();
		}

		/** 
		 * Current Split Level.
		 * @public @type {!Number>} 
		 */
		this.currentSplitLevel = 0;

		

	}

	calUniformControlPoints() {
		const box = this.data.box;
		const eps = 0.000001;
		const marginRate = 0.1; // 10%
		const center = {
				lat: this.map.tgOrigin.origin.original.lat, 
			  lng: this.map.tgOrigin.origin.original.lng}
		const half = {
				lat: box.top - center.lat, 
				lng: box.right - center.lng};
		const apprHalf = {
				lat: half.lat - (half.lat * marginRate), 
				lng: half.lng - (half.lng * marginRate)};
		const step = {
				lat: apprHalf.lat / 3, 
				//lat: apprHalf.lat / 2, 
				lng: apprHalf.lng / 3};
				//lng: apprHalf.lng / 2};
		const start = {
				lat: center.lat - apprHalf.lat, 
				lng: center.lng - apprHalf.lng};
		const end = {
				lat: center.lat + apprHalf.lat, 
				lng: center.lng + apprHalf.lng};

		this.controlPoints = [];
		this.numLatInColumn = 0;
		let indexOfControlPoint = 0;

		for(let lat = end.lat; lat > start.lat - eps; lat -= step.lat) {
			this.numLngInRow = 0;

			for(let lng = start.lng; lng < end.lng + eps; lng += step.lng) {

				const point = new TgControlPoint(lat, lng);
				point.index = indexOfControlPoint++;
				this.controlPoints.push(point);
				this.numLngInRow++;
			}
			this.numLatInColumn++;
		}
	}

	calGridLines() {
		// make an array for grid lines
		this.gridLines = [];

		for(let indexLat = 0; indexLat < this.numLatInColumn - 1; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow; indexLng++) {
				this.gridLines.push({
					start: this.getControlPoint2D_(indexLat, indexLng),
					end: this.getControlPoint2D_(indexLat + 1, indexLng),
				})
			}
		}

		for(let indexLat = 0; indexLat < this.numLatInColumn; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow - 1; indexLng++) {
				this.gridLines.push({
					start: this.getControlPoint2D_(indexLat, indexLng),
					end: this.getControlPoint2D_(indexLat, indexLng + 1),
				})
			}
		}

		// console.log('# of gridLines: ' + this.gridLines.length);
		// console.log(this.gridLines);
	}

	calConnectedNodes() {
		// find connected nodes per each control point.
		for(let indexLat = 0; indexLat < this.numLatInColumn; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow; indexLng++) {
				let candidate = this.getControlPoint2D_(indexLat, indexLng + 1);
				if (candidate) 
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate); 

				candidate = this.getControlPoint2D_(indexLat + 1, indexLng);
				if (candidate)
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);

				candidate = this.getControlPoint2D_(indexLat, indexLng - 1);
				if (candidate)
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);
				
				candidate = this.getControlPoint2D_(indexLat - 1, indexLng);
				if (candidate)
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);
			}
		}
	}

	calGrids() {
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
		for(let indexLat = 0; indexLat < this.numLatInColumn - 1; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow - 1; indexLng++) {
				const pointIndexes = 
						[this.numLngInRow * indexLat + indexLng, 
						this.numLngInRow * indexLat + (indexLng + 1), 
						this.numLngInRow * (indexLat + 1) + (indexLng + 1), 
						this.numLngInRow * (indexLat + 1) + indexLng];

				this.makeGridObjectByPointIndexes(pointIndexes);
			}
		}
		//console.log(this.grids);
	}

	calNeighborLines() {
		const addPointIndexes = function(pt, a, b) {
			if (a > b) {
				let t = b; b = a; a = t;
			}

			let found = false;
			for(let line of pt.neighborLines) {
				if ((line[0] == a)&&(line[1] == b)) {found = true; break;}
			}
			if (!found) pt.neighborLines.push([a, b]);
		}

		for(let pt of this.controlPoints) {
			pt.neighborLines = [];

			for(let grid of pt.connectedGrids) {
				for(let idx = 0; idx < grid.pointIndexes.length - 1; ++idx) {
					addPointIndexes(pt, 
							grid.pointIndexes[idx], 
							grid.pointIndexes[idx + 1]);
				}
				addPointIndexes(pt, 
						grid.pointIndexes[grid.pointIndexes.length - 1], 
						grid.pointIndexes[0]);
			}
		}

		// for corner points
		for(let idx = 0; idx < this.controlPoints.length; ++idx) {
			if (this.controlPoints[idx].connectedGrids.length === 1) {
				for(let neighborIdx of this.controlPoints[idx].connectedGrids[0].pointIndexes) {
					if (idx === neighborIdx) continue;

					//console.log(neighborIdx);
					//console.log(this.controlPoints[neighborIdx]);

					for(let line of this.controlPoints[neighborIdx].neighborLines)
						addPointIndexes(this.controlPoints[idx], line[0], line[1]);
				}
			}
		}
	}

	getTravelTimeOfControlPoints() {
		return new Promise((resolve, reject) => {

			// check locations that need a travel time by looking into cache.
			let newPointsArray = [];

			let ptIdxs = [];

			for(let ptIdx = 0; ptIdx < this.controlPoints.length; ++ptIdx) {
				const pt = this.controlPoints[ptIdx];
				const key = pt.original.lat.toFixed(3) + ' ' + pt.original.lng.toFixed(3);
				
				// pass the origin point
				if (ptIdx === parseInt(this.controlPoints.length / 2)) continue;

				// if a point is not in the cache, add it to travelTimeApi.
				if (!this.travelTimeCache[this.currentTransport].has(key)) {
					this.travelTimeApi.addLocation(pt.original.lat, pt.original.lng);
					newPointsArray.push(pt);
				}
				// if a point is in the cache, assign cached travel time to it.
				else {
					pt.travelTime = this.travelTimeCache[this.currentTransport].get(key);
					pt.travelTimeOrg = pt.travelTime;
				}
			}

			console.log('numNewPoints: ' + newPointsArray.length);

			// if there is points of which we need travel time,
			if (newPointsArray.length > 0) {

				this.travelTimeApi.getTravelTime(this.currentTransport)
				.then((ret) => {

					//console.log('ret:', ret);
					for(let idx = 0; idx < newPointsArray.length; ++idx) {
						const pt = newPointsArray[idx];
						const key = pt.original.lat.toFixed(3) + ' ' + pt.original.lng.toFixed(3);
						pt.travelTime = ret[idx + 1]; // ret[0] is travel time of origin (= 0)
						pt.travelTimeOrg = pt.travelTime;
						this.travelTimeCache[this.currentTransport].set(key, pt.travelTime);
					}
					resolve();
				})
				.catch(reject);
			}
			// if we don't need to request traveltime,
			else {
				resolve();
			}
		});
	}

	/**
	 * Calculate the control points.
	 */
	calculateControlPoints() {
		return new Promise((resolve, reject) => {

			this.calUniformControlPoints();
			this.calGridLines();
			this.calConnectedNodes();
			this.calGrids();
			this.calNeighborLines();
			this.getTravelTimeOfControlPoints()
			.then(resolve).catch(reject);
		});
	}

	setRandomTravelTime() {
		const k = 100; // travel time per distance
		const cLat = this.map.tgOrigin.origin.original.lat;
		const cLng = this.map.tgOrigin.origin.original.lng;

		const rand = (this.data.randomTime) ? this.data.randomTime : 0; // 0 - 100

		for(let point of this.controlPoints) {
			point.travelTime = 
					k * this.map.calDistanceFromLatLng(point.original.lat, point.original.lng);
			point.travelTime += rand * 10 * Math.random();
		}

		this.controlPoints[12].travelTime = 0;
	}

	addRandomnessToCtlPts(val) {
		// const k = 100; // travel time per distance
		// const cLat = this.map.tgOrigin.origin.original.lat;
		// const cLng = this.map.tgOrigin.origin.original.lng;

		let v = TgUtil.gaussian(0, val);
		//for(let i = 0; i < 10; ++i) console.log(v());

		for(let pt of this.controlPoints) {
			if (!pt.travelTime) continue;
			pt.travelTime = pt.travelTimeOrg + v();
		}

		// const rand = (this.data.randomTime) ? this.data.randomTime : 0; // 0 - 100

		// for(let point of this.controlPoints) {
		// 	point.travelTime = 
		// 			k * this.map.calDistanceFromLatLng(point.original.lat, point.original.lng);
		// 	point.travelTime += rand * 10 * Math.random();
		// }

		// this.controlPoints[12].travelTime = 0;
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

	checkGridSplit() {
		if (this.currentSplitLevel >= this.data.var.maxSplitLevel) {
			console.log('complete: grid checking and control points.');
			this.map.readyControlPoints = true;
			this.map.disableSGapAndGapButtons(false);
			this.map.tgGrids.render();

			if (this.map.currentMode === 'DC') {
				this.map.goToDcAgain();
			}

			if (this.data.var.startMode === 'DC') {
				this.map.goToDcAgain();
				this.data.var.startMode = null;

				if (typeof map_mode != 'undefined') {
		      $("#s img").attr("src", 'img/switch_s_off.png');
					$("#t img").attr("src", 'img/switch_t_on.png');
					map_mode = 1;
		    }
			}
			return;
		}

		//console.log(this.grids);

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

		let avgTimes = [];
		let indexGrid = 0;
		for(let grid of this.grids) {

			let str = indexGrid + ':';
			for(let index = 0; index < grid.pointIndexes.length; index++) {
				str += this.controlPoints[grid.pointIndexes[index]].travelTime + ' ';
			}
			indexGrid++;
			console.log(str);


			// check if it is not visible.
			if (!grid.visible) {
				avgTimes.push(null);
				continue;
			}

			// calculate avg of travel time
			let sumTime = 0;
			let count = 0;
			for(let index = 0; index < grid.pointIndexes.length - 1; index++) {
				const time1 = this.controlPoints[grid.pointIndexes[index]].travelTime;
				const time2 = this.controlPoints[grid.pointIndexes[index + 1]].travelTime;
				if ((time1) && (time2)) {
					sumTime += Math.abs(time1 - time2);
					count++;
				}
			}

			const time1 = this.controlPoints[grid.pointIndexes[0]].travelTime;
			const time2 = this.controlPoints[grid.pointIndexes[grid.pointIndexes.length - 1]].travelTime;
			if ((time1) && (time2)) {
				sumTime += Math.abs(time1 - time2);
				count++;
			}

			//console.log('sumTime: ' + sumTime);
			//console.log('count: ' + count);

			if (count) {
				avgTimes.push(sumTime / count);
			}
			else {
				avgTimes.push(null);
			}
		}

		console.log(avgTimes);

		const threshold = 0.3; // std * threshold, usually 1
		//const outlinerIndex = this.selectOutliner(avgTimes, threshold);

		// temp;
		let outlinerIndex = [0, 1, 5, 9];
		console.log(this.currentSplitLevel);
		if (this.currentSplitLevel === 1) outlinerIndex = [21, 22, 24, 26, 29];
		//

		console.log(outlinerIndex);
		let str = '';
		for(let index of outlinerIndex) {
			str += avgTimes[index] + ' ' ;
		}
		console.log('outliners: ' + str);


		let newIndexObject = {};
		for(let index of outlinerIndex) {
			console.log('index: ' + index);
			this.splitGrid(this.grids[index], newIndexObject);
		}

		console.log('newIndexObject: ');
		console.log(newIndexObject);

		let newControlPoints = [];
		for(let index in newIndexObject) {
			newControlPoints.push(this.controlPoints[parseInt(index)]);
		}

		this.travelTimeApi.clearEndLocations();
		for(let point of newControlPoints) {
			this.travelTimeApi.addEndLocation(point.original.lat, point.original.lng);
		}

		//temp;

		for(let point of newControlPoints) {
			point.travelTime = 0;
		}

		this.map.updateLayers();

		this.currentSplitLevel++;
		if (this.currentSplitLevel <  this.data.var.maxSplitLevel) {
			this.map.tgWater.checkPointsInWater(newControlPoints);
			this.checkGridSplit();
		}
		return;

		// temp;


		this.travelTimeApi.getTravelTime(times => {

			console.log('Got the travel time, again.');

			let index = 0;
			for(let point of newControlPoints) {
				const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
				point.travelTime = times[index];
				this.travelTimeCache[this.currentTransport].set(key, times[index]);
				index++;
			}

			this.map.updateLayers();

			this.currentSplitLevel++;
			if (this.currentSplitLevel <  this.data.var.maxSplitLevel) {
				this.map.tgWater.checkPointsInWater(newControlPoints);
				this.checkGridSplit();
			}


		});
	}

	splitGrid(grid, newIndexObject) {

		// add new control points and get indexes
		let indexTop = this.addNewControlPoint(grid.pointIndexes[0], grid.pointIndexes[1]);
		let indexRight = this.addNewControlPoint(grid.pointIndexes[1], grid.pointIndexes[2]);
		let indexBottom = this.addNewControlPoint(grid.pointIndexes[2], grid.pointIndexes[3]);
		let indexLeft = this.addNewControlPoint(grid.pointIndexes[3], grid.pointIndexes[0]);
		let indexCenter = this.addNewControlPoint(indexTop, indexBottom);

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
		this.addConnectedNodes(
				indexTop, [grid.pointIndexes[1], indexCenter, grid.pointIndexes[0]]);
		this.addConnectedNodes(
				indexRight, [grid.pointIndexes[2], indexCenter, grid.pointIndexes[1]]);
		this.addConnectedNodes(
				indexBottom, [grid.pointIndexes[2], grid.pointIndexes[3], indexCenter]);
		this.addConnectedNodes(
				indexLeft, [indexCenter, grid.pointIndexes[3], grid.pointIndexes[0]]);
		this.addConnectedNodes(
				indexCenter, [indexRight, indexBottom, indexLeft, indexTop]);	

		// remove a grid object
		this.removeGridObject(grid.pointIndexes[0]);

		// add grid objects

		let pointIndexes = [grid.pointIndexes[0], indexTop, indexCenter, indexLeft];
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

	makeGridObjectByPointIndexes(pointIndexes) {
		const newGrid = this.addGridObject(pointIndexes);
		let pointsArray = new Array(4);

		for(let i = 0; i < pointIndexes.length; i++) {
			this.controlPoints[pointIndexes[i]].connectedGrids.push(newGrid);
			pointsArray[i] = this.controlPoints[pointIndexes[i]];
		}

		const ab = TgUtil.abByFFT(pointsArray, 'original', 5);
		newGrid.a = ab.as;
		newGrid.b = ab.bs;
	}

	addGridObject(indexes) {
		this.grids.push({type: 'grid', pointIndexes: indexes, visible: true});
		return this.grids[this.grids.length - 1];
	}

	removeGridObject(startIndex) {
		let originalIndex = -1;
		for(let index = 0; index < this.grids.length; index++) {
			if (this.grids[index].pointIndexes[0] ===  startIndex) {
				originalIndex = index;
			}
		}

		if (originalIndex >= 0) {
			this.grids.visible = false;
		}
		else {
			console.log('## NOT FOUND!');
		}
	}

	addConnectedNodes(indexPivot, connectedIndexes) {
		for(let index of connectedIndexes) {
			this.controlPoints[indexPivot].connectedNodes.push(this.controlPoints[index]);
		}
	}

	modifyConnectedNodes(indexStart, indexEnd, indexNew) {
		let nodes = this.controlPoints[indexStart].connectedNodes;
		for(let index = 0; index < nodes.length; index++) {
			if (nodes[index] === this.controlPoints[indexEnd]) {
				nodes[index] = this.controlPoints[indexNew];
				break;
			}
		}
	}

	addGridLineBetween(index1, index2) {
		this.gridLines.push({
			start: this.controlPoints[index1],
			end: this.controlPoints[index2]
		});
	}

	modifyGridLine(indexStart, indexEnd, indexNew) {
		const pointStart = this.controlPoints[indexStart];
		const pointEnd = this.controlPoints[indexEnd];	

		//console.log('pointStart.index: ' + pointStart.index);
		//console.log('pointEnd.index: ' + pointEnd.index);
		//console.log('indexNew: ' + indexNew);

		let originalLineIndexes = [];
		for(let index = 0; index < this.gridLines.length; index++) {

			//console.log('s: ' + this.gridLines[index].start.index);
			//console.log('e: ' + this.gridLines[index].end.index);

			if (((this.gridLines[index].start.index === pointStart.index) &&
					(this.gridLines[index].end.index === pointEnd.index)) || 
					((this.gridLines[index].start.index === pointEnd.index) &&
					(this.gridLines[index].end.index === pointStart.index))) {
				originalLineIndexes.push(index);
			}
		}

		if (originalLineIndexes.length > 0) {
			// delete the original grid line

			originalLineIndexes.sort( function(a,b) {return b - a;} ); // sort by desc
			for(let index of originalLineIndexes) {
				this.gridLines.splice(index, 1);
			}

			// add new two grid lines
			this.addGridLineBetween(indexStart, indexNew);
			this.addGridLineBetween(indexNew, indexEnd);
		}
	}

	addNewControlPoint(index1, index2) {
		const p1 = this.controlPoints[index1];
		const p2 = this.controlPoints[index2];
		const newLat = (p1.original.lat + p2.original.lat) / 2;
		const newLng = (p1.original.lng + p2.original.lng) / 2;

		// check if there is a same point in the controlPoints
		for(let point of this.controlPoints) {
			if ((point.original.lat === newLat)&&(point.original.lng === newLng)) {
				//console.log('found.');
				return point.index;
			}
		}

		const newPoint = new TgControlPoint(newLat, newLng);
		newPoint.index = this.controlPoints[this.controlPoints.length - 1].index + 1;
		this.controlPoints.push(newPoint);
		return newPoint.index;
	}

	selectOutliner(data, threshold) {
		const calAvg = function(array) {
			let sum = 0;
			let count = 0;
			for(let element of array) {
				if (element !== null) {
					sum += element;
					count++;
				}
			}
			return sum / count;
		}

		const avg = calAvg(data);
		const squaredDif = [];
		for(let value of data) {
			if (value !== null) {
				squaredDif.push((value - avg) * (value - avg));
			}
			else {
				squaredDif.push(null);
			}
		}

		const std = Math.sqrt(calAvg(squaredDif));
		let normalized = [];
		for(let value of data) {
			if (value !== null) {
				normalized.push((value - avg) / std);
			}
			else {
				normalized.push(null);
			}
		}

		let selected = [];
		for(let index = 0; index < normalized.length; index++) {
			if (normalized[index] >= threshold) selected.push(index);
		}

		return selected;
	}


	/**
	 * get control point by index of lat and lng.
	 * @param {number} indexLat
	 * @param {number} indexLng
	 */
	getControlPoint2D_(indexLat, indexLng) {
		if ((indexLat < 0)||(indexLat >= this.numLatInColumn)) return null;
		if ((indexLng < 0)||(indexLng >= this.numLngInRow)) return null;
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
	setOrigin(lat, lng) {
		this.travelTimeApi.setOrigin(lat, lng);
		for(let type of this.transportTypes) {
			this.travelTimeCache[type].clear();
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

	getCenterControlPoint() {
		const threshold = 0.0001;

		for(let i = 0; i < this.controlPoints.length; i++) {
			const dist = TgUtil.D2(
				this.controlPoints[i].original.lat, 
				this.controlPoints[i].original.lng,
				this.map.tgOrigin.origin.original.lat, 
				this.map.tgOrigin.origin.original.lng)
			if (dist < threshold) return i;
		}

		if (i === this.controlPoints.length) {
			console.log('could not find center control point');
			return -1;
		}
	}

	calAngleByTwoPoints(cx, cy, ex, ey) {
	  var dy = ey - cy;
	  var dx = ex - cx;
	  var theta = Math.atan2(dy, dx); // range (-PI, PI]
	  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
	  //if (theta < 0) theta = 360 + theta; // range [0, 360)
	  return theta;
	}

	getIJ(idx) {
		return {
			i: parseInt(idx / (this.data.var.resolution.gridLng + 1)), 
			j: idx % (this.data.var.resolution.gridLng + 1)
		}
	}

	makeNoWarpedGrid() {
		for(let point of this.controlPoints) {
			point.real.lat = point.original.lat;
			point.real.lng = point.original.lng;
		}
		console.log('makeNoWarpedGrid');
	}

	makeOriginalDCGrid() {
		for(let point of this.controlPoints) {
			point.real.lat = point.target.lat;
			point.real.lng = point.target.lng;
		}
		console.log('makeOriginalDCGrid');
	}

	setTimesByJson(times) {
		const mid = (this.controlPoints.length - 1) / 2;
		for(let i = 0; i < mid; ++i) 
			this.controlPoints[i].travelTime = times[i];
		for(let i = mid + 1; i < this.controlPoints.length; ++i) 
			this.controlPoints[i].travelTime = times[i];
	}

	makeNonIntersectedGrid() {
		//const s = (new Date()).getTime();

		const dt = 0.1;
		const eps = 0.000001;
		const margin = 0.0; //0.3;
		const setRealPosition = function(point, pct) {
			point.real.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
			point.real.lng = point.original.lng * (1 - pct) + point.target.lng * pct;

			if (!point.gap) point.gap = {};
			point.gap.lat = point.real.lat;
			point.gap.lng = point.real.lng;
			point.gap.w = pct;
		}

		for(let point of this.controlPoints) point.intersected = false;

		// 0.1, ..., 0.7 (if margin = 0.3)
		for(let pct = dt; pct + margin < 1 + eps; pct += dt) {
			//console.log('pct = ' + pct);

			// change the real position of all control points.
			for(let point of this.controlPoints) {
				if (!point.intersected) {
					setRealPosition(point, pct);
				}
				else {
					//console.log('frozen: ' + point.index);
				}
			}

			// TODO: Check lat, lng before calculating intersections
			// check intersections between grid lines.
			for(let line1 of this.gridLines) {
				for(let line2 of this.gridLines) {

					//if ((line1.start.intersected)||(line1.end.intersected)||
						//(line2.start.intersected)||(line2.end.intersected)) continue;

					if (TgUtil.intersects(
							line1.start.real.lat, line1.start.real.lng, 
							line1.end.real.lat, line1.end.real.lng, 
							line2.start.real.lat, line2.start.real.lng, 
							line2.end.real.lat, line2.end.real.lng)) {

						if ((line1.end.index !== line2.start.index)
								&&(line1.start.index !== line2.end.index)) {

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
			}

		}
		//const e = (new Date()).getTime();
		//console.log('### time: ' + (e - s) + ' ms.');
	}

	makeShapePreservingGridByFFT() {
		//const s = (new Date()).getTime();

		const threshold = this.data.var.shapePreservingDegree; // 1.0
		const dt = 0.1;
		const eps = 0.000001;
		const setRealPosition = function(point, pct) {
			point.real.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
			point.real.lng = point.original.lng * (1 - pct) + point.target.lng * pct;

			point.sgap.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
			point.sgap.lng = point.original.lng * (1 - pct) + point.target.lng * pct;
		}

		for(let point of this.controlPoints) point.done = false;
		for(let point of this.controlPoints) point.sgap = {};

		for(let pct = dt; pct < 1 + eps; pct += dt) {
			//console.log('pct = ' + pct);

			// change the real position of all control points.
			for(let point of this.controlPoints) {

				if (point.done) {
					//console.log('done: ' + point.index);
					continue;
				}

				setRealPosition(point, pct);

				for(let grid of point.connectedGrids) {

					let pointsArray = new Array(4);
					for(let i = 0; i < grid.pointIndexes.length; i++) {
						pointsArray[i] = this.controlPoints[grid.pointIndexes[i]];
					}
					const abReal = TgUtil.abByFFT(pointsArray, 'real', 5);

					let dif = 0;
					for(let i = 0; i < abReal.as.length; i++) {
						dif += TgUtil.D2(grid.a[i], grid.b[i], abReal.as[i], abReal.bs[i]);
					}
					//console.log('dif: ' + dif);
					if (dif > threshold) {
						setRealPosition(point, pct - dt);
						point.done = true;
						break;
					}
				}
			}
		}
		//const e = (new Date()).getTime();
		//console.log('### time: ' + (e - s) + ' ms.');
	}

/*	makeGlobalPreception() {

		const org = {lat: this.map.tgOrigin.origin.original.lat, 
			  lng: this.map.tgOrigin.origin.original.lng};
		const pxPerM = 0.172966822; // px/meter
		const cmPerPx = 0.0156; // cm/px
		const cmPerM = cmPerPx * pxPerM; // cm/meter

		// calculate S
		for(let pt of this.controlPoints) {
			pt.S = TgUtil.distance(pt.original.lat, pt.original.lng, org.lat, org.lng) * 1000; // m
		}

		let Qs = [];
		// 11 steps (0, 0.1, 0.2, ..., 1)
		for(let step = 0; step <= 1; step += 0.05) {

			// For each point
			let idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (idx === 13) continue;

				// (mLat, mLng) between o ~ t by linear interpolation
				const tLat = pt.original.lat * (1 - step) + pt.target.lat * step;
				const tLng = pt.original.lng * (1 - step) + pt.target.lng * step;
				const sLat = pt.original.lat * (1 - step) + pt.real.lat * step;
				const sLng = pt.original.lng * (1 - step) + pt.real.lng * step;

				// calculate Ls, Lt, Cs, Ct
				pt.Ls = TgUtil.distance(sLat, sLng, org.lat, org.lng) * 1000; // m
				pt.Ls *= cmPerM; // cm
				pt.Lt = TgUtil.distance(tLat, tLng, org.lat, org.lng) * 1000; // m
				pt.Lt *= cmPerM; // cm
				pt.Cs = pt.S / pt.Ls;
				pt.Ct = pt.travelTime / pt.Lt;
			}

			// calculate Csp, Ctp
			let Cgs = 0, Cgt = 0;
			
			idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (idx === 13) continue;

				Cgs += pt.Cs; 
				Cgt += pt.Ct;
			}
			Cgs /= this.controlPoints.length - 1;
			Cgt /= this.controlPoints.length - 1;

			// calculate Q
			let Q = 0;
			let Wt = 11.6144 // weight for time error (10: 200m / 1min)
			
			idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (idx === 13) continue;

				// calculate Lp, Sp, Tp
				// Assume that Lp is one sample of mean of L
				pt.Lp = pt.L;
				pt.Sp = pt.Lp * Csp;
				pt.Tp = pt.Lp * Ctp;

				Q += Math.sqrt((pt.S - pt.Sp)*(pt.S - pt.Sp) + 
						Wt * (pt.travelTime - pt.Tp)*(pt.travelTime - pt.Tp));
			}
			Q /= this.controlPoints.length - 1;
			Qs.push(Q);

			//console.log('Csp: ' + Csp);
			//console.log('Ctp: ' + Ctp);
			//console.log('Q: ' + Q);
			console.log(step.toFixed(2) + ' Q: ' + Q);
		}

		let finalStep = 0;
		for(let i = 0; i < Qs.length - 1; ++i) {
			if (Qs[i] < Qs[i + 1]) {
				finalStep = i * 0.05;
				break;
			}
		}
		console.log('finalStep: ' + finalStep);

		for(let pt of this.controlPoints) {
			pt.real.lat = pt.original.lat * (1 - finalStep) + pt.target.lat * finalStep;
			pt.real.lng = pt.original.lng * (1 - finalStep) + pt.target.lng * finalStep;

		}
	}*/

	calQ(pts) {
		const oa_ver = 2;
		const op_ver = 2;
		const cmPerPx = 0.0156; // cm/px
		const k = 5.166 // weight for time error
		const kL = 0.06;

		let Cd = 0, Ct = 0;
		let lenT_true = 0;
		for(let pt of pts) {
			pt.Lcm = pt.L * cmPerPx; // cm
			pt.Lisocm = pt.Liso * cmPerPx; // cm
			Cd += pt.D_true / pt.Lcm;

			if (pt.T_true) {
				//Ct += pt.T_true / pt.Lcm;
				Ct += pt.T_true / pt.Lisocm;
				lenT_true++;
			}
		}
		Cd /= pts.length;
		Ct /= lenT_true;

		//console.log('lenT_true: ' + lenT_true);

		//console.log(Cd + ' <> ' + Ct);

		for(let pt of pts) {
			pt.D = Cd * pt.Lcm;
			//pt.T = Ct * pt.Lcm;
			pt.T = Ct * pt.Lisocm + pt.Tiso;
		}

		let OA = 0, OP = 0;

		// OA
		if (oa_ver === 1) {
			for(let pt of pts) {
				let v = (pt.D_true - pt.D) * (pt.D_true - pt.D);
				v += k * k * (pt.T_true - pt.T) * (pt.T_true - pt.T);
				OA += Math.sqrt(v);
			}
			OA /= pts.length;
		}
		else if (oa_ver === 2) {
			let oa1 = 0;
			for(let pt of pts) {
				for(let i = 0; i < pts.length; ++i) {
					let d = TgUtil.D2(pt.r.yPx, pt.r.xPx, pts[i].r.yPx, pts[i].r.xPx);
					oa1 += Math.abs(d - pt.D_trues[i]);
				}
				oa1 += Math.abs(pt.D_true - pt.D);
			}
			oa1 /= ((pts.length + 1) * (pts.length + 1));

			let oa2 = 0;
			for(let pt of pts) {
				if (pt.T_true) oa2 += Math.abs(pt.T_true - pt.T);
			}
			oa2 *= k;
			oa2 /= lenT_true;

			OA = oa1 + oa2;
			//console.log(OA);
		}

		// OP

		if (op_ver === 1) {
			for(let pt of pts) OP += 2 * pt.Lcm * kL;
			OP /= pts.length;
		}
		else if (op_ver === 2) {
			let op1 = 0;
			for(let pt of pts) {
				for(let i = 0; i < pts.length; ++i) {
					let l = TgUtil.D2(pt.r.yPx, pt.r.xPx, pts[i].r.yPx, pts[i].r.xPx);
					op1 += l * cmPerPx * kL;
				}
				op1 += pt.Lcm * kL;
			}
			op1 /= ((pts.length + 1) * (pts.length + 1));

			let op2 = 0;
			for(let pt of pts) {
				if (pt.T_true) op2 += pt.Lisocm * kL;
			}
			op2 /= lenT_true;

			OP = op1 + op2;
			//console.log(OP);
		}

		return OA * OP;
	}

	makeLocalPreception() {
		this.makeNonIntersectedGrid();
		this.makeLocalPreception_inner();
	}

	checkIntersection(pt) {
		for(let i = 0; i < pt.ctrPt.neighborLines.length; ++i) {
			const idx1s = pt.ctrPt.neighborLines[i][0];
			const idx1e = pt.ctrPt.neighborLines[i][1];

			for(let j = i + 1; j < pt.ctrPt.neighborLines.length; ++j) {
				const idx2s = pt.ctrPt.neighborLines[j][0];
				const idx2e = pt.ctrPt.neighborLines[j][1];

				if ((idx1s === idx2s) || (idx1s === idx2e) || (idx1e === idx2s) || (idx1e === idx2e))
					continue;

				const p1s = this.controlPoints[idx1s].real;
				const p1e = this.controlPoints[idx1e].real;
				const p2s = this.controlPoints[idx2s].real;
				const p2e = this.controlPoints[idx2e].real;

				if (TgUtil.intersects(
						p1s.lat, p1s.lng, p1e.lat, p1e.lng, 
						p2s.lat, p2s.lng, p2e.lat, p2e.lng)) {

					//console.log('pt:', pt);
					//console.log('i[0,1]:', pt.ctrPt.neighborLines[i]);
					//console.log('j[0,1]:', pt.ctrPt.neighborLines[j]);
					return true;
					//return false;
				}
			}
		}
		return false;
/*		for(let line1 of this.gridLines) {
				for(let line2 of this.gridLines) {

					//if ((line1.start.intersected)||(line1.end.intersected)||
						//(line2.start.intersected)||(line2.end.intersected)) continue;

					if (TgUtil.intersects(
							line1.start.real.lat, line1.start.real.lng, 
							line1.end.real.lat, line1.end.real.lng, 
							line2.start.real.lat, line2.start.real.lng, 
							line2.end.real.lat, line2.end.real.lng)) {

						if ((line1.end.index !== line2.start.index)
								&&(line1.start.index !== line2.end.index)) {

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
				}*/


	}

	makeLocalPreception_inner() {

		const calL = function(pt, w) {
			pt.w = w;

			pt.r.yPx = pt.o.yPx * (1 - w) + pt.t.yPx * w;
			pt.r.xPx = pt.o.xPx * (1 - w) + pt.t.xPx * w;
			pt.L = TgUtil.D2(pt.r.yPx, pt.r.xPx, c.yPx, c.xPx);

			pt.Liso = INF;
			for(let px of radPxs) {
				const l = pt.L - px;
				if (l < pt.Liso) {pt.Liso = l; pt.Tiso = px;}
			}

			pt.ctrPt.real.lat = pt.ctrPt.original.lat * (1 - w) + pt.ctrPt.target.lat * w;
			pt.ctrPt.real.lng = pt.ctrPt.original.lng * (1 - w) + pt.ctrPt.target.lng * w;
		}

		const itvNum = this.map.tgIsochrone.calIsochrone();
		let radPxs = [];
		for(let num = 0; num < itvNum.num; num++) {
			const time = (num + 1) * itvNum.interval;
			const radiusPx = time / this.graph.factor;
			radPxs.push(radiusPx);
		}

		//console.log('itvNum', itvNum);
		//console.log('radPxs', radPxs);
		//const s = (new Date()).getTime();

	  const c = this.map.latlngToPx(
	  		this.map.tgOrigin.origin.original.lat, 
	  		this.map.tgOrigin.origin.original.lng
	  	);
		const stepSize = 10; //20;
		const INF = 987654321;
		let pts = [];

		for(let i = 0; i < this.controlPoints.length; ++i) {
			const pt = this.controlPoints[i];

			if (i === parseInt(this.controlPoints.length / 2)) {
				pt.pts = {w: 0};
				continue;
			}

			let obj = {};
			obj.o = this.map.latlngToPx(pt.original.lat, pt.original.lng);
			obj.o.lat = pt.original.lat;
			obj.o.lng = pt.original.lng;

			obj.t = this.map.latlngToPx(pt.target.lat, pt.target.lng);
			obj.t.lat = pt.target.lat;
			obj.t.lng = pt.target.lng;

			obj.r = {yPx:0, xPx:0};

			obj.D_true = TgUtil.D2(obj.o.yPx, obj.o.xPx, c.yPx, c.xPx);
			obj.T_true = pt.travelTime;

			pt.pts = obj;
			obj.ctrPt = pt;

			pts.push(obj);
		}

		for(let pt of pts) {
			pt.D_trues = [];
			for(let pt2 of pts) {
				let t = TgUtil.D2(pt.o.yPx, pt.o.xPx, pt2.o.yPx, pt2.o.xPx);
				pt.D_trues.push(t);
			}
		}

		console.log(pts);




		let gMinQ = INF, gMinW = 0;
		let eps = 0.00001;
		for(let step = 0; step <= stepSize; ++step) {
			const w = step * (1 / stepSize);

			for(let pt of pts) calL(pt, w);

			let intersected = false;
			for(let pt of pts) {
				if (this.checkIntersection(pt)) {
					intersected = true;
					break;
				}
			}

			if (intersected) {
				console.log('PRE INTERSECTED!!!');
				gMinW = (step - 1) * (1 / stepSize);
				break;
			}

			const Q = this.calQ(pts);
			if (Q < gMinQ) { gMinQ = Q; gMinW = w; }
			//console.log(step + ':' + Q);
		}
		console.log('# gMinQ: ' + gMinQ + ' gMinW: ' + gMinW);

		for(let pt of pts) {
			calL(pt, gMinW);
			pt.minW = gMinW;
		}

		for(let pt of pts) {
			let minQ = INF;

			// + way
			for(let step = gMinW * stepSize + 1; step <= stepSize + eps; ++step) {
				const w = step * (1 / stepSize);
				calL(pt, w);

				if (this.checkIntersection(pt)) {
					//console.log('+ INTERSECTED!!!' + step);
					//if (step) pt.w = (step - 1) * (1 / stepSize);
					//else pt.w = 0;
					break;
				}

				const Q = this.calQ(pts);
				if (Q < minQ) { minQ = Q; pt.minW = w; }
			}

			// - way
			for(let step = gMinW * stepSize - 1; step >= -eps; --step) {
				const w = step * (1 / stepSize);
				calL(pt, w);

				if (this.checkIntersection(pt)) {
					//console.log('- INTERSECTED!!!' + step);
					//if (step) pt.w = (step + 1) * (1 / stepSize);
					//else pt.w = 0;
					break;
				}

				const Q = this.calQ(pts);
				if (Q < minQ) { minQ = Q; pt.minW = w; }
			}
			calL(pt, pt.minW);
		}


/*

		for(let pt of pts) {
			let minQ = INF;
			pt.w = 0;
			for(let step = 0; step <= stepSize; ++step) {
				const w = step * (1 / stepSize);
				calL(pt, w);

				if (this.checkIntersection(pt)) {
					console.log('INTERSECTED!!!' + step);
					if (step) pt.w = (step - 1) * (1 / stepSize);
					else pt.w = 0;
					
					//calL(pt, (step - 1) * (1 / stepSize));
					break;
				}

				const Q = this.calQ(pts);
				if (Q < minQ) { minQ = Q; pt.w = w; }
				//console.log(step + ':' + this.calQ(pts));
			}

			//console.log('minQ:' + minQ + ' minW:' + pt.w);
			calL(pt, pt.w);
		}
*/
		

		for(let pt of this.controlPoints) {
			const w = pt.pts.w;
			//pt.real.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
			//pt.real.lng = pt.original.lng * (1 - w) + pt.target.lng * w;
			pt.pgap = {};
			pt.pgap.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
			pt.pgap.lng = pt.original.lng * (1 - w) + pt.target.lng * w;
		}



		/*const mid = parseInt(this.controlPoints.length / 2); // 12
		for(let i = 0; i < mid; ++i) {
			const pt = this.controlPoints[i];
			console.log(pt.gap.w + ' : ' + pts[i].w);
			pt.real.lat = pt.original.lat * (1 - pts[i].w) + pt.target.lat * pts[i].w;
			pt.real.lng = pt.original.lng * (1 - pts[i].w) + pt.target.lng * pts[i].w;
			pt.pgap = {};
			pt.pgap.lat = pt.original.lat * (1 - pts[i].w) + pt.target.lat * pts[i].w;
			pt.pgap.lng = pt.original.lng * (1 - pts[i].w) + pt.target.lng * pts[i].w;
		}

		for(let i = mid + 1; i < this.controlPoints.length; ++i) {
			const pt = this.controlPoints[i];
			console.log(pt.gap.w + ' : ' + pts[i - 1].w);
			pt.real.lat = pt.original.lat * (1 - pts[i - 1].w) + pt.target.lat * pts[i - 1].w;
			pt.real.lng = pt.original.lng * (1 - pts[i - 1].w) + pt.target.lng * pts[i - 1].w;
			pt.pgap = {};
			pt.pgap.lat = pt.original.lat * (1 - pts[i - 1].w) + pt.target.lat * pts[i - 1].w;
			pt.pgap.lng = pt.original.lng * (1 - pts[i - 1].w) + pt.target.lng * pts[i - 1].w;
		}

		const pt = this.controlPoints[mid];
		pt.real.lat = pt.original.lat;
		pt.real.lng = pt.original.lng;
		pt.pgap = {};
		pt.pgap.lat = pt.original.lat;
		pt.pgap.lng = pt.original.lng;*/



		//const e = (new Date()).getTime();
		//console.log('elapsed: ' + (e - s) + ' ms');

		//console.log(this.controlPoints);


		return;





		// Cal Cs and Ct
		this.Css = new Array(stepSize + 1);
		this.Cts = new Array(stepSize + 1);

	  //  let ctlPtsPx = [];
		// for(let pt of this.controlPoints) {
		// 	let obj = {};
		// 	obj.original = this.map.latlngToPx(pt.original.lat, pt.original.lng);
		// 	obj.target = this.map.latlngToPx(pt.target.lat, pt.target.lng);
		// 	ctlPtsPx.push(obj);
	  //  }

		// calculate S
		// let idx = 0;
		// for(let pt of this.controlPoints) {
		// 	if (idx++ === parseInt(this.controlPoints.length / 2)) continue;

		// 	pt.S = TgUtil.D2(
		// 		ctlPtsPx[idx - 1].original.yPx, 
		// 		ctlPtsPx[idx - 1].original.xPx, 
		// 		cPx.yPx, cPx.xPx);
		// 	// pt.S = TgUtil.distance(pt.original.lat, pt.original.lng, org.lat, org.lng) * 1000; // m
		// 	// pt.t.meter = distance(pt.t.lat, pt.t.lng, org.lat, org.lng) * 1000; // m
		// 	pt.Ls = new Array(stepSize + 1);
		// }

		// step = [0, 1, ..., stepSize + 1]
		for(let step = 0; step <= stepSize; ++step) {
			// w = [0, ..., 1]
			const w = step * (1 / stepSize);
			let Cs = 0, Ct = 0;

			// For each point
			idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (!pt.S) continue;

				// (r.lat, r.lng) between o (t=0) ~ t (t=1)
				const r = {
					yPx: ctlPtsPx[idx - 1].original.yPx * (1 - w) + ctlPtsPx[idx - 1].target.yPx * w,
					xPx: ctlPtsPx[idx - 1].original.xPx * (1 - w) + ctlPtsPx[idx - 1].target.xPx * w,
					// lat: pt.original.lat * (1 - w) + pt.target.lat * w,
					// lng: pt.original.lng * (1 - w) + pt.target.lng * w,
				}

				// calculate L, Cs, Ct
				pt.L = TgUtil.D2(r.yPx, r.xPx, cPx.yPx, cPx.xPx);
				// pt.L = TgUtil.distance(r.lat, r.lng, org.lat, org.lng) * 1000; // m
				//pt.L *= cmPerM; // cm
				pt.L *= cmPerPx; // cm
				pt.Ls[step] = pt.L;
				pt.Cs = pt.S / pt.L;
				pt.Ct = pt.travelTime / pt.L;
				Cs += pt.Cs;
				Ct += pt.Ct;
			}
			this.Css[step] = Cs / this.controlPoints.length;
			this.Cts[step] = Ct / this.controlPoints.length;
		}

		for(let pt of this.controlPoints) {
			if (!pt.S) continue;

			pt.Q = new Array(stepSize + 1);	

			for(let step = 0; step <= stepSize; ++step) {
				pt.Q[step] = this.qAccuracy(pt, step);
			}		
		}

		// console.log(this.Css);
		// console.log(this.Cts);
		//for(let pt of this.controlPoints) console.log(pt.Q);

		for(let pt of this.controlPoints) {
			if (!pt.S) continue;

			pt.minQ = 987654321;
			pt.minStep = -1;
			for(let i = 0; i < pt.Q.length; ++i) {
				if (pt.Q[i] < pt.minQ) { pt.minQ = pt.Q[i]; pt.minStep = i; }
			}
			//console.log(pt.Q);
			//console.log(pt.minStep);
		}
		for(let pt of this.controlPoints) {
			if (!pt.S) continue;

			//console.log(pt);
			const w = pt.minStep * (1 / stepSize);
			if (!pt.r) pt.r = {};
			pt.real.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
			pt.real.lng = pt.original.lng * (1 - w) + pt.target.lng * w;

			pt.pgap.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
			pt.pgap.lng = pt.original.lng * (1 - w) + pt.target.lng * w;
		}

		for(let idx = 0; idx < this.controlPoints.length; ++idx) {
			const pt = this.controlPoints[idx];

			if (!pt.S) continue;

			pt.minQn = 987654321;
			pt.minStepN = -1;
			for(let i = 0; i < pt.Qn.length; ++i) {
				if (pt.Qn[i] < pt.minQn) { pt.minQn = pt.Qn[i]; pt.minStepN = i; }
			}
			if (pt.minStep != pt.minStepN) {
				console.log(idx + ' => ' + pt.minStep + ' ' + pt.minStepN);

				const w = pt.minStepN * (1 / stepSize);
				pt.real.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
				pt.real.lng = pt.original.lng * (1 - w) + pt.target.lng * w;

				pt.pgap.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
				pt.pgap.lng = pt.original.lng * (1 - w) + pt.target.lng * w;
			}
		}

		let finalSteps = [];
		for(let pt of this.controlPoints) {
			if (!pt.S) continue;
			finalSteps.push(pt.minStepN  * (1 / stepSize));
		}
		console.log(finalSteps);

		console.log(this.controlPoints);

	}



	makeLocalPreception_org() {
		const org = {lat: this.map.tgOrigin.origin.original.lat, 
			  lng: this.map.tgOrigin.origin.original.lng};
		const stepSize = 20;
		const cmPerPx = 0.0156; // cm/px
		const cmPerM = cmPerPx * this.map.pxPerMeter; // cm/meter

		// Cal Cs and Ct
		this.Css = new Array(stepSize + 1);
		this.Cts = new Array(stepSize + 1);

		//0 1 2 3 4
		//5 6 7 8 9
		//10 11 12 13 14
		//15 16 17 18 19
		//20 21 22 23 24

	  const cPx = this.map.latlngToPx(org.lat, org.lng);

	  //const clatlng = this.tg.map.pxToLatlng(yPx, xPx);

		for(let pt of this.controlPoints) {
			pt.pgap = {lat: pt.original.lat, lng: pt.original.lng};
		}

	  let ctlPtsPx = [];
		for(let pt of this.controlPoints) {
			let obj = {};
			obj.original = this.map.latlngToPx(pt.original.lat, pt.original.lng);
			obj.target = this.map.latlngToPx(pt.target.lat, pt.target.lng);
			ctlPtsPx.push(obj);
	  }

		// calculate S
		let idx = 0;
		for(let pt of this.controlPoints) {
			if (idx++ === parseInt(this.controlPoints.length / 2)) continue;

			pt.S = TgUtil.D2(
				ctlPtsPx[idx - 1].original.yPx, 
				ctlPtsPx[idx - 1].original.xPx, 
				cPx.yPx, cPx.xPx);
			// pt.S = TgUtil.distance(pt.original.lat, pt.original.lng, org.lat, org.lng) * 1000; // m
			// pt.t.meter = distance(pt.t.lat, pt.t.lng, org.lat, org.lng) * 1000; // m
			pt.Ls = new Array(stepSize + 1);
		}

		// step = [0, 1, ..., stepSize + 1]
		for(let step = 0; step <= stepSize; ++step) {
			// w = [0, ..., 1]
			const w = step * (1 / stepSize);
			let Cs = 0, Ct = 0;

			// For each point
			idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (!pt.S) continue;

				// (r.lat, r.lng) between o (t=0) ~ t (t=1)
				const r = {
					yPx: ctlPtsPx[idx - 1].original.yPx * (1 - w) + ctlPtsPx[idx - 1].target.yPx * w,
					xPx: ctlPtsPx[idx - 1].original.xPx * (1 - w) + ctlPtsPx[idx - 1].target.xPx * w,
					// lat: pt.original.lat * (1 - w) + pt.target.lat * w,
					// lng: pt.original.lng * (1 - w) + pt.target.lng * w,
				}

				// calculate L, Cs, Ct
				pt.L = TgUtil.D2(r.yPx, r.xPx, cPx.yPx, cPx.xPx);
				// pt.L = TgUtil.distance(r.lat, r.lng, org.lat, org.lng) * 1000; // m
				//pt.L *= cmPerM; // cm
				pt.L *= cmPerPx; // cm
				pt.Ls[step] = pt.L;
				pt.Cs = pt.S / pt.L;
				pt.Ct = pt.travelTime / pt.L;
				Cs += pt.Cs;
				Ct += pt.Ct;
			}
			this.Css[step] = Cs / this.controlPoints.length;
			this.Cts[step] = Ct / this.controlPoints.length;
		}

		for(let pt of this.controlPoints) {
			if (!pt.S) continue;

			pt.Q = new Array(stepSize + 1);	

			for(let step = 0; step <= stepSize; ++step) {
				pt.Q[step] = this.qAccuracy(pt, step);
			}		
		}

		// console.log(this.Css);
		// console.log(this.Cts);
		//for(let pt of this.controlPoints) console.log(pt.Q);

		for(let pt of this.controlPoints) {
			if (!pt.S) continue;

			pt.minQ = 987654321;
			pt.minStep = -1;
			for(let i = 0; i < pt.Q.length; ++i) {
				if (pt.Q[i] < pt.minQ) { pt.minQ = pt.Q[i]; pt.minStep = i; }
			}
			//console.log(pt.Q);
			//console.log(pt.minStep);
		}
		for(let pt of this.controlPoints) {
			if (!pt.S) continue;

			//console.log(pt);
			const w = pt.minStep * (1 / stepSize);
			if (!pt.r) pt.r = {};
			pt.real.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
			pt.real.lng = pt.original.lng * (1 - w) + pt.target.lng * w;

			pt.pgap.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
			pt.pgap.lng = pt.original.lng * (1 - w) + pt.target.lng * w;
		}

		for(let idx = 0; idx < this.controlPoints.length; ++idx) {
			const pt = this.controlPoints[idx];

			if (!pt.S) continue;

			pt.minQn = 987654321;
			pt.minStepN = -1;
			for(let i = 0; i < pt.Qn.length; ++i) {
				if (pt.Qn[i] < pt.minQn) { pt.minQn = pt.Qn[i]; pt.minStepN = i; }
			}
			if (pt.minStep != pt.minStepN) {
				console.log(idx + ' => ' + pt.minStep + ' ' + pt.minStepN);

				const w = pt.minStepN * (1 / stepSize);
				pt.real.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
				pt.real.lng = pt.original.lng * (1 - w) + pt.target.lng * w;

				pt.pgap.lat = pt.original.lat * (1 - w) + pt.target.lat * w;
				pt.pgap.lng = pt.original.lng * (1 - w) + pt.target.lng * w;
			}
		}

		let finalSteps = [];
		for(let pt of this.controlPoints) {
			if (!pt.S) continue;
			finalSteps.push(pt.minStepN  * (1 / stepSize));
		}
		console.log(finalSteps);

	}

	qAccuracy(pt, step) {
		const Wt = 5.166 // weight for time error
		const Kvs = 0.06;

		const Sp = pt.Ls[step] * this.Css[step];
		const Tp = pt.Ls[step] * this.Cts[step];
		let Q = (pt.S - Sp) * (pt.S - Sp);
		Q += Wt * Wt * (pt.travelTime - Tp) * (pt.travelTime - Tp);

		//Q += Kvs * Sp;

		if (!pt.Qn) pt.Qn = [];
		pt.Qn[step] = Math.sqrt(Q) + Kvs * Sp;


		//if (!pt.Q1) pt.Q1 = [];
		//if (!pt.Q2) pt.Q2 = [];
		//pt.Q1[step] = Math.abs(pt.S - Sp);
		//pt.Q1[step] = (pt.S - Sp) * (pt.S - Sp);
		//pt.Q2[step] = Wt * Math.abs(pt.time - Tp);
		//pt.Q2[step] = Wt * Wt * (pt.time - Tp) * (pt.time - Tp);

		return Math.sqrt(Q);
	}

	makeLocalPreception_L2() {
		const org = {lat: this.map.tgOrigin.origin.original.lat, 
			  lng: this.map.tgOrigin.origin.original.lng};

		const cmPerPx = 0.0156; // cm/px
		const cmPerM = cmPerPx * this.pxPerMeter; // cm/meter
		
		let Cgss = new Array(21);
		let Cgt = 0;

		// calculate S
		for(let pt of this.controlPoints) {
			pt.S = TgUtil.distance(pt.original.lat, pt.original.lng, org.lat, org.lng) * 1000; // m
		}

		// Lt
		let idx = 0;
		for(let pt of this.controlPoints) {
			idx++;
			if (idx === 13) continue;

			pt.Lt = TgUtil.distance(pt.target.lat, pt.target.lng, org.lat, org.lng) * 1000; // m
			pt.Lt *= cmPerM; // cm
			pt.Ct = pt.travelTime / pt.Lt;
			Cgt += pt.Ct;
		}
		Cgt /= this.controlPoints.length - 1;

		let Qs = [];
		for(let i = 0; i <= 20; ++i) {
			const step = i * 0.05;

			// For each point
			let Cgs = 0;
			idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (idx === 13) continue;

				// (mLat, mLng) between o ~ t by linear interpolation
				const sLat = pt.original.lat * (1 - step) + pt.target.lat * step;
				const sLng = pt.original.lng * (1 - step) + pt.target.lng * step;

				// calculate Ls, Lt, Cs, Ct
				pt.Ls = TgUtil.distance(sLat, sLng, org.lat, org.lng) * 1000; // m
				pt.Ls *= cmPerM; // cm
				pt.Cs = pt.S / pt.Ls;
				Cgs += pt.Cs; 
			}
			Cgs /= this.controlPoints.length - 1;
			Cgss[i] = Cgs;
		}

		console.log('Cgss: ', Cgss);
		console.log('Cgt: ', Cgt);

		let finalSteps = new Array(this.controlPoints.length);
		for(let i = 0; i < this.controlPoints.length; ++i) finalSteps[i] = 0;

		idx = 0;
		let prevQ = 987654321;
		for(let pt of this.controlPoints) {

			idx++;
			if (idx === 13) continue;

			for(let i = 0; i <= 20; ++i) {
				const step = i * 0.05;

				pt.Lt = TgUtil.distance(pt.target.lat, pt.target.lng, org.lat, org.lng) * 1000; // m
				pt.Lt *= cmPerM; // cm
				pt.LCt = pt.Lt * Cgt;

				const sLat = pt.original.lat * (1 - step) + pt.target.lat * step;
				const sLng = pt.original.lng * (1 - step) + pt.target.lng * step;
				pt.Ls = TgUtil.distance(sLat, sLng, org.lat, org.lng) * 1000; // m
				pt.Ls *= cmPerM; // cm
				pt.LCs = pt.Ls * Cgss[i];

				const Wt = 11.6144 // weight for time error (10: 200m / 1min)
				const Q = Math.sqrt((pt.S - pt.LCs) * (pt.S - pt.LCs) + 
						Wt * (pt.travelTime - pt.LCt) * (pt.travelTime - pt.LCt));

				//console.log('Csp: ' + Csp);
				//console.log('Ctp: ' + Ctp);
				//console.log('Q: ' + Q);
				console.log(step.toFixed(2) + ' Q: ' + Q);

				if (prevQ > Q) {
					finalSteps[idx - 1] = step;
				}
				prevQ = Q;
			}
			console.log('-----');

		}
		console.log('finalSteps: ', finalSteps);

/*		let finalStep = 0;
		for(let i = 0; i < Qs.length - 1; ++i) {
			if (Qs[i] < Qs[i + 1]) {
				finalStep = i * 0.05;
				break;
			}
		}
		console.log('finalStep: ' + finalStep);
		*/

		idx = 0;
		for(let pt of this.controlPoints) {
			const finalStep = finalSteps[idx] || 0;
			pt.real.lat = pt.original.lat * (1 - finalStep) + pt.target.lat * finalStep;
			pt.real.lng = pt.original.lng * (1 - finalStep) + pt.target.lng * finalStep;
			
		}
	}

	makeLocalPreception_L3() {
		const org = {lat: this.map.tgOrigin.origin.original.lat, 
			  lng: this.map.tgOrigin.origin.original.lng};
		const pxPerM = 0.172966822; // px/meter
		const cmPerPx = 0.0156; // cm/px
		const cmPerM = cmPerPx * pxPerM; // cm/meter
		
		let Csps = new Array(21);
		let Ctps = new Array(21);

		// calculate S
		for(let pt of this.controlPoints) {
			pt.S = TgUtil.distance(pt.original.lat, pt.original.lng, org.lat, org.lng) * 1000; // m
		}

		let Qs = [];
		for(let i = 0; i <= 20; ++i) {
			const step = i * 0.05;

			// For each point
			let idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (idx === 13) continue;

				// (mLat, mLng) between o ~ t by linear interpolation
				const mLat = pt.original.lat * (1 - step) + pt.target.lat * step;
				const mLng = pt.original.lng * (1 - step) + pt.target.lng * step;

				// calculate L, Cs, Ct
				pt.L = TgUtil.distance(mLat, mLng, org.lat, org.lng) * 1000; // m
				pt.L *= cmPerM; // cm
				pt.Cs = pt.S / pt.L;
				pt.Ct = pt.travelTime / pt.L;
			}

			// calculate Csp, Ctp
			let Csp = 0, Ctp = 0;
			
			idx = 0;
			for(let pt of this.controlPoints) {
				idx++;
				if (idx === 13) continue;

				Csp += pt.Cs; 
				Ctp += pt.Ct;
			}
			Csp /= this.controlPoints.length - 1;
			Ctp /= this.controlPoints.length - 1;
			Csps[i] = Csp;
			Ctps[i] = Ctp;
		}

		//console.log('Csps: ', Csps);
		//console.log('Ctps: ', Ctps);

		let finalSteps = new Array(this.controlPoints.length);

		let idx = 0;
		let prevQ = 987654321;
		for(let pt of this.controlPoints) {

			idx++;
			if (idx === 13) continue;

			for(let i = 0; i <= 20; ++i) {
				const step = i * 0.05;

				// (mLat, mLng) between o ~ t by linear interpolation
				const mLat = pt.original.lat * (1 - step) + pt.target.lat * step;
				const mLng = pt.original.lng * (1 - step) + pt.target.lng * step;

				// calculate L, Cs, Ct
				pt.L = TgUtil.distance(mLat, mLng, org.lat, org.lng) * 1000; // m
				pt.L *= cmPerM; // cm
				pt.Cs = pt.S / pt.L;
				pt.Ct = pt.travelTime / pt.L;
				

				// calculate Csp, Ctp
				let Csp = Csps[i], Ctp = Ctps[i];
				
				// calculate Q
				let Q = 0;
				let Wt = 11.6144 // weight for time error (10: 200m / 1min)
				
				// calculate Lp, Sp, Tp
				// Assume that Lp is one sample of mean of L
				pt.Lp = pt.L;
				pt.Sp = pt.Lp * Csp;
				pt.Tp = pt.Lp * Ctp;

				Q = Math.sqrt((pt.S - pt.Sp)*(pt.S - pt.Sp) + 
						Wt * (pt.travelTime - pt.Tp)*(pt.travelTime - pt.Tp));

				//console.log('Csp: ' + Csp);
				//console.log('Ctp: ' + Ctp);
				//console.log('Q: ' + Q);
				//console.log(step.toFixed(2) + ' Q: ' + Q);

				if (prevQ > Q) {
					finalSteps[idx - 1] = step;
				}
				prevQ = Q;
			}
			console.log('-----');

		}
		console.log('finalSteps(L): ', finalSteps);

/*		let finalStep = 0;
		for(let i = 0; i < Qs.length - 1; ++i) {
			if (Qs[i] < Qs[i + 1]) {
				finalStep = i * 0.05;
				break;
			}
		}
		console.log('finalStep: ' + finalStep);
		*/

		idx = 0;
		for(let pt of this.controlPoints) {
			const finalStep = finalSteps[idx] || 0;
			pt.real.lat = pt.original.lat * (1 - finalStep) + pt.target.lat * finalStep;
			pt.real.lng = pt.original.lng * (1 - finalStep) + pt.target.lng * finalStep;

		}

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



}
//module.exports = TgMapControl;