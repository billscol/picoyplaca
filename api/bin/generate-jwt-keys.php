#!/usr/bin/env php
<?php

/**
 * Genera un par de llaves RSA 2048-bit para firmar/verificar JWT con RS256.
 * Uso: php bin/generate-jwt-keys.php
 */

declare(strict_types=1);

if (!extension_loaded('openssl')) {
    fwrite(STDERR, "ERROR: Extension openssl no disponible.\n");
    exit(1);
}

$keysDir = dirname(__DIR__) . '/storage/keys';
if (!is_dir($keysDir) && !mkdir($keysDir, 0700, true)) {
    fwrite(STDERR, "ERROR: No se pudo crear {$keysDir}\n");
    exit(1);
}

echo "Generando par de llaves RSA 2048-bit...\n";

$resource = openssl_pkey_new([
    'digest_alg'       => 'sha256',
    'private_key_bits' => 2048,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
]);
if ($resource === false) {
    fwrite(STDERR, "ERROR: " . openssl_error_string() . "\n");
    exit(1);
}

openssl_pkey_export($resource, $privateKeyPem);
$publicKeyPem = openssl_pkey_get_details($resource)['key'] ?? '';

$privatePath = $keysDir . '/private.pem';
$publicPath  = $keysDir . '/public.pem';

if (file_exists($privatePath)) {
    rename($privatePath, $privatePath . '.bak.' . date('YmdHis'));
}

file_put_contents($privatePath, $privateKeyPem);
file_put_contents($publicPath, $publicKeyPem);
chmod($privatePath, 0600);
chmod($publicPath, 0644);

echo "\nLlaves generadas:\n  {$privatePath}\n  {$publicPath}\n";
echo "\nConfirmadas en .env por defecto via JWT_PRIVATE_KEY_PATH / JWT_PUBLIC_KEY_PATH.\n";
