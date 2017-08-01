<?php 

    include 'include.php';

    $user_id = $_POST["user_id"];
    $user_home = $_POST["user_home"];
    $user_home_lng = $_POST["user_home_lng"];
    $user_home_lat = $_POST["user_home_lat"];
    $user_office = $_POST["user_office"];
    $user_office_lng = $_POST["user_office_lng"];
    $user_office_lat = $_POST["user_office_lat"];

    // $user_id = stripslashes($user_id);
    // $user_pw = stripslashes($user_pw);
    // $user_id = mysql_real_escape_string($user_id);
    // $user_pw = mysql_real_escape_string($user_pw);

    $SQLquery = 'SELECT COUNT(*) FROM traffigram_users WHERE user_id="'.$user_id.'"';
    
    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];
        if($rowcount == 0){ // user doesn't exist?
            $SQLquery = 'INSERT INTO traffigram_users (user_id, user_pw, user_name, user_home, user_home_lng, user_home_lat, user_office, user_office_lng, user_office_lat) VALUES ("'.$user_id.'", "'.$user_pw.'", "'.$user_name.'","'.$user_home.'","'.$user_home_lng.'","'.$user_home_lat.'","'.$user_office.'","'.$user_office_lng.'","'.$user_office_lat.'")';

            try{
                $conn->exec($SQLquery);
                $return["res"] = true;
            } catch(PDOException $e){
                $return["res"] = false;
            }

        } else { // user id already exists
             $SQLquery = 'UPDATE traffigram_users SET user_home="'.$user_home.'", user_home_lng="'.$user_home_lng.'", user_home_lat="'.$user_home_lat.'", user_office="'.$user_office.'", user_office_lng="'.$user_office_lng.'", user_office_lat="'.$user_office_lat.'WHERE user_id="'.$user_id.'"'; 

            try{
                $conn->exec($SQLquery);
                $return["res"] = true;
            } catch(PDOException $e){
                $return["res"] = false;
            }

        }

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;
    

?>
