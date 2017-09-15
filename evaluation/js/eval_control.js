class EvalControl {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;
	  this.controlPoints = [];
	  this.gridLines = [];
	  this.numLngInRow = 0;
		this.numLatInColumn = 0;
		this.grids = [];

		this.transportTypes = ['auto', 'bicycle', 'pedestrian'];
		this.currentTransport = 'auto';
		this.travelTimeApi = new TgTravelTimeApi(this.data);
		this.travelTimeCache = {};
		for(let type of this.transportTypes) {
			this.travelTimeCache[type] = new Map();
		}
		this.currentSplitLevel = 0;

		this.ctlPtArr = [];
	}

	calculateControlPoints(cb) {
		this.calUniformControlPoints();
		this.calGridLines();
		this.calConnectedNodes();
		this.calGrids();
		//this.getTravelTimeOfControlPoints(cb);
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
				lat: apprHalf.lat / 8,  // 2
				lng: apprHalf.lng / 4}; // 2
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
				point.travelTime = 0;
				this.controlPoints.push(point);
				this.numLngInRow++;
			}
			this.numLatInColumn++;
		}

		console.log(this.controlPoints);
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
		//console.log(this.gridLines);
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

	getTravelTimeOfControlPoints(cb) {
		// check locations that need a travel time by looking in cache.
		let newPointsArray = [];
		this.travelTimeApi.clearEndLocations();

		for(let point of this.controlPoints) {
			const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
			
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

		console.log('numNewPoints: ' + newPointsArray.length);
		//console.log(newPointsArray);

		// if there is points of which we need travel time,
		if (newPointsArray.length > 0) {
			this.travelTimeApi.getTravelTime(this.currentTransport, (times) => {

				if (times.length !== newPointsArray.length) {
					console.log('ERROR: times.length !== newPointsArray.length');
					console.log('times.length: ' + times.length);
					console.log('newPointsArray.length: ' + newPointsArray.length);
					return;
				}

				for(let index = 0; index < newPointsArray.length; index++) {
					const point = newPointsArray[index];
					const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
					point.travelTime = times[index];
					this.travelTimeCache[this.currentTransport].set(key, point.travelTime);
				}

				if (cb) cb();
			});
		}
		// if we don't need to request traveltime,
		else {
			if (cb) cb();
		}
	}



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
		const outlinerIndex = this.selectOutliner(avgTimes, threshold);
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
		this.travelTimeApi.setStartLocation(lat, lng);
		this.travelTimeApi.clearEndLocations();
		for(let type of this.transportTypes) {
			this.travelTimeCache[type].clear();
		}
	}



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




}
//module.exports = TgMapControl;