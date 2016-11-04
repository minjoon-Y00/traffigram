class TGGraph {

	constructor(tg) {
		this.tg = tg;
		this.tps = null;
	}

	calWarping() {
		var ctlPts = this.tg.data.controlPoints;

		//this.tg.saveTravelTime();
		console.log(ctlPts);

		this.calDegrees(ctlPts);
		this.factor = this.calFactor(ctlPts);
		console.log('factor = ' + this.factor);

		this.calTargetNodes(ctlPts);



		
		//console.log(this.tg.data.noi);
	}

	//
	// calculate the degrees of all nodes.
	//
	calDegrees(nodes) {
		var xLat = this.tg.data.centerPosition.lat;
		var xLng = this.tg.data.centerPosition.lng;
	  var yLat, yLng, deg;

	  for(var i = 0; i < nodes.length; i++) {
	  	yLat = nodes[i].original.lat;
	    yLng = nodes[i].original.lng;
	    
	    deg = Math.atan((yLng - xLng) / (yLat - xLat));

	    if ((xLat == yLat)&&(xLng == yLng)) deg = 0;
	    if ((yLat - xLat) < 0) deg = deg + Math.PI;
	    
	    nodes[i].deg = deg;
	  }
	}

	calFactor(nodes) {
		var cLat = this.tg.data.centerPosition.lat;
		var cLng = this.tg.data.centerPosition.lng;
		var min_factor = 0;
		var min_dif = Number.MAX_VALUE;

		for(var f = 15000; f < 23000; f += 100) {
			var dif = this.calDifference(f, nodes, cLat, cLng);

			console.log('[' + f + '] dif = ' + dif);

			if (dif < min_dif) {
				min_dif = dif;
				min_factor = f;
			} else {
				break;
			}
		}
		return min_factor;
	}

	calDifference(factor, nodes, cLat, cLng) {
		var lenNodes = nodes.length;
		var target = Array(lenNodes);
		var len;

		for(var i = 0; i < lenNodes; i++) {
			target[i] = {lat:0, lng:0}
		}
		
		for(var i = 0; i < lenNodes; i++) {
			if (nodes[i].travelTime) {
				len = nodes[i].travelTime / factor;
	  		target[i].lat = cLat + len * Math.cos(nodes[i].deg);	
	  		target[i].lng = cLng + len * Math.sin(nodes[i].deg);
	  		//target[i].lng = cLng + len * Math.sin(nodes[i].deg) * this.toLat(nodes[i].deg);
	  	}
		}

		var sum = 0;
		for(var i = 0; i < lenNodes; i++) {
	   	if (nodes[i].travelTime) {
   			sum +=  this.tg.util.D2(nodes[i].original.lat, nodes[i].original.lng, target[i].lat, target[i].lng);
	   	}
	  }
	  return sum;
	}


	calTargetNodes(nodes) {
		var xLat = this.tg.data.centerPosition.lat;
		var xLng = this.tg.data.centerPosition.lng;

	  for(var i = 0; i < nodes.length; i++) {

			if (nodes[i].travelTime) {
				nodes[i].len = nodes[i].travelTime / this.factor;
				nodes[i].target.lat = xLat + nodes[i].len * Math.cos(nodes[i].deg);
				nodes[i].target.lng = xLng + nodes[i].len * Math.sin(nodes[i].deg);
				//nodes[i].target.lng = xLng + nodes[i].len * Math.sin(nodes[i].deg) * this.toLat(nodes[i].deg);
			}
			else {
				nodes[i].target.lat = nodes[i].original.lat;
				nodes[i].target.lng = nodes[i].original.lng;
			}

	    if ((xLat == nodes[i].original.lat)&&(xLng == nodes[i].original.lng)) {
	    	nodes[i].len = 0;
	  		nodes[i].target.lat = xLat;
	  		nodes[i].target.lng = xLng;
	    }

	    //console.log(nodes[i].len + ',' + nodes[i].deg);
	    //console.log(nodes[i].original.lat + '->' + nodes[i].target.lat);
	  }

		/*
	  var sum = 0;
	  for(var i in nodes) {
	   	//console.log('(' + nodes[i].orgNodes.lat + ', ' + nodes[i].orgNodes.lng + ') -> (' 
	    //  + nodes[i].targetNodes.lat + ', ' + nodes[i].targetNodes.lng + ')' );

	   	if (nodes[i].time) {
	   		//sum += Math.abs(nodes[i].orgNodes.lat - nodes[i].targetNodes.lat);
	   		//sum += Math.abs(nodes[i].orgNodes.lng - nodes[i].targetNodes.lng);
	   		sum +=  this.tg.util.D2(nodes[i].original.lat, nodes[i].original.lng, nodes[i].target.lat, nodes[i].target.lng);
	   	}
	  }
	  console.log('dif = ' + sum);
	  return sum;*/
	}

	toLat(deg) {
	  //var v = -0.2427 * Math.cos(2*deg) + 1.2427
	  //var d = 0.06;
	  //return (-d * Math.cos(4*deg) + 1 + d) * v;
	  return -0.2427 * Math.cos(2*deg) + 1.2427;
	}






	//
	//
	//
	TPSSolve(nodes) {

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




		//
  	var pt = [];
  	var counter = 0;

  	for(var i = 0; i < nodes.length; i++) { 
	    pt[counter] = [[nodes[i].original.lat, nodes[i].original.lng], 
	    	[nodes[i].target.lat, nodes[i].target.lng]];
	    counter++;
	    //console.log(nodes[i].original.lat + '->' + nodes[i].target.lat)
	    //console.log(nodes[i].original.lng + '->' + nodes[i].target.lng)
	  }

	  this.tps = new ThinPlateSpline();
	  this.tps.push_points(pt);
	  this.tps.solve();
	}

	TPSTest(lat, lng) {
		if (!this.tps) {
			console.log('TPS is null');
			return false;
		}

		var trpt = this.tps.transform([lat, lng], false);
		var d = this.tg.util.D2(lat, lng, trpt[0], trpt[1]);

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

	transform(lat, lng) {
		var trpt = this.tps.transform([lat, lng], false);
		return {lat:trpt[0], lng:trpt[1]};
	}
}