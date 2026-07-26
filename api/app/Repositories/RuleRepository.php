<?php

declare(strict_types=1);

namespace PicoPlaca\App\Repositories;

use PicoPlaca\Core\Database;

class RuleRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findCurrentByCity(int $cityId): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, city_id, payload_json, effective_from, effective_to, source_url, created_at
             FROM rules WHERE city_id = ? AND is_current = 1
             ORDER BY effective_from DESC LIMIT 1"
        );
        $stmt->execute([$cityId]);
        $row = $stmt->fetch();
        if ($row) {
            $row['payload'] = json_decode($row['payload_json'], true) ?? [];
        }
        return $row ?: null;
    }

    /** Reemplaza la regla vigente: marca la anterior como no-current e inserta la nueva. */
    public function publish(int $cityId, array $payload, string $sourceUrl): int
    {
        $this->db->beginTransaction();
        try {
            $this->db->prepare(
                "UPDATE rules SET is_current = 0, effective_to = CURDATE() WHERE city_id = ? AND is_current = 1"
            )->execute([$cityId]);

            $this->db->prepare(
                "INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
                 VALUES (?, ?, CURDATE(), 1, ?)
                 ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), is_current = 1, source_url = VALUES(source_url)"
            )->execute([$cityId, json_encode($payload, JSON_UNESCAPED_UNICODE), $sourceUrl]);

            $id = (int) $this->db->lastInsertId();
            $this->db->commit();
            return $id;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
