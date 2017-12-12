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

  conv2x(evt) {
    evt.pixel[0] = evt.pixel[0] / map_scale;
    evt.pixel[1] = evt.pixel[1] / map_scale;

    //console.log(evt.pixel[0] + ' ; ' + evt.pixel[1]);
    //console.log(this.data.box.left);
    //console.log(this.data.box.top);

    let pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 
        'EPSG:3857', 'EPSG:4326');
    //console.log('org:' + pt[0] + ' , ' + pt[1]);

    const d0 = (pt[0] - this.data.box.left) / map_scale;
    const d1 = (this.data.box.top - pt[1]) / map_scale;

    pt[0] = this.data.box.left + d0;
    pt[1] = this.data.box.top - d1;

    //console.log('aft:' + pt[0] + ' , ' + pt[1]);

    const pt2 = ol.proj.transform([pt[0], pt[1]], 'EPSG:4326', 'EPSG:3857');
    evt.coordinate[0] = pt2[0];
    evt.coordinate[1] = pt2[1];

    return evt;
  }

  handleDownEvent(evt) {

    /*const pt = ol.proj.transform([evt.coordinate[0], evt.coordinate[1]], 
          'EPSG:3857', 'EPSG:4326');
    console.log(pt[1]);
    console.log(pt[0]);*/

   // console.log(evt.pixel);

    if (this.data.var.appDispMode === '2x') {
      evt = this.conv2x(evt);
    }

    const feature = 
        evt.map.forEachFeatureAtPixel(evt.pixel, (feature) => {return feature;});
    
    if (feature) {

      //console.log('feature.type: ' + feature.type);

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

              this.map.log('highlight_isochrone'); // Logging
            }
          }
          return true;

        case 'cancelIsochrone':
          this.disableHighlightMode();
          this.map.tgLocs.resetCurrentSet();
          return true;

        case 'loc':
          console.log(feature.source);

          if (typeof openDetail != 'undefined') {
            openDetail({simp: feature.source.id});
          }
          
          //this.map.tgLocs.showModal(feature.source);
          return true;
          break;
        case 'cLoc':
          //console.log(feature.source);
          if (typeof data_currentset != 'undefined') {
            data_currentset = feature.source.locs;
            console.log(data_currentset);
          }

          //if (this.data.var.appMode === 'pc') {
          //  if (typeof openList != 'undefined') openList();
          //}

          openList();

          return true;

        default:
          
      }
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
    this.timer = null;

    if (this.map.currentMode === 'EM') {
      this.originMoving = true;
      this.map.tgOrigin.render({translucent: true}); // make it translucent
      this.feature_ = this.map.tgOrigin.feature;
    }
  }

  handleDragEvent(evt) {
    if (this.dragging) {

      if (this.data.var.appDispMode === '2x') {
        evt = this.conv2x(evt);
      }

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

    if (this.data.var.appDispMode === '2x') {
      evt.pixel[0] = evt.pixel[0] / 2;
      evt.pixel[1] = evt.pixel[1] / 2;
    }
    
    if (this.cursor_) {
      const feature = 
          evt.map.forEachFeatureAtPixel(evt.pixel, (feature) => {return feature;});

      /*if ((feature) && ((feature.type === 'loc') || (feature.type === 'cLoc')))
        this.tooltip.style.display = '';
      else
        this.tooltip.style.display = 'none';
      */

      if (feature) {

        // for tooltip
        /*if (feature.type) {
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
        }*/

        // for cursor
        const element = evt.map.getTargetElement();

        if ((feature.type === 'origin') || (feature.type === 'isochrone') || 
            (feature.type === 'loc') || (feature.type === 'cLoc')) {
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } 
        else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
    }
    
  };

  handleUpEvent(evt) {
    //console.log('& handleUpEvent');

    if (this.data.var.appDispMode === '2x') {
      evt = this.conv2x(evt);
    }

    if (this.data.var.appMode === 'mobile') {
      evt.pixel[0] = evt.pixel[0] / 2;
      evt.pixel[1] = evt.pixel[1] / 2;
    }

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

        this.map.log('change_origin'); // Logging
      }

      // when handle up while moving isochrone
      if (this.isochroneMoving) {
        this.isochroneMoving = false;
        this.map.tgLocs.setHighLightMode(true, this.curTime);
        this.map.tgLocs.render();

        this.map.log('highlight_custom'); // Logging
      }
    }
    return false;
  };
}

//module.exports = TgMapInteraction;