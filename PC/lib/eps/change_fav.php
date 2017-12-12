<?php
    include 'include.php';
    
    $dest_id = $_POST["dest_id"];
    $user_id = $_POST["user_id"];
    $user_name = $_POST["user_name"];

    $SQLquery = 'SELECT user_fav FROM traffigram_users WHERE user_id="'.$user_id.'" AND user_name="'.$user_name.'"';

    try{

        $result = $conn->query($SQLquery);
        $res = $result->fetch(PDO::FETCH_ASSOC);
        $user_fav = $res["user_fav"];


        if(strlen($user_fav) == 0){ // no favs, add dest id
            $SQLquery = 'UPDATE traffigram_users SET user_fav="'.$dest_id.'|*|" WHERE user_id="'.$user_id.'" AND user_name="'.$user_name.'"';

            try{
                $result = $conn->query($SQLquery);
                $return["res"]=true;
            } catch(PDOException $e){
                // echo $SQLquery . "<br" . $e->getMessage();
                $return["res"] = false;
            }

        } else {
            
            $exploded = explode("|*|", $user_fav);

            if(in_array($dest_id, $exploded)){ // user wants to remove this entry from favs
                $new_fav = array();
                foreach ($exploded as $fav) {
                    if($fav != $dest_id){
                        $new_fav[] = $fav;
                    }
                }
                $new_user_fav = implode("|*|", $new_fav);
                $SQLquery = 'UPDATE traffigram_users SET user_fav="'.$new_user_fav.'" WHERE user_id="'.$user_id.'" AND user_name="'.$user_name.'"';

                try{
                    $result = $conn->query($SQLquery);
                    $return["res"]=true;
                } catch(PDOException $e){
                    // echo $SQLquery . "<br" . $e->getMessage();
                    $return["res"] = false;
                }


            } else { // user wants to add this entry to favs
                $len = strlen($user_fav);

                if(substr($user_fav, $len-3, 3) == "|*|"){
                    $new_user_fav = $user_fav.$dest_id;
                } else {
                    $new_user_fav = $user_fav."|*|".$dest_id;
                }

                $SQLquery = 'UPDATE traffigram_users SET user_fav="'.$new_user_fav.'" WHERE user_id="'.$user_id.'" AND user_name="'.$user_name.'"';

                try{
                    $result = $conn->query($SQLquery);
                    $return["res"]=true;
                } catch(PDOException $e){
                    // echo $SQLquery . "<br" . $e->getMessage();
                    $return["res"] = false;
                }
            }           
        }

    } catch(PDOException $e){
        // echo $SQLquery . "<br" . $e->getMessage();
        $return["res"] = false;
    }

    echo json_encode($return);

    $conn = null;

?>