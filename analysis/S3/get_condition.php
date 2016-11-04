<?php
	include 'includes.php';
	//Return json array based on user input
	$max_session = 4; //Define the time for expiring a session
	$return = array("s_id"=>"", "s_code"=>"", "s_c1"=>"", "s_c2"=>"");
	$time_current = time();
	$time_expired = 30;

	// If connection fails
	if ($conn->connect_error){
		die("Connection failed: " . $conn->connect_error);
	}
	// Else connection goes
	else {
		//SQL: take every incomplete ones
		$SQLquery = 'SELECT * FROM chi16_s2 WHERE s_complete IS false';
		$result = $conn->query($SQLquery);
		//Fetch results
		$record = array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){array_push($record, $row);}

	
		$isInvalidExist = false;
		for ($i=0 ; $i<count($record); $i++){
			if($time_current - $record[$i]['s_start'] > 60*$time_expired){
				//Update the expired one
				//Update a new code
				$s_code_new = rand(1000,9999);
				$SQLquery = 'UPDATE chi16_s2 SET s_start = '.$time_current.',s_code='.$s_code_new.' WHERE s_id = '.$record[$i]['s_id'];
				$result = $conn->query($SQLquery);
				//Set return value
				$return['s_id'] = $record[$i]['s_id'];
				$return['s_code'] = $s_code_new;
				$return['s_c1'] = $record[$i]['s_c1'];
				$return['s_c2'] = $record[$i]['s_c2'];
				$isInvalidExist = true;
				break;
			}
		}
		if($isInvalidExist == false){
			//Get the number of records
			$SQLquery = 'SELECT * FROM chi16_s2';
			$result = $conn->query($SQLquery);
			$row_cnt = $result->num_rows;

			if ($row_cnt >= $max_session){
				echo "We are sorry, we don't recruite more workers at this point.";
				die();
			}

			else {
				//2. Set required variables for starting a new session
				$s_id = $row_cnt + 1;
				$s_complete = 'false';
				$s_code = rand(1000,9999);
				$s_c1 = "";
				$s_c2 = "";

				//3. Set conditions
				$conditions = $s_id%6;
				if ($conditions == 0){ $s_c1 = "a-1"; $s_c2 = "a-2";}
				else if ($conditions == 1){ $s_c1 = "a-2"; $s_c2 = "a-1";}
				else if ($conditions == 2){ $s_c1 = "b-1"; $s_c2 = "b-2";}
				else if ($conditions == 3){ $s_c1 = "b-2"; $s_c2 = "b-1";}
				else if ($conditions == 4){ $s_c1 = "c-1"; $s_c2 = "c-2";}
				else if ($conditions == 5){ $s_c1 = "c-2"; $s_c2 = "c-1";}

				//4. Update the record to the database
				$SQLquery = 'INSERT INTO chi16_s2 (s_id, s_complete, s_code, s_start, s_c1, s_c2) VALUES ('.$s_id.','.$s_complete.','.$s_code.','.$time_current.',"'.$s_c1.'","'.$s_c2.'")';
				if ($conn->query($SQLquery) === TRUE){
					//echo "New record created";
				}
				else {
					//echo "Error: " . $SQLquery . "<br>" . $conn->error;
				}

				//5. Set return value
				$return['s_id'] = $s_id;
				$return['s_code'] = $s_code;
				$return['s_c1'] = $s_c1;
				$return['s_c2'] = $s_c2;
			}
		}
	}
	//print_r($return);
	echo json_encode($return);
	//Free and close connection
	$conn->close();
?>