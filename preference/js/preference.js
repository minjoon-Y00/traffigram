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

//
//
// Center Options
//
//
$("#centerUWSeattleRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(47.658316, -122.312035)
})

$("#centerDowntownSeattleRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(47.6115744,-122.343777)
})

$("#centerNYUNYRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(40.72946, -73.995708)
})

$("#centerLombardSFRB").change(function(ev){
  if (ev.target.checked) tg.map.setCenter(37.802139,-122.4209287)
})

//
//
// EM -> DC
//
//
function getTravelTime() {
	tg.data.getTravelTime()
}

function splitGrid() {
	tg.data.splitGrid()
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

//
//
// Locations Options
//
//
$("#locationNoRB").change(function(ev){
	if (ev.target.checked) {
		tg.map.dispLocationLayer = false
		tg.map.updateLayers()
	} 
});

$("#location0RB").change(function(ev){
	if (ev.target.checked) {
		tg.data.locationType = 'japanese'
		tg.map.dispLocationLayer = true
		tg.data.calLocalLocations()
		tg.map.updateLayers()
	} 
});

$("#location1RB").change(function(ev){
	if (ev.target.checked) {
		tg.data.locationType = 'french'
		tg.map.dispLocationLayer = true
		tg.data.calLocalLocations()
		tg.map.updateLayers()
	} 
});

//
//
// Roads Options
//
//
$("#roadAutoRB").change(function(ev){
	if (ev.target.checked) {
		tg.data.autoSelectRoadLevel = true
		tg.data.calLocalNodesRoads()
		tg.map.updateLayers()
	} 
})

$("#roadRawRB").change(function(ev){
	if (ev.target.checked) {
		tg.data.autoSelectRoadLevel = false
		tg.data.roadLevel = 'raw'
		tg.data.calLocalNodesRoads()
		tg.map.updateLayers()
	} 
})

$("#road1RB").change(function(ev){
	if (ev.target.checked) {
		tg.data.autoSelectRoadLevel = false
		tg.data.roadLevel = 'level1'
		tg.data.calLocalNodesRoads()
		tg.map.updateLayers()
	} 
})

$("#road2RB").change(function(ev){
	if (ev.target.checked) {
		tg.data.autoSelectRoadLevel = false
		tg.data.roadLevel = 'level2'
		tg.data.calLocalNodesRoads()
		tg.map.updateLayers()
	} 
})

$("#road3RB").change(function(ev){
	if (ev.target.checked) {
		tg.data.autoSelectRoadLevel = false
		tg.data.roadLevel = 'level3'
		tg.data.calLocalNodesRoads()
		tg.map.updateLayers()
	} 
})

$("#road4RB").change(function(ev){
	if (ev.target.checked) {
		tg.data.autoSelectRoadLevel = false
		tg.data.roadLevel = 'level4'
		tg.data.calLocalNodesRoads()
		tg.map.updateLayers()
	} 
})

/*var randomSlider = new Slider("#randomSlider");
//$("#randomSlider").on("change", function(evt) {
$("#randomSlider").on("slideStop", function(evt) {
  tg.data.randomness = evt.value / 100;
  tg.data.moveControlPoints();
  tg.map.updateLayers();
});*/

