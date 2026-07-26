<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Admin;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Repositories\CityRepository;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class CityController extends BaseController
{
    /** GET /v1/admin/cities — catalogo completo (incl. inactivas), para gestion. */
    public function index(Request $request, array $params): void
    {
        $this->requireAdmin($request);
        Response::success((new CityRepository())->all());
    }

    /** POST /v1/admin/cities — agrega una ciudad nueva al catalogo monitoreado. */
    public function store(Request $request, array $params): void
    {
        $this->requireAdmin($request);
        $data = $request->body();

        $errors = $this->validate($data, [
            'country_code'      => 'required|string|max:2',
            'country_name'      => 'required|string|max:80',
            'city_name'         => 'required|string|max:80',
            'slug'              => 'required|alpha_dash|max:100',
            'timezone'          => 'required|string|max:60',
            'restriction_model' => 'required|in:plate_digit_day,emission_label_zone,congestion_charge',
        ]);
        if ($errors) {
            Response::unprocessable($errors);
        }

        $id = (new CityRepository())->create($data);
        Response::created(['id' => $id], 'Ciudad agregada');
    }

    /** PATCH /v1/admin/cities/{id}/active — activa/desactiva monitoreo de una ciudad. */
    public function toggleActive(Request $request, array $params): void
    {
        $this->requireAdmin($request);
        $id     = (int) ($params['id'] ?? 0);
        $active = filter_var($request->body('active', true), FILTER_VALIDATE_BOOLEAN);

        (new CityRepository())->setActive($id, $active);
        Response::success(null, 'Ciudad actualizada');
    }

    /** POST /v1/admin/cities/{id}/sources — agrega una fuente a monitorear semanalmente. */
    public function addSource(Request $request, array $params): void
    {
        $this->requireAdmin($request);
        $cityId = (int) ($params['id'] ?? 0);
        $data   = $request->body();

        $errors = $this->validate($data, ['url' => 'required|url']);
        if ($errors) {
            Response::unprocessable($errors);
        }

        Database::getInstance()->prepare(
            "INSERT INTO rule_sources (city_id, url, source_type) VALUES (?, ?, ?)"
        )->execute([$cityId, $data['url'], $data['source_type'] ?? 'gov_official']);

        Response::created(null, 'Fuente agregada');
    }
}
