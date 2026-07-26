<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

/**
 * Resuelve la IP real del cliente de forma resistente a spoofing de
 * X-Forwarded-For / X-Real-IP (cabeceras que el cliente controla).
 * Solo confia en ellas si el peer directo es un proxy conocido (loopback,
 * rangos privados o Cloudflare) — ver TRUSTED_PROXIES en .env para agregar mas.
 */
final class ClientIp
{
    private static ?array $trusted = null;

    private const DEFAULT_TRUSTED = [
        '127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16',
        '::1/128', 'fc00::/7',
    ];

    private const CLOUDFLARE_RANGES = [
        '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
        '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
        '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
        '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
        '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
        '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
    ];

    public static function resolve(): string
    {
        $remote = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        if (!self::isTrusted($remote)) {
            return $remote;
        }

        if (self::inRanges($remote, self::CLOUDFLARE_RANGES)) {
            $cf = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
            if ($cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) {
                return $cf;
            }
        }

        $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if ($xff !== '') {
            $parts = array_map('trim', explode(',', $xff));
            for ($i = count($parts) - 1; $i >= 0; $i--) {
                $ip = $parts[$i];
                if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP) && !self::isTrusted($ip)) {
                    return $ip;
                }
            }
        }

        $real = $_SERVER['HTTP_X_REAL_IP'] ?? '';
        if ($real !== '' && filter_var($real, FILTER_VALIDATE_IP)) {
            return $real;
        }

        return $remote;
    }

    private static function isTrusted(string $ip): bool
    {
        return self::inRanges($ip, self::trustedRanges());
    }

    private static function inRanges(string $ip, array $ranges): bool
    {
        foreach ($ranges as $range) {
            if (self::ipInCidr($ip, $range)) {
                return true;
            }
        }
        return false;
    }

    private static function trustedRanges(): array
    {
        if (self::$trusted !== null) {
            return self::$trusted;
        }

        $ranges = array_merge(self::DEFAULT_TRUSTED, self::CLOUDFLARE_RANGES);
        $env = ($_ENV['TRUSTED_PROXIES'] ?? getenv('TRUSTED_PROXIES')) ?: '';
        if ($env !== '') {
            foreach (explode(',', $env) as $entry) {
                $entry = trim($entry);
                if ($entry !== '') {
                    $ranges[] = $entry;
                }
            }
        }

        return self::$trusted = $ranges;
    }

    private static function ipInCidr(string $ip, string $cidr): bool
    {
        if (!str_contains($cidr, '/')) {
            return $ip === $cidr;
        }

        [$subnet, $bits] = explode('/', $cidr, 2);
        $bits = (int) $bits;

        $ipBin     = @inet_pton($ip);
        $subnetBin = @inet_pton($subnet);
        if ($ipBin === false || $subnetBin === false || strlen($ipBin) !== strlen($subnetBin)) {
            return false;
        }

        $bytes = intdiv($bits, 8);
        $rem   = $bits % 8;

        if ($bytes > 0 && substr($ipBin, 0, $bytes) !== substr($subnetBin, 0, $bytes)) {
            return false;
        }

        if ($rem === 0) {
            return true;
        }

        $mask = chr((0xFF << (8 - $rem)) & 0xFF);
        return (ord($ipBin[$bytes]) & ord($mask)) === (ord($subnetBin[$bytes]) & ord($mask));
    }
}
