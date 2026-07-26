<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Auth;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Middleware\RateLimitMiddleware;
use PicoPlaca\App\Services\TokenService;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class RegisterController extends BaseController
{
    public function register(Request $request, array $params): void
    {
        RateLimitMiddleware::handle($request, 'auth:register');

        $data = $request->body();
        $errors = $this->validate($data, [
            'name'     => 'required|string|min:2|max:120',
            'email'    => 'required|email|max:255',
            'password' => 'required|string|min:8|max:128',
        ]);
        if ($errors) {
            Response::unprocessable($errors);
        }

        $email = strtolower(trim((string) $data['email']));
        $pdo   = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('Ya existe una cuenta con ese email', 409);
        }

        $hash = password_hash((string) $data['password'], PASSWORD_BCRYPT, ['cost' => 12]);

        $pdo->prepare(
            "INSERT INTO users (name, email, password_hash, subscription_plan, subscription_status, created_at)
             VALUES (?, ?, ?, 'free', 'active', NOW())"
        )->execute([trim((string) $data['name']), $email, $hash]);

        $userId = (int) $pdo->lastInsertId();
        $user   = ['id' => $userId, 'email' => $email, 'name' => $data['name'], 'plan' => 'free', 'is_admin' => false];

        $token = TokenService::generateAccessToken($user);
        TokenService::issueRefreshToken($userId, $pdo);

        Response::created([
            'token'      => $token,
            'expires_in' => TokenService::accessTtl(),
            'token_type' => 'Bearer',
            'user'       => $user,
        ], 'Cuenta creada correctamente');
    }
}
