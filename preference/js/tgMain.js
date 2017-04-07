class TGPreference {

	constructor(map_id) {
		this.opt = options
		this.util = new TGUtil()
		this.graph = new TGGraph(this)
		this.data = new TGData(this)
		this.map = new TGMap(this, map_id)

	  this.map.setArea('seattle_downtown');
	  //this.map.setArea('seattle_uw');
	  //this.map.setArea('ny_nyu');
	  //this.map.setArea('sf_lombard');
	}
}