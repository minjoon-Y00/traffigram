//const TgUtil = require('./tg_util');

class TgGraph {
	constructor(tg, data) {
		this.tg = tg;
		this.data = data;
		this.tpsTarget = null;
		this.tpsReal = null;
	}

	calWarping(noNeedToCalFactor) {
		const ctlPts = this.tg.map.tgControl.controlPoints;

		this.calDegrees(ctlPts);
		if (!noNeedToCalFactor) this.factor = this.calFactor(ctlPts);
		this.calTargetNodesOfCtlPts();
	}

	//
	// calculate the degrees of all nodes.
	//
	calDegrees(nodes) {
		const cLat = this.tg.map.tgOrigin.origin.original.lat;
		const cLng = this.tg.map.tgOrigin.origin.original.lng;

	  for(let node of nodes) {
	  	const lat = node.original.lat;
	    const lng = node.original.lng;
	    let deg = Math.atan((lng - cLng) / (lat - cLat));
	    //let deg = Math.atan((lng - cLng) * this.shrink() / (lat - cLat));

	    if ((cLat === lat) && (cLng === lng)) deg = 0;
	    if ((lat - cLat) < 0) deg += Math.PI;
	    node.deg = deg;
	  }
	}

	calFactor(nodes) {
		const cLat = this.tg.map.tgOrigin.origin.original.lat;
		const cLng = this.tg.map.tgOrigin.origin.original.lng;
		const MAX_ITERATION = 20;
		let start = 1000;
		let end = 100000;
		let eps = 10;

		for(let time = 0; time < MAX_ITERATION; time++) {
			const half = (start + end) / 2;
			const dif = this.calDifference(half, nodes, cLat, cLng);
			const after_dif = this.calDifference(half + eps, nodes, cLat, cLng);

			//console.log('[' + start + ', ' + end + ']');
			//console.log(dif + ' - ' + after_dif);

			if (dif < after_dif) {
				end = half; // '/'
			}
			else {
				start = half; // '\'
			}
		}
		return (start + end) / 2;
	}

	calDifference(factor, nodes, cLat, cLng) {
		const lenNodes = nodes.length;
		let target = Array(lenNodes);

		for(let i = 0; i < lenNodes; i++) {
			target[i] = {lat: 0, lng: 0};
		}
		
		for(let i = 0; i < lenNodes; i++) {
			if (nodes[i].travelTime) {
				const len = nodes[i].travelTime / factor;
	  		target[i].lat = cLat + len * Math.cos(nodes[i].deg);
	  		target[i].lng = cLng + len * Math.sin(nodes[i].deg) * this.magnify();
	  		//target[i].lng = cLng + len * Math.sin(nodes[i].deg);
	  	}
		}

		let sum = 0;
		for(let i = 0; i < lenNodes; i++) {
	   	if (nodes[i].travelTime) {
   			sum +=  TgUtil.D2(
   			//sum += tgUtil.distance(
   				nodes[i].original.lat, nodes[i].original.lng, target[i].lat, target[i].lng)
	   	}
	  }
	  return sum;
	}


	calTargetNodesOfCtlPts() {
		const nodes = this.tg.map.tgControl.controlPoints;
		const cLat = this.tg.map.tgOrigin.origin.original.lat;
		const cLng = this.tg.map.tgOrigin.origin.original.lng;

	  for(let node of nodes) {
			if (node.travelTime) {
				node.len = node.travelTime / this.factor;
				//node.len = tgUtil.D2(cLat, cLng, node.original.lat, node.original.lng);
				node.target.lat = cLat + node.len * Math.cos(node.deg);
				node.target.lng = cLng + node.len * Math.sin(node.deg) * this.magnify();
				//node.target.lng = cLng + node.len * Math.sin(node.deg);
			}
			else {
				node.target.lat = node.original.lat
				node.target.lng = node.original.lng
			}

	    if ((cLat === node.original.lat) && (cLng === node.original.lng)) {
	    	node.len = 0;
	  		node.target.lat = cLat;
	  		node.target.lng = cLng;
	    }

	    node.real.lat = node.target.lat;
	    node.real.lng = node.target.lng;
	  }
	}

	toLat() {
		
		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2)); // 900
		const heightLat = this.data.box.top - this.data.box.bottom; // 0.052025323579982796
		const latPerPx = heightLat / heightPX; // 0.00005780591508886977

		let widthPX = $('#ol_map').css('width'); 
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2)); // 570
  	const widthLng = this.data.box.right - this.data.box.left; // 0.048923492431640625
		const lngPerPx = widthLng / widthPX; // 0.0000858306884765625

		console.log('---');
		console.log(heightPX);
		console.log(heightLat);
		console.log(latPerPx);

		console.log(widthPX);
		console.log(widthLng);
		console.log(lngPerPx);

		/*
		return lngPerPx / latPerPx;
		*/
		
	  return 0.00016965364355785907 / 0.00011481966468342245; //1.477566
	}

	shrink() {
		return 0.00005780591508886977 / 0.0000858306884765625; // 0.673487725

		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2)); // 900
		const heightLat = this.data.box.top - this.data.box.bottom; // 0.052025323579982796
		const latPerPx = heightLat / heightPX; // 0.00005780591508886977

		let widthPX = $('#ol_map').css('width'); 
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2)); // 570
  	const widthLng = this.data.box.right - this.data.box.left; // 0.048923492431640625
		const lngPerPx = widthLng / widthPX; // 0.0000858306884765625

		console.log(latPerPx / lngPerPx);
		return latPerPx / lngPerPx;

	}

	magnify() {
		return 0.0000858306884765625 / 0.00005780591508886977; // 1.484808

		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2)); // 900
		const heightLat = this.data.box.top - this.data.box.bottom; // 0.052025323579982796
		const latPerPx = heightLat / heightPX; // 0.00005780591508886977

		let widthPX = $('#ol_map').css('width'); 
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2)); // 570
  	const widthLng = this.data.box.right - this.data.box.left; // 0.048923492431640625
		const lngPerPx = widthLng / widthPX; // 0.0000858306884765625

		return lngPerPx / latPerPx;
	}

	TPSSolve() {
		const nodes = this.tg.map.tgControl.controlPoints
  	let ptTarget = [];
  	let ptReal = [];
  	let counter = 0

  	for(let n of nodes) { 
	    ptTarget[counter] = 
	    		[[n.original.lat, n.original.lng], [n.target.lat, n.target.lng]];
	    ptReal[counter] = 
	    		[[n.original.lat, n.original.lng], [n.real.lat, n.real.lng]];
	    counter++;
	  }

	  this.tpsTarget = new ThinPlateSpline();
	  this.tpsTarget.push_points(ptTarget);
	  this.tpsTarget.solve();

	  this.tpsReal = new ThinPlateSpline();
	  this.tpsReal.push_points(ptReal);
	  this.tpsReal.solve();
	}

	TPSTest() {
		if ((!this.tpsTarget)||(!this.tpsReal)) {
			console.log('TPS is null');
			return false;
		}

		const lat = this.tg.map.tgOrigin.origin.original.lat;
		const lng = this.tg.map.tgOrigin.origin.original.lng;
		const pt = this.tpsTarget.transform([lat, lng], false);
		const d = TgUtil.D2(lat, lng, pt[0], pt[1]);

		if (d < 0.1) return true;
		else {
			console.log(lat + '->' + pt[0]);
			console.log(lng + '->' + pt[1]);
			console.log('d = ' + d);
			return false;
		}
	}

	transformTarget(lat, lng) {
		const pt = this.tpsTarget.transform([lat, lng], false);
		return {lat: pt[0], lng: pt[1]};
	}

	transformReal(lat, lng) {
		const pt = this.tpsReal.transform([lat, lng], false);
		return {lat: pt[0], lng: pt[1]};
	}
}

//module.exports = TgGraph;