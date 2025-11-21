<?php
header('Content-Type: application/json; charset=utf-8');

$dir = __DIR__;
$files = scandir($dir);
$out = [];
$allowed = ['png','jpg','jpeg','gif','svg','webp','avif'];

foreach($files as $f){
    if(in_array($f, ['.','..','list.php'])) continue;
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    if(in_array($ext, $allowed)) $out[] = $f;
}

// ordenar por nombre
sort($out, SORT_NATURAL | SORT_FLAG_CASE);

echo json_encode(array_values($out));

// Fin
?>
