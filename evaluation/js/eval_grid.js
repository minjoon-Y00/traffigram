class EvalGrid {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false; //true;
		this.layer = null;

		this.displayControlPoints = true;
		this.controlPointLayer = null;
	}

	updateLayer() {
		const gridLines = this.map.tgControl.gridLines;
		const viz = this.data.viz;
		let arr = [];

		for(let line of gridLines) {
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
				[[line.start.disp.lng, line.start.disp.lat], 
				[line.end.disp.lng, line.end.disp.lat]]), 
				this.mapUtil.lineStyle(viz.color.grid, viz.width.grid));
		}

		this.removeLayer();
		this.layer = this.mapUtil.olVectorFromFeatures(arr);
		this.layer.setZIndex(viz.z.grid);
	  this.mapUtil.addLayer(this.layer);
	}

	updateControlPointLayer() {
		const controlPoints = this.map.tgControl.controlPoints;
		const viz = this.data.viz;
		let arr = [];

		for(let point of controlPoints) {

			if (point.travelTime === null) continue;

			// draw control points
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(
					[point.disp.lng, point.disp.lat]), 
					this.mapUtil.nodeStyle(viz.color.controlPoint, viz.radius.controlPoint));

			// add text
			let text;
			if (point.travelTime === null) text = 'w';
			else text = (point.travelTime/60).toFixed(1);
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(
					[point.disp.lng, point.disp.lat]), 
					this.mapUtil.textStyle({
						text: text, color: viz.color.text, font: viz.font.text
					}));
		}

		this.removeControlPointLayer();
		this.controlPointLayer = this.mapUtil.olVectorFromFeatures(arr);
		this.controlPointLayer.setZIndex(viz.z.controlPoint);
	  this.mapUtil.addLayer(this.controlPointLayer);
	}

	removeLayer() {
		this.mapUtil.removeLayer(this.layer);
	}

	removeControlPointLayer() {
		this.mapUtil.removeLayer(this.controlPointLayer);
	}
}