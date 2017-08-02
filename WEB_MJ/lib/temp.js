var data_cat;
var user_cat = "";
// Event handler
$(document).ready(function(){

	//Layout setting
	var width_screen = $(window).width();
	var height_screen = $(window).height();
	var height_tap = 105;
	var path_cat = "lib/eps/tod_get_cat.php";

	$("#main").css("width", width_screen);
	$("#main").css("height", height_screen);

	$("#content_tap").css("width", width_screen + "px");
	$("#content_tap").css("height", height_tap + "px");
	$("#content_main").css("top", height_tap + "px");
	$("#content_main").css("width", width_screen + "px");
	$("#content_main").css("height", height_screen-height_tap + "px");
	$("#input_cat").css("width", width_screen - 180 + "px");
	$("#content_tap_settings").css("right", 15 + "px");
	$("#content_tap_settings").css("top", 15 + "px");

	//get cat information
	$.ajax({
		url: path_cat,
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){
			data_cat = data;
			//Step 1. Auto complete

			//Step 2-1. Make a list
			$("#content_main").append('<div class="content_main_heading"> <img  style="vertical-align:middle; margin-left:20px;" src="img/headicon_CAT@2x.png"/> Destination categories </div>');
			for (i=0; i<data_cat.cat.length;i++){
				this_cat_id = data_cat.cat[i]["cat_id"];
				this_cat_name = data_cat.cat[i]["cat_name"];
				//Add each column .list_down = closed .list_up = opened
				$("#content_main").append('<div id=cat_'+ this_cat_id +' class="content_main_cat" </div>');
				//Add an image and cat name
				$("#cat_"+this_cat_id).append('<div class="content_main_cat_image"> <img src="img/TOD_menu'+this_cat_id+'@2x.png"/></div>');
				$("#cat_"+this_cat_id).append('<div class="content_main_cat_text">'+this_cat_name+'</div>');
				$("#cat_"+this_cat_id).append('<div class="content_main_cat_circle"><img src="img/TOD_arrow_down@2x.png"/></div>');
				$("#content_main").append('<div id="subcat_'+this_cat_id+'"></div>');
			}
			//Step 2-2. Add event
			for (i=0; i<data_cat.cat.length;i++){
				$("#cat_"+data_cat.cat[i]["cat_id"]).on("click", function(){
					var selector = "#" + $(this).attr("id") + " .content_main_cat_circle img";
					var char_ = $(selector).attr("src").split("_")[2][0];
					//If closed -> open
					var subcat = "#sub" + $(this).attr("id");
					if(char_ == "d"){
						$(selector).attr("src", "img/TOD_arrow_up@2x.png");
						//Include sub cats
						list_subcat(subcat);
					}
					//If opened -> close
					else{
						$(selector).attr("src", "img/TOD_arrow_down@2x.png");
						//Empty sub cats
						console.log(subcat);
						$(subcat).empty();
					}
				});
			}
		},
		error: function(request, error){
			if(mode_debug){console.log(error);}
		}				
	});

	$("#content_tap_settings").on("click", function(){
		//Go to settings
		console.log("clicked");
	});

	$(window).resize(function(){
		$("#main").css("width", $(window).width());
		$("#main").css("height", $(window).height());
	});

});

function list_subcat(subcat){
	console.log(subcat);
	var idx = subcat.split("_")[1]-1;
	//Step 1. Make a list
	for (i=0; i<data_cat.cat[idx].cat_sub.length;i++){
		var subcat_id = data_cat.cat[idx].cat_sub[i].cat_id;
		var subcat_img = data_cat.cat[idx].cat_sub[i].cat_img;
		var subcat_name = data_cat.cat[idx].cat_sub[i].cat_name.toUpperCase();
		var subcat_num = data_cat.cat[idx].cat_sub[i].cat_num;
		//Add each column .list_down = closed .list_up = opened
		$(subcat).append('<div id=cat_'+ subcat_id +' class="content_main_subcat" </div>');
		//Add an image and cat name
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_image"> <img src="'+subcat_img+'"/></div>');
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_image_mask"><img src="img/TOD_mask.png"/></div>');		
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_text">'+subcat_name+' <div class="content_main_subcat_text_sub">('+subcat_num+' locations)</div></div>');
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_circle"><img src="img/TOD_arrow_next@2x.png"/></div>');
	}
	//Step 2. Add event
	for (i=0; i<data_cat.cat[idx].cat_sub.length;i++){
		var cat_id = data_cat.cat[idx].cat_sub[i].cat_id;
		$("#cat_" + cat_id).on("click", function(){
			var array_temp = $(this).attr("id").split("_");
			user_cat = array_temp.splice(1, array_temp.length).join("_");
			console.log(user_cat);
		});
	}	
}