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
		//if (!noNeedToCalFactor) this.factor = this.calFactor(ctlPts);
		if (!noNeedToCalFactor) this.factor = this.calFactor2(ctlPts);
		this.calTargetNodesOfCtlPts();

		console.log('factor: ' + this.factor); // 17590.715885162354
	}

	meterToSec(meter) {
		return 0.0861 * meter + 250.64;
	}

	secToMeter(sec) {
		return (sec - 250.64) / 0.0861;
	}

	//
	// calculate the degrees of all nodes.
	//
	calDegrees(nodes) {
		const cyPx = this.tg.map.hMapHalfPx;
		const cxPx = this.tg.map.wMapHalfPx;

		// const cLat = this.tg.map.tgOrigin.origin.original.lat;
		// const cLng = this.tg.map.tgOrigin.origin.original.lng;

	  for(let node of nodes) {
	  	const lat = node.original.lat;
	    const lng = node.original.lng;
	    const xyPx = this.tg.map.latlngToPx(lat, lng);

	    let deg = Math.atan((xyPx.xPx - cxPx) / (xyPx.yPx - cyPx));

			if ((cxPx === xyPx.xPx) && (cyPx === xyPx.yPx)) deg = 0;
	    if ((xyPx.yPx - cyPx) < 0) deg += Math.PI;


	    // let deg = Math.atan((lng - cLng) / (lat - cLat));
	    //let deg = Math.atan((lng - cLng) * this.shrink() / (lat - cLat));

	    // if ((cLat === lat) && (cLng === lng)) deg = 0;
	    // if ((lat - cLat) < 0) deg += Math.PI;
	    node.deg = deg;
	  }
	}
/*
		latlngToPx(lat, lng) {
		const box = this.data.box;
  	//const yPx = (box.top - lat) / box.heightLat * this.olMapHeightPX;
  	const yPx = (lat - box.bottom) / box.heightLat * this.olMapHeightPX;
  	const xPx = (lng - box.left) / box.widthLng * this.olMapWidthPX;
  	return {yPx: yPx, xPx: xPx};
	}*/

	calDegrees_old(nodes) {
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

// latlngToPx(lat, lng)
// 	pxToLatlng(yPx, xPx)


	calTargetNodesOfCtlPts() {
		const nodes = this.tg.map.tgControl.controlPoints;
		const cLat = this.tg.map.tgOrigin.origin.original.lat;
		const cLng = this.tg.map.tgOrigin.origin.original.lng;

	  for(let node of nodes) {
			if (node.travelTime) {

				node.len = node.travelTime / this.factor;

				const yPx = this.tg.map.hMapHalfPx + node.len * Math.cos(node.deg);
				const xPx = this.tg.map.wMapHalfPx + node.len * Math.sin(node.deg);
	    	const latlng = this.tg.map.pxToLatlng(yPx, xPx);
	    	
	    	// const px = this.tg.map.latlngToPx(node.target.lat, node.target.lng);
	    	// const latlng = this.tg.map.pxToLatlng(px.yPx, px.xPx);
	    	
	    	node.target.lat = latlng.lat;
	    	node.target.lng = latlng.lng;



				// 500 / (17.590 * 1000)
				//node.len = tgUtil.D2(cLat, cLng, node.original.lat, node.original.lng);
				// node.target.lat = cLat + node.len * Math.cos(node.deg);
				//node.target.lng = cLng + node.len * Math.sin(node.deg) * this.magnify();
				// node.target.lng = cLng + node.len * Math.sin(node.deg);
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

	    // const px = this.tg.map.latlngToPx(node.target.lat, node.target.lng);
	    // const latlng = this.tg.map.pxToLatlng(px.yPx, px.xPx);
	    //console.log(node.target.lat + ' ' + node.target.lng);
	    //console.log(px.yPx + ' ' + px.xPx);
	    //console.log(latlng.lat + ' ' + latlng.lng);



	  }
	}

	calFactor2(nodes) {
		const cLat = this.tg.map.tgOrigin.origin.original.lat;
		const cLng = this.tg.map.tgOrigin.origin.original.lng;
		const delta = 0.05;
		let start = delta;
		let end = 10;

		let minDif = 987654321;
		let minI = -1;
		for(let i = start; i < end; i += 0.05) {
			const dif = this.calDifference(i, nodes, cLat, cLng);
			//console.log('i = ' + i + ' dif: ' + dif);
			if (dif < minDif) {
				minDif = dif;
				minI = i;
			}
			else break;
		}
		//console.log('minDif: ' + minDif);
		//console.log('minI: ' + minI);
		return minI;
	}


	calFactor(nodes) {
		const cLat = this.tg.map.tgOrigin.origin.original.lat;
		const cLng = this.tg.map.tgOrigin.origin.original.lng;
		const MAX_ITERATION = 20;
		let start = 0; //1000;
		let end = 5; //100000;
		let eps = 10;

		for(let time = 0; time < MAX_ITERATION; time++) {
			const half = (start + end) / 2;
			const dif = this.calDifference(half, nodes, cLat, cLng);
			const after_dif = this.calDifference(half + eps, nodes, cLat, cLng);

			console.log('[' + start + ', ' + end + ']');
			console.log(dif + ' - ' + after_dif);

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
		
/*		for(let i = 0; i < lenNodes; i++) {
			if (nodes[i].travelTime) {
				const len = nodes[i].travelTime / factor;
	  		target[i].lat = cLat + len * Math.cos(nodes[i].deg);
	  		// target[i].lng = cLng + len * Math.sin(nodes[i].deg) * this.magnify();
	  		target[i].lng = cLng + len * Math.sin(nodes[i].deg);
	  	}
		}*/

		for(let i = 0; i < lenNodes; i++) {
			if (nodes[i].travelTime) {
				const len = nodes[i].travelTime / factor;

				const yPx = this.tg.map.hMapHalfPx + len * Math.cos(nodes[i].deg);
				const xPx = this.tg.map.wMapHalfPx + len * Math.sin(nodes[i].deg);
	    	const latlng = this.tg.map.pxToLatlng(yPx, xPx);
	    	target[i].lat = latlng.lat;
	    	target[i].lng = latlng.lng;



	  		// target[i].lat = cLat + len * Math.cos(nodes[i].deg);
	  		// // target[i].lng = cLng + len * Math.sin(nodes[i].deg) * this.magnify();
	  		// target[i].lng = cLng + len * Math.sin(nodes[i].deg);
	  	}
		}

		// const px = this.tg.map.latlngToPx(node.target.lat, node.target.lng);
	 //    const latlng = this.tg.map.pxToLatlng(px.yPx, px.xPx);

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
  	let counter = 0;

  	let top = this.data.box.top;
		let bottom = this.data.box.bottom;
		let right = this.data.box.right;
		let left = this.data.box.left;

		const height = top - bottom;
		const weight = right - left;

		//-50 - -60

  	for(let n of nodes) { 
	    ptTarget[counter] = 
	    		[[n.original.lat, n.original.lng], [n.target.lat, n.target.lng]];
	    ptReal[counter] = 
	    		[[n.original.lat, n.original.lng], [n.real.lat, n.real.lng]];
	    counter++;
	  }

	  const step = 5;
	  for(let w = 0; w <= weight; w += weight / step) {
	  	ptTarget[counter] = [[top, left + w], [top, left + w]];
	  	ptReal[counter++] = [[top, left + w], [top, left + w]];
	  	ptTarget[counter] = [[bottom, left + w], [bottom, left + w]];
	  	ptReal[counter++] = [[bottom, left + w], [bottom, left + w]];
	  }
	  for(let h = height / step; h < height; h += height / step) {
	  	ptTarget[counter] = [[bottom + h, left], [bottom + h, left]];
	  	ptReal[counter++] = [[bottom + h, left], [bottom + h, left]];
	  	ptTarget[counter] = [[bottom + h, right], [bottom + h, right]];
	  	ptReal[counter++] = [[bottom + h, right], [bottom + h, right]];
	  }


	 /* ptTarget[counter++] = [[top, right], [top, right]];
	  ptTarget[counter++] = [[bottom, left], [top, left]];
	  ptTarget[counter++] = [[bottom, right], [top, right]];*/

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