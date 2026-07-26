<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Auth;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Middleware\CorsMiddleware;
use PicoPlaca\App\Middleware\RateLimitMiddleware;
use PicoPlaca\App\Services\TokenService;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class RefreshController extends BaseController
{
    /**
     * Rota el refresh token (revoca el presentado, emite uno nuevo).
     * Si el token ya estaba revocado -> reuso detectado -> se revoca TODA la
     * familia de sesiones del usuario (mitigacion de robo de refresh token).
     */
    public function refresh(Request $request, array $params): void
    {
        RateLimitMiddleware::handle($request, 'auth:refresh');
        $this->enforceOriginCheck($request);

        $pdo = Database::getInstance();

        try {
            $row = TokenService::validateRefreshCookie($pdo);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'reuse') {
                $tokenHash = hash('sha256', $_COOKIE['pyp_refresh_token'] ?? '');
                $stmt = $pdo->prepare("SELECT user_id FROM refresh_tokens WHERE token_hash = ? LIMIT 1");
                $stmt->execute([$tokenHash]);
                $userId = (int) $stmt->fetchColumn();
                if ($userId > 0) {
                    TokenService::revokeAllByUser($userId, $pdo);
                }
                TokenService::clearRefreshCookie();
                Response::unauthorized('Sesion invalidada por reuso de token. Inicia sesion de nuevo.');
            }
            throw $e;
        }

        if (!$row) {
            Response::unauthorized('Refresh token invalido o expirado');
        }

        // Rotacion: revocar el actual, emitir uno nuevo
        $stmt = $pdo->prepare("SELECT id FROM refresh_tokens WHERE token_hash = ? LIMIT 1");
        $stmt->execute([hash('sha256', $_COOKIE['pyp_refresh_token'])]);
        $tokenId = (int) $stmt->fetchColumn();
        if ($tokenId) {
            TokenService::revokeById($tokenId, $pdo);
        }

        $userPayload = [
            'id'       => $row['user_id'],
            'email'    => $row['email'],
            'name'     => $row['name'],
            'plan'     => $row['plan'] ?? 'free',
            'is_admin' => (bool) $row['is_admin'],
        ];

        $token = TokenService::generateAccessToken($userPayload);
        TokenService::issueRefreshToken((int) $row['user_id'], $pdo);

        Response::success([
            'token'      => $token,
            'expires_in' => TokenService::accessTtl(),
            'token_type' => 'Bearer',
            'user'       => $userPayload,
        ], 'Token renovado');
    }

    /** Defensa en profundidad: el Origin de la request debe estar en la whitelist de CORS. */
    private function enforceOriginCheck(Request $request): void
    {
        $isProduction = (($_ENV['APP_ENV'] ?? getenv('APP_ENV')) ?: 'production') === 'production';
        if (!$isProduction) {
            return;
        }
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && !in_array($origin, CorsMiddleware::getAllowedOrigins(), true)) {
            Response::unauthorized('Origen no permitido');
        }
    }
}
