<?php

        include 'include.php';

        $dest_name = $_POST["dest_name"];
	$dest_loc_lng = $_POST["dest_loc_lng"];
	$dest_loc_lat = $_POST["dest_loc_lat"];


        $SQLquery = 'SELECT * FROM traffigram_dest WHERE dest_name="'.$dest_name.'" AND dest_loc_lng='.$dest_loc_lng.' AND dest_loc_lat='.$dest_loc_lat;

        try{

        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);

        $return["id"] = $res["id"];
        $return["dest_id"] = $res["dest_id"];
        $returm["dest_price_range"] = $res["dest_price_range"];
        $return["dest_price"] = $res["dest_price"];
        $return["dest_rating"] = $res["dest_rating"];
        $return["dest_rating_cnt"] = $res["dest_rating_cnt"];
        $return["dest_url_mobile"] = $res["dest_url_mobile"];
        $return["dest_url"] = $res["dest_url"];
        $return["dest_name"] = $res["dest_name"];
        $return["dest_cat"] = $res["dest_cat"];
        $return["dest_cats"] = $res["dest_cats"];
        $return["dest_cat_id"] = $res["dest_cat_id"];
        $return["dest_info_phone"] = $res["dest_info_phone"];
        $return["dest_info_address"] = $res["dest_info_address"];
        $return["dest_info_city"] = $res["dest_info_city"];
        $return["dest_info_zip"] = $res["dest_info_zip"];
        $return["dest_lat"] = $res["dest_loc_lat"];
        $return["dest_lng"] = $res["dest_loc_lng"];
        $return["dest_imgs"] = $res["dest_imgs"];
        $return["dest_highlights"] = $res["dest_highlights"];
        $return["dest_fullrev"] = $res["dest_fullrev"];
        $return["dest_hours"] = $res["dest_hrs"];

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
            $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;


?>                                                                                                                  
                     


