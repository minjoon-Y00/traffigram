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
		try {
			const len = arr.length / 2;
			let coords = new Array(len);
			for(let i = 0; i < len; ++i) {
				coords[i] = ol.proj.transform(
					[arr[2 * i], arr[2 * i + 1]], 'EPSG:3857', 'EPSG:4326'
				);
			}
			return coords;
		}
		catch(err) {
			console.log(err);
			console.log(arr);
		}
	}

	calMultiCoords(feature) {
		const len = feature.ends_.length;
		let coords = new Array(len);
		for(let i = 0; i < len; ++i) {
			//feature.ends_[i] // [20, 28]
			//const s = (i === 0) ? 0 : feature.flatCoordinates_[i - 1];
			const s = (i === 0) ? 0 : feature.ends_[i - 1];
			coords[i] = this.calCoords(feature.flatCoordinates_.slice(s, feature.ends_[i]));
		}		
		return coords;
	}

	parser(feature, resolution) {

    const layer = feature.get('layer');

    if ((layer !== 'water') && (layer !== 'waterway') && 
    		(layer !== 'road') && (layer !== 'bridge') && 
    		(layer !== 'landuse')) return;
    
		const geoType = feature.getGeometry().getType();
		let coords = null;

		//console.log(feature.getGeometry());

		if (geoType === 'Polygon') {

			if (feature.ends_.length === 1) {
				coords = [this.calCoords(feature.flatCoordinates_)];
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

			coords = this.calCoords(feature.flatCoordinates_);
			for(let i = 0; i < coords.length; i++) {
				coords[i].node = new TgNode(coords[i][1], coords[i][0]);
			}

			coords.orgFeature = new ol.Feature({geometry: new ol.geom.LineString(coords)});
			coords.geo = 'ls';

    }
    else {
    	console.log(geoType);
    }

    // add to each module
    if (coords) {
			const zoom = this.data.zoom.current;
    	const type = feature.get('class');


    	coords.orgFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			coords.dispMode = 1; // original
			//coords.realFeature = null;

			//if ((layer === 'water')||(layer === 'waterway'))
			if (layer === 'water')
				this.map.tgWater.addWaterObjects(zoom, coords);
			else if ((layer === 'road')||(layer === 'bridge')) {
				//console.log(type + ' : '  + feature.properties_.type);
				// motorway, trunk, 
				// primary, secondary, tertiary, residential
				// pedestrian, living_street, service
				// motorway_link, trunk_link, primary_link, secondary_link, tertiary_link, 
				this.map.tgRoads.addRoadObjects(feature.properties_.type, zoom, coords);
				//this.map.tgRoads.addRoadObjects(type, zoom, coords);
			}
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