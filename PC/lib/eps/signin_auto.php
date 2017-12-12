<?php 

    include 'include.php';

    $user_id = $_POST["user_id"];
    $user_pw = $_POST["user_pw"];

    // $user_id = stripslashes($user_id);
    // $user_pw = stripslashes($user_pw);
    // $user_id = mysql_real_escape_string($user_id);
    // $user_pw = mysql_real_escape_string($user_pw);

    $SQLquery = 'SELECT user_name, user_home, user_office, user_fav FROM traffigram_users WHERE user_pw="'.$user_pw.'" AND user_id="'.$user_id.'"';
    
    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        
        if($rowcount == 1){ // found user entry
            $user_name = $res["user_name"];
            $user_home = $res["user_home"];
            $user_office = $res["user_office"];
            $user_fav = $res["user_fav"];
            
            $return["user_name"] = $user_name;
            $return["user_home"] = $user_home;
            $return["user_office"] = $user_office;
            $return["user_fav"] = $user_fav;

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
