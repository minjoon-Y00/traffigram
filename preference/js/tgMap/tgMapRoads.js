class TGMapRoads {
	constructor(tg, map, mapUtil) {
		this.tg = tg
		this.olMap = map
		this.mapUtil = mapUtil

		this.roadNodeLayer = null
		this.roadLayer = null
	  this.roadTypes = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']
	  this.roadObject = {}
	  this.dispRoads = {}
  	this.timerGetRoadData = null

  	for(var i = 0; i < this.roadTypes.length; i++) {
			this.roadObject[this.roadTypes[i]] = []
		}

	}

	start() {
		var roadSource = new ol.source.VectorTile({
	    format: new ol.format.TopoJSON(),
	    projection: 'EPSG:3857',
	    tileGrid: new ol.tilegrid.createXYZ({maxZoom: 22}),
	    url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?' 
	    	+ 'api_key=vector-tiles-c1X4vZE'
	  })

		this.olMap.addLayer(new ol.layer.VectorTile({
		  source: roadSource,
		  style: this.addToRoadObject.bind(this)
		}))
	}

	resetTimes() {
		this.times = {
			'getRoadData':{'start':(new Date()).getTime(), 'end':0},
  		'calRoadData':{'elapsed':0},
  		'drawRoads':{'start':0, 'end':0}
  	}
	}

	addToRoadObject(feature, resolution) {

		//console.log('-')

		if (this.timerGetRoadData) clearTimeout(this.timerGetRoadData)
		this.timerGetRoadData = setTimeout(this.calDispRoads.bind(this), 
			this.tg.opt.constant.timeToWaitForGettingRoadData)

		var kind = feature.get('kind')

		// only highway and major_road are considered.
		if ((kind != 'highway')&&(kind != 'major_road')) return null

		var kind_detail = feature.get('kind_detail')

		// only types we want to consider are passed.
		if (this.roadTypes.indexOf(kind_detail) < 0) return null

		var geoType = feature.getGeometry().getType()

		//console.log(kind + ' - ' + kind_detail + ' : ' + geoType)

		feature.getGeometry().transform('EPSG:3857', 'EPSG:4326')

		var coords = feature.getGeometry().getCoordinates()
		var lenCoords = coords.length
		var obj = {'geoType':geoType, 'kind':kind_detail,
			'coordinates':new Array(lenCoords), 'visible':true}

		if (geoType == 'LineString') {
			for(var i = 0; i < lenCoords; i++) {
				obj.coordinates[i] = new Node(coords[i][1], coords[i][0])
			}
		}
		else if (geoType == 'MultiLineString') {
			for(var i = 0; i < lenCoords; i++) {
				obj.coordinates[i] = new Array(coords[i].length)

				for(var j = 0; j < coords[i].length; j++) {
					obj.coordinates[i][j] = new Node(coords[i][j][1], coords[i][j][0])
				}
			}
		}

		this.roadObject[kind_detail].push(obj)	

		return null
	}

	calDispRoads() {

		console.log('finish getting road data.')
		
		var s = (new Date()).getTime()
		this.times.getRoadData.end = s
		for(var i = 0; i < this.roadTypes.length; i++) {
			this.dispRoads[this.roadTypes[i]] = []
		}

		for(var kind in this.roadObject) {
			for(var i = 0; i < this.roadObject[kind].length; i++) {
				var geoType = this.roadObject[kind][i].geoType
				var coords = this.roadObject[kind][i].coordinates
				var obj = {'geoType':geoType, 'coordinates':new Array(coords.length)}

				if (geoType == 'LineString') {
					for(var j = 0; j < coords.length; j++) {
						obj.coordinates[j] = [coords[j].original.lng, coords[j].original.lat]
					}
				} 
				else if (geoType == 'MultiLineString') {
					for(var j = 0; j < coords.length; j++) {
						obj.coordinates[j] = new Array(coords[j].length)

						for(var k = 0; k < coords[j].length; k++) {
							obj.coordinates[j][k] 
								= [coords[j][k].original.lng, coords[j][k].original.lat]
						}
					}
				}
				this.dispRoads[kind].push(obj)
			}
		}

		this.times.calRoadData.elapsed += (new Date()).getTime() - s

		//console.log('# of dispRoads : ' + this.dispRoads.length)


		this.addRoadLayer()
		//this.addRoadNodeLayer()
	}

	//
	addRoadLayer() {
		this.times.drawRoads.start = (new Date()).getTime()
		var arr = []
		var styleFunc

		this.mapUtil.removeLayer(this.roadLayer)

		for(var kind in this.dispRoads) {
			styleFunc = this.mapUtil.lineStyleFunc(
				this.tg.opt.color.road[kind], this.tg.opt.width.road[kind])

			for(var i = 0; i < this.dispRoads[kind].length; i++) {

				//if (!this.dispRoads[kind][i].visible) {
				//	console.log('not visible.')
				//	continue
				//}

				if (this.dispRoads[kind][i].geoType == 'LineString') {
					this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.LineString(this.dispRoads[kind][i].coordinates), styleFunc)
				}
				else if (this.dispRoads[kind][i].geoType == 'MultiLineString') {
					this.mapUtil.addFeatureInFeatures(arr,
						new ol.geom.MultiLineString(this.dispRoads[kind][i].coordinates), styleFunc)
				}
			}
		}

		console.log(arr.length)

		this.roadLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.roadLayer.setZIndex(this.tg.opt.z.road)
		this.olMap.addLayer(this.roadLayer)
		this.times.drawRoads.end = (new Date()).getTime()

		// Display time
		this.mapUtil.printElapsedTime(this.times, 'getRoadData')
		this.mapUtil.printElapsedTime(this.times, 'calRoadData')
		this.mapUtil.printElapsedTime(this.times, 'drawRoads')
	}

	addRoadNodeLayer() {

		if (this.roadNodeLayer) 
			this.olMap.removeLayer(this.roadNodeLayer)

		var arr = []
		var clrMinor = '#333'
		var clrMajor = '#F33'
		var radiusMinor = 1
		var radiusMajor = 2
		var eps = 0.0001

		var originalNodeCount = 0


		for(var kind in this.roadObject) {
			var roadObj = this.roadObject[kind]

			for(var i = 0; i < roadObj.length; i++) {
				var geoType = roadObj[i].geoType
				var coords = roadObj[i].coordinates

				if (geoType == 'LineString') {

					originalNodeCount += coords.length
					coords = this.tg.util.RDPSimp(coords, eps)

					this.olFeaturesFromPoints(arr, 
						coords[0].original.lng, 
						coords[0].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					this.olFeaturesFromPoints(arr, 
						coords[coords.length - 1].original.lng, 
						coords[coords.length - 1].original.lat, 
						this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

					for(var k = 1; k < coords.length - 1; k++) {
						this.olFeaturesFromPoints(arr, 
							coords[k].original.lng, 
							coords[k].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))

					}
				}
				else if (geoType == 'MultiPolygon') {
					for(var j = 0; j < coords.length; j++) {

						originalNodeCount += coords[j].length
						coords[j] = this.tg.util.RDPSimp(coords[j], eps)

						this.olFeaturesFromPoints(arr, 
							coords[j][0].original.lng, 
							coords[j][0].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

						this.olFeaturesFromPoints(arr, 
							coords[j][coords[j].length - 1].original.lng, 
							coords[j][coords[j].length - 1].original.lat, 
							this.mapUtil.nodeStyleFunc(clrMajor, radiusMajor))

						for(var k = 1; k < coords[j].length - 1; k++) {
							this.olFeaturesFromPoints(arr, 
								coords[j][k].original.lng, 
								coords[j][k].original.lat, 
								this.mapUtil.nodeStyleFunc(clrMinor, radiusMinor))
						}
					}
				}
			
			}
		}
		


		console.log('# of original road node: ' + originalNodeCount)
		console.log('# of roadNode : ' + arr.length)

		this.roadNodeLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
		    features: arr
			})
		})

		this.roadNodeLayer.setZIndex(this.tg.opt.z.roadNode)
		this.olMap.addLayer(this.roadNodeLayer)


	}
}
