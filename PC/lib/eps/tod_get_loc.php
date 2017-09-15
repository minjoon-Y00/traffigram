<?php 

	include 'include.php';

    //$dest_cat_id = $_POST["dest_cat_id"];
    $dest_cat_id = $_GET["dest_cat_id"];

    $SQLquery = 'SELECT * FROM traffigram_dest WHERE dest_cat_id="'.$dest_cat_id.'"';
    //$SQLquery = 'SELECT * FROM traffigram_dest WHERE dest_cat_id="1_1"';

    $locs = array();
    $return = array();

    try{
        $result = $conn->query($SQLquery);
        $rows = $result->fetchAll(PDO::FETCH_ASSOC);

        // for row in result
        foreach($rows as $row){

            $loc["dest_id"] = $row["dest_id"];
            $loc["dest_name"] = $row["dest_name"];
            $loc["dest_rating"] = $row["dest_rating"];
            $loc["dest_rating_cnt"] = $row["dest_rating_cnt"];
            $loc["dest_cat"] = $row["dest_cat"];
            $loc["dest_cat_id"] = $row["dest_cat_id"];
            $loc["dest_price_range"] = $row["dest_price_range"];
            $loc["dest_price"] = $row["dest_price"];
            $loc["dest_hours"] = $row["dest_hrs"];
            $loc["dest_lat"] = $row["dest_loc_lat"];
            $loc["dest_lng"] = $row["dest_loc_lng"];
            $loc["dest_path"] = stripcslashes(explode("|*|", $row["dest_imgs"])[0]);
            $loc["dest_time"] = 0;

            $locs[] = $loc;
        }

        $return["loc"] = $locs;

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;
	
?>
