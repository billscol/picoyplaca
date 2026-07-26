<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Auth;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Middleware\RateLimitMiddleware;
use PicoPlaca\App\Services\TokenService;
use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class LoginController extends BaseController
{
    public function login(Request $request, array $params): void
    {
        RateLimitMiddleware::handle($request, 'auth:login');

        $data       = $request->body();
        $identifier = strtolower(trim((string) ($data['email'] ?? '')));
        $password   = (string) ($data['password'] ?? '');

        if (empty($identifier) || empty($password)) {
            Response::unprocessable(['email' => 'Email y contraseña son requeridos']);
        }

        RateLimitMiddleware::accountFailureGuard($identifier);

        try {
            $pdo  = Database::getInstance();
            $stmt = $pdo->prepare(
                "SELECT id, email, name, password_hash, is_admin, subscription_plan
                 FROM   users WHERE email = ? LIMIT 1"
            );
            $stmt->execute([$identifier]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, (string) $user['password_hash'])) {
                RateLimitMiddleware::recordAccountFailure($identifier);
                Response::error('Credenciales invalidas', 401);
            }

            RateLimitMiddleware::clearAccountFailures($identifier);

            $userPayload = [
                'id'       => $user['id'],
                'email'    => $user['email'],
                'name'     => $user['name'],
                'plan'     => $user['subscription_plan'] ?? 'free',
                'is_admin' => (bool) $user['is_admin'],
            ];

            $token = TokenService::generateAccessToken($userPayload);
            TokenService::issueRefreshToken((int) $user['id'], $pdo);

            $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?")->execute([$user['id']]);

            Response::success([
                'token'      => $token,
                'expires_in' => TokenService::accessTtl(),
                'token_type' => 'Bearer',
                'user'       => $userPayload,
            ], 'Login exitoso');
        } catch (\PDOException) {
            Response::serverError();
        }
    }

    public function logout(Request $request, array $params): void
    {
        $jwt   = $this->requireAuth($request);
        $token = $request->bearerToken();

        $ttl = max(0, (int) ($jwt->exp ?? 0) - time());
        if ($ttl > 0 && $token) {
            Cache::blacklistToken(hash('sha256', $token), $ttl);
        }

        try {
            $pdo = Database::getInstance();
            TokenService::revokeCookieToken($pdo);
            TokenService::clearRefreshCookie();
        } catch (\PDOException) {
            error_log('[LoginController::logout] Error al revocar refresh token');
        }

        Response::success(null, 'Sesion cerrada correctamente');
    }
}
