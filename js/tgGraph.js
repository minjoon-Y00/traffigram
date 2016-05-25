class TGGraph {

	constructor(util, options) {
		this.util = util;
		this.opt = options;
		this.tps = null;
	}

	//
	//
	//
	TPSSolve(nodes) {
  	var pt = [];
  	var counter = 0;

  	for(var i = 0; i < nodes.length; i++) { 
	    pt[counter] = [[nodes[i].original.lat, nodes[i].original.lng], 
	    	[nodes[i].target.lat, nodes[i].target.lng]];
	    counter++;
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
		var d = this.util.D2(lat, lng, trpt[0], trpt[1]);
		
		return (d < 0.1);
	}

	transform(lat, lng) {
		var trpt = this.tps.transform([lat, lng], false);
		return {lat:trpt[0], lng:trpt[1]};
	}
}