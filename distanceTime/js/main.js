let tg = new TgApp('ol_map');
tg.setCenter(TgData.center.seattleDowntown);

function zoomIn() {
  tg.zoomIn();
}

function zoomOut() {
  tg.zoomOut();
}

$("#calBtn").click(() => {
  tg.cal();
});

$("#runBtn").click(() => {
  tg.run();
});

/*
 * For the mode of the transportation
 */
 /*
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
});*/




// Visual Elements Representation Options (For debugging)

/*$("#dispWaterCB").change(function(ev){ 
	tg.map.tgWater.turn(ev.target.checked);
	tg.map.tgWater.render();
});*/
