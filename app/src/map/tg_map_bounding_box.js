//const TgUtil = require('../tg_util');
//const TgLocationNode = require('../node/tg_location_node');

class TgMapBoundingBox {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.display = false;
		this.boundingBoxLayer = null;

		this.BBs = [];
		this.locs = [];
	}

	turn(tf) {
		this.display = tf;
	}

	render() {
		if (this.display) this.updateLayer();
		else this.removeLayer();
	}

	/*getOverlappedBB(inBB) {
		for(let bb of this.BBs) {
			if (TgUtil.intersectRect(inBB, bb)) return bb;
		}
		return null;
	}*/

	calBBOfOrigin() {
		const iconLatPx = 50;
		const iconLngPx = 55;
		const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
		const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;
		const dispOrigin = this.map.tgOrigin.origin.disp;

		return {
			left: dispOrigin.lng - dLng, 
			right: dispOrigin.lng + dLng,
			top: dispOrigin.lat - dLat,
			bottom: dispOrigin.lat + dLat,
		};
	}

	calBBOfLocations(locations) {
		const iconLatPx = this.data.var.locBBPx;
		const iconLngPx = this.data.var.locBBPx;
		const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
		const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;

		for(let loc of locations) {
			const disp = loc.node.dispLoc;
			loc.bb = {
				left: disp.lng - dLng, 
				right: disp.lng + dLng,
				top: disp.lat - dLat,
				bottom: disp.lat + dLat,
			};
		}
	}

	/*calBBOfClusterLocations(locationClusters) {
		const clusterLatPx = 45;
		const clusterLngPx = 45;
		const cLat = (clusterLatPx * this.data.var.latPerPx) / 2;
		const cLng = (clusterLngPx * this.data.var.lngPerPx) / 2;

		for(let cLocs of locationClusters) {
			const disp = cLocs.node.dispLoc;
			cLocs.bb = {
				left: disp.lng - cLng, 
				right: disp.lng + cLng,
				top: disp.lat - cLat,
				bottom: disp.lat + cLat,
			};
		}
	}*/

	updateLocationGroups(locGrps) {
		for(let locGrp of locGrps) {
			this.updateLocationGroup(locGrp);
		}
	}

	updateLocationGroup(locGrp) {
		this.updateNodeOfLocationGroup(locGrp);
		this.updateBBOfLocationGroup(locGrp);
	}

	updateNodeOfLocationGroup(locGrp) {
		let dispLoc = {lat: 0, lng: 0};
		let dispAnchor = {lat: 0, lng: 0};

		for(let cLoc of locGrp.locs) {
			dispLoc.lat += cLoc.node.dispLoc.lat;
			dispLoc.lng += cLoc.node.dispLoc.lng;
			dispAnchor.lat += cLoc.node.dispAnchor.lat;
			dispAnchor.lng += cLoc.node.dispAnchor.lng;
		}

		const len = locGrp.locs.length;
		dispLoc.lat /= len;
		dispLoc.lng /= len;
		dispAnchor.lat /= len;
		dispAnchor.lng /= len;

		if (locGrp.node) {
			locGrp.node.reset(dispLoc.lat, dispLoc.lng);
		}
		else {
			locGrp.node = new TgLocationNode(dispLoc.lat, dispLoc.lng);
		}
		locGrp.node.dispAnchor = dispAnchor;
		locGrp.time = 0;
	}

	updateBBOfLocationGroup(locGrp) {
		const locGrpLatPx = this.data.var.locGroupBBPx;
		const locGrpLngPx = this.data.var.locGroupBBPx;
		const cLat = (locGrpLatPx * this.data.var.latPerPx) / 2;
		const cLng = (locGrpLngPx * this.data.var.lngPerPx) / 2;
		const disp = locGrp.node.dispLoc;
		locGrp.bb = {
			left: disp.lng - cLng, 
			right: disp.lng + cLng,
			top: disp.lat - cLat,
			bottom: disp.lat + cLat,
		};
	}

	addIntoGroupOrmakeNewGroup(locGrps, loc1, loc2) {

		// I. both locs are in groups
		if ((loc1.group) && (loc2.group)) {
			if (loc1.group !== loc2.group) {
				//loc1.group.locs = loc1.group.locs.concat(loc2.group.locs);
				//loc2.group = loc1.group;
			}
		}
		// II. loc1 is in group
		else if (loc1.group) {
			loc1.group.locs.push(loc2);
			loc2.group = loc1.group;
		}
		// III. loc2 is in group
		else if (loc2.group) {
			loc2.group.locs.push(loc1);
			loc1.group = loc2.group;
		}
		// IV. no locs are in group
		else {
			const locGrp = {locs: [loc1, loc2]};
			locGrps.push(locGrp);
			loc1.group = locGrp;
			loc2.group = locGrp;
		}
	}

	mergeLocationGoup(locGrp1, locGrp2) {
		for(let loc of locGrp2.locs) {
			if (locGrp1.locs.indexOf(loc) < 0) locGrp1.locs.push(loc);
		}
		this.updateLocationGroup(locGrp1);
		return locGrp1;
	}

	calLocationGroup(locs) {
		let locGrps = [];

		// make distance arrays between all locations and sort it.
		let distBetweenLocGrps = [];
		for(let i = 0; i < locs.length; i++) {
			for(let j = i + 1; j < locs.length; j++) {
				distBetweenLocGrps.push({
					loc1: locs[i], loc2: locs[j],
					dist: TgUtil.D2_s(locs[i].node.dispLoc.lat, locs[i].node.dispLoc.lng, 
						locs[j].node.dispLoc.lat, locs[j].node.dispLoc.lng)
				});
			}
			locs[i].group = null;
		}
		distBetweenLocGrps.sort((a, b) => {return a.dist - b.dist});

		// make location group
		for(let twoLocs of distBetweenLocGrps) {
			if (TgUtil.intersectRect(twoLocs.loc1.bb, twoLocs.loc2.bb)) {
				this.addIntoGroupOrmakeNewGroup(locGrps, twoLocs.loc1, twoLocs.loc2);
			}
			else break;
		}
		this.updateLocationGroups(locGrps);

		// check among location groups
		let newLocGroups = [];
		while(locGrps.length > 0) {
			const targetLocGrp = locGrps.shift();
			let overlapped = false;
			for(let locGrp of locGrps) {
				if (TgUtil.intersectRect(targetLocGrp.bb, locGrp.bb)) {
					overlapped = true;
					locGrp = this.mergeLocationGoup(locGrp, targetLocGrp);
				}
			}
			if (!overlapped) {
				newLocGroups.push(targetLocGrp);
			}
		}
		locGrps = newLocGroups;

		// check overlap between groups and locations
		for(let locGrp of locGrps) {
			for(let loc of locs) {
				if (loc.group) continue;
				if (TgUtil.intersectRect(locGrp.bb, loc.bb)) {
					locGrp.locs.push(loc);
					loc.group = locGrp;
					this.updateLocationGroup(locGrp);
				}
			}
		}

		//console.log(locGrps);

		return locGrps;
	}

	/*updateNodeOfClusteredLocations(locationClusters) {
		for(let cLocs of locationClusters) {
			let dispLoc = {lat: 0, lng: 0};
			let dispAnchor = {lat: 0, lng: 0};

			for(let cLoc of cLocs.locs) {
				dispLoc.lat += cLoc.node.dispLoc.lat;
				dispLoc.lng += cLoc.node.dispLoc.lng;
				dispAnchor.lat += cLoc.node.dispAnchor.lat;
				dispAnchor.lng += cLoc.node.dispAnchor.lng;
			}

			const len = cLocs.locs.length;
			dispLoc.lat /= len;
			dispLoc.lng /= len;
			dispAnchor.lat /= len;
			dispAnchor.lng /= len;

			cLocs.node = new TgLocationNode(dispLoc.lat, dispLoc.lng);
			cLocs.node.dispAnchor = dispAnchor;
			cLocs.time = 0;
		}
	}*/

	updateTimeOfLocationGroups(locGrps) {
		for(let locGrp of locGrps) {
			let time = 0;
			for(let loc of locGrp.locs) time += loc.time;
			time /= locGrp.locs.length;
			locGrp.time = time;
		}
	}




	calNonOverlappedLocationNames(locations, locationClusters) {
		// location names in the cluster are not displayed
		for(let cLoc of locationClusters) {
			for(let loc of cLoc.locs) loc.dispName = false;
		}

		// calculate non-overlapped location names
		for(let loc of locations) {
			
			if (loc.group) continue;

			for(let i = 0; i < 8; i++) {
				const ret = 
					this.getCandidatePosition(
						i, loc.node.dispLoc.lat, loc.node.dispLoc.lng, loc.name);

				if (this.isItNotOverlappedByLocs(locations, locationClusters, ret.bb)) {
				//if (true) {
					loc.dispName = true;
					loc.nameOffsetX = ret.offset.x;
					loc.nameOffsetY = ret.offset.y;
					loc.nameAlign = ret.offset.align;
					loc.nameBB = ret.bb;
					break;
				}


				// if not possible
				if (i === 7) {
					loc.dispName = false;
					console.log('fail to put a loc.');
				}
			}
		}
	}

	isItNotOverlappedByLocs(locations, locationClusters, inBB) {
		for(let loc of locations) {
			if ((loc.bb) && (TgUtil.intersectRect(inBB, loc.bb))) return false;
			if ((loc.nameBB) && (TgUtil.intersectRect(inBB, loc.nameBB))) return false;
		}

		for(let cLoc of locationClusters) {
			if ((cLoc.bb) && (TgUtil.intersectRect(inBB, cLoc.bb))) return false;
		}
		return true;
	}

	isItNotOverlappedPlaces(places, inBB) {
		for(let name in places) {
			let bb = places[name].bb;
			if (bb && (TgUtil.intersectRect(inBB, bb))) return false;
		}
		return true;
	}

	getNonOverlappedPlaces(placesByZoom) {
		const locations = this.map.tgLocs.getCurrentLocations();
		const locationClusters = this.map.tgLocs.getCurrentLocationClusters();
		const minZoom = this.map.tgPlaces.minZoomOfPlaces;
		const maxZoom = this.map.tgPlaces.maxZoomOfPlaces;
		const currentZoom = this.data.zoom.current;
		const latPerPx = this.data.var.latPerPx;
		const lngPerPx = this.data.var.lngPerPx;

		//const top = this.data.box.top + this.data.var.latMargin;
		//const bottom = this.data.box.bottom - this.data.var.latMargin;
		//const right = this.data.box.right + this.data.var.lngMargin;
		//const left = this.data.box.left - this.data.var.lngMargin;
		const top = this.data.box.top;
		const bottom = this.data.box.bottom;
		const right = this.data.box.right;
		const left = this.data.box.left;

		let dispPlaces = {};

		for(let zoom = minZoom; zoom <= currentZoom; zoom++) {
			for(let name in placesByZoom[zoom]) {
				const place = placesByZoom[zoom][name];
				const lng = place.node.disp.lng;
				const lat = place.node.disp.lat;

				if (!((lat < top) && (lat > bottom) && (lng < right) && (lng > left))) continue;

				//if (!place.bb) {
					const widthPx = name.length * 8;
					const heightPx = 14;
					
					const bb = {
						left: lng - (widthPx * lngPerPx), 
						right: place.node.disp.lng + (widthPx * lngPerPx),
						top: place.node.disp.lat - (heightPx * latPerPx),
						bottom: place.node.disp.lat + (heightPx * latPerPx),
					};
					place.bb = bb;
				//}

				if (this.isItNotOverlappedByLocs(locations, locationClusters, place.bb) && 
						this.isItNotOverlappedPlaces(dispPlaces, place.bb)) {
					dispPlaces[name] = place;
					//console.log('z: ' + zoom + ' n: ' + name);
				}
			}
		}	
		return dispPlaces;
	}


	/*calClusteredLocations2(locations) {
		const iconLatPx = 30;
		const iconLngPx = 30;
		const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
		const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;
		let clusteredLocations = [];

		// make clusterdLocations array
		for(let loc of locations) {
			const bb = {
				left: loc.lng - dLng, 
				right: loc.lng + dLng,
				top: loc.lat - dLat,
				bottom: loc.lat + dLat,
				type: 'location',
				source: loc,
			};

			// check overlapping
			const overlappedBB = this.getOverlappedBB(bb);

			if (overlappedBB) {
				// if any bb is overlaped by loc
				for(let cLocs of clusteredLocations) {
					for(let cLoc of cLocs) {
						if (cLoc === overlappedBB.source) {
							cLocs.push(loc);
							break;
						}
					}
				}
			}
			else {
				// not overlapped
				clusteredLocations.push([loc]);
			}
			this.BBs.push(bb);
		}

		// update bbs
		const clusterLatPx = 45;
		const clusterLngPx = 45;
		const cLat = (clusterLatPx * this.data.var.latPerPx) / 2;
		const cLng = (clusterLngPx * this.data.var.lngPerPx) / 2;

		for(let cLocs of clusteredLocations) {
			if (cLocs.length !== 1) {
				let avgLng = 0;
				let avgLat = 0;

				for(let cLoc of cLocs) {
					avgLng += cLoc.lng;
					avgLat += cLoc.lat;

					for(let bb of this.BBs) {
						if (bb.source === cLoc) {
							bb.deleted = true;
							break;
						}
					}
				}

				avgLng /= cLocs.length;
				avgLat /= cLocs.length;

				const bb = {
					left: avgLng - cLng, 
					right: avgLng + cLng,
					top: avgLat - cLat,
					bottom: avgLat + cLat,
					type: 'locationCluster',
					source: cLocs,
				};
				this.BBs.push(bb);
			}
		}

		let newBBs = [];
		for(let bb of this.BBs) {
			if (!bb.deleted) newBBs.push(bb);
		}
		this.BBs = newBBs;

		return clusteredLocations;	
	}*/

	/*getNonOverlappedLocations(locations) {
		const iconLatPx = 30;
		const iconLngPx = 30;
		const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
		const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;
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
	}*/



	/*addBBOfLocations() {
		const locations = this.map.tgLocs.locations[this.map.tgLocs.currentType];

		const iconLatPx = 30;
		const iconLngPx = 30;
		const dLat = (iconLatPx * this.data.var.latPerPx) / 2;
		const dLng = (iconLngPx * this.data.var.lngPerPx) / 2;

		for(let loc of locations) {
			this.BBs.push({
				left: loc.node.dispLoc.lng - dLng, 
				right: loc.node.dispLoc.lng + dLng,
				top: loc.node.dispLoc.lat - dLat,
				bottom: loc.node.dispLoc.lat + dLat,
				type: 'location',
			});
		}
	}*/

	getCandidatePosition(index, lat, lng, name) {
		const latPerPx = this.data.var.latPerPx;
		const lngPerPx = this.data.var.lngPerPx;

		const widthPx = name.length * 8;
		const heightPx = 14;

		const lngMarginPx = this.data.var.locTextLngMarginPx; // left/right margin
		const latMarginPx = this.data.var.locTextLatMarginPx; // top/bottom margin
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
					},
					offset: {
						x: lngMarginPx, y: extraLatMarginPx, align:'left',
					}
				}
		}
	}



	cleanBB() {
		this.BBs = [];
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

		const currentZoom = this.data.zoom.current;
		const latPerPx = this.data.var.latPerPx;
		const lngPerPx = this.data.var.lngPerPx;
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

			if (this.isItNotOverlappedByLocs(bb)) {
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
			ok = this.isItNotOverlappedByLocs(bb);

			// try upper position
			if (!ok) {
				bb = {
					left: lng - dLng, 
					right: lng + dLng,
					top: (25 * latPerPx) + lat - dLat,
					bottom: (25 * latPerPx) + lat + dLat,
				}
				ok = this.isItNotOverlappedByLocs(bb);
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
				ok = this.isItNotOverlappedByLocs(bb);
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
				ok = this.isItNotOverlappedByLocs(bb);
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
				ok = this.isItNotOverlappedByLocs(bb);
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
				ok = this.isItNotOverlappedByLocs(bb);
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
		for(let loc of this.map.tgLocs.locations[this.map.tgLocs.currentType]) {
			//console.log(loc);
			//this.addBB(loc.node.original.lat, loc.node.original.lng)
		}
	}

	updateLayer() {
		const BBPolygons = [];

		// for locations
		const locs = this.map.tgLocs.getCurrentLocations();
		for(let loc of locs) {
			let bb = loc.bb;
			if (bb) {
				BBPolygons.push([
					[bb.right, bb.top], [bb.right, bb.bottom],
					[bb.left, bb.bottom], [bb.left, bb.top],
					[bb.right, bb.top]
				]);
			}

			bb = loc.nameBB;
			if (bb) {
				BBPolygons.push([
					[bb.right, bb.top], [bb.right, bb.bottom],
					[bb.left, bb.bottom], [bb.left, bb.top],
					[bb.right, bb.top]
				]);
			}
		}

		const cLocs = this.map.tgLocs.getCurrentLocationClusters();
		for(let cLoc of cLocs) {
			let bb = cLoc.bb;
			if (bb) {
				BBPolygons.push([
					[bb.right, bb.top], [bb.right, bb.bottom],
					[bb.left, bb.bottom], [bb.left, bb.top],
					[bb.right, bb.top]
				]);
			}
		}

		// for places
		const places = this.map.tgPlaces.dispPlaceObjects;
		for(let name in places) {
			let bb = places[name].bb;
			if (bb) {
				BBPolygons.push([
					[bb.right, bb.top], [bb.right, bb.bottom],
					[bb.left, bb.bottom], [bb.left, bb.top],
					[bb.right, bb.top]
				]);
			}
		}

		const viz = this.data.viz;
		let arr = [];
		const styleFunc = this.mapUtil.polygonStyleFunc(viz.color.boundingBox);

		for(let bb of BBPolygons) {
			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Polygon([bb]), styleFunc, 'bb');
		}

		this.mapUtil.removeLayer(this.boundingBoxLayer);
		this.boundingBoxLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.boundingBoxLayer.setZIndex(viz.z.boundingBox);
		this.mapUtil.addLayer(this.boundingBoxLayer);
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.boundingBoxLayer);
	}

	repositionElements() {

		const locations = this.map.tgLocs.locations[this.map.tgLocs.currentType];

		this.getNonOverlappedLocations(locations);

		this.map.tgLocs.removeLocationLayer();
		this.drawLocationLayer();

		// name
		for(let loc of this.nonOverlappedLocations) {
			this.addBB(
				loc.node.dispLoc.lat, loc.node.dispLoc.lng, 
				14, loc.name.length * 9, 0, 17, 'left', loc);
		}

		//this.addLayer();
		this.drawLocationNameLayer();
	}

	repositionPlaces() {
		this.map.tgPlaces.clearLayers();
		this.calNonOverlappedPlaces(this.map.tgPlaces.dispPlaceObjects);
		this.drawPlaceLayer();
	}

	drawLocationNameLayer() {
		const viz = this.data.viz;
		let arr = [];
		
		for(let loc of this.locs) {
				const nameStyleFunc = 
					this.mapUtil.textStyle({
						text: loc.name, 
						color: viz.color.textLocation, 
						font: viz.font.text, 
						offsetX: loc.offsetX, 
						offsetY: loc.offsetY, 
						align: loc.align
					});

				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point(
						[loc.lng, loc.lat]), nameStyleFunc, 'locName');
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationNameLayer);
			this.locationNameLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationNameLayer.setZIndex(viz.z.location);
		  this.mapUtil.addLayer(this.locationNameLayer);
		}
	}

	drawLocationLayer() {
		const viz = this.data.viz;
		var arr = [];
		const anchorStyleFunc = 
			this.mapUtil.nodeStyleFunc(viz.color.anchor, viz.radius.anchor);
		const locationStyleFunc = this.mapUtil.imageStyleFunc(viz.image.location);
		const lineStyleFunc = 
			this.mapUtil.lineStyleFunc(
				viz.color.locationLine, viz.width.locationLine);

		for(let loc of this.nonOverlappedLocations) {

			if ((loc.node.target.lng != loc.node.dispAnchor.lng) 
				|| (loc.node.target.lat != loc.node.dispAnchor.lat)) {

				// lines
				this.mapUtil.addFeatureInFeatures(arr, 
					new ol.geom.LineString(
						[[loc.node.dispAnchor.lng, loc.node.dispAnchor.lat], 
						[loc.node.dispLoc.lng, loc.node.dispLoc.lat]]), lineStyleFunc, 'locLine');

				// anchor images
				this.mapUtil.addFeatureInFeatures(arr,
					new ol.geom.Point([loc.node.dispAnchor.lng, loc.node.dispAnchor.lat]), 
					anchorStyleFunc, 'locAnchor');
			}

			// circle images
			this.mapUtil.addFeatureInFeatures(arr,
				new ol.geom.Point([loc.node.dispLoc.lng, loc.node.dispLoc.lat]), 
					locationStyleFunc, 'loc');
		}

		if (arr.length > 0) {
			this.mapUtil.removeLayer(this.locationLayer);
			this.locationLayer = this.mapUtil.olVectorFromFeatures(arr);
			this.locationLayer.setZIndex(viz.z.location);
		  this.mapUtil.addLayer(this.locationLayer);
		}
	}

	drawPlaceLayer() {
		const viz = this.data.viz;
		let arr = [];

		this.mapUtil.removeLayer(this.placeLayer);

		for(let name in this.nonOverlappedPlaces) {
			const place = this.nonOverlappedPlaces[name];
			const styleFunc = this.mapUtil.textStyle({
					text: name, 
					color: viz.color.textPlace, 
					font: viz.font.places,
				});

			this.mapUtil.addFeatureInFeatures(
				arr, new ol.geom.Point(place), styleFunc, 'place');
		}

		this.placeLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.placeLayer.setZIndex(viz.z.places);
		this.mapUtil.addLayer(this.placeLayer);
	}
}

//module.exports = TgMapBoundingBox;