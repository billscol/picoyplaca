<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

class Request
{
    private array $body;
    private array $query;
    private array $headers;
    private string $rawBodyCache;
    private array $attributes = [];

    public function __construct()
    {
        $this->query        = $_GET;
        $this->rawBodyCache = file_get_contents('php://input') ?: '';
        $this->body         = $this->parseBody();
        $fromGetAll         = function_exists('getallheaders') ? (getallheaders() ?: []) : [];
        $this->headers      = !empty($fromGetAll) ? $fromGetAll : $this->headersFromServer();
    }

    public function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public function path(): string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        return '/' . trim(is_string($uri) ? $uri : '/', '/');
    }

    public function body(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->body;
        }
        return $this->body[$key] ?? $default;
    }

    public function query(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->query;
        }
        return $this->query[$key] ?? $default;
    }

    public function header(string $name): ?string
    {
        $normalized = strtolower($name);
        foreach ($this->headers as $key => $value) {
            if (strtolower($key) === $normalized) {
                return $value;
            }
        }
        return null;
    }

    public function rawBody(): string
    {
        return $this->rawBodyCache;
    }

    public function bearerToken(): ?string
    {
        $auth = $this->header('Authorization');
        if ($auth && str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }

    public function ip(): string
    {
        return ClientIp::resolve();
    }

    public function isJson(): bool
    {
        $ct = $_SERVER['CONTENT_TYPE'] ?? '';
        return str_contains($ct, 'application/json');
    }

    public function only(array $keys): array
    {
        return array_intersect_key($this->body, array_flip($keys));
    }

    public function setAttribute(string $key, mixed $value): void
    {
        $this->attributes[$key] = $value;
    }

    public function getAttribute(string $key, mixed $default = null): mixed
    {
        return $this->attributes[$key] ?? $default;
    }

    private function headersFromServer(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = ucwords(strtolower(str_replace('_', '-', substr($key, 5))), '-');
                $headers[$name] = $value;
            } elseif (in_array($key, ['CONTENT_TYPE', 'CONTENT_LENGTH'], true)) {
                $name = ucwords(strtolower(str_replace('_', '-', $key)), '-');
                $headers[$name] = $value;
            }
        }
        return $headers;
    }

    private function parseBody(): array
    {
        $ct = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($ct, 'application/json')) {
            return json_decode($this->rawBodyCache, true) ?? [];
        }

        return $_POST;
    }
}
