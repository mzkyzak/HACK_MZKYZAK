<?php
$ip = $_SERVER['REMOTE_ADDR'];
$time = date('Y-m-d H:i:s');
$log = "[$time] SCREEN_SHARE - IP: $ip\n";
file_put_contents('visitors.log', $log, FILE_APPEND);
echo "Screen share logged";
?>
