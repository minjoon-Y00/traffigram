class simpleMap {
	constructor() {
		this.initZoom = 13; // or 14
		this.colorOrg = 'rgba(0, 0, 0, 0.5)';
		this.colorGridS = 'rgba(0, 255, 0, 0.5)';
		this.colorGridT = 'rgba(0, 0, 255, 0.5)';
		this.colorGridR = 'rgba(255, 0, 0, 0.5)';
		this.colorIsochrone = 'rgba(0, 0, 0, 0.2)',
		this.radiusOrg = 5;
		this.widthGridS = 2;
		this.widthGridT = 2;
		this.widthGridR = 3;
		this.widthIsochrone = 3;
		this.zOrg = 10;
		this.zGrid = 2;
		this.zIsochrone = 5;

		this.map;
		this.pts;
		this.org;
		this.baseMapLayer;

		// disp base map
		this.map = new ol.Map({
	  	target: 'map',
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([org.lng, org.lat]),
	      zoom: this.initZoom,
	    })
	  });
	}

	init(org, points) {
		// pts is points for map
	  this.pts = JSON.parse(JSON.stringify(points));
	  this.org = org;
	  const orgObj = {o: org, t: org, r: org, time: 0};
	  this.pts.splice(12, 0, orgObj);
	}

	dispBaseMap() {
		this.baseMapLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
	  this.map.addLayer(this.baseMapLayer);
	}

	dispGrid() {
		let arr = [];

		for(let i = 0; i < this.pts.length; ++i) {
			const c = i % 5;
			const r = parseInt(i / 5);

			if (c != 4) {
				// pt.o (S) grid
				this.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[this.pts[i].o.lng, this.pts[i].o.lat], [this.pts[i + 1].o.lng, this.pts[i + 1].o.lat]]), 
					this.lineStyle(this.colorGridS, this.widthGridS));
				// pt.t (T) grid
				this.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[this.pts[i].t.lng, this.pts[i].t.lat], [this.pts[i + 1].t.lng, this.pts[i + 1].t.lat]]), 
					this.lineStyle(this.colorGridT, this.widthGridT));
				// pt.r (R) grid
				if ((this.pts[i].r) && (this.pts[i + 1].r)) {
					this.addFeatureInFeatures(arr, new ol.geom.LineString(
						[[this.pts[i].r.lng, this.pts[i].r.lat], [this.pts[i + 1].r.lng, this.pts[i + 1].r.lat]]), 
						this.lineStyle(this.colorGridR, this.widthGridR));
				}
			}
			if (r != 4) {
				// pt.o (S) grid
				this.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[this.pts[i].o.lng, this.pts[i].o.lat], [this.pts[i + 5].o.lng, this.pts[i + 5].o.lat]]), 
					this.lineStyle(this.colorGridS, this.widthGridS));
				// pt.t (T) grid
				this.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[this.pts[i].t.lng, this.pts[i].t.lat], [this.pts[i + 5].t.lng, this.pts[i + 5].t.lat]]), 
					this.lineStyle(this.colorGridT, this.widthGridT));
				// pt.r (R) grid
				if ((this.pts[i].r) && (this.pts[i + 5].r)) {
					this.addFeatureInFeatures(arr, new ol.geom.LineString(
						[[this.pts[i].r.lng, this.pts[i].r.lat], [this.pts[i + 5].r.lng, this.pts[i + 5].r.lat]]), 
						this.lineStyle(this.colorGridR, this.widthGridR));
				}
			}
		}
		this.gridLayer = this.olVectorFromFeatures(arr);
		this.gridLayer.setZIndex(this.zGrid);
	  this.map.addLayer(this.gridLayer);
	}

	dispIsochrone(isoArr) {
		let arr = [];

		for(let min of isoArr) {
			const radiusPx = min * meterPerMin * pxPerM;

			console.log(min + ' ' + (min * meterPerMin) + ' ' + radiusPx);

			// circle
			this.addFeatureInFeatures(
				arr, new ol.geom.Point(
					[this.org.lng, this.org.lat]),
					this.isochroneStyle(radiusPx, 
						this.colorIsochrone, this.widthIsochrone));
		}

		this.isochroneLayer = this.olVectorFromFeatures(arr);
		this.isochroneLayer.setZIndex(this.zIsochrone);
	  this.map.addLayer(this.isochroneLayer);
	}

	// utility functions
	addFeatureInFeatures(arr, geometry, styleFunc) {
		let feature = new ol.Feature({geometry: geometry});
		feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		feature.setStyle(styleFunc);
		arr.push(feature);
		return feature;
	}

	nodeStyle(color, radius) {
		return new ol.style.Style({
	    image: new ol.style.Circle({
	    	radius: radius,
	    	fill: new ol.style.Fill({
	      	color: color
	    	})
	    })
		})
	}

	lineStyle(color, width) {
		return new ol.style.Style({
	  	stroke: new ol.style.Stroke({
	  		color: color,
	  		width: width
	  	})
	 	})
	}

	isochroneStyle(radius, color, width) {
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

	olVectorFromFeatures(arr) {
		return new ol.layer.Vector({
	  	source: new ol.source.Vector({
	      	features: arr
	  	})
		})
	}
}



function dispOrg() {
	let arr = [];
	// origin (center) point
	addFeatureInFeatures(arr, new ol.geom.Point([org.lng, org.lat]), 
		nodeStyle(colorOrg, radiusOrg));
	const layer = olVectorFromFeatures(arr);
	layer.setZIndex(zOrg);
  map.addLayer(layer);
}



function dispCtrlPts() {
	let arr = [];

	for(let pt of pts) {
		// pt.o (S) control points
		addFeatureInFeatures(arr, new ol.geom.Point([pt.o.lng, pt.o.lat]), 
			nodeStyle(colorCtlPtsS, radiusCtlPtsS));
		// pt.t (T) control points
		addFeatureInFeatures(arr, new ol.geom.Point([pt.t.lng, pt.t.lat]), 
			nodeStyle(colorCtlPtsT, radiusCtlPtsT));	
	}
	const layer = olVectorFromFeatures(arr);
	layer.setZIndex(zCtlPts);
  map.addLayer(layer);
}



