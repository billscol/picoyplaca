<?php

declare(strict_types=1);

namespace PicoPlaca\App\Jobs;

use PicoPlaca\App\Repositories\CityRepository;
use PicoPlaca\App\Repositories\RuleProposalRepository;
use PicoPlaca\App\Repositories\RuleRepository;
use PicoPlaca\App\Repositories\RuleSourceRepository;
use PicoPlaca\App\Services\Scraping\DataForSeoSearchProvider;
use PicoPlaca\App\Services\Scraping\HtmlTextExtractor;
use PicoPlaca\App\Services\Scraping\PageFetcher;
use PicoPlaca\App\Services\Scraping\RuleExtractionService;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Logger;

/**
 * Por ciudad: busca -> extrae con IA -> compara contra la regla vigente ->
 * guarda como propuesta. Nunca escribe directo en `rules` (ver plan: la
 * publicacion requiere aprobacion humana en el admin, salvo auto-aprobacion
 * de alta confianza cuando la propuesta simplemente re-confirma la regla actual).
 *
 * Umbral de auto-aprobacion: confidence >= 0.9 Y el payload es idéntico al vigente
 * (re-confirmacion, no cambio real) — cualquier cambio de contenido siempre queda pendiente.
 */
class PicoPlacaScrapeJob extends BaseJob
{
    private const AUTO_APPROVE_CONFIDENCE = 0.9;

    /** Idioma de busqueda por country_code — el resto de LATAM/Espana cae en 'es' por defecto. */
    private const LANGUAGE_BY_COUNTRY = [
        'US' => 'en',
        'BR' => 'pt',
    ];

    public function handle(array $payload): void
    {
        $cityId = (int) ($payload['city_id'] ?? 0);
        if ($cityId <= 0) {
            throw new \InvalidArgumentException('city_id requerido');
        }

        $city = (new CityRepository())->find($cityId);
        if (!$city || !$city['is_active']) {
            Logger::warning('PicoPlacaScrapeJob: ciudad inactiva o inexistente', ['city_id' => $cityId]);
            return;
        }

        $sources = (new RuleSourceRepository())->findByCity($cityId);

        // Cerrar la conexion a BD antes de las llamadas externas (fetch + LLM pueden tardar
        // varios segundos) — evita agotar max_connections con muchas ciudades en paralelo.
        Database::releaseConnection();

        $fullTexts = $this->fetchSources($sources);

        $searchResults = [];
        if (($_ENV['DATAFORSEO_LOGIN'] ?? getenv('DATAFORSEO_LOGIN')) && ($_ENV['DATAFORSEO_PASSWORD'] ?? getenv('DATAFORSEO_PASSWORD'))) {
            $query = $this->buildSearchQuery($city['city_name'], $city['country_name'], $city['country_code'], $city['restriction_model']);
            try {
                $searchResults = (new DataForSeoSearchProvider())->search($query, 5);
            } catch (\Throwable $e) {
                Logger::warning('PicoPlacaScrapeJob: DataForSEO fallo, se continua solo con rule_sources', [
                    'city_id' => $cityId, 'error' => $e->getMessage(),
                ]);
            }
        }

        $extraction = (new RuleExtractionService())->extract(
            $city['city_name'],
            $city['restriction_model'],
            $searchResults,
            $fullTexts
        );

        if (empty($extraction['payload'])) {
            Logger::warning('PicoPlacaScrapeJob: extraccion vacia', ['city_id' => $cityId, 'summary' => $extraction['summary']]);
            return;
        }

        $currentRule = (new RuleRepository())->findCurrentByCity($cityId);
        $isSamePayload = $currentRule && $this->normalize($currentRule['payload']) === $this->normalize($extraction['payload']);

        $status = ($isSamePayload && $extraction['confidence'] >= self::AUTO_APPROVE_CONFIDENCE)
            ? 'auto_approved'
            : 'pending';

        $diffSummary = $isSamePayload
            ? "Sin cambios — regla reconfirmada. {$extraction['summary']}"
            : "Posible cambio detectado. {$extraction['summary']}";

        $proposals = new RuleProposalRepository();
        $proposalId = $proposals->create(
            $cityId,
            $extraction['payload'],
            $diffSummary,
            $extraction['source_url'],
            $extraction['confidence'],
            $status
        );

        if ($status === 'auto_approved') {
            (new RuleRepository())->publish($cityId, $extraction['payload'], $extraction['source_url']);
        }

        Logger::info('PicoPlacaScrapeJob completado', [
            'city_id' => $cityId, 'proposal_id' => $proposalId, 'status' => $status, 'confidence' => $extraction['confidence'],
        ]);
    }

    private function normalize(array $payload): string
    {
        ksort($payload);
        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    /**
     * La terminologia de busqueda depende del modelo (pico y placa / ZBE / peaje de
     * congestion NO son sinonimos) y el idioma depende del pais — buscar "pico y placa"
     * en Madrid o "congestion pricing" en Bogota no trae resultados utiles.
     */
    private function buildSearchQuery(string $cityName, string $countryName, string $countryCode, string $restrictionModel): string
    {
        $year     = date('Y');
        $language = self::LANGUAGE_BY_COUNTRY[$countryCode] ?? 'es';

        $templates = [
            'es' => [
                'plate_digit_day'     => "pico y placa restriccion vehicular {$cityName} {$countryName} {$year} vigente",
                'emission_label_zone' => "zona de bajas emisiones ZBE {$cityName} {$countryName} etiqueta ambiental restriccion {$year}",
                'congestion_charge'   => "peaje de congestion {$cityName} {$countryName} tarifa zona horario {$year}",
            ],
            'en' => [
                'plate_digit_day'     => "license plate driving restriction {$cityName} {$countryName} {$year} current rules",
                'emission_label_zone' => "low emission zone {$cityName} {$countryName} restriction {$year}",
                'congestion_charge'   => "congestion pricing {$cityName} {$countryName} fee zone hours {$year}",
            ],
            'pt' => [
                'plate_digit_day'     => "rodizio restricao de veiculos placa {$cityName} {$countryName} {$year} vigente",
                'emission_label_zone' => "zona de baixas emissoes {$cityName} {$countryName} restricao {$year}",
                'congestion_charge'   => "pedagio de congestionamento {$cityName} {$countryName} tarifa horario {$year}",
            ],
        ];

        return $templates[$language][$restrictionModel] ?? $templates['es']['plate_digit_day'];
    }

    /**
     * Trae el texto completo de cada fuente registrada (gov_official + aggregator) y
     * actualiza last_checked_at/last_status. Una fuente que falla no detiene a las demas.
     *
     * @param array $sources filas de rule_sources
     * @return array{0: array{url: string, text: string}} solo las que se pudieron leer
     */
    private function fetchSources(array $sources): array
    {
        if (empty($sources)) {
            return [];
        }

        $fetcher   = new PageFetcher();
        $extractor = new HtmlTextExtractor();
        $repo      = new RuleSourceRepository();
        $fullTexts = [];

        foreach ($sources as $source) {
            $html = $fetcher->fetch($source['url']);
            if ($html === null) {
                $repo->touch((int) $source['id'], 'unreachable');
                Logger::warning('PicoPlacaScrapeJob: fuente inalcanzable', ['url' => $source['url']]);
                continue;
            }

            $text = $extractor->extractText($html);
            if ($text === '') {
                $repo->touch((int) $source['id'], 'unreachable');
                continue;
            }

            $repo->touch((int) $source['id'], 'ok');
            $fullTexts[] = ['url' => $source['url'], 'text' => $text];
        }

        return $fullTexts;
    }
}
