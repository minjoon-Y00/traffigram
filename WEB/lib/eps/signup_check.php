<?php

    include 'include.php';

    $user_id = $_POST["user_id"];

    $SQLquery = 'SELECT COUNT(*) FROM traffigram_users WHERE user_id="'.$user_id.'"';

    try{
        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $rowcount = $res["COUNT(*)"];
        if($rowcount == 0){ // valid sign up. id not used yet. return true.

            $return["res"] = true;

        } else { // user id already exists. return false
            $return["res"] = false;

        }

    } catch(PDOException $e){
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;


?>



