//const TgUtil = require('../tg_util');

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
    this.tooltip = null;
    this.overlay = null;
    this.timer = null;
    this.downCoordinate = null;
    this.originMoving = false;
    this.isochroneMoving = false;
    this.curTime = 0;

    ol.interaction.Pointer.call(this, {
      handleDownEvent: this.handleDownEvent,
      handleDragEvent: this.handleDragEvent,
      handleMoveEvent: this.handleMoveEvent,
      handleUpEvent: this.handleUpEvent
    });
  }

  addOverlay() {
    this.tooltip = document.getElementById('tooltip');
    this.overlay = new ol.Overlay({
      element: this.tooltip,
      offset: [0, -30],
      positioning: 'top-center'
    });

    this.map.olMap.addOverlay(this.overlay);
  }

  handleDownEvent(evt) {

    /*const pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 
          'EPSG:3857', 'EPSG:4326');
    console.log(pt[1]);
    console.log(pt[0]);*/

    const feature = 
        evt.map.forEachFeatureAtPixel(evt.pixel, (feature) => {return feature;});
    
    if (feature) {

      switch(feature.type) {
        case 'origin':
          this.dragging = true;
          this.draggedObject = feature.type;
          this.coordinate_ = evt.coordinate;
          this.downCoordinate = evt.coordinate;
          this.feature_ = feature;
          this.timer = 
              setTimeout(this.longPress.bind(this), this.data.var.longPressTime);
          return true;
          break;

        case 'isochrone':
          if (this.map.currentMode === 'DC') {
            // if hightlight mode, start moving isochrone
            if (this.map.tgLocs.getHighLightMode()) {
              //this.map.tgIsochrone.discard();
              this.isochroneMoving = true;
              this.dragging = true;
            }
            // if normal mode, go to highlight mode
            else {
              const time = feature.source;
              this.map.tgIsochrone.discard(); // remove current isochrones
              this.map.tgLocs.setHighLightMode(true, time); // set highlight mode
              this.map.tgLocs.render();
              this.map.tgIsochrone.render();
            }
          }
          return true;
          break;
        case 'loc':
          console.log(feature.source);
          //this.map.tgLocs.showModal(feature.source);
          return true;
          break;
        case 'cLoc':
          //console.log(feature.source);
          if (typeof data_currentset != 'undefined') {
            data_currentset = feature.source.locs;
            console.log(data_currentset);
          }
          return true;
          break;
        default:
          this.disableHighlightMode();
      }
    }
    else {
      this.disableHighlightMode();
    }
  
    return false;
  };

  disableHighlightMode() {
    if (this.map.tgLocs.getHighLightMode()) {
      this.map.tgIsochrone.discard();
      this.map.tgLocs.setHighLightMode(false, 0);
      this.map.tgLocs.render();
      this.map.tgIsochrone.render();
    }
  }

  longPress() {
    console.log('long pressed');
    this.originMoving = true;
    this.map.tgOrigin.render({translucent: true}); // make it translucent
    this.feature_ = this.map.tgOrigin.feature;
  }

  handleDragEvent(evt) {
    if (this.dragging) {
      if (this.originMoving) {

        const deltaX = evt.coordinate[0] - this.coordinate_[0];
        const deltaY = evt.coordinate[1] - this.coordinate_[1];
        const geometry = this.feature_.getGeometry();
        geometry.translate(deltaX, deltaY);

        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];
      }
      else {
        if (this.timer) {
          // check dragged distance
          const dist = TgUtil.D2(this.downCoordinate[0], this.downCoordinate[1], 
              evt.coordinate[0], evt.coordinate[1]);

          if (dist > this.data.var.longPressSensitivity) {
            clearTimeout(this.timer);
            this.timer = null;
            if (this.map.currentMode === 'DC') {
              this.map.tgIsochrone.discard();
              this.isochroneMoving = true;
            }
          }
        }

        if (this.isochroneMoving) {
          const pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 
           'EPSG:3857', 'EPSG:4326');
          this.curTime = this.map.calTimeFromLatLng(pt[1], pt[0]);
          this.map.tgIsochrone.updateHighLightLayer(this.curTime);
        }
      }
    }
  };

  handleMoveEvent(evt) {
    /*
    if (this.cursor_) {
      const feature = 
          evt.map.forEachFeatureAtPixel(evt.pixel, (feature) => {return feature;});

      if ((feature) && ((feature.type === 'loc') || (feature.type === 'cLoc')))
        this.tooltip.style.display = '';
      else
        this.tooltip.style.display = 'none';

      if (feature) {

        // for tooltip
        if (feature.type) {
          this.overlay.setPosition(evt.coordinate);

          switch(feature.type) {
            case 'loc':
              this.tooltip.innerHTML = feature.source.name;
              break;
            case 'cLoc':
              const locs = feature.source.locs;
              let str = locs[0].name;
              for(let i = 1; i < locs.length; i++) {
                str += '<br/>' + locs[i].name;
              }
              this.tooltip.innerHTML = str;
              break;
          }
        }

        // for cursor
        const element = evt.map.getTargetElement();

        if ((feature.type === 'origin') || (feature.type === 'isochrone')) {
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
    }
    */
  };

  handleUpEvent(evt) {
    this.coordinate_ = null;
    this.feature_ = null;

    if (this.dragging) {
      this.dragging = false;
      if (this.timer) clearTimeout(this.timer);

      // when handle up while moving origin
      if (this.originMoving) {
        const pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 
          'EPSG:3857', 'EPSG:4326');
        this.map.setCenter(pt[1], pt[0]);
        this.map.tgOrigin.render(); // make it opaque
        this.originMoving = false;
      }

      // when handle up while moving isochrone
      if (this.isochroneMoving) {
        this.isochroneMoving = false;
        this.map.tgLocs.setHighLightMode(true, this.curTime);
        this.map.tgLocs.render();
      }
    }
    return false;
  };
}

//module.exports = TgMapInteraction;