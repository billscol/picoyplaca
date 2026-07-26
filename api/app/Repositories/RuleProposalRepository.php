<?php

declare(strict_types=1);

namespace PicoPlaca\App\Repositories;

use PicoPlaca\Core\Database;

class RuleProposalRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(int $cityId, array $proposedPayload, string $diffSummary, string $sourceUrl, float $confidence, string $status): int
    {
        $this->db->prepare(
            "INSERT INTO rule_change_proposals (city_id, proposed_payload_json, diff_summary, source_url, confidence_score, status)
             VALUES (?, ?, ?, ?, ?, ?)"
        )->execute([
            $cityId,
            json_encode($proposedPayload, JSON_UNESCAPED_UNICODE),
            $diffSummary,
            $sourceUrl,
            $confidence,
            $status,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function pending(): array
    {
        $stmt = $this->db->query(
            "SELECT p.id, p.city_id, c.city_name, c.country_name, p.proposed_payload_json, p.diff_summary,
                    p.source_url, p.confidence_score, p.status, p.created_at
             FROM rule_change_proposals p
             JOIN cities c ON c.id = p.city_id
             WHERE p.status = 'pending'
             ORDER BY p.created_at ASC"
        );
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM rule_change_proposals WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function markReviewed(int $id, string $status, int $adminId): void
    {
        $this->db->prepare(
            "UPDATE rule_change_proposals SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?"
        )->execute([$status, $adminId, $id]);
    }
}
