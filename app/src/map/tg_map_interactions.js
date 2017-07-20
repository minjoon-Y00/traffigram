class TgMapInteraction extends ol.interaction.Pointer{
  constructor(map) {
    super();
    this.map = map;
    this.data = map.data;
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
    this.dragging = false;
    this.draggedObject = null;

    ol.interaction.Pointer.call(this, {
      handleDownEvent: this.handleDownEvent,
      handleDragEvent: this.handleDragEvent,
      handleMoveEvent: this.handleMoveEvent,
      handleUpEvent: this.handleUpEvent
    });
  }

  handleDownEvent(evt) {
    const feature = 
        evt.map.forEachFeatureAtPixel(evt.pixel, (feature) => {return feature;});

    if (feature) {

      switch(feature.type) {
        case 'origin':
          this.dragging = true;
          this.draggedObject = feature.type;
          this.coordinate_ = evt.coordinate;
          this.feature_ = feature;
          break;
        case 'loc':
          console.log(feature.source);
          this.map.tgLocs.showModal(feature.source);
          break;
        case 'cLoc':
          console.log(feature.source);
          break;
      }

      //console.log('handleDown');
      //console.log(feature.type);
      //console.log(feature);
      
    }

    return !!feature;
  };

  handleDragEvent(evt) {
    if (this.dragging) {
      const deltaX = evt.coordinate[0] - this.coordinate_[0];
      const deltaY = evt.coordinate[1] - this.coordinate_[1];
      const geometry = this.feature_.getGeometry();
      geometry.translate(deltaX, deltaY);

      this.coordinate_[0] = evt.coordinate[0];
      this.coordinate_[1] = evt.coordinate[1];

      //console.log('handleDrag');
    }
  };

  handleMoveEvent(evt) {
    if (this.cursor_) {
      const feature = 
          evt.map.forEachFeatureAtPixel(evt.pixel, (feature) => {return feature;});
      const element = evt.map.getTargetElement();

      if (feature) {
        if (feature.type === 'origin') {
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
      //console.log('handleMove');
    }
  };

  handleUpEvent(evt) {
    this.coordinate_ = null;
    this.feature_ = null;

    if (this.dragging) {
      this.dragging = false;
      const pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 
          'EPSG:3857', 'EPSG:4326');

      switch(this.draggedObject) {
        case 'origin':
          this.map.setCenter(pt[1], pt[0]);
          break;
      }
    }

    return false;
  };
}

module.exports = TgMapInteraction;