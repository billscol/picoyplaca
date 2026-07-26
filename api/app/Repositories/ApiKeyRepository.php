<?php

declare(strict_types=1);

namespace PicoPlaca\App\Repositories;

use PicoPlaca\Core\Database;

class ApiKeyRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function listByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, name, key_prefix, last_used_at, expires_at, revoked, created_at
             FROM api_keys WHERE user_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /** @return array{id:int, raw_key:string} La key en claro solo se devuelve aqui, una vez. */
    public function create(int $userId, string $name): array
    {
        $raw    = 'pyp_' . bin2hex(random_bytes(24));
        $hash   = hash('sha256', $raw);
        $prefix = substr($raw, 0, 12);

        $this->db->prepare(
            "INSERT INTO api_keys (user_id, name, key_hash, key_prefix) VALUES (?, ?, ?, ?)"
        )->execute([$userId, $name, $hash, $prefix]);

        return ['id' => (int) $this->db->lastInsertId(), 'raw_key' => $raw];
    }

    public function revoke(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare("UPDATE api_keys SET revoked = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        return $stmt->rowCount() > 0;
    }
}
