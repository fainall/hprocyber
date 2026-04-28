<?php
require_once __DIR__ . '/config.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo file_exists(CONTENT_FILE) ? file_get_contents(CONTENT_FILE) : '{}';
    exit;
}

if (empty($_SESSION['auth'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$data    = file_get_contents('php://input');
$decoded = json_decode($data, true);

if ($decoded === null) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido']);
    exit;
}

// Save JSON
file_put_contents(CONTENT_FILE, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Regenerate content.js
$js = "// hprocyber — content (administrado via panel admin)\nwindow.CONTENT = "
    . json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    . ";\n";
file_put_contents(CONTENT_JS_FILE, $js);

echo json_encode(['ok' => true]);
