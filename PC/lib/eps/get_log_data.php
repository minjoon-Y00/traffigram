<?php

    include 'include.php';

    $user_id = $_POST["user_id"];
    $date = $_POST["date"];
    
    $SQLquery = 'SELECT COUNT(*), user_log FROM traffigram_users WHERE user_id="'.$user_id.'"';    

    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];

        if($rowcount == 1){ // found user entry
            
            if($res["user_log"] == NULL){ // no data for this day
                for($i = 0; $i<26; $i++){
                    $log[$i] = 0;
                }
            } else {    
            
                $resExploded = explode("||", $res["user_log"]);

                // find log for the correct date
                $log = NULL;
                for($i=0; $i<count($resExploded); $i++){
                    $logString = $resExploded[$i];
                    $logDate = substr($logString, 0, 2);
                    if($date == $logDate){
                        $log = explode("|", $logString);
                        break;
                    }
                }
            }

        } else { // no data for this day or something went wrong
            for($i = 0; $i<26; $i++){
                $log[$i] = 0;
            }
        }

        $mode_duration["map_dc"] = $log[1];
        $mode_duration["map_wm"] = $log[2];
        $mode_duration["list"] = $log[3];
        $mode_duration["total"] = $log[4];
        
        $WM["zoom"] = $log[5];
        $WM["pan"] = $log[6];
        $WM["search"] = $log[7];
        $WM["change_origin_by_drag"] = $log[8];
        $WM["change_origin_in_setting"] = $log[9];
        $WM["change_mode_of_transportation"] = $log[10];
        $WM["filter_by_price"] = $log[11];
        $WM["filter_by_rating"] = $log[12];
        $WM["filter_by_numOfReview"] = $log[13];
            
        $DC["zoom"] = $log[14];
        $DC["pan"] = $log[15];
        $DC["search"] = $log[16];
        $DC["change_origin_by_drag"] = $log[17];
        $DC["change_origin_in_setting"] = $log[18];
        $DC["change_mode_of_transportation"] = $log[19];
        $DC["filter_by_price"] = $log[20];
        $DC["filter_by_rating"] = $log[21];
        $DC["filter_by_num_of_review"] = $log[22];
        $DC["highlight_by_isochrone_default"] = $log[23];
        $DC["highlight_by_isochrone_customized"] = $log[24];

        $mode_frequency["WM"] = $WM;
        $mode_frequency["DC"] = $DC;
        $mode_frequency["Switching"] = $log[25];

        $return["user_id"] = $user_id;
        $return["date"] = $date;
        $return["mode_duration"] = $mode_duration;
        $return["mode_frequency"] = $mode_frequency;

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;

?>




