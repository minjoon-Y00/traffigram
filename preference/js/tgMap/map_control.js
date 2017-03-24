/**
 * Class for control points.
 */
class TGMapControl {
	constructor(tg, mapUtil) {
		/** @private @const {!TGPreference} */
		this.tg_ = tg;

		/** @private @const {!TGMapUtil} */
		this.mapUtil_ = mapUtil;

		/** @private @const {!ol.Layer} */
		this.controlPointLayer_ = null;

		/** @private @const {!ol.Layer} */
		this.gridLayer_ = null;
		
		/** 
		 * one dimension array for ControlPoint object.
		 * @type {Array<ControlPoint>} 
		 */
	  this.controlPoints = [];

	  /** 
		 * one dimension array for Grid Lines.
		 * @type {Array<ObjTypes>} 
		 */
	  this.gridLines_ = [];

		/** 
		 * number of control points in a row. (horizontally)
		 * @private @type {number} 
		 */
	  this.numLngInRow_ = 0;

		/** 
		 * number of control points in a column. (vertically)
		 * @private @type {number} 
		 */
		this.numLatInColumn_ = 0;

		/** 
		 * grid objects
		 * @private @type {Array} 
		 */
		this.grids_ = [];

		/** 
		 * api object for getting travel time.
		 * @private @type {!TravelTimeApi>} 
		 */
		this.travelTimeApi_ = new TravelTimeApi();

		/** 
		 * Map object to cache travel time.
		 * @private @type {!Map>} 
		 */
		this.travelTimeCache_ = new Map();
	}

	/**
	 * Calculate the control points.
	 */
	calculateControlPoints(cb) {
		// make a control point array.
		const latFactor = 0.02 / 1; //0.01;
		const lngFactor = 0.026 / 1; //0.013;

		const box = this.tg_.opt.box;
		const eps = 0.000001;
		const zoomFactor = Math.pow(2, (13 - this.tg_.map.currentZoom));
		const quantizationFactor = 100 / zoomFactor;
		//const quantizationFactor = 100;
		const start = 
				//{lat: Math.ceil(box.bottom * quantizationFactor) / quantizationFactor,
				{lat: Math.floor(box.bottom * quantizationFactor) / quantizationFactor,
				lng: Math.ceil(box.left * quantizationFactor) / quantizationFactor};
		const end = 
				{lat: Math.floor(box.top * quantizationFactor) / quantizationFactor,
				//lng: Math.floor(box.right * quantizationFactor) / quantizationFactor};
				lng: Math.ceil(box.right * quantizationFactor) / quantizationFactor};
		const step = 
				{lat: latFactor * zoomFactor, 
				lng: lngFactor * zoomFactor};
		const halfStep = 
				{lat: step.lat / 2, 
				lng: step.lng / 2};


		// 12 -> 0.04 
		// 13 -> 0.02 100 / 2
		// 14 -> 0.01 100 / 1

		this.controlPoints = [];
		this.numLatInColumn_ = 0;
		let indexOfControlPoint = 0;
		for(let lat = end.lat; 
				lat > start.lat - halfStep.lat - eps; 
				lat -= step.lat) {

			this.numLngInRow_ = 0;

			for(let lng = start.lng; 
					lng < end.lng + halfStep.lng + eps; 
					lng += step.lng) {

				const point = new ControlPoint(lat, lng);
				point.index = indexOfControlPoint++;
				this.controlPoints.push(point);
				this.numLngInRow_++;
			}
			this.numLatInColumn_++;
		}

		// make an array for grid lines
		this.gridLines_ = [];

		for(let indexLat = 0; indexLat < this.numLatInColumn_ - 1; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow_; indexLng++) {
				this.gridLines_.push({
					start: this.getControlPoint2D_(indexLat, indexLng),
					end: this.getControlPoint2D_(indexLat + 1, indexLng),
				})
			}
		}

		for(let indexLat = 0; indexLat < this.numLatInColumn_; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow_ - 1; indexLng++) {
				this.gridLines_.push({
					start: this.getControlPoint2D_(indexLat, indexLng),
					end: this.getControlPoint2D_(indexLat, indexLng + 1),
				})
			}
		}

		/*console.log('box.top: ' + box.top); // 40.7914382000846
		console.log('box.bottom): ' + box.bottom); // 40.66742401978021
		console.log('box.right): ' + box.right); // -73.947356711586
		console.log('box.left): ' + box.left); // -74.04405928841399
		console.log('start.lat: ' + start.lat);
		console.log('end.lat: ' + end.lat);
		console.log('start.lng: ' + start.lng);
		console.log('end.lng: ' + end.lng);*/
		// 40.68, 40.70, 40.72, 40.74, 40.76, 40.78
		// -74.04, -74.02, -74.0, -73.98, -73.96,
		console.log('numLngInRow: ' + this.numLngInRow_);
		console.log('numLatInColumn: ' + this.numLatInColumn_);
		console.log('# of controlPoints: ' + this.controlPoints.length);
		console.log('# of gridLines: ' + this.gridLines_.length);
		console.log(this.controlPoints);
		console.log(this.gridLines_);


		// find connected nodes per each control point.
		for(let indexLat = 0; indexLat < this.numLatInColumn_; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow_; indexLng++) {
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
		this.grids_ = [];
		for(let indexLat = 0; indexLat < this.numLatInColumn_ - 1; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow_ - 1; indexLng++) {
				let pointIndexes = [];
				pointIndexes.push(this.numLngInRow_ * indexLat + indexLng);
				pointIndexes.push(this.numLngInRow_ * indexLat + indexLng + 1);
				pointIndexes.push(this.numLngInRow_ * (indexLat + 1) + indexLng + 1);
				pointIndexes.push(this.numLngInRow_ * (indexLat + 1) + indexLng);
				this.addGridObject(pointIndexes);
			}
		}

		this.calculateAnglesOfControlPoints();

		// check location of which we have to get a travel time by looking for in cache.
		let newPointsArray = [];
		this.travelTimeApi_.clearEndLocations();

		for(let point of this.controlPoints) {
			const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
			
			// if a point is not in the cache, add it to travelTimeApi.
			if (!this.travelTimeCache_.has(key)) {
				this.travelTimeApi_.addEndLocation(point.original.lat, point.original.lng);
				newPointsArray.push(point);
			}
			// if a point is in the cache, assign traveltime to it.
			else {
				point.travelTime = this.travelTimeCache_.get(key);
			}
		}

		console.log('numNewPoints: ' + newPointsArray.length);
		//console.log(newPointsArray);

		// if there is points of which we need to traveltime,
		if (newPointsArray.length > 0) {
			this.tg_.map.setTime('travelTimeLoading', 'start', (new Date()).getTime());

			this.travelTimeApi_.getTravelTime(times => {

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
					this.travelTimeCache_.set(key, point.travelTime);
				}

				this.tg_.map.setDataInfo('numNewTravelTime', 'set', newPointsArray.length);
				this.tg_.map.setTime('travelTimeLoading', 'end', (new Date()).getTime());
				this.tg_.map.updateLayers();
				//this.checkGridSplit();

				if (cb) cb();
			});
		}
		// if we don't need to request traveltime,
		else {
			if (cb) cb();
		}

	}

	calculateAnglesOfControlPoints() {
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
	}

	checkGridSplit() {
		let sumTimes = [];

		console.log(this.grids_);

		for(let grid of this.grids_) {
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

		let newIndexObject = {};
		for(let index of outlinerIndex) {
			console.log('index: ' + index);
			this.splitGrid(this.grids_[index], newIndexObject);
		}

		console.log('newIndexObject: ');
		console.log(newIndexObject);

		let newControlPoints = [];
		for(let index in newIndexObject) {
			newControlPoints.push(this.controlPoints[parseInt(index)]);
		}

		this.travelTimeApi_.clearEndLocations();
		for(let point of newControlPoints) {
			this.travelTimeApi_.addEndLocation(point.original.lat, point.original.lng);
		}

		this.travelTimeApi_.getTravelTime(times => {

			console.log('Got the travel time, again.');

			let index = 0;
			for(let point of newControlPoints) {
				const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
				point.travelTime = times[index];
				this.travelTimeCache_.set(key, times[index]);
				index++;
			}

			this.tg_.map.tgWater.arePointsInWater(newControlPoints);
			this.tg_.map.updateLayers();
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
		this.addGridObject([grid.pointIndexes[0], indexTop, indexCenter, indexLeft]);
		this.addGridObject([indexTop, grid.pointIndexes[1], indexRight, indexCenter]);
		this.addGridObject([indexCenter, indexRight, grid.pointIndexes[2], indexBottom]);
		this.addGridObject([indexLeft, indexCenter, indexBottom, grid.pointIndexes[3]]);

		// calculate angles of control points again.
		this.calculateAnglesOfControlPoints();

		// add new points into array to get the travel time
		newIndexObject[indexTop] = 0; 
		newIndexObject[indexRight] = 0; 
		newIndexObject[indexBottom] = 0; 
		newIndexObject[indexLeft] = 0; 
		newIndexObject[indexCenter] = 0; 

		// put key into newIndexArray -> newIndexObject?

		//this.tg_.map.updateLayers();

		// 3,4,9,8


	}

	addGridObject(indexes) {
		this.grids_.push({type: 'grid', pointIndexes: indexes, visible: true});
	}

	removeGridObject(startIndex) {
		let originalIndex = -1;
		for(let index = 0; index < this.grids_.length; index++) {
			if (this.grids_[index].pointIndexes[0] ===  startIndex) {
				originalIndex = index;
			}
		}

		if (originalIndex >= 0) {
			this.grids_.visible = false;
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
		this.gridLines_.push({
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

		let originalLineIndex = -1;
		for(let index = 0; index < this.gridLines_.length; index++) {

			//console.log('s: ' + this.gridLines_[index].start.index);
			//console.log('e: ' + this.gridLines_[index].end.index);

			if (((this.gridLines_[index].start.index === pointStart.index) &&
					(this.gridLines_[index].end.index === pointEnd.index)) || 
					((this.gridLines_[index].start.index === pointEnd.index) &&
					(this.gridLines_[index].end.index === pointStart.index))) {
				originalLineIndex = index;
				break;
			}
		}

		if (originalLineIndex >= 0) {
			// delete the original grid line
			this.gridLines_.splice(originalLineIndex, 1);

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

		const newPoint = new ControlPoint(newLat, newLng);
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
		if ((indexLat < 0)||(indexLat >= this.numLatInColumn_)) return null;
		if ((indexLng < 0)||(indexLng >= this.numLngInRow_)) return null;
		return this.controlPoints[this.numLngInRow_ * indexLat + indexLng];
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
	 * (re)set center position. It also reset TravelTimeApi.
	 * @param {number} lat
	 * @param {number} lng
	 */
	setCenterPosition(lat, lng) {
		this.travelTimeApi_.setStartLocation(lat, lng);
		this.travelTimeApi_.clearEndLocations();
		this.travelTimeCache_.clear();
	}

	getTravelTime() {
		this.travelTimeApi_.setStartLocation(
			this.tg_.map.centerPosition.lat, this.tg_.map.centerPosition.lng)

		for(var i = 0; i < this.controlPoints.length; i++) {
			this.travelTimeApi_.addDestLocation(
				this.controlPoints[i].original.lng, this.controlPoints[i].original.lat) 
		}


		/*var startIdx = this.getStartIndexBySplitLevel(this.splitLevel)
		for(var i = startIdx; i < this.controlPoints.length; i++) {
			this.tt.addDestLocation(
				this.controlPoints[i].original.lng, 
				this.controlPoints[i].original.lat)
		}*/

		//console.log('startIdx = ' + startIdx)
		//console.log('num = ' + (this.controlPoints.length - startIdx))

		var start = (new Date()).getTime()
		this.travelTimeApi_.getTravelTime(func.bind(this))

		function func(data) {
			console.log('?????');

			var end = (new Date()).getTime()
			console.log('elapsed: ' + (end - start)/1000 + ' sec.')
			console.log(data)
			
			//this.travelTime = data

			for(var i = 0; i < this.controlPoints.length; i++) {
				this.controlPoints[i].travelTime = data.one_to_many[0][i + 1].time
			}
			this.tg_.map.updateLayers();
			this.checkGridSplit();



			//this.tg_.util.saveTextAsFile(data, 'data_tt.js')

			//this.travelTime = data
			//this.setTravelTime()
			//this.tg_.map.updateLayers()
		}
	}



	/*saveTravelTimeToFile() {
		this.tg_.util.saveTextAsFile(this.travelTime, 'data_tt.js')
	}*/

	getCenterControlPoint() {
		var threshold = 0.0001
		var dist

		for(var i = 0; i < this.controlPoints.length; i++) {
			dist = this.tg_.util.D2(this.controlPoints[i].original.lat, this.controlPoints[i].original.lng,
				this.tg_.map.centerPosition.lat, this.tg_.map.centerPosition.lng)
			if (dist < threshold) return i
		}

		if (i == this.controlPoints.length) {
			console.log('could not find center control point')
			return -1
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

	calTargets() {
		var target
		for(var i = 0; i < this.controlPoints.length; i++) {
			target = this.tg_.graph.transform(
				this.controlPoints[i].original.lat, this.controlPoints[i].original.lng)
			this.controlPoints[i].target.lat = target.lat
			this.controlPoints[i].target.lng = target.lng
		}
	}

	//
	//
	//
	splitGrid_old() {
		var threshold = this.tg_.opt.constant.splitThreshold
		var latM, lngM, idx
		var idxBM, idxRM, idxTM, idxLM, idxMM
		var newGrids = []
		
		this.controlPoints = this.tg_.map.controlPoints
		this.splitLevel++

		for(var i = 0; i < this.grids.length; i++) {
			if (isOverThreshold(this.grids[i].BL, this.grids[i].BR, threshold)
				||isOverThreshold(this.grids[i].BR, this.grids[i].TR, threshold)
				||isOverThreshold(this.grids[i].TR, this.grids[i].TL, threshold)
				||isOverThreshold(this.grids[i].TL, this.grids[i].BL, threshold)) {

				// add control points or get the indexes of existed points
				latM = (this.grids[i].BL.original.lat + this.grids[i].TL.original.lat) / 2
				lngM = (this.grids[i].BL.original.lng + this.grids[i].BR.original.lng) / 2

				idxBM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, this.grids[i].BL.original.lat, lngM) // BM
				idxRM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, latM, this.grids[i].BR.original.lng) // RM
				idxTM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, this.grids[i].TL.original.lat, lngM) // TM
				idxLM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, latM, this.grids[i].BL.original.lng) // LM
				idxMM = getIndexOfControlPoint(this.controlPoints, this.splitLevel, latM, lngM) // MM

				// assign travel time (temp)
				//this.controlPoints[idxBM].travelTime = (this.grids[i].BL.travelTime + this.grids[i].BR.travelTime) / 2
				//this.controlPoints[idxRM].travelTime = (this.grids[i].BR.travelTime + this.grids[i].TR.travelTime) / 2
				//this.controlPoints[idxTM].travelTime = (this.grids[i].TL.travelTime + this.grids[i].TR.travelTime) / 2
				//this.controlPoints[idxLM].travelTime = (this.grids[i].TL.travelTime + this.grids[i].BL.travelTime) / 2
				//this.controlPoints[idxMM].travelTime = (this.controlPoints[idxBM].travelTime + this.controlPoints[idxTM].travelTime) / 2


				// split the grid

				/*console.log('idxBM : ' + idxBM)
				console.log('idxRM : ' + idxRM)
				console.log('idxTM : ' + idxTM)
				console.log('idxLM : ' + idxLM)
				console.log('idxLM : ' + idxMM)*/

				this.grids[i].splitted = true

				newGrids.push({BL:this.grids[i].BL, BR:this.controlPoints[idxBM], 
					TR:this.controlPoints[idxMM], TL:this.controlPoints[idxLM]})
				newGrids.push({BL:this.controlPoints[idxBM], BR:this.grids[i].BR, 
					TR:this.controlPoints[idxRM], TL:this.controlPoints[idxMM]})
				newGrids.push({BL:this.controlPoints[idxMM], BR:this.controlPoints[idxRM], 
					TR:this.grids[i].TR, TL:this.controlPoints[idxTM]})
				newGrids.push({BL:this.controlPoints[idxLM], BR:this.controlPoints[idxMM], 
					TR:this.controlPoints[idxTM], TL:this.grids[i].TL})	
			}
		}

		// add new grids
		for(var i = 0; i < newGrids.length; i++) {
			this.grids.push(new Grid(newGrids[i].BL, newGrids[i].BR, newGrids[i].TR, newGrids[i].TL))
		}

		// delete original grids
		this._grids = []
		for(var i = 0; i < this.grids.length; i++) {
			if (!this.grids[i].splitted) {
				this._grids.push(this.grids[i])
			}
		}
		this.grids = this._grids

		// re-rendering the map
		//this.tg_.map.updateLayers()

		console.log(this.controlPoints)


		// sub funcitons

		function isOverThreshold(pt1, pt2, threshold) {
			var t1 = pt1.travelTime
			var t2 = pt2.travelTime
			if ((t1 == null)||(t2 == null)) return false
			return Math.abs(t1 - t2) >= threshold
		}

		function findControlPointByLatLng(ctlPts, lat, lng) {
			for(var i = 0; i < ctlPts.length; i++) {
				if ((ctlPts[i].original.lat == lat)&&(ctlPts[i].original.lng == lng)) {
					return i
				}
			}
			return -1
		}	

		function getIndexOfControlPoint(ctlPts, level, lat, lng) {
			var idx = findControlPointByLatLng(ctlPts, lat, lng) 

			if (idx < 0) {
				// insert a new control point
				var n = new Node(lat, lng)
				n.level = level
				ctlPts.push(n)
				return ctlPts.length - 1
			}
			else {
				// already existed control point
				//console.log('existed')
				return idx
			}
		}	

	}



	//////////////////////////////////////////////////////////////////////////////////////////
	// Drawing Part
	//////////////////////////////////////////////////////////////////////////////////////////

	/** 
	 * create a control point layer and add to olMap.
	 */
	drawControlPointLayer() {
		const opt = this.tg_.opt;
		let features = [];

		for(let point of this.controlPoints) {
			// draw control points
			this.mapUtil_.addFeatureInFeatures(
					features,
					new ol.geom.Point(
							[point.disp.lng, point.disp.lat]), 
							this.mapUtil_.nodeStyle(opt.color.controlPoint, opt.radius.controlPoint));

			// draw additional lines if there is a difference between target and real.
			if ((point.target.lng != point.disp.lng) 
				|| (point.target.lat != point.disp.lat)) {

				this.mapUtil_.addFeatureInFeatures(
						features, 
						new ol.geom.LineString(
								[[point.disp.lng, point.disp.lat], [point.target.lng, point.target.lat]]), 
								this.mapUtil_.lineStyle(
									opt.color.controlPointLine, opt.width.controlPointLine));
			}

			// add text
			let text = (point.travelTime != null) ? point.travelTime.toString() : '-';
			text += ',' + point.index;
			this.mapUtil_.addFeatureInFeatures(
					features,
					new ol.geom.Point(
							[point.disp.lng, point.disp.lat]), 
							this.mapUtil_.textStyle(text, opt.color.text, opt.font.text));
		}

		this.removeControlPointLayer();
		this.controlPointLayer_ = this.mapUtil_.olVectorFromFeatures(features);
		this.controlPointLayer_.setZIndex(opt.z.controlPoint);
	  this.mapUtil_.addLayer(this.controlPointLayer_);
	}

	/** 
	 * remove a control point layer if exists.
	 */
	removeControlPointLayer() {
		this.mapUtil_.removeLayer(this.controlPointLayer_);
	}

	/** 
	 * create a grid layer and add to olMap.
	 */
	drawGridLayer() {
		const opt = this.tg_.opt;
		let features = [];

		for(let line of this.gridLines_) {
			this.mapUtil_.addFeatureInFeatures(
					features, 
					new ol.geom.LineString(
							[[line.start.disp.lng, line.start.disp.lat], 
							[line.end.disp.lng, line.end.disp.lat]]), 
							this.mapUtil_.lineStyle(opt.color.grid, opt.width.grid));
		}




		/*for(let point of this.controlPoints) {
			for(let neighbor of point.connectedNodes) {
				this.mapUtil_.addFeatureInFeatures(
						features, 
						new ol.geom.LineString(
								[[point.disp.lng, point.disp.lat], [neighbor.disp.lng, neighbor.disp.lat]]), 
								this.mapUtil_.lineStyle(opt.color.grid, opt.width.grid));
			}			
		}*/

		this.removeGridLayer();
		this.gridLayer_ = this.mapUtil_.olVectorFromFeatures(features);
		this.gridLayer_.setZIndex(opt.z.grid);
		this.mapUtil_.addLayer(this.gridLayer_);
	}

	/** 
	 * remove a control point layer if exists.
	 */
	removeGridLayer() {
		this.mapUtil_.removeLayer(this.gridLayer_)
	}

	calDispNodes(type, value) {
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
	}



	getIJ(idx) {
		return {
			i: parseInt(idx / (this.tg_.opt.resolution.gridLng + 1)), 
			j: idx % (this.tg_.opt.resolution.gridLng + 1)
		}
	}

	makeNonIntersectedGrid() {
		//const s = (new Date()).getTime();

		const dt = 0.1;
		const eps = 0.000001;
		const margin = 0.0; //0.3;
		const setRealPosition = function(point, pct) {
			point.real.lat = point.original.lat * (1 - pct) + point.target.lat * pct;
			point.real.lng = point.original.lng * (1 - pct) + point.target.lng * pct;
		}

		// 0.1, ..., 0.7 (if margin = 0.3)
		for(let pct = dt; pct + margin < 1 + eps; pct += dt) {
			console.log('pct = ' + pct);

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
			for(let line1 of this.gridLines_) {
				for(let line2 of this.gridLines_) {

					//if ((line1.start.intersected)||(line1.end.intersected)||
						//(line2.start.intersected)||(line2.end.intersected)) continue;

					if (tg.util.intersects(
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

	makeShapePreservingGrid() {
		//const s = (new Date()).getTime();

		const threshold = 30;
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
				//const preLat = point.real.lat;
				//const preLng = point.real.lng;
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

				//console.log('--');
				//console.log(point.difAngles);
				//console.log(difAngles);

			}



			

			/*for(let line1 of this.gridLines_) {
				for(let line2 of this.gridLines_) {

					//if ((line1.start.intersected)||(line1.end.intersected)||
						//(line2.start.intersected)||(line2.end.intersected)) continue;

					if (tg.util.intersects(
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
			}*/

		}
		//const e = (new Date()).getTime();
		//console.log('### time: ' + (e - s) + ' ms.');
	}



	/*_makeNonIntersectedGrid() {

		const s = (new Date()).getTime();

		const ctlPt = this.controlPoints;
		const dt = 0.5;
		let nextLat;
		let nextLng;

		for(let pct = 0; pct < 1; pct += dt) 
		//var pct = 0
		{

			//if (pct > 0.5) return; 

			console.log('pct = ' + pct)

			
			for(var i = 0; i < ctlPt.length; i++) 
			//var i = 22
			{

				if (ctlPt[i].intersected) continue;

				var intersected = false;
				var indexOfPivotControlPoint = i;
			//

				ctlPt[i].real.lat 
					= ctlPt[i].original.lat * (1 - pct) + ctlPt[i].target.lat * pct
				ctlPt[i].real.lng
					= ctlPt[i].original.lng * (1 - pct) + ctlPt[i].target.lng * pct

				nextLat 
					= ctlPt[i].original.lat * (1 - (pct + dt)) + ctlPt[i].target.lat * (pct + dt)
				nextLng 
					= ctlPt[i].original.lng * (1 - (pct + dt)) + ctlPt[i].target.lng * (pct + dt)

				//console.log('originalLat = ' + ctlPt[i].original.lat)
				//console.log('realLat = ' + ctlPt[i].real.lat)
				//console.log('nextLat = ' + nextLat)
				//console.log('targetLat = ' + ctlPt[i].target.lat)
				//console.log(ctlPt[i].connectedNodes)

				for(var j = 0; j < ctlPt[i].connectedNodes.length; j++) 
				//var j = 0;
				{

					var connectedControlPointStep1 = ctlPt[i].connectedNodes[j];
					// 17 //21, 23, 27

					//console.log('1 = ' + connectedControlPointStep1.index);


					var lat1 = nextLat
					var lng1 = nextLng
					var lat2 = connectedControlPointStep1.real.lat
					var lng2 = connectedControlPointStep1.real.lng

					//console.log('lat1 = ' + lat1)
					//console.log('lng1 = ' + lng1)
					//console.log('lat2 = ' + lat2)
					//console.log('lng2 = ' + lng2)

					for(var k = 0; k < connectedControlPointStep1.connectedNodes.length; k++) {

						var connectedControlPointStep2 = connectedControlPointStep1.connectedNodes[k];
						// 12, 16, 18, 22

						if (connectedControlPointStep2 === ctlPt[i]) continue;
						// 12, 16, 18

						//console.log('2 = ' + connectedControlPointStep2.index);
						

						for(var m = 0; m < connectedControlPointStep2.connectedNodes.length; m++) {

							var connectedControlPointStep3 = connectedControlPointStep2.connectedNodes[m];
							// 12 (7, 11, 13, 17), 16 (11, 15, 17, 21), 18 (13, 17, 19, 23)

							if (connectedControlPointStep3 === connectedControlPointStep1) continue;
							// 12 (7, 11, 13), 16 (11, 15, 21), 18 (13, 19, 23)


							if (ctlPt[i].connectedNodes.indexOf
								(connectedControlPointStep3) >= 0) {

								var lat3 = connectedControlPointStep2.real.lat
								var lng3 = connectedControlPointStep2.real.lng
								var lat4 = connectedControlPointStep3.real.lat
								var lng4 = connectedControlPointStep3.real.lng


								if (tg.util.intersects(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4)) {

									console.log('[' + i + ', ' 
										+ connectedControlPointStep1.index + ']');
									console.log('<' + connectedControlPointStep2.index + ', ' 
										+ connectedControlPointStep3.index + '>');

									//console.log('intersect! i = ' + i + ' j = ' + j + ' k = ' + k)
									intersected = true;
								}
								//console.log('step 3 = ' + connectedControlPointStep3.index)
							}
						} 
					}
				}

				if (intersected) {
					//ctlPt[i].real.lat 
					//	= ctlPt[i].original.lat * (1 - pct + dt) + ctlPt[i].target.lat * (pct - dt)
					//ctlPt[i].real.lng
				//		= ctlPt[i].original.lng * (1 - pct + dt) + ctlPt[i].target.lng * (pct - dt)

					ctlPt[i].intersected = true;
				}
			}
		}
		const e = (new Date()).getTime();
		console.log('### time: ' + (e - s) + ' ms.');
	}*/



}