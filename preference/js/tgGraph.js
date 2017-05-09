class TGGraph {

	constructor(tg) {
		this.tg = tg;
		this.tpsTarget = null;
		this.tpsReal = null;
	}

	calWarping() {
		this.tg.map.setTime('controlPointWarping', 'start', (new Date()).getTime());

		var ctlPts = this.tg.map.tgControl.controlPoints;
		this.calDegrees(ctlPts);
		this.factor = this.calFactor(ctlPts);
		this.calTargetNodesOfCtlPts();

		this.tg.map.setTime('controlPointWarping', 'end', (new Date()).getTime());
		//console.log('factor = ' + this.factor);
	}

	//
	// calculate the degrees of all nodes.
	//
	calDegrees(nodes) {
		var xLat = this.tg.map.tgOrigin.origin.original.lat
		var xLng = this.tg.map.tgOrigin.origin.original.lng
	  var yLat, yLng, deg

	  for(var i = 0; i < nodes.length; i++) {
	  	yLat = nodes[i].original.lat
	    yLng = nodes[i].original.lng
	    
	    deg = Math.atan((yLng - xLng) / (yLat - xLat))
	    if ((xLat == yLat)&&(xLng == yLng)) deg = 0
	    if ((yLat - xLat) < 0) deg = deg + Math.PI
	    nodes[i].deg = deg
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

			//console.log('[' + start + ', ' + end + ']');

			const half = (start + end) / 2;
			const dif = this.calDifference(half, nodes, cLat, cLng);
			const after_dif = this.calDifference(half + eps, nodes, cLat, cLng);

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
		var lenNodes = nodes.length
		var target = Array(lenNodes)
		var len

		for(var i = 0; i < lenNodes; i++) {
			target[i] = {lat:0, lng:0}
		}
		
		for(var i = 0; i < lenNodes; i++) {
			if (nodes[i].travelTime) {
				len = nodes[i].travelTime / factor
	  		target[i].lat = cLat + len * Math.cos(nodes[i].deg)
	  		target[i].lng = cLng + len * Math.sin(nodes[i].deg) * this.toLat();
	  	}
		}

		var sum = 0
		for(var i = 0; i < lenNodes; i++) {
	   	if (nodes[i].travelTime) {
   			sum +=  this.tg.util.D2(
   				nodes[i].original.lat, nodes[i].original.lng, target[i].lat, target[i].lng)
	   	}
	  }
	  return sum
	}


	calTargetNodesOfCtlPts() {
		var nodes = this.tg.map.tgControl.controlPoints
		var xLat = this.tg.map.tgOrigin.origin.original.lat
		var xLng = this.tg.map.tgOrigin.origin.original.lng

	  for(var i = 0; i < nodes.length; i++) {
			if (nodes[i].travelTime) {
				nodes[i].len = nodes[i].travelTime / this.factor
				nodes[i].target.lat = xLat + nodes[i].len * Math.cos(nodes[i].deg)
				nodes[i].target.lng = 
						xLng + nodes[i].len * Math.sin(nodes[i].deg) * this.toLat();
			}
			else {
				nodes[i].target.lat = nodes[i].original.lat
				nodes[i].target.lng = nodes[i].original.lng
			}

	    if ((xLat == nodes[i].original.lat)&&(xLng == nodes[i].original.lng)) {
	    	nodes[i].len = 0;
	  		nodes[i].target.lat = xLat
	  		nodes[i].target.lng = xLng
	    }

	    nodes[i].real.lat = nodes[i].target.lat;
	    nodes[i].real.lng = nodes[i].target.lng;
	  }
	}

	toLat() {
		/*
		let heightPX = $('#ol_map').css('height'); 
  	heightPX = Number(heightPX.slice(0, heightPX.length - 2));
		const heightLat = this.tg.opt.box.top - this.tg.opt.box.bottom;
		const latPerPx = heightLat / heightPX;

		let widthPX = $('#ol_map').css('width');  
  	widthPX = Number(widthPX.slice(0, widthPX.length - 2));
  	const widthLng = this.tg.opt.box.right - this.tg.opt.box.left;
		const lngPerPx = widthLng / widthPX;

		return lngPerPx / latPerPx;
		*/
		
	  return 0.00016965364355785907 / 0.00011481966468342245; //org
	}

	//
	//
	//
	TPSSolve() {

		/*
		// rearrangement
		var dLat = (this.tg.opt.box.top - this.tg.opt.box.bottom) / (this.tg.opt.resolution.gridLat - 1)
		var dLng = (this.tg.opt.box.right - this.tg.opt.box.left) / (this.tg.opt.resolution.gridLng - 1)
		var lngL, latB
		var nodes = [];

		for(var i = 0; i < this.tg.opt.resolution.gridLat; i++) {
			for(var j = 0; j < this.tg.opt.resolution.gridLng; j++) {

				lngL = this.tg.opt.box.left + dLng * j
				latB = this.tg.opt.box.bottom + dLat * i

				var min_dist = Number.MAX_VALUE
				var dist, min_k = 0

				for(var k = 0; k < ctlPts.length; k++) {
					dist = this.tg.util.D2(latB, lngL, ctlPts[k].original.lat, ctlPts[k].original.lng)

					if (dist < min_dist) {
						min_dist = dist
						min_k = k
					}
				}
				nodes.push(ctlPts[min_k])
			}
		}

		console.log(nodes)
		*/

		this.tg.map.setTime('tpsCalculating', 'start', (new Date()).getTime());


		var nodes = this.tg.map.tgControl.controlPoints
  	var ptTarget = [];
  	var ptReal = [];
  	var counter = 0

  	for(var i = 0; i < nodes.length; i++) { 
	    ptTarget[counter] = [[nodes[i].original.lat, nodes[i].original.lng], 
	    	[nodes[i].target.lat, nodes[i].target.lng]]
	    ptReal[counter] = [[nodes[i].original.lat, nodes[i].original.lng], 
	    	[nodes[i].real.lat, nodes[i].real.lng]]
	    counter++
	    //console.log(nodes[i].original.lat + '->' + nodes[i].target.lat)
	    //console.log(nodes[i].original.lng + '->' + nodes[i].target.lng)
	  }

	  this.tpsTarget = new ThinPlateSpline()
	  this.tpsTarget.push_points(ptTarget)
	  this.tpsTarget.solve()

	  this.tpsReal = new ThinPlateSpline()
	  this.tpsReal.push_points(ptReal)
	  this.tpsReal.solve()

		this.tg.map.setTime('tpsCalculating', 'end', (new Date()).getTime());

	}

	TPSTest() {
		if ((!this.tpsTarget)||(!this.tpsReal)) {
			console.log('TPS is null')
			return false
		}

		var lat = this.tg.map.tgOrigin.origin.original.lat
		var lng = this.tg.map.tgOrigin.origin.original.lng
		var trpt = this.tpsTarget.transform([lat, lng], false)
		var d = this.tg.util.D2(lat, lng, trpt[0], trpt[1])

		if (d < 0.1) {
			return true
		}
		else {
			console.log(lat + '->' + trpt[0])
			console.log(lng + '->' + trpt[1])
			console.log('d = ' + d)
			return false
		}
	}

	transformTarget(lat, lng) {
		var trpt = this.tpsTarget.transform([lat, lng], false)
		return {lat:trpt[0], lng:trpt[1]}
	}

	transformReal(lat, lng) {
		var trpt = this.tpsReal.transform([lat, lng], false)
		return {lat:trpt[0], lng:trpt[1]}
	}

	transform(lat, lng) {
		var trpt = this.tpsReal.transform([lat, lng], false)
		return {lat:trpt[0], lng:trpt[1]}
	}
}