<?php 

	include 'include.php';

	$user_fav = $_POST["user_fav"];
	$fav_array = explode("|*|", $user_fav);

	$locs = array();

	foreach ($fav_array as $dest_id) {

		if(strlen($dest_id) != 0){

	    	$SQLquery = 'SELECT * FROM traffigram_dest WHERE dest_id="'.$dest_id.'"';

	    	try{

		        $result = $conn->query($SQLquery);
		        $res = $result->fetch(PDO::FETCH_ASSOC);

			    $loc["dest_id"] = $res["dest_id"];
			    $loc["dest_name"] = $res["dest_name"];
			    $loc["dest_rating"] = $res["dest_rating"];
			    $loc["dest_rating_cnt"] = $res["dest_rating_cnt"];
			    $loc["dest_cat"] = $res["dest_cat"];
			    $loc["dest_cat_id"] = $res["dest_cat_id"];
			    $loc["dest_price_range"] = $res["dest_price_range"];
			    $loc["dest_price"] = $res["dest_price"];
			    $loc["dest_hours"] = $res["dest_hrs"];
			    $loc["dest_lat"] = $res["dest_loc_lat"];
			    $loc["dest_lng"] = $res["dest_loc_lng"];
			    $loc["dest_time"] = 0;

			    $locs[] = $loc;

		    } catch(PDOException $e){
		        // echo $SQLquery . "<br" . $e->getMessage();
			    $locs[] = false;
	    	}
	    }
	}

	$return["book"] = $locs;
    echo json_encode($return);

    $conn = null;

?>