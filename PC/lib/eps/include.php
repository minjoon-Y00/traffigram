<?php
    $servername = 'mysql:unix_socket=/data/mysql-data-location/mysql.sock;dbname=traffigram';
    $username = 'traffigram';
    $password = 'SpatialVisualization';
    $options = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8");

	try{    
        $conn = new PDO($servername, $username, $password, $options);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        // echo "Connected successfully"; 
    } catch(PDOException $e){
        // echo "Connection Failed: " . $e->getMessage();
    }
?>