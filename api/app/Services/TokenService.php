<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services;

use PicoPlaca\Core\Response;
use Firebase\JWT\JWT;
use PDO;

/**
 * Genera y valida access tokens JWT (RS256, corta vida) y refresh tokens
 * opacos almacenados en `refresh_tokens` (rotacion + deteccion de reuso).
 */
class TokenService
{
    private const COOKIE_NAME  = 'pyp_refresh_token';
    private const COOKIE_PATH  = '/v1/auth';
    private const MAX_SESSIONS = 10;

    public const TYPE_ACCESS = 'access';

    public static function generateAccessToken(array $user): string
    {
        $now = time();
        return JWT::encode([
            'iss'      => 'api.picoyplaca.com',
            'iat'      => $now,
            'exp'      => $now + self::accessTtl(),
            'jti'      => bin2hex(random_bytes(16)),
            'type'     => self::TYPE_ACCESS,
            'sub'      => (string) $user['id'],
            'email'    => $user['email'],
            'name'     => $user['name'] ?? '',
            'plan'     => $user['plan'] ?? 'free',
            'is_admin' => (bool) ($user['is_admin'] ?? false),
        ], self::privateKey(), 'RS256');
    }

    public static function privateKey(): string
    {
        $content = ($_ENV['JWT_PRIVATE_KEY'] ?? getenv('JWT_PRIVATE_KEY')) ?: '';
        if ($content) {
            return $content;
        }
        $path = self::resolvePath(($_ENV['JWT_PRIVATE_KEY_PATH'] ?? getenv('JWT_PRIVATE_KEY_PATH')) ?: '');
        if ($path && file_exists($path)) {
            return (string) file_get_contents($path);
        }
        error_log('[TokenService] JWT_PRIVATE_KEY no configurado. Corre bin/generate-jwt-keys.php');
        Response::serverError();
    }

    public static function publicKey(): string
    {
        $content = ($_ENV['JWT_PUBLIC_KEY'] ?? getenv('JWT_PUBLIC_KEY')) ?: '';
        if ($content) {
            return $content;
        }
        $path = self::resolvePath(($_ENV['JWT_PUBLIC_KEY_PATH'] ?? getenv('JWT_PUBLIC_KEY_PATH')) ?: '');
        if ($path && file_exists($path)) {
            return (string) file_get_contents($path);
        }
        error_log('[TokenService] JWT_PUBLIC_KEY no configurado. Corre bin/generate-jwt-keys.php');
        Response::serverError();
    }

    /**
     * Rutas relativas en .env se resuelven contra API_ROOT (definido en public/index.php
     * y en cada script de bin/), no contra getcwd() — el servidor built-in de PHP cambia
     * el cwd al document root (public/) en cada request, rompiendo rutas relativas simples.
     */
    private static function resolvePath(string $path): string
    {
        if ($path === '' || str_starts_with($path, '/') || preg_match('#^[A-Za-z]:[\\\\/]#', $path)) {
            return $path; // vacio o ya absoluta
        }
        return defined('API_ROOT') ? API_ROOT . '/' . $path : $path;
    }

    public static function accessTtl(): int
    {
        return (int) (($_ENV['JWT_ACCESS_TTL'] ?? getenv('JWT_ACCESS_TTL')) ?: 900);
    }

    public static function refreshTtl(): int
    {
        return (int) (($_ENV['JWT_REFRESH_TTL'] ?? getenv('JWT_REFRESH_TTL')) ?: 2592000);
    }

    private static function enforceSessionLimit(int $userId, PDO $db): void
    {
        $max = (int) (($_ENV['MAX_SESSIONS'] ?? getenv('MAX_SESSIONS')) ?: self::MAX_SESSIONS);

        $stmt = $db->prepare(
            "SELECT COUNT(*) FROM refresh_tokens WHERE user_id = ? AND revoked = 0 AND expires_at > NOW()"
        );
        $stmt->execute([$userId]);
        $active = (int) $stmt->fetchColumn();

        if ($active >= $max) {
            $excess = $active - $max + 1;
            $db->prepare(
                "UPDATE refresh_tokens SET revoked = 1
                 WHERE user_id = ? AND revoked = 0 AND expires_at > NOW()
                 ORDER BY created_at ASC LIMIT " . $excess
            )->execute([$userId]);
        }
    }

    public static function issueRefreshToken(int $userId, PDO $db): void
    {
        self::enforceSessionLimit($userId, $db);

        $rawToken  = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $rawToken);
        $ttl       = self::refreshTtl();
        $expiresAt = date('Y-m-d H:i:s', time() + $ttl);
        $device    = substr(strip_tags($_SERVER['HTTP_USER_AGENT'] ?? 'web'), 0, 255);
        $ip        = \PicoPlaca\Core\ClientIp::resolve();

        $db->prepare(
            "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address) VALUES (?, ?, ?, ?, ?)"
        )->execute([$userId, $tokenHash, $expiresAt, $device, $ip]);

        $isProduction = (($_ENV['APP_ENV'] ?? getenv('APP_ENV')) ?: 'production') === 'production';

        setcookie(self::COOKIE_NAME, $rawToken, [
            'expires'  => time() + $ttl,
            'path'     => self::COOKIE_PATH,
            'secure'   => $isProduction,
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
    }

    /** @throws \RuntimeException('reuse') si el token ya fue revocado (robo de token) */
    public static function validateRefreshCookie(PDO $db): ?array
    {
        $rawToken = $_COOKIE[self::COOKIE_NAME] ?? '';
        if (empty($rawToken)) {
            return null;
        }

        $tokenHash = hash('sha256', $rawToken);
        $stmt = $db->prepare(
            "SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked,
                    u.email, u.name, u.subscription_plan AS plan, u.is_admin
             FROM   refresh_tokens rt
             JOIN   users u ON u.id = rt.user_id
             WHERE  rt.token_hash = ?
             LIMIT  1"
        );
        $stmt->execute([$tokenHash]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }
        if ((int) $row['revoked'] === 1) {
            throw new \RuntimeException('reuse', 0);
        }
        if (strtotime($row['expires_at']) < time()) {
            return null;
        }

        return $row;
    }

    public static function revokeById(int $id, PDO $db): void
    {
        $db->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?")->execute([$id]);
    }

    public static function revokeAllByUser(int $userId, PDO $db): void
    {
        $db->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?")->execute([$userId]);
    }

    public static function revokeCookieToken(PDO $db): void
    {
        $rawToken = $_COOKIE[self::COOKIE_NAME] ?? '';
        if (empty($rawToken)) {
            return;
        }
        $tokenHash = hash('sha256', $rawToken);
        $db->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?")->execute([$tokenHash]);
    }

    public static function clearRefreshCookie(): void
    {
        setcookie(self::COOKIE_NAME, '', [
            'expires'  => time() - 3600,
            'path'     => self::COOKIE_PATH,
            'secure'   => getenv('APP_ENV') === 'production',
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
    }

    public static function purgeExpired(PDO $db): int
    {
        $stmt = $db->prepare("DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = 1");
        $stmt->execute();
        return $stmt->rowCount();
    }
}
