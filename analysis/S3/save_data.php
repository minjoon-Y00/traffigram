<?php
	include 'includes.php';
	//Return json array based on user input
	// If connection fails
	if ($conn->connect_error){
		die("Connection failed: " . $conn->connect_error);
	}

	$message = "bad";

	//Get data
	$s_id = $_POST["s_id"];
	$s_start = $_POST["s_start"];
	$s_end = $_POST["s_end"];
	$c1_q1 = $_POST["c1_q1"];
	$c1_q2 = $_POST["c1_q2"];
	$c2_q1 = $_POST["c2_q1"];
	$c2_q2 = $_POST["c2_q2"];
	$c1_answer = $_POST["c1_answer"];
	$c2_answer = $_POST["c2_answer"];

	$s_complete = 'false';
	$session_time = $s_end - $s_start;
	if ($session_time <= 20*60){ //within time
		//$s_complete = 'true'; - Even if saved the data, not update.. once finsih survey, update.
		$message = "good";
	}

	$SQLquery = 'UPDATE chi16_s2 SET s_complete='.$s_complete.', s_start='.$s_start.',s_end='.$s_end.',c1_q1="'.$c1_q1.'", c1_q2="'.$c1_q2.'", c2_q1="'.$c2_q1.'", c2_q2="'.$c2_q2.'", c1_answer="'.$c1_answer.'", c2_answer="'.$c2_answer.'" WHERE s_id ='.$s_id;
	$result = $conn->query($SQLquery);

	echo $SQLquery;

	if ($conn->query($SQLquery) === TRUE){$nothing = "happened";}
	else {echo "Error: " . $SQLquery . "<br>" . $conn->error;}	

	//Free and close connection
	//mysqli_free_result($result);
	$conn->close();

	echo $message;
?>