class TGMapLocs {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg
		this.olMap = olMap
		this.mapUtil = mapUtil

		this.locations = {japanese:uw_japanese, french:uw_french}
	  this.locationType = 'japanese' //'french'
	  this.localLocations
		this.locationLayer = null
	}

	calLocalLocations() {
		var locs = this.locations[this.locationType]
		var len = locs.length
		var lng, lat

		this.localLocations = []

		for(var i = 0; i < len; i++) {
			lat = Number(locs[i].loc_y)
			lng = Number(locs[i].loc_x)

			if ((lat < this.tg.opt.box.top) && (lat > this.tg.opt.box.bottom) 
				&& (lng < this.tg.opt.box.right)	&& (lng > this.tg.opt.box.left)) {
				this.localLocations.push(new Node(lat, lng))
			}
		}
		//console.log(this.localLocations.length)

	}

	drawLocationLayer() {
		var locs = this.localLocations
		var arr = []

		this.mapUtil.removeLayer(this.locationLayer)

		for(var i = 0; i < locs.length; i++) {
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([locs[i].target.lng, locs[i].target.lat]), 
				this.mapUtil.nodeStyleFunc(
					this.tg.opt.color.location, this.tg.opt.radius.location))
				//this.mapUtil.imageStyleFunc(this.tg.opt.image.location))

			if ((locs[i].target.lng != locs[i].original.lng) 
				|| (locs[i].target.lat != locs[i].original.lat)) {

				this.mapUtil.addFeatureInFeatures(arr, 
					new ol.geom.LineString(
						[[locs[i].original.lng, locs[i].original.lat], 
						[locs[i].target.lng, locs[i].target.lat]]), 
						this.mapUtil.lineStyleFunc(this.tg.opt.color.locationLine, 
						this.tg.opt.width.locationLine))
			}
		}

		this.locationLayer = this.mapUtil.olVectorFromFeatures(arr)
		this.locationLayer.setZIndex(this.tg.opt.z.location)
	  this.olMap.addLayer(this.locationLayer)
	}

	removeLocationLayer() {
		this.mapUtil.removeLayer(this.locationLayer)
	}
}

