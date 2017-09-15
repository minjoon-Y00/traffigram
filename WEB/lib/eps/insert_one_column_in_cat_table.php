<?php
	echo "hello world";
	

	$servername = 'localhost:/data/mysql-data-location/mysql.sock';
	$username = 'traffigram';
	$password = 'SpatialVisualization';
	$dbname = 'traffigram';	
	

	$db = new PDO('mysql:host=localhost:/data/mysql-data-location/mysql.sock;dbname=traffigram', $username, $passowrd);

	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    		echo "Connected successfully";
    	}

	//$conn = new mysqli($servername, $username, $password, $dbname);
	//Return json array based on user input
	// If connection fails
	//if ($conn->connect_error){
	//	die("Connection failed: " . $conn->connect_error);
	//}

	echo "did this work?";

	$var_cat_id="1_2";
	$var_cat_name="American";
	$var_cat_num=1234;
	$var_cat_img="http://dfnmdklfmdklmfedklfmel";

	$SQLquery = 'INSERT INTO traffigram_cat (cat_id, cat_name, cat_num, cat_img) VALUES ("'.$var_cat_id.'","'.$var_cat_name.'",'.$var_cat_num.',"'.$var_cat_img.'")';
	echo $SQLquery;
	echo "Hello world!";

	//if ($conn->query($SQLquery) === TRUE){$nothing = "happened";}
	//else {echo "Error: " . $SQLquery . "<br>" . $conn->error;}	

	//Free and close connection
	//mysqli_free_result($result);
	//$conn->close();

	
?>
