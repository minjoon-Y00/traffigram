<?php 

	include 'include.php';

	$user_id = $_POST["user_id"];
	$user_pw = $_POST["user_pw"];

	$SQLquery = 'SELECT COUNT(*), user_name, user_home, user_home_lng, user_home_lat, user_office, user_office_lng, user_office_lat, user_fav FROM traffigram_users WHERE user_id="'.$user_id.'" AND user_pw="'.$user_pw.'"';
	try{
		$result = $conn->query($SQLquery);
		$res = $result->fetch(PDO::FETCH_ASSOC);
		$rowcount = $res["COUNT(*)"];
		if($rowcount == 1){ // found user entry
			$return["res"] = true;
			$return["user_name"] = $res["user_name"];
			$return["user_home"] = $res["user_home"];
			$return["user_home_lng"] = $res["user_home_lng"];
			$return["user_home_lat"] = $res["user_home_lat"];
			$return["user_office"] = $res["user_office"];
			$return["user_office_lng"] = $res["user_office_lng"];
			$return["user_office_lat"] = $res["user_office_lat"];
			$return["user_fav"] = $res["user_fav"];
		} else { // invalid login information
			$return["res"] = false;
		}
	} catch(PDOException $e){
		$return["res"] = false;
	}
	echo json_encode($return);
	$conn = null;
?>
