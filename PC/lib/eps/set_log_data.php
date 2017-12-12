<?php 

    include 'include.php';

    $user_id = $_POST["user_id"];

    $user_log_json = (array) json_decode($_POST["user_log"]);

    $date = $user_log_json["date"];
    $user_log_array[0] = $date;
        
    $mode_duration = (array) $user_log_json["mode_duration"];

    $user_log_array[1] = $mode_duration["map_dc"];
    $user_log_array[2] = $mode_duration["map_wm"];
    $user_log_array[3] = $mode_duration["list"];
    $user_log_array[4] = $mode_duration["total"];
    
    $mode_frequency = (array) $user_log_json["mode_frequency"];
    $WM = (array) $mode_frequency["WM"];
    $user_log_array[5] = $WM["zoom"];
    $user_log_array[6] = $WM["pan"];
    $user_log_array[7] = $WM["search"];
    $user_log_array[8] = $WM["change_origin_by_drag"];
    $user_log_array[9] = $WM["change_origin_in_setting"];
    $user_log_array[10] = $WM["change_mode_of_transportation"];
    $user_log_array[11] = $WM["filter_by_price"];
    $user_log_array[12] = $WM["filter_by_rating"];
    $user_log_array[13] = $WM["filter_by_num_of_review"];

    $DC = (array) $mode_frequency["DC"];
    $user_log_array[14] = $DC["zoom"];
    $user_log_array[15] = $DC["pan"];
    $user_log_array[16] = $DC["search"];
    $user_log_array[17] = $DC["change_origin_by_drag"];
    $user_log_array[18] = $DC["change_origin_in_setting"];
    $user_log_array[19] = $DC["change_mode_of_transportation"];
    $user_log_array[20] = $DC["filter_by_price"];
    $user_log_array[21] = $DC["filter_by_rating"];
    $user_log_array[22] = $DC["filter_by_num_of_review"];
    $user_log_array[23] = $DC["highlight_by_isochrone_default"];
    $user_log_array[24] = $DC["highlight_by_isochrone_customized"];

    $user_log_array[25] = $mode_frequency["Switching"];

    $user_log_string = implode("|", $user_log_array); 
 
    $SQLquery = 'SELECT COUNT(*), user_log FROM traffigram_users WHERE user_id="'.$user_id.'"';

    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];
	
        if($rowcount == 1){ // found user entry
          
	    if($res["user_log"] == NULL){ // no data for this day
            
		$SQLquery = 'UPDATE traffigram_users SET user_log="'.$user_log_string.'" WHERE user_id="'.$user_id.'"';

		try{
                    $result = $conn->query($SQLquery);
                    $return["res"] = true;
            	} catch(PDOException $e){
        	    $return["res"] = false;
	        }

	    } else {	
	  
	    	$resExploded = explode("||", $res["user_log"]);

            	// find log for the correct date
            	$found = false;

            	for($i=0; $i<count($resExploded); $i++){
                    $logString = $resExploded[$i];
		    $logDate = substr($logString, 0, 2);

                    if($date == $logDate){
                        $resExploded[$i] = $user_log_string;
			$user_log = implode("||", $resExploded);
			$SQLquery = 'UPDATE traffigram_users SET user_log="'.$user_log.'" WHERE user_id="'.$user_id.'"';
		
			try{
	                    $result = $conn->query($SQLquery);
			    $return["res"] = true;
           		} catch(PDOException $e){
                	    $return["res"] = false;
            		}
			$found = true;
			break;
                    }
		}
		if(!$found){
		    $resExploded[$resCount] = $user_log_string;
		    $user_log = implode("||", $resExploded);
		    $SQLquery = 'UPDATE traffigram_users SET user_log="'.$user_log.'" WHERE user_id="'.$user_id.'"';
                  
                    try{
                  	$result = $conn->query($SQLquery);
                    	$return["res"] = true;
                    } catch(PDOException $e){
                   	$return["res"] = false;
                    }

		}
            }

        } else { // no data for this day or something went wrong
            $return["res"] = false;
        }

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;

?>

