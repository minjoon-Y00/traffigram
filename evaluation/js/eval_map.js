class EvalMap {
	constructor(tg, map_id) {
		this.tg = tg;
		this.data = tg.data;
		this.graph = tg.graph;

    this.olMap = new ol.Map({
	    target: map_id,
	    layers: [],
	    view: new ol.View({
	      center: ol.proj.fromLonLat([0,0]),
	      maxZoom: this.data.zoom.max,
	    	minZoom: this.data.zoom.min,
	    	zoom: this.data.zoom.init,
	    })
	  });

		this.mapUtil = new TgMapUtil(this.data, this.olMap);
	  this.tgWater = new EvalWater(this, this.data, this.graph);
	  this.tgRoads = new EvalRoads(this, this.data, this.graph);
	  this.tgOrigin = new EvalOrigin(this, this.data, this.graph);
	  this.tgLocs = new EvalLocations(this, this.data, this.graph);
	  this.tgControl = new EvalControl(this, this.data, this.graph);
	  this.tgGrids = new EvalGrid(this, this.data, this.graph);

  	//this.tgRoads.dispNodeLayer = false;



		this.data.zoom.current = this.olMap.getView().getZoom();
		$('#curZoom').text(this.data.zoom.current);
		this.olMap.on('moveend', this.onMoveEnd.bind(this));

		this.currentOrigin = 0;

	  this.currentMode = 'EM';

	  this.tgWater.init();


	}

	onMoveEnd(e) {
		const z = this.olMap.getView().getZoom();
		
		// zooming.
		if (this.data.zoom.current != z) {
			this.data.zoom.current = z;
		  $('#curZoom').text(this.data.zoom.current);

	    this.onZoomEnd();
	  }
		// panning.
	  else {}
	}

	onZoomEnd() {
		this.calBoundaryBox();
		this.tgRoads.updateLayer();
		this.tgLocs.update();
		this.tgControl.calculateControlPoints();
		//this.tgGrids.updateLayer();
		//this.tgGrids.updateControlPointLayer();
	}

	calBoundaryBox() {
	  const box = this.data.box;
	  const vars = this.data.var;
		const extent = this.olMap.getView().calculateExtent(this.olMap.getSize());
	  const bottomLeft = 
	  		ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326');
	  const topRight = 
	  		ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');

	  box.left = bottomLeft[0];
	  box.bottom = bottomLeft[1];
	  box.right = topRight[0];
	  box.top = topRight[1];
	}

	setCenter(lat, lng) {
		this.olMap.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
		this.tgOrigin.setOrigin(lat, lng);
		//this.tgControl.setOrigin(lat, lng);
		//this.currentCenter.lat = lat;
		//this.currentCenter.lng = lng;
		this.tgOrigin.updateLayer();

		this.calBoundaryBox();
	  this.tgRoads.updateLayer();
		this.tgLocs.update();
		this.tgControl.calculateControlPoints();
		//this.tgGrids.updateLayer();
		//this.tgGrids.updateControlPointLayer();



		//this.requestControlPoints();
	}
}