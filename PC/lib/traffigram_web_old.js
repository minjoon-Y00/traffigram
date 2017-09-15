var mode_debug = true;
//Data
var data_cat;
var data_loc;
var data_currentset = [];
//API paths
var path_js = "lib/traffigram_global.js";
var path_login2 = "https://citygramsound.com:4349/signup_check";
var path_login4 = "https://citygramsound.com:4349/signup";
var path_login7 = "https://citygramsound.com:4349/sign_in";
var path_cat = "https://citygramsound.com:4349/tod_get_cat";
var path_resetAddress = "https://citygramsound.com:4349/reset_addresses";
var path_dest_detail = "https://citygramsound.com:4349/dest_detail";
var path_save_log = "https://citygramsound.com:4349/save_log";

//User log
var user_info = {
	"id":"",
	"loc_home":{lng:0, lat:0, address:""},
	"loc_office":{lng:0, lat:0, address:""},
	"loc_fav":[],
	"name":""
};
var user_log = {
	"user_id": "",
	"type" : "Mobile", //Mobile & PC
	"date": null,
	"mode_duration":{
		"DC":0, //Done
		"WM":0, //Done
		"List":0 //Done
	},
	"mode_frequency":{
		"DC": {
			"zoom":0,
			"pan":0,
			"change_origin":0,
			"change_transportation":0,
			"highlight_isochrone":0,
			"highlight_custom":0,
			"filter":0,
			"see_loc_detail":0,
			"do_navigate":0
		},
		"WM": {
			"zoom":0,
			"pan":0,
			"change_origin":0,
			"change_transportation":0,
			"filter":0,
			"see_loc_detail":0,
			"do_navigate":0
		},
		"switching":0 //Done
	}
}

var user_currentloc = {
	"lng":0, "lat":0
}
//some variables
var width_screen;
var height_screen;
var height_tap = 105;
var height_transition_gap = 30;
var width_UI_margin = 5;
var height_UI_margin = 5;
//transition
var time_screen_trans = 400;
var time_interaction_buffer = 400;
//Map related
var map_TOT = 0; //Type of transportation 0: car 1: bicycle 2: on foot
var map_TOT_temp;
var map_TOD = "1_1" //Type of destination
var map_mode = 0; //map mode 0: WM 1:DC
var map_originType = 0 //Type of origin 0: GPS 1: Home 2: Office
var map_originType_temp; //Type of origin 0: GPS 1: Home 2: Office
//UI related
var isListOpened = false;
var isFilterOpened = false;
var isOriginTypeChanged = false;
var isUnderAni = false;

var dest_IDS=[];

let tg;

var time
var time_day;
var time_mode_current = map_mode; // 0: WM 1:DC 2: List & Initialize
var time_mode_start = 0;
var time_mode_end = 0;


// Event handler
$(document).ready(function(){
	time = new Date();
	time_day = time.getDate();
	console.log(time_day);


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
			//Change this later
			//load_TOD("left");

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

//
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
		if (isUnderAni == false){
			if(input_pw_confirm.length < 4 || input_pw.length <4){
				$(".content_message").html("Your password should be at least more than four characters.");
				$(".content_message").css("color","red");
			}
			else{
				if($(this).attr("class")=== "content_btn"){
					isUnderAni = true;
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
							isUnderAni = false;
						},
						error: function(request, error){
							if(mode_debug){console.log(error);}
							isUnderAni = false;
						}
					});
				}
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
		if (isUnderAni == false){
			if($(this).attr("class")=== "content_btn"){
				isUnderAni = true;
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
						isUnderAni = false;
					},
					error: function(request, error){
						if(mode_debug){console.log(error);}
						isUnderAni = false;
					}
				});
			}
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
		"height": height_screen*0.4 + "px", "width": width_screen*0.6 + "px", 
		"top": height_screen*0.3, "left": width_screen*0.2 + "px", background: "white"});
	$("#popup_content").css({"height": height_screen*0.7 - 150 + "px"});

	//Present popup
	$("#popup").animate({opacity:1},time_screen_trans);

	//Closing popup #1 
	$("#login6_btn_continue").on("click", function(){
		if (isUnderAni == false){
			isUnderAni = true;
			$("#popup").animate({opacity:0},time_screen_trans, function(){
				$(this).remove();
				$("#popup_blacklayer").remove();
				setTimeout(function(){
					load_TOD("left");
					isUnderAni = false;
				},time_interaction_buffer);
			});		
		}
	})

	//Close popup #2
	$("#popup_close").on("click", function(){
		if (isUnderAni == false){
			$("#popup").animate({opacity:0},time_screen_trans, function(){
				$(this).remove();
				$("#popup_blacklayer").remove();
				setTimeout(function(){
					load_TOD("left");
					isUnderAni = false;
				},time_interaction_buffer);
			});
		}
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
		if (isUnderAni == false){
			if($(this).attr("class")== "content_btn"){
				isUnderAni = true
				$.ajax({
					url: path_login7,
					data:{user_id: input_email, user_pw: input_pw},
					type: 'POST',
					dataType: 'json',
					async: true,
					success: function(data){
						if(data["res"] == true){
							user_info["id"] = data["user_name"];
							user_info["loc_home"].address = data["user_home"];
							user_info["loc_home"].lng = data["user_home_lng"];
							user_info["loc_home"].lat = data["user_home_lat"];
							user_info["loc_office"].address = data["user_office"];
							user_info["loc_office"].lng = data["user_office_lng"];
							user_info["loc_office"].lat = data["user_office_lat"];
							var fav_string = data["user_fav"];
							if (fav_string != null){
								user_info["loc_fav"] = fav_string.split("|*|")
							}
							if(mode_debug){console.log(user_info.loc_fav);}
							if(mode_debug){console.log("user_info");}

							setTimeout(function(){
								load_TOD("left");
								load_map();
								//T.B.D.
								setTimeout(function(){
									openList();
								}, 6000);
								isUnderAni = false;
							},time_interaction_buffer);

						} else {
							if(mode_debug){console.log("record does not match");}
							$(".content_message").html("Your e-mail address and password does not match with our record. If you need a help, please e-mail traffigram@gmail.com.");
							$(".content_message").css("color","red");
							isUnderAni = false;
						}
					},
					error: function(request, error){
						if(mode_debug){console.log(error);}
						isUnderAni = false;
					}				
				});
			}
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
	$("#main").remove();
	$("body").append(html_main_PC);
	$("#user_name").css("font-weight", 700);
	$("#user_name").append(user_info["id"]);

	//Sort of hack: NEVERMIND
	//$("#content_new").css("top", + height_transition_gap*(-1) + "px");
	load_TOD_construct_DOM();

	//Start transition
	/*
	isUnderAni = true;
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
			$("#content").css({
				"position" : "relative",
				"z-index" : 10
			});
			if($("#content_container_map").length == 0){
				//First time the map is loaded. Then it will be here throughout the session
				isUnderAni = false;
				load_map();
			}
		});
	}
	else if (direction == "right")
	{
		$("#content_new").animate({
			left:0 + "px"
		}, time_screen_trans, function(){
			$("#content_new").attr("id", "content_temp");
			$("#content").attr("id", "content_new");
			$("#content_temp").attr("id", "content");
			$("#content").css({
				"position" : "relative",
				"z-index" : 10
			});
			isUnderAni = false;
		});
	}*/
}
function load_TOD_construct_DOM(){
	$("#TOD_wrapper").append(html_TOD);
	// Set position
	$("#content_container_TOD").css({
		"top": 0 + "px",	
		"width": $("#content_TOD").width() - 15 + "px"
	});
	//$("#input_cat").css("width", width_screen - 180 + "px");
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
			$("#content_container_TOD").append('<div class="content_main_heading"> <img src="img/headicon_CAT.png"/> Destination categories </div>');
			for (i=0; i<data_cat.cat.length;i++){
				this_cat_id = data_cat.cat[i]["cat_id"];
				this_cat_name = data_cat.cat[i]["cat_name"];
				//Add each column .list_down = closed .list_up = opened
				$("#content_container_TOD").append('<div id="cat_'+ this_cat_id +'" class="content_main_cat"> </div>');
				//Add an image and cat name
				$("#cat_"+this_cat_id).append('<div class="content_main_cat_image"> <img src="img/TOD_menu'+this_cat_id+'@2x.png"/></div>');
				$("#cat_"+this_cat_id).append('<div class="content_main_cat_text">'+this_cat_name+'</div>');
				$("#cat_"+this_cat_id).append('<div class="content_main_cat_circle"><img src="img/TOD_arrow_down@2x.png"/></div>');
				$("#content_container_TOD").append('<div id="subcat_'+this_cat_id+'"></div>');
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
		$(subcat).append('<div id="cat_'+ subcat_id +'" class="content_main_subcat"> </div>');
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
			//MJ: UPDATE TOD BASED ON NEW map_TOD
			//
			//
			//
			

		});
	}
}

function load_map(){
	//Include position relative container
	$("#content_map").append('<div id="content_map_wrapper" style = "position:relative"></div>')

	//Set up a map container
	$("#content_map_wrapper").append('<div id="content_map_inside"></div>')
	$("#content_map_inside").css({
		"position": "absolute",
		"width": $("#content_map").width() + "px", "height": $("#content_map").height() + "px",
		"top": 0 + "px", "left": 0 + "px", 
		"background": "#EAEAEA"
	});

	console.log("attached map wrapper");

	// Set up a ol_map
	$("#content_map_inside").append('<div id="ol_map" class="ol_map"></div>');
	$("#ol_map").css({
		"width": "100%", "height": "100%"
	});

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
			user_currentloc.lng = data.lng;
			user_currentloc.lat = data.lat;
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

	//Set up an empty filter container (from bottom to top)
	$("#content_map_inside").append('<div id="content_filter"></div>')
	$("#content_filter").css({
		"position": "absolute",
		"width": $("#content_map").width() + "px", "height": 0 + "px",
		"top":$("#content_map").height() + "px", "left": 0 + "px", 
		"background": "rgb(255,255,255)",
		"z-index": 10
	});
	//Set up an empty setting container (from bottom to top)
	$("#content_map_inside").append('<div id="content_settings"></div>')
	$("#content_settings").css({
		"position": "absolute",
		"width": $("#content_map").width() + "px", "height": 0 + "px",
		"top": $("#content_map").height() + "px", "left": 0 + "px", 
		"background": "rgb(255,255,255)"
	});	

	//UI: TOP LEFT SIDE
	//1. gotoSet
	var width_button = 58;
	$("#content_map_inside").append('<div id="btn_gotoSet"><img src="img/btn_settings.png"/></div>');
	$("#btn_gotoSet").css({
		"position": "absolute",
		"bottom": height_UI_margin + "px", "right": width_UI_margin + "px"
	});
	$("#btn_gotoSet").on("click", function(){openSettings();});
	//3. gotoFilter
	$("#content_map_inside").append('<div id="btn_gotoFilter"><img src="img/btn_gotoFilter.png"/></div>');
	$("#btn_gotoFilter").css({ //switch
		"position": "absolute", 
		"bottom": height_UI_margin + "px", "right": width_UI_margin*2 + width_button + "px"
	});
	//Event - gotoFilter T.B.D.
	$("#btn_gotoFilter").on("click", function(){
		if (isUnderAni == false){
			isUnderAni = true;
//			if(isFilterOpened){closeFilter();}
//			else{openFilter();}
		}
	});

	create_map_UI(); //For buttons at the bottom

	//Add search bar
	$("#content_map_inside").append('<div id="map_search"> <input type="text" id="search_orig" class= "input_text_underline" name="orig" placeholder="Type where you are now!"/></div>'); 
	$("#map_search").append('<span class="content_btn_disabled" id="loc_search"> <img src="img/search.png"/></span>');

	// J Y's address setting
	var your_address_true = false;
	var your_address = "N/A";
	var your_address_long = -10000;
	var your_address_lat = -10000;	

	var input1 = document.getElementById('search_orig');
	var options = {types: ['geocode']};

	var autocomplete = new google.maps.places.Autocomplete(input1, options);

	var place_callback_whereami = function() {
		if(autocomplete.getPlace().geometry && autocomplete.getPlace()) {
			your_address_true = true;
			your_address = autocomplete.getPlace().formatted_address;
			your_address_long = autocomplete.getPlace().geometry.location.lng();
			your_address_lat = autocomplete.getPlace().geometry.location.lat();
			$("#loc_search").attr("class", "content_btn");
		} else {
			your_address_true = false;
			your_address = "N/A";
			your_address_long = -10000;
			your_address_lat = -10000;
			$("#loc_search").attr("class", "content_btn_disabled");
		}
	};
	google.maps.event.addListener(autocomplete, 'place_changed', place_callback_whereami);

	$("#loc_search").on("click", function(){
		if($("#loc_search").attr("class") == "content_btn"){
			user_currentloc.lng = your_address_long;
			user_currentloc.lat = your_address_lat;
			if(home_address_true){
				user_info.loc_home.address = your_address;
				user_info.loc_home.lng = your_address_long;
				user_info.loc_home.lat = your_address_lat;
			}
			$("#loc_search").attr("class", "content_btn_disabled");

			//M J Update maps based on new address
		}
	});
}

function create_map_UI(){
	//UI BOTTOM LEFT SIDE - Switch
	$("#content_map_inside").append('<div id="btn_switch"></div>');
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
			//MJ T.B.D. Add swithing, DC -> WM here
			tg.goToEm();
			//Time logging
//			time_mode_end = Math.floor(Date.now() / 1000);
//			user_log.mode_duration.DC += time_mode_end - time_mode_start;
//			console.log("Finished logging " + time_mode_current + " which should be DC");
//
//			time_mode_current = 1;
//			time_mode_start = Math.floor(Date.now() / 1000);
//			console.log("Started logging " + time_mode_current +  " which should be WM");
//			//switching++
//			user_log.mode_frequency.switching += 1;
//
		}
	});
	$("#t").on("click", function(){
		if (map_mode == 0){ //work only if the current mode is DC
			$("#s img").attr("src", 'img/switch_s_off.png');
			$("#t img").attr("src", 'img/switch_t_on.png');
			map_mode = 1;
			//MJ T.B.D. Add swithing, DC -> WM here
			tg.goToDc('shapePreserving');
//			//Time logging
//			time_mode_end = Math.floor(Date.now() / 1000);
//			user_log.mode_duration.WM += time_mode_end - time_mode_start;
//			console.log("Finished logging " + time_mode_current + " which should be WM");
//
//			time_mode_current = 0;
//			time_mode_start = Math.floor(Date.now() / 1000);
//			console.log("Started logging " + time_mode_current +  " which should be DC");
//			//switching++
//			user_log.mode_frequency.switching += 1;
		}
	});

	//UI BOTTOM RIGHT SIDE 
	var width_button = 58;
	var width_switch = 198;
	//1. resetOrigin
	$("#content_map_inside").append('<div id="btn_resetOrigin"><img src="img/btn_resetOrigin.png"/></div>');
	$("#btn_resetOrigin").css({ //switch
		"position": "absolute", 
		"bottom": height_UI_margin + "px", "left": (width_UI_margin * 2) + width_switch + "px"
	});
	//Event - resetOrigin MJ T.B.D.
	$("#btn_resetOrigin").on("click", function(){
		tg.initMap();
    	tg.setOriginAsCurrentLocation();
	});
	//2. TOT
	$("#content_map_inside").append('<div id="btn_TOT"><img src="'+'img/btn_TOT_'+map_TOT+'.png"/></div>');
	$("#btn_TOT").css({ //switch
		"position": "absolute", 
		"bottom": height_UI_margin + "px", "left": (width_UI_margin * 3) + width_switch + width_button + "px"
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
function openSettings(){
	//Raise the position of filter div
	$("#content_settings").empty();
	$("#content_settings").append(html_settings);
	//Pull settings top to layer
	$("#content_settings").css("z-index", 100);
	$("#setting_heading").css("width", $("#content_map").width() - 30 + "px");

	$("#user_address_home").attr("placeholder", user_info.loc_home.address);
	$("#user_address_office").attr("placeholder", user_info.loc_office.address);
	//overflow:auto thing - need to set DIV height
	$(".content_main_textarea").css({
		"height": $("#content_map").height() - $(".content_main_heading").height() - 100 + "px"
	});
	$("#content_settings").animate({
		top: 0 + "px", 
		height: $("#content_map").height() + "px"
	}, function(){
		//Origin type setting
		$('input[name=originType]').on("change", function(){
			//Set value
			map_originType_temp = $(this).attr("value");
			map_originType != map_originType_temp ? $("#set_originType").attr("class","content_btn"): $("#set_originType").attr("class","content_btn_disabled");
		});
		$("#origin_"+map_originType).prop("checked", "true");

		$("#set_originType").on("click", function(){
			if (map_originType != map_originType_temp){
				map_originType = map_originType_temp;
				isOriginTypeChanged = true;
			}
			else{isOriginTypeChanged = false;}
		});
		
		// J Y's address setting
		var home_address_true = false;
		var home_address = "N/A";
		var home_address_long = -10000;
		var home_address_lat = -10000;
		var office_address_true = false;
		var office_address = "N/A";
		var office_address_long = -10000;
		var office_address_lat = -10000;

		var input1 = document.getElementById('user_address_home');
		var input2 = document.getElementById('user_address_office');
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
				$("#set_addresses").attr("class", "content_btn");
				console.log("auto!!");
			} else {
				home_address_true = false;
				home_address = "N/A";
				home_address_long = -10000;
				home_address_lat = -10000;
				if (office_address_true == false){
					$("#set_addresses").attr("class", "content_btn_disabled");
				}
			}
		};
		var place_callback_office = function() {
			if(autocomplete2.getPlace().geometry && autocomplete2.getPlace()) {
				office_address_true = true;
				office_address = autocomplete2.getPlace().formatted_address;
				office_address_long = autocomplete2.getPlace().geometry.location.lng();
				office_address_lat = autocomplete2.getPlace().geometry.location.lat();
				$("#set_addresses").attr("class", "content_btn");
				console.log("auto!!");
			} else {
				office_address_true = false;
				office_address = "N/A";
				office_address_long = -10000;
				office_address_lat = -10000;
				if (home_address_true == false){
					$("#set_addresses").attr("class", "content_btn_disabled");
				}
			}
			if(home_address_true == true || office_address_true == true) {
				$("#set_addresses").attr("class", "content_btn");
			} else {
				$("#set_addresses").attr("class", "content_btn_disabled");
			}
		};

		google.maps.event.addListener(autocomplete1, 'place_changed', place_callback_home);
		google.maps.event.addListener(autocomplete2, 'place_changed', place_callback_office);

		$("#set_addresses").on("click", function(){
			if($("#set_addresses").attr("class") == "content_btn"){
				if(home_address_true){
					user_info.loc_home.address = home_address;
					user_info.loc_home.lng = home_address_long;
					user_info.loc_home.lat = home_address_lat;
				}
				if(office_address_true){
					user_info.loc_office.address = office_address;
					user_info.loc_office.lng = office_address_long;
					user_info.loc_office.lat = office_address_lat;
				}
				console.log(user_info.loc_home.address + user_info.loc_home.lng + user_info.loc_home.lat + user_info.loc_office.address + user_info.loc_office.lng + user_info.loc_office.lat);
				//Ask update
				$.ajax({
					url: path_resetAddress,
					data:{ user_id: user_info.id, 
						user_home: user_info.loc_home.address, 
						user_home_lng: user_info.loc_home.lng, 
						user_home_lat: user_info.loc_home.lat, 
						user_office: user_info.loc_office.address, 
						user_office_lng: user_info.loc_office.lng, 
						user_office_lat: user_info.loc_office.lat
					},
					type: 'POST',
					dataType: 'json',
					async: true,
					success: function(data){
						if(data["res"] == true) {
							load_login6(user_name);
						} else {
							if(mode_debug){console.log("somethings wrong");}
						}
					},
					error: function(request, error){
						if(mode_debug){console.log(error);}
					}
				});				
			}
		});

		$("#set_signout").on("click", function(){
			console.log("hello");
			constructPopup("Sign out", html_popup_SignOut,"signout")
		})

		//Close
		$(".content_main_heading_close").on("click", function(){
			if (isOriginTypeChanged){
				if(mode_debug){console.log("origin type changed");}
				//MJ T.B.D. change origin
			}
			closeSettings();
		});
	});
}
function closeSettings(){
	//Raise the position of filter div
	$("#content_settings").animate({
		top: height_screen + "px", 
		height: 0 + "px"
	}, function(){
		$("#content_settings").empty();
	});	
}
function openFilter(){

	isFilterOpened = true;
	remove_map_UI();
	//If this is the case where the "list" is opened
	var height_offSet = (height_screen)*1; //We can set this to "1" later if necessary
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
	}, function(){
		isUnderAni = false;
	});

	//3. C-DQ
	var title = document.createElement("h1");
    var text = document.createTextNode("Filter");
    title.appendChild(text);
    title.style.color = "black";
    title.style.marginLeft = "60px";

    var rating_container = document.createElement('div');
  	var rating_num_container = document.createElement('div');
  	var price_container = document.createElement('div');

  	rating_container.id = 'rating_root';
  	rating_num_container.id = 'rating_num_root';
  	price_container.id = 'price_root';

  	var root = document.getElementById('content_filter');
  	root.background = "#FFFFFF";
  	root.appendChild(title);
  	root.appendChild(rating_container);
  	root.appendChild(rating_num_container);
  	root.appendChild(price_container);

  	root.style.overflowY = "scroll";
  	var width = root.offsetWidth;

  	const rating_conf = {
    	criterion_name: "Ratings",
    	criterion_id: "ratings",
      	interval: 0.5,
      	tick_interval: 0.5,
      	range: [0, 5],
      	range_MinMax: [true, false],
      	default_selection: [3, 5],
      	anonymize: false
    };
  	const rating_metrics = {
    	h_space_top: 30,
    	h_subject: 34,
    	h_space_subject_txt: 15,
    	h_txt: 30,
    	h_tick: 12,
    	h_space_between: 5,
    	h_me: 40,
    	h_space_me_others: 20,
    	h_other: 25,
    	h_space_bottom: 30,
    	w_space_padding: 60,
    	w_range: width - 2 * 60,
    	bar_radius : 20,
    	handle_radius : 8,
    	handle_width: 15
  	};
  	const rating_pref = [
  	];
  	const rating_handler = {
    	onSelectChange: function (selection){

    	},
    	socketHandler: function (setPreference, initialSelection) {

    	}
  	};

    const rating_num_conf = {
        criterion_name: "Number of ratings",
        criterion_id: "num_rating",
        interval: 200,
        tick_interval: 200,
        range: [0, 1000],
        range_MinMax: [true, true],
        default_selection: [200, 600],
        anonymize: false
    };
    const rating_num_metrics = {
        h_space_top: 30,
        h_subject: 34,
        h_space_subject_txt: 15,
        h_txt: 30,
        h_tick: 12,
        h_space_between: 5,
        h_me: 40,
        h_space_me_others: 20,
        h_other: 25,
        h_space_bottom: 30,
        w_space_padding: 60,
        w_range: width - 2 * 60,
        bar_radius : 20,
        handle_radius : 8,
        handle_width: 15
    };
    const rating_num_pref = [
    ];
    const rating_num_handler = {
        onSelectChange: function (selection){

        },
        socketHandler: function (setPreference, initialSelection) {

        }
    };

    const price_conf = {
        criterion_name: "Price Range",
        criterion_id: "price_range",
        tick_num: 5,
        label: ["$", "$$", "$$$", "$$$$"],
        range_MinMax: [true, true],
        default_selection: [1, 2],
        anonymize: false
    };
    const price_metrics = {
        h_space_top : 30,
        h_subject: 34,
        h_space_subject_txt: 15,
        h_txt: 30,
        h_tick: 12,
        h_space_between: 5,
        h_me: 40,
        h_space_me_others: 20,
        h_other: 25,
        h_space_bottom: 30,
        w_space_padding: 60,
        w_between_tick: (width - 2*60)/4,
        bar_radius : 20,
        handle_radius : 8,
        handle_width: 15
    };
    const price_pref = [
    ];
    const price_handler = {
        onSelectChange: function (selection){

        },
        socketHandler: function (setPreference, initialSelection) {

        }
    };

    QuantCDQInit('rating_root', rating_conf, rating_metrics, rating_pref, rating_handler);
    QuantCDQInit('rating_num_root', rating_num_conf, rating_num_metrics, rating_num_pref, rating_num_handler);
    OrdCDQInit('price_root', price_conf, price_metrics, price_pref, price_handler);	

    $("#content_filter").append('<div id="window_close" style="position: absolute; right:20px; top:20px;"><img src="img/window_close.png"/></div>')
    $("#window_close").on("click", function(){closeFilter();})
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
		isUnderAni = false;
		if(!isListOpened){create_map_UI();}
	});
}
function openList(){
	console.log("started updating");

	//remove_map_UI()
	//Time logging stuff
//	time_mode_end = Math.floor(Date.now() / 1000);
//	if (time_mode_current == 0){
//		user_log.mode_duration.WM += time_mode_end - time_mode_start;
//	}
//	else if (time_mode_current == 1){
//		user_log.mode_duration.DC += time_mode_end - time_mode_start;
//	}
//	else {console.log("something weird happened while logging time...");}

//	console.log("Finished logging " + time_mode_current)
//	time_mode_current = 2;
//	time_mode_start = Math.floor(Date.now() / 1000);
//	console.log("Started logging " + time_mode_current)

	//Step 1. move buttons 
				//Construct TOD
	$("#content_list").append(html_list); 
	// ADD ICON IMAGE
	var catid_1 = parseInt(map_TOD.split("_")[0]); //1 of 1_2
	var catid_2 = parseInt(map_TOD.split("_")[1]); //2 of 1_2
	$("#currentTOD").append('<img src="img/headicon_menu'+map_TOD.split("_")[0]+'.png"/>');
	//Set text height
	$(".content_main_textarea_list").css({
		"height": /*height_screen - $(".content_main_heading").height() - 100 + "*/"770px"
	});
	//Add each item one by
	$("#currentTOD").append(data_cat.cat[catid_1-1].cat_sub[catid_2-1].cat_name);
	for (var i=0; i<data_currentset.length; i++){
		console.log(data_currentset[i]);
		var isPriceAvailable = true;
		var dest_id = {orig:"", simp:""};
		dest_id.orig = data_currentset[i].id;
		dest_id.simp = checkDestID(data_currentset[i].id); //Use checkDestID(str) to FIND IDs
		console.log(dest_id);
		console.log(dest_IDS);
		dest_IDS.push(dest_id);
		var dest_hours = data_currentset[i].hours;
		//Name
		var dest_name = data_currentset[i].name;
		if(dest_name.length>=30){dest_name = dest_name.slice(0,30)+"...";}
		//Price
		var dest_price_range = data_currentset[i].price_range;
		var dest_price_word = "";
		var dest_price_range = data_currentset[i].price_range;
		if (dest_price_range == 1){
			dest_price_word = "Inexpensive";
			dest_price_range = "$";
		}
		else if (dest_price_range == 2){
			dest_price_word = "Moderate";
			dest_price_range = "$$";
		}
		else if (dest_price_range == 3){
			dest_price_word = "Expensive";
			dest_price_range = "$$$";
		}
		else if (dest_price_range == 4){
			dest_price_word = "Super luxurious";
			dest_price_range = "$$$$";
		}
		else {
			isPriceAvailable = false;
		}
		var dest_price = data_currentset[i].price.toLowerCase();
		//Ratings
		var dest_rating = data_currentset[i].rating;
		var dest_rating_cnt = data_currentset[i].rating_cnt;
		var dest_rating_cnt_word = "";
		if (dest_rating_cnt <= 49){dest_rating_cnt_word = "Less known";}
		else if (dest_rating_cnt <= 499){dest_rating_cnt_word = "Known";}
		else if (dest_rating_cnt <= 999){dest_rating_cnt_word = "Famous";}
		else if (dest_rating_cnt > 1000){dest_rating_cnt_word = "Super famous";}

		var dest_path = data_currentset[i].path;
		//Times
		var dest_time = Math.round(Math.round(data_currentset[i].time)/60);
		
		$(".content_main_textarea_list").append('<div class = "content_eachdest" id="'+dest_id.simp+'"></div>');
		//image
		$("#"+dest_id.simp).append('<div class = "content_eachdest_img"><img src="'+dest_path+'"/></div>');
		var str_temp = '<div class="content_eachdest_txt"></div>';
		$("#"+dest_id.simp).append(str_temp);
		str_temp = '<div class="content_eachdest_line1">';
		str_temp += dest_name + '<span class="content_eachdest_rating"></div></div>';

		var rating = dest_rating;
		var cnt = 0;
		while (rating>0){
			cnt++;
			if (rating >= 1.5){str_temp += '<img src = "img/icon_star_1.png"/>&nbsp;'}
			else if (rating == 1){str_temp += '<img src = "img/icon_star_1.png"/>'}
			else if (rating == 0.5){str_temp += '<img src = "img/icon_star_point5.png"/>'}
			rating = rating -1;
		}
		if (cnt<=5){
			for (j=cnt; j<5; j++){
				str_temp += '&nbsp;<img src = "img/icon_star_0.png"/>'
			}
		}
		str_temp += '</span></div>';
		str_temp += '<div class="content_eachdest_line2">'
		if (isPriceAvailable){
			str_temp += '<div><span class="stress">' + dest_price_word + '</span> (' + dest_price_range + '), ';
		}
		str_temp += '<span class="stress">' + dest_rating_cnt_word + '</span> (' + dest_rating_cnt + ' ratings), ';
		str_temp += '<span class="stress">' + dest_time + '</span> minutes to get here</div>';
		$("#"+dest_id.simp + " .content_eachdest_txt").append(str_temp);

		//console.log("#"+dest_id).css("background", "black");
		$("#"+dest_id.simp + " .content_eachdest_img").on("click", function(){
			for (var j=0; j<dest_IDS.length; j++){
				if ($(this).parent().attr("id") == dest_IDS[j].simp){
					openDetail(dest_IDS[j]);
				}
			}
		});

		//Favorite related: 
		//check if this is fav
		var is_this_fav = false;
		for (var j=0; j<user_info.loc_fav.length; j++){
			if(dest_id.simp == user_info.loc_fav[j]){
				is_this_fav = true;
			}
		}
		var fav_path;
		//include fav icon
		if (is_this_fav){
			fav_path = "img/icon_fav_on.png";
		}
		else{
			fav_path = "img/icon_fav_off.png";
		}
		$("#"+dest_id.simp).append("<div style='position:absolute; top:0px; right:0px; z-index:20'; id = 'fav_" + dest_id.simp + "'><img src='" + fav_path +"'/></div>");
		//add event - add to fav 
		$("#fav_"+dest_id.simp).on("click", function(){
			//console.log("hello there, ");
			var this_id = $(this).attr("id").split("_")[1];
			//console.log(this_id);
			is_this_fav = false;
			for (var j=0; j<user_info.loc_fav.length; j++){
				if(this_id == user_info.loc_fav[j]){
					is_this_fav = true;
					//should now remove this
					user_info.loc_fav.splice(j, 1);
					$("#fav_"+this_id + " img").attr("src", "img/icon_fav_off.png");
					$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_off.png");
				}
			}
			if(is_this_fav == false){
				//should add this now
				user_info.loc_fav.push(this_id);
				$("#fav_"+this_id + " img").attr("src", "img/icon_fav_on.png");
				$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_on.png");
			}
			////CALL 
		});
	}
}

function openDetail(dest_id){	

	$.ajax({
		url: path_dest_detail,
		data:{dest_id: dest_id.simp},
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){

			//console.log(dest_id.simp);
			//console.log(data);
			if(data["detail"]["dest_id"] != null){
				//Raise the position of filter div
				$("#content_settings").empty();
				$("#content_settings").append(html_detail);
				//Pull settings top to layer
				$("#content_settings").css("z-index", 100);

				//overflow:auto thing - need to set DIV height
				$("#content_settings .content_main_textarea_detail").css({
					"height": "770px",
					"overflow": "auto"
				});
				$("#content_settings .content_main_heading").css({
					"width" : $("#content_map").width()
				});
				$("#content_settings").css({
					"left-padding" : "20px"
				})
				$("#content_settings").css({
					top: 0 + "px", 
					height: "800px",
					opacity: 0
				});
				//Step 1. Get full information of this location
				$("#content_settings").animate({opacity: 1});

				if(mode_debug){console.log(data);}
				//cat 1. Info 1
				price_range = data.detail.dest_price_range;
				price = data.detail.dest_price;
				rating = data.detail.dest_rating;
				rating_cnt = data.detail.dest_rating_cnt;
				name = data.detail.dest_name;
				cat = data.detail.dest_cat;
				cats = data.detail.dest_cats;
				//cat 2. Info 2
				phone = data.detail.dest_info_phone;
				address = data.detail.dest_info_address;
				// cat 3. Img
				imgs = data.detail.dest_imgs;
				//Highlights
				highlights = data.detail.dest_highlights;
				//Full review
				fullrev = data.detail.dest_fullrev;
				//Additional
				lng = data.detail.dest_lng;
				lat = data.detail.dest_lat;
				url_mobile = data.detail.dest_url_mobile;

				//CAT 1 processing 
				//Name
				var name_word = name;
				//Rating
				var rating_word = "<span>";
				var cnt = 0;
				while (rating>0){
					cnt++;
					if (rating >= 1.5){rating_word += '<img src = "img/icon_star_1.png"/>&nbsp;'}
					else if (rating == 1){rating_word += '<img src = "img/icon_star_1.png"/>'}
					else if (rating == 0.5){rating_word += '<img src = "img/icon_star_point5.png"/>'}
					rating = rating -1;
				}
				if (cnt<=5){
					for (j=cnt; j<5; j++){
						rating_word += '&nbsp;<img src = "img/icon_star_0.png"/>'
					}
				}
				var rating_cnt_word = "";
				if (rating_cnt <= 49){rating_cnt_word = "Less known";}
				else if (rating_cnt <= 499){rating_cnt_word = "Known";}
				else if (rating_cnt <=999){rating_cnt_word = "Famous";}
				else if (rating_cnt > 1000){rating_cnt_word = "Super famous";}

				var rating_word_temp = '<span> &nbsp; ('+ rating_cnt_word +': '+ rating_cnt +' ratings)</span>';
				var rating_word = rating_word + rating_word_temp;
				//Cat
				var cat_word = "";
				//console.log(cat);
				//console.log(cats.toLowerCase().split("#").join("&nbsp;"));
				if (cats!= null){
					cat_word = '<span>' + cat + ", " + cats.toLowerCase().split("#").join(", ") + '</span>';
				}
				else{ cat_word = '<span>' + cat + '</span>'}
				 
				//Price
				var price_word = "";
				if (price_range == "$"){price_word = 'Inexpensive ($)';}
				else if (price_range == "$$"){price_word = 'Moderate ($$)';}
				else if (price_range == "$$$"){price_word = 'Expensive ($$$)';}
				else if (price_range == "$$$$"){price_word = 'Super luxurious ($$$$)';}
				else {price_word = "Price information is not available."}
				
				$("#dest_name").append(name_word);
				$("#dest_name_title").append(name_word.toUpperCase());
				$("#detail_basic1").append('<div><span class="stress">Ratings</span>: ' + rating_word + '</div>');
				$("#detail_basic1").append('<div><span class="stress">Category</span>: ' + cat_word + '</div>');
				$("#detail_basic1").append('<div><span class="stress">Price</span>: ' + price_word + '</div>');
				$("#detail_basic2").append('<div><span class="stress">Contact Information:</span>:</br>' + phone + ', '+ address + '</div>');

				var img_word = '<div class="content_images_wraper">'
				img_links = imgs.split("|*|");
				for (i=0;i<img_links.length;i++){
					img_word += '<img src="' + img_links[i] + '"/>';
				}
				img_word += '</div>';

				$("#detail_img").append(
					img_word
				);

				var highlights_word = '';
				hl_links = highlights.split("|*|");
				var is_hightlight_available = true;
				for (i=0; i<hl_links.length; i++){
					hl_links_sub = hl_links[i].split("||")[1];
					if (hl_links_sub == "N/A"){
						is_hightlight_available = false;
					}
					else{
						hl_sentence = '<div style="font-style:italic;margin-bottom:30px;">' +  hl_links_sub.slice(hl_links_sub.indexOf('“'), hl_links_sub.indexOf('”')+1) + '</div>';
						highlights_word += hl_sentence;
					}
				}
				if (is_hightlight_available){
					$("#detail_highlights").append(highlights_word);
				}
				else{
					$("#detail_highlights").append("Higglights information is not available.");
				}

				var review_word = '';
				rv_each = fullrev.split("|*|");
				var is_reiview_available = true;
				for (i=0; i< rv_each.length; i++){
					rv_each_author = rv_each[i].split("||")[0];
					rv_each_date = rv_each[i].split("||")[3];
					rv_each_rv = rv_each[i].split("||")[4];
					if (rv_each_rv == "N/A"){
						is_reiview_available = false;
					}
					else{
						rv_sentence = '<div>' + rv_each_rv + '</div>';
						rv_sentence += '<div style="font-style:italic; margin-bottom:30px;">' + rv_each_author + ', on ' + rv_each_date + '</div>';
						review_word += rv_sentence;
					}
				}			
				
				$("#detail_review").append(

					review_word + '<div style="font-size:30px">&nbsp;</div>'
				);

				//Favorite related: 
				//check if this is fav
				var fav_path = "img/icon_fav_off.png";
				console.log("check " + dest_id.simp);
				for (var j=0; j<user_info.loc_fav.length; j++){
					(j + " " + user_info.loc_fav[j]);
					if(dest_id.simp == user_info.loc_fav[j]){
						fav_path = "img/icon_fav_on.png";
					}
				}

				//include fav icon
				$("#dest_name_title").append("<span id = 'fav_detail_" + dest_id.simp + "'><img src='" + fav_path +"'/></div>");
				//add event - add to fav 
				$("#fav_detail_"+dest_id.simp).on("click", function(){
					var this_id = $(this).attr("id").split("_")[2];
					console.log(this_id);

					is_this_fav = false;
					for (var j=0; j<user_info.loc_fav.length; j++){
						if(this_id == user_info.loc_fav[j]){
							is_this_fav = true;
							//should now remove this
							user_info.loc_fav.splice(j, 1);
							$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_off.png");
							$("#fav_"+this_id + " img").attr("src", "img/icon_fav_off.png");
						}
					}
					if(is_this_fav == false){
						//should add this now
						user_info.loc_fav.push(this_id);
						$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_on.png");
						$("#fav_"+this_id + " img").attr("src", "img/icon_fav_on.png");
					}
					////CALL 
				});
				//Add UI buttons
				//UI: TOP LEFT SIDE 
				//1. goto Google Navigation
				if (lng != "N/A" && lat != "N/A"){
					$("#content_settings").append('<div id="btn_gotoGoogleMaps"><img src="img/btn_GoogleMaps.png"/></div>');
					$("#btn_gotoGoogleMaps").css({
						"position": "absolute",			
						"bottom": height_UI_margin + "px", "right": width_UI_margin + "px"
					});
					$("#btn_gotoGoogleMaps").on("click", function(){
						console.log("Google Maps clicked");
						var url = "https://www.google.com/maps/dir/" + user_currentloc.lat +","+ user_currentloc.lng +"/" + lng + "," + lat;
						window.open(url, '_blank');
	  
					});		
				}
				else{
					$("#content_settings").append('<div id="btn_gotoGoogleMaps_disabled"><img src="img/btn_GoogleMaps_disabled.png"/></div>');
					$("#btn_gotoGoogleMaps").css({
						"position": "absolute",			
						"bottom": height_UI_margin + "px", "left": width_UI_margin + "px"
					});
				}
				//2. goto Yelp
				if (url_mobile != "N/A"){
					$("#content_settings").append('<div id="btn_gotoYelp"><img src="img/btn_Yelp.png"/></div>');
					$("#btn_gotoYelp").css({
						"position": "absolute",
						"bottom": height_UI_margin + "px", "right": + width_UI_margin + 58 + "px"
					});		
					$("#btn_gotoYelp").on("click", function(){
						window.open(url_mobile, '_blank');		
					});							
				}
				else{
					$("#content_settings").append('<div id="btn_gotoGoogleMaps_disabled"><img src="img/btn_Yelp_disabled.png"/></div>');
					$("#btn_gotoGoogleMaps").css({
						"position": "absolute",			
						"bottom": height_UI_margin + "px", "left": width_UI_margin + 130 + "px"
					});
				}

				//Close
				$(".content_main_heading_close").on("click", 
					function(){
						$("#content_settings").animate({"opacity": 0}, 
							function(){$("#content_settings").css({
								"top": height_screen + "px", 
								"height": 0 + "px",
								"opacity": 1
								});
								$("#content_settings").empty();
						});
		});
			}
		},
		error: function(request, error){
			if(mode_debug){console.log(error);}
		}
	});


}

function constructPopup(subject, text, casecase){

	$("body").append(html_popup);
	//Include black layer
	$("#popup_blacklayer").css({
		"position": "absolute", 
		"height": height_screen + "px", "width": width_screen + "px", 
		"top": 0 + "px", "left": 0 + "px", background: "rgba(0,0,0,0.5)"});

	//Include subject and text
	$("#popup_heading").append(subject);
	$("#popup_content").append(text);
	if (casecase == "signout"){
		$("#your_id").append(user_info.id);
	}

	//Set popup
	$("#popup").css({
		"position": "absolute", 
		"height": height_screen*0.5 + "px", "width": width_screen*0.7 + "px", 
		"top": height_screen*0.25, "left": width_screen*0.15 + "px", background: "white"});
	$("#popup_content").css({"height": height_screen*0.7 - 150 + "px"});

	//Present popup
	$("#popup").animate({opacity:1},time_screen_trans);

	//casewise events
	if (casecase == "TOT"){
		//Initialize the checked property
		$("#TOT_"+map_TOT).prop("checked", "true");
		//On change
		$('input[name=TOT]').on("change", function(){
			//console.log($(this));
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
					//console.log('<div id="btn_TOT"><img src="img/btn_TOT_'+map_TOT+'.png"/></div>');
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
	if (casecase=="signout"){
		//On signout
		$("#popup_signout_okay").on("click", function(){
			user_info = {
				"id":"",
				"loc_home":{lng:0, lat:0, address:""},
				"loc_office":{lng:0, lat:0, address:""},
				"loc_fav":"",
				"log": {}
			};
			$("#popup").animate({opacity:0},time_screen_trans, function(){
				$(this).remove();
				$("#popup_blacklayer").remove();
				load_login1();
			});
		});		
		//On cancel
		$("#popup_signout_cancel").on("click", function(){
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

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    const timeOutForGettingLocation = 3000; // 3 sec
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

function checkDestID(string){
	var safeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
	var returnString = [];
	for (i=0;i<string.length;i++){
		if(safeChars.indexOf(string[i])>=0){
			returnString.push(string[i]);
		}
	}
	returnString = returnString.join("");
	return returnString;
}