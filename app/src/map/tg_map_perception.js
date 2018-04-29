class TgMapPerc {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		const lat1 = 47.69327346998924;
		const lat2 = 47.667276530010746;
		const lng1 = -122.34663590490722;
		const lng2 = -122.30801209509276;

		this.points = new Array(4);
		this.points[0] = [lng1, lat1]; // ptA
		this.points[1] = [lng2, lat1]; // ptB
		this.points[2] = [lng1, lat2]; // ptC
		this.points[3] = [lng2, lat2]; // ptD

		for(let pt of this.points)
			pt.node = new TgNode(pt[1], pt[0]);
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

	calRealNodes() {
		this.calModifiedNodes('real');
	}

	calTargetNodes() {
		this.calModifiedNodes('target');
	}

	calModifiedNodes(kind) {
		let transformFuncName;
		if (kind === 'real') transformFuncName = 'transformReal';
		else if (kind === 'target') transformFuncName = 'transformTarget';
		else throw 'ERROR in calModifiedNodes()';

		const transform = this.graph[transformFuncName].bind(this.graph);

		for(let pt of this.points) {
			let modified = transform(pt.node.original.lat, pt.node.original.lng);
			pt.node[kind].lat = modified.lat;
			pt.node[kind].lng = modified.lng;
			console.log(pt);
		}
	}

	calDispNodes(kind, value) {
		for(let pt of this.points) {
			if (kind === 'intermediateReal') {
				pt.node.disp.lat = (1 - value) * pt.node.original.lat + value * pt.node.real.lat;
				pt.node.disp.lng = (1 - value) * pt.node.original.lng + value * pt.node.real.lng;
			}
			else if (kind === 'intermediateTarget') {
				pt.node.disp.lat = (1 - value) * pt.node.original.lat + value * pt.node.target.lat;
				pt.node.disp.lng = (1 - value) * pt.node.original.lng + value * pt.node.target.lng;
			}
			else {
				pt.node.disp.lat = pt.node[kind].lat;
				pt.node.disp.lng = pt.node[kind].lng;
			}
		}
	}

	updateDisp() {
		for(let pt of this.points) {
			pt[0] = pt.node.disp.lng; 
			pt[1] = pt.node.disp.lat; 
		}
	}

	updateLayer(param) {

		this.removeLayer();
		this.updateDisp();

		const viz = this.data.viz;
		const box = this.data.box;

		let arr = [];

		const yellow = 'rgb(240, 210, 88)';
		const red = 'rgb(12, 76, 138)';

		const yellowStyleFunc = this.mapUtil.nodeStyleFunc(yellow, 3);
		const redStyleFunc = this.mapUtil.nodeStyleFunc(red, 10);

		for(let pt of this.points) {
			// draw points
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(pt), redStyleFunc);

			// draw lines
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[pt.node.disp.lng, pt.node.disp.lat], [pt.node.target.lng, pt.node.target.lat]]), 
					this.mapUtil.lineStyle(viz.color.controlPointLine, viz.width.controlPointLine));
		}

		// draw texts
		const delta = 0.0015;
		this.mapUtil.addFeatureInFeatures(arr, 
				new ol.geom.Point([this.points[0][0], this.points[0][1] + delta]),
				this.mapUtil.textStyle({text: 'A', color: '#000'}));

		this.mapUtil.addFeatureInFeatures(arr, 
				new ol.geom.Point([this.points[1][0], this.points[1][1] + delta]),
				this.mapUtil.textStyle({text: 'B', color: '#000'}));

		this.mapUtil.addFeatureInFeatures(arr, 
				new ol.geom.Point([this.points[2][0], this.points[2][1] + delta]),
				this.mapUtil.textStyle({text: 'C', color: '#000'}));

		this.mapUtil.addFeatureInFeatures(arr, 
				new ol.geom.Point([this.points[3][0], this.points[3][1] + delta]),
				this.mapUtil.textStyle({text: 'D', color: '#000'}));

		///////
		const getAvg = function(arr) {
			let sum = 0;
			for(let elm of arr) sum += elm;
			return sum / arr.length;		
		}

		const numPts = 4;
		const pxPerM = 0.172966822; // px/meter
		const cmPerPx = 0.0156; // cm/px
		const cmPerM = cmPerPx * pxPerM; // cm/meter
		const cLat = this.map.tgOrigin.origin.original.lat;
		const cLng = this.map.tgOrigin.origin.original.lng;

		let S = new Array(numPts);
		let T = new Array(numPts);
		let L = new Array(numPts);
		let Cs = new Array(numPts);
		let Ct = new Array(numPts);

		// L
		for(let i = 0; i < numPts; ++i) {
			L[i] = TgUtil.distance(
					this.points[i].node.disp.lat, this.points[i].node.disp.lng, cLat, cLng) * 1000;
			L[i] *= cmPerM;
		}


		// S
		for(let i = 0; i < numPts; ++i) {
			S[i] = TgUtil.distance(
					this.points[i].node.original.lat, this.points[i].node.original.lng, cLat, cLng) * 1000;
			Cs[i] = S[i] / L[i];
		}
		const Csp = getAvg(Cs);

		// T
		T[0] = this.map.tgControl.controlPoints[6].travelTime;
		T[1] = this.map.tgControl.controlPoints[8].travelTime;
		T[2] = this.map.tgControl.controlPoints[16].travelTime;
		T[3] = this.map.tgControl.controlPoints[18].travelTime;
		
		for(let i = 0; i < numPts; ++i) {
			Ct[i] = T[i] / L[i];
		}
		const Ctp = getAvg(Ct);

		// console.log('S: ', S);
		// console.log('Ls: ', Ls);
		// console.log('Cs: ', Cs);
		// console.log('Csp: ', Csp);
		// console.log('T: ', T);
		// console.log('Lt: ', Lt);
		// console.log('Ct: ', Ct);
		// console.log('Ctp: ', Ctp);			

		let Lp = new Array(numPts);
		let Sp = new Array(numPts);
		let Tp = new Array(numPts);

		// Sp
		for(let i = 0; i < numPts; ++i) {
			Lp[i] = L[i];
			Sp[i] = Lp[i] * Csp;
			Tp[i] = Lp[i] * Ctp;
		}

		

		let s_sp = new Array(numPts);
		let t_tp = new Array(numPts);

		for(let i = 0; i < numPts; ++i) {
			s_sp[i] = Math.abs(S[i] - Sp[i]);
			t_tp[i] = Math.abs(T[i] - Tp[i]);
		}

		console.log('-----');
		console.log('Csp: ', Csp);
		console.log('Ctp: ', Ctp);			
		console.log('Lp: ', Lp);
		console.log('Sp: ', Sp);
		console.log('Tp: ', Tp);
		console.log('S_Sp: ', s_sp);
		console.log('T_Tp: ', t_tp);

		let q = 0;
		for(let i = 0; i < numPts; ++i) {
			q += (Ctp / Csp) * s_sp[i] + t_tp[i];
		}
		
		console.log('q: ' + q);
		console.log('-----');



		console.log(this.map.tgControl.controlPoints);

































		/*let xs = new Array(numPts);
		for(let i = 0; i < numPts; ++i) {
			xs[i] = {lat: 0, lat: 0};
		}

		const i = 1;
		const dLat = Math.abs(this.points[i].node.original.lat - this.points[i].node.disp.lat);
		const dLng = Math.abs(this.points[i].node.original.lng - this.points[i].node.disp.lng);
		const level = 3;

		for(let lv = 0; lv < level + 1; ++lv) {
			xs[i].lat = this.points[i].node.original.lat + lv * dLat / level;
			xs[i].lng = this.points[i].node.original.lng + lv * dLng / level;

			const d = TgUtil.distance(xs[i].lat, xs[i].lng, cLat, cLng) * 1000;
			const l = cmPerM * d;
			const lp = l;
			const sp = lp * Csp;
			const tp = lp * Ctp;

			console.log('**');
			console.log('*lp: ' + lp);
			console.log('*sp: ' + sp);
			console.log('*tp: ' + tp);
			console.log('*S0: ' + S[i]);
			console.log('*T0: ' + T[i]);

			//const q = Math.abs((Ctp / Csp)*(sp - S[i])*(sp - S[i]) + (tp - T[i])*(tp - T[i]));
			const q = (Ctp / Csp) * Math.abs(sp - S[i]) + Math.abs(tp - T[i]);

			console.log('*q: ' + q);
		}*/








	/*const o_a = TgUtil.distance(this.points[0].node.disp.lat, this.points[0].node.disp.lng, cLat, cLng); 
	const o_b = TgUtil.distance(this.points[1].node.disp.lat, this.points[1].node.disp.lng, cLat, cLng); 
	const o_c = TgUtil.distance(this.points[2].node.disp.lat, this.points[2].node.disp.lng, cLat, cLng); 
	const o_d = TgUtil.distance(this.points[3].node.disp.lat, this.points[3].node.disp.lng, cLat, cLng); 

	console.log('o_a: ' + o_a);
	console.log('o_b: ' + o_b);
	console.log('o_c: ' + o_c);
	console.log('o_d: ' + o_d);*/



	const heightLat = box.top - box.bottom;
	const pxPerLat = this.map.olMapHeightPX / heightLat;
  const widthLng = box.right - box.left;
	const pxPerLng = this.map.olMapWidthPX / widthLng;

	// (47.709160488864995 - 47.69327346998924) / (47.709160488864995 - 47.651373509329176)

	const lat1 = 47.69327346998924;
	const lat2 = 47.667276530010746;
	const lng1 = -122.34663590490722;
	const lng2 = -122.30801209509276;

	const lat1px = (box.top - lat1) / (box.top - box.bottom) * this.map.olMapHeightPX;
	const lat2px = (box.top - lat2) / (box.top - box.bottom) * this.map.olMapHeightPX;
	const lng1px = (lng1 - box.left) / (box.right - box.left) * this.map.olMapWidthPX;
	const lng2px = (lng2 - box.left) / (box.right - box.left) * this.map.olMapWidthPX;


	/*const o_a = TgUtil.distance(this.points[0][1], this.points[0][0], cLat, cLng); 
	const o_b = TgUtil.distance(this.points[1][1], this.points[1][0], cLat, cLng); 
	const o_c = TgUtil.distance(this.points[2][1], this.points[2][0], cLat, cLng); 
	const o_d = TgUtil.distance(this.points[3][1], this.points[3][0], cLat, cLng); 

	console.log('o_a: ' + o_a);
	console.log('o_b: ' + o_b);
	console.log('o_c: ' + o_c);
	console.log('o_d: ' + o_d);*/

	/*const o_a = TgUtil.distance(this.points[0].node.disp.lat, this.points[0].node.disp.lng, cLat, cLng); 
	const o_b = TgUtil.distance(this.points[1].node.disp.lat, this.points[1].node.disp.lng, cLat, cLng); 
	const o_c = TgUtil.distance(this.points[2].node.disp.lat, this.points[2].node.disp.lng, cLat, cLng); 
	const o_d = TgUtil.distance(this.points[3].node.disp.lat, this.points[3].node.disp.lng, cLat, cLng); 

	console.log('o_a: ' + o_a);
	console.log('o_b: ' + o_b);
	console.log('o_c: ' + o_c);
	console.log('o_d: ' + o_d);*/

	//console.log('points: ', this.points);

	/*console.log('lat1px: ' + lat1px);
	console.log('lat2px: ' + lat2px);
	console.log('lng1px: ' + lng1px);
	console.log('lng2px: ' + lng2px);
	*/

	//TgUtil.distance(centerLat, centerLng, lat, lng);
	/*
	const a_b = TgUtil.distance(ptA[1], ptA[0], ptB[1], ptB[0]); 
	const a_c = TgUtil.distance(ptA[1], ptA[0], ptC[1], ptC[0]); 
	const a_d = TgUtil.distance(ptA[1], ptA[0], ptD[1], ptD[0]); 
	console.log('a_b:' + a_b * 1000);
	console.log('a_c:' + a_c * 1000);
	console.log('a_d:' + a_d * 1000);

	console.log('h: ' + $('#ol_map').height());
	console.log('w: ' + $('#ol_map').width());

	const heightLat = box.top - box.bottom;
  const latPerPx = heightLat / this.map.olMapHeightPX;

  const widthLng = box.right - box.left; // 0.09784
	const lngPerPx = widthLng / this.map.olMapWidthPX;

	console.log('heightLat: ' + heightLat);
	console.log('this.map.olMapHeightPX: ' + this.map.olMapHeightPX);
	console.log('latPerPx: ' + latPerPx);

	console.log('widthLng: ' + widthLng);
	console.log('this.map.olMapWidthPX: ' + this.map.olMapWidthPX);
	console.log('lngPerPx: ' + lngPerPx);
	*/


	/*const a_b = TgUtil.distance(
		this.points[0].node.disp.lat, this.points[0].node.disp.lng, 
		this.points[1].node.disp.lat, this.points[1].node.disp.lng); 
	const a_c = TgUtil.distance(
		this.points[0].node.disp.lat, this.points[0].node.disp.lng, 
		this.points[2].node.disp.lat, this.points[2].node.disp.lng); 
	const a_d = TgUtil.distance(
		this.points[0].node.disp.lat, this.points[0].node.disp.lng, 
		this.points[3].node.disp.lat, this.points[3].node.disp.lng); 
	const b_c = TgUtil.distance(
		this.points[1].node.disp.lat, this.points[1].node.disp.lng, 
		this.points[2].node.disp.lat, this.points[2].node.disp.lng); 
	const b_d = TgUtil.distance(
		this.points[1].node.disp.lat, this.points[1].node.disp.lng, 
		this.points[3].node.disp.lat, this.points[3].node.disp.lng); 
	const c_d = TgUtil.distance(
		this.points[2].node.disp.lat, this.points[2].node.disp.lng, 
		this.points[3].node.disp.lat, this.points[3].node.disp.lng);

	console.log('a_b:' + a_b * 1000);
	console.log('a_c:' + a_c * 1000);
	console.log('a_d:' + a_d * 1000);
	console.log('b_c:' + b_c * 1000);
	console.log('b_d:' + b_d * 1000);
	console.log('c_d:' + c_d * 1000);*/

	//bottom: 47.651373509329176
//left: -122.3702393442383
//right: -122.28440865576174
//top: 47.709160488864995

/*
latPx: 347.77104817792446
tg_map_perception.js:247 lngPx: 274.1122470104032
tg_map_perception.js:248 latCm: 5.425228351575622
tg_map_perception.js:249 lngCm: 4.27615105336229
tg_map_perception.js:230 1
tg_map_perception.js:246 latPx: 268.278656515535
tg_map_perception.js:247 lngPx: 843.9512622417675
tg_map_perception.js:248 latCm: 4.185147041642345
tg_map_perception.js:249 lngCm: 13.165639690971572
tg_map_perception.js:230 2
tg_map_perception.js:246 latPx: 638.038720726656
tg_map_perception.js:247 lngPx: 294.7764676549369
tg_map_perception.js:248 latCm: 9.953404043335834
tg_map_perception.js:249 lngCm: 4.598512895417015
tg_map_perception.js:230 3
tg_map_perception.js:246 latPx: 687.7941466232578
tg_map_perception.js:247 lngPx: 779.1211253247328
tg_map_perception.js:248 latCm: 10.72958868732282
tg_map_perception.js:249 lngCm: 12.154289555065832
*/
		
		// Print original and displayed lat lng
		

		//this.printLatLng(0, 'A');
		//this.printLatLng(1, 'B');
		//this.printLatLng(2, 'C');
		//this.printLatLng(3, 'D');

		//for(let i = 0; i < 4; ++i) {
		//	console.log(i);
		//	this.getLatLngCm(this.points[i].node.disp.lat, this.points[i].node.disp.lng);
		//}

		// console.log('L 0-1: ' + this.getL(0, 1));
		// console.log('L 0-2: ' + this.getL(0, 2));
		// console.log('L 0-3: ' + this.getL(0, 3));
		// console.log('L 1-2: ' + this.getL(1, 2));
		// console.log('L 1-3: ' + this.getL(1, 3));
		// console.log('L 2-3: ' + this.getL(2, 3));

		// console.log('---');
		// console.log('for L 0-1');
		// const L = this.getL(0, 1);
		// const gauss = this.gaussian(L, L * 0.06);
		// for(let i = 0; i < 30; ++i) {
		// 	console.log(gauss());
		// }
		


		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(100);
	  this.mapUtil.addLayer(this.layer);
	}

	printLatLng(i, text) {
		console.log('p' + text + '.o.lat: ' + this.points[i].node.original.lat);
		console.log('p' + text + '.o.lng: ' + this.points[i].node.original.lng);
		console.log('p' + text + '.d.lat: ' + this.points[i].node.disp.lat);
		console.log('p' + text + '.d.lng: ' + this.points[i].node.disp.lng);
	}

	getLatLngCm(lat, lng) {
		const box = this.data.box;
		const latPx = (box.top - lat) / (box.top - box.bottom) * this.map.olMapHeightPX;
		const lngPx = (lng - box.left) / (box.right - box.left) * this.map.olMapWidthPX;

		//console.log('latPx: ' + latPx);
		//console.log('lngPx: ' + lngPx);
		//console.log('latCm: ' + latPx * 0.0156);
		//console.log('lngCm: ' + lngPx * 0.0156);

		return {latCm: latPx * 0.0156, lngCm: lngPx * 0.0156};
	}

	getL(i0, i1) {
		const p0 = this.getLatLngCm(this.points[i0].node.disp.lat, this.points[i0].node.disp.lng);
		const p1 = this.getLatLngCm(this.points[i1].node.disp.lat, this.points[i1].node.disp.lng);
		const v = (p0.latCm - p1.latCm)*(p0.latCm - p1.latCm) + (p0.lngCm - p1.lngCm)*(p0.lngCm - p1.lngCm);
		return Math.sqrt(v);
	}

	gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0) 
           return retval;
       return -retval;
  	}
	}

}