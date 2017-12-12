<?php


    include 'include.php';

    $filename = 'tester';
//    $filename = 'traffigram_dest';

    $fh = fopen('desserts_final.tsv','r');

    fgets($fh);
    
    while($line = fgets($fh)){ 
	
        $eline = explode("|", substr($line, 2));

    	$dest_id = $eline[0]; 
    	$dest_price_range = $eline[39];
    	$dest_price = $eline[40];
    	$dest_rating = $eline[2];
    	$dest_rating_cnt = $eline[3];
    	$dest_url_mobile = $eline[4];
    	$dest_url = $eline[5];
    	$dest_name = $eline[1];
    	$dest_cat = $eline[6];
        $dest_cats = $eline[sizeof($eline)-1];

    
    	if($dest_cat == "newamerican" or $dest_cat == "tradamerican"){$dest_cat_id = "1_1";}
    	elseif($dest_cat == "chinese"){$dest_cat_id = "1_2";}
    	elseif($dest_cat == "french"){$dest_cat_id = "1_3";}
    	elseif($dest_cat == "indpak"){$dest_cat_id = "1_4";}
    	elseif($dest_cat == "italian"){$dest_cat_id = "1_5";}
    	elseif($dest_cat == "japanese"){$dest_cat_id = "1_6";}
    	elseif($dest_cat == "mexican"){$dest_cat_id = "1_7";}
    	elseif($dest_cat == "mediterranean"){$dest_cat_id = "1_8";}
    	elseif($dest_cat == "thai"){$dest_cat_id = "1_9";}
    	elseif($dest_cat == "vegan"){$dest_cat_id = "1_10";}
    	elseif($dest_cat == "vegetarian"){$dest_cat_id = "1_11";}
    	elseif($dest_cat == "cafes" or $dest_cat == "coffee" or $dest_cat == "coffeeroasteries"){$dest_cat_id = "2_1";}
    	elseif($dest_cat == "bubbletea"){$dest_cat_id = "2_2";}
    	elseif($dest_cat == "tea"){$dest_cat_id = "2_3";}
    	elseif($dest_cat == "juicebars"){$dest_cat_id = "2_4";}
    	elseif($dest_cat == "desserts"){$dest_cat_id = "2_5";}
    	elseif($dest_cat == "icecream" or $dest_cat == "gelato"){$dest_cat_id = "2_6";}
    	elseif($dest_cat == "landmarks"){$dest_cat_id = "3_1";}
    	elseif($dest_cat == "museums"){$dest_cat_id = "3_2";}
    	elseif($dest_cat == "aquariums"){$dest_cat_id = "3_3";}
    	elseif($dest_cat == "parks"){$dest_cat_id = "3_4";}
    	elseif($dest_cat == "beaches"){$dest_cat_id = "3_5";}
    	elseif($dest_cat == "amusementparks"){$dest_cat_id = "3_6";}
    	elseif($dest_cat == "zoos"){$dest_cat_id = "3_7";}
    	elseif($dest_cat == "theater"){$dest_cat_id = "3_8";}
    	elseif($dest_cat == "artsandcrafts"){$dest_cat_id = "4_1";}
    	elseif($dest_cat == "bookstores"){$dest_cat_id = "4_2";}
    	elseif($dest_cat == "cosmetics"){$dest_cat_id = "4_3";}
    	elseif($dest_cat == "deptstores"){$dest_cat_id = "4_4";}
    	elseif($dest_cat == "drugstores"){$dest_cat_id = "4_5";}
    	elseif($dest_cat == "electronics"){$dest_cat_id = "4_6";}
    	elseif($dest_cat == "fashion" or $dest_cat == "jewelry"){$dest_cat_id = "4_7";}
    	elseif($dest_cat == "grocery"){$dest_cat_id = "4_8";}
    	elseif($dest_cat == "bars"){$dest_cat_id = "5_1";}
    	elseif($dest_cat == "beergardens"){$dest_cat_id = "5_2";}
    	elseif($dest_cat == "jazzandblues"){$dest_cat_id = "5_3";}
    	elseif($dest_cat == "karaoke"){$dest_cat_id = "5_4";}
    	elseif($dest_cat == "comedyclubs"){$dest_cat_id = "5_5";}
    	elseif($dest_cat == "musicvenues"){$dest_cat_id = "5_6";}
    	elseif($dest_cat == "danceclubs"){$dest_cat_id = "5_7";}
    	$dest_info_phone = $eline[7]; 
    	$dest_info_address = $eline[8];
    	$dest_info_city = $eline[9];
    	$dest_info_zip = $eline[10];
    	$dest_loc_lat = $eline[12];
    	$dest_loc_lng = $eline[13];
    	$dest_imgs = $eline[14]."|*|".$eline[15]."|*|".$eline[16]."|*|".$eline[17]."|*|".$eline[18];
    	$dest_highlights = $eline[19]."||".$eline[20]."|*|".$eline[21]."||".$eline[22]."|*|".$eline[23]."||".$eline[24];
    	$dest_fullrev = $eline[25]."||".$eline[27]."||".$eline[28]."||".$eline[29]."||".$eline[30]."|*|".$eline[32]."||".$eline[34]."||".$eline[35]."||".$eline[36]."||".$eline[37];

    	$hrs = array();

    	for($i = 0; $i < 7; $i++){
	    $oneDay = $eline[41+$i];

            if($oneDay == "N/A"){
	        $hrs[] = "N/A||N/A|*|";
            } elseif($oneDay == "Closed"){
	        $hrs[] = "Closed||Closed|*|";
	    } else {
	        $oneDayArray = explode(" - ", $oneDay);
	        $hrs[] = $oneDayArray[0];
	        $hrs[] = "||";
	        $hrs[] = $oneDayArray[1];
	        $hrs[] = "|*|";
            }


        }

        $dest_hrs = implode($hrs);
 
        $SQLquery = 'INSERT INTO '.$filename.' (dest_id, dest_price_range, dest_price, dest_rating, dest_rating_cnt, dest_url_mobile, dest_url, dest_name, dest_cat, dest_cats, dest_cat_id, dest_info_phone, dest_info_address, dest_info_city, dest_info_zip, dest_loc_lat, dest_loc_lng, dest_imgs, dest_highlights, dest_fullrev, dest_hrs) VALUES ("'.$dest_id.'","'.$dest_price_range.'","'.$dest_price.'",'.$dest_rating.','.$dest_rating_cnt.',"'.$dest_url_mobile.'","'.$dest_url.'","'.$dest_name.'","'.$dest_cat.'","'.$dest_cats.'","'.$dest_cat_id.'","'.$dest_info_phone.'","'.$dest_info_address.'","'.$dest_info_city.'","'.$dest_info_zip.'",'.$dest_loc_lat.','.$dest_loc_lng.',"'.$dest_imgs.'","'.$dest_highlights.'","'.$dest_fullrev.'","'.$dest_hrs.'")';


 
        //echo $SQLquery;

        try {
            $conn->exec($SQLquery);
            echo $dest_id."|";
        } catch(PDOException $e){
            echo "Error for: ".$dest_id;
	    echo $SQLquery . "<br" . $e->getMessage();
        }

    }

    $conn = null;

    fclose($fh);

?>
