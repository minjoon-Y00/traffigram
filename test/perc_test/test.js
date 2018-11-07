/*
 * Test for Perception-based warping
 */

// constants
const org = {lat: 47.680275, lng: -122.327324}; // origin point
const pxPerM = 0.172966822; // px/meter
const cmPerPx = 0.0156; // cm/px
const cmPerM = cmPerPx * pxPerM; // cm/meter
const Wt = 5.166 // weight for time error
const stepSize = 20;
// points
// array of 24 points, having the following variables
// 1) o = {lat:x, lng:x} (original points)
// 2) t = {lat:x, lng:x} (warped points, using the naive(not Gap or S-Gap) method)
// 3) time = x (travel time in second)

// global variables
let Css, Cts;
let meterPerMin;

// entry point

calCsCt();
calIsochrone();
calQ();
findMinimumSteps();

const sMap = new simpleMap();
sMap.init(org, points);
//sMap.dispBaseMap();
sMap.dispGrid();
sMap.dispIsochrone([2, 4, 6, 8]);

console.log(sMap.pts);	

// for(let pt of sMap.pts) console.log(pt.time);
// console.log('');
// for(let pt of sMap.pts) console.log(pt.t.meter);

/*let S = 0, T = 0
for(let pt of points) {
	S += distance(pt.o.lat, pt.o.lng, org.lat, org.lng) * 1000; // m
	T += pt.time;
}
console.log(S + ' ' + T + ' ' + (S / T)); // 4.9981804736374285
*/

// calculate two arrays (Css and Cts), which stores Cs and Ct per each step
function calCsCt() {
	Css = new Array(stepSize + 1);
	Cts = new Array(stepSize + 1);

	// calculate S
	for(let pt of points) {
		pt.S = distance(pt.o.lat, pt.o.lng, org.lat, org.lng) * 1000; // m
		pt.t.meter = distance(pt.t.lat, pt.t.lng, org.lat, org.lng) * 1000; // m
		pt.Ls = new Array(stepSize + 1);
	}

	// step = [0, 1, ..., stepSize + 1]
	for(let step = 0; step <= stepSize; ++step) {
		// w = [0, ..., 1]
		const w = step * (1 / stepSize);
		let Cs = 0, Ct = 0;

		// For each point
		for(let pt of points) {

			// (r.lat, r.lng) between o (t=0) ~ t (t=1)
			const r = {
				lat: pt.o.lat * (1 - w) + pt.t.lat * w,
				lng: pt.o.lng * (1 - w) + pt.t.lng * w,
			}

			// calculate L, Cs, Ct
			pt.L = distance(r.lat, r.lng, org.lat, org.lng) * 1000; // m
			pt.L *= cmPerM; // cm
			pt.Ls[step] = pt.L;
			pt.Cs = pt.S / pt.L;
			pt.Ct = pt.time / pt.L;
			Cs += pt.Cs;
			Ct += pt.Ct;
		}
		Css[step] = Cs / points.length;
		Cts[step] = Ct / points.length;
	}
	// console.log('Css:', Css);
	// console.log('Cts:', Cts);
}

function calIsochrone() {

const extent = this.olMap.getView().calculateExtent(this.olMap.getSize());
	  const bottomLeft = 
	  		ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
	  const topRight = 
	  		ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

	  box.left = bottomLeft[0];
	  box.bottom = bottomLeft[1];
	  box.right = topRight[0];
	  box.top = topRight[1];

  	vars.latPerPx = (box.top - box.bottom) / this.olMapHeightPX;
  	vars.lngPerPx = (box.right - box.left) / this.olMapWidthPX;


  	  	this.olMapHeightPX = $('#ol_map').css('height'); 
  	this.olMapHeightPX = 
  			Number(this.olMapHeightPX.slice(0, this.olMapHeightPX.length - 2)); // 900
  	this.olMapWidthPX = $('#ol_map').css('width');  
  	this.olMapWidthPX = 
  			Number(this.olMapWidthPX.slice(0, this.olMapWidthPX.length - 2)); // 600


	let totalDistT = 0, totalTime = 0, maxTime = 0;
	for(let pt of points) {
		totalDistT += distance(pt.t.lat, pt.t.lng, org.lat, org.lng) * 1000; // m
		totalTime += pt.time;
		if (maxTime < pt.time) maxTime = pt.time;
	}
	totalTime /= 60; // min
	maxTime /= 60; // min
	meterPerMin = totalDistT / totalTime;
	console.log('meterPerMin: ' + meterPerMin); // 319.0107904444213
	console.log('maxTime: ' + maxTime); // 16.396666666666665

	let isoArr = [4, 8, 12, 16];
	calLt(isoArr);


}

function calLt(isoArr) {

	let meterArr = [];
	for(let min of isoArr) meterArr.push(min * meterPerMin);

	console.log('meterArr:,' + meterArr);

	for(let pt of points) {
		const OT = distance(pt.t.lat, pt.t.lng, org.lat, org.lng) * 1000; // m

		let minMeter = 987654321;
		let minIndex = -1;
		for(let i = 0; i < meterArr.length; ++i) {
			if (Math.abs(OT - meterArr[i]) < minMeter) {
				minMeter = Math.abs(OT - meterArr[i]);
				minIndex = i;
			}
		}
		pt.Lt = Math.abs(OT - meterArr[minIndex]) * cmPerM;
	}
}

// calculate Q_accuracy per each point and step
function qAccuracy(pt, step) {
	const Sp = pt.Ls[step] * Css[step];
	const Tp = pt.Ls[step] * Cts[step];
	let Q = (pt.S - Sp) * (pt.S - Sp);
	Q += Wt * Wt * (pt.time - Tp) * (pt.time - Tp);

	const Kvs = 0.06;
	//Q += Kvs * Sp;

	if (!pt.Qn) pt.Qn = [];
	pt.Qn[step] = Math.sqrt(Q) + Kvs * Sp;


	//if (!pt.Q1) pt.Q1 = [];
	//if (!pt.Q2) pt.Q2 = [];
	//pt.Q1[step] = Math.abs(pt.S - Sp);
	//pt.Q1[step] = (pt.S - Sp) * (pt.S - Sp);
	//pt.Q2[step] = Wt * Math.abs(pt.time - Tp);
	//pt.Q2[step] = Wt * Wt * (pt.time - Tp) * (pt.time - Tp);

	return Math.sqrt(Q);
}

// calculate Q
function calQ() {
	for(let pt of points) {
		pt.Q = new Array(stepSize + 1);	

		for(let step = 0; step <= stepSize; ++step) {
			pt.Q[step] = qAccuracy(pt, step);
		}		
	}
}

// calculate the step having minimum Q
function findMinimumSteps() {
	for(let pt of points) {
		pt.minQ = 987654321;
		pt.minStep = -1;
		for(let i = 0; i < pt.Q.length; ++i) {
			if (pt.Q[i] < pt.minQ) { pt.minQ = pt.Q[i]; pt.minStep = i; }
		}
		//console.log(pt.Q);
		//console.log(pt.minStep);
	}
	for(let pt of points) {
		//console.log(pt);
		const w = pt.minStep * (1 / stepSize);
		if (!pt.r) pt.r = {};
		pt.r.lat = pt.o.lat * (1 - w) + pt.t.lat * w;
		pt.r.lng = pt.o.lng * (1 - w) + pt.t.lng * w;
	}

	for(let idx = 0; idx < points.length; ++idx) {
		const pt = points[idx];
		pt.minQn = 987654321;
		pt.minStepN = -1;
		for(let i = 0; i < pt.Qn.length; ++i) {
			if (pt.Qn[i] < pt.minQn) { pt.minQn = pt.Qn[i]; pt.minStepN = i; }
		}
		if (pt.minStep != pt.minStepN) {
			console.log(idx + ' => ' + pt.minStep + ' ' + pt.minStepN);
		}
	}
}




function distance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  //const R = 3959 // = 6371 * 0.621371; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180 ) * 
  	Math.cos(lat2 * Math.PI / 180 ) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

