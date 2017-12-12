var data_cat;
var user_cat = "";
// Event handler

$(document).ready(function(){

	var width_screen = $(window).width();
	var height_screen = $(window).height();
	console.log(width_screen);
	//Layout setting

	$("#content_settings").css({
		"width": width_screen + "px",
		"height": height_screen + "px"
	});
	$(".content_main_textarea").css({
		"height": height_screen - $(".content_main_heading").height() - 100 + "px"
	});
	console.log(height_screen - $(".content_main_heading").height() - 100 + "px");
});