class TGMapBoundingBox {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;

		this.display = false;
		this.boundingBoxLayer = null;

		this.BBs = [];
		this.locs = [];

		/*const lat = 47.658316;
		const lng = -122.312035;
		const d = 0.01;
		this.BBs.push(
			[[lng, lat],[lng + d, lat],[lng + d, lat + d],[lng, lat + d],[lng, lat]]);
		this.BBs.push(
			[[lng, lat],[lng - d, lat],[lng - d, lat - d],[lng, lat - d],[lng, lat]]);
			*/
	}

	turn(tf) {
		this.display = tf;
	}

	render() {
		if (this.display) this.updateLayer();
		else this.removeLayer();
	}

	isItNotOverlapped(inBB) {
		for(let bb of this.BBs) {
			if (this.tg.util.intersectRect(inBB, bb)) return false;
		}
		return true;
	}

	addOriginToBB() {
		const iconLatPx = 40;
		const iconLngPx = 50;
		const dLat = (iconLatPx * this.tg.opt.variable.latPerPx) / 2;
		const dLng = (iconLngPx * this.tg.opt.variable.lngPerPx) / 2;
		const dispOrigin = this.tg.map.tgOrigin.origin.disp;
		const bb = {
			left: dispOrigin.lng - dLng, 
			right: dispOrigin.lng + dLng,
			top: dispOrigin.lat - dLat,
			bottom: dispOrigin.lat + dLat,
			type: 'origin',
		};

		this.BBs.push(bb);
	}

	getNonOverlappedLocations(locations) {
		const iconLatPx = 30;
		const iconLngPx = 30;
		const dLat = (iconLatPx * this.tg.opt.variable.latPerPx) / 2;
		const dLng = (iconLngPx * this.tg.opt.variable.lngPerPx) / 2;
		let nonOverlappedLocations = [];

		for(let loc of locations) {
			const bb = {
				left: loc.lng - dLng, 
				right: loc.lng + dLng,
				top: loc.lat - dLat,
				bottom: loc.lat + dLat,
				type: 'location',
			};

			if (this.isItNotOverlapped(bb)) {
				nonOverlappedLocations.push(loc);
				this.BBs.push(bb);
			}
		}
		return nonOverlappedLocations;
	}

	addBBOfLocations() {
		const locations = this.tg.map.tgLocs.locations[this.tg.map.tgLocs.currentType];
		const iconLatPx = 30;
		const iconLngPx = 30;
		const dLat = (iconLatPx * this.tg.opt.variable.latPerPx) / 2;
		const dLng = (iconLngPx * this.tg.opt.variable.lngPerPx) / 2;

		for(let loc of locations) {
			this.BBs.push({
				left: loc.node.dispLoc.lng - dLng, 
				right: loc.node.dispLoc.lng + dLng,
				top: loc.node.dispLoc.lat - dLat,
				bottom: loc.node.dispLoc.lat + dLat,
				type: 'location',
			});
		}
	}

	getCandidatePosition(index, lat, lng, name) {
		const latPerPx = this.tg.opt.variable.latPerPx;
		const lngPerPx = this.tg.opt.variable.lngPerPx;

		const widthPx = name.length * 7;
		const heightPx = 14;

		const lngMarginPx = 20; // left/right margin
		const latMarginPx = 25; // top/bottom margin
		const extraLatMarginPx = 10;

		const dLng = (widthPx * lngPerPx) / 2;
		const dLat = (heightPx * latPerPx) / 2;

		switch(index) {
			case 0: // right
				return {
					bb: {
						left: lng + (lngMarginPx * lngPerPx),
						right: lng + (lngMarginPx * lngPerPx) + (2 * dLng), 
						top: lat - dLat,
						bottom: lat + dLat,
						type: 'locationName',
					},
					offset: {
						x: lngMarginPx, y: 0, align:'left',
					}
				}
			case 1: // up
				return {
					bb: {
						left: lng - dLng,
						right: lng + dLng,
						top: lat + (latMarginPx * latPerPx) - dLat,
						bottom: lat + (latMarginPx * latPerPx) + dLat,
						type: 'locationName',
					},
					offset: {
						x: 0, y: -latMarginPx, align:'center',
					}
				}
			case 2: // left
				return {
					bb: {
						left: lng - (lngMarginPx * lngPerPx) - (2 * dLng),
						right: lng - (lngMarginPx * lngPerPx),
						top: lat - dLat,
						bottom: lat + dLat,
						type: 'locationName',
					},
					offset: {
						x: -lngMarginPx, y: 0, align:'right',
					}
				}
			case 3: // bottom
				return {
					bb: {
						left: lng - dLng,
						right: lng + dLng,
						top: lat - (latMarginPx * latPerPx) - dLat,
						bottom: lat - (latMarginPx * latPerPx) + dLat,
						type: 'locationName',
					},
					offset: {
						x: 0, y: latMarginPx, align:'center',
					}
				}
			case 4: // right - up
				return {
					bb: {
						left: lng + (lngMarginPx * lngPerPx),
						right: lng + (lngMarginPx * lngPerPx) + (2 * dLng),
						top: lat + (extraLatMarginPx * latPerPx) - dLat,
						bottom: lat + (extraLatMarginPx * latPerPx) + dLat,
						type: 'locationName',
					},
					offset: {
						x: lngMarginPx, y: -extraLatMarginPx, align:'left',
					}
				}
			case 5: // left - up
				return {
					bb: {
						left: lng - (lngMarginPx * lngPerPx) - (2 * dLng),
						right: lng - (lngMarginPx * lngPerPx),
						top: lat + (extraLatMarginPx * latPerPx) - dLat,
						bottom: lat + (extraLatMarginPx * latPerPx) + dLat,
						type: 'locationName',
					},
					offset: {
						x: -lngMarginPx, y: -extraLatMarginPx, align:'right',
					}
				}
			case 6: // left - bottom
				return {
					bb: {
						left: lng - (lngMarginPx * lngPerPx) - (2 * dLng),
						right: lng - (lngMarginPx * lngPerPx),
						top: lat - (extraLatMarginPx * latPerPx) - dLat,
						bottom: lat - (extraLatMarginPx * latPerPx) + dLat,
						type: 'locationName',
					},
					offset: {
						x: -lngMarginPx, y: extraLatMarginPx, align:'right',
					}
				}
			case 7: // right - bottom
				return {
					bb: {
						left: lng + (lngMarginPx * lngPerPx),
						right: lng + (lngMarginPx * lngPerPx) + (2 * dLng),
						top: lat - (extraLatMarginPx * latPerPx) - dLat,
						bottom: lat - (extraLatMarginPx * latPerPx) + dLat,
						type: 'locationName',
					},
					offset: {
						x: lngMarginPx, y: extraLatMarginPx, align:'left',
					}
				}
		}
	}

	getNonOverlappedLocationNames(locations) {

		this.deleteBBByType('locationName');

		for(let loc of locations) {
			for(let i = 0; i < 8; i++) {
				const ret = 
						this.getCandidatePosition(
								i, loc.node.dispLoc.lat, loc.node.dispLoc.lng, loc.name);

				if (this.isItNotOverlapped(ret.bb)) {
					loc.dispName = true;
					loc.nameOffsetX = ret.offset.x;
					loc.nameOffsetY = ret.offset.y;
					loc.nameAlign = ret.offset.align;
					this.BBs.push(ret.bb);
					break;
				}

				// if not possible
				if (i === 7) {
					loc.dispName = false;
					console.log('fail to put a loc.');
				}
			}
		}
		return locations;
	}

	cleanBB() {
		this.BBs = [];
		this.addOriginToBB();
	}

	deleteBBByType(type) {
		let newBBs = [];

		while(this.BBs.length > 0) {
			const bb = this.BBs.shift();
			if (bb.type !== type) newBBs.push(bb);
		}
		this.BBs = newBBs;	
	}

	calNonOverlappedPlaces(places) {
		this.deleteBBByType('place');

		const currentZoom = this.tg.map.currentZoom;
		const latPerPx = this.tg.opt.variable.latPerPx;
		const lngPerPx = this.tg.opt.variable.lngPerPx;
		const nonOverlappedPlaces = {};

		for(let name in places) {
			const place = places[name];

			if (currentZoom < place.minZoom) {
				console.log('zoooooooom!');
				continue;
			}

			if (currentZoom > place.maxZoom) {
				console.log('zoooooooom?');
				continue;
			}
			
			const lat = place.node.disp.lat;
			const lng = place.node.disp.lng;
			const pxLat = 14;
			const pxLng = name.length * 7;
			const heightLat = pxLat * latPerPx;
			const widthLng = pxLng * lngPerPx;
			const dLat = pxLat * latPerPx / 2;
			const dLng = pxLng * lngPerPx / 2;
			const bb = {
				left: lng - dLng, 
				right: lng + dLng,
				top: lat - dLat,
				bottom: lat + dLat,
				type: 'place',
			};

			if (this.isItNotOverlapped(bb)) {
				this.BBs.push(bb);
				nonOverlappedPlaces[name] = place;
			}
		}
		return nonOverlappedPlaces;
	}



	addBB(lat, lng, pxLat, pxLng, offsetPxLat = 0, offsetPxLng = 0, 
		kind = 'center', loc = null, noCheck = false) {

		let bb;
		if (kind === 'center') {
			bb = {
				left: offsetLng + lng - dLng, 
				right: offsetLng + lng + dLng,
				top: offsetLat + lat - dLat,
				bottom: offsetLat + lat + dLat,
			}
		}
		else if (kind === 'left') {
			bb = {
				left: offsetLng + lng, 
				right: offsetLng + lng + widthLng,
				top: offsetLat + lat - dLat,
				bottom: offsetLat + lat + dLat,
			}
		}

		let offsetX = 17;
		let offsetY = 0;
		let align = 'left';
		let ok = true;
		if (!noCheck) {

			// try original (right) position
			ok = this.isItNotOverlapped(bb);

			// try upper position
			if (!ok) {
				bb = {
					left: lng - dLng, 
					right: lng + dLng,
					top: (25 * latPerPx) + lat - dLat,
					bottom: (25 * latPerPx) + lat + dLat,
				}
				ok = this.isItNotOverlapped(bb);
				//ok = false;

				if (ok) {
					console.log('upper position ok.')
					offsetX = 0;
					offsetY = -25;
					align = 'center';
				}
			}

			// try left position
			if (!ok) {
				bb = {
					left: -(20 * lngPerPx) + lng - widthLng, 
					right: -(20 * lngPerPx) + lng,
					top: lat - dLat,
					bottom: lat + dLat,
				}
				ok = this.isItNotOverlapped(bb);
				//ok = false;

				if (ok) {
					console.log('left position ok.')
					offsetX = -20;
					offsetY = 0;
					align = 'right';
				}
			}

			// try bottom position
			if (!ok) {
				bb = {
					left: lng - dLng, 
					right: lng + dLng,
					top: -(25 * latPerPx) + lat - dLat,
					bottom: -(25 * latPerPx) + lat + dLat,
				}
				ok = this.isItNotOverlapped(bb);
				//ok = false;

				if (ok) {
					console.log('bottom position ok.')
					offsetX = 0;
					offsetY = 25;
					align = 'center';
				}
			}

			// try right - top position
			if (!ok) {
				bb = {
					left: offsetLng + lng, 
					right: offsetLng + lng + widthLng,
					top: (5 * latPerPx) + offsetLat + lat,
					bottom: (5 * latPerPx) + offsetLat + lat + heightLat,
				}
				ok = this.isItNotOverlapped(bb);
				//ok = false;

				if (ok) {
					console.log('right - top position ok.')
					offsetX = 17;
					offsetY = -10;
					align = 'left';
				}
			}

			// try left - top position
			if (!ok) {
				bb = {
					left: -(17 * lngPerPx) + lng - widthLng, 
					right: -(17 * lngPerPx) + lng,
					top: (5 * latPerPx) + offsetLat + lat,
					bottom: (5 * latPerPx) + offsetLat + lat + heightLat,
				}
				ok = this.isItNotOverlapped(bb);
				//ok = true;

				if (ok) {
					console.log('right - top position ok.')
					offsetX = -17;
					offsetY = -10;
					align = 'right';
				}
			}




		}
		
		if (ok) {
			this.BBs.push(bb);
				
			this.BBPolygons.push([
				[bb.right, bb.top],
				[bb.right, bb.bottom],
				[bb.left, bb.bottom],
				[bb.left, bb.top],
				[bb.right, bb.top]]);

			if (loc) {
				const obj = 
					{name: loc.name,
					 lat: loc.node.dispLoc.lat,
					 lng: loc.node.dispLoc.lng,
					 offsetX: offsetX,
					 offsetY: offsetY,
					 align: align};
				this.locs.push(obj);
			}
		}

		

		//console.log('heightLat: ' + heightLat);
		//console.log('widthLng: ' + widthLng);
		//console.log('dLat: ' + dLat);
		//console.log('dLng: ' + dLng);


	}







	addLocationsToBB() {
		for(let loc of this.tg.map.tgLocs.locations[this.tg.map.tgLocs.currentType]) {
			//console.log(loc);
			//this.addBB(loc.node.original.lat, loc.node.original.lng)
		}
	}

	updateLayer() {
		if (this.BBs.length === 0) return;

		const BBPolygons = [];
		for(let bb of this.BBs) {
			BBPolygons.push([
				[bb.right, bb.top], [bb.right, bb.bottom],
				[bb.left, bb.bottom], [bb.left, bb.top],
				[bb.right, bb.top]
			]);
		}

		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.boundingBox);

		for(let bb of BBPolygons) {
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Polygon([bb]), styleFunc);
		}

		this.mapUtil.removeLayer(this.boundingBoxLayer);
		this.boundingBoxLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.boundingBoxLayer.setZIndex(this.tg.opt.z.boundingBox);
		this.olMap.addLayer(this.boundingBoxLayer);
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.boundingBoxLayer);
	}

	repositionElements() {

		const locations = this.tg.map.tgLocs.locations[this.tg.map.tgLocs.currentType];

		this.getNonOverlappedLocations(locations);

		this.tg.map.tgLocs.removeLocationLayer();
		this.drawLocationLayer();

		// name
		for(let loc of this.nonOverlappedLocations) {
			this.addBB(
				loc.node.dispLoc.lat, loc.node.dispLoc.lng, 
				14, loc.name.length * 7, 0, 17, 'left', loc);
		}

		//this.addLayer();
		this.drawLocationNameLayer();
	}

	repositionPlaces() {
		this.tg.map.tgPlaces.clearLayers();
		this.calNonOverlappedPlaces(this.tg.map.tgPlaces.dispPlaceObjects);
		this.drawPlaceLayer();
	}

	drawLocationNameLayer() {
		let arr = [];
		
		for(let loc of this.locs) {
				const nameStyleFunc = 
					this.mapUtil.textStyle(
					loc.name, this.tg.opt.color.textLocation, 
					this.tg.opt.font.text, loc.offsetX, loc.offsetY, loc.align);

				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point(
						[loc.lng, loc.lat]), nameStyleFunc);
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationNameLayer);
			this.locationNameLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationNameLayer.setZIndex(this.tg.opt.z.location);
		  this.olMap.addLayer(this.locationNameLayer);
		}
	}

	drawLocationLayer() {
		var arr = [];
		const anchorStyleFunc = 
			this.mapUtil.nodeStyleFunc(this.tg.opt.color.anchor, this.tg.opt.radius.anchor);
		const locationStyleFunc = this.mapUtil.imageStyleFunc(this.tg.opt.image.location);
		const lineStyleFunc = 
			this.mapUtil.lineStyleFunc(
				this.tg.opt.color.locationLine, this.tg.opt.width.locationLine);

		for(let loc of this.nonOverlappedLocations) {

			if ((loc.node.target.lng != loc.node.dispAnchor.lng) 
				|| (loc.node.target.lat != loc.node.dispAnchor.lat)) {

				// lines
				this.mapUtil.addFeatureInFeatures(arr, 
					new ol.geom.LineString(
						[[loc.node.dispAnchor.lng, loc.node.dispAnchor.lat], 
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]]), lineStyleFunc);

				// anchor images
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point([loc.node.dispAnchor.lng, loc.node.dispAnchor.lat]), anchorStyleFunc);
			}

			// circle images
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([loc.node.dispLoc.lng, loc.node.dispLoc.lat]), locationStyleFunc);
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationLayer);
			this.locationLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationLayer.setZIndex(this.tg.opt.z.location);
		  this.olMap.addLayer(this.locationLayer);
		}
	}

	drawPlaceLayer() {
		let arr = [];

		this.mapUtil.removeLayer(this.placeLayer);

		for(let name in this.nonOverlappedPlaces) {
			const place = this.nonOverlappedPlaces[name];
			const styleFunc = this.mapUtil.textStyleFunc(
					name, this.tg.opt.color.textPlace, this.tg.opt.font.places);

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point(place), styleFunc);
		}

		this.placeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.placeLayer.setZIndex(this.tg.opt.z.places);
		this.olMap.addLayer(this.placeLayer);
	}






}