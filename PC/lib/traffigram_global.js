//Convert mulrtiple lines of code to 
function hereDoc(f) {return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');}


var html_login1 = hereDoc(function(){/*!
<div id="login1">
	<div class="content_paragraph">
		<div style="font-size:120px">&nbsp;</div>
		<img src="img/image_login_welcome.png"/>
	</div>
	<div class="content_paragraph" style="font-size:32px;">
		Find your destination </br>
		<span style="font-weight:300"> at a glance </span>
	</div>
	<div class="content_paragraph" style="font-size:20px; font-weight:400;">
		Project T, 2017
	</div>
	<div style="font-size:30px">&nbsp;</div>
	<div class="content_paragraph">
		<span class="content_btn" id="login1_btn_signup"> <img src="img/btnicon_signup@2x.png"/> SIGN UP </span>
		<span class="content_btn" id="login1_btn_signin"> <img src="img/btnicon_signin@2x.png"/> SIGN IN </span>
	</div>
</div>
*/});

//html_login_2: Sign up
var html_login2 = hereDoc(function(){/*!
 <div id="login2">
	<div class="content_paragraph">
		<div style="font-size:120px">&nbsp;</div>
		<img src="img/image_login_welcome.png"/>
	</div>
	<div class="content_paragraph" style="font-size:32px;">
		Find your destination </br>
		<span style="font-weight:300"> at a glance </span>
	</div>
	 <div class="content_paragraph">
		 <div> <input type="text" id="login2_input_email" class= "input_text_underline" name="user_id" placeholder="Your e-mail address*"/></div>
		 <div> <input type="text" id="login2_input_name" class= "input_text_underline" name="user_name" placeholder="Your name*"/></div>
 		 <div> <input type="password" id="login2_input_pw" class= "input_text_underline" name="user_pw" placeholder="Create a password*"/></div>
 		 <div> <input type="password" id="login2_input_pw_confirm" class= "input_text_underline" name="user_pw_confirm" placeholder="Confirm a password*"/></div>
	 </div>
	 <div class="content_message">&nbsp;</div>
	 <div class="content_paragraph">
		 <span class="content_btn_disabled" id="login2_btn_signin"> <img src="img/btnicon_signin@2x.png"/> NEXT </span>
		 <span class="content_btn" id="login2_btn_cancel"> <img src="img/btnicon_cancel@2x.png"/> CANCEL </span>
	 </div>
 </div>
*/});

//html_login4: Sign-up (continue)
var html_login4 = hereDoc(function(){/*!
 <div id="login4">
	<div class="content_paragraph">
		<div style="font-size:120px">&nbsp;</div>
		<img src="img/image_login_welcome.png"/>
	</div>
	<div class="content_paragraph" style="font-size:32px;">
		Find your destination </br>
		<span style="font-weight:300"> at a glance </span>
	</div>
 	<div class="content_paragraph">
 		<div> <input type="text" id="login4_input_home_addr" class= "input_text_underline" name="user_home_addr" placeholder="Your home address"/></div>
 		<div style="display:inline-box; width: 400px;text-align: left;margin:auto;"> <input type="checkbox" id="login4_checkbox_home_addr" name="checkbox_home_addr" style="padding:10px;-ms-transform: scale(2);-moz-transform: scale(2);-webkit-transform: scale(2);-o-transform: scale(2);padding: 10px;font-size:16px;"> Do not want to specify</div>
 		<div> <input type="text" id="login4_input_office_addr" class= "input_text_underline" name="user_office_addr" placeholder="Your office address"/></div>
 		<div style="display:inline-box; width: 400px;text-align: left;margin:auto;"> <input type="checkbox" id="login4_checkbox_office_addr" name="checkbox_office_addr" style="padding:10px;-ms-transform: scale(2);-moz-transform: scale(2);-webkit-transform: scale(2);-o-transform: scale(2);padding: 10px;font-size:16px;"> Do not want to specify</div>
 	</div>
 	<div class="content_message">&nbsp;</div>
 	<div class="content_paragraph">
 		<span class="content_btn_disabled" id="login4_btn_submit"> YOU'RE ALL SET! </span>
 	</div>
 </div>
*/});

var html_login6 = hereDoc(function(){/*!
<div style="position:fixed;width:100%;height:100%;top:0;left:0;background-color:rgba(0,0,0,0.5);z-index:100;">
<div style="text-align:center;z-index: 101;background-color: white; position:fixed; width:90%; max-width:720px; padding: 20px 10px;height: auto;top:50%;left:50%;transform:translate(-50%, -50%);">
<h2 style="margin:0">SIGN-UP SUCCESSFUL</h2>
<p id="welcome_message"></p>
<span class="content_btn" id="login6_btn_continue"> <img src="img/btnicon_check@2x.png"/> CONTINUE </span>
</div>
</div>
*/});

var html_login7 = hereDoc(function(){/*!
<div id="login7">
	<div class="content_paragraph">
		<div style="font-size:120px">&nbsp;</div>
		<img src="img/image_login_welcome.png"/>
	</div>
	<div class="content_paragraph" style="font-size:32px;">
		Find your destination </br>
		<span style="font-weight:300"> at a glance </span>
	</div>
	<div style="font-size:10px">&nbsp;</div>
	<div class="content_paragraph">
		<div> <input type="text" id="input_email" class= "input_text_underline" name="user_id" placeholder="Your e-mail address"/></div>
		<div> <input type="password" id="input_pw" class= "input_text_underline" name="user_pw" placeholder="Your password"/></div>					
	</div>
	<div class="content_message">&nbsp;</div>
	<div class="content_paragraph">
		<span class="content_btn_disabled" id="login7_btn_signin"> <img src="img/btnicon_signin@2x.png"/> SIGN IN </span>
		<span class="content_btn" id="login7_btn_cancel"> <img src="img/btnicon_cancel@2x.png"/> CANCEL </span>
	</div>
</div>
*/});

var html_TOD = hereDoc(function(){/*!
<div class="content_main_heading_TOD"></div>
<div class="content_main_textarea_TOD"></div>

<!--<div id="content_container_TOD"></div>-->
*/});

var html_popup = hereDoc(function(){/*!
<div id="popup_blacklayer">
<div id="popup">
	<div id="popup_inside">
		<div id="popup_heading"><div id="popup_close"><img src="img/window_close.png"/></div>
		</div>
		<div id="popup_content"></div>
	</div>
</div>
*/});

var html_popup_TOT = hereDoc(function(){/*!
<div class="content_main_textarea">	
	<div class="content_main_paragraph">
		<div class="content_main_heading_content">
			Tip: time map will present travel times to destinations  based on the mode of transportation you set.
			</br>
			<div style="margin-top:30px;">
				<div class="radio_each_line"><label><input class="radio_big" type="radio" name="TOT" value="0" id="TOT_0">&nbsp;&nbsp;Vehicle</label></div>
				<div class="radio_each_line"><label><input class="radio_big" type="radio" name="TOT" value="1" id="TOT_1">&nbsp;&nbsp;Bicycle</label></div>
				<div class="radio_each_line"><label><input class="radio_big" type="radio" name="TOT" value="2" id="TOT_2">&nbsp;&nbsp;On foot</label></div>
			</div>
			</br>
			<div class="content_paragraph">
				<span class="content_btn" id="popup_TOT_btn_okay"> <img src="img/btnicon_check@2x.png"/> OKAY </span>
				<span class="content_btn" id="popup_TOT_btn_cancel"> <img src="img/btnicon_cancel@2x.png"/> CANCEL </span>	
			</div>
		</div>
	</div>
</div>
*/});

var html_popup_SignOut = hereDoc(function(){/*!
<div class="content_main_textarea">	
	<div class="content_main_paragraph">
		<div class="content_main_heading_content"> 
			You are logged in as <span id='your_id'> </span>. Will you proceed signing out?
 		</div>
		<div class = "content_main_buttonline"> 
			<span class="content_btn" id="popup_signout_okay"> OKAY </span> 
			<span class="content_btn" id="popup_signout_cancel"> CANCEL </span> 
		</div>
 	</div>
 </div>
*/});

var html_settings = hereDoc(function(){/*!
<div class="content_main_heading" id="setting_heading">
		<img src="img/headericon_settings.png"/> Settings <div class="content_main_heading_close" style="vertical-align:middle;"><span style="margin-right: -12px">Close</span><img src="img/window_close.png"/></div>
</div>
<div class="content_main_textarea">
	<div class="content_main_paragraph">
		<div class="content_main_heading_subject">PRESENT TIME MAPS FROM</div>
		<div class="content_main_heading_content">Tip: time map will present travel time to destinations based on the following departure point.</div>
		<div style="margin-top:30px;">
			<div class="radio_each_line"><label><input class="radio_big" type="radio" name="originType" value="0" id="origin_0">&nbsp;&nbsp;Your current GPS location</label></div>
			<div class="radio_each_line"><label><input class="radio_big" type="radio" name="originType" value="1" id="origin_1">&nbsp;&nbsp;Your home</label></div>
			<div class="radio_each_line"><label><input class="radio_big" type="radio" name="originType" value="2" id="origin_2">&nbsp;&nbsp;Your office</label></div>
		</div>
		<div class = "content_main_buttonline"> <span class="content_btn_disabled" id="set_originType"> RESET </span> </div>
	</div>
	<div class="content_main_paragraph">
		<div class="content_main_heading_subject">YOUR PERSONAL INFORMATION</div>
		<div style="margin-top:30px;">
			<div><img src="img/icon_home@2x.png"/><input type="text" id="user_address_home" class= "input_text_underline" name="user_address_home" placeholder=""/></div>
			<div><img src="img/icon_office@2x.png"/><input type="text" id="user_address_office" class= "input_text_underline" name="user_address_office" placeholder=""/></div>
		</div>
		<div class = "content_main_buttonline"> <span class="content_btn_disabled" id="set_addresses"> RESET </span> </div>
	</div>
</div>
<!--</div>-->
*/});

var html_filter = hereDoc(function(){/*!
<div id="content_main_filterarea"></div>
<!--</div>-->

*/});

var html_list = hereDoc(function(){/*!
<div class="content_main_heading">
		<span id = "currentTOD">
</div>
<div class="content_main_textarea_list">
</div>
*/});

var html_detail = hereDoc(function(){/*!
<div class="content_main_heading">
		<span id="dest_name"></span><div class="content_main_heading_close" style="vertical-align:middle;"><span style="margin-right: -12px">Close</span><img src="img/window_close.png"/></div>
</div>
<div class="content_main_textarea_detail">
	<div class="content_main_paragraph">
		<div class="content_main_heading_subject"><span id="dest_name_title"></span></div>
		<div class="content_main_heading_content" id="detail_basic1">
			<!--dest_price_range dest_price dest_rating dest_rating_cnt dest_name dest_cat dest_cats-->
		</div>

		<div class="content_main_heading_content" id="detail_basic2">
			<!--dest_info_phone dest_info_address-->
		</div>
	</div>

	<div class="content_main_paragraph">
		<div class="content_main_heading_content" id="detail_img">
			<!--dest_imgs-->
		</div>
	</div>

	<div class="content_main_paragraph">
		<div class="content_main_heading_subject">HIGHLIGHTS</div>
		<div class="content_main_heading_content" id="detail_highlights">
			<!--dest_highlights-->
		</div>
	</div>

	<div class="content_main_paragraph">
		<div class="content_main_heading_subject">FULL REVIEWS</div>
		<div class="content_main_heading_content" id="detail_review">
			<!--dest_fullrev-->
		</div>
	</div>	
</div>
*/});
var html_main_PC = hereDoc(function(){/*!
<div id="header">
	<div id="header_inside"> 
		<div id="header_inside_left"><img src="img/image_main_logo.png" style="height:40px"/>&nbsp;Crossroads</span></div>
		<div id="header_inside_right">Howdy, <span id="user_name" style="color:black"></span></div>
	</div>
</div>
<div id="bottom">
	<div id="bottom_inside">
		<div id="content_TOD"></div>
		<div id="content"> 
			<div id="content_map"></div>
			<div id="content_filter"></div>
		</div>
		<div id="content_list"></div>
	</div>
</div>
*/});