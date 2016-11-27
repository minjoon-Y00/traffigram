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

//if ($("#waterCB").is(':checked')) tg.map.dispWaterLayer = true;



//
//
// Data
//
//
function printSimpleNR() {
	tg.data.printSimpleNR()
}

function saveSimpleNR() {
	tg.data.saveSimpleNR()
}

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


//
//
// Network Representation Options
//
//

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
// Simplification
//
//
function simpSeperate() {
	var nr = tg.net.separateRoads(tg.data.simple.nodes, tg.data.simple.roads)
	tg.data.simple.nodes = nr.nodes
	tg.data.simple.roads = nr.roads
	tg.map.updateLayers()
	//tg.map.displayTexts()
}

function simpMerge() {
	var nr = tg.net.mergeRoads(tg.data.simple.nodes, tg.data.simple.roads)
	tg.data.simple.nodes = nr.nodes
	tg.data.simple.roads = nr.roads
	tg.map.updateLayers()
	//tg.map.displayTexts()
}

function simpRemoveDeadLinks() {
	var nr = tg.net.removeDeadLinks(tg.data.simple.nodes, tg.data.simple.roads)
	tg.data.simple.nodes = nr.nodes
	tg.data.simple.roads = nr.roads
	tg.map.updateLayers()
	//tg.map.displayTexts()	
}

function simpStraightenLinks() {
	var nr = tg.net.straightenLink(tg.data.simple.nodes, tg.data.simple.roads)
	tg.data.simple.nodes = nr.nodes
	tg.data.simple.roads = nr.roads
	tg.map.updateLayers()
	//tg.map.displayTexts()	
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

function simpRecover() {
	tg.data.simple.nodes = tg.data.original.nodes
	tg.data.simple.roads = tg.data.original.roads
	tg.map.updateLayers()
	//tg.map.displayTexts()
}



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
