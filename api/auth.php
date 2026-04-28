<?php
require_once __DIR__ . '/config.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? 'check';

if ($action === 'login') {
    if (($body['username'] ?? '') === ADMIN_USERNAME && ($body['password'] ?? '') === ADMIN_PASSWORD) {
        $_SESSION['auth'] = true;
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Credenciales incorrectas']);
    }
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => !empty($_SESSION['auth'])]);
}
