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

//TO JY: add html_login_2 and html_login_4 here

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