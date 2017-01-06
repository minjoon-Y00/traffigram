
onClicked(e) {
		var pt = ol.proj.transform([e.coordinate[0], e.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
		var clickedLat = pt[1];
		var clickedLng = pt[0];

		/*
		var edges = this.tg.data['level' + this.NetworkLevel].edges;
		var nodes = this.net.calNodes(edges);

		var found = false;
		for(var i = 0; i < nodes.length; i++) {

			if ((Math.abs(nodes[i].lat - clickedLat) <= this.clickRange.lat)
				&&(Math.abs(nodes[i].lng - clickedLng) <= this.clickRange.lng)) {
				//console.log(i);
				this.dispNodeText(i);
				this.selectedNodeID = i;
				found = true;
				break;
			}

			if (!found) {
				this.dispNodeText(-1);
				this.selectedNodeID = -1;	
			}
		}
		this.updateLayers();
		*/
	}

		/*

		var p1 = {lng:-122.312035, lat:47.658316}
		var p2 = {lng:-122.312035 + 0.017, lat:47.648316}

		var arr = []

		this.olFeaturesFromLineStrings(arr, p1.lng, p1.lat, p2.lng, p2.lat,
			this.mapUtil.lineStyleFunc(this.tg.opt.color.controlPointLine, 
				this.tg.opt.width.controlPointLine))

		this.olFeaturesFromPoints(arr, p1.lng, p1.lat, 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.node, this.tg.opt.radius.node))

		this.olFeaturesFromPoints(arr, p2.lng, p2.lat, 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.node, this.tg.opt.radius.node))

		var idx = 5
		var coord = this.dispWater[idx].coordinates
		console.log('idx = ' + idx)
		console.log(coord)

		var countIntersection = 0
		for(var i = 0; i < coord.length; i++) {
			for(var j = 0; j < coord[i].length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					coord[i][j][0], coord[i][j][1], 
					coord[i][j + 1][0], coord[i][j + 1][1],
					this.mapUtil.lineStyleFunc(this.tg.opt.color.controlPointLine, 
					this.tg.opt.width.controlPointLine))

				if (this.tg.util.intersects(
					p1.lat, p1.lng, p2.lat, p2.lng, 
        	coord[i][j][1], coord[i][j][0], coord[i][j + 1][1], coord[i][j + 1][0])) {
					countIntersection++
					console.log('found!')
				}
			}

		}

		console.log('count = ' + countIntersection)
        
		this.map.addLayer(this.olVectorFromFeatures(arr))
		*/

	createRoadLayer() {
		var nodes = this.tg.data.localNodes
		var roads = this.tg.data.localRoads
		var arr = []

		// motorway_link, trunk_link, primary_link, secondary_link, tertiary_link
		this.createRoadLayerByType(arr, nodes, roads, this.tg.opt.color.link, this.tg.opt.width.link, [21, 22, 23, 24, 25])
			
		// primary, secondary, tertiary
		this.createRoadLayerByType(arr, nodes, roads, this.tg.opt.color.arterial, this.tg.opt.width.arterial, [11, 12, 13])
			
		// motorway, trunk
		this.createRoadLayerByType(arr, nodes, roads, this.tg.opt.color.highway, this.tg.opt.width.highway, [1, 2])

		return this.olVectorFromFeatures(arr)
	}

	createRoadLayerByType(arr, nodes, roads, clr, width, typeArr) {
		var lenRoads = roads.length

		for(var i = 0; i < lenRoads; i++) {
			if (typeArr.indexOf(roads[i].type) === -1) continue

			for(var j = 0; j < roads[i].nodes.length - 1; j++) {
				this.olFeaturesFromLineStrings(arr, 
					nodes[roads[i].nodes[j]].original.lng, 
					nodes[roads[i].nodes[j]].original.lat, 
					nodes[roads[i].nodes[j + 1]].original.lng, 
					nodes[roads[i].nodes[j + 1]].original.lat, 
					this.lineStyleFunc(clr, width))
			}
		}
	}