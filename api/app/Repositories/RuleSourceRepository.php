<?php

declare(strict_types=1);

namespace PicoPlaca\App\Repositories;

use PicoPlaca\Core\Database;

class RuleSourceRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findByCity(int $cityId): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, city_id, url, source_type, last_checked_at, last_status
             FROM rule_sources WHERE city_id = ? ORDER BY source_type"
        );
        $stmt->execute([$cityId]);
        return $stmt->fetchAll();
    }

    public function touch(int $id, string $status): void
    {
        $this->db->prepare(
            "UPDATE rule_sources SET last_checked_at = NOW(), last_status = ? WHERE id = ?"
        )->execute([$status, $id]);
    }
}
