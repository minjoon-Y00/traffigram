class EvalApp {
	constructor(map_id) {
		this.data = EvalData;
		this.graph = new EvalGraph(this);
		this.map = new EvalMap(this, map_id);
		this.eval = new EvalCore(this.map, this.data);

  	this.map.setCenter(
  		this.data.origin[0].lat, 
  		this.data.origin[0].lng
  	);

  	this.eval.do();
	}

	setCenter(type) {
		this.map.setCenter(
  		this.data.origin[type].lat, 
  		this.data.origin[type].lng
  	);
  	this.map.currentOrigin = type;
	}

	debug() {
		//TgUtil.saveTextAsFile(edges_lv2, 'unq_edges_lv2.js');
		//TgUtil.saveTextAsFile(this.map.tgLocs.locsArr, 'locs_lv2.js');
		//TgUtil.saveTextAsFile(this.map.tgControl.ctlPtArr, 'ctlPt_lv0.js');
	}

	debug2() {
		//this.map.tgWater.finishGettingWaterObjects();
		this.map.tgLocs.debug();
	}

	debug3() {
		/*
		let obj = {};
		obj.origin = {
			lat: this.map.tgOrigin.getOrigin().original.lat, 
			lng: this.map.tgOrigin.getOrigin().original.lng
		};
		obj.ctlPt = [];
		let cnt = 0;
		for(let pt of this.map.tgControl.controlPoints) {
			let ptObj = {lat: pt.original.lat, lng: pt.original.lng};

			if (pt.travelTime === null) {
				ptObj.inWater = true;
			}
			else {
				cnt++;
			}
			obj.ctlPt.push(ptObj);
		}
		this.map.tgControl.ctlPtArr.push(obj);
		console.log('# real ctlPt: ' + cnt);

		console.log(this.map.tgControl.ctlPtArr);
		*/
	}
}