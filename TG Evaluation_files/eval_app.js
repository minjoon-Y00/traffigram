class EvalApp {
	constructor(map_id) {
		this.data = EvalData;
		this.graph = new EvalGraph(this);
		this.map = new EvalMap(this, map_id);

  	this.map.setCenter(
  		this.data.origin[0].lat, 
  		this.data.origin[0].lng
  	);

	}
}