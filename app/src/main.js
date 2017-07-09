const TgApp = require('./tg_app');

// create the main app object
const tg = new TgApp('ol_map');

/*
 * For the origin setting
 */
const myHome = {
	address: '4225 24th Ave. NE, Seattle, WA',
	lat: 47.6631772,
	lng: -122.3104933,
};

/* 
followings are also possible:

const myHome = {
	address: '4225 24th Ave. NE Seattle',
	// if lat and lng are omitted, the app search them automatically.
};

const myHome = {
	lat: 47.706846,
	lng: -122.302471,
	// providing lat and lng make the app faster.
};*/

const myOffice = {
	address: '3960 Benton Lane NE, Seattle, WA',
}

const otherPlace = {
	address: '1000 4th Ave, Seattle, WA 98104',
}

// default: myHome
//tg.setOriginAndGo(myHome);
//tg.setOriginAndGo(myOffice);
tg.setOriginAndGo(otherPlace);

// ui for origin setting
$("#yourHomeInput").val(myHome.address);
$("#yourOfficeInput").val(myOffice.address);
$("#otherPlaceInput").val(otherPlace.address);

$("#originYourLocationRB").change(function(ev){
  if (ev.target.checked) {
  	tg.initMap();
  	tg.setCurrentLocationToOrigin();
  }
});

$("#originYourHomeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.initMap();
  	tg.setOriginAndGo(myHome);
  }
});

$("#originYourOfficeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.initMap();
  	tg.setOriginAndGo(myOffice);
  }
});

$("#originOtherPlaceRB").change(function(ev){
  if (ev.target.checked) {
  	tg.initMap();
  	otherPlace.address = $("#otherPlaceInput").val();
  	tg.setOriginAndGo(otherPlace);
  }
});

/*
 * For the mode of the map (EM <-> DC)
 */

$("#emModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.goToEm();
  }
});

$("#dcSGapModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.goToDc('shapePreserving');
  }
});

$("#dcGapModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.goToDc('noIntersection');
  }
});

$("#dcOriginalModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.goToDc('originalDC');
  }
});

$("#dcNoWarpModeRB").change(function(ev){
  if (ev.target.checked) {
  	tg.goToDc('noWarping');
  }
});

/*
 * For the mode of the transportation
 */
$("#transportVehiclesRB").change(function(ev){
	if (ev.target.checked) {
		tg.setTransportTypeAndGo('auto');
	} 
});

$("#transportBicyclesRB").change(function(ev){
	if (ev.target.checked) {
		tg.setTransportTypeAndGo('bicycle');
	} 
});

$("#transportOnFootRB").change(function(ev){
	if (ev.target.checked) {
		tg.setTransportTypeAndGo('pedestrian');
	} 
});

/*
 * For the type of the destination
 */
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



/*
 * For general ui
 */

function zoomIn() {
	tg.zoomIn();
}

function zoomOut() {
	tg.zoomOut();
}




// Visual Elements Representation Options (For debugging)

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
	tg.map.tgPlaces.turn(ev.target.checked);
	tg.map.tgPlaces.render();
});

$("#dispNodesCB").change(function(ev){ 
	tg.map.dispNodeLayer = ev.target.checked
	tg.map.updateLayers()
});

$("#dispOriginCB").change(function(ev){ 
	tg.map.tgOrigin.turn(ev.target.checked);
	tg.map.tgOrigin.render();
});

$("#dispBoundingBoxCB").change(function(ev){ 
	tg.map.tgBB.turn(ev.target.checked);
	tg.map.tgBB.render();
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


function debug() {
	tg.map.debug()
}


/*
// Center Options
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
});*/



/*
// Roads Options
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
})*/

/*var randomSlider = new Slider("#randomSlider");
//$("#randomSlider").on("change", function(evt) {
$("#randomSlider").on("slideStop", function(evt) {
  tg.data.randomness = evt.value / 100;
  tg.data.moveControlPoints();
  tg.map.updateLayers();
});*/

