class TGMapBoundingBox {
	constructor(tg, olMap, mapUtil) {
		this.tg = tg;
		this.olMap = olMap;
		this.mapUtil = mapUtil;
		this.latPerPx = 0;
		this.lngPerPx = 0;

		this.BBs = [];
		this.BBPolygons = [];
		this.locs = [];
		this.nonOverlappedLocations = [];
		this.nonOverlappedPlaces = {};


		

		/*const lat = 47.658316;
		const lng = -122.312035;
		const d = 0.01;
		this.BBs.push(
			[[lng, lat],[lng + d, lat],[lng + d, lat + d],[lng, lat + d],[lng, lat]]);
		this.BBs.push(
			[[lng, lat],[lng - d, lat],[lng - d, lat - d],[lng, lat - d],[lng, lat]]);
			*/
	}

	calConstants() {
		const opt = this.tg.opt;
  	const heightLat = opt.box.top - opt.box.bottom; // 0.11
		const widthLng = opt.box.right - opt.box.left; // 0.09784

		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2)); // 900
  	let widthPX = $('#ol_map').css('width');  
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2)); // 600

  	this.latPerPx = heightLat / heightPX;
  	this.lngPerPx = widthLng / widthPX;
	}

	calNonOverlappedLocations(locations) {
		const pxLat = 30;
		const pxLng = 30;
		const heightLat = pxLat * this.latPerPx;
		const widthLng = pxLng * this.lngPerPx;
		const dLat = pxLat * this.latPerPx / 2;
		const dLng = pxLng * this.lngPerPx / 2;

		for(let loc of locations) {
			const lat = loc.node.dispLoc.lat;
			const lng = loc.node.dispLoc.lng;
			const bb = {
				left: lng - dLng, 
				right: lng + dLng,
				top: lat - dLat,
				bottom: lat + dLat
			};

			const ok = this.checkBB(bb);

			if (ok) {
				this.BBs.push(bb);
				
				this.BBPolygons.push([
					[bb.right, bb.top],
					[bb.right, bb.bottom],
					[bb.left, bb.bottom],
					[bb.left, bb.top],
					[bb.right, bb.top]]);

				this.nonOverlappedLocations.push(loc);
			}
		}
		//console.log(this.nonOverlappedLocations);
	}

	calNonOverlappedPlaces(places) {
		const currentZoom = this.tg.map.currentZoom;

		for(let name in places) {
			const place = places[name];

			if (currentZoom < place.minZoom) {
				continue;
			}

			if (currentZoom > place.maxZoom) {
				continue;
			}
			
			const lat = place.node.disp.lat;
			const lng = place.node.disp.lng;
			const pxLat = 14;
			const pxLng = name.length * 7;
			const heightLat = pxLat * this.latPerPx;
			const widthLng = pxLng * this.lngPerPx;
			const dLat = pxLat * this.latPerPx / 2;
			const dLng = pxLng * this.lngPerPx / 2;
			const bb = {
				left: lng - dLng, 
				right: lng + dLng,
				top: lat - dLat,
				bottom: lat + dLat
			};

			const ok = this.checkBB(bb);

			if (ok) {
				this.BBs.push(bb);
				
				this.BBPolygons.push([
					[bb.right, bb.top],
					[bb.right, bb.bottom],
					[bb.left, bb.bottom],
					[bb.left, bb.top],
					[bb.right, bb.top]]);

				this.nonOverlappedPlaces[name] = place;
			}
		}
		console.log(this.nonOverlappedPlaces);
	}

	addBB(lat, lng, pxLat, pxLng, offsetPxLat = 0, offsetPxLng = 0, 
		kind = 'center', loc = null, noCheck = false) {

		//console.log('addBB: ' + lat + ', ' + lng);

		const heightLat = pxLat * this.latPerPx;
		const widthLng = pxLng * this.lngPerPx;
		const dLat = pxLat * this.latPerPx / 2;
		const dLng = pxLng * this.lngPerPx / 2;
		const offsetLat = offsetPxLat * this.latPerPx;
		const offsetLng = offsetPxLng * this.lngPerPx;


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
			ok = this.checkBB(bb);

			// try upper position
			if (!ok) {
				bb = {
					left: lng - dLng, 
					right: lng + dLng,
					top: (25 * this.latPerPx) + lat - dLat,
					bottom: (25 * this.latPerPx) + lat + dLat,
				}
				ok = this.checkBB(bb);
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
					left: -(20 * this.lngPerPx) + lng - widthLng, 
					right: -(20 * this.lngPerPx) + lng,
					top: lat - dLat,
					bottom: lat + dLat,
				}
				ok = this.checkBB(bb);
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
					top: -(25 * this.latPerPx) + lat - dLat,
					bottom: -(25 * this.latPerPx) + lat + dLat,
				}
				ok = this.checkBB(bb);
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
					top: (5 * this.latPerPx) + offsetLat + lat,
					bottom: (5 * this.latPerPx) + offsetLat + lat + heightLat,
				}
				ok = this.checkBB(bb);
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
					left: -(17 * this.lngPerPx) + lng - widthLng, 
					right: -(17 * this.lngPerPx) + lng,
					top: (5 * this.latPerPx) + offsetLat + lat,
					bottom: (5 * this.latPerPx) + offsetLat + lat + heightLat,
				}
				ok = this.checkBB(bb);
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

		

		//console.log('latPerPx: ' + this.latPerPx);
		//console.log('lngPerPx: ' + this.lngPerPx);
		//console.log('heightLat: ' + heightLat);
		//console.log('widthLng: ' + widthLng);
		//console.log('dLat: ' + dLat);
		//console.log('dLng: ' + dLng);


	}

	checkBB(inBB) {

		//console.log('inBB: ');
		//console.log(inBB);

		for(let bb of this.BBs) {
			if (this.tg.util.intersectRect(inBB, bb)) {
				console.log('!!!!!!!!!!!!!!------------');
				return false;
			}
		}
		return true;

		//
	}

	addCenterPositionToBB() {
		this.addBB(this.tg.map.centerPosition.lat, this.tg.map.centerPosition.lng, 40, 50);
	}

	addLocationsToBB() {
		for(let loc of this.tg.map.tgLocs.locations[this.tg.map.tgLocs.currentType]) {
			//console.log(loc);
			//this.addBB(loc.node.original.lat, loc.node.original.lng)
		}
	}

	addLayer() {
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(this.tg.opt.color.boundingBox);

		for(let bb of this.BBPolygons) {
			//console.log(bb);
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Polygon([bb]), styleFunc);
		}

		this.mapUtil.removeLayer(this.boundingBoxLayer);
		this.boundingBoxLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.boundingBoxLayer.setZIndex(this.tg.opt.z.boundingBox);
		this.olMap.addLayer(this.boundingBoxLayer);
	}

	repositionElements() {

		// center position
		this.addBB(
				this.tg.map.centerPosition.lat, this.tg.map.centerPosition.lng, 
				40, 50, 0, 0, 'center', null, true);

		const locations = this.tg.map.tgLocs.locations[this.tg.map.tgLocs.currentType];

		this.calNonOverlappedLocations(locations);

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