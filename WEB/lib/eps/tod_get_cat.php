<?php 

    include 'include.php';

    $catagories = array("Restaurant", "Cafe", "Travel Attractions", "Shopping", "Night Life");

    // $rest = array();
    // $cafe = array();
    // $travel = array();
    // $shop = array();
    // $night = array();

    $cat_array = array();

    for($i = 0; $i<5; $i++){
        $tempArr["cat_name"] = $catagories[$i];
        $tempArr["cat_id"] = $i + 1;
        $tempArr["cat_sub"] = array();

        $cat_array[$i] = $tempArr;

    }


    $SQLquery = 'SELECT * FROM traffigram_cat';

    try{
        $result = $conn->query($SQLquery);
        $rows = $result->fetchAll(PDO::FETCH_ASSOC);

        // for row in res
        foreach($rows as $row){

            $info_array["cat_name"] = $row["cat_name"];
            $info_array["cat_id"] = $row["cat_id"];
            $info_array["cat_num"] = $row["cat_num"];
            $info_array["cat_img"] = $row["cat_img"];

            $main_id = $info_array["cat_id"];

            $cat_array[$main_id-1]["cat_sub"][] = $info_array;
        }

        $return["cat"] = $cat_array;

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);
	
    $conn = null;
	

?>
