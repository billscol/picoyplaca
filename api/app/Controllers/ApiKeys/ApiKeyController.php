<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\ApiKeys;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Repositories\ApiKeyRepository;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

/** Gestion de API keys desde el dashboard del usuario (auth via JWT de sesion). */
class ApiKeyController extends BaseController
{
    public function index(Request $request, array $params): void
    {
        $jwt = $this->requireAuth($request);
        $keys = (new ApiKeyRepository())->listByUser((int) $jwt->sub);
        Response::success($keys);
    }

    public function store(Request $request, array $params): void
    {
        $jwt  = $this->requireAuth($request);
        $data = $request->body();

        $errors = $this->validate($data, ['name' => 'required|string|min:2|max:120']);
        if ($errors) {
            Response::unprocessable($errors);
        }

        $result = (new ApiKeyRepository())->create((int) $jwt->sub, trim((string) $data['name']));

        // El valor en claro (raw_key) solo se muestra esta vez — el dashboard debe advertir al usuario.
        Response::created($result, 'API key creada. Guarda el valor, no se volvera a mostrar.');
    }

    public function destroy(Request $request, array $params): void
    {
        $jwt = $this->requireAuth($request);
        $id  = (int) ($params['id'] ?? 0);

        $ok = (new ApiKeyRepository())->revoke($id, (int) $jwt->sub);
        if (!$ok) {
            Response::notFound('API key no encontrada');
        }

        Response::success(null, 'API key revocada');
    }
}
