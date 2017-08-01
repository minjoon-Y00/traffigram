<?php 

	include 'include.php';

	$user_id = $_POST["user_id"];
    $user_home = $_POST["user_home"];
    $user_home_lng = $_POST["user_home_lng"];
    $user_home_lat = $_POST["user_home_lat"];
    $user_office = $_POST["user_office"];
    $user_office_lng = $_POST["user_office_lng"];
    $user_office_lat = $_POST["user_office_lat"];
    $user_name = $_POST["user_name"];

    $SQLquery = 'SELECT COUNT(*), id FROM traffigram_users WHERE user_name="'.$user_name.'" AND user_id="'.$user_id.'"';

    try{

        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];
        $id = $res["id"];

        if($rowcount == 1){ // found user entry
            $SQLquery = 'UPDATE traffigram_users SET user_home="'.$user_home.'",user_home_lng="'.$user_home_lng.'",user_home_lat="'.$user_home_lat.'",user_office="'.$user_office.'",user_office_lng='.$user_office_lng.',user_office_lat='.$user_office_lat.' WHERE id='.$id;

            try{
            	$result = $conn->query($SQLquery);
            	$return["res"] = true;
            } catch(PDOException $e){
            	$return["res"] = false;
            }

        } else { // invalid login information
            $return["res"] = false;
        }

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;



?>