<?php
	$servername = 'mysql:unix_socket=/data/mysql-data-location/mysql.sock;dbname=traffigram';
	$username = 'traffigram';
	$password = 'SpatialVisualization';
	
	try{
 		$conn = new PDO($servername, $username, $password);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   		echo "Connected successfully"; 
	} catch(PDOException $e){
		echo "Connection Failed: " . $e->getMessage();
	}

	$var_cat_id="9_9";
	$var_cat_name="American";
	$var_cat_num=1234;
	$var_cat_img="http://dfnmdklfmdklmfedklfmel";

	$SQLquery = 'INSERT INTO traffigram_cat (cat_id, cat_name, cat_num, cat_img) VALUES ("'.$var_cat_id.'","'.$var_cat_name.'",'.$var_cat_num.',"'.$var_cat_img.'")';
	echo $SQLquery;
	echo "Hello world!";

	try{
		$conn->exec($SQLquery);
		echo "new record inserted";
	} catch(PDOException $e){
		echo $SQLquery . "<br" . $e->getMessage();
	}

	$conn = null;
	
?>
