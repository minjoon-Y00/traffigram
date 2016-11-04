/*---------------------------
Global Variables
---------------------------*/

//Old global varaibales
var VT; //store JSON format of Value tree
var json_path = "data/valuetree.json";
var json_path_data = "data/french_uw_s1.csv";
var mode = 1; //condition selector
var factors = []; //store terminal factors' id, text, is_set, weight
var NOF = 0; //Number of factors
var pairs_all = []; //store every pairwise factors (for condition 5 and 6)
var c1_txt = '<div class="c1_row"><div class="c1_row_left"></div><div class="c1_row_right"><div class="c1_row_right_label">Not at all important</div><div class="c1_row_right_label">Low importance</div><div class="c1_row_right_label">Neutral</div><div class="c1_row_right_label">Very important</div><div class="c1_row_right_label">Extremely important</div></div></div><div id="c1_1-1-1"></div><div id="c1_1-1-2"></div><div id="c1_1-2-1"></div><div id="c1_1-2-2"></div><div id="c1_1-2-3"></div>';
var c5_txt = '<div class="c5_row"><div cla="c5_row_left"></div><div class="c5_row_middle"><div class="c5_row_middle_label">Absolute preference</div><div class="c5_row_middle_label">Strong preference</div><div class="c5_row_middle_label">Equally preferred</div><div class="c5_row_middle_label">Strong preference</div><div class="c5_row_middle_label">Absolute preference</div></div><div class="c5_row_right"></div></div><div id="c5_handles"></div>'
var pie_handles = []; //Used in PIE
var pie_areas = []; // Used in PIE
var rotation_lines = []; //Used in PIE
var rotation_texts = [];
var pie_duration = 100;

/*---------------------------
 Initialization
---------------------------*/
$(document).ready(function(){
	// Set map size to 100%

	$("#display_bg").css({
		width: $(window).width(),
		height: $(window).height()
	});

	//Will be removed later FROM HERE
	s.s_id = 1;
	s.s_code = "1234";
	s.s_c1 = "b-2";
	s.s_c2 = "b-1";
	$.ajax({
		url: json_path_data, 
		dataType: "text", 
		async: true,
		success: function (data){
			//set locations and locations_bound before calculating the score
			processLocations(data);
		},
		error: function (request, error){
			console.log(error);
		}
	}).done(function(msg){
		//T.B.D. getCondition() here
		//drawScene();
		drawScene_map();
	});

	//Update later 
	/*$.ajax({
		method: "POST",
		url: server_path + "get_condition.php",
		dataType: "json",
		async: true,
		success: function (data){
			//set locations and locations_bound before calculating the score
			s.s_id = data.s_id;
			s.s_code = data.s_code;
			s.s_c1 = data.s_c1;
			s.s_c2 = data.s_c2;
			//console.log(s);
			$.ajax({
				url: json_path_data, 
				dataType: "text", 
				async: true,
				success: function (data){
					//set locations and locations_bound before calculating the score
					processLocations(data);
				},
				error: function (request, error){
					console.log(error);
				}
			}).done(function(msg){
				//T.B.D. getCondition() here
				drawScene();
			});
		},
		error: function (request, error){
			var html_string = '<div class="heading1"> Sorry </div>' +
			'<div id="bg_scenario"> We are sorry, every slot is occupied by other workers, or we do not recruite more workers at this point. You could try ti visit here another time. </div>';
			$("#display_content").append(html_string);
		}		
	});*/
});

/*---------------------------
 Functions
---------------------------*/
function processLocations(data){
	var loc_all = data.split("\n");
	for(var i=1;i<loc_all.length; i++){
		var line = loc_all[i].split(",");
		var datum = {
			rat_round: parseFloat(line[0]),
			rat_real: parseFloat(line[1]),
			rat_cnt: parseInt(line[2]),
			price: parseInt(line[3]),
			price_$: line[4],
			dist_mi: parseInt(line[5]),
			dist_km: parseFloat(line[6]),
			time_min: parseInt(line[7]),
			time_sec: parseInt(line[8]),
			name: line[9],
			id: line[10],
			score: parseInt(line[11]),
			rank: 0
		};
		locations.push(datum);
	}
	locations.pop(); //One pop
	//Derive bounds for each dimension
	for (var i=0; i<locations.length; i++){
		//time
		if(locations[i].time_sec >= locations_bound[0].max) {locations_bound[0].max = locations[i].time_sec}
		if(locations[i].time_sec <= locations_bound[0].min) {locations_bound[0].min = locations[i].time_sec}
		//distance
		if(locations[i].dist_km >= locations_bound[1].max) {locations_bound[1].max = locations[i].dist_km}
		if(locations[i].dist_km <= locations_bound[1].min) {locations_bound[1].min = locations[i].dist_km}
		//rating
		if(locations[i].rat_real >= locations_bound[2].max) {locations_bound[2].max = locations[i].rat_real}
		if(locations[i].rat_real <= locations_bound[2].min) {locations_bound[2].min = locations[i].rat_real}
		//price
		if(locations[i].price >= locations_bound[3].max) {locations_bound[3].max = locations[i].price}
		if(locations[i].price <= locations_bound[3].min) {locations_bound[3].min = locations[i].price}		
		//#ofrevies
		if(locations[i].rat_cnt >= locations_bound[4].max) {locations_bound[4].max = locations[i].rat_cnt}
		if(locations[i].rat_cnt <= locations_bound[4].min) {locations_bound[4].min = locations[i].rat_cnt}		
	}

	for (var i=0; i<locations.length; i++){
		loc_table_str += '<div style="clear:left"></div>' +
			'<div class="loc_item" id="rank_' + i + '">' +
				//'<div class="loc_item_img" ><img src="img/restaurant.png" width = "50px", height = "50px"/></div>' +
				'<div class="loc_item_text">' +
					'<div class="loc_item_text_name">' + 
					'</div>' +
					'<div class="loc_item_text_rest" style="margin-top:7px;margin-bottom:7px">' +
					'</div>' +
				'</div>' +
				'<div style="clear:left"></div>' +
			'</div>';
	}
	console.log(locations);
}

function drawScene_map(){
	console.log('drawScene_map()');
	var cond_string = s.s_c1;
	$.ajax({
		url: json_path, dataType: "json", async: true,
		success: function (result){
			//Get the factors from JSON tree 
			VT = result;
			//Draw factors by traverse VT
			factors = [];

			function drawFactors(tree){
				if (tree["is_terminal"] == true){
						//Add factor to factors
						var factor = {
							id: tree["id"],
							text: tree["text"],
							is_set: tree["is_set"],
							color: tree["color"],
							weight: tree["weight"],
							weight_norm: 0
						};
						factors.push(factor);
						return;
				}
				//console.log("parent node:" + tree["id"] + ": " + tree["text"]);
				for (var i=0; i<tree["children"].length; i++){
					drawFactors(tree["children"][i]);
				}
			}
			drawFactors(VT);
		},
		error: function (request, error){
			console.log("FAILED: " + i );
		}
	}).done(function(msg){
		//Derive pairs
		pairs_all=[];
		for (var i=0; i<factors.length; i++){
			for (var j=0; j<factors.length; j++){
				if (i<j){
					var pair = {
						id: factors[i]["id"] + "_AND_" + factors[j]["id"],
						weight: 3, //Weight position: 1, 2, 3, 4, 5
						weight_norm: 1,  //Weight_norm: 9, 7, 5, 3, 1 (neutral), 1/3, 1/5, 1/7, 1/9
						is_set: false,
						from: {
							id: factors[i]["id"], name: factors[i]["text"], coords: [0,0], color: ""
						},
						to: {
							id: factors[j]["id"], name: factors[j]["text"], coords: [0,0], color: ""
						}
					};
					pairs_all.push(pair);
				}
			}
		}

		// Do some weight selection Set weight differently between a-1, b-1, c-1
		if (cond_string == "a-1" || cond_string == "a-2"){
			for (var i=0; i<factors.length; i++){
				factors[i]["weight"] = 3;
				factors[i]["weight_norm"] = 0.2;
			}
		}
		else if (cond_string == "b-1"){
			for (var i=0; i<factors.length; i++){
				factors[i]["weight"] = 1;
				factors[i]["weight_norm"] = 0;
			}
		}
		////////////////////////////////////////////////////////////////////////////////////////////////??
		else if (cond_string == "b-2"){
			for (var i=0; i<factors.length; i++){
				factors[i]["weight"] = 0.2;
				factors[i]["weight_norm"] = 0.2;
			}
		}
		////////////////////////////////////////////////////////////////////////////////////////////////??
		else{
			for (var i=0; i<factors.length; i++){
				factors[i]["weight"] = 3;
				factors[i]["weight_norm"] = 0.2;
			}
			for (var i=0; i<pairs_all.length; i++){
				pairs_all[i]["weight"] = 3;
				pairs_all[i]["weight_norm"] = 1;
			}
		}
		displayCondition(cond_string);
	});	
}
function drawScene(){
	console.log("screen step: "+ screen_step);

	//Display introduction at the beginning.
	if (screen_step == 0){
		$("#display_content").empty();
		var html_string = '<div class="heading1"> Introduction </div>' +
			'<div id="bg_scenario">' + script_intro + '</div>' +
			'<div style="text-align:center;margin:20px;">' +
				'<label><input type="checkbox" id="check_read" value="read_scenario"> I understood the purpose of the study. </label></br></br>' +
				'<label><input type="checkbox" id="check_browser" value="read_scenario"> I am using Chrome or Firefox to do this study. </label></br></br>' +
				'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
			'</div>';
		$("#display_content").append(html_string);
		//Uncheck everything
		$("#check_read").prop("checked", false);
		$("#btn_ok_" + screen_step).prop("disabled", true);
		//If a user check box, enable okay button
		$(document.body).change('#check_read', function(){
			if( $('#check_read').prop("checked") == true && $('#check_browser').prop("checked") == true){$("#btn_ok_" + screen_step).prop("disabled", false);}
			else{$("#btn_ok_" + screen_step).prop("disabled", true);}
		});
		//If a user click button, go to next screen
		$(document.body).on("click", "#btn_ok_" + screen_step, function(){
			//!!!DATA!!! :set session time and s_complete
			console.log("SESSION START - MEASURE TIME, SET COMPLETE INCOMPLETE");
			s.t_start = Math.floor(Date.now() / 1000);
			s.s_complete = false;
			screen_step++;
			drawScene();
		});
	}

	//Display the last screen
	else if (screen_step == 11){
		console.log("the last screen displayed");
		//!!! DATA !!! : set session t_end, t_dur, s_complete and present code..
		console.log("SESSION END - MEASURE TIME, DUR, SET COMPLETE");
		s.t_end = Math.floor(Date.now() / 1000);
		s.t_dur = s.t_end - s.t_start;
		s.s_complete = true;
		//!!! T.B.D. update database
		var request = $.ajax({
			method: "POST",
			url: server_path + "save_data.php",
			data: {
				s_id: s.s_id,
				s_start: s.t_start,
				s_end: s.t_end,
				c1_q1: JSON.stringify(c1_q1).replace(/"/g, '\\"'),
				c1_q2: JSON.stringify(c1_q2).replace(/"/g, '\\"'),
				c2_q1: JSON.stringify(c2_q1).replace(/"/g, '\\"'),
				c2_q2: JSON.stringify(c2_q2).replace(/"/g, '\\"'),
				c1_answer: JSON.stringify(c1_answer).replace(/"/g, '\\"'),
				c2_answer: JSON.stringify(c2_answer).replace(/"/g, '\\"')
			},
			dataType: "text"
		});
		request.done(function(response){
			console.log(response);

			var message = "Thanks for finishing every task. ";
			if (response == "good"){
				message += "You finished every task wihtin the time. Your code is validated. Please finish the final survey to have your code. The survey will take less than 3 minutes.";
			}
			else{
				message += "It took more than 20 minutes to finish every task. But feel free to finish the study by filling out the survey. We will present you a code, and will see your answer to confirm the HIT.";
			}
			$("#display_content").empty();
			var html_string = '<div class="heading1"> Thank you! </div>' +
				'<div id="bg_scenario">' + message + '</div>' +
				'<div style="text-align:center;margin:20px;">' +
					'<label><input type="checkbox" id="check_read" value="read_scenario"> Let me start the survey! </label></br></br>' +
					'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
				'</div>';
			$("#display_content").append(html_string);
			//Uncheck everything
			$("#check_read").prop("checked", false);
			$("#btn_ok_" + screen_step).prop("disabled", true);
			//If a user check box, enable okay button
			$(document.body).change('#check_read', function(){
				if( $('#check_read').prop("checked") == true){$("#btn_ok_" + screen_step).prop("disabled", false);}
				else{$("#btn_ok_" + screen_step).prop("disabled", true);}
			});
			//If a user click button, go to next screen
			$(document.body).on("click", "#btn_ok_" + screen_step , function(){
				$("#display_content").empty();
				var c1 = "";
				var c2 = "";
				if (s.s_c1 == "a-1"){c1 = "1";} 
					else if(s.s_c1 == "a-2"){c1 = "2";}
					else if(s.s_c1 == "b-1"){c1 = "3";} 
					else if(s.s_c1 == "b-2"){c1 = "4";} 
					else if(s.s_c1 == "c-1"){c1 = "5";} 
					else{c1 = "6";}
				if (s.s_c2 == "a-1"){c2 = "1";} 
					else if(s.s_c2 == "a-2"){c2 = "2";}
					else if(s.s_c2 == "b-1"){c2 = "3";} 
					else if(s.s_c2 == "b-2"){c2 = "4";} 
					else if(s.s_c2 == "c-1"){c2 = "5";} 
					else{c2 = "6";}
				var c1_id = c1_q2.locations[c1_q2.locations.length-1]["id"];
				var c2_id = c2_q2.locations[c2_q2.locations.length-1]["id"];
				var c1_loc;
				var c2_loc;
				var c1_price;
				var c2_price;
				for (var i=0; i<locations.length; i++){
					if (c1_id == locations[i]["id"]){
						c1_loc = locations[i];
						if (locations[i].price == 10){c1_price =  "inexpensive";}
						else if (locations[i].price == 20){c1_price = "moderate";}
						else if (locations[i].price == 45){c1_price =  "pricy";}
						else {c1_price =  "ultra high-end";}
					}
					if (c2_id == locations[i]["id"]){
						c2_loc = locations[i];
						if (locations[i].price == 10){c2_price =  "inexpensive";}
						else if (locations[i].price == 20){c2_price = "moderate";}
						else if (locations[i].price == 45){c2_price =  "pricy";}
						else {c2_price =  "ultra high-end";}
					}
				}
				var url = "http://www.surveygizmo.com/s3/2989066/Test?id="+s.s_id+"&c="+c1+c2+"&code="+s.s_code;
				url += "&c1_name="+c1_loc.name+"&c1_time="+c1_loc.time_min+"&c1_dist="+c1_loc.dist_mi+"&c1_rating="+c1_loc.rat_real+"&c1_price_$="+c1_loc.price_$+"&c1_price="+c1_price+"&c1_num_reviews="+c1_loc.rat_cnt;
				url += "&c2_name="+c2_loc.name+"&c2_time="+c2_loc.time_min+"&c2_dist="+c2_loc.dist_mi+"&c2_rating="+c2_loc.rat_real+"&c2_price_$="+c2_loc.price_$+"&c2_price="+c2_price+"&c2_num_reviews="+c2_loc.rat_cnt;

				var html_string = '<div class="heading1"> Thank you! </div>' +
					'<div id="bg_scenario"> the browser will be automatically redirected to a survey. In case you are not redirected, please click <a href="'+url+'">here</a>.</div>' +
					'</div>';
				$("#display_content").append(html_string);

				console.log(url);
				console.log(s.s_id);
				//REDIRECT TO URL

				window.location.href = url;
				
			});			
		});	
		request.fail(function(){
			console.log("Update failed!");
			return user;
		});
	}
	//Start the session
	else{
		// Step 1. Presenting a scenaro
		// Step 2. Presenting a user interface (scenario + UI)
		// Step 3. Presenting a description for next step 
		// Step 4. Presenting a user interface with locations (scenario + UI + Location)
		// Step 5. Check user's choice at the end
		var step = screen_step%5;
		// task 0: first task
		// task 1: second task
		var task = 0; if (screen_step>5){task = 1;}

		if (step == 1){ //Step 1. Presenting a scenaro
			// console.log("step 1");			
			//Start measuring:
			//A user session time
			$("#display_content").empty();

			var scenario_order = "First";
			if (task == 1){ scenario_order = "Second";}
			var TOU = 0;
			if (task == 0){if (s.s_c1 == "c-1"){TOU = 1;}}
			if (task == 1){if (s.s_c2 == "c-1"){TOU = 1;}}
			var html_string = '<div class="heading1">'+ scenario_order + ' Scenario </div>' +
				'<div id="bg_scenario">' + script_scenarios_1[task] + script_scenarios_1_inst[TOU] + '</div>' +
				'<div style="text-align:center;margin:20px;">' +
					'<label><input type="checkbox" id="check_read" value="read_scenario"> I read scenario carefully and understood the occasion. </label></br></br>' +
					'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
				'</div>';
			$("#display_content").append(html_string);
			//Uncheck everything
			$("#check_read").prop("checked", false);
			$("#btn_ok_" + screen_step).prop("disabled", true);
			//If a user check box, enable okay button
			$(document.body).change('#check_read', function(){
				if( $('#check_read').prop("checked") == true){$("#btn_ok_" + screen_step).prop("disabled", false);}
				else{$("#btn_ok_" + screen_step).prop("disabled", true);}
			});
			//If a user click button, go to next screen
			$(document.body).on("click", "#btn_ok_" + screen_step, function(){
				//!!! DATA !!! : set time_start			
				if (task == 0){
					console.log("C1_Q1 START - MEASURE START TIME");
					c1_q1.t_start = Math.floor(Date.now() / 1000);
				}
				else {
					console.log("C2_Q1 START - MEASURE START TIME");
					c2_q1.t_start = Math.floor(Date.now() / 1000);
				}
				screen_step++;
				drawScene();
			});
		}
		else if (step == 2){ //Step 2. Presenting a user interface (scenario + UI)
			$("#display_content").empty();
			var scenario_order = "First";
			if (task == 1){ scenario_order = "Second";}
			var TOU = 0;
			if (task == 0){if (s.s_c1 == "c-1"){TOU = 1;}}
			if (task == 1){if (s.s_c2 == "c-1"){TOU = 1;}}
			var html_string = '<div class="heading1">'+ scenario_order + ' Scenario </div>' +
				'<div id="bg_scenario">' + script_scenarios_1[task] + script_scenarios_1_inst[TOU] + '</div>' +
				'<div id="display_content_factor_selector">' +
					'<div class="heading1"> Set the importance of each dimension </div>' +
					'<div id="factor_weight_controller" style="padding-bottom:20px;"></div>' +
					'<div>'+
						'<label><input type="checkbox" id="check_read" value="read_scenario">  I arranged dimensions correctly, and ready to proceed.</label>&nbsp;&nbsp;' +
						'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
					'</div>' +
				'</div>';
			$("#display_content").append(html_string);

			//Uncheck everything
			$("#check_read").prop("checked", false);
			$("#btn_ok_" + screen_step).prop("disabled", true);
			//If a user check box, enable okay button
			$(document.body).change('#check_read', function(){
				if( $('#check_read').prop("checked") == true){$("#btn_ok_" + screen_step).prop("disabled", false);}
				else{$("#btn_ok_" + screen_step).prop("disabled", true);}
			});
			//If a user click button, go to next screen
			$(document.body).on("click", "#btn_ok_" + screen_step , function(){
				//!!!Data!!!: set time_end, time_dur, final weights
				if (task == 0){
					console.log("C1_Q1 END - MEASURE TIME END DUR, UPDATE WEIGHT");
					c1_q1.t_end = Math.floor(Date.now() / 1000);
					c1_q1.t_dur = c1_q1.t_end - c1_q1.t_start;
					for (var i=0; i<factors.length; i++){
						c1_q1.weights[i] = factors[i]["weight_norm"];
					}
				}
				else {
					console.log("C2_Q1 END - MEASURE TIME END DUR, UPDATE WEIGHT");
					c2_q1.t_end = Math.floor(Date.now() / 1000);
					c2_q1.t_dur = c2_q1.t_end - c2_q1.t_start;
					for (var i=0; i<factors.length; i++){
						c2_q1.weights[i] = factors[i]["weight_norm"];
					}
				}

				screen_step++;
				drawScene();
			});			
			//Itialize factors[] and pairs[]
			$.ajax({
				url: json_path, dataType: "json", async: true,
				success: function (result){
					//Get the factors from JSON tree 
					VT = result;
					//Draw factors by traverse VT
					factors = [];

					function drawFactors(tree){
						if (tree["is_terminal"] == true){
								//Add factor to factors
								var factor = {
									id: tree["id"],
									text: tree["text"],
									is_set: tree["is_set"],
									color: tree["color"],
									weight: tree["weight"],
									weight_norm: 0
								};
								factors.push(factor);
								return;
						}
						//console.log("parent node:" + tree["id"] + ": " + tree["text"]);
						for (var i=0; i<tree["children"].length; i++){
							drawFactors(tree["children"][i]);
						}
					}
					drawFactors(VT);
				},
				error: function (request, error){
					console.log("FAILED: " + i );
				}
			}).done(function(msg){
				//Derive pairs
				pairs_all=[];
				for (var i=0; i<factors.length; i++){
					for (var j=0; j<factors.length; j++){
						if (i<j){
							var pair = {
								id: factors[i]["id"] + "_AND_" + factors[j]["id"],
								weight: 3, //Weight position: 1, 2, 3, 4, 5
								weight_norm: 1,  //Weight_norm: 9, 7, 5, 3, 1 (neutral), 1/3, 1/5, 1/7, 1/9
								is_set: false,
								from: {
									id: factors[i]["id"], name: factors[i]["text"], coords: [0,0], color: ""
								},
								to: {
									id: factors[j]["id"], name: factors[j]["text"], coords: [0,0], color: ""
								}
							};
							pairs_all.push(pair);
						}
					}
				}
				//Draw factor interface
				var cond_string = "";
				if (task == 0){cond_string = s.s_c1;} //"a-1", "b-1", or "c-1".
				else {cond_string = s.s_c2;}
				// Do some weight selection Set weight differently between a-1, b-1, c-1
				if (cond_string == "a-1" || cond_string == "a-2"){
					for (var i=0; i<factors.length; i++){
						factors[i]["weight"] = 3;
						factors[i]["weight_norm"] = 0.2;
					}
				}
				else if (cond_string == "b-1"){
					for (var i=0; i<factors.length; i++){
						factors[i]["weight"] = 1;
						factors[i]["weight_norm"] = 0;
					}
				}
				////////////////////////////////////////////////////////////////////////////////////////////////??
				else if (cond_string == "b-2"){
					for (var i=0; i<factors.length; i++){
						factors[i]["weight"] = 0.2;
						factors[i]["weight_norm"] = 0.2;
					}
				}
				////////////////////////////////////////////////////////////////////////////////////////////////??
				else{
					for (var i=0; i<factors.length; i++){
						factors[i]["weight"] = 3;
						factors[i]["weight_norm"] = 0.2;
					}
					for (var i=0; i<pairs_all.length; i++){
						pairs_all[i]["weight"] = 3;
						pairs_all[i]["weight_norm"] = 1;
					}
				}
				displayCondition(cond_string);
				//Initially set score.. actually but shouldn't do like this
				UpdateLocation();
			});
		}

		else if(step == 3){// Step 3. Presenting a description for next step 
			// console.log("step 3");
			//Stop measuring:
			//Q1 time
			//Q1 number of step 
			//Q1 magnitude
			//Q1 detailed action
			$("#display_content").empty();
			var scenario_order = "First";
			if (task == 1){ scenario_order = "Second";}
			var html_string = '<div class="heading1">'+ scenario_order + ' Scenario </div>' +
				'<div id="bg_scenario">' 
					+ script_notice[task] +
				'</div>' +
				'<div style="text-align:center;margin:20px;">' +
					'<label><input type="checkbox" id="check_read" value="read_scenario">  I will adjust the weights, and carefully choose my destination. </label></br></br>' +
					'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
				'</div>';
			$("#display_content").append(html_string);
			//Uncheck everything
			$("#check_read").prop("checked", false);
			$("#btn_ok_" + screen_step).prop("disabled", true);
			//If a user check box, enable okay button
			$(document.body).change('#check_read', function(){
				if( $('#check_read').prop("checked") == true){$("#btn_ok_" + screen_step).prop("disabled", false);}
				else{$("#btn_ok_" + screen_step).prop("disabled", true);}
			});
			//If a user click button, go to next screen
			$(document.body).on("click", "#btn_ok_" + screen_step , function(){
				//!!! DATA !!! q2 t_start set
				if (task == 0){
					console.log("C1_Q2 START - MEASURE TIME START");
					c1_q2.t_start =  Math.floor(Date.now() / 1000);
				}
				else {
					console.log("C2_Q2 START - MEASURE TIME START");
					c2_q2.t_start =  Math.floor(Date.now() / 1000);
				}
				screen_step++;
				drawScene();
			});
		}
		
		else if (step == 4){ // Step 4. Presenting a user interface with locations (scenario + UI + Location)
			// console.log("step 4");			
			$("#display_content").empty();
			isLocSelected = false;
			var scenario_order = "First";
			if (task == 1){ scenario_order = "Second";}			
			
			var checkbox_padding_control = ""; // Top size
			if (task == 0){
				if (s.s_c1 == "a-1"){checkbox_padding_control = "style='padding-top:150px;'";}
				else if (s.s_c1 == "b-1"){checkbox_padding_control = "style='padding-top:55px;'";}
				else if (s.s_c1 == "b-2"){checkbox_padding_control = "style='padding-top:20px;'";}
				else {checkbox_padding_control = "";}
			}
			if (task == 1){
				if (s.s_c2 == "a-1"){checkbox_padding_control = "style='padding-top:150px;'";}
				else if (s.s_c2 == "b-1"){checkbox_padding_control = "style='padding-top:55px;'";}
				else if (s.s_c1 == "b-2"){checkbox_padding_control = "style='padding-top:20px;'";}
				else {checkbox_padding_control = "";}
			}
			var html_string = '<div class="heading1">'+ scenario_order + ' Scenario </div>' +
				'<div id="bg_scenario">' + script_scenarios[task] + '</div>' +
				'<div id="display_content_factor_selector">' +
					'<div class="heading1"> How important are they? </div>' +
					'<div id="factor_weight_controller" style="padding-bottom:20px;">factor weight controller</div>' +
					'<div class="checkbox_and_okay" ' + checkbox_padding_control + '>' +
						'<label><input type="checkbox" id="check_read" value="read_scenario">  I chose my destination correctly, and I am satisfied with my decision. </label>&nbsp;&nbsp;' +
						'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
					'</div>' +
				'</div>' +
				'<div id="display_content_locations">' +
					'<div class="heading1"> Restaurants </div>' +
					'<div id="loc_table"></div>' +
				'</div>';
			$("#display_content").append(html_string);

			$("#check_read").prop("checked", false);
			$("#btn_ok_" + screen_step).prop("disabled", true);
			//If a user check box, enable okay button
			$(document.body).change('#check_read', function(){
				if( $('#check_read').prop("checked") == true && isLocSelected == true){$("#btn_ok_" + screen_step).prop("disabled", false);}
				else{$("#btn_ok_" + screen_step).prop("disabled", true);}
			});
			//If a user click button, go to next screen
			$(document.body).on("click", "#btn_ok_" + screen_step , function(){
				var html_string = 
				'<div id="blacksheet"> </div>' +
				'<div id="popup"> <h3> Continue? </h3> Please <span class="stress">consider your decision carefully</span>, as we will ask percise questions regarding the dimensions you set and the destination you chose afterwards. </br></br>' +
					'<button id="btn_wait" style="font-size:20px"> Wait, let me think a bit more. </button>&nbsp;&nbsp;' +
					'<button id="btn_ok_' + screen_step + '_2" style="font-size:20px"> Okay </button>' + //btn_ok_step2, not btn_ok_step
				'</div>';
				$("body").append(html_string);

				$(document.body).on("click", "#btn_wait", function(){
					$('#blacksheet').remove();
					$('#popup').remove();
				});

				//Ensure to call drawScene only once
				doOnce = false;
				$(document.body).on("click", "#btn_ok_" + screen_step + "_2", function(){
					$('#blacksheet').remove();
					$('#popup').remove();
					if (doOnce == false){
						//!!! DATA !!!: set time_end, time_dur, final weights
						if (task == 0){
							console.log("C1_Q2 END - MEASURE TIME END DUR UPDATE WEIGHTS");
							c1_q2.t_end = Math.floor(Date.now() / 1000);
							c1_q2.t_dur = c1_q2.t_end - c1_q2.t_start;
							for (var i=0; i<factors.length; i++){
								c1_q2.weights[i] = factors[i]["weight_norm"];
							}
						}
						else {
							console.log("C2_Q2 END - MEASURE TIME END DUR UPDATE WEIGHTS");
							c2_q2.t_end = Math.floor(Date.now() / 1000);
							c2_q2.t_dur = c2_q2.t_end - c2_q2.t_start;
							for (var i=0; i<factors.length; i++){
								c2_q2.weights[i] = factors[i]["weight_norm"];
							}
						}
						screen_step++;
						drawScene();
						doOnce = true;
					}
				});

			});
			//Update #loc_table
			UpdateLocation();

			//Display interface
			var cond_string = "";
			if (task == 0){cond_string = s.s_c1;} //"a-1", "b-1", or "c-1".
			else {cond_string = s.s_c2;}

			if (cond_string == "a-1" || cond_string == "a-2" ){
				for (var i=0; i<factors.length; i++){
					factors[i]["weight"] = 3;
					factors[i]["weight_norm"] = 0.2;
				}
			}
			////////////////////////////////////////////////////////////////////////////////////////////////??
			else if (cond_string == "b-1"){
				for (var i=0; i<factors.length; i++){
					factors[i]["weight"] = 1;
					factors[i]["weight_norm"] = 0;
				}
			}
			else if (cond_string == "b-2"){
				for (var i=0; i<factors.length; i++){
					factors[i]["weight"] = 0.2;
					factors[i]["weight_norm"] = 0.2;
				}
			}			
			////////////////////////////////////////////////////////////////////////////////////////////////??
			else{
				for (var i=0; i<factors.length; i++){
					factors[i]["weight"] = 3;
					factors[i]["weight_norm"] = 0.2;
				}
				for (var i=0; i<pairs_all.length; i++){
					pairs_all[i]["weight"] = 3;
					pairs_all[i]["weight_norm"] = 1;
				}				
			}

			displayCondition(cond_string);
		}
		else if (step == 0){
			$("#display_content").empty();

			var Q1 = ["Restaurant 109", "", "Restaurant 205", "I don't remember"]; //RIGHT ANSWER Q[1]
			var Q2 = []; //RIGHT ANSWER Q[2]
			var Q3 = ["Travel time", "Travel distance", "Ratings", "Price", "# of reviews", "More than one", "I don't know"];
			if (screen_step == 5){
				Q1[1] = c1_q2.locations[c1_q2.locations.length-1]["name"];
				if (Q1[0] == Q1[1]) {Q1[0]= "Restaurant 108";}
				if (Q1[2] == Q1[1]) {Q1[2]= "Restaurant 207";}
				Q2 = ["Dinner with a friend from work", "Important business meeting on a trip", "Celebrating anniversary with your partner", "I don't remember"];
			}
			else{
				Q1[1] = c2_q2.locations[c2_q2.locations.length-1]["name"];
				if (Q1[0] == Q1[1]) {Q1[0]= "Restaurant 108";}
				if (Q1[2] == Q1[1]) {Q1[2]= "Restaurant 207";}				
				Q2 = ["Dinner with a friend from work", "Celebrating anniversary with your partner", "Important business meeting on a trip", "I don't remember"];
			}

			if (task ==0){Answer_right = "Five-years anniversarywith your partner";}
			else {Answer_right = "Important business meeting on a trip";}

			var html_string = 
				'<div class="heading1"> What was the name of the restaurant you ended up selecting? </div>' +
				'<div style = "padding: 10px;font-size: 18px;background-color:#fff; padding-bottom:20px; margin-bottom:20px;">' +
					'<label><input type="radio" name="q1" value="0" checked/>' + Q1[0] + '</label></br>' +
					'<label><input type="radio" name="q1" value="1"/>' + Q1[1] + '</label></br>' +
					'<label><input type="radio" name="q1" value="2"/>' + Q1[2] + '</label></br>' +
					'<label><input type="radio" name="q1" value="3"/>' + Q1[3] + '</label>' +
				'</div>' +
				'<div class="heading1"> What was the scenario you were asked to select the restaurant for? </div>' +
				'<div style = "padding: 10px;font-size: 18px;background-color:#fff; padding-bottom:20px; margin-bottom:20px;">' +
					'<label><input type="radio" name="q2" value="0" checked/>' + Q2[0]+ '</label></br>' +
					'<label><input type="radio" name="q2" value="1"/>' + Q2[1]+ '</label></br>' +
					'<label><input type="radio" name="q2" value="2"/>' + Q2[2]+ '</label></br>' +
					'<label><input type="radio" name="q2" value="3"/>' + Q2[3]+ '</label>' +
				'</div>' +
				'<div class="heading1"> Which factor do you believe you considered the most important? </div>' +
				'<div style = "padding: 10px;font-size: 18px;background-color:#fff; padding-bottom:20px; margin-bottom:20px;">' +
					'<label><input type="radio" name="q3" value="0" checked/>' + Q3[0]+ '</label></br>' +
					'<label><input type="radio" name="q3" value="1"/>' + Q3[1]+ '</label></br>' +
					'<label><input type="radio" name="q3" value="2"/>' + Q3[2]+ '</label></br>' +
					'<label><input type="radio" name="q3" value="3"/>' + Q3[3]+ '</label></br>' +
					'<label><input type="radio" name="q3" value="4"/>' + Q3[4]+ '</label></br>' +
					'<label><input type="radio" name="q3" value="MORETHANONE"/>' + Q3[5]+ '</label></br>' +
					'<label><input type="radio" name="q3" value="DONNO"/>' + Q3[6]+ '</label>' +					
				'</div>' +				
				'<div class="checkbox_and_okay">' +
					'<label><input type="checkbox" id="check_read" value="read_scenario">  I answered every question correctly, and I am ready to proceed. </label>&nbsp;&nbsp;' +
					'<button id="btn_ok_' + screen_step + '" style="font-size:20px"> Okay </button>' +
				'</div>';
			$("#display_content").append(html_string);

			$("input[type=radio][name=q1]").prop("checked", false);
			$("input[type=radio][name=q2]").prop("checked", false);
			$("input[type=radio][name=q3]").prop("checked", false);

			$("#check_read").prop("checked", false);
			$("#btn_ok_" + screen_step).prop("disabled", true);
			//If a user check box, enable okay button
			$(document.body).change('#check_read', function(){
				if( $('#check_read').prop("checked") == true && $("input[type=radio][name=q1]").is(":checked") && $("input[type=radio][name=q2]").is(":checked") && $("input[type=radio][name=q3]").is(":checked")){
					$("#btn_ok_" + screen_step).prop("disabled", false);
				}
				else{$("#btn_ok_" + screen_step).prop("disabled", true);}
			});
			//If a user click button, go to next screen
			$(document.body).on("click", "#btn_ok_" + screen_step, function(){
				//!!! DATA !!! c1_answer / c2_answer
				if (task == 0){
					console.log("C1 COMPLETE - MEASURE ANSWERS");
					var q1_ans = $("input[name=q1]:checked").val();
					var q2_ans = $("input[name=q2]:checked").val();
					var q3_ans = $("input[name=q3]:checked").val();
					if (q1_ans == 1){c1_answer.q1 = true;}
					if (q2_ans == 2){c1_answer.q2 = true;}
					c1_answer.q3 = q3_ans;
					c1_answer.q3_weight = c1_q2.weights;
				}
				else {
					console.log("C2 COMPLETE - MEASURE ANSWERS");
					var q1_ans = $("input[name=q1]:checked").val();
					var q2_ans = $("input[name=q2]:checked").val();
					var q3_ans = $("input[name=q3]:checked").val();
					if (q1_ans == 1){c2_answer.q1 = true;}
					if (q2_ans == 2){c2_answer.q2 = true;}
					c2_answer.q3 = q3_ans;
					c2_answer.q3_weight = c2_q2.weights;
				}
				screen_step++;
				drawScene();
			});			
		}
	}
}

function displayCondition(Condition){
	//Add click event handler
	$("#factor_weight_controller").empty();
	//!!!!TO DO: draw newly updated factors!!!!
	if (Condition == "a-1"){
		$("#controller_message").empty();
		$("#controller_message").append("How important are they?");
		$("#factor_weight_controller").append(c1_txt);
		for (var i=0; i<factors.length; i++){
			if (factors[i]["is_set"]==true){
				drawSlider(factors[i]["id"], factors[i]["weight"]);
			}
		}
	}
	else if (Condition == "a-2"){drawRadar();}
	else if (Condition == "b-1"){drawSliders_c3();}
	else if (Condition == "b-2"){
		NOF = getNOF();
		//Initailize SVG for pie chart on condition 4.
		pie_handles = [];
		pie_areas = [];
		if (NOF >=2){
			var svg_width = 400;
			var svg_height = 370;
			var center = [svg_width/2, svg_height/2];
			var svg = d3.select("#factor_weight_controller")
				.append("svg").attr("id", "pie")
				.attr("width", svg_width)
				.attr("height", svg_height);

			var cur = 0;
			var loop = setInterval(function(){
				if(cur<NOF){
					id = factors[cur]["id"]
					//Pie handle initialization
					drawPie(id, cur+1);
					console.log(id);
					cur++;
				}
				else{
					clearInterval(loop);
				}
			}, pie_duration)

		}
		drawPie(this.value);
	}	
	else if (Condition == "c-1"){drawSliders_c5();}
	else{drawRegularPolygon();}
}

function UpdateLocation(){
	if($("#rank_0").length == 0){ //If the loc_table is empty
		var html_string = ""
		//HTML insert
		$("#loc_table").append(loc_table_str);

		$("#loc_table").scroll(function() {
			//!!! DATA !!! scroll how many times for how long
			if (canMeasureScrollDur == true){
				//Measure duration (increase scroll_dur every 0.1 sec)
				if (screen_step == 4){c1_q2.scroll_dur ++;}
				else {c2_q2.scroll_dur++;}
				canMeasureScrollDur = false;
				setTimeout(function(){canMeasureScrollDur = true},100)
			}
			//Measure how many times a user scrolled. (1 SEC duration between scrolls)
			clearTimeout(timer_scroll);
			if (canMeasureScrollNum == true){
				//console.log("New scroll!");
				var act = {do: "scroll", t: Math.floor(Date.now() / 1000)};
				if (screen_step == 4){
					c1_q2.scroll_num ++;
					c1_q2.actions.push(act);
				}
				else {
					c2_q2.scroll_num++;
					c2_q2.actions.push(act);
				}
				canMeasureScrollNum = false;
				//Log drac action
			}
			timer_scroll = setTimeout(function(){canMeasureScrollNum = true}, 1000);
		});

		//Event handler
		for (var i=0; i<locations.length; i++){
			$("#rank_"+i).click(function() {
				//Enable Okay
				isLocSelected = true;
				if ($('#check_read').prop("checked") == true){$("#btn_ok_" + screen_step).prop("disabled", false);}

				//remove every colors
				for (var j=0; j<locations.length; j++){
					$("#rank_"+j).css('background-color', "");
					$("#img_checked").remove();
				}
				var id_clicked = $(this).attr("id");
				$("#"+id_clicked).css('background-color', "#F4BDC0");
				$("#" + id_clicked + " .loc_item_text_name").append('<img id="img_checked" style="float:right;" src="img/checked.png"/>');
				//!!! DATA !!! //ADD CLICK...
				var rank = $(this).attr("id");
				rank = rank.split('_')[1];
				var t_temp = Math.floor(Date.now() / 1000);
				var loc = {
					t:  t_temp,
					id: locations[rank].id,
					name: locations[rank].name,
					rank: locations[rank].rank,
					score_best: locations[0].score,
					score_this: locations[rank].score,
					score_worst: locations[locations.length-1].score
				}
				var act = {do: "clk", t: t_temp}
				canMeasureScrollNum = true; //Allow to measure scroll again;
				if (screen_step == 4){ //first task
					c1_q2.locations.push(loc);
					c1_q2.actions.push(act);
				}
				else { //second step
					c2_q2.locations.push(loc);
					c2_q2.actions.push(act);
				}
			})
			.mouseenter(function() {
				$(this).css('cursor', 'pointer');
			})
			.mouseleave(function() {
				$(this).css('cursor', 'default');
	    	});
	    	$("#rank_"+i).mouseover(function() {
	    		$(this).css('background-color', "#F4BDC0");
	    	});
	    	$("#rank_"+i).mouseout(function() {
	    		$(this).css('background-color', "");
	    	});
		}		
	}
	else{ //If there is already something
		isLocSelected = false;
		for (var j=0; j<locations.length; j++){
			$("#rank_"+j).css('background-color', "");
			$("#img_checked").remove();
		}		
	}

	//Calculate the score for every locations
	for (var i=0; i<locations.length; i++){
		locations[i]["score"] = 0;
		for (j=0; j<factors.length; j++){
			if (j==0){
				locations[i]["score"] += (locations_bound[j].max-locations[i].time_sec)/(locations_bound[j].max - locations_bound[j].min)*factors[j]["weight_norm"];
			}
			else if (j==1){
				locations[i]["score"] += (locations_bound[j].max-locations[i].dist_km)/(locations_bound[j].max - locations_bound[j].min)*factors[j]["weight_norm"];
			}
			else if (j==2){
				locations[i]["score"] += (locations[i].rat_real-locations_bound[j].min)/(locations_bound[j].max - locations_bound[j].min)*factors[j]["weight_norm"];	
			}
			else if (j==3){
				locations[i]["score"] += (locations_bound[j].max-locations[i].price)/(locations_bound[j].max - locations_bound[j].min)*factors[j]["weight_norm"];
			}
			else {
				locations[i]["score"] += (locations[i].rat_cnt-locations_bound[j].min)/(locations_bound[j].max - locations_bound[j].min)*factors[j]["weight_norm"];		
			}
		}
	}
	//sort
	b_sort(locations);
	//Set rank
	for (var i=0; i<locations.length; i++){
		locations[i].rank = i;
	}	
	//Present them in order
	for (var i=0; i<locations.length; i++){
		//Restaurant name
		str = '<span class="name"><strong>'+ locations[i].name +'</strong></span>&nbsp;&nbsp;&nbsp;' +
			'<span style="font-size: 14px">' +
				'<strong> <span class="time">'+ locations[i].time_min +'</sapn> </strong> minute(s),' +
				'<strong> <span class="dist">'+ locations[i].dist_mi +'</sapn> </strong> miles away from you' +
			'</span>';
		$("#rank_"+i+" .loc_item_text_name").empty();
		$("#rank_"+i+" .loc_item_text_name").append(str);

		//Set star image
		var rating = locations[i].rat_round;
		var one = rating-rating%1;
		var half = rating%1;
		var j=0;
		var str_star = "";
		for (j=0; j<one; j++){
			str_star += '<span><img src="img/star1.png" style="margin:-1px;"></span>';
		}
		if(half == 0.5){
			str_star += '<span><img src="img/starhalf.png" style="margin:-1px;"></span>';
			j++;
		}
		if (j!=4){
			for (var k=j; k<5; k++){
				str_star += '<span><img src="img/star0.png" style="margin:-1px;"></span>';		
			}
		}
		var str_price = "";
		if (locations[i].price == 10){str_price =  "inexpensive";}
		else if (locations[i].price == 20){str_price = "moderate";}
		else if (locations[i].price == 45){str_price =  "pricy";}
		else {str_price =  "ultra high-end";}
		str = '<span style="font-size: 14px; margin-top:0px;">' +
			str_star +
			'&nbsp;' + 
			'(<strong><span class="rat">'+ locations[i].rat_real +'</sapn></strong>)' +
			'&nbsp;' + 
			'<strong><span class="price_dollar">'+ locations[i].price_$ +'</sapn> </strong>' +
			'(<span class="price">'+ str_price +'</span>)'+
			'&nbsp;' + 
			'<strong><span class="rat_cnt">'+ locations[i].rat_cnt +'</sapn> </strong> review(s)' + 
		'</span> ';
		$("#rank_"+i+" .loc_item_text_rest").empty();
		$("#rank_"+i+" .loc_item_text_rest").append(str);
	}

	$("#loc_table").css("opacity", 1)
	console.log("done");
	console.log(locations);
}

//Used in condition 1
function drawSlider(id, weight){
	//If this dimension has never been set:
	if (weight == 0){
		weight = 3;
		for (var i=0; i<factors.length;i++){
			if(factors[i]["id"] == id){
				factors[i]["weight"] = 3;
			}
		}
	}
	//Initialize
	$("#c1_"+id).empty();
	var factor_name = ""
	//Check if we need to draw this
	for (var i=0; i<factors.length; i++){
		if(factors[i]["id"] == id){
			factor_name = factors[i]["text"];
		}
	}
	//Draw svg & background	
	var svg_width = 430;
	var svg_height = 40;	
	var box_x_left = 105;
	var box_x = 60;
	var box_y = 40;
	var handle_offset = 11;

	var svg = d3.select("#c1_"+id).append("svg")
		.attr("id", "svg_"+id).attr("width", svg_width).attr("height", svg_height);
	d3.select("#svg_"+id).append("rect")
		.attr("width", box_x*5).attr("height", 40)
		.attr("x", box_x_left).attr("y",0)
		.attr("fill", "rgb(240,240,240)");

	$("#c1_"+id).attr("style", "height:" + svg_height + "px");

	d3.select("#svg_"+id).append("g") //g #txt_proportion : stores every background information
		.attr("id", "txt_factor_" + id);
	d3.select("#svg_"+id).append("g") //g #sliders : draw slders
		.attr("id", "slider_" + id).attr("transform", "translate(" + box_x_left +",0)");		

	d3.select("#txt_factor_" + id).append("text")
		.text(factor_name)
		.attr("x", box_x_left/2).attr("y", box_y/2)
		.attr("font-family", "PT Sans Narrow").attr("font-size", "18px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");

	for (var i=0; i<5; i++){
		d3.select("#slider_" + id).append("line") //Draw 1.0 lines
			.attr("x1", Math.round(box_x/2) + box_x*i).attr("y1", box_y/2 - 5)
			.attr("x2", Math.round(box_x/2) + box_x*i).attr("y2", box_y/2 + 5)
			.attr("stroke", "rgb(60,60,60)").attr("stroke-width", 2);
		if (i != 0){
			d3.select("#slider_" + id).append("line") //Draw 0.5 lines
				.attr("x1", box_x*i).attr("y1", box_y/2 - 2)
				.attr("x2", box_x*i).attr("y2", box_y/2 + 2)
				.attr("stroke", "rgb(150,150,150)").attr("stroke-width", 2);
		}				
	}
	d3.select("#slider_" + id).append("line") //Draw center line
		.attr("x1", Math.round(box_x/2)).attr("y1", box_y/2)
		.attr("x2", Math.round(box_x/2) + box_x*4).attr("y2", box_y/2)
		.attr("stroke", "rgb(100,100,100)").attr("stroke-width", 1).attr("stroke-dasharray",("1,3"));

	var handle_position = [Math.round(box_x/2) - handle_offset + box_x*(weight-1), box_y/2 - handle_offset];
	d3.xml("img/handle.svg").mimeType("image/svg+xml").get(function(error, xml){
		if(error) throw error;
		d3.select("#slider_" + id).append("g") //Add handle
			.attr("id", "handle_"+id)
			.attr("transform", "translate(" + handle_position + ")")
			.on("mouseover", function(){$(this).css('cursor', 'ew-resize');})
			.on("mouseout", function(){$(this).css('cursor', 'default');})
			.call(drag);
		document.getElementById("handle_"+id).appendChild(xml.documentElement);
	});
	//Handler drag and drop behavior
	var c1_drag = {
		position: [0,0],
		get_dragstart: function(){
			//Drag measure
			for (var i=0; i<factors.length;i++){
				if (factors[i]["id"] == id){
					dragAction.from = factors[i]["weight"];
				}
			}
			dragAction.from_time = Math.floor(Date.now() / 1000);
			dragAction.which = id;
			//Make loc_table 0.2 - make this 1.0 again at updatelocation()
			$("#loc_table").css("opacity", 0.2);
		},
		get_drag: function(){
			//console.log(this.position[0]);
			if (this.position[0] < Math.round(box_x*0.5)){ //Ensure not lower than box_x/2
				this.position[0] = Math.round(box_x*0.5);
			}
			if (this.position[0] > Math.round(box_x*4.5)){ //Ensure no more than box_x*4
				this.position[0] = Math.round(box_x*4.5);
			}
			this.position[1] = box_y/2;
			this.position[0] -= handle_offset;			
			this.position[1] -= handle_offset;
			
			return this.position;
		},
		get_dragend: function(){
			//snap = this.position[0];
			//snap = Math.round((snap - box_x/2)/(box_x/2)); // 0 ~ 9

			var start = 0;
			var current = (this.position[0] + handle_offset - Math.round(box_x*0.5));
			console.log(current);
			var end = box_x*4;
			var set = Math.round((current/end)*100);
			var weight_norm = Math.round((current/end)*100); //0~100
			var weight = Math.round((1+4*(current/end))*100)/100; //1~5

			for (var i=0; i<factors.length;i++){
				if (factors[i]["id"] == id){
					factors[i]["weight"] = weight;
				}
			}
			//Set weight_norm: get total
			var total = 0;
			for (var i=0; i<factors.length;i++){
				var set = ((factors[i]["weight"]-1)/4)*100;
				//console.log(i + " " + set);
				total += set;
			}
			//Set weight_norm: get weight i
			for (var i=0; i<factors.length;i++){
				var weight_i = ((factors[i]["weight"]-1)/4)*100 / total;
				//console.log(i + " " + Math.round(weight_i*1000)/1000+"");
				factors[i]["weight_norm"] = Math.round(weight_i*1000)/1000;
			}

			//Drag measure
			for (var i=0; i<factors.length;i++){
				if (factors[i]["id"] == id){
					dragAction.to = factors[i]["weight"];
				}
			}

			//!!! DATA !!! steps, magnitude, drags[]
			dragAction.to_time = Math.floor(Date.now() / 1000);
			dragAction.offset = Math.abs(dragAction.to - dragAction.from);
			dragAction.offset_time = dragAction.to_time - dragAction.from_time;
			var tempAction = JSON.parse(JSON.stringify(dragAction));

			if (screen_step == 2){ //c1_q1
				console.log("C1_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
				c1_q1.steps += 1;
				c1_q1.magnitude += tempAction.offset;
				c1_q1.drags.push(tempAction);
			}
			else if (screen_step == 4){ //c1_q2
				console.log("C1_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
				c1_q2.steps += 1;
				c1_q2.magnitude += tempAction.offset;
				c1_q2.drags.push(tempAction);
				//Action logging
				var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
				c1_q2.actions.push(act);
			}
			else if (screen_step == 7){ //c2_q1
				console.log("C2_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
				c2_q1.steps += 1;
				c2_q1.magnitude += tempAction.offset;
				c2_q1.drags.push(tempAction);
			}
			else{
				console.log("C2_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
				c2_q2.steps += 1;
				c2_q2.magnitude += tempAction.offset;
				c2_q2.drags.push(tempAction);
				//Action logging
				var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
				c2_q2.actions.push(act);				
			}
			//Update locations accordingly
			UpdateLocation();
		},
		set: function(p){this.position = p}
	};
	var drag = d3.behavior.drag()  // capture mouse drag event
		.on('dragstart', function(){
			c1_drag.get_dragstart()
		})
		.on('drag', function(){
			handle_position = [d3.event.x, d3.event.y];
			c1_drag.set([d3.event.x, d3.event.y]);
			d3.select("#handle_"+id)
				.attr("transform", "translate(" + c1_drag.get_drag() + ")");
		})
		.on('dragend', function(){
			c1_drag.get_dragend();
		});
}

//Condition 2
function drawRadar(){
	var svg_width = 400;
	var svg_height = 390;
	var center = [svg_width/2, svg_height/2];
	var r_bg_lines = []; //Initially: [10,45,80,115,150];
	var handles = [];
	var handle_offset = 11;
	var points_polygon = [];

	var step = 17; //variable that control the width between circles
	var step_cur = step;
	r_bg_lines.push(step_cur);
	for (var i=0; i<8; i++){
		step_cur += step;
		r_bg_lines.push(step_cur);
	}

	NOF = getNOF();

	if (NOF>=2){
		//Set handles[]
		for (var i=0; i< factors.length; i++){
			if (factors[i]["is_set"] == true){
				//if (factors[i]["weight"] == 0){
				//	factors[i]["weight"] = 3;
				//}
				handle_temp = {
					name:factors[i]["text"],
					id:factors[i]["id"],				
					angle:0,
					color: factors[i]["color"],
					weight: factors[i]["weight"]
				}
				handles.push(handle_temp);
			}
		}

		//Set angles of each line
		var portion = 360/NOF;
		var current = 0;
		if (NOF == 2){ // make triangle if only two factors are selected
			handles[0]["angle"] = 30;
			handles[1]["angle"] = 360-30;
		}
		else{
			for (var i=0; i<NOF; i++){
				handles[i]["angle"] = current;
				current+=portion;
			}
		}

		var svg = d3.select("#factor_weight_controller").append("svg") //Draw svg
			.attr("id", "radar").attr("width", svg_width).attr("height", svg_height);
		d3.select("#radar").append("rect") //Draw background
			.attr("width", svg_width).attr("height", svg_height).attr("fill", "rgb(240,240,240)");
		d3.select("#radar").append("g") //g #background : stores every background information
			.attr("id", "background").attr("transform", "translate(" + center + ")");
		d3.select("#radar").append("g") //g #polygon : stores radar polygon
			.attr("id", "polygon").attr("transform", "translate(" + center + ")");
		d3.select("#radar").append("g") //g #handles : stores handles
			.attr("id", "handles").attr("transform", "translate(" + center + ")");
		d3.select("#radar").append("g") //g #labels : stores lables (e.g., 1 2 3 4 5)
			.attr("id", "labels").attr("transform", "translate(" + center + ")");

		//g #background: background circles
		d3.select("#background").append("circle")
			.attr("cx", 0).attr("cy", 0).attr("r",2)
			.attr("fill","rgb(10,10,10)");
		for (var i=0; i<5; i++){
			d3.select("#background").append("circle")
			.attr("cx", 0).attr("cy", 0).attr("r",r_bg_lines[i*2])
			.attr("fill", "rgba(120,120,120,0.1)").attr("stroke", "rgb(80,80,80)").attr("stroke-width", 1).attr("stroke-dasharray",("1,3"))
		}

		//g #background texts and lines
		for (var i=0; i<handles.length; i++){
			//Make gradient
			var color1 = handles[i]["color"];
			var color2 = handles[i]["color"];
			var r_text = r_bg_lines[8];
			//Texts
			color1 = color1.substr(0,3) + "a" + color1.substr(3, color1.length);
			color1 = color1.substr(0,color1.length-1) + ", 0.7" + color1.substr(color1.length-1,color1.length);
			color2 = color2.substr(0,3) + "a" + color2.substr(3, color2.length);
			color2 = color2.substr(0,color2.length-1) + ", 0" + color2.substr(color2.length-1,color2.length);
			var rg = svg.append("defs").append("radialGradient").attr("id", "grd_" + handles[i]["id"]);
			rg.append("stop").attr("offset", "50%").attr("stop-color", color1);
			rg.append("stop").attr("offset", "100%").attr("stop-color", color2);
			var pos_x = (r_text+20)*Math.cos(ang_transform(handles[i]["angle"])/180*Math.PI);
			var pos_y = (r_text+20)*Math.sin(ang_transform(handles[i]["angle"])/180*Math.PI);

			d3.select("#background").append("circle") //Draw center line
				.attr("cx", pos_x).attr("cy", pos_y)
				.attr("r", "12px").attr("fill", "url(#grd_" + handles[i]["id"]);
			d3.select("#background").append("text")
				.text(handles[i]["name"])
				.attr("id", "text_" + handles[i]["id"])
				.attr("x", pos_x).attr("y", pos_y)
				.attr("font-family", "PT Sans Narrow").attr("font-size", "16px")
				.attr("text-anchor", "middle").attr("dominant-baseline", "middle");
			//3-2. Draw things related to "Lines" - i.e., lines and handle
			d3.select("#background").append("line")
				.attr("id", "line_" + handles[i]["id"])
				.attr("x1", 0).attr("y1", 0)
				.attr("x2", (r_text)*Math.cos(ang_transform(handles[i]["angle"])/180*Math.PI)).attr("y2", (r_text)*Math.sin(ang_transform(handles[i]["angle"])/180*Math.PI))
				.attr("stroke", handles[i]["color"]).attr("stroke-width", 1).attr("stroke-dasharray",("3,2"));
		}		
		//2. Draw polygon
		points_polygon = getPolypoints(handles);
		//In case two factors are selected
		if (points_polygon.length==2){points_polygon.push([0,0]);}
		d3.select("#polygon").selectAll("polygon") //g #polygon: draw polygon
			.data([points_polygon]).enter().append("polygon")
			.attr("points",function(d) {return d.join(" ");})
			.attr("stroke","rgba(80, 80, 80, 0.8)").attr("fill", "rgba(80, 80, 80, 0.3)").attr("stroke-width",1);

		//3. Draw handles
		var loop_temp = 0;
		function readHandles(){
			setTimeout(function(){
				var id_temp = handles[loop_temp]["id"];
				var weight_temp = 0;
				var x1, y1, x2, y2;
				for (var i=0; i<factors.length; i++){
					if (id_temp == factors[i]["id"]){
						weight_temp = factors[i]["weight"];
						x1 = (step*1)*Math.cos(ang_transform(handles[i]["angle"])/180*Math.PI);
						y1 = (step*1)*Math.sin(ang_transform(handles[i]["angle"])/180*Math.PI);
						x2 = (step*9)*Math.cos(ang_transform(handles[i]["angle"])/180*Math.PI);
						y2 = (step*9)*Math.sin(ang_transform(handles[i]["angle"])/180*Math.PI);
					}
				}

				r_init = (weight_temp-1)*2+1;
				var dest = [(r_init*step) * Math.cos(ang_transform(handles[loop_temp]["angle"])/180*Math.PI), (r_init*step) * Math.sin(ang_transform(handles[loop_temp]["angle"])/180*Math.PI)];
				dest[0] -= handle_offset; dest[1] -= handle_offset;
				//Get handles
				d3.xml("img/handle.svg").mimeType("image/svg+xml").get(function(error, xml){
					if(error) throw error;
					d3.select("#handles").append("g")
						.attr("id", "handle_" + id_temp)
						.attr("transform", "translate(" + dest + ")")
						.on("mouseover", function(){$(this).css('cursor', 'move');})
						.on("mouseout", function(){$(this).css('cursor', 'default');})
						.call(drag);
					document.getElementById("handle_" + id_temp).appendChild(xml.documentElement);
				});
				//drag behaviors
				var c2_drag = {
					id: id_temp,
					x1: x1, 
					y1: y1,
					x2: x2, 
					y2: y2,					
					position: [0,0],
					ang: handles[loop_temp]["angle"],
					safe_points: [],
					get_dragstart: function(){
						//Set safe points
						for (var i=0; i<handles.length;i++){
							if (factors[i]["id"] == this.id){
								dragAction.from = handles[i]["weight"];
							}
						}
						dragAction.from_time = Math.floor(Date.now() / 1000);
						dragAction.which = this.id;
						//Make loc_table 0.2 - make this 1.0 again at updatelocation()
						$("#loc_table").css("opacity", 0.2);						
					},
					get_drag: function(){
						//Find the closest safepoint when drag

						var line = d3.svg.line().interpolate("linear");
						var points = [[this.x1, this.y1], [this.x2, this.y2]];  
						$("#temp_"+this.id).remove();
						var path = d3.select("#handles").append("path").attr("id", "temp_"+this.id)
							.datum(points).attr("d", line).attr("stroke-opacity", 0.3);

						var reposition =  closestPoint(path.node(),this.position);
						//reposition[0] -= handle_offset;
						//reposition[1] -= handle_offset;
						this.position = reposition;
						
						var dist = getDistance([this.x1, this.y1], this.position)/getDistance([this.x1, this.y1], [this.x2, this.y2]);
						//console.log(Math.round(dist*100)/100 + " and " + Math.round((dist*4+1)*100)/100);
						//Update pairs_all
						for (var i=0; i< factors.length; i++){
							var weight_this = Math.round((dist*4+1)*100)/100; //1~5
							if(factors[i]["id"] == this.id){
								factors[i]["weight"] = weight_this;
							}							
							if(handles[i]["id"] == this.id){
								handles[i]["weight"] = weight_this;
							}
						}
						return this.position;
					},
					get_dragend: function(){
						//Normalize the weight_norm
						var weights = [];
						var weight_cur;

						var total = 0;
						for (var i=0; i<factors.length;i++){
							var set = ((factors[i]["weight"]-1)/4)*100;
							//console.log(i + " " + set);
							total += set;
						}
						//Set weight_norm: get weight i
						for (var i=0; i<factors.length;i++){
							var weight_i = ((factors[i]["weight"]-1)/4)*100 / total;
							//console.log(i + " " + Math.round(weight_i*1000)/1000+"");
							factors[i]["weight_norm"] = Math.round(weight_i*1000)/1000;
						}

						//Drag measure
						for (var i=0; i<factors.length;i++){
							if (factors[i]["id"] == this.id){
								dragAction.to = factors[i]["weight"];
							}
						}


						//!!! DATA !!! steps, magnitude, drags[]
						dragAction.to_time = Math.floor(Date.now() / 1000);
						dragAction.offset = Math.abs(dragAction.to - dragAction.from);
						dragAction.offset_time = dragAction.to_time - dragAction.from_time;
						var tempAction = JSON.parse(JSON.stringify(dragAction));

						if (screen_step == 2){ //c1_q1
							console.log("C1_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c1_q1.steps += 1;
							c1_q1.magnitude += tempAction.offset;
							c1_q1.drags.push(tempAction);
						}
						else if (screen_step == 4){ //c1_q2
							console.log("C1_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c1_q2.steps += 1;
							c1_q2.magnitude += tempAction.offset;
							c1_q2.drags.push(tempAction);
							//Action logging
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c1_q2.actions.push(act);
						}
						else if (screen_step == 7){ //c2_q1
							console.log("C2_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c2_q1.steps += 1;
							c2_q1.magnitude += tempAction.offset;
							c2_q1.drags.push(tempAction);
						}
						else{
							console.log("C2_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c2_q2.steps += 1;
							c2_q2.magnitude += tempAction.offset;
							c2_q2.drags.push(tempAction);
							//Action logging
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c2_q2.actions.push(act);				
						}
						//Update locations accordingly
						UpdateLocation();						

					},
					set: function(p){
						this.position = p;
					},
				};
				var drag = d3.behavior.drag()  // capture mouse drag event
					.on('dragstart', function(){
						c2_drag.get_dragstart();
					})
					.on('drag', function(){
						//Set position while drag
						c2_drag.set([d3.event.x, d3.event.y]);
						//Get position
						var dest = c2_drag.get_drag();

						d3.select("#handle_"+id_temp)//Update 1. handle position
							.attr("transform", "translate(" + (dest[0]-handle_offset) +"," + (dest[1]-handle_offset)+ ")");
						$("#polygon").empty(); //Update 2. Redraw polygon
						//Draw polygon
						points_polygon = getPolypoints(handles);
						if (points_polygon.length==2){points_polygon.push([0,0]);}
						d3.select("#polygon").selectAll("polygon")
							.data([points_polygon])
							.enter().append("polygon").attr("points",function(d) {return d.join(" ");})
							.attr("stroke","rgba(80, 80, 80, 0.8)").attr("fill", "rgba(80, 80, 80, 0.3)").attr("stroke-width",1);
					})
					.on('dragend', function(){
						c2_drag.get_dragend();
					});
				loop_temp++;
				// Add drag handlers
				if (loop_temp < handles.length){
					readHandles();
				}
			}, 5)
		}
		readHandles();
		//4. Draw labels
		
		var labels = ["Not at all important", "Low improtance", "Neutral", "Very important", "Extremely important"];
		for (var i=0; i<5; i++){
			d3.select("#background").append("text") //Display description e.g., 1. 2. 3. ...
				.text((i+1)+" ")
				.attr("x", -208+10).attr("y", function(){return 124+14*i;})
				.attr("font-family", "PT Sans Narrow").attr("font-size", "15px").attr("font-weight", "600")
				.attr("fill","#444"); //#cc4c02
			d3.select("#background").append("text") //Display description e.g., "Low importance"
				.text(labels[i])		
				.attr("x", -198+10).attr("y", function(){return 123+14*i;})
				.attr("font-family", "PT Sans Narrow").attr("font-size", "12px").attr("fill","#000"); //#993404
			d3.select("#labels").append("text") //Display actual label
				.text(i+1)
				.attr("x", r_bg_lines[i*2] * Math.cos(ang_transform(360-45)/180*Math.PI) - 10)
				.attr("y", r_bg_lines[i*2] * Math.sin(ang_transform(360-45)/180*Math.PI) + 5) //Display label in bottom side
				.attr("text-anchor", "middle").attr("font-family", "PT Sans Narrow").attr("font-size", 12 + i*2).attr("font-weight", "600").attr("fill","#444"); //cc4c02
		}
	}
	else{ //if NOF<2
		$("#controller_message").empty();
		$("#controller_message").append("How important are they?");
	}
}

function drawSliders_c3(){
	var svg_width = 430;
	var svg_height = 330;
	var handles = [];
	var handle_offset = 11;
	var height_bin = 40;
	var width_bin = 60;	
	var width_namebin = 90;
	var height_total = 0;

	var NOF = 0;
	for (var i=0; i< factors.length; i++){if (factors[i]["is_set"] == true){NOF++;}}

	height_total =  height_bin*NOF + 20; //height for slider total

	if (NOF >= 2){
		var svg = d3.select("#factor_weight_controller").append("svg") //Draw svg
			.attr("id", "sliders_c3").attr("width", svg_width).attr("height", svg_height);
		d3.select("#sliders_c3").append("rect") //Draw background rect
			.attr("x", width_namebin).attr("y", height_bin)
			.attr("width", width_bin*5).attr("height", height_bin*NOF).attr("fill", "rgb(240,240,240)");
		//Added for S1
		d3.select("#sliders_c3").append("rect") //Draw background rect for total proportion
			.attr("x", width_namebin).attr("y", height_total+height_bin)
			.attr("width", width_bin*5).attr("height", height_bin).attr("fill", "rgb(240,240,240)");

		d3.select("#sliders_c3").append("g") //g #txt_proportion : stores txt proportion (e.g., 50%)
			.attr("id", "txt_proportion").attr("transform", "translate(" + width_namebin + ",0)");
		d3.select("#sliders_c3").append("g") //g #txt_factors 
			.attr("id", "txt_factors").attr("transform", "translate(0," + height_bin + ")");
		d3.select("#sliders_c3").append("g") //g #sliders : draw slders
			.attr("id", "sliders").attr("transform", "translate(" + width_namebin +"," + height_bin +")");		
		d3.select("#sliders_c3").append("g") //g #handles : stores handles
			.attr("id", "handles").attr("transform", "translate(" + width_namebin +"," + height_bin +")");
	
		var proportion = ["0%", "25%", "50%", "75%", "100%"];
		for (var i=0; i<5; i++){
			d3.select("#txt_proportion").append("text")
				.text(proportion[i])
				.attr("x", width_bin/2 + width_bin*i).attr("y", height_bin/2)
				.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
		}
		var idx = 0;
		for (var i=0; i<5; i++){ //Draw factor txt
			if (factors[i]["is_set"] == true){
				d3.select("#txt_factors").append("text")
					.text(factors[i]["text"])
					.attr("x", width_namebin/2).attr("y", height_bin/2 + height_bin*idx)
					.attr("font-family", "PT Sans Narrow").attr("font-size", "18px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
				idx += 1;
			}
		}
		d3.select("#txt_factors").append("text")
			.text("Your choice:")
			.attr("x", width_namebin/2).attr("y", height_bin/2 + height_total)
			.attr("font-family", "PT Sans Narrow").attr("font-size", "18px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");

		var idx = 0;
		var weight_total = 0;
		for (var i=0; i< factors.length; i++){
			if (factors[i]["is_set"] == true){
				handle_temp = { //Construct factors
					name:factors[i]["text"],
					id:factors[i]["id"],
					weight: factors[i]["weight"],
					weight_norm: factors[i]["weight_norm"],
					color: factors[i]["color"]
				}
				weight_total += factors[i]["weight_norm"];
				handles.push(handle_temp);
				//Draw sliders
				d3.select("#sliders").append("g")//g #slider_id: draw slider here
					.attr("id", "slider_"+factors[i]["id"])
					.attr("transform", "translate(0," + height_bin*idx +")");
				//d3.select("#sliders").append("g")//g #result_id: draw results here
				//	.attr("id", "result_"+factors[i]["id"])
				//	.attr("transform", "translate(" + width_bin*5 + ","+ height_bin*idx +")");
				for (var j=0; j<5; j++){//Draw ticks
					d3.select("#slider_"+factors[i]["id"]).append("line") //Draw 1.0 lines
						.attr("x1", Math.round(width_bin/2) + width_bin*j).attr("y1", height_bin/2 - 5)
						.attr("x2", Math.round(width_bin/2) + width_bin*j).attr("y2", height_bin/2 + 5)
						.attr("stroke", "rgb(60,60,60)").attr("stroke-width", 2);
					if (j != 0){
						d3.select("#slider_"+factors[i]["id"]).append("line") //Draw 0.5 lines
							.attr("x1", width_bin*j).attr("y1", height_bin/2 - 2)
							.attr("x2", width_bin*j).attr("y2", height_bin/2 + 2)
							.attr("stroke", "rgb(150,150,150)").attr("stroke-width", 2);
					}				
				}
				d3.select("#slider_"+factors[i]["id"]).append("line") //Draw center line
					.attr("x1", Math.round(width_bin/2)).attr("y1", height_bin/2)
					.attr("x2", Math.round(width_bin/2) + width_bin*4).attr("y2", height_bin/2)
					.attr("stroke", "rgb(100,100,100)").attr("stroke-width", 1).attr("stroke-dasharray",("1,3"));
				//d3.select("#result_"+factors[i]["id"]).append("text") //Draw result (e.g., 0%)
				//	.text(Math.round((factors[i]["weight_norm"])*100) + "%")
				//	.attr("x", 15).attr("y", height_bin/2)
				//	.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
				idx += 1;
			}
		}
		//Draw a slider for presenting total results
		d3.select("#sliders").append("g")//g #slider_id: draw slider here
			.attr("id", "slider_total")
			.attr("transform", "translate(0," + height_total +")");
		for (var j=0; j<5; j++){
			d3.select("#slider_total").append("line") //Draw 1.0 lines
				.attr("x1", Math.round(width_bin/2) + width_bin*j).attr("y1", height_bin/2 - 5)
				.attr("x2", Math.round(width_bin/2) + width_bin*j).attr("y2", height_bin/2 + 5)
				.attr("stroke", "rgb(60,60,60)").attr("stroke-width", 2);
			if (j != 0){
				d3.select("#slider_total").append("line") //Draw 0.5 lines
					.attr("x1", width_bin*j).attr("y1", height_bin/2 - 2)
					.attr("x2", width_bin*j).attr("y2", height_bin/2 + 2)
					.attr("stroke", "rgb(150,150,150)").attr("stroke-width", 2);
			}
		}

		d3.select("#slider_total").append("line") //Draw center line
			.attr("x1", Math.round(width_bin/2)).attr("y1", height_bin/2)
			.attr("x2", Math.round(width_bin/2) + width_bin*4).attr("y2", height_bin/2)
			.attr("stroke", "rgb(100,100,100)").attr("stroke-width", 1).attr("stroke-dasharray",("1,3"));

		$("#bars").remove();
		d3.select("#slider_total").append("g").attr("id", "bars");
		var total_start = [width_bin/2,height_bin/2];
		var total_dest = [];
		var numOfZero = 0
		for (var i=0; i<factors.length; i++){if (factors[i]["weight_norm"]<=0.03){numOfZero++;}} //Check how many of empty slot
		var txtseq = 0;
		for (var i=0; i<factors.length; i++){
			total_dest[0] = total_start[0] + (width_bin*4)*(factors[i]["weight_norm"]);
			total_dest[1] = total_start[1];
			d3.select("#bars").append("line").attr("id", "bar_total_" + factors[i]["id"])
				.attr("x1", total_start[0]).attr("y1", total_start[1]).attr("x2", total_dest[0]).attr("y2", total_dest[1])
				.attr("stroke", handles[i]["color"]).attr("stroke-width", 10);
			if (factors[i]["weight_norm"]>0.03){
				d3.select("#bars").append("text")
					.text(Math.round((factors[i]["weight_norm"])*100) + "%")
					.attr("x", (total_start[0]+total_dest[0])/2).attr("y", total_start[1]/2)
					.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
				d3.select("#bars").append("text")
					.text((factors[i]["text"]))
					.attr("x", width_bin*0.5 + (width_bin*5)/(5-numOfZero)*txtseq).attr("y", total_start[1]*2.5)
					.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
				d3.select("#bars").append("line")
					.attr("x1", (total_start[0]+total_dest[0])/2).attr("y1", total_start[1]/2 + 15)
					.attr("x2", width_bin*0.5 + (width_bin*5)/(5-numOfZero)*txtseq).attr("y2", total_start[1]*2.5 - 10)
					.attr("stroke", "#aaa").attr("stroke-width", 1).attr("stroke-dasharray",("1,2"));
				txtseq ++;
			}
			total_start[0] = total_dest[0];
			total_start[1] = total_dest[1];
		}

		//Add handles:
		var loop_temp = 0;
		function readHandles(){
			setTimeout(function(){
				var id_temp = handles[loop_temp]["id"];
				var weight_temp = handles[loop_temp]["weight_norm"];

				var dest = [width_bin/2 + (weight_temp)*(width_bin*4), height_bin/2];
				dest[0] -= handle_offset;
				dest[1] -= handle_offset;
				//Get handles
				d3.xml("img/handle.svg").mimeType("image/svg+xml").get(function(error, xml){
					if(error) throw error;
					//Add bar
					d3.select("#slider_"+id_temp).append("line")
						.attr("id", "bar_" + id_temp)
						.attr("x1", width_bin/2).attr("y1", height_bin/2)
						.attr("x2", dest[0] + handle_offset).attr("y2", dest[1] + handle_offset)
						.attr("stroke", function(){
							for (var i=0; i<handles.length;i++){
								if(id_temp == handles[i]["id"]){
									return handles[i]["color"];
								}
							}
						}).attr("stroke-width", 8);
					//Add handle
					d3.select("#slider_"+id_temp).append("g")
						.attr("id", "handle_" + id_temp)
						.attr("transform", "translate(" + dest + ")")
						.on("mouseover", function(){$(this).css('cursor', 'move');})
						.on("mouseout", function(){$(this).css('cursor', 'default');})
						.call(drag);
					document.getElementById("handle_" + id_temp).appendChild(xml.documentElement);
				});
				//drag behaviors
				var c3_drag = {
					id: id_temp,
					position: [0,0],
					remain: 0,
					get_dragstart: function(){
						//Drag measure
						for (var i=0; i<factors.length;i++){
							if (factors[i]["id"] == this.id){
								dragAction.from = factors[i]["weight"];
							}
						}
						dragAction.from_time = Math.floor(Date.now() / 1000);
						dragAction.which = this.id;
						//Make loc_table 0.2 - make this 1.0 again at updatelocation()
						$("#loc_table").css("opacity", 0.2);						
					},
					get_drag: function(){
						//Find the closest safepoint when drag
						var sum_weight = 0;
						for (var i=0; i<handles.length;i++){
							if (handles[i]["id"]!=this.id){
								sum_weight += handles[i]["weight_norm"];
							}
						}
						this.remain = 100 - sum_weight*100;
						
						if (this.position[0] < Math.round(width_bin*0.5)){ //Ensure not lower than box_x/2
							this.position[0] = Math.round(width_bin*0.5);
						}
						if (this.position[0] > Math.round(width_bin*0.5 + (this.remain/100)*(width_bin*4))){ //Ensure no more than box_x*4
							this.position[0] = Math.round(width_bin*0.5 + (this.remain/100)*(width_bin*4));
						}			
						this.position[1] = height_bin/2;

						var current_weight = Math.round((this.position[0] - width_bin*0.5)/(width_bin*4)*1000)/1000;

						//Update weights for handles and factors
						for (var i=0; i<handles.length; i++){
							if (handles[i]["id"]==this.id){
								handles[i]["weight_norm"] = current_weight;
							}						
						}
						for (var i=0; i<factors.length; i++){
							if (factors[i]["id"]==this.id){
								factors[i]["weight_norm"] = current_weight;
							}						
						}
						
						//$("#result_"+id_temp).empty(); //Update text
						//d3.select("#result_"+id_temp).append("text")
						//	.text(Math.round(current_weight*100)+"%")
						//	.attr("x", 15).attr("y", height_bin/2)
						//	.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");							
						d3.select("#bar_"+id_temp) //Update bar
							.attr("x2", this.position[0]).attr("y2", this.position[1])
							.attr("stroke", function(){
								for (var i=0; i<handles.length;i++){
									if(id_temp == handles[i]["id"]){
										return handles[i]["color"];
									}
								}
							}).attr("stroke-width", 8);//.attr("stroke-opacity", 0.8);

						//Update slider_total & slider_result
						var weight_total = 0;
						for (var i=0; i<handles.length;i++){weight_total += handles[i]["weight_norm"];}

						$("#bars").remove();
						d3.select("#slider_total").append("g").attr("id", "bars");
						var total_start = [width_bin/2,height_bin/2];
						var total_dest = [];
						var numOfZero = 0
						for (var i=0; i<factors.length; i++){if (factors[i]["weight_norm"]<=0.03){numOfZero++;}} //Check how many of empty slot
						var txtseq = 0;
						for (var i=0; i<factors.length; i++){
							total_dest[0] = total_start[0] + (width_bin*4)*(factors[i]["weight_norm"]);
							total_dest[1] = total_start[1];
							d3.select("#bars").append("line").attr("id", "bar_total_" + factors[i]["id"])
								.attr("x1", total_start[0]).attr("y1", total_start[1]).attr("x2", total_dest[0]).attr("y2", total_dest[1])
								.attr("stroke", handles[i]["color"]).attr("stroke-width", 10);
							if (factors[i]["weight_norm"]>0.03){
								d3.select("#bars").append("text")
									.text(Math.round((factors[i]["weight_norm"])*100) + "%")
									.attr("x", (total_start[0]+total_dest[0])/2).attr("y", total_start[1]/2)
									.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
								d3.select("#bars").append("text")
									.text((factors[i]["text"]))
									.attr("x", width_bin*0.5 + (width_bin*5)/(5-numOfZero)*txtseq).attr("y", total_start[1]*2.5)
									.attr("font-family", "PT Sans Narrow").attr("font-size", "13px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
								d3.select("#bars").append("line")
									.attr("x1", (total_start[0]+total_dest[0])/2).attr("y1", total_start[1]/2 + 15)
									.attr("x2", width_bin*0.5 + (width_bin*5)/(5-numOfZero)*txtseq).attr("y2", total_start[1]*2.5 - 10)
									.attr("stroke", "#aaa").attr("stroke-width", 1).attr("stroke-dasharray",("1,2"));
								txtseq ++;
							}
							total_start[0] = total_dest[0];
							total_start[1] = total_dest[1];
						}
						return this.position;
					},
					get_dragend: function(){
						var start = 0;
						var current = (this.position[0] - Math.round(width_bin*0.5));
						var end = width_bin*4;
						var set = Math.round((current/end)*100);
						var weight = Math.round((1+4*(current/end))*100)/100;

						for (var i=0; i<factors.length;i++){
							if (factors[i]["id"] == this.id){
								factors[i]["weight"] = weight;
							}
						}
						//Drag measure
						for (var i=0; i<factors.length;i++){
							if (factors[i]["id"] == this.id){
								dragAction.to = factors[i]["weight"];
							}
						}

						//!!! DATA !!! steps, magnitude, drags[]
						dragAction.to_time = Math.floor(Date.now() / 1000);
						dragAction.offset = Math.abs(dragAction.to - dragAction.from);
						dragAction.offset_time = dragAction.to_time - dragAction.from_time;
						var tempAction = JSON.parse(JSON.stringify(dragAction));

						if (screen_step == 2){ //c1_q1
							console.log("C1_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c1_q1.steps += 1;
							c1_q1.magnitude += tempAction.offset;
							c1_q1.drags.push(tempAction);
						}
						else if (screen_step == 4){ //c1_q2
							console.log("C1_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c1_q2.steps += 1;
							c1_q2.magnitude += tempAction.offset;
							c1_q2.drags.push(tempAction);
							//Action logging
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c1_q2.actions.push(act);
						}
						else if (screen_step == 7){ //c2_q1
							console.log("C2_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c2_q1.steps += 1;
							c2_q1.magnitude += tempAction.offset;
							c2_q1.drags.push(tempAction);
						}
						else{
							console.log("C2_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c2_q2.steps += 1;
							c2_q2.magnitude += tempAction.offset;
							c2_q2.drags.push(tempAction);
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c2_q2.actions.push(act);							
						}

						//Update locations accordingly
						UpdateLocation();						
					},
					set: function(p){
						this.position = p;
					},
				};
				var drag = d3.behavior.drag()  // capture mouse drag event
					.on('dragstart', function(){
						c3_drag.get_dragstart();
					})
					.on('drag', function(){
						//Set position while drag
						c3_drag.set([d3.event.x, d3.event.y]);
						//Get position
						var dest = c3_drag.get_drag();
						d3.select("#handle_"+id_temp)//Update 1. handle position
							.attr("transform", "translate(" + (dest[0]-handle_offset) +"," + (dest[1]-handle_offset)+ ")");
					})
					.on('dragend', function(){
						c3_drag.get_dragend();
					});
				loop_temp++;
				// Add drag handlers
				if (loop_temp < handles.length){
					readHandles();
				}
			}, 5)
		}
		readHandles();
	}
	else {
		$("#controller_message").empty();
		$("#controller_message").append("Please select at least two factors.");		
	}
}

function drawPie(value, share){
	//get value and decide remove or add the value
	var svg_width = 400;
	var svg_height = 370;
	var center = [svg_width/2, svg_height/2];
	var r = 130;
	var r_text = r + 25;	
	var pie_handles2 = [];
	var pie_areas2 = [];
	var arc = d3.svg.arc()
		.innerRadius(15)
		.outerRadius(r);
	var duration = pie_duration;
	NOF = getNOF();


	/*var new_share = 360*0.05//360/NOF;
	if (mode == 7){
		new_share = 360/NOF;
	}*/
	var new_share = 360/share;

	//Copy pie_handles and pie_areas to the new handles and angles
	pie_handles2 = JSON.parse(JSON.stringify(pie_handles));
	pie_areas2 = JSON.parse(JSON.stringify(pie_areas));
	for (var i=0; i<factors.length; i++){
		if (factors[i]["id"] == value){
			//Case for adding add a factor
			if (factors[i]["is_set"] == true){
				//make empty handle and arae
				area_temp = {
					name:factors[i]["text"],
					id:factors[i]["id"],
					color:factors[i]["color"],
					angle:[0,0]
				}
				handle_temp = {
					next:"",
					prev:"",
					angle:0
				}
				if(pie_handles.length == 0){ //If the function initializes the screen
					area_temp.angle[1]=360;
					handle_temp.next = factors[i]["id"];
					handle_temp.prev = factors[i]["id"];
				}
				else{//If there were something already and add
					//a. Check the last arae's angles and id, and set area_temp and handle_temp
					area_temp.angle[0] = pie_areas2[pie_areas2.length-1].angle[1] % 360;
					area_temp.angle[1] = area_temp.angle[0] + new_share;
					if (area_temp.angle[1] > 360) {area_temp.angle[1] %= 360;}
					handle_temp.prev = pie_areas2[pie_areas2.length-1]["id"];
					handle_temp.next = pie_areas2[0]["id"];
					handle_temp.angle = area_temp.angle[0];
					//b. Update the rest of angles
					var angle_current = area_temp.angle[1];
					for (var j=0; j<pie_areas2.length; j++){
						//Update handle
						area_share = getAngleBetweenTwo(pie_areas2[j]["angle"][0], pie_areas2[j]["angle"][1]);
						area_share = (area_share/360) * (360 - new_share);
						pie_handles2[j].angle = angle_current;
						pie_areas2[j].angle[0] = angle_current;
						angle_current += area_share;if (angle_current>360){angle_current %= 360;}
						pie_areas2[j].angle[1] = angle_current;
					}
				}
				pie_areas2.push(area_temp);
				pie_handles2.push(handle_temp);
				//update handle left / right
				for (var j=0; j<pie_areas2.length; j++){
					var next = j;
					if (next == pie_areas2.length){next = 0;}
					var prev = j-1;
					if (prev == -1){prev = pie_areas2.length-1;}
					pie_handles2[j].next = pie_areas2[next].id;
					pie_handles2[j].prev = pie_areas2[prev].id;
				}
			}
			//Case for removing a factor
			else {
				console.log("remove " + value);
				var area_remove = 0;
				for (var j=0; j<pie_areas2.length; j++){
					if (pie_areas2[j]["id"] == value){
						area_remove = getAngleBetweenTwo(pie_areas2[j]["angle"][0], pie_areas2[j]["angle"][1]);
						pie_areas2.splice(j,1);
						pie_handles2.splice(j,1);
					}
				}
				if (NOF >= 1){ //update handle left / right
					for (var j=0; j<pie_areas2.length; j++){
						var next = j;
						if (next == pie_areas2.length){next = 0;}
						var prev = j-1;
						if (prev == -1){prev = pie_areas2.length-1;}
						pie_handles2[j].next = pie_areas2[next].id;
						pie_handles2[j].prev = pie_areas2[prev].id;
					}
					//Rearrange the locations
					var angle_current = pie_areas2[0]["angle"][0];
					for (var j=0; j<pie_areas2.length; j++){
						area_newangle = getAngleBetweenTwo(pie_areas2[j]["angle"][0], pie_areas2[j]["angle"][1]);
						area_newangle = area_newangle/(360-area_remove)*360;
						pie_areas2[j]["angle"][0] = angle_current;
						pie_handles2[j]["angle"] = angle_current;
						angle_current += area_newangle;
						angle_current %= 360;
						pie_areas2[j]["angle"][1] = angle_current;
						if (pie_areas2[j]["angle"][0]%360 == pie_areas2[j]["angle"][1]%360){ // In the case that there is only one pie left
							//console.log("one left!");
							pie_areas2[j]["angle"][0] = pie_areas2[j]["angle"][1] - 360;
						}
					}
				}
			}
		}
	}

	//Start drawing between pie_areas <-> pie_areas2
	$("#pie").empty();
	//Changing from areas_1, handles_1 to aras_2, handles_2 
	var areas_1 = JSON.parse(JSON.stringify(pie_areas));
	var handles_1 = JSON.parse(JSON.stringify(pie_handles));
	var areas_2 = JSON.parse(JSON.stringify(pie_areas2));
	var handles_2 = JSON.parse(JSON.stringify(pie_handles2));

	if (NOF>=1){ //Insert empty pie for adding (0 to %%) / removing (%% to 0) factor.
		for (var i=0; i<factors.length; i++){
			if (factors[i]["id"] == value){
				//Add empty area and handle to areas_1 and handles_1
				if (factors[i]["is_set"] == true){
					//console.log("add " + value); 
					var last_angle = areas_2[areas_2.length-1]["angle"][0];
					area_temp = {
						name:factors[i]["text"],
						id:factors[i]["id"],
						color:factors[i]["color"],
						angle:[last_angle, last_angle]
					}
					handle_temp = {
						next:"",
						prev:"",
						angle:last_angle
					}
					areas_1.push(area_temp);
					handles_1.push(handle_temp);
					for (var j=0; j<handles_1.length;j++){
						handles_1[j]["next"] = handles_2[j]["next"];
						handles_1[j]["prev"] = handles_2[j]["prev"];
					}
				}
				//Add empty area and handle to areas_2 and handles_2
				else{
					//console.log("remnove " + value); 
					var isEmptySlideAdded = false;
					var last_angle = 0;
					for (var j=0; j <areas_2.length; j++){
						last_angle = areas_2[j]["angle"][0];
						if (areas_1[j]["id"] != areas_2[j]["id"]){
							//var last_angle = areas_1[j]["angle"][1];
							area_temp = {
								name:factors[i]["text"],
								id:factors[i]["id"],
								color:factors[i]["color"],
								angle:[last_angle, last_angle]
							}
							handle_temp = {
							 next:"",
							 prev:"",
							 angle:last_angle
							}
							areas_2.splice(j, 0, area_temp);
							handles_2.splice(j, 0, handle_temp);
							isEmptySlideAdded = true
						}
					}
					if (isEmptySlideAdded == false){
						last_angle = areas_2[areas_2.length-1]["angle"][1];
						area_temp = {
							name:factors[i]["text"],
							id:factors[i]["id"],
							color:factors[i]["color"],
							angle:[last_angle, last_angle]
						}
						handle_temp = {
						 next:"",
						 prev:"",
						 angle:last_angle
						}
						areas_2.splice(areas_2.length, 0, area_temp);
						handles_2.splice(areas_2.length, 0, handle_temp);
					}
					for (var j=0; j<handles_2.length;j++){
						handles_2[j]["next"] = handles_1[j]["next"];
						handles_2[j]["prev"] = handles_1[j]["prev"];
					}
				}
			}
		}

		//Start drawing: 
		d3.select("#pie").append("rect")
			.attr("width", svg_width).attr("height", svg_width).attr("fill", "rgb(240,240,240)");
		d3.select("#pie").append("circle")
			.attr("cx", center[0]).attr("cy", center[1]).attr("r",2)
			.attr("fill","rgb(10,10,10)");
		d3.select("#pie").append("g").attr("id", "g_areas")
			.attr("transform", "translate(" + center + ")");
		d3.select("#pie").append("g").attr("id", "g_lines")
				.attr("transform", "translate(" + center + ")");			

		rotation_lines = [];
		rotation_texts = [];
		//console.log(areas_1);
		//3. Draw
		for (var i=0; i<handles_1.length; i++){
			var angle_start1 = areas_1[i]["angle"][0];
			var angle_end1 = areas_1[i]["angle"][1];
			var angle_start2 = areas_2[i]["angle"][0];
			var angle_end2 = areas_2[i]["angle"][1];

			if (angle_start1 > angle_end1){
				angle_start1 -= 360;
			}			
			if (angle_start2 > angle_end2){
				angle_start2 -= 360;
			}
			if (angle_start2 <0 && angle_start1>0){
				angle_start1 -= 360;
				angle_end1 -= 360;
			}
			var id_temp = handles_1[i]["prev"] + "_AND_" +  handles_1[i]["next"];
			//3-1. Draw arcs
			var arcs = d3.select("#g_areas").append("path")
				.datum({startAngle:angle_start1/180*Math.PI, endAngle:angle_end1/180*Math.PI})
				.attr("id", "arc_"+areas_1[i]["id"])
				.attr("fill", areas_1[i]["color"])
				.attr("d", arc).transition()
				.duration(duration)
				.attrTween("d", arcTween(angle_start2/180*Math.PI, angle_end2/180*Math.PI));
				//console.log(areas_2[i]["id"] + " from: " +  angle_start1 + " " + angle_end1 + " to: " + angle_start2 + " " + angle_end2);
			function arcTween(newAngle1, newAngle2) {
				return function(d) {
					var interpolateStart = d3.interpolate(d.startAngle, newAngle1);
					var interpolateEnd = d3.interpolate(d.endAngle, newAngle2);
					return function(t) {
						d.startAngle = interpolateStart(t);
						d.endAngle = interpolateEnd(t);
						return arc(d);
					};
				};
			}
			//3-1. Draw texts
			var angle_start_txt = (angle_start1 + angle_end1)/2;
			var angle_end_txt = (angle_start2 + angle_end2)/2;
			rotation_texts.push([angle_start_txt, angle_end_txt]);

			var text_from = [r_text * Math.cos(ang_transform(angle_start_txt)/180*Math.PI), r_text * Math.sin(ang_transform(angle_start_txt)/180*Math.PI)];
			var text_to = [r_text * Math.cos(ang_transform(angle_end_txt)/180*Math.PI), r_text * Math.sin(ang_transform(angle_end_txt)/180*Math.PI)];			
			var text_proportion = getPieProportion(areas_1[i]["angle"][0], areas_1[i]["angle"][1]);
			var loop_txt = 0;
			d3.select("#g_areas").append("g").attr("id", "g_txt_" + areas_1[i]["id"]).attr("class", "texts").attr("opacity",1);
			d3.select("#g_txt_" + areas_1[i]["id"]).append("text")
				.text(areas_1[i]["name"])
				.attr("id", "text_" + areas_1[i]["id"])
				.attr("x", 0).attr("y", -7)
				.attr("font-size", "14px")
				.attr("text-anchor", "middle")
				.attr("font-family", "PT Sans Narrow");
			d3.select("#g_txt_" + areas_1[i]["id"]).append("text")
				.text(text_proportion + "%")
				.attr("id", "text_" + areas_1[i]["id"])
				.attr("x", 0).attr("y", 10)
				.attr("font-size", "18px")
				.attr("font-weight", "600")
				.attr("text-anchor", "middle")
				.attr("font-family", "PT Sans Narrow");
			d3.select("#g_txt_" + areas_1[i]["id"])
				.attr("transform", "translate("+ text_from +")")
				.transition()
				.duration(duration)
				.attr("transform", "translate("+ text_to +")");

			//3-2. Draw Lines
			var angle_line_start = angle_start1;
			var angle_line_end = angle_start2;
			//console.log(angle_line_start + " " + angle_line_end);
			var diff = angle_line_end - angle_line_start;
			rotation_lines.push(diff);
			
			var from = [r* Math.cos(ang_transform(angle_line_start)/180*Math.PI), r* Math.sin(ang_transform(angle_line_start)/180*Math.PI)];
			var to = [r* Math.cos(ang_transform(angle_line_end)/180*Math.PI), r* Math.sin(ang_transform(angle_line_end)/180*Math.PI)];			

			d3.select("#pie").append("g").attr("id", "g_line_"+ id_temp).attr("class", "lines")
			.attr("transform", "translate(" + center + ")");
			d3.select("#g_line_"+id_temp).append("line")
				.attr("x1", 0).attr("y1", 0).attr("x2", from[0]).attr("y2", from[1])
				.attr("stroke", "rgba(230,230,230,0.5)").attr("stroke-width", 1).attr("stroke-dasharray",("2,2"));
			d3.select("#g_line_"+id_temp).each(cycle);

			var loop_temp = 0;
			function cycle(){
				d3.select(this).transition().duration(duration)
				.attrTween("transform", function() { 
					var transform1 = "translate(" + center + ")rotate(0)";
					var transform2 = "translate(" + center + ")rotate(" + rotation_lines[loop_temp] + ")";
					loop_temp += 1;
					//console.log(transform1 + " " + transform2);
					return d3.interpolateString(transform1, transform2);
				})
			}
		}
	}
	pie_handles = JSON.parse(JSON.stringify(pie_handles2));
	pie_areas = JSON.parse(JSON.stringify(pie_areas2));
	//Populate the next event for control
	setTimeout(drawPie_control, duration+10);
}

function drawPie_control(){
	var svg_width = 430;
	var svg_height = 370;
	var center = [svg_width/2, svg_height/2];
	var r = 130;
	var r_text = r + 32;
	var handle_offset = 11;
	var arc = d3.svg.arc()
		.innerRadius(15)
		.outerRadius(r);	
	//1. remove unuseful things
	for (var i=0; i<length; i++){
		if(factors[i]["is_set"] = false){
			$("#arc_"+factors[i]["id"]).remove();
		}
	}
	$(".lines").remove();
	$(".texts").remove();

	for (var i=0; i<pie_handles.length; i++){
		var id_temp = pie_handles[i]["prev"] + "_AND_" +  pie_handles[i]["next"];
		var dest = [r* Math.cos(ang_transform(pie_handles[i]["angle"])/180*Math.PI), r* Math.sin(ang_transform(pie_handles[i]["angle"])/180*Math.PI)];
		//Add texts:
		var area_start = pie_areas[i]["angle"][0];
		var area_end = pie_areas[i]["angle"][1];
		var text_angle = (pie_areas[i]["angle"][0] + pie_areas[i]["angle"][1])/2;
		if (area_start > area_end){
			text_angle += 180;
		}
		var text_dest = [r_text * Math.cos(ang_transform(text_angle)/180*Math.PI), r_text * Math.sin(ang_transform(text_angle)/180*Math.PI)];
		var text_proportion = getPieProportion(pie_areas[i]["angle"][0], pie_areas[i]["angle"][1]);
		d3.select("#g_areas").append("g").attr("id", "g_txt_" + pie_areas[i]["id"]).attr("class", "texts").attr("opacity",1);
		d3.select("#g_txt_" + pie_areas[i]["id"]).append("text")
			.text(pie_areas[i]["name"])
			.attr("id", "text_" + pie_areas[i]["id"])
			.attr("x", 0)
			.attr("y", -7)
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.attr("font-family", "PT Sans Narrow");
		d3.select("#g_txt_" + pie_areas[i]["id"]).append("text")
			.text(text_proportion + "%")
			.attr("id", "text_" + pie_areas[i]["id"])
			.attr("x", 0)
			.attr("y", 10)
			.attr("font-size", "18px")
			.attr("font-weight", "600")
			.attr("text-anchor", "middle")
			.attr("font-family", "PT Sans Narrow");
		d3.select("#g_txt_" + pie_areas[i]["id"])
			.attr("transform", "translate("+ text_dest +")");

		//Update the factors weight
		for (var j=0; j<factors.length; j++){
			if (factors[j]["id"] == pie_areas[i]["id"]){
				factors[j]["weight"] = text_proportion;
			}
		}
		//3-2. Draw things related to "Lines" - i.e., lines and handle
		d3.select("#g_lines").append("line").attr("class", "lines")
			.attr("opacity",0)
			.attr("id", "line_" + id_temp)
			.attr("x1", 0).attr("y1", 0).attr("x2", dest[0]).attr("y2", dest[1])
			.attr("stroke", "rgba(230,230,230,0.5)").attr("stroke-width", 1).attr("stroke-dasharray",("2,2"));

	}
	//2. add text and control behaviors
	var loop_temp = 0;
	//3-3. Draw handles to g_lines - include drag behaviors
	function readHandles(){
		setTimeout(function(){
			var id_temp = pie_handles[loop_temp]["prev"] + "_AND_" +  pie_handles[loop_temp]["next"];
			//Remove the same handle before actually making it
			$("#handle_"+id_temp).remove();
			var dest = [r* Math.cos(ang_transform(pie_handles[loop_temp]["angle"])/180*Math.PI), r* Math.sin(ang_transform(pie_handles[loop_temp]["angle"])/180*Math.PI)];
			dest[0] -= handle_offset;
			dest[1] -= handle_offset;
			d3.xml("img/handle.svg").mimeType("image/svg+xml").get(function(error, xml){
				if(error) throw error;
				d3.select("#g_lines").append("g")
					.attr("id", "handle_" + id_temp)
					.attr("transform", "translate(" + dest + ")")
					.on("mouseover", function(){$(this).css('cursor', 'move');})
					.on("mouseout", function(){$(this).css('cursor', 'default');})
					.call(drag);
				document.getElementById("handle_"+id_temp).appendChild(xml.documentElement);
			});
			//Add drag behavior to each handler
			var c4_drag = {
				id: loop_temp,
				position: [0,0],
				ang_start: 0, // angle when the drag started
				ang_current: 0, // angle based on the current mouse location
				ang_end: 0, // final angle
				ang_prevbnd: 0,
				ang_nextbnd: 0,
				ang_buffer: 3, // buffer
				safe_areas: [],
				prev_lock: 0,
				next_lock: 0,
				get_dragstart: function(){
					//Set start angle
					this.ang_start = pie_handles[this.id]["angle"];
					//Set left and right bound angles
					var id_prev = pie_handles[this.id]["prev"];
					var id_next = pie_handles[this.id]["next"];
					for (var i=0 ; i<pie_handles.length ; i++){
						if (pie_handles[i]["next"] == id_prev){
							this.ang_prevbnd = pie_handles[i]["angle"];
						}
						if (pie_handles[i]["prev"] == id_next){
							this.ang_nextbnd = pie_handles[i]["angle"];
						}
					}
					//Set safe areas
					this.safe_areas = setSafetyAreas(this.id);
					//console.log("bounds:" + this.ang_prevbnd + " " + this.ang_nextbnd);
					//console.log("start angle:" + this.ang_start);
					//console.log(this.safe_areas);
					for (var i=0; i<factors.length;i++){
						if(factors[i]["id"] == pie_handles[this.id]["next"]){
							dragAction.from = factors[i]["weight"];
							dragAction.which = factors[i]["id"];
						}
					}
					dragAction.from_time = Math.floor(Date.now() / 1000);
					//Make loc_table 0.2 - make this 1.0 again at updatelocation()
					$("#loc_table").css("opacity", 0.2);
				},
				get_drag: function(){
					//4-1-a. Get the current angle from mouse position
					var pos2ang = Math.atan2(this.position[1] - 0, this.position[0] - 0)/Math.PI * 180;
					//angle transformation 
					pos2ang %= 360;
					if (pos2ang < 0){
						pos2ang = pos2ang + 360;
					}
					//4-1-b. Constrain the angle
					this.ang_current = ang_inv_trans(pos2ang);
					//console.log("left:" + bound_left + ", " + "right:" + bound_right + ", " + "current:" + cur_trans);
					//Check if the current angle is within safety boundary
					var isSafe = false;
					for (var i=0; i<this.safe_areas.length; i++){
						if (this.safe_areas[i][0] <= this.ang_current && this.ang_current <= this.safe_areas[i][1]){
							isSafe = true;
						}
					}
					var ang_final = 0;
					// If mouse position is within safe area
					if (isSafe){
						if (this.prev_lock){
							if (this.ang_current > this.ang_prevbnd + this.ang_buffer){
								this.prev_lock = 0;
							}
						}
						else if (this.next_lock){
							var rightlock_check = this.ang_nextbnd - this.ang_buffer;
							if (rightlock_check <= 0){
								rightlock_check += 360;
							}
							if (this.ang_current < rightlock_check){
								this.next_lock = 0;
							}
						}
						else {
							//If everything is okay, update handles & areas
							this.ang_end = this.ang_current;
							pie_handles[this.id]["angle"] = this.ang_end;
							var leftArea = this.id-1;
							if (leftArea == -1){
								leftArea = pie_handles.length-1;
							}
							var rightArea = this.id;
							pie_areas[leftArea]["angle"][1] = this.ang_end;
							pie_areas[rightArea]["angle"][0] = this.ang_end;
						}
					}
					// If mouse position is out of safe area
					else {
						if (this.prev_lock == 0 && this.next_lock ==0){
							console.log("start:" + this.ang_start + " left:" + this.ang_prevbnd + " right:" + this.ang_nextbnd + " current:" + this.ang_current);
							if (this.ang_start < this.ang_prevbnd){
								if ((this.ang_prevbnd <= this.ang_current && this.ang_current <= 360) || (0 <= this.ang_current && this.ang_current<=this.ang_start)){
									this.ang_end = this.ang_prevbnd + this.ang_buffer;
									this.prev_lock = 1;
								}
								else {
									this.ang_end = this.ang_nextbnd - this.ang_buffer;
									this.next_lock = 1;
								}
							}
							else{
								if ((this.ang_prevbnd <= this.ang_current && this.ang_current<=this.ang_start)){
									this.ang_end = this.ang_prevbnd + this.ang_buffer;
									this.prev_lock = 1;
								}
								else {
									this.ang_end = this.ang_nextbnd - this.ang_buffer;
									this.next_lock = 1;
								}
							}
						}
					}
					//Set the final position
					ang_final = ang_transform(this.ang_end);
					return [r* Math.cos(ang_final/180*Math.PI), r* Math.sin(ang_final/180*Math.PI)];
				},
				set: function(p){
					this.position = p;
				},
				get_dragend: function(){
					console.log('get_dragend');
					for (var i=0; i<factors.length;i++){
						if(factors[i]["id"] == pie_handles[this.id]["next"]){
							dragAction.to = factors[i]["weight"];
						}
					}
					dragAction.offset = (Math.abs(dragAction.to - dragAction.from)/100)*4;
					//console.log(dragAction.offset);
					dragAction.to_time = Math.floor(Date.now() / 1000);
					dragAction.offset_time = dragAction.to_time - dragAction.from_time;
					var tempAction = JSON.parse(JSON.stringify(dragAction));

					if (screen_step == 2){ //c1_q1
						console.log("C1_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
						c1_q1.steps += 1;
						c1_q1.magnitude += tempAction.offset;
						c1_q1.drags.push(tempAction);
					}
					else if (screen_step == 4){ //c1_q2
						console.log("C1_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
						c1_q2.steps += 1;
						c1_q2.magnitude += tempAction.offset;
						c1_q2.drags.push(tempAction);
						//Action logging
						var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
						c1_q2.actions.push(act);
					}
					else if (screen_step == 7){ //c2_q1
						console.log("C2_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
						c2_q1.steps += 1;
						c2_q1.magnitude += tempAction.offset;
						c2_q1.drags.push(tempAction);
					}
					else{
						console.log("C2_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
						c2_q2.steps += 1;
						c2_q2.magnitude += tempAction.offset;
						c2_q2.drags.push(tempAction);
						var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
						c2_q2.actions.push(act);							
					}

					//Update locations accordingly
					UpdateLocation();		
					console.log(factors);			
				}
			};
			var drag = d3.behavior.drag()  // capture mouse drag event
				.on('dragstart', function(){
					c4_drag.get_dragstart();
				})
				.on('drag', function(){
					//Set position while drag
					c4_drag.set([d3.event.x, d3.event.y]);
					//Get position
					var dest = c4_drag.get_drag();
					//Update handle position
					d3.select("#handle_"+id_temp)
						.attr("transform", "translate(" + (dest[0]-handle_offset) +"," + (dest[1]-handle_offset)+ ")");
					//Update line
					d3.select("#line_"+id_temp)
						.attr("x2", dest[0])
						.attr("y2", dest[1]);
					
					//Update Arc position
					for (var i=0; i< pie_areas.length; i++){
						$("#arc_" + pie_areas[i]["id"]).remove();
						var start = pie_areas[i]["angle"][0];
						var end = pie_areas[i]["angle"][1];
						if (start > end || pie_areas.length == 1){
							end += 360;
						}
						var arcs = d3.select("#g_areas").append("path")
							.datum({startAngle:start/180*Math.PI,endAngle:end/180*Math.PI})
							.attr("id", "arc_"+pie_areas[i]["id"])
							.attr("fill", pie_areas[i]["color"])
							.attr("d", arc);
					}
					//Update text positions
					var newAreas = id_temp.split("_AND_");
					var newAngles = [];
					var newDests = [];
					for (var i=0; i<newAreas.length; i++){ // for adjacent two areas:
						$("#g_txt_" + newAreas[i]).remove();
						var proportion = 0;
						var areas_idx = 0;
						for (var j=0; j<pie_areas.length; j++){
							if (pie_areas[j]["id"] == newAreas[i]){
								//set proportion
								proportion = getPieProportion(pie_areas[j]["angle"][0], pie_areas[j]["angle"][1]);
								areas_idx = j;
								//calculate angle
								var start = pie_areas[j]["angle"][0];
								var end = pie_areas[j]["angle"][1];
								if (start == end){ // If there is only one handle
									newAngles[i] = start + 180;
								}
								else{ 
									start %= 360;
									end %= 360;
									if (start > end){
										start += 360;
									}
									newAngles[i] = start + (end-start)/2;
								}
								newAngles[i] %= 360;
								//console.log("Results:" + areas[j]["angle"][0] + "+" + areas[j]["angle"][1] + ": " + newAngles[i]);
							}
						}
						newDests[i] = [ r_text * Math.cos(ang_transform(newAngles[i])/180*Math.PI), r_text * Math.sin(ang_transform(newAngles[i])/180*Math.PI)];
						
						//Texts
						d3.select("#g_areas").append("g").attr("id", "g_txt_"+pie_areas[areas_idx]["id"])
							.attr("opacity", function(){
								var ang1 = pie_areas[areas_idx]["angle"][0];
								var ang2 = pie_areas[areas_idx]["angle"][1];
								var angdiff = Math.abs(ang1-ang2);
								if (angdiff < 5){return 0;}
								else{return 1;}
							});
						d3.select("#g_txt_" + pie_areas[areas_idx]["id"]).append("text")
							.text(pie_areas[areas_idx]["name"])
							.attr("id", "text_" + pie_areas[areas_idx]["id"])
							.attr("x", 0)
							.attr("y", -7)
							.attr("font-size", "14px")
							.attr("text-anchor", "middle")
							.attr("font-family", "PT Sans Narrow");
						d3.select("#g_txt_" + pie_areas[areas_idx]["id"]).append("text")
							.text(proportion + "%")
							.attr("id", "text_" + pie_areas[areas_idx]["id"])
							.attr("x", 0)
							.attr("y", 10)
							.attr("font-size", "18px")
							.attr("text-anchor", "middle")
							.attr("font-weight", "600")
							.attr("font-family", "PT Sans Narrow");
						d3.select("#g_txt_" + pie_areas[areas_idx]["id"])
							.attr("transform", "translate("+ newDests[i] +")");

						//Update factors
						for (var j=0; j<factors.length; j++){
							if (factors[j]["id"] == pie_areas[areas_idx]["id"]){
								factors[j]["weight"] = proportion;
								factors[j]["weight_norm"] = proportion/100;
							}
						}
					}
				})
				.on('dragend', function(){
					c4_drag.get_dragend();
				});
		
			loop_temp++;
			// Add drag handlers
			if (loop_temp < pie_handles.length){
				readHandles();
			}
		}, 5)
	}
	readHandles();
}

function drawSliders_c5(){

	var NOF = 0;
	var setted = []
	for (var i=0; i< factors.length; i++){
		if (factors[i]["is_set"] == true){
			NOF++;
			setted.push(factors[i])
		}
	}
	if (NOF>=2){
		//Set pairs_all
		for (var i=0; i<pairs_all.length; i++){
			pairs_all[i]["is_set"] = false;
		}
		var NOP = 0; //Number of pairs
		for (var i=0; i<setted.length; i++){
			for (var j=0; j<setted.length; j++){
				if (i<j){
					var id_temp = setted[i]["id"] + "_AND_" + setted[j]["id"];
					for (var k=0; k<pairs_all.length; k++){
						if (pairs_all[k]["id"] == id_temp){
							pairs_all[k]["is_set"] = true;
							NOP++;
						}
					}
				}
			}
		}
		$("#factor_weight_controller").append(c5_txt);
		
		var svg_width = 430;
		var svg_height = 40 * NOP;
		var handle_offset = 11;
		var height_bin = 40;
		var width_bin = 60;	
		var width_namebin = 65;
		var svg = d3.select("#c5_handles").append("svg") //Draw svg
			.attr("id", "sliders_c5").attr("width", svg_width).attr("height", svg_height);
		d3.select("#sliders_c5").append("rect") //Draw background
			.attr("x", width_namebin).attr("y", 0)
			.attr("width", width_bin*5).attr("height", height_bin*NOP).attr("fill", "rgb(240,240,240)");
		d3.select("#sliders_c5").append("g") //g #txt_factors : stores radar polygon
			.attr("id", "txt_left");
		d3.select("#sliders_c5").append("g") //g #txt_factors : stores radar polygon
			.attr("id", "txt_right").attr("transform", "translate(" + (width_namebin + width_bin*5) + ",0)");
		d3.select("#sliders_c5").append("g") //g #sliders : draw slders
			.attr("id", "sliders").attr("transform", "translate(" + width_namebin +",0)");
		d3.select("#sliders_c5").append("g") //g #handles : stores handles
			.attr("id", "message").attr("transform", "translate(" + width_namebin +"," + height_bin*6.6 +")");

		//Draw texts
		var idx = 0;
		for (var i=0; i<pairs_all.length; i++){
			if(pairs_all[i]["is_set"] == true){
				//console.log(pairs_all[i]["from"]["name"] + " and " + pairs_all[i]["to"]["name"]);
				d3.select("#txt_left").append("text")
					.text(pairs_all[i]["from"]["name"])
					.attr("x", width_namebin/2).attr("y", height_bin/2 + height_bin*idx)
					.attr("font-family", "PT Sans Narrow").attr("font-size", "14px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
				d3.select("#txt_right").append("text")
					.text(pairs_all[i]["to"]["name"])
					.attr("x", width_namebin/2).attr("y", height_bin/2 + height_bin*idx)
					.attr("font-family", "PT Sans Narrow").attr("font-size", "14px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");

				//Draw sliders
				d3.select("#sliders").append("g")//g #slider_id: draw slider here
					.attr("id", "slider_" + pairs_all[i]["id"])
					.attr("transform", "translate(0," + height_bin*idx +")");
				for (var j=0; j<5; j++){
					d3.select("#slider_" + pairs_all[i]["id"]).append("line") //Draw 1.0 lines
						.attr("x1", Math.round(width_bin/2) + width_bin*j).attr("y1", height_bin/2 - 5)
						.attr("x2", Math.round(width_bin/2) + width_bin*j).attr("y2", height_bin/2 + 5)
						.attr("stroke", "rgb(60,60,60)").attr("stroke-width", 2);
					if (j != 0){
						d3.select("#slider_" + pairs_all[i]["id"]).append("line") //Draw 0.5 lines
							.attr("x1", width_bin*j).attr("y1", height_bin/2 - 2)
							.attr("x2", width_bin*j).attr("y2", height_bin/2 + 2)
							.attr("stroke", "rgb(150,150,150)").attr("stroke-width", 2);
					}				
				}
				d3.select("#slider_" + pairs_all[i]["id"]).append("line") //Draw center line
					.attr("x1", Math.round(width_bin/2)).attr("y1", height_bin/2)
					.attr("x2", Math.round(width_bin/2) + width_bin*4).attr("y2", height_bin/2)
					.attr("stroke", "rgb(100,100,100)").attr("stroke-width", 1).attr("stroke-dasharray",("1,3"));
				idx++;
			}
		}

		//Draw sliders
		var ids = []
		for (var i=0;i<pairs_all.length;i++){
			if (pairs_all[i]["is_set"] == true){
				ids.push(pairs_all[i]["id"]);
			}
		}
		var loop_temp = 0;
		function readHandles(){
			setTimeout(function(){
				var id_temp = ids[loop_temp];
				//console.log(id_temp);
				var weight_temp = 0;
				for (var i=0;i<pairs_all.length;i++){
					if (pairs_all[i]["id"] == id_temp){
						weight_temp = pairs_all[i]["weight"];
					}
				}
				//weight_temp = WeightToHandle(weight_temp); //change weight to handle position
				var dest = [width_bin/2 + (weight_temp-1)*width_bin, height_bin/2];
				dest[0] -= handle_offset;
				dest[1] -= handle_offset;
				//Get handles
				d3.xml("img/handle.svg").mimeType("image/svg+xml").get(function(error, xml){
					if(error) throw error;
					//Add handle
					d3.select("#slider_"+id_temp).append("g")
						.attr("id", "handle_" + id_temp)
						.attr("transform", "translate(" + dest + ")")
						.on("mouseover", function(){$(this).css('cursor', 'move');})
						.on("mouseout", function(){$(this).css('cursor', 'default');})
						.call(drag);
					document.getElementById("handle_" + id_temp).appendChild(xml.documentElement);
				});

				//drag behaviors
				var c5_drag = {
					id: id_temp,
					position: [0,0],
					get_dragstart: function(){
						//Drag measure
						for (var i=0; i<factors.length;i++){
							if (pairs_all[i]["id"] == this.id){
								dragAction.from = pairs_all[i]["weight"];
							}
						}
						dragAction.from_time = Math.floor(Date.now() / 1000);
						dragAction.which = this.id;
						//Make loc_table 0.2 - make this 1.0 again at updatelocation()
						$("#loc_table").css("opacity", 0.2);
					},
					get_drag: function(){
						//Find the closest safepoint when drag
						
						if (this.position[0] < Math.round(width_bin*0.5)){ //Ensure not lower than box_x/2
							this.position[0] = Math.round(width_bin*0.5);
						}
						if (this.position[0] > Math.round(width_bin*4.5)){ //Ensure no more than box_x*4
							this.position[0] = Math.round(width_bin*4.5);
						}			
						this.position[1] = height_bin/2;
						this.position[0] -= handle_offset;
						this.position[1] -= handle_offset;

						return this.position;
					},
					get_dragend: function(){
						//pairs_all data update  
						/*snap = this.position[0];
						snap = Math.round((snap - width_bin/2)/(width_bin/2)); // 0 ~ 9
						// Calculate the relateve weight here
						var current_weight = 1 + (snap)/2;
						current_weight = HandleToWeight(current_weight);*/
						//Store current weight !
						var start = 0;
						var current = (this.position[0]  + handle_offset - Math.round(width_bin*0.5));
						var end = width_bin*4;
						var set = Math.round((current/end)*100);
						var weight = Math.round((1+4*(current/end))*100)/100;
						var weight_norm = weight - 3;
						if(weight_norm >0){
							weight_norm = 1/(1 + (Math.abs(weight_norm)/2)*8);
						}
						else{
							weight_norm = 1 + (Math.abs(weight_norm)/2)*8;
						}
						for (var i=0; i<pairs_all.length;i++){
							if (pairs_all[i]["id"] == this.id){
								pairs_all[i]["weight"] = weight;
								pairs_all[i]["weight_norm"] = weight_norm;
							}
						}
						//Create 5 by 5 matrix (can consider NOF later....)
						var comp = [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]
						//Get weight from pairs_all 
						for (var i=0; i<pairs_all.length; i++){
							var idx_1 = pairs_all[i]["from"]["id"];
							var idx_2 = pairs_all[i]["to"]["id"];
							if (idx_1 == "1-1-1"){idx_1 = 0;}
							else if (idx_1 == "1-1-2"){idx_1 = 1;}
							else if (idx_1 == "1-2-1"){idx_1 = 2;}
							else if (idx_1 == "1-2-2"){idx_1 = 3;}
							else {idx_1 = 4;}
							if (idx_2 == "1-1-1"){idx_2 = 0;}
							else if (idx_2 == "1-1-2"){idx_2 = 1;}
							else if (idx_2 == "1-2-1"){idx_2 = 2;}
							else if (idx_2 == "1-2-2"){idx_2 = 3;}
							else {idx_2 = 4;}
							comp[idx_1][idx_2] = pairs_all[i]["weight_norm"];
							comp[idx_2][idx_1] = 1/(pairs_all[i]["weight_norm"]);
						}
						//console.log("-----");console.log(comp[0]);console.log(comp[1]);console.log(comp[2]);console.log(comp[3]);console.log(comp[4]);
						//Calculating the weight
						var eig = numeric.eig(comp);
						var mi = getMaxAndIndex(eig.lambda.x);
						var q = [], norm_q = [];
						for(var i = 0; i < eig.E.x.length; i++) {q.push(eig.E.x[i][mi.index]);}
						var sum = 0;
						for(var i = 0; i < q.length; i++) {sum += q[i];}
						for(var i = 0; i < q.length; i++) {norm_q.push(q[i] / sum);}
						for (var i=0 ; i<factors.length;i++){
							factors[i]["weight_norm"] = Math.round(norm_q[i]*1000)/1000;
							//console.log(factors[i]["text"] + " weight: " + factors[i]["weight_norm"]);
						}

						//Measure
						for (var i=0; i<pairs_all.length;i++){
							if (pairs_all[i]["id"] == this.id){
								dragAction.to = pairs_all[i]["weight"];
							}
						}			

						//!!! DATA !!! steps, magnitude, drags[]
						dragAction.to_time = Math.floor(Date.now() / 1000);
						dragAction.offset = Math.abs(dragAction.to - dragAction.from);
						dragAction.offset_time = dragAction.to_time - dragAction.from_time;
						var tempAction = JSON.parse(JSON.stringify(dragAction));

						if (screen_step == 2){ //c1_q1
							console.log("C1_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c1_q1.steps += 1;
							c1_q1.magnitude += tempAction.offset;
							c1_q1.drags.push(tempAction);
						}
						else if (screen_step == 4){ //c1_q2
							console.log("C1_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c1_q2.steps += 1;
							c1_q2.magnitude += tempAction.offset;
							c1_q2.drags.push(tempAction);
							//Log drac action
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c1_q2.actions.push(act);
						}
						else if (screen_step == 7){ //c2_q1
							console.log("C2_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c2_q1.steps += 1;
							c2_q1.magnitude += tempAction.offset;
							c2_q1.drags.push(tempAction);
						}
						else{
							console.log("C2_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c2_q2.steps += 1;
							c2_q2.magnitude += tempAction.offset;
							c2_q2.drags.push(tempAction);
							//Log drac action
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c2_q2.actions.push(act);							
						}
						//Update locations accordingly
						UpdateLocation();
					},					
					set: function(p){
						this.position = p;
					},
				};
				var drag = d3.behavior.drag()  // capture mouse drag event
					.on('dragstart', function(){
						c5_drag.get_dragstart();
					})
					.on('drag', function(){
						//Set position while drag
						c5_drag.set([d3.event.x, d3.event.y]);
						//Get position
						d3.select("#handle_"+id_temp)//Update 1. handle position
							.attr("transform", "translate(" + c5_drag.get_drag() + ")");
					})
					.on('dragend', function(){
						c5_drag.get_dragend();
						//d3.select("#handle_"+id_temp)
						//.attr("transform", "translate(" + c5_drag.get_dragend() + ")");
					});
				loop_temp++;
				// Add drag handlers
				if (loop_temp < ids.length){
					readHandles();
				}
			}, 5)
		}
		readHandles();
		//Draw message
	}
	else{
		$("#controller_message").empty();
		$("#controller_message").append("Please select at least two factors.");
	}
}

function drawRegularPolygon (){

	var svg_width = 430;
	var svg_height = 410;
	var center = [svg_width/2, svg_height/2];
	var handle_offset = 11;
	var r = 160;
	NOF = getNOF();
	var setted = []
	var portion = 360/NOF;
	var ang_current = 0;
	if (NOF == 2){
		ang_current += 90;
	}
	for (var i=0; i< factors.length; i++){
		if (factors[i]["is_set"] == true){
			temp = {
				name: factors[i]["text"],
				id: factors[i]["id"],
				angle: ang_current,
				color: factors[i]["color"],
				coords: [0,0]
			}
			setted.push(temp);
			ang_current+=portion;
		}
	}

	if (NOF>=2){
		//Set pairs_all
		for (var i=0; i<pairs_all.length; i++){
			pairs_all[i]["is_set"] = false;
		}
		var NOP = 0; //Number of pairs
		for (var i=0; i<setted.length; i++){
			for (var j=0; j<setted.length; j++){
				if (i<j){
					id_temp = setted[i]["id"] + "_AND_" + setted[j]["id"];
					for (var k=0; k<pairs_all.length; k++){
						if (pairs_all[k]["id"] == id_temp){
							pairs_all[k]["is_set"] = true;
							NOP++;
						}
					}
				}
			}
		}
		//Update coords information for pairs_all and setted.
		for (var i=0; i< setted.length; i++){
			var x = r*Math.cos((ang_transform(setted[i]["angle"])/180*Math.PI));
			var y = r*Math.sin((ang_transform(setted[i]["angle"])/180*Math.PI));
			setted[i]["coords"] = [x,y];
			for (var j=0; j<pairs_all.length; j++){
				if (pairs_all[j]["from"]["id"] == setted[i]["id"]){
					pairs_all[j]["from"]["coords"] = [x,y];
					pairs_all[j]["from"]["color"] = setted[i]["color"];
				}
				else if (pairs_all[j]["to"]["id"] == setted[i]["id"]){
					pairs_all[j]["to"]["coords"] = [x,y];
					pairs_all[j]["to"]["color"] = setted[i]["color"];
				}
			}
		}
		var svg = d3.select("#factor_weight_controller").append("svg") //Draw svg
			.attr("id", "regpoly").attr("width", svg_width).attr("height", svg_height);
		d3.select("#regpoly").append("rect")
			.attr("width", svg_width).attr("height", svg_height).attr("fill", "rgb(255,255,255)");
		d3.select("#regpoly").append("g") //g #background : stores every background information
			.attr("id", "background").attr("transform", "translate(" + center + ")");
		d3.select("#regpoly").append("g") //g #handles : stores handles
			.attr("id", "handles").attr("transform", "translate(" + center + ")");
		d3.select("#regpoly").append("g") //g #labels : stores lables (e.g., 1 2 3 4 5)
			.attr("id", "labels").attr("transform", "translate(" + center + ")");

		//Draw background
		for (var i=0; i<pairs_all.length; i++){
			if (pairs_all[i]["is_set"] == true){
				//Add main line
				x1 = pairs_all[i]["from"]["coords"][0]; y1 = pairs_all[i]["from"]["coords"][1];
				x2 = pairs_all[i]["to"]["coords"][0]; y2 = pairs_all[i]["to"]["coords"][1];
				d3.select("#background").append("g").attr("id", "g_" + pairs_all[i]["id"]).attr("opacity", 0.5);
				//Draw center line
				d3.select("#g_" + pairs_all[i]["id"]).append("line") 
					.attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
					.attr("stroke", "rgb(50,50,50)").attr("stroke-width", 1).attr("stroke-dasharray",("1,3"));
				//Add primary dots
				color1 = pairs_all[i]["from"]["color"]; color2 = pairs_all[i]["to"]["color"];
				var interpolate = d3.interpolateLab(color1, color2)
				for (j=0; j<5; j++){
					d3.select("#g_" + pairs_all[i]["id"]).append("circle")
						.attr("cx", x1 + (0.1+0.2*j)*(x2-x1)).attr("cy", y1 + (0.1+0.2*j)*(y2-y1)).attr("r", "3px")
						.attr("fill", interpolate(0.2*j));
				}
				for (j=0; j<5; j++){
					d3.select("#g_" + pairs_all[i]["id"]).append("circle")
						.attr("cx", x1 + (0.2*j)*(x2-x1)).attr("cy", y1 + (0.2*j)*(y2-y1)).attr("r", "1px")
						.attr("fill", "rgb(20,20,20)");
				}
				//Add secondary dots
			}
		}
		for (var i=0; i<setted.length; i++){
			//Add circle
			var color1 = setted[i]["color"];
			var color2 = setted[i]["color"];
			color1 = color1.substr(0,3) + "a" + color1.substr(3, color1.length);
			color1 = color1.substr(0,color1.length-1) + ", 0.7" + color1.substr(color1.length-1,color1.length);
			color2 = color2.substr(0,3) + "a" + color2.substr(3, color2.length);
			color2 = color2.substr(0,color2.length-1) + ", 0" + color2.substr(color2.length-1,color2.length);
			var rg = svg.append("defs").append("radialGradient").attr("id", "grd_"+setted[i]["id"]);
			rg.append("stop").attr("offset", "50%").attr("stop-color", color1);
			rg.append("stop").attr("offset", "100%").attr("stop-color", color2);

			d3.select("#background").append("circle") //Draw center line
				.attr("cx", setted[i]["coords"][0]).attr("cy", setted[i]["coords"][1])
				.attr("r", "14px").attr("fill", "url(#grd_"+setted[i]["id"]+")");
			//Add text
			d3.select("#background").append("text")
				.text(setted[i]["name"])
				.attr("x", setted[i]["coords"][0]).attr("y", setted[i]["coords"][1])
				.attr("font-family", "PT Sans Narrow").attr("font-size", "18px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
		}

		//Draw sliders
		var ids = []
		for (var i=0;i<pairs_all.length;i++){
			if (pairs_all[i]["is_set"] == true){
				ids.push(pairs_all[i]["id"]);
			}
		}
		var loop_temp = 0;
		function readHandles(){
			setTimeout(function(){
				var id_temp = ids[loop_temp];
				//console.log(id_temp);
				var weight_temp = 0;
				var color_1 = "";
				var color_2 = "";
				var interpolate;
				for (var i=0;i<pairs_all.length;i++){
					if (pairs_all[i]["id"] == id_temp){
						weight_temp = pairs_all[i]["weight_norm"]; // -9 -7 -5 -3 1 3 5 7 9
						color_1 = pairs_all[i]["from"]["color"];
						color_2 = pairs_all[i]["to"]["color"];
					}
				}
				handle_interpolate = d3.interpolate(color_1, color_2);
				//console.log("weight before:" + weight_temp);
				weight_temp = WeightToHandle(weight_temp); //change weight to handle position // 1 ~ 5
				//console.log("weight after:" + weight_temp);
				var x1, y1, x2, y2;
				for (var i=0;i<pairs_all.length;i++){
					if (pairs_all[i]["id"] == id_temp){
						x1 = pairs_all[i]["from"]["coords"][0]; 
						y1 = pairs_all[i]["from"]["coords"][1];
						x2 = pairs_all[i]["to"]["coords"][0]; 
						y2 = pairs_all[i]["to"]["coords"][1];
					}
				}

				var dest = [x1 + (x2-x1)*((weight_temp-1)/4), y1 + (y2-y1)*((weight_temp-1)/4)];
				dest[0] -= handle_offset;
				dest[1] -= handle_offset;
				//Get handles
				d3.xml("img/handle_pair.svg").mimeType("image/svg+xml").get(function(error, xml){
					if(error) throw error;
					//Add handle
					d3.select("#handles").append("g")
						.attr("id", "handle_" + id_temp)
						.attr("transform", "translate(" + dest + ")")
						.on("mouseover", function(){$(this).css('cursor', 'move');})
						.on("mouseout", function(){$(this).css('cursor', 'default');})
						.call(drag);
					document.getElementById("handle_" + id_temp).appendChild(xml.documentElement);
					d3.select("#handle_" + id_temp).append("circle").attr("id", "color_"+id_temp)
						.attr("cx", 11).attr("cy", 11).attr("r","6px").attr("fill", "#888"/* handle_interpolate((weight_temp-1)/4)*/);
				});
				var x1_re = x1 + (x2-x1)*0.1;
				var y1_re = y1 + (y2-y1)*0.1;
				var x2_re = x1 + (x2-x1)*0.9;
				var y2_re = y1 + (y2-y1)*0.9;
				var dist_whole = getDistance([x1_re, y1_re], [x2_re, y2_re]);
				//drag behaviors
				var c6_drag = {
					id: id_temp,
					x1: x1_re, 
					y1: y1_re,
					x2: x2_re, 
					y2: y2_re,
					color1: "",
					dist_whole: dist_whole,
					color2: "",
					position: [0,0],
					stops: [],
					get_dragstart: function(){
						//Drag measure
						for (var i=0; i<factors.length;i++){
							if (pairs_all[i]["id"] == this.id){
								dragAction.from = pairs_all[i]["weight"];
							}
						}
						dragAction.from_time = Math.floor(Date.now() / 1000);
						dragAction.which = this.id;
						//Make loc_table 0.2 - make this 1.0 again at updatelocation()
						$("#loc_table").css("opacity", 0.2)
					},
					get_drag: function(){
						//Constrain the position to be on the line
						var line = d3.svg.line().interpolate("linear");
						var points = [[this.x1, this.y1], [this.x2, this.y2]];  
						$("#temp_"+this.id).remove();
						var path = d3.select("#handles").append("path").attr("id", "temp_"+this.id)
							.datum(points).attr("d", line).attr("stroke-opacity", 0.3);
						//Set g_opacity 100%
						$("#g_" + this.id).attr("opacity", 1.0);
						var reposition =  closestPoint(path.node(),this.position);
						this.position = reposition;

						var dist = getDistance([this.x1, this.y1], this.position)/this.dist_whole; // 0~1
						var name_from;
						var name_to;
						//Update pairs_all
						for (var i=0; i< pairs_all.length; i++){
							if(pairs_all[i]["id"] == this.id){
								pairs_all[i]["weight"] = (dist*4)+1;
								color_1 = pairs_all[i]["from"]["color"];
								color_2 = pairs_all[i]["to"]["color"];
								name_from = pairs_all[i]["from"]["name"];
								name_to = pairs_all[i]["to"]["name"];
								var interpolate_temp = d3.interpolate(color_1, color_2);
								//console.log(pairs_all[i]["weight"]);
								$("#color_"+id_temp).attr("fill", interpolate_temp(dist));
							}
						}						
						reposition[0] -= handle_offset;
						reposition[1] -= handle_offset;
						this.position = reposition;
						//Add message at the bottom
						$("#drag_message").remove();
						var message = Math.round(((dist*4)+1)*2)/2;
						if (message == 1 || message == 1.5){ message = "Absolutely prefer <tspan font-weight='bold'>" + name_from + "</tspan> over <tspan font-weight='bold'>" + name_to + "</tspan>"; }
						//if (message == 1.5){ message = "Absolutely prefer <tspan fill='red'>" + name_from + "</tspan> over <tspan fill='red'>" + name_to + "</tspan>"; }
						if (message == 2 || message == 2.5){ message = "Strongly prefer <tspan font-weight='bold'>" + name_from + "</tspan> over <tspan font-weight='bold'>" + name_to + "</tspan>"; }
						//if (message == 2.5){ message = "Absolutely prefer" + name_from + " over " + name_to; }
						if (message == 3){ message = "<tspan font-weight='bold'>" + name_from + "</tspan> and " + "<tspan font-weight='bold'>" + name_from + "</tspan> are equally preferred"; }
						//if (message == 3.5){ message = "Absolutely prefer" + name_to + " over " + name_from; }
						if (message == 3.5 || message == 4){ message = "Strongly prefer <tspan font-weight='bold'>" + name_to + "</tspan> over <tspan font-weight='bold'>" + name_from + "</tspan>"; }
						//if (message == 4.5){ message = "Absolutely prefer" + name_to + " over " + name_from; }
						if (message == 4.5 || message == 5){ message = "Absolutely prefer <tspan font-weight='bold'>" + name_to + "</tspan> over <tspan font-weight='bold'>" + name_from + "</tspan>"; }
						d3.select("#regpoly").append("text").attr("id", "drag_message")
							.attr("x", svg_width/2).attr("y", 375)
							.attr("font-family", "PT Sans Narrow").attr("font-size", "18px").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
						$("#drag_message").html(message);
						return this.position;
					},
					get_dragend: function(){
						setTimeout(function(){$("#drag_message").fadeOut(500);},500);
						$("#temp_"+this.id).remove();
						$("#g_" + this.id).attr("opacity", 0.5);
						var dist = getDistance([this.x1, this.y1], [this.position[0]+handle_offset, this.position[1]+handle_offset])/this.dist_whole; // 0~1
						//console.log(Math.floor(dist*100)/100);
						//Update pairs_all
						var weight = Math.round((1+4*dist)*100)/100;
						var weight_norm = weight - 3;
						if(weight_norm >0){
							weight_norm = 1/(1 + (Math.abs(weight_norm)/2)*8);
						}
						else{
							weight_norm = 1 + (Math.abs(weight_norm)/2)*8;
						}
						for (var i=0; i<pairs_all.length;i++){
							if (pairs_all[i]["id"] == this.id){
								pairs_all[i]["weight"] = weight;
								pairs_all[i]["weight_norm"] = weight_norm;
							}
						}
						//Create 5 by 5 matrix (can consider NOF later....)
						var comp = [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]
						//Get weight from pairs_all 
						for (var i=0; i<pairs_all.length; i++){
							var idx_1 = pairs_all[i]["from"]["id"];
							var idx_2 = pairs_all[i]["to"]["id"];
							if (idx_1 == "1-1-1"){idx_1 = 0;}
							else if (idx_1 == "1-1-2"){idx_1 = 1;}
							else if (idx_1 == "1-2-1"){idx_1 = 2;}
							else if (idx_1 == "1-2-2"){idx_1 = 3;}
							else {idx_1 = 4;}
							if (idx_2 == "1-1-1"){idx_2 = 0;}
							else if (idx_2 == "1-1-2"){idx_2 = 1;}
							else if (idx_2 == "1-2-1"){idx_2 = 2;}
							else if (idx_2 == "1-2-2"){idx_2 = 3;}
							else {idx_2 = 4;}
							comp[idx_1][idx_2] = pairs_all[i]["weight_norm"];
							comp[idx_2][idx_1] = 1/(pairs_all[i]["weight_norm"]);
						}
						//console.log("-----");console.log(comp[0]);console.log(comp[1]);console.log(comp[2]);console.log(comp[3]);console.log(comp[4]);
						//Calculating the weight
						var eig = numeric.eig(comp);
						var mi = getMaxAndIndex(eig.lambda.x);
						var q = [], norm_q = [];
						for(var i = 0; i < eig.E.x.length; i++) {q.push(eig.E.x[i][mi.index]);}
						var sum = 0;
						for(var i = 0; i < q.length; i++) {sum += q[i];}
						for(var i = 0; i < q.length; i++) {norm_q.push(q[i] / sum);}
						for (var i=0 ; i<factors.length;i++){
							factors[i]["weight_norm"] = Math.round(norm_q[i]*1000)/1000;
							//console.log(factors[i]["text"] + " weight: " + factors[i]["weight_norm"]);
						}

						//Measure
						for (var i=0; i<pairs_all.length;i++){
							if (pairs_all[i]["id"] == this.id){
								dragAction.to = pairs_all[i]["weight"];
							}
						}						
						//!!! DATA !!! steps, magnitude, drags[]
						dragAction.to_time = Math.floor(Date.now() / 1000);
						dragAction.offset = Math.abs(dragAction.to - dragAction.from);
						dragAction.offset_time = dragAction.to_time - dragAction.from_time;
						var tempAction = JSON.parse(JSON.stringify(dragAction));

						if (screen_step == 2){ //c1_q1
							console.log("C1_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");
							c1_q1.steps += 1;
							c1_q1.magnitude += tempAction.offset;
							c1_q1.drags.push(tempAction);
						}
						else if (screen_step == 4){ //c1_q2
							console.log("C1_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c1_q2.steps += 1;
							c1_q2.magnitude += tempAction.offset;
							c1_q2.drags.push(tempAction);
							//Log drac action
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c1_q2.actions.push(act);
						}
						else if (screen_step == 7){ //c2_q1
							console.log("C2_Q1 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c2_q1.steps += 1;
							c2_q1.magnitude += tempAction.offset;
							c2_q1.drags.push(tempAction);
						}
						else{
							console.log("C2_Q2 UPDATE - STESP, MAGNITUDE ++ DRAG ACTION UPDATED");	
							c2_q2.steps += 1;
							c2_q2.magnitude += tempAction.offset;
							c2_q2.drags.push(tempAction);
							//Log drac action
							var act = {do: "drag", t: Math.floor(Date.now() / 1000)};
							c2_q2.actions.push(act);							
						}
						//Update locations accordingly
						UpdateLocation();						
					},					
					set: function(p){
						this.position = p;
					},
				};
				var drag = d3.behavior.drag()  // capture mouse drag event
					.on('dragstart', function(){
						c6_drag.get_dragstart();
					})
					.on('drag', function(){
						//Set position while drag
						c6_drag.set([d3.event.x, d3.event.y]);
						//Get position
						d3.select("#handle_"+id_temp)//Update 1. handle position
							.attr("transform", "translate(" + c6_drag.get_drag() + ")");
					})
					.on('dragend', function(){
						c6_drag.get_dragend();
					});
				loop_temp++;
				// Add drag handlers
				if (loop_temp < ids.length){
					readHandles();
				}
			}, 5)
		}
		readHandles();
		//Draw message
	}
	else{
		$("#controller_message").empty();
		$("#controller_message").append("Please select at least two factors.");
	}	
}


/*---------------------------
 Sub-functions
---------------------------*/
function ang_transform (num){
	var value = num - 90;
	if (value < 0){
		value += 360;
	}
	return value;
}

function ang_inv_trans(num){
	var value = num + 90;
	if (value > 360){
		value -= 360;
	}
	return value;
}

function setSafetyAreas(id){
	var current = pie_handles[id]["angle"];
	var bound_left = 0;
	var bound_right = 0;
	var buffer = 2;
	var id_left = pie_handles[id]["prev"];
	var id_right = pie_handles[id]["next"];
	var areas = [];

	for (var i=0 ; i<pie_handles.length ; i++){
		if (pie_handles[i]["next"] == id_left){
			bound_left = pie_handles[i]["angle"];
		}
		if (pie_handles[i]["prev"] == id_right){
			bound_right = pie_handles[i]["angle"];
		}
	}
	
	if (current > bound_left + buffer){
		areas.push([bound_left + buffer, current]);
	}
	if (current < bound_left + buffer){
		areas.push([bound_left + buffer, 360]);
		areas.push([0, current]);
	}
	if (current < bound_right - buffer){
		areas.push([current, bound_right-buffer]);
	}
	if (current > bound_right - buffer){
		areas.push([current, 360]);
		areas.push([0, bound_right-buffer]);
	}
	return areas;
}

function getPieProportion(start, end){
	var proportion = 0;
	if (start < end){
		proportion = ((end-start)/360)*100;
		proportion = Math.round(proportion*10)/10;
	}
	else if (start == end){
		proportion = 0;
	}
	else {
		proportion = ((360-start+end)/360)*100;
		proportion = Math.round(proportion*10)/10;
	}
	return proportion;
}

function getDistance(start, end){
	//Start: [x,y], end: [x,y]
	//console.log("----");
	//console.log(start);
	//console.log(end);
	var dist = Math.sqrt(Math.pow(start[0]-end[0], 2) + Math.pow(start[1]-end[1], 2));
	//console.log(dist)
	//console.log("----");	
	return dist;
}
//handles: array that stores every handle in radar
//r_bg_lines: array that stores every circles (from the origin) in radar
//r_bg_lines: array that stores every circles (from the origin) in radar
function getPolypoints(handles){
	var points = [];
	for (var i=0; i<handles.length; i++){
		var weight = handles[i]["weight"];
		var step = (weight-1)*2+1
		r_init = step * 17; // convert actual weight to position
		var dest = [r_init * Math.cos(ang_transform(handles[i]["angle"])/180*Math.PI), r_init * Math.sin(ang_transform(handles[i]["angle"])/180*Math.PI)];
		points.push(dest);
	}
	return points;
}

function WeightToHandle(number){
	switch (number){
		case 9: return 1;
		case 7: return 1.5;
		case 5: return 2;
		case 3: return 2.5;
		case 1: return 3;
		case -3: return 3.5;
		case -5: return 4;
		case -7: return 4.5;
		case -9: return 5;
		default: console.log("Error: wrong weight"); break;

	}
}
/*
function WeightToHandle_c6(number){
	switch (number){
		case 9: return 0.1;
		case 7: return 0.2;
		case 5: return 0.3;
		case 3: return 0.4;
		case 1: return 0.5;
		case -3: return 0.6;
		case -5: return 0.7;
		case -7: return 0.8;
		case -9: return 0.9;
		default: console.log("Error: wrong weight"); break;
	}
}

function HandleToWeight(number){
	var weight = [9, 7, 5, 3, 1, -3, -5, -7, -9];
	return weight[(number-1)*2];
}

function HandleToWeight_c6(number){
	var weight = [9, 7, 5, 3, 1, -3, -5, -7, -9];
	return weight[number*10-1];
}*/

function getNOF(){
	NOF = 0;
	for (var i=0; i<factors.length; i++){
		if (factors[i]["is_set"] == true){
			NOF++
		}
	}
	return NOF;
}

function getAngleBetweenTwo(start, end){
	if (start > end){ return (360-start+end);}
	else return end-start;
}


function closestPoint(pathNode, point) {
	var pathLength = pathNode.getTotalLength(),
		precision = 8,
		best,
		bestLength,
		bestDistance = Infinity;

	// linear scan for coarse approximation
	for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
		if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
		  best = scan, bestLength = scanLength, bestDistance = scanDistance;
		}
	}

	// binary search for precise estimate
	precision /= 2;
	while (precision > 0.5) {
		var before, after, beforeLength, afterLength, beforeDistance, afterDistance;
		if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
			best = before, bestLength = beforeLength, bestDistance = beforeDistance;
		} 
		else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
			best = after, bestLength = afterLength, bestDistance = afterDistance;
		} 
		else {
			precision /= 2;
		}
	}

	best = [best.x, best.y];
	best.distance = Math.sqrt(bestDistance);
	return best;

	function distance2(p) {
		var dx = p.x - point[0],
		dy = p.y - point[1];
		return dx * dx + dy * dy;
	}
}

function getMaxAndIndex(arr) {
	var max = -Number.MAX_VALUE;
	var index = -1;

	for(var i = 0; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i];
			index = i;
		}
	}
	return {max:max, index:index};
}

function b_sort(values) {
	var length = values.length - 1;
	do {
		var swapped = false;
		for(var i = 0; i < length; ++i) {
			if (values[i]["score"] < values[i+1]["score"]) {
				var temp = values[i];
				values[i] = values[i+1];
				values[i+1] = temp;
				swapped = true;
			}
		}
	}
	while(swapped == true)
};

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}