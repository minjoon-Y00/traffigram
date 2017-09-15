<?php

    include 'include.php';

    $dest_name = $_POST["dest_name"];
    $dest_loc_lng = $_POST["dest_loc_lng"];
    $dest_loc_lat = $_POST["dest_loc_lat"];


    $SQLquery = 'SELECT dest_id, dest_imgs FROM traffigram_dest WHERE dest_name="'.$dest_name.'" AND dest_loc_lng='.$dest_loc_lng.' AND dest_loc_lat='.$dest_loc_lat;

    try{

        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
	
	$return["dest_id"] = $res["dest_id"];	
	$return["imgs"] = stripslashes(explode("|*|", $res["dest_imgs"])[0]);

     }catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
            $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;


?>                      


