<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\PicoPlaca;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Middleware\ApiKeyMiddleware;
use PicoPlaca\App\Repositories\CityRepository;
use PicoPlaca\App\Repositories\RuleRepository;
use PicoPlaca\App\Services\Rules\RuleEvaluatorFactory;
use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class RulesController extends BaseController
{
    /** GET /v1/pico-placa/cities — catalogo publico, sin auth (para landing y docs). */
    public function cities(Request $request, array $params): void
    {
        $cached = Cache::get('cities:list');
        if ($cached !== null) {
            Response::success($cached);
        }

        $cities = (new CityRepository())->allActive();
        Cache::set('cities:list', $cities, 3600);
        Response::success($cities);
    }

    /** GET /v1/pico-placa/rules/{slug} — regla vigente legible, sin auth. */
    public function show(Request $request, array $params): void
    {
        $slug = $params['slug'] ?? '';
        $city = (new CityRepository())->findBySlug($slug);
        if (!$city) {
            Response::notFound('Ciudad no encontrada');
        }

        $rule = (new RuleRepository())->findCurrentByCity((int) $city['id']);
        if (!$rule) {
            Response::notFound('Sin regla vigente para esta ciudad');
        }

        Response::success([
            'city' => $city,
            'rule' => [
                'payload'        => $rule['payload'],
                'effective_from' => $rule['effective_from'],
                'source_url'     => $rule['source_url'],
                'last_verified'  => $rule['created_at'],
            ],
        ]);
    }

    /**
     * GET /v1/pico-placa/check?city=&plate=&date=&label= — endpoint principal del producto.
     * Requiere API key (cuota + rate limit segun plan, ver ApiKeyMiddleware).
     */
    public function check(Request $request, array $params): void
    {
        $auth = ApiKeyMiddleware::handle($request);

        $slug = (string) $request->query('city', '');
        $date = (string) $request->query('date', date('Y-m-d'));

        $errors = $this->validate(['city' => $slug, 'date' => $date], [
            'city' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
        ]);
        if ($errors) {
            Response::unprocessable($errors);
        }

        $cacheKey = "check:{$slug}:{$date}:" . md5(json_encode($request->query()));
        $cached   = Cache::get($cacheKey);
        if ($cached !== null) {
            Response::success($cached);
        }

        $city = (new CityRepository())->findBySlug($slug);
        if (!$city) {
            Response::notFound('Ciudad no encontrada. Consulta GET /v1/pico-placa/cities');
        }

        $rule = (new RuleRepository())->findCurrentByCity((int) $city['id']);
        if (!$rule) {
            Response::notFound('Sin regla vigente para esta ciudad');
        }

        $evaluator = RuleEvaluatorFactory::make($city['restriction_model']);
        $result    = $evaluator->evaluate($rule['payload'], [
            'plate' => $request->query('plate'),
            'date'  => $date,
            'label' => $request->query('label'),
        ]);

        $response = [
            'city'            => ['slug' => $city['slug'], 'name' => $city['city_name'], 'country' => $city['country_name'], 'timezone' => $city['timezone']],
            'date'            => $date,
            'restriction_model' => $city['restriction_model'],
            'restricted'      => $result['restricted'],
            'reason'          => $result['reason'],
            'details'         => $result['details'],
            'source_url'      => $rule['source_url'],
            'last_verified'   => $rule['created_at'],
            'disclaimer'      => 'Informacion de referencia, no reemplaza la fuente oficial.',
        ];

        Cache::set($cacheKey, $response, 86400);
        Response::success($response);
    }
}
