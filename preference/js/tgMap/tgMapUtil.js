class TGMapUtil {
	constructor(tg, map) {
		this.tg = tg
		this.map = map // OL map

		this.lineStyle = this.lineStyleFunc;
		this.nodeStyle = this.nodeStyleFunc;
		this.polygonStyle = this.polygonStyleFunc;
		this.imageStyle = this.imageStyleFunc;
		this.textStyle = this.textStyleFunc;
		this.isochroneStyle = this.isochroneStyleFunc;
	}

	addFeatureInFeatures(arr, geometry, styleFunc) {
		var feature = new ol.Feature({geometry: geometry})
		feature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
		feature.setStyle(styleFunc)		
		arr.push(feature)
	}

	isInTheBox(lat, lng) {
		var box = this.tg.opt.box

		if ((lat < box.top) && (lat > box.bottom) && (lng < box.right)	&& (lng > box.left))
			return true
		else
			return false
	}

	printElapsedTime(times, type) {
		var str = type + ' : '
		if (times[type].elapsed != undefined) {
			str += times[type].elapsed + ' ms.'
		}
		else {
			str += (times[type].end - times[type].start) + ' ms.'
		}
		console.log(str)
	}

	addLayer(layer) {
		if (layer) {
			this.map.addLayer(layer);
		}
	}

	removeLayer(layer) {
		if (layer) {
			this.map.removeLayer(layer);
			layer = null;
		}
	}

	removeAllLayers() {
		this.map.getLayers().clear();
	}

	olVectorFromFeatures(arr) {
		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		})
	}


	lineStyleFunc(color, width) {
		return new ol.style.Style({
	  	stroke: new ol.style.Stroke({
	  		color: color,
	  		width: width
	  	})
	 	})
	}

	nodeStyleFunc(color, radius) {
		return new ol.style.Style({
	    image: new ol.style.Circle({
	    	radius: radius,
	    	fill: new ol.style.Fill({
	      	color: color
	    	})
	    })
		})
	}

	polygonStyleFunc(color) {
		return new ol.style.Style({
	  	fill: new ol.style.Fill({
	    	color: color
	  	})
	 	})
	}

	imageStyleFunc(src, xPixel = 0.5) {
		return new ol.style.Style({
			image: new ol.style.Icon({
	  		src: src,
	  		//anchor: [0.5, 0.5],
      	//anchorXUnits: 'pixels'
			})
		})
	}

	textStyleFunc(text, color, font, offsetX = 0, offsetY = 0) {
	  return new ol.style.Style({
	  	text: new ol.style.Text({
	    	textAlign: 'center',
	    	font: font,
	    	text: text,
	    	fill: new ol.style.Fill({color: color}),
	    	offsetX: offsetX,
	    	offsetY: offsetY,
	    })
	  });
	}

	isochroneStyleFunc(radius, color, width) {
	  return new ol.style.Style({
	    image: new ol.style.Circle({
	      radius: radius,
	      stroke: new ol.style.Stroke({
	        color: color,
	        width: width,
	      })
	    })
	  });
	}




}