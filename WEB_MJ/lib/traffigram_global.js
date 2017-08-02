//Convert mulrtiple lines of code to 
function hereDoc(f) {return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');}


var html_login1 = hereDoc(function(){/*!
<div id="login1">
	<div class="content_paragraph">
		<div style="font-size:130px">&nbsp;</div>
		<img src="img/image_login_welcome@2x.png"/>
	</div>
	<div class="content_paragraph" style="font-size:48px;">
		Find your destination </br>
		<span class="stress"> at a glance </span>
	</div>
	<div class="content_paragraph" style="font-size:24px; font-weight:400;">
		Project T, 2017
	</div>
	<div style="font-size:80px">&nbsp;</div>
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
		 <div style="font-size:130px">&nbsp;</div>
		 <img src="img/image_login_welcome@2x.png"/>
	 </div>
	 <div class="content_paragraph" style="font-size:48px;">
		 Find your destination </br>
		 <span class="stress"> at a glance </span>
	 </div>
	 <div style="font-size:60px">&nbsp;</div>
	 <div class="content_paragraph">
		 <div> <input type="text" id="login2_input_email" class= "input_text_underline" name="user_id" placeholder="Your e-mail address*"/></div>
		 <div> <input type="text" id="login2_input_name" class= "input_text_underline" name="user_name" placeholder="Your name*"/></div>
 		 <div> <input type="password" id="login2_input_pw" class= "input_text_underline" name="user_pw" placeholder="Create a password*"/></div>
 		 <div> <input type="password" id="login2_input_pw_confirm" class= "input_text_underline" name="user_pw_confirm" placeholder="YConfirm a password*"/></div>
	 </div>
	 <div class="content_message">&nbsp;</div>
	 <div class="content_paragraph">
		 <span class="content_btn_disabled" id="login2_btn_signin"> <img src="img/btnicon_signin@2x.png"/> NEXT </span>
		 <span class="content_btn" id="login2_btn_cancel"> <img src="img/btnicon_cancel@2x.png"/> CANCEL </span>
	 </div>
 </div>
*/});


var html_login4 = hereDoc(function(){/*!
 <div id="login4">
 	<div class="content_paragraph">
 		<div style="font-size:130px">&nbsp;</div>
 		<img src="img/image_login_welcome@2x.png"/>
 	</div>
 	<div style="font-size:60px">&nbsp;</div>
 	<div class="content_paragraph">
 		<div> <input type="text" id="login4_input_home_addr" class= "input_text_underline" name="user_home_addr" placeholder="Your home address"/></div>
 		<div style="display:inline-box; width: 600px;text-align: left;margin:auto;"> <input type="checkbox" id="login4_checkbox_home_addr" name="checkbox_home_addr" style="padding:10px;-ms-transform: scale(2);-moz-transform: scale(2);-webkit-transform: scale(2);-o-transform: scale(2);padding: 10px;font-size:16px;"> Do not want to specify</div>
 		<div> <input type="text" id="login4_input_office_addr" class= "input_text_underline" name="user_office_addr" placeholder="Your office address"/></div>
 		<div style="display:inline-box; width: 600px;text-align: left;margin:auto;"> <input type="checkbox" id="login4_checkbox_office_addr" name="checkbox_office_addr" style="padding:10px;-ms-transform: scale(2);-moz-transform: scale(2);-webkit-transform: scale(2);-o-transform: scale(2);padding: 10px;font-size:16px;"> Do not want to specify</div>
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
		<div style="font-size:130px">&nbsp;</div>
		<img src="img/image_login_welcome@2x.png"/>
	</div>
	<div class="content_paragraph" style="font-size:48px;">
		Find your destination </br>
		<span class="stress"> at a glance </span>
	</div>
	<div style="font-size:60px">&nbsp;</div>
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
<div id="content_main"></div>
*/});

var html_popup = hereDoc(function(){/*!
<div id="popup_blacklayer">
<div id="popup">
	<div id="popup_inside">
		<div id="popup_heading"><div id="popup_close"><img src="img/btn_window_close@2x.png"/></div>
		</div>
		<div id="popup_content"></div>
	</div>
</div>
*/});

var html_popup_TOT = hereDoc(function(){/*!
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
*/});