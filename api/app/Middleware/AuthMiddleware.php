<?php

declare(strict_types=1);

namespace PicoPlaca\App\Middleware;

use PicoPlaca\App\Services\TokenService;
use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

/** Autenticacion de sesion de usuario (dashboard). Para el producto de la API externa, ver ApiKeyMiddleware. */
class AuthMiddleware
{
    public static function handle(Request $request): object
    {
        $token = $request->bearerToken();

        if (empty($token)) {
            Response::unauthorized('Token de autorizacion requerido');
        }

        $cached = $request->getAttribute('auth_jwt');
        if ($cached !== null && $request->getAttribute('auth_jwt_token') === $token) {
            return $cached;
        }

        try {
            $payload = JWT::decode($token, new Key(TokenService::publicKey(), 'RS256'));
        } catch (ExpiredException) {
            Response::unauthorized('Token expirado');
        } catch (SignatureInvalidException) {
            Response::unauthorized('Firma del token invalida');
        } catch (\Exception) {
            Response::unauthorized('Token invalido');
        }

        $tokenType = $payload->type ?? TokenService::TYPE_ACCESS;
        if ($tokenType !== TokenService::TYPE_ACCESS) {
            Response::unauthorized('Tipo de token no valido para este endpoint');
        }

        $tokenHash = hash('sha256', $token);
        if (Cache::isTokenBlacklisted($tokenHash)) {
            Response::unauthorized('Token revocado');
        }

        $request->setAttribute('auth_jwt', $payload);
        $request->setAttribute('auth_jwt_token', $token);

        return $payload;
    }
}
