var tg = new TGPreference('ol_map');
//tg.map.updateLayers();

//if ($("#waterCB").is(':checked')) tg.map.dispWaterLayer = true;

//
//
// City Options
//
//
/*$("#citySeattleRB").change(function(ev){
	if (ev.target.checked) tg.setArea('Seattle'); 
});

$("#cityNYRB").change(function(ev){
  if (ev.target.checked) tg.setArea('NY'); 
});

$("#citySFRB").change(function(ev){
  if (ev.target.checked) tg.setArea('SF');
});*/


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

//
//
// EM -> DC
//
//

$("#emModeRB").change(function(ev){
  if (ev.target.checked) tg.map.goToEm();
})

$("#dcModeRB").change(function(ev){
  if (ev.target.checked) tg.map.goToDc();
})


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
  if (ev.target.checked) tg.map.setArea('seattleDowntown');
});

$("#centerUWSeattleRB").change(function(ev){
  if (ev.target.checked) tg.map.setArea('seattleUw');
});

$("#centerLombardSFRB").change(function(ev){
  if (ev.target.checked) tg.map.setArea('sfLombard');
});

$("#centerNYUNYRB").change(function(ev){
  if (ev.target.checked) tg.map.setArea('nyNyu');
});

$("#centerStanfordPaloAltoRB").change(function(ev){
  if (ev.target.checked) tg.map.setArea('paloAltoStanford');
});

$("#centerCitadelleQuebecRB").change(function(ev){
  if (ev.target.checked) tg.map.setArea('quebecCitadelle');
});

$("#centerYourPositionRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenterUserPosition();
});

//
//
// Warping Mode
//
//
$("#originalGridRB").change(function(ev){
  if (ev.target.checked) tg.map.adjustGrid = 'none';
})

$("#noIntersectedGridRB").change(function(ev){
  if (ev.target.checked) tg.map.adjustGrid = 'noIntersection';
  tg.map.needToCalWarping = true;
})

$("#shapePreservingGridRB").change(function(ev){
  if (ev.target.checked) tg.map.adjustGrid = 'shapePreserving';
  tg.map.needToCalWarping = true;
})

//
//
// Locations
//
//
$("#locationRestaurantRB").change(function(ev){
	if (ev.target.checked) {
		//tg.map.dispLocationLayer = false
		//tg.map.updateLayers()
	} 
});

$("#locatioBarRB").change(function(ev){
	if (ev.target.checked) {
		//tg.map.tgLocs.locationType = 'japanese'
		//tg.map.tgLocs.calLocalLocations()
		//tg.map.dispLocationLayer = true
		//tg.map.updateLayers()
	} 
});

$("#locationParkRB").change(function(ev){
	if (ev.target.checked) {

	} 
});

$("#locationMuseumRB").change(function(ev){
	if (ev.target.checked) {
		
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
	tg.map.dispWaterLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispRoadsCB").change(function(ev){ 
	tg.map.dispRoadLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispPlaceCB").change(function(ev){ 
	tg.map.dispPlaceLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispNodesCB").change(function(ev){ 
	tg.map.dispNodeLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispCenterPositionCB").change(function(ev){ 
	tg.map.dispCenterPositionLayer = ev.target.checked
	tg.map.updateLayers()
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
	tg.map.dispIsochroneLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispLocationCB").change(function(ev){
	tg.map.dispLocationLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispLocationNameCB").change(function(ev){
	tg.map.dispLocationNameLayer = ev.target.checked;
	tg.map.updateLayers();
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

