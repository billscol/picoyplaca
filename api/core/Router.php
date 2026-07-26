<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

class Router
{
    private array  $routes     = [];
    private string $prefix     = '';
    private array  $middleware = [];

    public function get(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function patch(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    public function delete(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    /**
     * Agrupa rutas con un prefijo de path y/o middleware compartidos. Anidable.
     */
    public function group(string $prefix, array $middleware, \Closure $callback): void
    {
        $previousPrefix     = $this->prefix;
        $previousMiddleware = $this->middleware;

        $this->prefix     = $previousPrefix . $prefix;
        $this->middleware = array_merge($previousMiddleware, $middleware);

        $callback($this);

        $this->prefix     = $previousPrefix;
        $this->middleware = $previousMiddleware;
    }

    public function dispatch(Request $request): void
    {
        $method      = $request->method();
        $uri         = $request->path();
        $pathMatched = false;

        foreach ($this->routes as $route) {
            $pattern = $this->pathToRegex($route['path']);

            if (!preg_match($pattern, $uri, $matches)) {
                continue;
            }

            $pathMatched = true;

            if ($route['method'] !== $method) {
                continue;
            }

            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

            foreach ($route['middleware'] as $mw) {
                if (is_callable($mw)) {
                    $mw($request);
                } else {
                    $mw::handle($request);
                }
            }

            $this->callHandler($route['handler'], $request, $params);
            return;
        }

        if ($pathMatched) {
            Response::error('Metodo no permitido', 405);
        } else {
            Response::notFound('Ruta no encontrada');
        }
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $routeMiddleware = []): void
    {
        $this->routes[] = [
            'method'     => strtoupper($method),
            'path'       => $this->prefix . $path,
            'handler'    => $handler,
            'middleware' => array_merge($this->middleware, $routeMiddleware),
        ];
    }

    private function pathToRegex(string $path): string
    {
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function callHandler(callable|array $handler, Request $request, array $params): void
    {
        if (is_callable($handler)) {
            $handler($request, $params);
            return;
        }

        [$class, $method] = $handler;
        $controller = new $class();
        $controller->$method($request, $params);
    }
}
