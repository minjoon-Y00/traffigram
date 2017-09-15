<?php 

    include 'include.php';

    $user_id = $_POST["user_id"];
    $user_name = $_POST["user_name"];
    $user_pw = $_POST["user_pw"];

    // $user_id = stripslashes($user_id);
    // $user_pw = stripslashes($user_pw);
    // $user_id = mysql_real_escape_string($user_id);
    // $user_pw = mysql_real_escape_string($user_pw);

    $SQLquery = 'SELECT COUNT(*) FROM traffigram_users WHERE user_id="'.$user_id.'" AND user_pw="'.$user_pw.'"';
    
    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];
        if($rowcount == 1){ // found user entry
            $return["res"] = true;

        } else { // invalid login information
            $return["res"] = false;
        }

    } catch(PDOException $e){
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;
    

?>
