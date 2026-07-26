<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Admin;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class UserController extends BaseController
{
    /** GET /v1/admin/users?page=&search= */
    public function index(Request $request, array $params): void
    {
        $this->requireAdmin($request);

        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;
        $search = trim((string) $request->query('search', ''));

        $pdo = Database::getInstance();

        $where  = '';
        $bindings = [];
        if ($search !== '') {
            $where = 'WHERE name LIKE ? OR email LIKE ?';
            $bindings = ["%{$search}%", "%{$search}%"];
        }

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM users {$where}");
        $countStmt->execute($bindings);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT id, name, email, is_admin, subscription_plan, subscription_status, subscription_ends_at, created_at, last_login_at
             FROM users {$where}
             ORDER BY created_at DESC
             LIMIT {$limit} OFFSET {$offset}"
        );
        $stmt->execute($bindings);

        Response::success(['items' => $stmt->fetchAll(), 'total' => $total, 'page' => $page, 'limit' => $limit]);
    }

    /** GET /v1/admin/users/{id} */
    public function show(Request $request, array $params): void
    {
        $this->requireAdmin($request);
        $id  = (int) ($params['id'] ?? 0);
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare(
            "SELECT id, name, email, is_admin, subscription_plan, subscription_status, subscription_ends_at, created_at, last_login_at
             FROM users WHERE id = ? LIMIT 1"
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) {
            Response::notFound('Usuario no encontrado');
        }

        $logsStmt = $pdo->prepare(
            "SELECT action, from_plan, to_plan, status, data_json, created_at
             FROM subscription_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
        );
        $logsStmt->execute([$id]);

        Response::success(['user' => $user, 'subscription_history' => $logsStmt->fetchAll()]);
    }
}
