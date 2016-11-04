<?php
	include 'includes.php';
	//Return json array based on user input
	// If connection fails
	if ($conn->connect_error){
		die("Connection failed: " . $conn->connect_error);
	}

	//Get data
	$s_id = $_GET["s_id"];
	$s_code = $_GET["s_code"];
	$s_complete = 'true';

	$SQLquery = 'UPDATE chi16_s2 SET s_complete='.$s_complete.' WHERE s_id ='.$s_id;
	$result = $conn->query($SQLquery);

	$message = "Thank you for finishing the survey. Please paste your code at AMT. Your code is:".$s_code;

	if ($conn->query($SQLquery) === TRUE){echo $message;}
	else {echo "Error: " . $SQLquery . "<br>" . $conn->error;}	

	//Free and close connection
	//mysqli_free_result($result);
	$conn->close();
?>