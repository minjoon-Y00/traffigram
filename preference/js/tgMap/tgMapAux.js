class TGMapAux {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg
		this.olMap = olMap
		this.mapUtil = mapUtil

		this.centerPositionLayer = null
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

	
}

