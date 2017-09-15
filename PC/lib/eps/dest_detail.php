<?php 

	include 'include.php';

	$dest_id = $_POST["dest_id"];

	$SQLquery = 'SELECT * FROM traffigram_dest WHERE 	dest_id="'.$dest_id.'"';

	try{

        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);

	    $loc["id"] = $res["id"];
	    $loc["dest_id"] = $res["dest_id"];
	    $loc["dest_price_range"] = $res["dest_price_range"];
	    $loc["dest_price"] = $res["dest_price"];
	    $loc["dest_rating"] = $res["dest_rating"];
	    $loc["dest_rating_cnt"] = $res["dest_rating_cnt"];
	    $loc["dest_url_mobile"] = $res["dest_url_mobile"];
	    $loc["dest_url"] = $res["dest_url"];
	    $loc["dest_name"] = $res["dest_name"];
	    $loc["dest_cat"] = $res["dest_cat"];
	    $loc["dest_cats"] = $res["dest_cats"];
	    $loc["dest_cat_id"] = $res["dest_cat_id"];
	    $loc["dest_info_phone"] = $res["dest_info_phone"];
	    $loc["dest_info_address"] = $res["dest_info_address"];
	    $loc["dest_info_city"] = $res["dest_info_city"];
	    $loc["dest_info_zip"] = $res["dest_info_zip"];
	    $loc["dest_lat"] = $res["dest_loc_lat"];
	    $loc["dest_lng"] = $res["dest_loc_lng"];
	    $loc["dest_imgs"] = $res["dest_imgs"];
	    $loc["dest_highlights"] = $res["dest_highlights"];
	    $loc["dest_fullrev"] = $res["dest_fullrev"];
	    $loc["dest_hours"] = $res["dest_hrs"];

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
	    $loc = false;
	}

	$return["detail"] = $loc;

    echo json_encode($return);

    $conn = null;


?>