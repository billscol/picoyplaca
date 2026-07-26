<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

class Response
{
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): never
    {
        self::json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    public static function created(mixed $data = null, string $message = 'Recurso creado'): never
    {
        self::success($data, $message, 201);
    }

    public static function error(string $message, int $status = 400, mixed $errors = null): never
    {
        $payload = ['success' => false, 'error' => $message];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $status);
    }

    public static function unauthorized(string $message = 'No autorizado'): never
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acceso denegado'): never
    {
        self::error($message, 403);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): never
    {
        self::error($message, 404);
    }

    public static function unprocessable(array $errors, string $message = 'Datos invalidos'): never
    {
        self::error($message, 422, $errors);
    }

    public static function serverError(string $message = 'Error del servidor', ?\Throwable $e = null): never
    {
        $debug = filter_var($_ENV['APP_DEBUG'] ?? getenv('APP_DEBUG') ?? false, FILTER_VALIDATE_BOOLEAN);
        if ($debug && $e !== null) {
            $message = $e->getMessage() . ' in ' . basename($e->getFile()) . ':' . $e->getLine();
        }
        self::error($message, 500);
    }

    public static function badRequest(string $message = 'Solicitud invalida'): never
    {
        self::error($message, 400);
    }

    /** 403 — el plan actual no incluye esta funcion. */
    public static function planRequired(string $currentPlan): never
    {
        self::json([
            'success' => false, 'error' => 'Tu plan actual no incluye esta funcion',
            'code' => 'PLAN_REQUIRED', 'current_plan' => $currentPlan, 'upgrade_url' => '/planes',
        ], 403);
    }

    /** 402 — la API key agoto su cuota de requests del periodo. */
    public static function quotaExceeded(int $limit, string $period): never
    {
        self::json([
            'success' => false, 'error' => 'Has agotado tu cuota de requests para este periodo',
            'code' => 'QUOTA_EXCEEDED', 'limit' => $limit, 'period' => $period, 'upgrade_url' => '/planes',
        ], 402);
    }
}
