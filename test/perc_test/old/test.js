/*
 * Test for Perception-based warping
 */

// constants
const org = {lat: 47.680274999999995, lng: -122.32732399999999}; // origin point
const pxPerM = 0.172966822; // px/meter
const cmPerPx = 0.0156; // cm/px
const cmPerM = cmPerPx * pxPerM; // cm/meter

// points
// array of 24 points, having the following variables
// 1) o = {lat:x, lng:x} (original points)
// 2) t = {lat:x, lng:x} (warped points, using the naive(not Gap or S-Gap) method)
// 3) time = x (travel time in second)

// calculate S
for(let pt of points) {
	pt.S = distance(pt.o.lat, pt.o.lng, org.lat, org.lng) * 1000; // m
}

// 11 steps (0, 0.1, 0.2, ..., 1)
for(let step = 0; step <= 1; step += 0.1) {
	console.log('-------');
	console.log('step: ' + step.toFixed(1));

	// For each point
	for(let pt of points) {

		// (mLat, mLng) between o ~ t by linear interpolation
		const mLat = pt.o.lat * (1 - step) + pt.t.lat * step;
		const mLng = pt.o.lng * (1 - step) + pt.t.lng * step;

		// calculate L, Cs, Ct
		pt.L = distance(mLat, mLng, org.lat, org.lng) * 1000; // m
		pt.L *= cmPerM; // cm
		pt.Cs = pt.S / pt.L;
		pt.Ct = pt.time / pt.L;
	}

	// calculate Csp, Ctp
	let Csp = 0, Ctp = 0;
	for(let pt of points) {Csp += pt.Cs; Ctp += pt.Ct}
	Csp /= points.length;
	Ctp /= points.length;

	// calculate Q
	let Q = 0;

// let's say we can tolerate 200 meter error in Space, 60 second error in time

	S_error_max=750;
	T_error_max=60;

	const Wt = 5.166

	for(let pt of points) {
		// calculate Lp, Sp, Tp
		// Assume that Lp is one sample of mean of L
		pt.Lp = pt.L;
		pt.Sp = pt.Lp * Csp;
		pt.Tp = pt.Lp * Ctp;

		//Q = Math.sqrt((pt.S - pt.Sp)*(pt.S - pt.Sp)/S_error_max/S_error_max + (pt.time - pt.Tp)*(pt.time - pt.Tp)/T_error_max/T_error_max);
		Q = Math.sqrt((pt.S - pt.Sp)*(pt.S - pt.Sp) + Wt * Wt * (pt.time - pt.Tp)*(pt.time - pt.Tp));

		if (!pt.Q) pt.Q = [];
		if (!pt.Q1) pt.Q1 = [];
		if (!pt.Q2) pt.Q2 = [];
		pt.Q.push(Q);
		pt.Q1.push((pt.S - pt.Sp)*(pt.S - pt.Sp));
		pt.Q2.push(Wt * Wt * (pt.time - pt.Tp)*(pt.time - pt.Tp));

	}
	Q /= points.length;

	console.log('Csp: ' + Csp);
	console.log('Ctp: ' + Ctp);
	console.log('Q: ' + Q);
}

console.log('points:', points);


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