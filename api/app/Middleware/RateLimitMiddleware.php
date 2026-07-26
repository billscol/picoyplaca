<?php

declare(strict_types=1);

namespace PicoPlaca\App\Middleware;

use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

/** Rate limiting por IP para endpoints publicos/sensibles (auth). Para el producto de API, ver ApiKeyMiddleware. */
class RateLimitMiddleware
{
    private static string $storageDir = __DIR__ . '/../../storage/rate_limit/';

    private const STRICT_LIMITS = [
        'auth:login'    => [5, 300],
        'auth:register' => [3, 3600],
        'auth:refresh'  => [30, 60],
    ];

    private const ACCOUNT_MAX_FAILURES = 15;
    private const ACCOUNT_WINDOW       = 900;

    public static function handle(Request $request, string $key = 'global'): void
    {
        if (isset(self::STRICT_LIMITS[$key])) {
            [$maxRequests, $windowSecs] = self::STRICT_LIMITS[$key];
        } else {
            $maxRequests = (int) (getenv('RATE_LIMIT_REQUESTS') ?: 60);
            $windowSecs  = (int) (getenv('RATE_LIMIT_WINDOW') ?: 60);
        }

        $ip = $request->ip();

        [$count, $reset] = Cache::isAvailable()
            ? self::redisIncr($ip, $key, $windowSecs)
            : self::fileIncr($ip, $key, $windowSecs);

        header('X-RateLimit-Limit: ' . $maxRequests);
        header('X-RateLimit-Remaining: ' . max(0, $maxRequests - $count));
        header('X-RateLimit-Reset: ' . $reset);

        if ($count > $maxRequests) {
            header('Retry-After: ' . max(1, $reset - time()));
            Response::error('Demasiadas solicitudes. Intenta de nuevo mas tarde.', 429);
        }
    }

    private static function accountBucket(string $identifier): string
    {
        return 'auth:fail:acct:' . hash('sha256', strtolower(trim($identifier)));
    }

    public static function accountFailureGuard(string $identifier): void
    {
        if ($identifier === '' || !Cache::isAvailable()) {
            return;
        }
        $bucket = self::accountBucket($identifier);
        $count  = (int) (Cache::get($bucket) ?: 0);
        if ($count >= self::ACCOUNT_MAX_FAILURES) {
            $ttl = Cache::ttl($bucket);
            header('Retry-After: ' . ($ttl > 0 ? $ttl : self::ACCOUNT_WINDOW));
            Response::error('Demasiados intentos fallidos para esta cuenta. Intenta mas tarde.', 429);
        }
    }

    public static function recordAccountFailure(string $identifier): void
    {
        if ($identifier === '' || !Cache::isAvailable()) {
            return;
        }
        Cache::rateIncr(self::accountBucket($identifier), self::ACCOUNT_WINDOW);
    }

    public static function clearAccountFailures(string $identifier): void
    {
        if ($identifier === '' || !Cache::isAvailable()) {
            return;
        }
        Cache::del(self::accountBucket($identifier));
    }

    private static function redisIncr(string $ip, string $key, int $windowSecs): array
    {
        $bucket = "rate:{$ip}:{$key}";
        $count  = Cache::rateIncr($bucket, $windowSecs);
        $ttl    = Cache::ttl($bucket);
        return [$count, $ttl > 0 ? time() + $ttl : time() + $windowSecs];
    }

    private static function fileIncr(string $ip, string $key, int $windowSecs): array
    {
        if (!is_dir(self::$storageDir)) {
            mkdir(self::$storageDir, 0755, true);
        }

        $file = self::$storageDir . md5("{$ip}:{$key}") . '.json';
        $now  = time();
        $data = self::readBucket($file);

        if ($now - $data['window_start'] >= $windowSecs) {
            $data = ['count' => 0, 'window_start' => $now];
        }

        $data['count']++;
        self::writeBucket($file, $data);

        return [$data['count'], $data['window_start'] + $windowSecs];
    }

    private static function readBucket(string $file): array
    {
        if (!file_exists($file)) {
            return ['count' => 0, 'window_start' => time()];
        }
        $raw = @file_get_contents($file);
        return $raw ? (json_decode($raw, true) ?? ['count' => 0, 'window_start' => time()]) : ['count' => 0, 'window_start' => time()];
    }

    private static function writeBucket(string $file, array $data): void
    {
        file_put_contents($file, json_encode($data), LOCK_EX);
    }
}
