<?php
<?php
header('Content-Type: application/json; charset=utf-8');

$recordFile = __DIR__ . '/../record.json'; // ajusta la ruta si hace falta

function read_records($file) {
  if (!file_exists($file)) return [];
  $json = file_get_contents($file);
  $data = json_decode($json, true);
  return is_array($data) ? $data : [];
}

function write_records($file, $records) {
  // escribe de forma segura
  $tmp = json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
  file_put_contents($file, $tmp, LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
  echo json_encode(read_records($recordFile));
  exit;
}

if ($method === 'POST') {
  $body = file_get_contents('php://input');
  $entry = json_decode($body, true);
  if (!is_array($entry)) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload inválido']);
    exit;
  }

  // validación mínima de campos esperados
  $entry = [
    'name' => isset($entry['name']) ? (string)$entry['name'] : 'Jugador',
    'completed' => isset($entry['completed']) ? (int)$entry['completed'] : 0,
    'total' => isset($entry['total']) ? (int)$entry['total'] : 0,
    'timeTakenSeconds' => isset($entry['timeTakenSeconds']) ? (int)$entry['timeTakenSeconds'] : 0,
    'timestamp' => isset($entry['timestamp']) ? (int)$entry['timestamp'] : time()
  ];

  // lectura, inserción, orden y recorte a top 10 (misma lógica que en JS)
  $records = read_records($recordFile);
  $records[] = $entry;
  usort($records, function($a, $b) {
    if ($b['completed'] !== $a['completed']) return $b['completed'] - $a['completed'];
    return ($a['timeTakenSeconds'] ?? 0) - ($b['timeTakenSeconds'] ?? 0);
  });
  $records = array_slice($records, 0, 10);
  write_records($recordFile, $records);

  echo json_encode($records);
  exit;
}

// otros métodos no permitidos
http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);