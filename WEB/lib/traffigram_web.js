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
var path_save_favorite = "https://citygramsound.com:4349/save_favorite";

//User log
var user_info = {
	"id":"",
	"loc_home":{lng:0, lat:0, address:""},
	"loc_office":{lng:0, lat:0, address:""},
	"loc_fav":[],
	"name":""
};
var user_log = {
	//"user_id": "",
	"date": null,
	"mode_duration":{
		"DC":0,
		"WM":0,
		"List":0
	},
	"mode_frequency":{
		"DC": {
			"zoom":0,
			"pan":0,
			"change_origin":0,
			"change_transportation":0,
			"highlight_isochrone":0,
			"highlight_custom":0,
			"filter":0, // Not yet
			"see_loc_detail":0,
			"do_navigate":0
		},
		"WM": {
			"zoom":0,
			"pan":0,
			"change_origin":0,
			"change_transportation":0,
			"filter":0, //?
			"see_loc_detail":0,
			"do_navigate":0
		},
		"switching":0 // Ray
	}
}

var user_currentloc = {
	"lng":0, "lat":0
};

var user_filter = [
	{"name": "ratings","0":0,"1":5},
	{"name": "numRatings","0":0,"1":1000},
	{"name": "priceRange","0":0,"1":4}
];
//some variables
var width_screen;
var height_screen;
var height_tap = 105;
var height_transition_gap = 30;
var width_UI_margin = 15;
var height_UI_margin = 20;
var height_map = 650;
var width_map;
var map_scale;

//transition
var time_screen_trans = 400;
var time_interaction_buffer = 400;
//Map related
var map_TOT = 0; //Type of transportation 0: car 1: bicycle 2: on foot
var map_TOT_temp;
var map_TOD //Type of destination
var map_mode = 0; //map mode 0: WM 1:DC
var map_originType = 0 //Type of origin 0: GPS 1: Home 2: Office
var map_originType_temp; //Type of origin 0: GPS 1: Home 2: Office
//UI related
var isListOpened = false;
var isFilterOpened = false;
var isOriginTypeChanged = false;
var isUnderAni = false;
var isDetailedOpen = false;
var whichDetailedID = ""

var dest_IDS;
var dest_IDS_fav;

let tg;

var time
var time_day;
var time_month;
var time_mode_current = map_mode; // 0: WM 1:DC 2: List & Initialize
var time_mode_start = 0;
var time_mode_end = 0;

const saveLogInterval = 10 * 1000; // 10 sec
let logTimer = null;

// Event handler
$(document).ready(function(){
	time = new Date();
	time_day = time.getDate();
	time_month = time.getMonth();
	console.log(time_month + ' ' + time_day);

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

	//Auto login
	if (getCookie("user_n")!="" && getCookie("user_p")!=""){
		var user_name = getCookie("user_n");
		var user_pw = getCookie("user_p");
		proceed_login(user_name, user_pw);
	}
	else{
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

							user_info.id = user_id;
							load_login6(user_name);
							start_log();
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
		"height": height_screen*0.8 + "px", "width": width_screen*0.8 + "px", 
		"top": height_screen*0.1, "left": width_screen*0.1 + "px", background: "white"});
	$("#popup_content").css({"height": height_screen*0.8 - $("#popup_heading").height()*3 + "px"});

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

	//check if there is a cookie


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
			if($(this).attr("class")== "content_btn"){proceed_login(input_email, input_pw);}
		}
	});

	$("#login7_btn_cancel").on("click", function(){
		load_login1();
	});
}

function proceed_login(input_email, input_pw){
	isUnderAni = true
	$.ajax({
		url: path_login7,
		data:{user_id: input_email, user_pw: input_pw},
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){
			//Set cookie once a user logged in successfully
			//console.log("before setting cookies:" + document.cookie);
			document.cookie = "user_n=" + input_email;
			document.cookie  = ("user_p=" + input_pw);
			//console.log("after setting cookies:" + document.cookie);

			if(data["res"] == true){
				//user_info["id"] = data["user_id"];
				user_info.id = input_email;
				user_info["loc_home"].address = data["user_home"];
				user_info["loc_home"].lng = data["user_home_lng"];
				user_info["loc_home"].lat = data["user_home_lat"];
				user_info["loc_office"].address = data["user_office"];
				user_info["loc_office"].lng = data["user_office_lng"];
				user_info["loc_office"].lat = data["user_office_lat"];
				user_info["loc_fav"] = data["user_fav"];

				if (typeof data["user_fav"] === 'string') {
					user_info.loc_fav = JSON.parse(data["user_fav"]);
				}
				else{
					user_info.loc_fav = [];	
				}

				if(mode_debug){console.log("user_info");}

				start_log();

				setTimeout(function(){
					load_TOD("left");
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

//Load screen TOD
//allows a user to browse TOD
function load_TOD(direction){
	//Content empty and reload
	$("#main").append('<div id="content_new"></div>');
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
	}

	$(window).resize(
		function(){
			$("#content_map").css({
				"width": width_map + "px", "height": height_map + "px",
				"top": 0 + "px", "left": 0 + "px"
			});
		}
	);	
}
function load_TOD_construct_DOM(){
	$("#content_new").append(html_TOD);
	// Set position
	$("#content_container_TOD").css("top", "0px");
	$("#content_container_TOD").css("width", width_screen + "px");
	$("#content_container_TOD").css("height", height_screen + "px");
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
			$("#content_container_TOD").append('<div class="content_main_heading"> <img src="img/headicon_CAT@2x.png"/> Destination categories </div>');
			for (i=0; i<data_cat.cat.length;i++){
				this_cat_id = data_cat.cat[i]["cat_id"];
				this_cat_name = data_cat.cat[i]["cat_name"];
				//Add each column .list_down = closed .list_up = opened
				$("#content_container_TOD").append('<div id=cat_'+ this_cat_id +' class="content_main_cat" </div>');
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
			if(mode_debug){console.log(map_TOD + " selected");}
			// MJ
			const catSubcat = map_TOD.split('_'); //map_TOD = 1_1
			const numCat = parseInt(catSubcat[0]) - 1;
			const numSubcat = parseInt(catSubcat[1]) - 1;
			tg.map.tgLocs.changeType(numCat, numSubcat);
			display_map(); //after map is completely loaded, just show it
		});
	}
}

function load_map(){
	width_map = Math.round((height_map * width_screen) / height_screen);
	map_scale = height_screen / height_map;

	$("#main").append('<div id="content_new"></div>');
	$("#content_new").css({
		"position": "absolute", 
		"width": width_screen + "px", "height": height_screen + "px",
		"top": 0 + "px", "left": 0 + "px",
		"background": "#EAEAEA"
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
		"width": width_map + "px", "height": height_map + "px",
		"top": 0 + "px", "left": 0 + "px"
	});

	// Set up a ol_map
	$("#content_map").append('<div id="ol_map" class="ol_map"></div>');
	$("#ol_map").css({
		"width": "100%", "height": "100%"
	});

	// MJ
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

			tg.setHomeAndOffice(user_info.loc_home.address, user_info.loc_home.lat, 
				user_info.loc_home.lng, user_info.loc_home.address, user_info.loc_office.lat, 
				user_info.loc_office.lng);
		}
		else {
			tg.setOriginAsDefault();
		}
		$("#content_map").css({"width": width_screen + "px", "height": height_screen + "px"});
	})
	.catch((error) => {
		console.error(error);
		tg = new TgApp('ol_map');
		tg.setOriginAsDefault();
	});

	//TIME_LOGGING START
	time_mode_start = Math.floor(Date.now() / 1000);
	console.log("started logging the first mode");
	console.log("current mode: "+ time_mode_current);

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
		"background": "rgb(255,255,255)",
		"z-index": 10
	});
	//Set up an empty setting container (from bottom to top)
	$("#content_container_map").append('<div id="content_settings"></div>')
	$("#content_settings").css({
		"position": "absolute",
		"width": width_screen + "px", "height": 0 + "px",
		"top": height_screen + "px", "left": 0 + "px", 
		"background": "rgb(255,255,255)"
	});	

	//UI: TOP LEFT SIDE 
	//1. gotoCAT
	$("#content_container_map").append('<div id="btn_gotoCAT"><img src="img/btn_gotoCat@2x.png"/></div>');
	$("#btn_gotoCAT").css({
		"position": "absolute",			
		"top": height_UI_margin + "px", "left": width_UI_margin + "px"
	});
	$("#btn_gotoCAT").on("click", function(){
		if (isListOpened){
			closeList();
		}
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
		if (isUnderAni == false){
			isUnderAni = true;
			if(isFilterOpened){closeFilter();}
			else{openFilter();}
		}
	});
	
	create_map_UI(); //For buttons at the bottom

	//UI TOP RIGHT SIDE - go to list
	$("#content_container_map").append('<div id="btn_gotoList"><img src="img/btn_gotoList@2x.png"/></div>');
	$("#btn_gotoList").css({ //switch
		"position": "absolute",
		"top": height_UI_margin + "px",  "right": width_UI_margin + "px"
	});
	$("#btn_gotoList").on("click", function(){
		console.log("1 clicked");
		if (isUnderAni == false){
			console.log("2 clicked");
			isUnderAni = true;
			console.log(isUnderAni);
			openList();
		}
	});	
}

function display_map(){


	//Start screen transition
	$("#content").animate({
		left: width_screen * (-1) + "px"
	}, time_screen_trans, function(){
		$("#content").remove();
		$("#content_new").attr("id", "content");
		$("#content_map").css({"width": width_screen + "px", "height": height_screen + "px"});
	});
	//Set the size of
}
function openSettings(){
	//Raise the position of filter div
	$("#content_settings").empty();
	$("#content_settings").append(html_settings);
	//Pull settings top to layer
	$("#content_settings").css("z-index", 100);

	$("#user_address_home").attr("placeholder", user_info.loc_home.address);
	$("#user_address_office").attr("placeholder", user_info.loc_office.address);
	//overflow:auto thing - need to set DIV height
	$(".content_main_textarea").css({
		"height": height_screen - $(".content_main_heading").height() - 100 + "px"
	});
	$("#content_settings").animate({
		top: 0 + "px", 
		height: height_screen + "px"
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

				// MJ
				switch(parseInt(map_originType)) {
					case 0: // current pos
						tg.initMap();
					tg.setOriginAsCurrentLocation();
						break;
					case 1: // home
						tg.initMap();
					tg.setOriginAsHome();
						break;
					case 2: // office
						tg.initMap();
					tg.setOriginAsOffice();
						break;
				}
				// MJ

				doLog('change_origin');
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
							//load_login6(user_name);
						} else {
							if(mode_debug){console.log("somethings wrong");}
						}
					},
					error: function(request, error){
						if(mode_debug){console.log(error);}
					}
				});	

				// MJ
				tg.setHomeAndOffice(user_info.loc_home.address, user_info.loc_home.lat, 
					user_info.loc_home.lng, user_info.loc_home.address, user_info.loc_office.lat, 
					user_info.loc_office.lng);
				// MJ			
			}
		});

		$("#set_signout").on("click", function(){
			console.log("hello");
			constructPopup("Sign out", html_popup_SignOut,"signout");
			end_log();
		})

		//Show list of favorite
		dest_IDS_fav = []; //Initialize
		console.log("add favorite");
		var data_currentset_fav = [];
		data_currentset_fav = tg.getFavorites();
		console.log(data_currentset_fav);
		//data_currentset_fav should be updated but for somereason I cannot see anything.. T.B.D.
		/*
		console.log(user_info.loc_fav);
		for (var i=0; i<user_info.loc_fav.length; i++){
			var this_id = user_info.loc_fav[i];
			console.log(this_id + " investigate");
			for (var j=0; j<data_currentset_fav.length; j++){
				if(data_currentset_fav[j].id == this_id){
					console.log(this_id + " found");

					var isPriceAvailable = true;
					var dest_id = {orig:"", simp:""};
					dest_id.orig = data_currentset_fav[j].id;
					dest_id.simp = checkDestID(data_currentset_fav[j].id); //Use checkDestID(str) to FIND IDs
					dest_IDS_fav.push(dest_id);
					var dest_hours = data_currentset_fav[j].hours;
					//Name
					var dest_name = data_currentset_fav[j].name;
					if(dest_name.length>=25){dest_name = dest_name.slice(0,25)+"...";}
					//Price
					var dest_price_range = data_currentset_fav[j].price_range;
					var dest_price_word = "";
					var dest_price_range = data_currentset_fav[j].price_range;
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
					var dest_price = data_currentset_fav[j].price.toLowerCase();
					//Ratings
					var dest_rating = data_currentset_fav[j].rating;
					var dest_rating_cnt = data_currentset_fav[j].rating_cnt;
					var dest_rating_cnt_word = "";
					if (dest_rating_cnt <= 49){dest_rating_cnt_word = "Less known";}
					else if (dest_rating_cnt <= 499){dest_rating_cnt_word = "Known";}
					else if (dest_rating_cnt <= 999){dest_rating_cnt_word = "Famous";}
					else if (dest_rating_cnt > 1000){dest_rating_cnt_word = "Super famous";}

					var dest_path = data_currentset_fav[j].path;
					//Times
					var dest_time = Math.round(Math.round(data_currentset_fav[j].time)/60);
					
					$(".content_main_list_container").append('<div class = "content_eachdest" id="'+dest_id.simp+'"></div>');
					//image
					$("#"+dest_id.simp).append('<div class = "content_eachdest_img"><img src="'+dest_path+'"/></div>');
					var str_temp = '<div class="content_eachdest_txt"></div>';
					$("#"+dest_id.simp).append(str_temp);
					str_temp = '<div class="content_eachdest_line1">';
					str_temp += dest_name + '<span class="content_eachdest_rating">';

					var rating = dest_rating;
					var cnt = 0;
					while (rating>0){
						cnt++;
						if (rating >= 1.5){str_temp += '<img src = "img/icon_star_1@2x.png"/>&nbsp;'}
						else if (rating == 1){str_temp += '<img src = "img/icon_star_1@2x.png"/>'}
						else if (rating == 0.5){str_temp += '<img src = "img/icon_star_point5@2x.png"/>'}
						rating = rating -1;
					}
					if (cnt<=5){
						for (j=cnt; j<5; j++){
							str_temp += '&nbsp;<img src = "img/icon_star_0@2x.png"/>'
						}
					}
					str_temp += '</span></div>';
					str_temp += '<div class="content_eachdest_line2">'
					if (isPriceAvailable){
						str_temp += '<span class="stress">' + dest_price_word + '</span> (' + dest_price_range + ')';
					}
					str_temp += '<span class="stress">' + dest_rating_cnt_word + '</span> (' + dest_rating_cnt + ' ratings) ';			
					str_temp += '</div>';
					str_temp += '<div class="content_eachdest_line2"><span class="stress">' + dest_time + '</span> minutes to get here</div>';
					$("#"+dest_id.simp + " .content_eachdest_txt").append(str_temp);
					//console.log("#"+dest_id).css("background", "black");
					$("#"+dest_id.simp + " .content_eachdest_img").on("click", function(){
						for (var k=0; k<dest_IDS_fav.length; k++){
							if ($(this).parent().attr("id") == dest_IDS_fav[k].simp){
								openDetail(dest_IDS_fav[k]);
							}
						}
					});

					//Favorite related: 
					//check if this is fav
					var is_this_fav = false;
					for (var k=0; k<user_info.loc_fav.length; k++){
						if(dest_id.simp == user_info.loc_fav[k]){
							is_this_fav = true;
						}
					}
					var fav_path;
					//include fav icon
					if (is_this_fav){
						fav_path = "img/icon_fav_on@2x.png";
					}
					else{
						fav_path = "img/icon_fav_off@2x.png";
					}
					$("#"+dest_id.simp).append("<div style='position:absolute; top:10px; right:10px; z-index:20'; id = 'fav_" + dest_id.simp + "'><img src='" + fav_path +"'/></div>");
					//add event - add to fav 
					$("#fav_"+dest_id.simp).on("mouseover", function(){ $(this).css("cursor", "pointer");});
					$("#fav_"+dest_id.simp).on("click", function(){
						console.log("favorite clicked");
						//console.log("hello there, ");
						var this_id = $(this).attr("id").split("_")[1];
						//console.log(this_id);
						is_this_fav = false;
						for (var k=0; k<user_info.loc_fav.length; k++){
							if(this_id == user_info.loc_fav[k]){
								is_this_fav = true;
								//should now remove this
								const removedFav = user_info.loc_fav.splice(k, 1);
								$("#fav_"+this_id + " img").attr("src", "img/icon_fav_off@2x.png");
								$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_off@2x.png");
								tg.removeFavorite(removedFav);
								saveFavorite();
							}
						}
						if(is_this_fav == false){
							//should add this now
							console.log(this_id);
							user_info.loc_fav.push(this_id);
							$("#fav_"+this_id + " img").attr("src", "img/icon_fav_on@2x.png");
							$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_on@2x.png");
							tg.addFavorite(this_id);
							saveFavorite();
						}
					});	

				}

			}
		}*/
		//End of favorite

		//Close
		$(".content_main_heading_close").on("click", function(){
			if (isOriginTypeChanged){
				if(mode_debug){console.log("origin type changed");}
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
		isDetailedOpen = false;
		$("#content_settings").empty();
	});	

	//Set the size of
	$("#content_map").css({"width": width_screen + "px", "height": height_screen + "px"});	
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
		default_selection: [user_filter[0]["0"], user_filter[0]["1"]],
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
		w_space_padding: 160,
		w_range: width - 2 * 160,
		bar_radius : 20,
		handle_radius : 25,
		handle_width: 50
	};
	const rating_pref = [
	];
	const rating_handler = {
		onSelectChange: function (val){
			user_filter[0]["0"] = val[0];
			user_filter[0]["1"] = val[1];
			tg.filter('ratings', val[0], val[1]);
			doLog('filter');
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
		default_selection: [user_filter[1]["0"], user_filter[1]["1"]],
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
		w_space_padding: 160,
		w_range: width - 2 * 160,
		bar_radius : 20,
		handle_radius : 25,
		handle_width: 50
	};
	const rating_num_pref = [
	];
	const rating_num_handler = {
		onSelectChange: function (val){
			user_filter[1]["0"] = val[0];
			user_filter[1]["1"] = val[1];	
			tg.filter('numRatings', val[0], val[1]);
			doLog('filter');

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
		default_selection: [user_filter[2]["0"], user_filter[2]["1"]],
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
		w_space_padding: 160,
		w_between_tick: (width - 2*160)/4,
		bar_radius : 20,
		handle_radius : 25,
		handle_width: 50
	};
	const price_pref = [
	];
	const price_handler = {
		onSelectChange: function (val){
			user_filter[2]["0"] = val[0];
			user_filter[2]["1"] = val[1];
			tg.filter('priceRange', val[0], val[1]);
			doLog('filter');
		},
		socketHandler: function (setPreference, initialSelection) {

		}
	};
	QuantCDQInit('rating_root', rating_conf, rating_metrics, rating_pref, rating_handler);
	QuantCDQInit('rating_num_root', rating_num_conf, rating_num_metrics, rating_num_pref, rating_num_handler);
	OrdCDQInit('price_root', price_conf, price_metrics, price_pref, price_handler);	

	$("#content_filter").append('<div id="window_close" style="position: absolute; right:20px; top:20px;"><img src="img/btn_window_close@2x.png"/></div>')
	$("#window_close").on("click", function(){
		closeFilter();
		if (isListOpened){
			constructList();
		}
	})
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
function create_map_UI(){
	//UI BOTTOM LEFT SIDE - Switch
	if ($("#btn_switch").length == 0){
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
				
				// MJ
				tg.goToEm();
				// MJ

				//Time logging
				time_mode_end = Math.floor(Date.now() / 1000);
				user_log.mode_duration.DC += time_mode_end - time_mode_start;
				console.log("Finished logging " + time_mode_current + " which should be DC");

				time_mode_current = 1;
				time_mode_start = Math.floor(Date.now() / 1000);
				console.log("Started logging " + time_mode_current +  " which should be WM");
				//switching++
				user_log.mode_frequency.switching += 1;
			}
		});
		$("#t").on("click", function(){
			if (map_mode == 0){ //work only if the current mode is DC
				$("#s img").attr("src", 'img/switch_s_off.png');
				$("#t img").attr("src", 'img/switch_t_on.png');
				map_mode = 1;
				
				// MJ
				tg.goToDc('shapePreserving');
				// MJ

				//Time logging
				time_mode_end = Math.floor(Date.now() / 1000);
				user_log.mode_duration.WM += time_mode_end - time_mode_start;
				console.log("Finished logging " + time_mode_current + " which should be WM");

				time_mode_current = 0;
				time_mode_start = Math.floor(Date.now() / 1000);
				console.log("Started logging " + time_mode_current +  " which should be DC");
				//switching++
				user_log.mode_frequency.switching += 1;
			}
		});
	}


	//UI BOTTOM RIGHT SIDE 
	//1. resetOrigin
	if ($("#btn_resetOrigin").length == 0){
		$("#content_container_map").append('<div id="btn_resetOrigin"><img src="img/btn_resetOrigin@2x.png"/></div>');
		$("#btn_resetOrigin").css({ //switch
			"position": "absolute", 
			"bottom": height_UI_margin + "px", "right": width_UI_margin + "px"
		});
		//Event - resetOrigin MJ T.B.D.
		$("#btn_resetOrigin").on("click", function(){
			//Change UI to standard mode
			if (map_mode == 1){
				map_mode = 0;
				$("#s img").attr("src", 'img/switch_s_on.png');
				$("#t img").attr("src", 'img/switch_t_off.png');
                        }
			// MJ
			tg.initMap();
			tg.setOriginAsCurrentLocation();
			doLog('change_origin');

			
		});
	}
	//2. TOT
	if ($("#btn_TOT").length == 0){
		$("#content_container_map").append('<div id="btn_TOT"><img src="'+'img/btn_TOT_'+map_TOT+'.png"/></div>');
		$("#btn_TOT").css({ //switch
			"position": "absolute", 
			"bottom": height_UI_margin + "px", "right": width_UI_margin + 130 + "px"
		});
		$("#btn_TOT").on("click", function(){
			constructPopup("MODE OF TRANSPORTATION", html_popup_TOT, "TOT");
		}); 		
	}
	//3 Zoom in and out
	if ($("#btn_zoom").length == 0){
		$("#content_container_map").append('<div id="btn_zoom"></div>');
		$("#btn_zoom").append('<div id="zoomin"><img style = "display: block;" src="img/btn_zoomin@2x.png"/></div>');
		$("#btn_zoom").append('<div id="zoomout"><img style = "display: block;" src="img/btn_zoomout@2x.png"/></div>');
		$("#btn_zoom").css({ //switch
			"position": "absolute", 
			"bottom": height_UI_margin + 144 + "px", "right":  width_UI_margin + "px" //144: $("#btn_resetOrigin").height()
		});
		//Event - Zoom
		$("#zoomin").on("mousedown", function(){
			if (isUnderAni == false){
				$("#zoomin img").attr("src", 'img/btn_zoomin_onpress@2x.png');
			}
		});

		$("#zoomin").on("mouseup", function(){
			if (isUnderAni == false){
				isUnderAni = true;
				$("#zoomin img").attr("src", 'img/btn_zoomin@2x.png');
				console.log("zoom in!!!");
				setTimeout(function(){isUnderAni = false}, 700);
				//MJ: ADD ZOOM IN CODE HERE
				tg.zoomIn();
			}			
		});
		//Event - Zoom
		$("#zoomout").on("mousedown", function(){
			if (isUnderAni == false){
				$("#zoomout img").attr("src", 'img/btn_zoomout_onpress@2x.png');				
			}
		});

		$("#zoomout").on("mouseup", function(){
			if (isUnderAni == false){
				isUnderAni = true;			
				$("#zoomout img").attr("src", 'img/btn_zoomout@2x.png');
				console.log("zoom out!!!");
				setTimeout(function(){isUnderAni = false}, 700);
				//MJ: ADD ZOOM OUT CODE HERE
				tg.zoomOut();
			}							
		});
	}	
}
function remove_map_UI(){
	$("#btn_switch").remove();
	$("#btn_resetOrigin").remove();
	$("#btn_TOT").remove();
	$("#btn_zoom").remove();
}
function openList(){
	remove_map_UI()

	//Time logging stuff
	time_mode_end = Math.floor(Date.now() / 1000);
	if (time_mode_current == 0){
		user_log.mode_duration.WM += time_mode_end - time_mode_start;
	}
	else if (time_mode_current == 1){
		user_log.mode_duration.DC += time_mode_end - time_mode_start;
	}
	else {console.log("something weird happened while logging time...");}

	time_mode_current = 2;
	time_mode_start = Math.floor(Date.now() / 1000);
	console.log("Started logging " + time_mode_current)

	//Step 1. move buttons 
	var height_temp = $("#btn_gotoCAT").height();
	var width_temp = $("#btn_gotoCAT").height();
	$("#btn_gotoFilter").animate({top: height_screen-height_UI_margin-height_temp + "px"}, time_screen_trans*2);
	$("#btn_gotoSet").animate({top: height_screen-height_UI_margin-height_temp + "px"}, time_screen_trans*2);
	$("#btn_gotoCAT").animate({top: height_screen-height_UI_margin-height_temp + "px"}, time_screen_trans*2);

	//Step 2. Update gotolist then move it
	setTimeout(function(){
		//Change gotoList button to gotoMap button
		$("#btn_gotoList").remove();
		$("#content_container_map").append('<div id="btn_gotoMap"><img src="img/btn_gotoMap@2x.png"/></div>');
		$("#btn_gotoMap").css({ //switch
			"position": "absolute",
			"top": height_UI_margin + "px",  "right": width_UI_margin + "px"
		});
		$("#btn_gotoMap").animate({top: height_UI_margin + "px", right: width_screen - width_UI_margin - width_temp + "px"}, time_screen_trans*2);
		$("#btn_gotoMap").on("click", function(){closeList()});

		//Step 3. Start Screen transition
		$("#content_list").animate({
			left: 0 + "px", 
			width: width_screen + "px"
			},
			time_screen_trans,
			function(){
				isUnderAni = false;
				isListOpened = true;
				dest_IDS = []; //initialize;
				
				//Construct TOD
				constructList();
			}
		);
	}, time_screen_trans*2);
	//Reset window size
	$(window).resize(
		function(){
			$("#content_map").css({
				"width": width_map + "px", "height": height_map + "px",
				"top": 0 + "px", "left": 0 + "px"
			});
		}
	);	
}

function constructList(){
	$("#content_list").empty();
	$("#content_list").append(html_list); 
	// ADD ICON IMAGE
	var catid_1 = parseInt(map_TOD.split("_")[0]); //1 of 1_2
	var catid_2 = parseInt(map_TOD.split("_")[1]); //2 of 1_2
	$("#currentTOD").append('<img src="img/headicon_menu'+map_TOD.split("_")[0]+'@2x.png"/>');
	//Set text height
	$(".content_main_textarea").css({
		"height": height_screen - $(".content_main_heading").height() - 100 + "px"
	});
	//Add each item one by
	$("#currentTOD").append(data_cat.cat[catid_1-1].cat_sub[catid_2-1].cat_name);
	for (var i=0; i<data_currentset.length; i++){
		//console.log(data_currentset[i]);
		var isPriceAvailable = true;
		var dest_id = {orig:"", simp:""};
		dest_id.orig = data_currentset[i].id;
		dest_id.simp = checkDestID(data_currentset[i].id); //Use checkDestID(str) to FIND IDs
		dest_IDS.push(dest_id);
		var dest_hours = data_currentset[i].hours;
		//Name
		var dest_name = data_currentset[i].name;
		if(dest_name.length>=25){dest_name = dest_name.slice(0,25)+"...";}
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
		if(dest_path == "N/A"){ dest_path = "img/INA.png"}

		//Times
		var dest_time = Math.round(Math.round(data_currentset[i].time)/60);
		
		$(".content_main_textarea").append('<div class = "content_eachdest" id="'+dest_id.simp+'"></div>');
		//image
		$("#"+dest_id.simp).append('<div class = "content_eachdest_img"><img src="'+dest_path+'"/></div>');
		var str_temp = '<div class="content_eachdest_txt"></div>';
		$("#"+dest_id.simp).append(str_temp);
		str_temp = '<div class="content_eachdest_line1">';
		str_temp += dest_name + '<span class="content_eachdest_rating">';

		var rating = dest_rating;
		var cnt = 0;
		while (rating>0){
			cnt++;
			if (rating >= 1.5){str_temp += '<img src = "img/icon_star_1@2x.png"/>&nbsp;'}
			else if (rating == 1){str_temp += '<img src = "img/icon_star_1@2x.png"/>'}
			else if (rating == 0.5){str_temp += '<img src = "img/icon_star_point5@2x.png"/>'}
			rating = rating -1;
		}
		if (cnt<=5){
			for (j=cnt; j<5; j++){
				str_temp += '&nbsp;<img src = "img/icon_star_0@2x.png"/>'
			}
		}
		str_temp += '</span></div>';
		str_temp += '<div class="content_eachdest_line2">'
		if (isPriceAvailable){
			str_temp += '<span class="stress">' + dest_price_word + '</span> (' + dest_price_range + ')';
		}
		str_temp += '<span class="stress">' + dest_rating_cnt_word + '</span> (' + dest_rating_cnt + ' ratings) ';			
		str_temp += '</div>';
		str_temp += '<div class="content_eachdest_line2"><span class="stress">' + dest_time + '</span> minutes to get here</div>';
		$("#"+dest_id.simp + " .content_eachdest_txt").append(str_temp);
		//console.log("#"+dest_id).css("background", "black");
		$("#"+dest_id.simp).on("click", function(){
			var this_id = $(this).attr("id");
			if (isDetailedOpen == false || this_id != whichDetailedID){
				for (var j=0; j<dest_IDS.length; j++){
					if ($(this).attr("id") == dest_IDS[j].simp){
						isDetailedOpen = true;
						whichDetailedID = $(this).parent().attr("id");
						openDetail(dest_IDS[j]);
					}
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
			fav_path = "img/icon_fav_on@2x.png";
		}
		else{
			fav_path = "img/icon_fav_off@2x.png";
		}
		$("#"+dest_id.simp).append("<div style='position:absolute; top:10px; right:10px; z-index:20'; id = 'fav_" + dest_id.simp + "'><img src='" + fav_path +"'/></div>");
		//add event - add to fav 
		$("#fav_"+dest_id.simp).on("mouseover", function(){ $(this).css("cursor", "pointer");});
		$("#fav_"+dest_id.simp).on("click", function(){
			console.log("favorite clicked");
			//console.log("hello there, ");
			var this_id = $(this).attr("id").split("_")[1];
			//console.log(this_id);
			is_this_fav = false;
			for (var j=0; j<user_info.loc_fav.length; j++){
				if(this_id == user_info.loc_fav[j]){
					is_this_fav = true;
					//should now remove this
					const removedFav = user_info.loc_fav.splice(j, 1);
					$("#fav_"+this_id + " img").attr("src", "img/icon_fav_off@2x.png");
					$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_off@2x.png");
					tg.removeFavorite(removedFav);
					saveFavorite();
				}
			}
			if(is_this_fav == false){
				//should add this now
				console.log(this_id);
				user_info.loc_fav.push(this_id);
				$("#fav_"+this_id + " img").attr("src", "img/icon_fav_on@2x.png");
				$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_on@2x.png");
				tg.addFavorite(this_id);
				saveFavorite();
			}
		});	
		//End of favorite related
	}
}

function saveFavorite() {
	console.log('request saveFavorite');
	$.ajax({
		url: path_save_favorite,
		data:{ user_id: user_info.id, 
			user_fav: JSON.stringify(user_info.loc_fav), 
		},
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){
			if(data["res"] === true) {
				console.log('saved favorite.');
			} else {
				console.log("somethings wrong");
			}
		},
		error: function(request, error){
			if(mode_debug){console.log(error);}
		}
	});
}

function closeList(){
	
	time_mode_end = Math.floor(Date.now() / 1000);
	user_log.mode_duration.List += time_mode_end - time_mode_start;
	console.log("Finished logging " + time_mode_current + " which should be List");

	time_mode_current = map_mode;
	time_mode_start = Math.floor(Date.now() / 1000);
	console.log("Started logging " + time_mode_current + " which should be one of maps");

	//Step 1. Transiting the screen
	create_map_UI()
	//Empty the list
	$("#content_list").empty();
	//animate content list
	$("#content_list").animate({
			width: 0 + "px",
			left: width_screen + "px"
		});

	//Step 2. GOTOLIST stuffs
	var width_temp = $("#btn_gotoCAT").width();
	$("#btn_gotoMap").remove();
	$("#content_container_map").append('<div id="btn_gotoList"><img src="img/btn_gotoList@2x.png"/></div>');
	$("#btn_gotoList").css({ //switch
		"position": "absolute", 
		"top": height_UI_margin + "px",  "right": width_screen - width_UI_margin - width_temp + "px"
	});
	$("#btn_gotoList").animate({"top": height_UI_margin + "px",  "right": width_UI_margin + "px"}, function(){

		//Step 3. Move buttons
		$("#btn_gotoCAT").animate({top: height_UI_margin + "px"}, time_screen_trans*2);
		$("#btn_gotoSet").animate({top: height_UI_margin + "px"}, time_screen_trans*2);
		$("#btn_gotoFilter").animate({top: height_UI_margin + "px"}, time_screen_trans*2);
	})
	$("#btn_gotoList").on("click", function(){
		if (isUnderAni == false){
			isUnderAni = true;
			openList();	
		}
	});
	isListOpened = false;
	//Reset
	tg.resetCurrentSet();

	//Set the size of
	$("#content_map").css({"width": width_screen + "px", "height": height_screen + "px"});
}

function openDetail(dest_id){	

	doLog('see_loc_detail');

	//Step 2. AJSC call
	$.ajax({
		url: path_dest_detail,
		data:{dest_id: dest_id.simp},
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){
			if(mode_debug){console.log(data);}

			if (data.detail !== false) {
				if(data["detail"]["dest_id"] != null){
					//Raise the position of filter div
					$("#content_settings").empty();
					$("#content_settings").append(html_detail);
					//Pull settings top to layer
					$("#content_settings").css("z-index", 100);

					//overflow:auto thing - need to set DIV height
					$(".content_main_textarea").css({
						"height": height_screen - $(".content_main_heading").height() - 100 + "px"
					});
					$("#content_settings").css({
						top: 0 + "px", 
						height: height_screen + "px",
						opacity: 0
					});
					//Step 1. Get full information of this location
					$("#content_settings").animate({
						opacity: 1});

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
						if (rating >= 1.5){rating_word += '<img src = "img/icon_star_1@2x.png"/>&nbsp;'}
						else if (rating == 1){rating_word += '<img src = "img/icon_star_1@2x.png"/>'}
						else if (rating == 0.5){rating_word += '<img src = "img/icon_star_point5@2x.png"/>'}
						rating = rating -1;
					}
					if (cnt<=5){
						for (j=cnt; j<5; j++){
							rating_word += '&nbsp;<img src = "img/icon_star_0@2x.png"/>'
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
						if (img_links[i] !="N/A"){
							img_word += '<img src="' + img_links[i] + '"/>';
						}
					}
					img_word += '</div>';
					$("#detail_img").append(img_word);

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
						$("#detail_highlights").append("Highlight information is not available.");
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
					var fav_path = "img/icon_fav_off@2x.png";
					console.log("check " + dest_id.simp);
					for (var j=0; j<user_info.loc_fav.length; j++){
						(j + " " + user_info.loc_fav[j]);
						if(dest_id.simp == user_info.loc_fav[j]){
							fav_path = "img/icon_fav_on@2x.png";
						}
					}

					//include fav icon
					$("#dest_name_title").append("<span id = 'fav_detail_" + dest_id.simp + "'><img src='" + fav_path +"'/></div>");
					//add event - add to fav 
					$("#fav_detail_"+dest_id.simp).on("click", function(){
						var this_id = $(this).attr("id").split("_")[2];

						is_this_fav = false;
						for (var j=0; j<user_info.loc_fav.length; j++){
							if(this_id == user_info.loc_fav[j]){
								is_this_fav = true;
								//should now remove this
								user_info.loc_fav.splice(j, 1);
								$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_off@2x.png");
								$("#fav_"+this_id + " img").attr("src", "img/icon_fav_off@2x.png");
								tg.removeFavorite(removedFav);
								saveFavorite();									
							}
						}
						if(is_this_fav == false){
							//should add this now
							user_info.loc_fav.push(this_id);
							$("#fav_detail_"+this_id + " img").attr("src", "img/icon_fav_on@2x.png");
							$("#fav_"+this_id + " img").attr("src", "img/icon_fav_on@2x.png");
							tg.addFavorite(this_id);
							saveFavorite();							
						}
					});


					//Add UI buttons
					//UI: TOP LEFT SIDE 
					//1. goto Google Navigation
					if (lng != "N/A" && lat != "N/A"){
						$("#content_settings").append('<div id="btn_gotoGoogleMaps"><img src="img/btn_GoogleMaps@2x.png"/></div>');
						$("#btn_gotoGoogleMaps").css({
							"position": "absolute",			
							"bottom": height_UI_margin + "px", "left": width_UI_margin + "px"
						});
						$("#btn_gotoGoogleMaps").on("click", function(){

							doLog('do_navigate');

							console.log("Google Maps clicked");
							var url = "https://www.google.com/maps/dir/" + user_currentloc.lat +","+ user_currentloc.lng +"/" + lng + "," + lat;
							window.open(url, '_blank');
		  
						});		
					}
					else{
						$("#content_settings").append('<div id="btn_gotoGoogleMaps_disabled"><img src="img/btn_GoogleMaps_disabled@2x.png"/></div>');
						$("#btn_gotoGoogleMaps").css({
							"position": "absolute",			
							"bottom": height_UI_margin + "px", "left": width_UI_margin + "px"
						});
					}
					//2. goto Yelp
					if (url_mobile != "N/A"){
						$("#content_settings").append('<div id="btn_gotoYelp"><img src="img/btn_Yelp@2x.png"/></div>');
						$("#btn_gotoYelp").css({
							"position": "absolute",
							"bottom": height_UI_margin + "px", "left": width_UI_margin + 130 + "px"
						});		
						$("#btn_gotoYelp").on("click", function(){
							window.open(url_mobile, '_blank');					
						});							
					}
					else{
						$("#content_settings").append('<div id="btn_gotoGoogleMaps_disabled"><img src="img/btn_Yelp_disabled@2x.png"/></div>');
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
							//Set the size of
							$("#content_map").css({"width": width_screen + "px", "height": height_screen + "px"});
						});					
				}
			}

		},
		error: function(request, error){
			if(mode_debug){console.log(error);}
		}
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
	if (casecase == "signout"){
		$("#your_id").append(user_info.id);
	}

	//Set popup
	$("#popup").css({
		"position": "absolute", 
		"height": height_screen*0.7 + "px", "width": width_screen*0.9 + "px", 
		"top": height_screen*0.15, "left": width_screen*0.05 + "px", background: "white"});
	$("#popup_content").css({"height": height_screen*0.7 - 200 + "px"});

	//Present popup
	$("#popup").animate({opacity:1},time_screen_trans);

	//casewise events
	if (casecase == "TOT"){
		//Initialize the checked property
		$("#TOT_"+map_TOT).prop("checked", "true");
		//On change
		$('input[name=TOT]').on("change", function(){
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
					//console.log('<div id="btn_TOT"><img src="img/btn_TOT_'+map_TOT+'.png"/></div>');
					if(mode_debug){console.log("value changed to" + map_TOT);}
					
					// MJ
					switch(parseInt(map_TOT)) {
						case 0: // vehicle
							tg.setTransportTypeAndGo('auto');
							break;
						case 1: // bycicle
							tg.setTransportTypeAndGo('bicycle');
							break;
						case 2: // foot
							tg.setTransportTypeAndGo('pedestrian');
							break;
					}
					// MJ

					doLog('change_transportation');
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
			//Reset cookie
			if(mode_debug){console.log("before nullify cookies:" + document.cookie);}
			document.cookie = ("user_n=" + "");
			document.cookie  = ("user_p=" + "");
			if(mode_debug){console.log("after setting cookies:" + document.cookie)};

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

function doLog(type) {
	if (map_mode === 1) { // DC
		user_log.mode_frequency.DC[type]++;
		console.log('$ user_log.mode_frequency.DC.' + type);
	}
	else { // WM
		user_log.mode_frequency.WM[type]++;
		console.log('$ user_log.mode_frequency.WM.' + type);
	}
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

function start_log() {

	console.log('start log');
	logTimer = setInterval(save_log, saveLogInterval);
}

function end_log() {
	clearInterval(logTimer);
}

function save_log() {
	const curTime = Math.floor(Date.now() / 1000);
	const elapsed = curTime - time_mode_start;
	time_mode_start = curTime;

	if (map_mode === 0) { // 0: WM
		user_log.mode_duration.WM += elapsed;
	} 
	else if (map_mode === 1) { // 1: DC
		user_log.mode_duration.DC += elapsed;
	}
	else { // 2: List
		user_log.mode_duration.List += elapsed;
	}

	const dateStr = (time_month + 1) + '_' + time_day;
	user_log.date = dateStr;

	let str = 'wm ' + user_log.mode_duration.WM + ' ,dc ' + user_log.mode_duration.DC +
		' ,list ' + user_log.mode_duration.List;
	str += ' z[' + user_log.mode_frequency.WM.zoom + ',' + 
		user_log.mode_frequency.DC.zoom + '] p[' + user_log.mode_frequency.WM.pan + 
		',' + user_log.mode_frequency.DC.pan + '] org[' + 
		user_log.mode_frequency.WM.change_origin + ',' + 
		user_log.mode_frequency.DC.change_origin + '] tot[' + 
		user_log.mode_frequency.WM.change_transportation + ',' + 
		user_log.mode_frequency.DC.change_transportation + '] iso[' +
		user_log.mode_frequency.DC.highlight_isochrone + '] ciso[' + 
		user_log.mode_frequency.DC.highlight_custom + '] de[' +
		user_log.mode_frequency.WM.see_loc_detail + ',' +
		user_log.mode_frequency.DC.see_loc_detail + '] nav[' + 
		user_log.mode_frequency.WM.do_navigate + ',' + 
		user_log.mode_frequency.DC.do_navigate + '] sw[' + 
		user_log.mode_frequency.switching + ']';

	//console.log(user_log);
	console.log(str);

	const durationObj = {WM: user_log.mode_duration.WM, DC: user_log.mode_duration.DC, 
		List: user_log.mode_duration.List};
	const zoomObj = {WM: user_log.mode_frequency.WM.zoom, 
		DC: user_log.mode_frequency.DC.zoom};
	const panObj = {WM: user_log.mode_frequency.WM.pan, 
		DC: user_log.mode_frequency.DC.pan};
	const originObj = {WM: user_log.mode_frequency.WM.change_origin, 
		DC: user_log.mode_frequency.DC.change_origin};
	const totObj = {WM: user_log.mode_frequency.WM.change_transportation, 
		DC: user_log.mode_frequency.DC.change_transportation};
	const isoObj = {DC: user_log.mode_frequency.DC.highlight_isochrone};
	const cIsoObj = {DC: user_log.mode_frequency.DC.highlight_custom};
	const filterObj = {WM: user_log.mode_frequency.WM.filter, 
		DC: user_log.mode_frequency.DC.filter};
	const detailObj = {WM: user_log.mode_frequency.WM.see_loc_detail, 
		DC: user_log.mode_frequency.DC.see_loc_detail};
	const navObj = {WM: user_log.mode_frequency.WM.do_navigate, 
		DC: user_log.mode_frequency.DC.do_navigate};

	const data = {
		user_id: user_info.id, 
		date: dateStr, 
		duration: JSON.stringify(durationObj),
		zoom: JSON.stringify(zoomObj),
		pan: JSON.stringify(panObj),
		origin: JSON.stringify(originObj),
		tot: JSON.stringify(totObj),
		iso: JSON.stringify(isoObj),
		custom_iso: JSON.stringify(cIsoObj),
		filter: JSON.stringify(filterObj),
		detail: JSON.stringify(detailObj),
		nav: JSON.stringify(navObj),
		switching: user_log.mode_frequency.switching,
	}

	reset_log();

	$.ajax({
		url: path_save_log,
		data:data,
		type: 'POST',
		dataType: 'json',
		async: true,
		success: function(data){
			if(data.res) {
			  console.log('log saved.');
			}
		},
		error: function(request, error){
			if(mode_debug){console.log(error);}
		}
	});
}

function reset_log() {
	user_log.mode_duration.DC = 0;
	user_log.mode_duration.WM = 0;
	user_log.mode_duration.List = 0;
	user_log.mode_frequency.DC.zoom = 0;
	user_log.mode_frequency.DC.pan = 0;
	user_log.mode_frequency.DC.change_origin = 0;
	user_log.mode_frequency.DC.change_transportation = 0;
	user_log.mode_frequency.DC.highlight_isochrone = 0;
	user_log.mode_frequency.DC.highlight_custom = 0;
	user_log.mode_frequency.DC.filter = 0;
	user_log.mode_frequency.DC.see_loc_detail = 0;
	user_log.mode_frequency.DC.do_navigate = 0;
	user_log.mode_frequency.WM.zoom = 0;
	user_log.mode_frequency.WM.pan = 0;
	user_log.mode_frequency.WM.change_origin = 0;
	user_log.mode_frequency.WM.change_transportation = 0;
	user_log.mode_frequency.WM.filter = 0;
	user_log.mode_frequency.WM.see_loc_detail = 0;
	user_log.mode_frequency.WM.do_navigate = 0;
	user_log.mode_frequency.switching = 0;
}

//Get cookies
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}