class TGMapGrid {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg
		this.olMap = olMap
		this.mapUtil = mapUtil

		this.gridLayer = null
		this.grids
	  this.splitLevel = 0
	}

	initGrids() {
		this.grids = []
		this.controlPoints = this.tg.map.controlPoints

		var box = this.tg.opt.box
		var resolution = this.tg.opt.resolution
		var dLat = (box.top - box.bottom) / resolution.gridLat // 8
		var dLng = (box.right - box.left) / resolution.gridLng // 4
		var latB, lngL, n
		var BL, BR, TR, TL

		// make a control point array
		for(var i = 0; i <= resolution.gridLat; i++) {
			for(var j = 0; j <= resolution.gridLng; j++) {
				latB = box.bottom + dLat * i
				lngL = box.left + dLng * j
				n = new Node(latB, lngL)
				n.level = this.splitLevel
				this.controlPoints.push(n)
			}
		}

		// make a grid structure
		var offset = resolution.gridLng + 1

		for(var i = 0; i < resolution.gridLat; i++) {
			for(var j = 0; j < resolution.gridLng; j++) {
				BL = this.controlPoints[offset * i + j]
				BR = this.controlPoints[offset * i + (j + 1)]
				TR = this.controlPoints[offset * (i + 1) + (j + 1)]
				TL = this.controlPoints[offset * (i + 1) + j]
				this.grids.push(new Grid(BL, BR, TR, TL))
			}
		}
	
		console.log(this.grids)
		console.log(this.controlPoints)
	}

	//
	//
	//
	splitGrid() {
		var threshold = this.tg.opt.constant.splitThreshold
		var latM, lngM, idx
		var idxBM, idxRM, idxTM, idxLM, idxMM
		var newGrids = []
		
		this.controlPoints = this.tg.map.controlPoints
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
		//this.tg.map.updateLayers()

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

	drawLineOfGrid(arr, pt1, pt2) {
		this.mapUtil.addFeatureInFeatures(arr, 
			new ol.geom.LineString(
				[[pt1.target.lng, pt1.target.lat], [pt2.target.lng, pt2.target.lat]]), 
				this.mapUtil.lineStyleFunc(this.tg.opt.color.grid, this.tg.opt.width.grid))
	}

	drawGridLayer() {
		var arr = []

		this.mapUtil.removeLayer(this.gridLayer)

		for(var i = 0; i < this.grids.length; i++) {
			this.drawLineOfGrid(arr, this.grids[i].BL, this.grids[i].BR)
			this.drawLineOfGrid(arr, this.grids[i].BR, this.grids[i].TR)
			this.drawLineOfGrid(arr, this.grids[i].TR, this.grids[i].TL)
			this.drawLineOfGrid(arr, this.grids[i].TL, this.grids[i].BL)
		}
		
		this.gridLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.gridLayer.setZIndex(this.tg.opt.z.grid)
		this.olMap.addLayer(this.gridLayer)
	}

	removeGridLayer() {
		this.mapUtil.removeLayer(this.gridLayer)
	}
}