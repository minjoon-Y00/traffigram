var tg = new TGPreference('ol_map');
//tg.map.updateLayers();

//if ($("#waterCB").is(':checked')) tg.map.dispWaterLayer = true;




function zoomIn() {
	tg.map.zoomIn();
}

function zoomOut() {
	tg.map.zoomOut();
}

function debug() {
	tg.map.debug()
}

function debug2() {
	tg.map.debug2()
}




/*$("#noIntersectionCB").change(function(ev){ 
	tg.map.noIntersection = ev.target.checked
});

function getTravelTime() {
	tg.map.tgGrid.getTravelTime()
}

function saveTravelTime() {
	tg.map.tgGrid.saveTravelTimeToFile()
}

function splitGrid() {
	tg.data.splitGrid()
}

function calWarping() {
	tg.graph.calWarping()

	if (tg.map.noIntersection) {
		tg.map.tgControl.makeNonIntersectedGrid();
	}

	tg.map.updateLayers()
}

function calTPS() {
	tg.graph.TPSSolve()

	if (tg.graph.TPSTest()) console.log('TPS complete.')
	else console.log('TPS failed...')
}

function moveElements() {
	tg.map.moveElements()
	tg.map.updateLayers()
}*/


//
//
// Center Options
//
//
$("#centerDowntownSeattleRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('seattleDowntown');
  }
});

$("#centerUWSeattleRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('seattleUw');
  }
});

$("#centerLombardSFRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('sfLombard');
  }
});

$("#centerNYUNYRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('nyNyu');
  }
});

$("#centerStanfordPaloAltoRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('paloAltoStanford');
  }
});

$("#centerCitadelleQuebecRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setArea('quebecCitadelle');
  }
});

$("#centerYourPositionRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.initMap();
  	tg.map.setCenterUserPosition();
  }
});

//
//
// EM -> DC
//
//

$("#emModeRB").change(function(ev){
  if (ev.target.checked) tg.map.goToEm();
});

$("#dcGapModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.warpingMode = 'noIntersection';

  	if (tg.map.currentMode !== 'DC') tg.map.goToDc(true); // animation
  	else tg.map.goToDc(false); // no animation
  	
  }
});

$("#dcSGapModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.warpingMode = 'shapePreserving';

  	if (tg.map.currentMode !== 'DC') tg.map.goToDc(true); // animation
  	else tg.map.goToDc(false); // no animation
  }
});


//
//
// Locations
//
//
$("#locationRestaurantRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('food');
	} 
});

$("#locatioBarRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('bar');
	} 
});

$("#locationParkRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('park');
	} 
});

$("#locationMuseumRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.tgLocs.changeType('museum');
	} 
});

$("#locationNoRB").change(function(ev){
	if (ev.target.checked) {
		
	} 
});



//
//
// Visual Elements Representation Options
//
//
$("#dispWaterCB").change(function(ev){ 
	tg.map.tgWater.turn(ev.target.checked);
	tg.map.tgWater.render();
});

$("#dispRoadsCB").change(function(ev){ 
	tg.map.tgRoads.turn(ev.target.checked);
	tg.map.tgRoads.render();
});

$("#dispLanduseCB").change(function(ev){ 
	tg.map.tgLanduse.turn(ev.target.checked);
	tg.map.tgLanduse.render();
});

$("#dispLocationCB").change(function(ev){
	tg.map.tgLocs.turn(ev.target.checked);
	tg.map.tgLocs.render();
});

$("#dispPlaceCB").change(function(ev){ 
	tg.map.dispPlaceLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispNodesCB").change(function(ev){ 
	tg.map.dispNodeLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispOriginCB").change(function(ev){ 
	tg.map.tgOrigin.turn(ev.target.checked);
	tg.map.tgOrigin.render();
});

$("#dispControlPointsCB").change(function(ev){
	tg.map.dispControlPointLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispGridCB").change(function(ev){
	tg.map.dispGridLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispIsochroneCB").change(function(ev){
	tg.map.tgIsochrone.turn(ev.target.checked);
	tg.map.tgIsochrone.render();
});

$("#dispWaterNodeCB").change(function(ev){ 
	tg.map.dispWaterNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispRoadNodeCB").change(function(ev){ 
	tg.map.dispRoadNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispLanduseNodeCB").change(function(ev){ 
	tg.map.dispLanduseNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});




//
//
// Roads Options
//
//
$("#roadTypeHighwayCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('highway');
	else tg.map.removeRoadType('highway');
	tg.map.updateLayers();
})

$("#roadTypePrimaryCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('primary');
	else tg.map.removeRoadType('primary');
	tg.map.updateLayers(); 
})

$("#roadTypeSecondaryCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('secondary');
	else tg.map.removeRoadType('secondary');
	tg.map.updateLayers(); 
})

$("#roadTypeTertiaryCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('tertiary');
	else tg.map.removeRoadType('tertiary');
	tg.map.updateLayers(); 
})

$("#roadTypeResidentialCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('residential');
	else tg.map.removeRoadType('residential');
	tg.map.updateLayers();  
})

$("#roadTypeLinksCB").change(function(ev){
	if (ev.target.checked) tg.map.addRoadType('links');
	else tg.map.removeRoadType('links');
	tg.map.updateLayers();  
})

/*var randomSlider = new Slider("#randomSlider");
//$("#randomSlider").on("change", function(evt) {
$("#randomSlider").on("slideStop", function(evt) {
  tg.data.randomness = evt.value / 100;
  tg.data.moveControlPoints();
  tg.map.updateLayers();
});*/

