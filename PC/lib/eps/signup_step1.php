<?php 

    include 'include.php';

    $user_id = $_POST["user_id"];
    $user_name = $_POST["user_name"];
    $user_pw = $_POST["user_pw"];

    // $user_id = stripslashes($user_id);
    // $user_pw = stripslashes($user_pw);
    // $user_id = mysql_real_escape_string($user_id);
    // $user_pw = mysql_real_escape_string($user_pw);

    $SQLquery = 'SELECT COUNT(*) FROM traffigram_users WHERE user_id="'.$user_id.'"';
    
    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];
        if($rowcount == 0){ // valid sign up
            $SQLquery = 'INSERT INTO traffigram_users (user_id, user_pw, user_name) VALUES ("'.$user_id.'", "'.$user_pw.'", "'.$user_name.'")';

            try{
                $result = $conn->query($SQLquery);
                $return["res"] = true;
            } catch(PDOException $e){
                $return["res"] = false;
            }

        } else { // user id already exists
            $return["res"] = false;

        }

    } catch(PDOException $e){
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;
    

?>
