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
		console.log(this.controlPoints);

		// find connected nodes per each control point.
		for(let indexLat = 0; indexLat < this.numLatInColumn_; indexLat++) {
			for(let indexLng = 0; indexLng < this.numLngInRow_; indexLng++) {
				let candidate = this.getControlPoint2D_(indexLat, indexLng + 1);
				if (candidate) 
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate); 

				candidate = this.getControlPoint2D_(indexLat, indexLng - 1);
				if (candidate)
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);
				
				candidate = this.getControlPoint2D_(indexLat + 1, indexLng);
				if (candidate)
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);
				
				candidate = this.getControlPoint2D_(indexLat - 1, indexLng);
				if (candidate)
					this.getControlPoint2D_(indexLat, indexLng).connectedNodes.push(candidate);
			}
		}

		//return;

		// check location of which we have to get a travel time by looking for in cache.
		let numNewPoints = 0;
		this.travelTimeApi_.clearEndLocations();
		for(let point of this.controlPoints) {
			const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
			if (!this.travelTimeCache_.has(key)) {
				this.travelTimeApi_.addEndLocation(point.original.lat, point.original.lng);
				numNewPoints++;
			}
		}

		if (numNewPoints > 0) {
			let countNewPoints = 0;
			const t = (new Date()).getTime();
			this.tg_.map.setTime('travelTimeLoading', 'start', t);

			this.travelTimeApi_.getTravelTime(times => {
				for(let point of this.controlPoints) {
					const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
					if (this.travelTimeCache_.has(key)) {
						point.travelTime = this.travelTimeCache_.get(key);
					}
					else {
						//point.travelTime = result.one_to_many[0][countNewPoints++].time;
						point.travelTime = times[countNewPoints++];
						this.travelTimeCache_.set(key, point.travelTime);
					}
				}

				const t = (new Date()).getTime();
				this.tg_.map.setDataInfo('numNewTravelTime', 'set', (countNewPoints - 1));
				this.tg_.map.setTime('travelTimeLoading', 'end', t);

				this.tg_.map.updateLayers();

				if (cb) cb();
			});
		}
		else {
			for(let point of this.controlPoints) {
				const key = point.original.lat.toFixed(3) + ' ' + point.original.lng.toFixed(3);
				point.travelTime = this.travelTimeCache_.get(key);
			}
			if (cb) cb();
		}
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
			var end = (new Date()).getTime()
			console.log('elapsed: ' + (end - start)/1000 + ' sec.')
			//console.log(data)
			
			//this.travelTime = data

			for(var i = 0; i < this.controlPoints.length; i++) {
				this.controlPoints[i].travelTime = data.one_to_many[0][i + 1].time
			}
			this.tg_.map.updateLayers()


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
	splitGrid() {
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
			//text += ',' + point.index;
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

		for(let point of this.controlPoints) {
			for(let neighbor of point.connectedNodes) {
				this.mapUtil_.addFeatureInFeatures(
						features, 
						new ol.geom.LineString(
								[[point.disp.lng, point.disp.lat], [neighbor.disp.lng, neighbor.disp.lat]]), 
								this.mapUtil_.lineStyle(opt.color.grid, opt.width.grid));
			}			
		}

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
			i:parseInt(idx / (this.tg_.opt.resolution.gridLng + 1)), 
			j:idx % (this.tg_.opt.resolution.gridLng + 1)
		}
	}

	makeNonIntersectedGrid() {
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


	}


}