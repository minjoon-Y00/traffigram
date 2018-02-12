class TgMapVectorTile {
	constructor(map, data) {
		this.map = map;
		this.data = data;
		this.mapUtil = map.mapUtil;

		this.timerVectorTile = null;
	}

	init() {
		const waterSource = new ol.source.VectorTile({
      format: new ol.format.MVT(),
      //url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
      //    '{z}/{x}/{y}.vector.pbf?access_token=' + key
      url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
          '{z}/{x}/{y}.mvt?access_token=' + this.data.var.apiKeyVectorTile
    });

		this.mapUtil.addLayer(new ol.layer.VectorTile({
		  source: waterSource,
		  style: this.parser.bind(this)
		}));
	}

	calCoords(arr) {
		const len = arr.length / 2;
		let coords = new Array(len);
		for(let i = 0; i < len; ++i) {
			coords[i] = ol.proj.transform(
				[arr[2 * i], arr[2 * i + 1]], 'EPSG:3857', 'EPSG:4326'
			);
		}
		return coords;
	}

	calMultiCoords(feature) {
		const len = feature.g.length;
		let coords = new Array(len);
		for(let i = 0; i < len; ++i) {
			//feature.g[i] // [20, 28]
			const s = (i === 0) ? 0 : feature.g[i - 1];
			coords[i] = this.calCoords(feature.b.slice(s, feature.g[i]));
		}		
		return coords;
	}

	parser(feature, resolution) {

    const layer = feature.get('layer');

    if ((layer !== 'water') && (layer !== 'waterway') && 
    		(layer !== 'road') && (layer !== 'bridge') && 
    		(layer !== 'landuse')) return;
    
    //if (layer !== 'waterway') return;
    //if (layer !== 'road') return;
   // if (layer !== 'landuse') return;

		const geoType = feature.getGeometry().getType();
		let coords = null;

		//console.log(geoType);

		if (geoType === 'Polygon') {
			
			if (feature.g.length === 1) {
				coords = [this.calCoords(feature.b)];
			}
			else {
				coords = this.calMultiCoords(feature);
			}

			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}

			coords.orgFeature = new ol.Feature({geometry: new ol.geom.Polygon(coords)});
			coords.geo = 'p';
    }
    else if (geoType === 'MultiLineString') {

			coords = this.calMultiCoords(feature);
			for(let i = 0; i < coords.length; i++) {
				for(let j = 0; j < coords[i].length; j++) {
					coords[i][j].node = new TgNode(coords[i][j][1], coords[i][j][0]);
				}
			}

			coords.orgFeature = new ol.Feature({geometry: new ol.geom.MultiLineString(coords)});
			coords.geo = 'mls'
    }
    else if (geoType === 'LineString') {

			coords = this.calCoords(feature.b);
			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new TgNode(coords[i][1], coords[i][0]);
			}

			coords.orgFeature = new ol.Feature({geometry: new ol.geom.LineString(coords)});
			coords.geo = 'ls'
    }

    // add to each module
    if (coords) {
			const zoom = this.data.zoom.current;
    	const type = feature.get('class');


    	coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			coords.dispMode = 1; // original
			//coords.realFeature = null;

			if ((layer === 'water')||(layer === 'waterway'))
				this.map.tgWater.addWaterObjects(zoom, coords);
			else if ((layer === 'road')||(layer === 'bridge'))
				this.map.tgRoads.addRoadObjects(type, zoom, coords);
			else if (layer === 'landuse')
				this.map.tgLanduse.addObject(type, coords);
    }

    // timer

    if (this.timerVectorTile) clearTimeout(this.timerVectorTile);
		this.timerVectorTile = setTimeout(
				this.processNewObjects.bind(this), 
				this.data.time.waitForGettingVectorTile);

		if (this.map.timerCheckGridSplitInTgMap) {
			clearTimeout(this.map.timerCheckGridSplitInTgMap);
		}

		return null;
	}

	processNewObjects() {
		this.map.tgWater.processNewWaterObjects();
		this.map.tgRoads.processNewRoadObjects();
		this.map.tgLanduse.processNewLanduseObjects();
	}


}