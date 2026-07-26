<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

/**
 * Logger estructurado JSON — una linea por entrada, ingestable sin parser custom.
 * LOG_FORMAT=text en .env para formato plano legible en desarrollo.
 */
final class Logger
{
    public const DEBUG   = 'debug';
    public const INFO    = 'info';
    public const WARNING = 'warning';
    public const ERROR   = 'error';
    public const CRITICAL = 'critical';

    private static ?string $requestId = null;

    public static function bindRequest(?string $requestId = null): void
    {
        self::$requestId = $requestId
            ?? ($_SERVER['HTTP_X_REQUEST_ID'] ?? null)
            ?? bin2hex(random_bytes(8));
    }

    public static function requestId(): ?string
    {
        return self::$requestId;
    }

    public static function debug(string $message, array $context = []): void    { self::log(self::DEBUG, $message, $context); }
    public static function info(string $message, array $context = []): void     { self::log(self::INFO, $message, $context); }
    public static function warning(string $message, array $context = []): void  { self::log(self::WARNING, $message, $context); }
    public static function error(string $message, array $context = []): void    { self::log(self::ERROR, $message, $context); }
    public static function critical(string $message, array $context = []): void { self::log(self::CRITICAL, $message, $context); }

    public static function log(string $level, string $message, array $context = []): void
    {
        $minLevel = strtolower(($_ENV['LOG_LEVEL'] ?? getenv('LOG_LEVEL')) ?: 'info');
        if (self::levelRank($level) < self::levelRank($minLevel)) {
            return;
        }

        $format = strtolower(($_ENV['LOG_FORMAT'] ?? getenv('LOG_FORMAT')) ?: 'json');
        $format === 'text' ? self::writeText($level, $message, $context) : self::writeJson($level, $message, $context);
    }

    private static function writeJson(string $level, string $message, array $context): void
    {
        $entry = [
            'timestamp'  => date('c'),
            'level'      => $level,
            'message'    => $message,
            'service'    => 'picoyplaca-api',
            'env'        => ($_ENV['APP_ENV'] ?? getenv('APP_ENV')) ?: 'production',
            'request_id' => self::$requestId,
        ];
        if (!empty($context)) {
            $entry['context'] = self::sanitizeContext($context);
        }
        error_log(json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    private static function writeText(string $level, string $message, array $context): void
    {
        error_log(sprintf(
            '[%s] [%s] %s%s',
            date('Y-m-d H:i:s'),
            strtoupper($level),
            $message,
            empty($context) ? '' : ' ' . json_encode($context, JSON_UNESCAPED_UNICODE)
        ));
    }

    private static function levelRank(string $level): int
    {
        return match (strtolower($level)) {
            self::DEBUG => 100, self::INFO => 200, self::WARNING => 300,
            self::ERROR => 400, self::CRITICAL => 500, default => 200,
        };
    }

    private static function sanitizeContext(array $context): array
    {
        $sensitive = ['password', 'token', 'api_key', 'secret', 'jwt', 'authorization'];
        $out = [];
        foreach ($context as $key => $value) {
            $lower = strtolower((string) $key);
            $isSensitive = false;
            foreach ($sensitive as $needle) {
                if (str_contains($lower, $needle)) { $isSensitive = true; break; }
            }
            if ($isSensitive) {
                $out[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $out[$key] = self::sanitizeContext($value);
            } elseif ($value instanceof \Throwable) {
                $out[$key] = ['class' => get_class($value), 'message' => $value->getMessage(), 'line' => $value->getLine()];
            } else {
                $out[$key] = $value;
            }
        }
        return $out;
    }
}
