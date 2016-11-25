var tg = new TGAnalysis('ol_map');

// Checkboxes

if ($("#tileCB").is(':checked')) tg.map.dispTileLayer = true;

if ($("#motorwayCB").is(':checked')) { tg.map.addToDisplayedRoads('motorway') }
if ($("#trunkCB").is(':checked')) { tg.map.addToDisplayedRoads('trunk') }
if ($("#primaryCB").is(':checked')) { tg.map.addToDisplayedRoads('primary') }
if ($("#secondaryCB").is(':checked')) { tg.map.addToDisplayedRoads('secondary') }
if ($("#tertiaryCB").is(':checked')) { tg.map.addToDisplayedRoads('tertiary') }

if ($("#railCB").is(':checked')) { tg.map.addToDisplayedRoads('rail') }
if ($("#monorailCB").is(':checked')) { tg.map.addToDisplayedRoads('monorail') }
if ($("#lightrailCB").is(':checked')) { tg.map.addToDisplayedRoads('light_rail') }
if ($("#tramCB").is(':checked')) { tg.map.addToDisplayedRoads('tram') }
if ($("#disusedCB").is(':checked')) { tg.map.addToDisplayedRoads('disused') }

if ($("#motorwayLinkCB").is(':checked')) { tg.map.addToDisplayedRoads('motorway_link') }
if ($("#trunkLinkCB").is(':checked')) { tg.map.addToDisplayedRoads('trunk_link') }
if ($("#primaryLinkCB").is(':checked')) { tg.map.addToDisplayedRoads('primary_link') }
if ($("#secondaryLinkCB").is(':checked')) { tg.map.addToDisplayedRoads('secondary_link') }
if ($("#tertiaryLinkCB").is(':checked')) { tg.map.addToDisplayedRoads('tertiary_link') }

tg.map.updateLayers();

//if ($("#waterCB").is(':checked')) tg.map.dispWaterLayer = true;

//
//
// City Options
//
//
/*
$("#citySeattleRB").change(function(ev){
	if (ev.target.checked) tg.setArea('Seattle'); 
});

$("#cityNYRB").change(function(ev){
  if (ev.target.checked) tg.setArea('NY'); 
});

$("#citySFRB").change(function(ev){
  if (ev.target.checked) tg.setArea('SF');
});

//

$("#centerUWRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(47.658316, -122.312035);
});

$("#centerGasworksRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(47.648172, -122.336375);
});

$("#centerSeattleUnivRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(47.610409, -122.316805);
});

$("#centerBellevueRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(47.620179, -122.185630);
});
*/


//
//
// Map Style Options
//
//
$("#mapStyleSimpleRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.dispTileLayer = false;
		tg.map.updateLayers();		
	} 
});

$("#mapStyleSatelliteRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.dispTileLayer = true;
		tg.map.updateLayers();
	}
});

//
//
// Road Representation Options
//
//
$("#highwayCB").change(function(ev){ 
	$("#motorwayCB").prop('checked', ev.target.checked);
	$("#trunkCB").prop('checked', ev.target.checked);

	if (ev.target.checked) {
		tg.map.addToDisplayedRoads('motorway');
		tg.map.addToDisplayedRoads('trunk');
	}
	else {
		tg.map.removeToDisplayedRoads('motorway');
		tg.map.removeToDisplayedRoads('trunk');
	}
	tg.map.updateLayers();
});

$("#motorwayCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('motorway');
	else tg.map.removeToDisplayedRoads('motorway');
	tg.map.updateLayers();
});

$("#trunkCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('trunk');
	else tg.map.removeToDisplayedRoads('trunk');
	tg.map.updateLayers();
});

$("#arterialRoadCB").change(function(ev){ 
	$("#primaryCB").prop('checked', ev.target.checked);
	$("#secondaryCB").prop('checked', ev.target.checked);
	$("#tertiaryCB").prop('checked', ev.target.checked);

	if (ev.target.checked) {
		tg.map.addToDisplayedRoads('primary');
		tg.map.addToDisplayedRoads('secondary');
		tg.map.addToDisplayedRoads('tertiary');
	}
	else {
		tg.map.removeToDisplayedRoads('primary');
		tg.map.removeToDisplayedRoads('secondary');
		tg.map.removeToDisplayedRoads('tertiary');
	}
	tg.map.updateLayers();
});

$("#primaryCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('primary');
	else tg.map.removeToDisplayedRoads('primary');
	tg.map.updateLayers();
});

$("#secondaryCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('secondary');
	else tg.map.removeToDisplayedRoads('secondary');
	tg.map.updateLayers();
});

$("#tertiaryCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('tertiary');
	else tg.map.removeToDisplayedRoads('tertiary');
	tg.map.updateLayers();
});

$("#linkRoadCB").change(function(ev){ 
	$("#motorwayLinkCB").prop('checked', ev.target.checked);
	$("#trunkLinkCB").prop('checked', ev.target.checked);
	$("#primaryLinkCB").prop('checked', ev.target.checked);
	$("#secondaryLinkCB").prop('checked', ev.target.checked);
	$("#tertiaryLinkCB").prop('checked', ev.target.checked);

	if (ev.target.checked) {
		tg.map.addToDisplayedRoads('motorway_link');
		tg.map.addToDisplayedRoads('trunk_link');
		tg.map.addToDisplayedRoads('primary_link');
		tg.map.addToDisplayedRoads('secondary_link');
		tg.map.addToDisplayedRoads('tertiary_link');
	}
	else {
		tg.map.removeToDisplayedRoads('motorway_link');
		tg.map.removeToDisplayedRoads('trunk_link');
		tg.map.removeToDisplayedRoads('primary_link');
		tg.map.removeToDisplayedRoads('secondary_link');
		tg.map.removeToDisplayedRoads('tertiary_link');
	}
	tg.map.updateLayers();
});

$("#motorwayLinkCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('motorway_link');
	else tg.map.removeToDisplayedRoads('motorway_link');
	tg.map.updateLayers();
});

$("#trunkLinkCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('trunk_link');
	else tg.map.removeToDisplayedRoads('trunk_link');
	tg.map.updateLayers();
});

$("#primaryLinkCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('primary_link');
	else tg.map.removeToDisplayedRoads('primary_link');
	tg.map.updateLayers();
});

$("#secondaryLinkCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('secondary_link');
	else tg.map.removeToDisplayedRoads('secondary_link');
	tg.map.updateLayers();
});

$("#tertiaryLinkCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('tertiary_link');
	else tg.map.removeToDisplayedRoads('tertiary_link');
	tg.map.updateLayers();
});

//
//
// Visual Elements Representation Options
//
//
$("#dispOriginalRoadsCB").change(function(ev){ 
	tg.map.dispOriginalRoadLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispOriginalNodesCB").change(function(ev){ 
	tg.map.dispOriginalNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispSimplifiedRoadsCB").change(function(ev){ 
	tg.map.dispSimplifiedRoadLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispSimplifiedNodesCB").change(function(ev){ 
	tg.map.dispSimplifiedNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispOrdersCB").change(function(ev){ 
	tg.map.dispOrders = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispCenterPositionCB").change(function(ev){ 
	tg.map.dispCenterPositionLayer = ev.target.checked;
	tg.map.updateLayers();
});

//
//
// Network Representation Options
//
//
$("#edgesCB").change(function(ev){
	tg.map.dispEdgeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#nodesCB").change(function(ev){
	tg.map.dispNodeLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#networkLevelNoRB").change(function(ev){
	tg.map.dispNetworkLayer = !ev.target.checked;
	tg.map.updateLayers();
});

$("#networkLevel0RB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.dispNetworkLayer = true;
  	tg.map.NetworkLevel = 0;
  	tg.map.updateLayers();
  }
});

$("#networkLevel1RB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.dispNetworkLayer = true;
  	tg.map.NetworkLevel = 1;
  	tg.map.updateLayers();
  }
});

$("#networkLevel2RB").change(function(ev){
  if (ev.target.checked) {
  	tg.map.dispNetworkLayer = true;
  	tg.map.NetworkLevel = 2;
  	tg.map.updateLayers();
  }
});

//
//
// Locations Options
//
//
$("#locationNoRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.dispLocationLayer = false;
		tg.map.updateLayers();
	} 
});

$("#location0RB").change(function(ev){
	if (ev.target.checked) {
		//tg.data.locationType = 'restaurants';
		tg.data.locationType = 'japanese';
		tg.map.dispLocationLayer = true;
		tg.data.calNOI();
		tg.map.updateLayers();
	} 
});

$("#location1RB").change(function(ev){
	if (ev.target.checked) {
		//tg.data.locationType = 'restaurants';
		tg.data.locationType = 'french';
		tg.map.dispLocationLayer = true;
		tg.data.calNOI();
		tg.map.updateLayers();
	} 
});


//
//
// Control Points
//
//
$("#dispControlPointsCB").change(function(ev){
	tg.map.dispControlPointLayer = ev.target.checked;
	tg.map.updateLayers();
});

$("#dispGridCB").change(function(ev){
	tg.map.dispGridLayer = ev.target.checked;
	tg.map.updateLayers();
});

var randomSlider = new Slider("#randomSlider");
//$("#randomSlider").on("change", function(evt) {
$("#randomSlider").on("slideStop", function(evt) {
  tg.data.randomness = evt.value / 100;
  tg.data.moveControlPoints();
  tg.map.updateLayers();
});

function getTravelTime() {
	tg.data.getTravelTime()
}

function calWarping() {
	tg.graph.calWarping()
	tg.map.updateLayers()
}

function calTPS() {
	tg.data.calTPS()

	if (tg.data.testTPS()) console.log('TPS complete.')
	else console.log('TPS failed...')
}

function moveGrids() {
	tg.data.moveGrids()
	tg.map.updateLayers()
}

function moveLocations() {
	tg.data.moveLocations();
	tg.map.updateLayers();
}



//
//
// Go Directly
//
//
function goLatLng() {
	var lat = Number($("#goLat").val());
	var lng = Number($("#goLng").val());

	if ((lat >= tg.opt.boundary.seattle.south) && (lat <= tg.opt.boundary.seattle.north) 
		&& (lng >= tg.opt.boundary.seattle.west) && (lng <= tg.opt.boundary.seattle.east)) {
		tg.map.setCenter(lat, lng);
	}
	else {
		console.log('out of boundary...');
	}
}

function goCenterNode() {
	var id = Number($("#goNode").val());
	tg.map.setCenterByNodeID(id);
}

//
//
// Simplification
//
//
function simpSeperate() {

	tg.data.simple.nodes = tg.util.clone(tg.data.original.nodes);
	tg.data.simple.roads = tg.util.clone(tg.data.original.roads);
	tg.net.calOrderOfNodes(tg.data.simple.nodes, tg.data.simple.roads);

	tg.data.simple.roads = tg.net.alg.separateRoads(tg.data.simple.nodes, tg.data.simple.roads);
	tg.net.calOrderOfNodes(tg.data.simple.nodes, tg.data.simple.roads);

	tg.map.updateLayers();
	tg.map.displayTexts();
}

function simpMerge() {
	tg.data.simple.roads = tg.net.alg.mergeRoads(tg.data.simple.nodes, tg.data.simple.roads);
	tg.net.calOrderOfNodes(tg.data.simple.nodes, tg.data.simple.roads);

	tg.map.updateLayers();
	tg.map.displayTexts();
}

function simpStraightenLinks() {
	tg.data.simple.roads = tg.net.alg.straightenLink(tg.data.simple.roads);
	console.log(tg.data.simple.roads);
	tg.map.updateLayers();
	tg.map.displayTexts();
}

var rdpSlider = new Slider("#rdpSlider");
$("#rdpSlider").on("slideStop", function(evt) {
  tg.data.simpDistanceRDP = evt.value;
});

function simpRDP() {
	tg.data.simple.roads = tg.net.alg.simplifyRDP(tg.data.simple.nodes, tg.data.simple.roads);
	tg.net.calOrderOfNodes(tg.data.simple.nodes, tg.data.simple.roads);
	tg.map.updateLayers();
	tg.map.displayTexts();
}

function simpMergeRoads() {
	tg.data.copySimpRoads();
	tg.net.alg.simpMergeRoads();
	tg.map.updateLayers();
	tg.map.displayTexts();
}

function save() {
	//tg.net.saveFileOfSaperateRoads();
	//tg.net.changeFormat();
	tg.saveTravelTime();
}

/*
$("#waterCB").change(function(ev){ 
	tg.map.dispWaterLayer = ev.target.checked;
	tg.map.updateLayers();
});
*/

/*
$("#etcRoadCB").change(function(ev){ 
	$("#railCB").prop('checked', ev.target.checked);
	$("#monorailCB").prop('checked', ev.target.checked);
	$("#lightrailCB").prop('checked', ev.target.checked);
	$("#tramCB").prop('checked', ev.target.checked);
	$("#disusedCB").prop('checked', ev.target.checked);

	if (ev.target.checked) {
		tg.map.addToDisplayedRoads('rail');
		tg.map.addToDisplayedRoads('monorail');
		tg.map.addToDisplayedRoads('light_rail');
		tg.map.addToDisplayedRoads('tram');
		tg.map.addToDisplayedRoads('disused');
	}
	else {
		tg.map.removeToDisplayedRoads('rail');
		tg.map.removeToDisplayedRoads('monorail');
		tg.map.removeToDisplayedRoads('light_rail');
		tg.map.removeToDisplayedRoads('tram');
		tg.map.removeToDisplayedRoads('disused');
	}
	tg.map.updateLayers();
});

$("#railCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('rail');
	else tg.map.removeToDisplayedRoads('rail');
	tg.map.updateLayers();
});

$("#monorailCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('monorail');
	else tg.map.removeToDisplayedRoads('monorail');
	tg.map.updateLayers();
});

$("#lightrailCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('light_rail');
	else tg.map.removeToDisplayedRoads('light_rail');
	tg.map.updateLayers();
});

$("#tramCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('tram');
	else tg.map.removeToDisplayedRoads('tram');
	tg.map.updateLayers();
});

$("#disusedCB").change(function(ev){ 
	if (ev.target.checked) tg.map.addToDisplayedRoads('disused');
	else tg.map.removeToDisplayedRoads('disused');
	tg.map.updateLayers();
});
*/

/*
$("#dispOrgRoadSlider").slider();
$("#dispOrgRoadSlider").on("change", function(slideEvt) {
	tg.map.transparencyOriginalRoads = slideEvt.value.newValue / 100;
  tg.map.updateLayers();
});
*/