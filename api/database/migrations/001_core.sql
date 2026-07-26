-- Framework: cola de jobs (core/JobQueue.php)
CREATE TABLE IF NOT EXISTS jobs (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type         VARCHAR(120) NOT NULL,
    payload      JSON NOT NULL,
    status       ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
    attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
    max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 3,
    available_at DATETIME NOT NULL,
    error        VARCHAR(500) NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at   DATETIME NULL,
    finished_at  DATETIME NULL,
    INDEX idx_jobs_claim (status, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuarios (dashboard de la API + admin)
CREATE TABLE IF NOT EXISTS users (
    id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                  VARCHAR(120) NOT NULL,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    password_hash         VARCHAR(255) NOT NULL,
    is_admin              TINYINT(1) NOT NULL DEFAULT 0,
    subscription_plan     VARCHAR(30) NOT NULL DEFAULT 'free',
    subscription_status   ENUM('active','trialing','past_due','suspended') NOT NULL DEFAULT 'active',
    subscription_started_at DATETIME NULL,
    subscription_ends_at    DATETIME NULL,
    grace_period_until       DATETIME NULL,
    billing_cycle            ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
    country_code             CHAR(2) NULL,
    last_login_at            DATETIME NULL,
    created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_plan (subscription_plan, subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refresh tokens (JWT rotation + reuse detection) — ver TokenService.php
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_hash  CHAR(64) NOT NULL UNIQUE,
    expires_at  DATETIME NOT NULL,
    revoked     TINYINT(1) NOT NULL DEFAULT 0,
    device_info VARCHAR(255) NULL,
    ip_address  VARCHAR(45) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_user (user_id, revoked, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- API keys — mecanismo de auth del producto (consumo externo de la API)
CREATE TABLE IF NOT EXISTS api_keys (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NOT NULL,
    name         VARCHAR(120) NOT NULL,
    key_hash     CHAR(64) NOT NULL UNIQUE,
    key_prefix   VARCHAR(12) NOT NULL,
    scopes       JSON NULL,
    last_used_at DATETIME NULL,
    expires_at   DATETIME NULL,
    revoked      TINYINT(1) NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_apikeys_user (user_id, revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
