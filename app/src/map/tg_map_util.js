class TgMapUtil {
	constructor(data, map) {
		this.data = data;
		this.map = map; // OL map

		this.lineStyle = this.lineStyleFunc;
		this.nodeStyle = this.nodeStyleFunc;
		this.polygonStyle = this.polygonStyleFunc;
		this.imageStyle = this.imageStyleFunc;
		this.textStyle = this.textStyleFunc;
		this.isochroneStyle = this.isochroneStyleFunc;
	}

	addFeatureInFeatures(arr, geometry, styleFunc, type, source) {
		let feature = new ol.Feature({geometry: geometry});
		feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		feature.setStyle(styleFunc);
		if (type) feature.type = type;
		if (source) feature.source = source;
		arr.push(feature);
		
		return feature;
	}

	isInTheBox(lat, lng) {
		var box = this.data.box;

		if ((lat < box.top) && (lat > box.bottom) && (lng < box.right)	&& (lng > box.left))
			return true;
		else
			return false;
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

	imageStyleFunc(src, opacity = 1.0) {
		return new ol.style.Style({
			image: new ol.style.Icon({
	  		src: src,
	  		opacity: opacity,
	  		//anchor: [0.5, 0.5],
      	//anchorXUnits: 'pixels'
			})
		})
	}

	textStyleFunc(param) {
		let textOptions = {};
		const color = param.color || '#F00';
		let strokeColor = null;
		let strokeWidth = 2;

		textOptions.fill = new ol.style.Fill({color: color});
		textOptions.font = param.font || '16pt Source Sans Pro';
		textOptions.text = param.text || 'unknown';
		textOptions.textAlign = param.align || 'center';

		if (param.offsetX) textOptions.offsetX = param.offsetX;
		if (param.offsetY) textOptions.offsetY = param.offsetY;
		if (param.strokeColor) strokeColor = param.strokeColor;
		if (param.strokeWidth) strokeWidth = param.strokeWidth;
		if (strokeColor) textOptions.stroke = 
				new ol.style.Stroke({color: strokeColor, width: strokeWidth});

	  return new ol.style.Style({
	  	text: new ol.style.Text(textOptions)
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

module.exports = TgMapUtil;