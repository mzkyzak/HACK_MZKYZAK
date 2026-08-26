<?php
$ip = $_SERVER['REMOTE_ADDR'];
$time = date('Y-m-d H:i:s');
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$referer = $_SERVER['HTTP_REFERER'] ?? 'Direct';

$log = "[$time] JOINED - IP: $ip | Agent: $user_agent | From: $referer\n";
file_put_contents('visitors.log', $log, FILE_APPEND);

// Also save to main file
file_put_contents('../visitors_joined.txt', "$ip | $time\n", FILE_APPEND);

echo "Joined logged: $ip";
?>
