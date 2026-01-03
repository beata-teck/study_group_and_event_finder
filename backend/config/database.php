<?php

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function getDatabaseConnection(): mysqli
{
    $host = "localhost";
    $user = "root";
    $password = "";
    $database = "study_group_and_event_finder"; 

    $connection = new mysqli($host, $user, $password, $database);
    $connection->set_charset("utf8mb4");

    return $connection;
}
