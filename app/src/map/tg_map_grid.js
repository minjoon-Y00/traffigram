//const TgNode = require('../node/tg_node');

class TgMapGrid {
	constructor(map, data, graph) {
		this.map = map;
		this.data = data;
		this.graph = graph;
		this.mapUtil = map.mapUtil;

		this.isDisabled = false;
		this.display = false;
		this.layer = null;

		this.displayControlPoints = true;
		this.controlPointLayer = null;
	}

	turn(tf) {
		this.display = tf;
	}

	disabled(tf) {
		this.isDisabled = tf;
	}
	
	render() {
		if (this.isDisabled||(!this.display)) {
			this.discard();
		}
		else {
			this.updateLayer();
			if (this.displayControlPoints) this.updateControlPointLayer();
		}
	}

	discard() {
		this.removeLayer();
		this.removeControlPointLayer();
	}

	updateLayer() {
		const gridLines = this.map.tgControl.gridLines;
		const viz = this.data.viz;
		let arr = [];

		for(let line of gridLines) {
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
				[[line.start.disp.lng, line.start.disp.lat], 
				[line.end.disp.lng, line.end.disp.lat]]), 
				this.mapUtil.lineStyle(viz.color.grid, viz.width.grid), 'grid');
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
			// draw control points
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(
					[point.disp.lng, point.disp.lat]), 
					this.mapUtil.nodeStyle(viz.color.controlPoint, viz.radius.controlPoint), 'cp');

			// draw additional lines meaning difference between target and real.
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.LineString(
					[[point.disp.lng, point.disp.lat], [point.target.lng, point.target.lat]]), 
					this.mapUtil.lineStyle(viz.color.controlPointLine, viz.width.controlPointLine), 
					'cpLine');

			// add text
			let text = (point.travelTime != null) ? (point.travelTime / 60).toFixed(1) : '-';
			//let text = (point.travelTime != null) ? point.travelTime + '' : '-';
			//text += ',' + point.index;
			this.mapUtil.addFeatureInFeatures(arr, new ol.geom.Point(
					[point.disp.lng, point.disp.lat]), 
					this.mapUtil.textStyle({
						text: text, color: viz.color.text, font: viz.font.text
					}), 'cpText');
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

	calDispNodes(kind, value) {
		const controlPoints = this.map.tgControl.controlPoints;

		if (kind === 'intermediateReal') {
			for(let point of controlPoints) {
				point.disp.lat = (1 - value) * point.original.lat + value * point.real.lat;
				point.disp.lng = (1 - value) * point.original.lng + value * point.real.lng;
			}
		}
		else if (kind === 'intermediateTarget') {
			for(let point of controlPoints) {
				point.disp.lat = (1 - value) * point.original.lat + value * point.target.lat;
				point.disp.lng = (1 - value) * point.original.lng + value * point.target.lng;
			}
		}
		else {
			for(let point of controlPoints) {
				point.disp.lat = point[kind].lat;
				point.disp.lng = point[kind].lng;
			}
		}
	}

}

//module.exports = TgMapGrid;