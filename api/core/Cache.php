<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

use Predis\Client as RedisClient;

/**
 * Wrapper de Redis para cache, rate limiting y blacklist de tokens.
 * Fallback no-op: si Redis no esta disponible la API sigue funcionando,
 * solo sin cache/rate-limit distribuido (RateLimitMiddleware cae a archivo).
 */
class Cache
{
    private static ?RedisClient $client    = null;
    private static bool         $available = false;
    private static string       $prefix    = 'picoyplaca:';

    public static function connect(): void
    {
        $host   = getenv('REDIS_HOST')     ?: '127.0.0.1';
        $port   = (int) (getenv('REDIS_PORT') ?: 6379);
        $pass   = getenv('REDIS_PASSWORD') ?: null;
        $prefix = getenv('REDIS_PREFIX')   ?: 'picoyplaca';

        self::$prefix = $prefix . ':';

        try {
            $params = ['scheme' => 'tcp', 'host' => $host, 'port' => $port];
            if ($pass) {
                $params['password'] = $pass;
            }

            self::$client = new RedisClient($params, ['exceptions' => true]);
            self::$client->ping();
            self::$available = true;
        } catch (\Throwable) {
            self::$available = false;
            self::$client    = null;
        }
    }

    public static function isAvailable(): bool
    {
        return self::$available;
    }

    public static function get(string $key): mixed
    {
        if (!self::$available) {
            return null;
        }
        try {
            $raw = self::$client->get(self::k($key));
            return $raw !== null ? json_decode($raw, true) : null;
        } catch (\Throwable) {
            return null;
        }
    }

    public static function set(string $key, mixed $value, int $ttl = 300): bool
    {
        if (!self::$available) {
            return false;
        }
        try {
            self::$client->setex(self::k($key), $ttl, json_encode($value));
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public static function del(string $key): void
    {
        if (!self::$available) {
            return;
        }
        try {
            self::$client->del([self::k($key)]);
        } catch (\Throwable) {}
    }

    public static function exists(string $key): bool
    {
        if (!self::$available) {
            return false;
        }
        try {
            return (bool) self::$client->exists(self::k($key));
        } catch (\Throwable) {
            return false;
        }
    }

    public static function ttl(string $key): int
    {
        if (!self::$available) {
            return -1;
        }
        try {
            return (int) self::$client->ttl(self::k($key));
        } catch (\Throwable) {
            return -1;
        }
    }

    /** Rate limiting — INCR + EXPIRE atomico. @return int Conteo actual (0 si Redis caido). */
    public static function rateIncr(string $bucket, int $windowSecs): int
    {
        if (!self::$available) {
            return 0;
        }
        try {
            $k     = self::k($bucket);
            $count = (int) self::$client->incr($k);
            if ($count === 1) {
                self::$client->expire($k, $windowSecs);
            }
            return $count;
        } catch (\Throwable) {
            return 0;
        }
    }

    public static function blacklistToken(string $tokenHash, int $ttl): void
    {
        if ($ttl <= 0) {
            return;
        }
        self::set("blacklist:{$tokenHash}", 1, $ttl);
    }

    public static function isTokenBlacklisted(string $tokenHash): bool
    {
        return self::exists("blacklist:{$tokenHash}");
    }

    /** Cuota de API requests consumida en el periodo actual de un API key. */
    public static function apiUsageIncr(int $apiKeyId, string $period): int
    {
        return self::rateIncr("usage:{$apiKeyId}:{$period}", 32 * 24 * 3600);
    }

    public static function delByPattern(string $pattern): void
    {
        if (!self::$available) {
            return;
        }
        try {
            $cursor      = '0';
            $fullPattern = self::k($pattern);
            do {
                $result = self::$client->scan($cursor, ['MATCH' => $fullPattern, 'COUNT' => 100]);
                $cursor = (string) $result[0];
                $keys   = $result[1] ?? [];
                if (!empty($keys)) {
                    self::$client->del($keys);
                }
            } while ($cursor !== '0');
        } catch (\Throwable) {}
    }

    private static function k(string $key): string
    {
        return self::$prefix . $key;
    }
}
