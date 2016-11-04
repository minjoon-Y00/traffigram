/*----------------------------------------------------------------
/ Developer : Sungsoo (Ray) Hong
/ Project : CHI16 study 1
----------------------------------------------------------------*/

// Subject related information
var s = { s_id:"", s_complete:"", s_code:"", t_start:0, t_end:0, t_dur:0, s_c1:"", s_c2:"" };
var screen_step = 0;
//Data for location
var locations = [];
var locations_bound = [
	{min:10000000, max:0}, 
	{min:10000000, max:0},
	{min:10000000, max:0},
	{min:10000000, max:0},
	{min:10000000, max:0}]

// Variables related to user performance
var c1_q1 = {
	t_start:0, t_end:0, t_dur:0, //start time / end time / duration
	steps:0, //Total steps to move handles
	magnitude:0, //Total amount of movements
	weights:[0,0,0,0,0], //Final weight
	drags:[] //Drag actions - check "dragAction" for detailed structure
};

var c1_q2 = {
	t_start:0, t_end:0, t_dur:0, //start time / end time / duration
	steps:0, //Total steps to move handles
	magnitude:0, //Total amount of movements
	scroll_dur:0, //How long
	scroll_num:0, //How many of scrolls
	locations:[], //Locations that a user clicked - check "locations" for detailed structure
	weights:[0,0,0,0,0], //Final weight
	drags:[], //Drag actions - check "dragAction" for detailed structure
	actions:[]
};

var c2_q1 = {
	t_start:0, t_end:0, t_dur:0, //start time / end time / duration
	steps:0, //Total steps to move handles
	magnitude:0, //Total amount of movements
	weights:[0,0,0,0,0], //Final weight
	drags:[] //Drag actions - check "dragAction" for detailed structure
};

var c2_q2 = {
	t_start:0, t_end:0, t_dur:0, //start time / end time / duration
	steps:0, //Total steps to move handles
	magnitude:0, //Total amount of movements
	scroll_dur:0, //How long
	scroll_num:0, //How many of scrolls
	locations:[], //Locations that a user clicked. Include rank and score.
	weights:[0,0,0,0,0], //Final weight
	drags:[], //Detailed actions
	actions:[]	
};

var c1_answer = {q1:false, q2:false, q3:"", q3_weight:[]};
var c2_answer = {q1:false, q2:false, q3:"", q3_weight:[]};

var script_intro = [
	"Thank you for participating in the study. </br>"
	+ " <p>The purpose of this study is to test different user interfaces designed for <span class='stress'> supporting people who consider multiple aspects when choosing their travel destination</span>."
	+ " In the course of the study you will experience <span class='stress'>two scenarios</span> with different types of interfaces. We will give you specific instructions to accomplish each scenario.</p>"
	+ " <p> In order to collect your payment, you need to copy and paste <span class='stress'>the code</span> to AMT. The code will be issued at the end of the study."
	+ " We expect the study will take more than at least <span class='stress'> 5 minutes,</span> but <span class='stress'>no longer than 10 minutes</span>. After finishing the study, you will receive a payment of $1. Once you press 'Okay' button at the below, you will need to accomplishs the study within approximately <span class='stress'>20 minutes</span>, as the system will invalidate your code afterwards."
	+ " This study is being conducted by Ph.D. students Ray Hong and Rafal Kocielnik of the University of Washington. In case of any questions or concerns, please contact the principal investigator, Ray Hong, at <span class='stress'>rayhong@uw.edu</span>.</p>"
	+ " Again, we wish to thank you for the support ant help!"
];
var script_outro = [
	"Thank you for finishing every task. </br>"
	+ "Message here will include 1) Briefly describe the next step 2) Present some necessary information if there is any. 3) Press okay will let user jump into a survey link"
];

var script_scenarios_1 = [
	"You are <span class='stress'>celebrating five-year anniversary with your partner</span> this Saturday. Your partner particularly likes French cuisine, so you would like to find a French restaurant appropriate for the occasion."
	+ " When you make your decision, you can consider the following <span class='stress'>five dimensions</span>:"
	+ " <div style = 'margin-top:3px;margin-bottom:-2px'><img src='img/factors.png'/></div>"
	+ " Before you actually start exploring the restaurants, we would like to learn your preference for the five dimensions in this scenario."
	,  " You are going to have an <span class='stress'>important meeting with your business partner</span>. Your business partner particularly likes French cuisine, so you would like to find a French restaurant."
	+ " When you make your decision, you can consider the following <span class='stress'>five dimensions</span>:"
	+ " <div style = 'margin-top:3px;margin-bottom:-2px'><img src='img/factors.png'/></div>"
	+ " Before you actually start exploring the restaurants, we would like to learn your preference for the five dimensions in this scenario."
];

var script_scenarios_1_inst = [
	" Please <span class='stress'>set the degree of importance</span> of each of the 5 dimensions.",
	" Presented pairs will help you to set your preference between different dimensions. For each pair, please <span class='stress'>set the degree of your preference </span>, if necessary."
]

var script_notice = [
	" We will reset the weights you set and present you <span class='stress'>a list of restaurants</span> on the right side of your screen."
	+ " As you <span class='stress'>adjust the weight</span> of the dimensions on the left side, the <span class='stress'>order</span> of locations in the right side will be changed to reflect your weights."
	+ " A location placed on top of the list may fit your preferences more than the ones below. This adjustments may help you find your final destination easier.</br>"
	+ " Please set the weights to choose <span class='stress'> one destination </span> and <span class='stress'>click it</span> to indicate that the location is your final destination."
	+ " </br>Here's the full scenario:</br>"
	+ "You are <span class='stress'>celebrating five-year anniversary with your partner</span> this Saturday. Your partner particularly likes French cuisine, so you would like to find a French restaurant appropriate for the occasion. "
	+ " You already filtered out irrelevant restaurants, which left you with <span class='stress'>374 restaurants to choose from</span>." 
	+ " Please consider the following <span class='stress'>five dimensions</span> to make your choice:<div style = 'margin-top:3px;margin-bottom:-2px'><img src='img/factors.png'/></div>"	
	+ " Please <span class='stress'>consider your decision carefully</span>, as we will ask percise questions regarding the dimensinos you set and the destination you chose afterwards."
	,
	" We will reset the weights you set and present you <span class='stress'>a list of restaurants</span> on the right side of your screen."
	+ " As you <span class='stress'>adjust the weight</span> of the dimensions on the left side, the <span class='stress'>order</span> of locations in the right side will be changed to reflect your weights."
	+ " A location placed on top of the list may fit your preferences more than the ones below. This adjustments may help you find your final destination easier.</br>"
	+ " Please set the weights to <span class='stress'> one destination </span> and <span class='stress'>click it</span> to indicate that the location is your final destination."
	+ " </br>Here's more specific occasion:</br>"
 	+ " You are going to have an <span class='stress'>important meeting with your business partner</span>. Your business partner particularly likes French cuisine, so you would like to find a French restaurant."
	+ " Your company has criteria that an employee needs to consider in such occasion. You already filtered out irrelevant locations, which left you with <span class='stress'>374 restaurants</span> to choose from." 
	+ " Please consider the following <span class='stress'>five dimensions</span> to make your choice:<div style = 'margin-top:3px;margin-bottom:-2px'><img src='img/factors.png'/></div>"
	+ " Please <span class='stress'>consider your decision carefully</span>, as we will ask percise questions regarding the dimensinos you set and the destination you chose afterwards."	
];

var script_scenarios = [
	"You are <span class='stress'>celebrating five-year anniversary with your partner</span> this Saturday. Your partner particularly likes French cuisine, so you would like to find a French restaurant appropriate for the occasion."
	+ " You already filtered out irrelevant restaurants, which left you with <span class='stress'>374 restaurants to choose from</span>." 
	+ " Please consider the following <span class='stress'>five dimensions</span> to make your choice:<div style = 'margin-top:3px;margin-bottom:-2px'><img src='img/factors.png'/></div>"
	+ " Please choose <span class='stress'> one destination </span> and <span class='stress'>click it</span> to indicate that the location is your final destination."
	+ " As you <span class='stress'>adjust the weight</span> of the dimensions on the left side, the <span class='stress'>order</span> of locations in the right side will be changed to reflect your weights."
	+ " A location placed on top of the list may fit your preferences more than the ones below. This adjustments may help you find your final destination easier."
	, " You are going to have an <span class='stress'>important meeting with your business partner</span>. Your business partner particularly likes French cuisine, so you would like to find a French restaurant."
	+ " Your company has criteria that an employee needs to consider in such occasion. You already filtered out irrelevant locations, which left you with <span class='stress'>374 restaurants</span> to choose from." 
	+ " Please consider the following <span class='stress'>five dimensions</span> to make your choice:<div style = 'margin-top:3px;margin-bottom:-2px'><img src='img/factors.png'/></div>"
	+ " Please choose <span class='stress'> one destination </span> and <span class='stress'>click it</span> to indicate that the location is your final destination."
	+ " As you <span class='stress'>adjust the weight</span> of the dimensions on the left side, the <span class='stress'>order</span> of locations in the right side will be changed to reflect your weights."
	+ " A location placed on top of the list may fit your preferences more than the ones below. This adjustments may help you find your final destination easier."	
];

var loc_table_str = "";
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


//var server_path = "/CSLabeling/lib/";
//Data that is used to store drag information
var dragAction = {
	from:0,
	to:0,
	from_time:0,
	to_time:0,
	offset:0,
	offset_time:0,
	which:""
};
var server_path = "/public_html/S2/";
var doOnce = false;
var isLocSelected = false;
var canMeasureScrollDur = true;
var canMeasureScrollNum = true;
var timer_scroll;