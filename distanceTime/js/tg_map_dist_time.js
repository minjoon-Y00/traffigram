class TgMapDistTime {
	constructor(map, data) {
		this.map = map;
		this.data = data;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.pointObj = [];
		this.maxIter = 100;
		this.iter = 0;
		this.timeoutSec = 2000;
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}
	
	render(param) {
		if (this.isDisabled||(!this.display)) {
			this.removeLayer();
		}
		else {
			this.updateLayer(param);
		}
	}

	discard() {
		this.removeLayer();
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	updateDisp() {
		for(let pt of this.points) {
			pt[0] = pt.node.disp.lng; 
			pt[1] = pt.node.disp.lat; 
		}
	}

	cal() {
		const zoom = 12;
		const roadObj = this.map.tgRoads.roadObjects[zoom];
		const box = this.data.box;

		//let len = 0;
		//for(let type in roadObj)
			//for(let road of roadObj[type]) len += road.length;

		//this.lats = new Array(len);
		//this.lngs = new Array(len);
		//let idx = 0;
		this.lats = [];
		this.lngs = [];

		for(let type in roadObj)
			for(let road of roadObj[type])
				for(let pt of road) {
					if ((pt[0] >= box.left)&&(pt[0] <= box.right)&&
							(pt[1] >= box.bottom)&&(pt[1] <= box.top)) {
						this.lngs.push(pt[0]);
						this.lats.push(pt[1]);
					}
					
				}

		//console.log(len); // 75352
		//console.log(this.lngs.length); // 47313
		const maxLng = (this.data.box.right - this.data.box.left) / 4; //2;
		const maxLat = (this.data.box.top - this.data.box.bottom) / 4; //2; 
		this.threshold = Math.sqrt(maxLng * maxLng + maxLat * maxLat);
		this.len = this.lngs.length;
		this.maxNumPt = 25;
		console.log('done.');
	}

	D2(lat1, lng1, lat2, lng2) {
		return Math.sqrt((lat1 - lat2) * (lat1 - lat2) + (lng1 - lng2) * (lng1 - lng2));
	}

	isWaterBetween(pt1, pt2) {
		for(let water of this.map.tgWater.dispWaterObjects) {
			if (water.geo === 'p') { // Polygon
				for(let i = 0; i < water.length; i++) {
					for(let j = 0; j < water[i].length - 1; j++) {

						if (TgUtil.intersects(
							pt1.lat, pt1.lng, pt2.lat, pt2.lng, 
		        	water[i][j][1], water[i][j][0], 
		        	water[i][j + 1][1], water[i][j + 1][0])) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	run() {
		let pointSet = [];

		const firstIdx = Math.floor(Math.random() * this.len);		
		pointSet.push({lat: this.lats[firstIdx], lng: this.lngs[firstIdx]});

		const maxCount = 1000;
		let count = 0;
		let candIdx, candLat, candLng;
		while((pointSet.length < this.maxNumPt)&&(count < maxCount)) {
			count++;
			candIdx = Math.floor(Math.random() * this.len);
			candLat = this.lats[candIdx];
			candLng = this.lngs[candIdx];

			if (this.D2(pointSet[0].lat, pointSet[0].lng, candLat, candLng) < this.threshold) {

				let intersected = false;
				for(let pt of pointSet) {
					if (this.isWaterBetween(pt, {lat: candLat, lng: candLng})) {
						intersected = true;
						break;
					}
				}

				if (!intersected) {
					pointSet.push({lat: candLat, lng: candLng});
				}
			}
		}

		if (count >= 1000) console.log('max out.');

		this.pointObj.push(pointSet);
		//console.log('pointObj: ', this.pointObj);
		console.log('pointObj: '+ this.pointObj.length);
		this.updateLayer();

		if (this.iter < this.maxIter - 1) {
			this.iter++;
			setTimeout(this.run.bind(this), this.timeoutSec);
		}
		else {	
			console.log('fin.');
			//TgUtil.saveTextAsFile(JSON.stringify(this.pointObj), "pointSet.js");
			TgUtil.saveTextAsFile(this.pointObj, "pointSet.js");
		}
	}

	updateLayer() {
		this.removeLayer();

		//const viz = this.data.viz;
		//const box = this.data.box;

		let arr = [];
		const yellow = 'rgb(240, 210, 88)';
		const red = 'rgb(12, 76, 138)';
		const yellowStyleFunc = this.mapUtil.lineStyleFunc(yellow, 1);
		const redStyleFunc = this.mapUtil.nodeStyleFunc(red, 5);

		for(let pointSet of this.pointObj) {
			// draw lines
			for(let pt1 of pointSet) {
				for(let pt2 of pointSet) { 
					this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
						[[pt1.lng, pt1.lat], [pt2.lng, pt2.lat]]), 
						yellowStyleFunc);
						//this.mapUtil.lineStyle(viz.color.controlPointLine, viz.width.controlPointLine));
				}
			}

			// draw points
			for(let pt of pointSet) { // 25
				this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point([pt.lng, pt.lat]), redStyleFunc);
			}
		}

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(100);
	  this.mapUtil.addLayer(this.layer);
	}
}