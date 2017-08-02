var mode_debug = true;
//Data
var data_cat;
// MJ
var data_loc = [];
var data_currentset = [];
// MJ

//API paths
var path_js = "lib/traffigram_global.js";
var path_login2 = "lib/eps/signup_check.php";
var path_login4 = "lib/eps/signup.php";
var path_login7 = "lib/eps/sign_in.php";
var path_cat = "lib/eps/tod_get_cat.php";
//User log
var user_log = {};
//some variables
var width_screen;
var height_screen;
var height_tap = 105;
var height_transition_gap = 30;
var width_UI_margin = 15;
var height_UI_margin = 20;
//transition
var time_screen_trans = 400;
var time_interaction_buffer = 400;
//Map related
var map_TOT = 0; //Type of transportation 0: car 1: bicycle 2: on foot
var map_TOT_temp;
var map_TOD //Type of destination
var map_home = {lng:0, lat:0, address:""};
var map_office = {lng:0, lat:0, address:""};
var map_mode = 0; //map mode 0: WM 1:DC
//UI related
var isListOpened = false;
var isFilterOpened = false;

// MJ: variable
let tg;
// MJ

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
			//load_login1();
			load_TOD('left');
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
	$("#content").empty();
	$("#content").append(html_login2);
	//code here
	  //Key up material
	var input_email="";
	var input_name="";
	var input_pw="";
	var input_pw_confirm="";
	var is_email_true = false;
	var is_name_true = false;
	var is_pw_true = false;
	var is_pw_confirm_true = false;

	var is_format_done = function() {
		return is_email_true && is_name_true && is_pw_true && is_pw_confirm_true && ($('#login2_input_pw').attr('value') === $('#login2_input_pw_confirm').attr('value'));
	};

	$("#login2_input_email").on("keyup", function(){
		input_email = $(this).attr("value");
		if (validateEmail(input_email)){
			is_email_true = true;
			//$("#go_next").attr("class","content_btn");
			if (is_format_done()){
				$("#login2_btn_signin").attr("class", "content_btn");
			}
		}
		else{
			is_email_true = false;
			$("#login2_btn_signin").attr("class", "content_btn_disabled");
		}
	});
	$("#login2_input_name").on("keyup", function(){
		input_name = $(this).attr("value");
		if (input_name !== '' && input_name !== null){
		  is_name_true = true;
			//$("#go_next").attr("class","content_btn");
			if (is_format_done()){
				$("#login2_btn_signin").attr("class", "content_btn");
			}
		}
		else{
			is_name_true = false;
			$("#login2_btn_signin").attr("class", "content_btn_disabled");
		}
	});
	$("#login2_input_pw").on("keyup", function(){
	  input_pw = $(this).attr("value");
		if (input_pw!=='' && input_pw!==null){
		  is_pw_true = true;
			//$("#go_next").attr("class","content_btn");
			if (is_format_done()){
				$("#login2_btn_signin").attr("class", "content_btn");
			} else {
			  $("#login2_btn_signin").attr("class", "content_btn_disabled");
			}
		}
		else{
			is_pw_true = false;
			$("#login2_btn_signin").attr("class", "content_btn_disabled");
		}

		if($("#login2_input_pw_confirm").val() === $("#login2_input_pw").val()) {
			$(".content_message").html("");
		}
	});
	$("#login2_input_pw_confirm").on("keyup", function(){
	  input_pw_confirm = $(this).attr("value");
		if (input_pw_confirm!=='' && input_pw_confirm!==null){
		  is_pw_confirm_true = true;
			//$("#go_next").attr("class","content_btn");
			if (is_format_done()){
				$("#login2_btn_signin").attr("class", "content_btn");
			} else {
			  $("#login2_btn_signin").attr("class", "content_btn_disabled");
			}
		}
		else{
			is_pw_confirm_true = false;
			$("#login2_btn_signin").attr("class", "content_btn_disabled");
		}
		if($("#login2_input_pw_confirm").val() !== $("#login2_input_pw").val()) {
			$(".content_message").html("Passwords don't match. Please check again.");
			$(".content_message").css("color","red");
		} else {
		  $(".content_message").html("");
		}
	});

	$("#login2_btn_cancel").on("click", function(){
		load_login1();
	});

	$("#login2_btn_signin").on("click", function(){
		if(input_pw_confirm.length < 4 || input_pw.length <4){
			$(".content_message").html("Your password should be at least more than four characters.");
			$(".content_message").css("color","red");
		}
		else{
			if($(this).attr("class")=== "content_btn"){
				$.ajax({
					url: path_login2,
					data:{user_id: input_email},
					type: 'POST',
					dataType: 'json',
					async: true,
					success: function(data){
						if(data["res"] == true) {
						  load_login4(input_email, input_name, input_pw);
						} else {
							if(mode_debug){console.log("record does not match");}
							$(".content_message").html("The e-mail address is already being used, please try with a different address.");
							$(".content_message").css("color","red");
						}
					},
					error: function(request, error){
						if(mode_debug){console.log(error);}
					}
				});
			}
		}
	});
}


function load_login4(user_id, user_name, user_passwd){
	var home_address_true = false;
  	var home_address = "N/A";
  	var home_address_long = -10000;
  	var home_address_lat = -10000;
  	var office_address_true = false;
  	var office_address = "N/A";
  	var office_address_long = -10000;
  	var office_address_lat = -10000;


  	$("#content").empty();
  	$("#content").append(html_login4);

  	var home_checkbox = document.getElementById('login4_checkbox_home_addr');
  	var office_checkbox = document.getElementById('login4_checkbox_office_addr');

  	var check_done = function() {
  		return home_address_true && office_address_true;
	};

  	$('#login4_checkbox_home_addr').change(function() {
  		if(this.checked) {
          $("#login4_input_home_addr").val('');
          $("#login4_input_home_addr").prop('disabled', true);
          home_address_true = true;
          home_address = "N/A";
          home_address_long = -10000;
          home_address_lat = -10000;
        } else {
          $("#login4_input_home_addr").prop('disabled', false);
          home_address_true = false;
		}
		if(check_done()) {
          	$("#login4_btn_submit").attr("class", "content_btn");
		} else {
          	$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	});
  	$('#login4_checkbox_office_addr').change(function() {
      	if(this.checked) {
        	$("#login4_input_office_addr").val('');
        	$("#login4_input_office_addr").prop('disabled', true);
        	office_address_true = true;
        	office_address = "N/A";
        	office_address_long = -10000;
        	office_address_lat = -10000;
      	} else {
        	$("#login4_input_office_addr").prop('disabled', false);
        	home_address_true = false;
		}
	  	if(check_done()) {
        	$("#login4_btn_submit").attr("class", "content_btn");
      	} else {
            $("#login4_btn_submit").attr("class", "content_btn_disabled");
        }
  	});

  	$('#login4_input_home_addr').focus(function() {
  		home_address_true = false;
      	$('#login4_input_home_addr').val('');
      	$('#login4_input_home_addr').prop('disabled', false);
      	if(check_done()) {
        	$("#login4_btn_submit").attr("class", "content_btn");
      	} else {
        	$("#login4_btn_submit").attr("class", "content_btn_disabled");
      	}
	});
  	$('#login4_input_office_addr').focus(function() {
    	office_address_true = false;
    	$('#login4_input_office_addr').val('');
    	$('#login4_input_office_addr').prop('disabled', false);
      	if(check_done()) {
        	$("#login4_btn_submit").attr("class", "content_btn");
      	} else {
        	$("#login4_btn_submit").attr("class", "content_btn_disabled");
      	}
  	});
	//code here


  	var input1 = document.getElementById('login4_input_home_addr');
  	var input2 = document.getElementById('login4_input_office_addr');
  	var options = {
    	types: ['geocode']
  	};

  	var autocomplete1 = new google.maps.places.Autocomplete(input1, options);
  	var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

  	var place_callback_home = function() {
  		if(autocomplete1.getPlace().geometry && autocomplete1.getPlace()) {
          home_address_true = true;
          home_address = autocomplete1.getPlace().formatted_address;
          home_address_long = autocomplete1.getPlace().geometry.location.lng();
          home_address_lat = autocomplete1.getPlace().geometry.location.lat();
		} else {
          home_address_true = false;
          home_address = "N/A";
          home_address_long = -10000;
          home_address_lat = -10000;
		}
	  	if(check_done()) {
  			$("#login4_btn_submit").attr("class", "content_btn");
      	} else {
            $("#login4_btn_submit").attr("class", "content_btn_disabled");
        }
	};
  	var place_callback_office = function() {
      	if(autocomplete2.getPlace().geometry && autocomplete2.getPlace()) {
        	office_address_true = true;
        	office_address = autocomplete2.getPlace().formatted_address;
        	office_address_long = autocomplete2.getPlace().geometry.location.lng();
        	office_address_lat = autocomplete2.getPlace().geometry.location.lat();
      	} else {
        	office_address_true = false;
        	office_address = "N/A";
        	office_address_long = -10000;
        	office_address_lat = -10000;
      	}
      	if(check_done()) {
        	$("#login4_btn_submit").attr("class", "content_btn");
      	} else {
            $("#login4_btn_submit").attr("class", "content_btn_disabled");
        }
    };


  	google.maps.event.addListener(autocomplete1, 'place_changed', place_callback_home);
  	google.maps.event.addListener(autocomplete2, 'place_changed', place_callback_office);

  	$("#login4_btn_submit").on("click", function(){
    	if($(this).attr("class")=== "content_btn"){
      		$.ajax({
        		url: path_login4,
        		data:{user_id: user_id, user_pw: user_passwd, user_name: user_name, user_home: home_address, user_home_lng: home_address_long, user_home_lat: home_address_lat, user_office: office_address, user_office_lng: office_address_long, user_office_lat: office_address_lat},
        		type: 'POST',
        		dataType: 'json',
        		async: true,
        		success: function(data){
          			if(data["res"] == true) {
          				load_login6(user_name);
            			console.log('Oh yeah~ Finally');
          			} else {
            			if(mode_debug){console.log("somethings wrong");}
            			$(".content_message").html("Sign up failed! Please try again.");
            			$(".content_message").css("color","red");
          			}
        		},
        		error: function(request, error){
          			if(mode_debug){console.log(error);}
        		}
      		});
		}
  	});
}

function load_login4_old(user_id, user_name, user_passwd){
	var home_address_true = false;
	var home_address = "N/A";
	var home_address_long = -10000;
	var home_address_lat = -10000;
	var office_address_true = false;
	var office_address = "N/A";
	var office_address_long = -10000;
	var office_address_lat = -10000;

	$("#content").empty();
	$("#content").append(html_login4);

	var home_checkbox = document.getElementById('login4_checkbox_home_addr');
	var office_checkbox = document.getElementById('login4_checkbox_office_addr');
	var check_done = function() {
		return home_address_true && office_address_true;
	};

	$('#login4_checkbox_home_addr').change(function() {
		if(this.checked) {
			$("#login4_input_home_addr").val('');
			$("#login4_input_home_addr").prop('disabled', true);
			home_address_true = true;
			home_address = "N/A";
			home_address_long = -10000;
			home_address_lat = -10000;
		} else {
			$("#login4_input_home_addr").prop('disabled', false);
			home_address_true = false;
		}
		if(check_done()) {
			$("#login4_btn_submit").attr("class", "content_btn");
		} else {
			$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	});
	$('#login4_checkbox_office_addr').change(function() {
		if(this.checked) {
			$("#login4_input_office_addr").val('');
			$("#login4_input_office_addr").prop('disabled', true);
			office_address_true = true;
			office_address = "N/A";
			office_address_long = -10000;
			office_address_lat = -10000;
		} else {
			$("#login4_input_office_addr").prop('disabled', false);
			home_address_true = false;
		}
		if(check_done()) {
			$("#login4_btn_submit").attr("class", "content_btn");
		} else {
			$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	});

	$('#login4_input_home_addr').focus(function() {
		home_address_true = false;
		$('#login4_input_home_addr').val('');
		$('#login4_input_home_addr').prop('disabled', false);
		if(check_done()) {
			$("#login4_btn_submit").attr("class", "content_btn");
		} else {
			$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	});
	$('#login4_input_office_addr').focus(function() {
		office_address_true = false;
		$('#login4_input_office_addr').val('');
		$('#login4_input_office_addr').prop('disabled', false);
		if(check_done()) {
			$("#login4_btn_submit").attr("class", "content_btn");
		} else {
			$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	});
	//code here
	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(-33.8902, 151.1759),
		new google.maps.LatLng(-33.8474, 151.2631));

	var input1 = document.getElementById('login4_input_home_addr');
	var input2 = document.getElementById('login4_input_office_addr');
	var options = {
		bounds: defaultBounds,
		types: ['establishment']
	};

	var autocomplete1 = new google.maps.places.Autocomplete(input1, options);
	var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

	var place_callback_home = function() {
		if(autocomplete1.getPlace().geometry && autocomplete1.getPlace()) {
		  home_address_true = true;
		  home_address = autocomplete1.getPlace().formatted_address;
		  home_address_long = autocomplete1.getPlace().geometry.location.lng();
		  home_address_lat = autocomplete1.getPlace().geometry.location.lat();
		} else {
		  home_address_true = false;
		  home_address = "N/A";
		  home_address_long = -10000;
		  home_address_lat = -10000;
		}
		if(check_done()) {
			$("#login4_btn_submit").attr("class", "content_btn");
		} else {
			$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	};
	var place_callback_office = function() {
		if(autocomplete2.getPlace().geometry && autocomplete2.getPlace()) {
			office_address_true = true;
			office_address = autocomplete2.getPlace().formatted_address;
			office_address_long = autocomplete2.getPlace().geometry.location.lng();
			office_address_lat = autocomplete2.getPlace().geometry.location.lat();
		} else {
			office_address_true = false;
			office_address = "N/A";
			office_address_long = -10000;
			office_address_lat = -10000;
		}
		if(check_done()) {
			$("#login4_btn_submit").attr("class", "content_btn");
		} else {
			$("#login4_btn_submit").attr("class", "content_btn_disabled");
		}
	};
	google.maps.event.addListener(autocomplete1, 'place_changed', place_callback_home);
	google.maps.event.addListener(autocomplete2, 'place_changed', place_callback_office);

	$("#login4_btn_submit").on("click", function(){
		if($(this).attr("class")=== "content_btn"){
			$.ajax({
				url: path_login4,
				data:{user_id: user_id, user_pw: user_passwd, user_name: user_name, user_home: home_address, user_home_lng: home_address_long, user_home_lat: home_address_lat, user_office: office_address, user_office_lng: office_address_long, user_office_lat: office_address_lat},
				type: 'POST',
				dataType: 'json',
				async: true,
				success: function(data){
					if(data["res"] == true) {
						load_login6(user_name);
						console.log('Oh yeah~ Finally');
					} else {
						if(mode_debug){console.log("somethings wrong");}
						$(".content_message").html("Sign up failed! Please try again.");
						$(".content_message").css("color","red");
					}
				},
				error: function(request, error){
					if(mode_debug){console.log(error);}
				}
			});
		}
	});
}

//Finally!!
function load_login6(name){

	$("#main").append(html_popup);
	//Include black layer
	$("#popup_blacklayer").css({
		"position": "absolute", 
		"height": height_screen + "px", "width": width_screen + "px", 
		"top": 0 + "px", "left": 0 + "px", background: "rgba(0,0,0,0.5)"});

	//Include subject and text
	$("#popup_heading").append("SIGN-UP SUCCESSFUL");
	$("#popup_content").append("<div>Welcome, "+name+"! Thanks for choosing using Traffigram. We hope you enjoy using this application.</div>");
	$("#popup_content").append('<div class="content_paragraph"><span class="content_btn" id="login6_btn_continue"> <img src="img/btnicon_check@2x.png"/> CONTINUE </span></div>');

	//Set popup
	$("#popup").css({
		"position": "absolute", 
		"height": height_screen*0.8 + "px", "width": width_screen*0.8 + "px", 
		"top": height_screen*0.1, "left": width_screen*0.1 + "px", background: "white"});
	$("#popup_content").css({"height": height_screen*0.8 - $("#popup_heading").height()*3 + "px"});

	//Present popup
	$("#popup").animate({opacity:1},time_screen_trans);

	//Closing popup #1 
	$("#login6_btn_continue").on("click", function(){
		$("#popup").animate({opacity:0},time_screen_trans, function(){
			$(this).remove();
			$("#popup_blacklayer").remove();
			setTimeout(function(){
				load_TOD("left");
			},time_interaction_buffer);
		});		
	})

	//Close popup #2
	$("#popup_close").on("click", function(){
		$("#popup").animate({opacity:0},time_screen_trans, function(){
			$(this).remove();
			$("#popup_blacklayer").remove();
			setTimeout(function(){
				load_TOD("left");
			},time_interaction_buffer);
		});
	});
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
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_image_mask"><img src="img/TOD_mask_safe.png"/></div>');		
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_text">'+subcat_name+' <div class="content_main_subcat_text_sub">('+subcat_num+' locations)</div></div>');
		$("#cat_"+subcat_id).append('<div class="content_main_subcat_circle"><img src="img/TOD_arrow_next@2x.png"/></div>');
	}
	//Step 2. Add event
	for (i=0; i<data_cat.cat[idx].cat_sub.length;i++){
		var cat_id = data_cat.cat[idx].cat_sub[i].cat_id;
		$("#cat_" + cat_id).on("click", function(){
			var array_temp = $(this).attr("id").split("_");
			//SAVE CAT / TOD
			map_TOD = array_temp.splice(1, array_temp.length).join("_");
			if(mode_debug){console.log(map_TOD)};
			load_map()
		});
	}
}

function load_map(){

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
	$("#content_container_map").append('<div id="content_map"></div>')
	$("#content_map").css({
		"position": "absolute",
		"width": width_screen + "px", "height": height_screen + "px",
		"top": 0 + "px", "left": 0 + "px", 
		// MJ: set background color
		"background": "#EAEAEA"
		// MJ
	});

	$("#content_map").append('<div id="ol_map" class="ol_map"></div>');
	$("#ol_map").css({
		"width": "100%", "height": "100%"
	});
	
	// MJ: Load Map
	getCurrentLocation()
	.then((data) => {

	  // create the main app object
	  tg = new TgApp('ol_map');

	  console.log('got lat & lng from geolocation: ' + data.lat + ', ' + data.lng);

	  const seattle = {lat: 47.6115744, lng: -122.343777}

	  if ((data.lat > seattle.lat - 1) && (data.lat < seattle.lat + 1) &&
	      (data.lng > seattle.lng - 1) && (data.lng < seattle.lng + 1)) {
	    //console.log('ok. here is in seattle.');
	    tg.setOriginByOtherLatLng(data.lat, data.lng);
	  }
	  else {
	    tg.setOriginAsDefault();
	  }
	})
	.catch((error) => {
	  console.error(error);
	  tg = new TgApp('ol_map');
	  tg.setOriginAsDefault();
	});
	// MJ

	//Set up an empty list container (from right to left)
	$("#content_container_map").append('<div id="content_list"></div>')
	$("#content_list").css({
		"position": "absolute",
		"width": 0 + "px", "height": height_screen + "px",
		"top": 0 + "px", "left": width_screen + "px", 
		"background": "rgb(255,255,255)"
	});	
	//Set up an empty filter container (from bottom to top)
	$("#content_container_map").append('<div id="content_filter"></div>')
	$("#content_filter").css({
		"position": "absolute",
		"width": width_screen + "px", "height": 0 + "px",
		"top": height_screen + "px", "left": 0 + "px", 
		"background": "rgb(0,0,0)"
	});
	//Set up an empty setting container AT THE LAST MOMENT (layer issue)
	$("#content_container_map").append('<div id="content_settings"></div>')
	$("#content_settings").css({
		"position": "absolute",
		"width": width_screen + "px", "height": 0 + "px",
		"top": height_screen + "px", "left": 0 + "px", 
		"background": "rgb(0,255,0)"
	});

	//Start screen transition
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

		//UI TOP LEFT SIDE 
		//1. gotoCAT
		$("#content_container_map").append('<div id="btn_gotoCAT"><img src="img/btn_gotoCat@2x.png"/></div>');
		$("#btn_gotoCAT").css({
			"position": "absolute",			
			"top": height_UI_margin + "px", "left": width_UI_margin + "px"
		});
		$("#btn_gotoCAT").on("click", function(){
			load_TOD("right");
			isListOpened = false;
			isFilterOpened = false;
		});		
		//1. gotoSet
		$("#content_container_map").append('<div id="btn_gotoSet"><img src="img/btn_settings@2x.png"/></div>');
		$("#btn_gotoSet").css({
			"position": "absolute",
			"top": height_UI_margin + "px", "left": width_UI_margin + 130 + "px"
		});
		$("#btn_gotoSet").on("click", function(){openSettings();});
		//3. gotoFilter
		$("#content_container_map").append('<div id="btn_gotoFilter"><img src="img/btn_gotoFilter@2x.png"/></div>');
		$("#btn_gotoFilter").css({ //switch
			"position": "absolute", 
			"top": height_UI_margin + "px", "left": width_UI_margin + 260 + "px"
		});
		//Event - gotoFilter T.B.D.
		$("#btn_gotoFilter").on("click", function(){
			if(isFilterOpened){closeFilter();}
			else{openFilter();}
		});
		create_map_UI(); //For buttons at the bottom

		//UI TOP RIGHT SIDE - go to list
		$("#content_container_map").append('<div id="btn_gotoList"><img src="img/btn_gotoList@2x.png"/></div>');
		$("#btn_gotoList").css({ //switch
			"position": "absolute",
			"top": height_UI_margin + "px",  "right": width_UI_margin + "px"
		});
		$("#btn_gotoList").on("click", function(){openList()});
	});
}
function openSettings(){
	//Raise the position of filter div
	$("#content_settings").animate({
		top: 0 + "px", 
		height: height_screen + "px"
	}, function(){
		$("#content_settings").css("z-index", 100);
	});
	//T.B.D. insert things in the DIV
	//T.B.D. interact with server...
}
function closeSettings(){
	//Raise the position of filter div
	$("#content_settings").empty();
	$("#content_settings").animate({
		top: height_screen + "px", 
		height: 0 + "px"
	});	
}
function openFilter(){

	isFilterOpened = true;
	remove_map_UI();
	//If this is the case where the "list" is opened
	var height_offSet = (height_screen)*0.7; //We can set this to "1" later if necessary
	if (isListOpened){
		//1. Raise the position of UI buttons
		var height_temp = $("#btn_gotoCAT").height();
		$("#btn_gotoCAT").animate({top: height_screen-height_offSet-height_temp + "px"}, time_screen_trans);
		$("#btn_gotoSet").animate({top: height_screen-height_offSet-height_temp + "px"}, time_screen_trans);
		$("#btn_gotoFilter").animate({top: height_screen-height_offSet-height_temp + "px"}, time_screen_trans);
	}
	//2. Raise the position of filter div
	$("#content_filter").animate({
		top: height_screen - height_offSet + "px", 
		height: height_offSet + "px"
	});

	//3. T.B.D. JY ADD FILTER SOMEWHERE HERE THE ID OF THE DIV IS #content_list
	//
	//
	//
}
function closeFilter(){

	isFilterOpened = false;
	$("#content_filter").empty();
	if (isListOpened){
		//1. Raise the position of UI buttons
		var height_temp = $("#btn_gotoCAT").height();
		$("#btn_gotoCAT").animate({top: height_screen-height_temp + "px"}, time_screen_trans);
		$("#btn_gotoSet").animate({top: height_screen-height_temp + "px"}, time_screen_trans);
		$("#btn_gotoFilter").animate({top: height_screen-height_temp + "px"}, time_screen_trans);
	}
	//2. Raise the position of filter div
	$("#content_filter").animate({
		top: height_screen + "px", 
		height: 0 + "px"
	}, function(){
		if(!isListOpened){create_map_UI();}
	});
}
function create_map_UI(){
	//UI BOTTOM LEFT SIDE - Switch
	$("#content_container_map").append('<div id="btn_switch"></div>');
	if(map_mode ==0){ //WM mode
		$("#btn_switch").append('<span id="s"><img src="img/switch_s_on.png"/></span>');
		$("#btn_switch").append('<span id="t"><img src="img/switch_t_off.png"/></span>');
	}
	else{ //DC mode
		$("#btn_switch").append('<span id="s"><img src="img/switch_s_off.png"/></span>');
		$("#btn_switch").append('<span id="t"><img src="img/switch_t_on.png"/></span>');
	}
	$("#btn_switch").css({ //switch
		"position": "absolute", 
		"bottom": height_UI_margin + "px", "left":  width_UI_margin + "px"
	});
	//Event - Switch
	$("#s").on("click", function(){
		if (map_mode == 1){ //work only if the current mode is DC
			$("#s img").attr("src", 'img/switch_s_on.png');
			$("#t img").attr("src", 'img/switch_t_off.png');
			map_mode = 0;
			// MJ: swithing DC -> WM
			tg.goToEm();
			// MJ

		}
	});
	$("#t").on("click", function(){
		if (map_mode == 0){ //work only if the current mode is DC
			$("#s img").attr("src", 'img/switch_s_off.png');
			$("#t img").attr("src", 'img/switch_t_on.png');
			map_mode = 1;
			// MJ: swithing, DC -> WM here
			tg.goToDc('shapePreserving');
			// MJ
		}
	});

	//UI BOTTOM RIGHT SIDE 
	//1. resetOrigin
	$("#content_container_map").append('<div id="btn_resetOrigin"><img src="img/btn_resetOrigin@2x.png"/></div>');
	$("#btn_resetOrigin").css({ //switch
		"position": "absolute", 
		"bottom": height_UI_margin + "px", "right": width_UI_margin + "px"
	});
	//Event - resetOrigin MJ T.B.D.
	$("#btn_resetOrigin").on("click", function(){
		// MJ: reset origin
		tg.initMap();
    tg.setOriginAsCurrentLocation();
		// MJ
	});

	//2. TOT
	$("#content_container_map").append('<div id="btn_TOT"><img src="'+'img/btn_TOT_'+map_TOT+'.png"/></div>');
	$("#btn_TOT").css({ //switch
		"position": "absolute", 
		"bottom": height_UI_margin + "px", "right": width_UI_margin + 130 + "px"
	});
	$("#btn_TOT").on("click", function(){
		constructPopup("MODE OF TRANSPORTATION", html_popup_TOT, "TOT");
	}); 
}
function remove_map_UI(){
	$("#btn_switch").remove();
	$("#btn_resetOrigin").remove();
	$("#btn_TOT").remove();
}
function openList(){

	console.log(data_loc);

	remove_map_UI()
	//Transition
	/*$("#content_list").css({
		"position": "absolute", 
		"width": 0 + "px", "height": height_screen + "px",
		"top": "0px", "left": width_screen + "px", background: "#0FF"
	});*/

	//RAY T.B.D.
	//openList_construct_DOM(); 

	//Start transition
	$("#content_list").animate({
		left: 0 + "px", 
		width: width_screen + "px"
		},
		time_screen_trans,
		function(){
			//move buttons 
			var height_temp = $("#btn_gotoCAT").height();
			$("#btn_gotoCAT").animate({top: height_screen-height_UI_margin-height_temp + "px"}, time_screen_trans*2);
			$("#btn_gotoSet").animate({top: height_screen-height_UI_margin-height_temp + "px"}, time_screen_trans*2);
			$("#btn_gotoFilter").animate({top: height_screen-height_UI_margin-height_temp + "px"}, time_screen_trans*2);
			//change gotoList
			//UI TOP RIGHT SIDE - go to list
			$("#btn_gotoList").remove();
			$("#content_container_map").append('<div id="btn_gotoMap"><img src="img/btn_gotoMap@2x.png"/></div>');
			$("#btn_gotoMap").css({ //switch
				"position": "absolute",
				"top": height_UI_margin + "px",  "right": width_UI_margin + "px"
			});
			$("#btn_gotoMap").on("click", function(){closeList()});
			isListOpened = true;
		}
	);
}
function closeList(){
	$("#btn_gotoCAT").animate({top: height_UI_margin + "px"}, time_screen_trans*2);
	$("#btn_gotoSet").animate({top: height_UI_margin + "px"}, time_screen_trans*2);
	$("#btn_gotoFilter").animate({top: height_UI_margin + "px"}, time_screen_trans*2, function(){
		create_map_UI()
		//Empty the list
		$("#content_list").empty();
		//animate content list
		$("#content_list").animate({
				width: 0 + "px",
				left: width_screen + "px"
			},
			function(){
				$("#btn_gotoMap").remove();
				$("#content_container_map").append('<div id="btn_gotoList"><img src="img/btn_gotoList@2x.png"/></div>');
				$("#btn_gotoList").css({ //switch
					"position": "absolute", 
					"top": height_UI_margin + "px",  "right": width_UI_margin + "px"
				});
				$("#btn_gotoList").on("click", function(){openList()});
				isListOpened = false;
			}
		);
	});
}

function constructPopup(subject, text, casecase){

	$("#main").append(html_popup);
	//Include black layer
	$("#popup_blacklayer").css({
		"position": "absolute", 
		"height": height_screen + "px", "width": width_screen + "px", 
		"top": 0 + "px", "left": 0 + "px", background: "rgba(0,0,0,0.5)"});

	//Include subject and text
	$("#popup_heading").append(subject);
	$("#popup_content").append(text);

	//Set popup
	$("#popup").css({
		"position": "absolute", 
		"height": height_screen*0.8 + "px", "width": width_screen*0.8 + "px", 
		"top": height_screen*0.1, "left": width_screen*0.1 + "px", background: "white"});
	$("#popup_content").css({"height": height_screen*0.8 - $("#popup_heading").height()*3 + "px"});

	//Present popup
	$("#popup").animate({opacity:1},time_screen_trans);

	//casewise events
	if (casecase == "TOT"){
		//Initialize the checked property
		$("#TOT_"+map_TOT).prop("checked", "true");
		//On change
		$('input[name=TOT]').on('change', function(){
			console.log($(this));
			map_TOT_temp = $(this).attr("value");
			if(mode_debug){console.log(map_TOT_temp + " clicked");}
		});
		//On okay
		$("#popup_TOT_btn_okay").on("click", function(){
			if(casecase == "TOT"){
				if (map_TOT != map_TOT_temp){
					map_TOT = map_TOT_temp;

					//Update button image
					$("#btn_TOT img").attr("src", 'img/btn_TOT_'+map_TOT+'.png');
					console.log('<div id="btn_TOT"><img src="img/btn_TOT_'+map_TOT+'.png"/></div>');
					if(mode_debug){console.log("value changed to" + map_TOT);}
					// MJ T.B.D. redraw things based on the new mode of transportation
				}
			}			
			$("#popup").animate({opacity:0},time_screen_trans, function(){
				$(this).remove();
				$("#popup_blacklayer").remove();
			});			
		});
		//On cancel
		$("#popup_TOT_btn_cancel").on("click", function(){
			$("#popup").animate({opacity:0},time_screen_trans, function(){
				$(this).remove();
				$("#popup_blacklayer").remove();
			});
		});
	}

	//Close popup
	$("#popup_close").on("click", function(){
		$("#popup").animate({opacity:0},time_screen_trans, function(){
			$(this).remove();
			$("#popup_blacklayer").remove();
		});
	});
}

function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

// MJ: getCurrentLocation()
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    const timeOutForGettingLocation = 5000; // 5 sec
    let timeOutTimer;

    if (!navigator.geolocation) {
      reject('Geolocation is not supported by this browser.');
    }
    else {
      navigator.geolocation.getCurrentPosition((pos) => {
        clearTimeout(timeOutTimer);
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });

      timeOutTimer = setTimeout(() => {
        reject('Time out for getting geolocation');
      }, timeOutForGettingLocation);
    }
  });
}
// MJ
