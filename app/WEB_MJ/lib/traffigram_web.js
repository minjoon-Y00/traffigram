var mode_debug = true;
//Data
var data_cat;
var data_loc;
var data_currentset;
//API paths
var path_js = "lib/traffigram_global.js";
var path_login7 = "lib/eps/sign_in.php";
var path_cat = "lib/eps/tod_get_cat.php";
//User log
var user_log = {};
//some variables
var width_screen;
var height_screen;
var height_tap = 105;
var height_transition_gap = 30;
var width_UI_margin = 30;
var height_UI_margin = 20;
//transition
var time_screen_trans = 400;
var time_interaction_buffer = 400;

// Event handler
$(document).ready(function(){

	$.ajax({
		url: path_js,
		dataType: 'script',
		async: true,
		success: function(){
			//Initial screen setting
			width_screen = $(window).width();
			height_screen = $(window).height();
			$("#main").css("width", width_screen);
			$("#main").css("height", height_screen);
			$(window).resize(function(){
				width_screen = $(window).width();
				height_screen = $(window).height();
				$("#main").css("width", width_screen);
				$("#main").css("height", height_screen);
			});

			//Load the first screen
			load_login1();
		},
		error: function(request, error){
			console.log(error);
		}
	});
});

//Load screen login1 
//Main features: allow sign in / sign up
function load_login1(){
	$("#content").empty();
	$("#content").append(html_login1);

	//event handler
	$("#login1_btn_signup").on("click", function(){
		if(mode_debug){console.log("sign up");}
		load_login2();
	});

	//Go to login7
	$("#login1_btn_signin").on("click", function(){
		if(mode_debug){console.log("sign in - i.e., login7");}

		load_login7();
	});
}

//TO JY: finish the following functions
function load_login2(){
	//code here
}

function load_login4(){
	//code here
}

//Load screen login7
//Main features: check e-mail and password and login
function load_login7(){
	//Content empty and reload
	$("#content").empty();
	$("#content").append(html_login7);

	//Key up material
	var input_email="";
	var input_pw="";
	var is_email_true = false;
	var is_pw_true = false;

	$("#input_email").on("keyup", function(){
		input_email = $(this).attr("value");
		if (validateEmail(input_email)){
			is_email_true = true;
			//$("#go_next").attr("class","content_btn");
			if (is_pw_true){
				$("#login7_btn_signin").attr("class", "content_btn");
			}
		}
		else{
			is_email_true = false;
			$("#login7_btn_signin").attr("class", "content_btn_disabled");
		}
	});
	$("#input_pw").on("keyup", function(){
		input_pw = $(this).attr("value");
		if (input_pw!=""){
			is_pw_true = true;
			//$("#go_next").attr("class","content_btn");
			if (is_email_true){
				$("#login7_btn_signin").attr("class", "content_btn");
			}
		}
		else{
			is_pw_true = false;
			$("#login7_btn_signin").attr("class", "content_btn_disabled");
		}
	});

	$("#login7_btn_signin").on("click", function(){
		if($(this).attr("class")== "content_btn"){
			$.ajax({
				url: path_login7,
				data:{user_id: input_email, user_pw: input_pw},
				type: 'POST',
				dataType: 'json',
				async: true,
				success: function(data){
					if(data["res"] == true){
						if(mode_debug){console.log("record match");}

						setTimeout(function(){
							load_TOD("left");
						},time_interaction_buffer);

					} else {
						if(mode_debug){console.log("record does not match");}
						$(".content_message").html("Your e-mail address and password does not match with our record. If you need a help, please e-mail traffigram@gmail.com.");
						$(".content_message").css("color","red");
					}
				},
				error: function(request, error){
					if(mode_debug){console.log(error);}
				}				
			});
		}
	});

	$("#login7_btn_cancel").on("click", function(){
		load_login1();
	});
}

//Load screen TOD
//allows a user to browse TOD
function load_TOD(direction){
	//Content empty and reload
	$("#main").append('<div id="content_new"><div id="content_container"></div></div>');
	if (direction == "left"){
		$("#content_new").css({
			"position": "absolute", 
			"width": width_screen + "px", "height": height_screen + "px",
			"top": "0px", "left": width_screen + "px"
		});
	}
	else if (direction == "right"){
		$("#content_new").css({
			"position": "absolute", 
			"width": width_screen + "px", "height": height_screen + "px",
			"top": "0px", "left": width_screen*(-1) + "px"
		});
	}	
	if($("#content_UI"!= null)){
		$("#content_UI").remove();
	}

	//Sort of hack: NEVERMIND
	//$("#content_new").css("top", + height_transition_gap*(-1) + "px");
	load_TOD_construct_DOM();

	//Start transition
	if (direction == "left"){
		$("#content").animate({
			left: width_screen * (-1) + "px"
		}, time_screen_trans, function(){
		});
		$("#content_new").animate({
			left:0 + "px"
		}, time_screen_trans, function(){
			$("#content").remove();
			$("#content_new").attr("id", "content");
			$("#content").css("position", "relative");
		});
	}
	else if (direction == "right")
	{
		$("#content").animate({
			left: width_screen + "px"
		}, time_screen_trans, function(){
		});
		$("#content_new").animate({
			left:0 + "px"
		}, time_screen_trans, function(){
			$("#content").remove();
			$("#content_new").attr("id", "content");
			$("#content").css("position", "relative");
		});
	}
}
function load_TOD_construct_DOM(){
	$("#content_container").append(html_TOD);
	// Set position
	$("#content_main").css("top", "0px");
	$("#content_main").css("width", width_screen + "px");
	$("#content_main").css("height", height_screen + "px");
	$("#input_cat").css("width", width_screen - 180 + "px");
	$("#content_tap_settings").css("right", 15 + "px");
	$("#content_tap_settings").css("top", 15 + "px");
	//get information
	$.ajax({
		url: path_cat,
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){
			data_cat = data;

			//Step 1. Make a list
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
			//Step 2. Add event
			for (i=0; i<data_cat.cat.length;i++){
				$("#cat_"+data_cat.cat[i]["cat_id"]).on("click", function(){
					var selector = "#" + $(this).attr("id") + " .content_main_cat_circle img";
					var char_ = $(selector).attr("src").split("_")[2][0];
					//If closed -> open
					var subcat = "#sub" + $(this).attr("id");
					if(char_ == "d"){
						$(selector).attr("src", "img/TOD_arrow_up@2x.png");
						//Include sub cats
						load_TOD_list_subcat(subcat);
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
}
function load_TOD_list_subcat(subcat){
	if(mode_debug){console.log(subcat);}
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
			//SAVE CAT at user_cat 
			user_cat = array_temp.splice(1, array_temp.length).join("_");
			if(mode_debug){console.log(user_cat)};
			//Load map
			//MJ: load_Map  starts loading a map, at "#content_map"
			load_Map()
		});
	}	
}

function load_Map(){

	$("#main").append('<div id="content_new"></div>');
	$("#content_new").css({
		"position": "absolute", 
		"width": width_screen + "px", "height": height_screen + "px",
		"top": 0 + "px", "left": width_screen + "px"
	});
	//Include position relative container
	$("#content_new").append('<div id="content_container_map"></div>')
	$("#content_container_map").css({
		"position": "relative", "width": width_screen + "px", "height": height_screen + "px", "top": 0 + "px", "left": 0 + "px"
	});

	//Set up a map container
	$("#content_container_map").append('<div id="content_map">Map yeah</div>')
	$("#content_map").css({
		"position": "absolute",
		"width": width_screen + "px", "height": height_screen + "px",
		"top": 0 + "px", "left": 0 + "px", 
		"background": "rgb(255,0,255)"
	});	

	//Start transition
	$("#content").animate({
		left: width_screen * (-1) + "px"
	}, time_screen_trans, function(){
	});
	$("#content_new").animate({
		left:0 + "px"
	}, time_screen_trans, function(){
		$("#content").remove();
		$("#content_new").attr("id", "content");

		//Step 1. Load UI - general
		//Set up a UI
		$("#main").append('<div id="content_UI"></div>');
		$("#content_UI").css({
			"position": "absolute", 
			"width": width_screen + "px", "height": height_screen + "px",
			"top": 0 + "px", "left": 0 + "px"
		});

		//UI - gotoCAT
		$("#content_UI").append('<div id="btn_gotoCAT"><img src="img/btn_gotoCat@2x.png"/></div>');
		$("#btn_gotoCAT").css({
			"position": "absolute",			
			"top": height_UI_margin + "px", "left": width_UI_margin + "px"
		});
		//Event
		$("#btn_gotoCAT").on("click", function(){load_TOD("right")});

		//UI - gotoSet
		$("#content_UI").append('<div id="btn_gotoSet"><img src="img/btn_settings@2x.png"/></div>');
		$("#btn_gotoSet").css({
			"position": "absolute",
			"top": height_UI_margin + "px", "right": width_UI_margin + "px"
		});
		//UI - resetOrigin
		$("#content_UI").append('<div id="btn_resetOrigin"><img src="img/btn_resetOrigin@2x.png"/></div>');
		$("#btn_resetOrigin").css({ //switch
			"position": "absolute", 
			"bottom": height_UI_margin + "px", "right": width_UI_margin + "px"
		});
		//UI - gotoFilter
		$("#content_UI").append('<div id="btn_gotoFilter"><img src="img/btn_gotoFilter@2x.png"/></div>');
		$("#btn_gotoFilter").css({ //switch
			"position": "absolute", 
			"bottom": height_UI_margin + "px", "right": width_UI_margin + 130 + "px"
		});
		//UI - TOT
		$("#content_UI").append('<div id="btn_TOT"><img src="img/btn_TOT_car@2x.png"/></div>');
		$("#btn_TOT").css({ //switch
			"position": "absolute", 
			"bottom": height_UI_margin + "px", "right": width_UI_margin + 260 + "px"
		});				
		//$("#content_main_new").css("top", "0px");
		//get CAT information
	});
}
function load_UI_Map(){
	//Set up a UI
	$("#main").append('<div id="content_UI"></div>');
	$("#content_UI").css({
		"position": "absolute", 
		"width": width_screen + "px", "height": height_screen + "px",
		"top": 0 + "px", "left": 0 + "px"
	});

	//UI for list to map
	$("#content_list").append('<div id="content_UI_gotoMap"><img src="img/btn_gotoMap@2x.png"/></div>');
	$("#content_UI_gotoMap").css({ //switch
		"position": "absolute", 
		"top": (height_screen - height_tap)/2 + "px", "left": 80 + "px"
	});		

}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}