<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/cpanel-config.php';

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Auth check
if (empty($_SESSION['auth'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autorizado']);
    exit;
}

function cpanel_call(string $module, string $func, array $params = []): array {
    $url = 'https://' . CPANEL_HOST . ':' . CPANEL_PORT . '/execute/' . $module . '/' . $func;
    if (!empty($params)) $url .= '?' . http_build_query($params);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER     => [
            'Authorization: cpanel ' . CPANEL_USER . ':' . CPANEL_TOKEN,
        ],
    ]);
    $res  = curl_exec($ch);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($err) return ['ok' => false, 'error' => $err];
    $data = json_decode($res, true);
    if (!$data) return ['ok' => false, 'error' => 'Respuesta inválida del servidor'];
    return $data;
}

function cpanel_post(string $module, string $func, array $params = []): array {
    $url = 'https://' . CPANEL_HOST . ':' . CPANEL_PORT . '/execute/' . $module . '/' . $func;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_HTTPHEADER     => [
            'Authorization: cpanel ' . CPANEL_USER . ':' . CPANEL_TOKEN,
            'Content-Type: application/x-www-form-urlencoded',
        ],
    ]);
    $res  = curl_exec($ch);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($err) return ['ok' => false, 'error' => $err];
    $data = json_decode($res, true);
    if (!$data) return ['ok' => false, 'error' => 'Respuesta inválida del servidor'];
    return $data;
}

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// GET — listar cuentas
if ($method === 'GET') {
    $res = cpanel_call('Email', 'list_pops', ['domain' => CPANEL_DOMAIN]);
    if (isset($res['errors']) && $res['errors']) {
        echo json_encode(['ok' => false, 'error' => implode(', ', $res['errors'])]);
        exit;
    }
    $accounts = array_map(fn($a) => [
        'email'     => $a['email'],
        'user'      => $a['login'],
        'quota_mb'  => $a['_maximumdiskused'] ?? ($a['diskquota'] ?? 0),
        'used_mb'   => round(($a['_diskused'] ?? 0) / 1024 / 1024, 2),
        'quota_raw' => $a['diskquota'] ?? 0,
    ], $res['data'] ?? []);
    echo json_encode(['ok' => true, 'accounts' => $accounts, 'max' => CPANEL_MAX_ACCOUNTS]);
    exit;
}

// POST — crear cuenta
if ($method === 'POST' && ($body['action'] ?? '') === 'create') {
    $user  = trim($body['user']  ?? '');
    $pass  = trim($body['pass']  ?? '');
    $quota = intval($body['quota'] ?? 500);

    if (!$user || !$pass) {
        echo json_encode(['ok' => false, 'error' => 'Usuario y contraseña requeridos']); exit;
    }
    if (!preg_match('/^[a-z0-9._+-]+$/', $user)) {
        echo json_encode(['ok' => false, 'error' => 'Usuario inválido (solo letras, números, puntos, guiones)']); exit;
    }

    // Verificar límite
    $list = cpanel_call('Email', 'list_pops', ['domain' => CPANEL_DOMAIN]);
    $count = count($list['data'] ?? []);
    if ($count >= CPANEL_MAX_ACCOUNTS) {
        echo json_encode(['ok' => false, 'error' => 'Límite de ' . CPANEL_MAX_ACCOUNTS . ' cuentas alcanzado']); exit;
    }

    $res = cpanel_post('Email', 'add_pop', [
        'email'    => $user,
        'domain'   => CPANEL_DOMAIN,
        'password' => $pass,
        'quota'    => $quota,
    ]);

    if (!empty($res['errors'])) {
        echo json_encode(['ok' => false, 'error' => implode(', ', $res['errors'])]); exit;
    }
    echo json_encode(['ok' => true, 'email' => $user . '@' . CPANEL_DOMAIN]);
    exit;
}

// PUT — cambiar contraseña
if ($method === 'PUT' && ($body['action'] ?? '') === 'passwd') {
    $user = trim($body['user'] ?? '');
    $pass = trim($body['pass'] ?? '');

    if (!$user || !$pass) {
        echo json_encode(['ok' => false, 'error' => 'Usuario y contraseña requeridos']); exit;
    }

    $res = cpanel_post('Email', 'passwd_pop', [
        'email'    => $user,
        'domain'   => CPANEL_DOMAIN,
        'password' => $pass,
    ]);

    if (!empty($res['errors'])) {
        echo json_encode(['ok' => false, 'error' => implode(', ', $res['errors'])]); exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

// DELETE — eliminar cuenta
if ($method === 'DELETE') {
    $user = trim($body['user'] ?? '');
    if (!$user) {
        echo json_encode(['ok' => false, 'error' => 'Usuario requerido']); exit;
    }

    $res = cpanel_post('Email', 'delete_pop', [
        'email'  => $user,
        'domain' => CPANEL_DOMAIN,
    ]);

    if (!empty($res['errors'])) {
        echo json_encode(['ok' => false, 'error' => implode(', ', $res['errors'])]); exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Acción no reconocida']);
