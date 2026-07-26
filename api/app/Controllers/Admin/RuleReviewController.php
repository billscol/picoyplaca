<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Admin;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Repositories\RuleProposalRepository;
use PicoPlaca\App\Repositories\RuleRepository;
use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

/** Cola de revision: lo que produce el agente semanal (bin/cron-picoplaca-scrape.php) nunca
 *  se publica solo — un admin humano aprueba o rechaza cada propuesta desde aqui. */
class RuleReviewController extends BaseController
{
    /** GET /v1/admin/rule-proposals — propuestas pendientes de revision. */
    public function pending(Request $request, array $params): void
    {
        $this->requireAdmin($request);

        $rows = array_map(function (array $row): array {
            $row['proposed_payload'] = json_decode($row['proposed_payload_json'], true);
            unset($row['proposed_payload_json']);
            return $row;
        }, (new RuleProposalRepository())->pending());

        Response::success($rows);
    }

    /** POST /v1/admin/rule-proposals/{id}/approve — publica la propuesta como regla vigente. */
    public function approve(Request $request, array $params): void
    {
        $jwt = $this->requireAdmin($request);
        $id  = (int) ($params['id'] ?? 0);

        $proposals = new RuleProposalRepository();
        $proposal  = $proposals->find($id);
        if (!$proposal || $proposal['status'] !== 'pending') {
            Response::notFound('Propuesta no encontrada o ya revisada');
        }

        $payload = json_decode($proposal['proposed_payload_json'], true) ?? [];
        (new RuleRepository())->publish((int) $proposal['city_id'], $payload, (string) $proposal['source_url']);
        $proposals->markReviewed($id, 'approved', (int) $jwt->sub);

        Cache::del('cities:list');
        Cache::delByPattern('check:*');

        Response::success(null, 'Propuesta aprobada y publicada');
    }

    /** POST /v1/admin/rule-proposals/{id}/reject */
    public function reject(Request $request, array $params): void
    {
        $jwt = $this->requireAdmin($request);
        $id  = (int) ($params['id'] ?? 0);

        $proposals = new RuleProposalRepository();
        $proposal  = $proposals->find($id);
        if (!$proposal || $proposal['status'] !== 'pending') {
            Response::notFound('Propuesta no encontrada o ya revisada');
        }

        $proposals->markReviewed($id, 'rejected', (int) $jwt->sub);
        Response::success(null, 'Propuesta rechazada');
    }
}
