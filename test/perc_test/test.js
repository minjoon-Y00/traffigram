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

calQByAllSteps();
//calQByEachPoint();

function calQByEachPoint() {

	let Csps = new Array(11);
	let Ctps = new Array(11);

	// calculate S
	for(let pt of points) {
		pt.S = distance(pt.o.lat, pt.o.lng, org.lat, org.lng) * 1000; // m
	}

	// 11 steps (0, 0.1, 0.2, ..., 1)
	for(let i = 0; i <= 10; ++i) {
		const step = i * 0.1;

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
		Csps[i] = Csp;
		Ctps[i] = Ctp;



	}

	console.log('Csps: ', Csps);
	console.log('Ctps: ', Ctps);
	
	// For each point
	for(let pt of points) {

		console.log('-----');

		// calculate S
		pt.S = distance(pt.o.lat, pt.o.lng, org.lat, org.lng) * 1000; // m

		// 11 steps (0, 0.1, 0.2, ..., 1)
		for(let i = 0; i <= 10; ++i) {
			const step = i * 0.1;

			// (mLat, mLng) between o ~ t by linear interpolation
			const mLat = pt.o.lat * (1 - step) + pt.t.lat * step;
			const mLng = pt.o.lng * (1 - step) + pt.t.lng * step;

			// calculate L, Cs, Ct
			pt.L = distance(mLat, mLng, org.lat, org.lng) * 1000; // m
			pt.L *= cmPerM; // cm
			pt.Cs = pt.S / pt.L;
			pt.Ct = pt.time / pt.L;

			// calculate Csp, Ctp
			let Csp = Csps[i], Ctp = Ctps[i];

			// let Csp = 0, Ctp = 0;
			// for(let pt of points) {Csp += pt.Cs; Ctp += pt.Ct}
			// Csp /= points.length;
			// Ctp /= points.length;

			// calculate Q
			let Q = 0;
			let Wt = 5.166 // weight for time error (200m / 1min)
			// calculate Lp, Sp, Tp
			// Assume that Lp is one sample of mean of L
			pt.Lp = pt.L;
			pt.Sp = pt.Lp * Csp;
			pt.Tp = pt.Lp * Ctp;

			Q = Math.sqrt((pt.S - pt.Sp)*(pt.S - pt.Sp) + Wt * (pt.time - pt.Tp)*(pt.time - pt.Tp));

			console.log(step.toFixed(1) + ' Q: ' + Q);
		}
	}
}

function calQByAllSteps() {
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
		let Wt = 5.166 // weight for time error (200m / 1min)
		for(let pt of points) {
			// calculate Lp, Sp, Tp
			// Assume that Lp is one sample of mean of L
			pt.Lp = pt.L;
			pt.Sp = pt.Lp * Csp;
			pt.Tp = pt.Lp * Ctp;

			Q += Math.sqrt((pt.S - pt.Sp)*(pt.S - pt.Sp) + Wt * (pt.time - pt.Tp)*(pt.time - pt.Tp));
		}
		Q /= points.length;

		console.log('Csp: ' + Csp);
		console.log('Ctp: ' + Ctp);
		console.log('Q: ' + Q);
	}
}



//console.log('points:', points);


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