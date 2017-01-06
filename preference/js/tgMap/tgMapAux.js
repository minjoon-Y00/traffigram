class TGMapAux {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg
		this.olMap = olMap
		this.mapUtil = mapUtil

		this.centerPositionLayer = null
		this.controlPointLayer = null



	}

	//
	// center position layer
	//
	drawCenterPositionLayer() {
		var arr = []

		this.mapUtil.removeLayer(this.centerPositionLayer)

		this.mapUtil.addFeatureInFeatures(arr,
			new ol.geom.Point([this.tg.map.centerPosition.lng, this.tg.map.centerPosition.lat]), 
			this.mapUtil.imageStyleFunc(this.tg.opt.image.center))

		this.centerPositionLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.centerPositionLayer.setZIndex(this.tg.opt.z.centerPosition)
	  this.olMap.addLayer(this.centerPositionLayer)
	}

	removeCenterPositionLayer() {
		this.mapUtil.removeLayer(this.centerPositionLayer)
	}

	//
	// control point layer
	//
	drawControlPointLayer() {
		var pt = this.tg.map.controlPoints
		var arr = []
		var str = ''

		this.mapUtil.removeLayer(this.controlPointLayer)

		for(var i = 0; i < pt.length; i++) {
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([pt[i].target.lng, pt[i].target.lat]), 
				this.mapUtil.nodeStyleFunc(
					this.tg.opt.color.controlPoint, this.tg.opt.radius.controlPoint))

			if ((pt[i].target.lng != pt[i].original.lng) 
				|| (pt[i].target.lat != pt[i].original.lat)) {

				this.mapUtil.addFeatureInFeatures(arr, 
					new ol.geom.LineString(
						[[pt[i].original.lng, pt[i].original.lat], 
						[pt[i].target.lng, pt[i].target.lat]]), 
						this.mapUtil.lineStyleFunc(this.tg.opt.color.controlPointLine, 
						this.tg.opt.width.controlPointLine))
			}

			// text
			str = pt[i].travelTime
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([pt[i].target.lng, pt[i].target.lat]), 
				this.mapUtil.textStyleFunc(str, this.tg.opt.color.text, this.tg.opt.font.text))
		}

		this.controlPointLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.controlPointLayer.setZIndex(this.tg.opt.z.controlPoint)
	  this.olMap.addLayer(this.controlPointLayer)
	}

	removeControlPointLayer() {
		this.mapUtil.removeLayer(this.controlPointLayer)
	}

}

