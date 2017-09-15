var data_cat;
var user_cat = "";
// Event handler

$(document).ready(function(){
	$("#main").css("width", width_screen);
	$("#main").css("height", height_screen);
	$(window).resize(function(){
		width_screen = $(window).width();
		height_screen = $(window).height();
		$("#main").css("width", width_screen);
		$("#main").css("height", height_screen);
	});
	var width_screen = $(window).width();
	var height_screen = $(window).height();
	console.log(width_screen);
	//Layout setting
});