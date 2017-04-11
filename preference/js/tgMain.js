class TGPreference {

	constructor(map_id) {
		this.opt = options
		this.util = new TGUtil()
		this.graph = new TGGraph(this)
		this.data = new TGData(this)
		this.map = new TGMap(this, map_id)

	  this.map.setArea('seattleDowntown');
	  //this.map.setArea('seattleUw');
	  //this.map.setArea('nyNyu');
	  //this.map.setArea('sfLombard');
	}
}