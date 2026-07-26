<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers;

use PicoPlaca\App\Middleware\AuthMiddleware;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;
use PicoPlaca\Core\Validator;

abstract class BaseController
{
    /** Valida el JWT de sesion y devuelve el payload. Termina con 401 si es invalido. */
    protected function requireAuth(Request $request): object
    {
        return AuthMiddleware::handle($request);
    }

    /** JWT + is_admin. MVP: sin RBAC granular (ver plan_change_proposals para permisos futuros por rol). */
    protected function requireAdmin(Request $request): object
    {
        $jwt = $this->requireAuth($request);
        if (empty($jwt->is_admin)) {
            Response::forbidden('Acceso denegado');
        }
        return $jwt;
    }

    protected function validate(array $data, array $rules): array
    {
        return Validator::validate($data, $rules);
    }
}
