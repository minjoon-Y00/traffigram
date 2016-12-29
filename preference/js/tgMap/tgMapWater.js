class TGMapWater {
	constructor(tg, map, mapUtil) {
		this.tg = tg
		this.map = map // OL map
		this.mapUtil = mapUtil
  	
	  this.waterObject = []
	  this.dispWater
  	this.timerGetWaterData = null

	}

	start() {
		var waterSource = new ol.source.VectorTile({
		  format: new ol.format.TopoJSON(),
		  projection: 'EPSG:3857',
		  tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
		  url: 'https://tile.mapzen.com/mapzen/vector/v1/water/{z}/{x}/{y}.topojson?' 
		    + 'api_key=vector-tiles-c1X4vZE'
		})

		this.map.addLayer(new ol.layer.VectorTile({
		  source: waterSource,
		  style: this.addToWaterObject.bind(this)
		}))
	}

	resetTimes() {
		this.times = {
  		'getWaterData':{'start':(new Date()).getTime(), 'end':0},
  		'calWaterData':{'elapsed':0},
  		'drawWater':{'start':0, 'end':0}
  	}
	}

	/*calVisibility() {
		var geoType, coords, lenCoords, isIn
		for(var i = 0; i < this.waterObject.length; i++) {
			geoType = this.waterObject[i].geoType
			coords = this.waterObject[i].coordinates
			lenCoords = coords.length
			isIn = false

			if (geoType == 'Polygon') {
				for(var i = 0; i < lenCoords; i++) {
					for(var j = 0; j < coords[i].length; j++) {
						isIn = this.mapUtil.isInTheBox(coords[i][j][1], coords[i][j][0])
						if (isIn) break 
					}
					if (isIn) break 
				}
			}
			else if (geoType == 'MultiPolygon') {
				for(var i = 0; i < lenCoords; i++) {
					for(var j = 0; j < coords[i].length; j++) {
						for(var k = 0; k < coords[i][j].length; k++) {
							isIn = this.mapUtil.isInTheBox(coords[i][j][k][1], coords[i][j][k][0])
							if (isIn) break 
						}
						if (isIn) break 
					}
					if (isIn) break 
				}
			}

			if (!isIn) this.waterObject[i].visible = false
		}
	}*/

	addToWaterObject(feature, resolution) {

		console.log('.')

		if (this.timerGetWaterData) clearTimeout(this.timerGetWaterData)
		this.timerGetWaterData = setTimeout(this.calDispWater.bind(this), 
			this.tg.opt.constant.timeToWaitForGettingWaterData)

		var geoType = feature.getGeometry().getType()

		// ignores LineString, Point, ...
		if ((geoType == 'Polygon')||(geoType == 'MultiPolygon')) {

			var kind = feature.get('kind')

			// ignores dock, swimming_pool
			// so water, ocean, riverbank, and lake are considered.
			if ((kind == 'dock')||(kind == 'swimming_pool')) return null

			feature.getGeometry().transform('EPSG:3857', 'EPSG:4326')

			var coords = feature.getGeometry().getCoordinates()
			var lenCoords = coords.length
			var obj = {'geoType':geoType, 'kind':kind, 
				'coordinates':new Array(lenCoords), 'visible':true}
			//var isIn = false

			if (geoType == 'Polygon') {
				for(var i = 0; i < lenCoords; i++) {
					obj.coordinates[i] = new Array(coords[i].length)

					for(var j = 0; j < coords[i].length; j++) {
						obj.coordinates[i][j] = new Node(coords[i][j][1], coords[i][j][0])
						//if (!isIn) isIn = this.mapUtil.isInTheBox(coords[i][j][1], coords[i][j][0])
					}
				}
			}
			else if (geoType == 'MultiPolygon') {
				for(var i = 0; i < lenCoords; i++) {
					obj.coordinates[i] = new Array(coords[i].length)

					for(var j = 0; j < coords[i].length; j++) {
						obj.coordinates[i][j] = new Array(coords[i][j].length)

						for(var k = 0; k < coords[i][j].length; k++) {
							obj.coordinates[i][j][k] = new Node(coords[i][j][k][1], coords[i][j][k][0])
							//if (!isIn) isIn = this.mapUtil.isInTheBox(coords[i][j][k][1], coords[i][j][k][0])
						}
					}
				}
			}

			//if (!isIn) obj.visible = false

			this.waterObject.push(obj)			
		}

		return null
	}

	calDispWater() {

		console.log('finish getting water data.')
		
		var s = (new Date()).getTime()
		this.times.getWaterData.end = s
		this.dispWater = []

		for(var i = 0; i < this.waterObject.length; i++) {

			//if (!this.waterObject[i].visible) continue

			var geoType = this.waterObject[i].geoType
			var coords = this.waterObject[i].coordinates
			var obj = {'geoType':geoType, 'coordinates':new Array(coords.length)}

			if (geoType == 'Polygon') {
				for(var j = 0; j < coords.length; j++) {
					obj.coordinates[j] = new Array(coords[j].length)

					for(var k = 0; k < coords[j].length; k++) {
						obj.coordinates[j][k] 
							= [coords[j][k].original.lng, coords[j][k].original.lat]
					}
				}
			} 
			else if (geoType == 'MultiPolygon') {
				for(var j = 0; j < coords.length; j++) {
					obj.coordinates[j] = new Array(coords[j].length)

					for(var k = 0; k < coords[j].length; k++) {
						obj.coordinates[j][k] = new Array(coords[j][k].length)

						for(var l = 0; l < coords[j][k].length; l++) {
							obj.coordinates[j][k][l] 
								= [coords[j][k][l].original.lng, coords[j][k][l].original.lat]
						}
					}
				}
			}
			this.dispWater.push(obj)
		}


		this.times.calWaterData.elapsed += (new Date()).getTime() - s

		console.log('# waterObject : ' +  this.waterObject.length)
		console.log('# of dispWater : ' + this.dispWater.length)
		//console.log(this.tg.data.localWater)
		//console.log(this.dispWater)

		this.addWaterLayer()
		//this.addWaterNodeLayer()
	}

	//
	addWaterLayer() {
		this.times.drawWater.start = (new Date()).getTime()
		var arr = []
		var styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.water)

		this.mapUtil.removeLayer(this.map.waterLayer)

		for(var i = 0; i < this.dispWater.length; i++) {
			if (this.dispWater[i].geoType == 'Polygon') {
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Polygon(this.dispWater[i].coordinates), styleFunc)
			}
			else if (this.dispWater[i].geoType == 'MultiPolygon') {
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.MultiPolygon(this.dispWater[i].coordinates), styleFunc)
			}
		}


		this.map.waterLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.map.waterLayer.setZIndex(this.tg.opt.z.water)
		this.map.addLayer(this.map.waterLayer)
		this.times.drawWater.end = (new Date()).getTime()

		// Display time
		this.mapUtil.printElapsedTime(this.times, 'getWaterData')
		this.mapUtil.printElapsedTime(this.times, 'calWaterData')
		this.mapUtil.printElapsedTime(this.times, 'drawWater')
	}


	

	addWaterNodeLayer() {

		if (this.map.waterNodeLayer) 
			this.map.removeLayer(this.map.waterNodeLayer)

		var arr = []
		var clrMinor = '#333'
		var clrMajor = '#F33'
		var radiusMinor = 1
		var radiusMajor = 2
		var eps = 0.0001

		var originalNodeCount = 0


		for(var i = 0; i < this.waterObject.length; i++) {
			var geoType = this.waterObject[i].geoType

			if (geoType == 'Polygon') {
				for(var j = 0; j < this.waterObject[i].coordinates.length; j++) {
					originalNodeCount += this.waterObject[i].coordinates[j].length

					var nodes = this.waterObject[i].coordinates[j]
					var pivot = nodes[0]
					var max = -987654321
					var maxK = 0
					for(var k = 1; k < nodes.length; k++) {
						var d = tg.util.D2_s(nodes[0].original.lat, nodes[0].original.lng, 
							nodes[k].original.lat, nodes[k].original.lng)
						if (d > max) {
							max = d
							maxK = k
						}
					}

					var arr1 = this.waterObject[i].coordinates[j].slice(0, maxK + 1)
					var arr2 = this.waterObject[i].coordinates[j].slice(maxK, nodes.length)

					var simple_arr1 = this.tg.util.RDPSimp(arr1, eps)
					var simple_arr2 = this.tg.util.RDPSimp(arr2, eps)
					simple_arr1.pop()
					//this.waterObject[i].coordinates[j] = simple_arr1.concat(simple_arr2)


					//console.log('maxK = ' + maxK + ' , len = ' + nodes.length) // 42, 63
					//console.log(this.waterObject[i].coordinates[j])
					//break

					this.olFeaturesFromPoints(arr, 
						this.waterObject[i].coordinates[j][0].original.lng, 
						this.waterObject[i].coordinates[j][0].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					this.olFeaturesFromPoints(arr, 
						this.waterObject[i].coordinates[j][this.waterObject[i].coordinates[j].length - 1].original.lng, 
						this.waterObject[i].coordinates[j][this.waterObject[i].coordinates[j].length - 1].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					for(var k = 1; k < this.waterObject[i].coordinates[j].length - 1; k++) {
						this.olFeaturesFromPoints(arr, 
							this.waterObject[i].coordinates[j][k].original.lng, 
							this.waterObject[i].coordinates[j][k].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))
					}
				}
			} 
			else if (geoType == 'MultiPolygon') {
				for(var j = 0; j < this.waterObject[i].coordinates.length; j++) {
					for(var k = 0; k < this.waterObject[i].coordinates[j].length; k++) {
						originalNodeCount += this.waterObject[i].coordinates[j][k].length

						this.waterObject[i].coordinates[j][k] 
							= this.tg.util.RDPSimp(this.waterObject[i].coordinates[j][k], eps)

						this.olFeaturesFromPoints(arr, 
							this.waterObject[i].coordinates[j][k][0].original.lng, 
							this.waterObject[i].coordinates[j][k][0].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

						this.olFeaturesFromPoints(arr, 
							this.waterObject[i].coordinates[j][k][this.waterObject[i].coordinates[j][k].length - 1].original.lng, 
							this.waterObject[i].coordinates[j][k][this.waterObject[i].coordinates[j][k].length - 1].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))


						for(var l = 1; l < this.waterObject[i].coordinates[j][k].length - 1; l++) {
							this.olFeaturesFromPoints(arr, 
								this.waterObject[i].coordinates[j][k][l].original.lng, 
								this.waterObject[i].coordinates[j][k][l].original.lat, 
								this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))
						}
					}
				}
			}
		}

		console.log('# of original node: ' + originalNodeCount)
		console.log('# of waterNode : ' + arr.length)

		this.map.waterNodeLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
		    features: arr
			})
		})

		this.map.waterNodeLayer.setZIndex(1) // z-index of water node is 1
		this.map.addLayer(this.map.waterNodeLayer)




	}




}