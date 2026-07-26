-- Catalogo de planes
CREATE TABLE IF NOT EXISTS plans (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code                VARCHAR(30) NOT NULL UNIQUE,
    name                VARCHAR(60) NOT NULL,
    price_monthly_usd   DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly_usd    DECIMAL(10,2) NOT NULL DEFAULT 0,
    requests_month_quota INT NOT NULL DEFAULT 500,
    burst_per_minute     SMALLINT UNSIGNED NOT NULL DEFAULT 10,
    features_json        JSON NULL,
    is_visible           TINYINT(1) NOT NULL DEFAULT 1,
    sort_order           SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO plans (code, name, price_monthly_usd, price_yearly_usd, requests_month_quota, burst_per_minute, sort_order) VALUES
    ('free',     'Free',     0,   0,    500,   10,  1),
    ('pro',      'Pro',      19,  190,  50000, 60,  2),
    ('business', 'Business', 99,  990,  -1,    300, 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Proveedores de pago habilitados por pais (Stripe global, Wompi/PayU LatAm)
CREATE TABLE IF NOT EXISTS payment_provider_configs (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_code VARCHAR(30) NOT NULL,
    country_code  VARCHAR(2)  NOT NULL DEFAULT '*',
    environment   ENUM('sandbox','production') NOT NULL DEFAULT 'sandbox',
    credentials_json JSON NULL,
    is_enabled    TINYINT(1) NOT NULL DEFAULT 0,
    priority      SMALLINT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_provider_country (provider_code, country_code, environment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO payment_provider_configs (provider_code, country_code, environment, is_enabled, priority) VALUES
    ('stripe', '*',  'sandbox', 0, 10),
    ('wompi',  'CO', 'sandbox', 0, 20)
ON DUPLICATE KEY UPDATE priority = VALUES(priority);

-- Auditoria de cambios de plan (upgrade/downgrade/admin_change/cancellation)
CREATE TABLE IF NOT EXISTS subscription_logs (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    action     VARCHAR(40) NOT NULL,
    from_plan  VARCHAR(30) NULL,
    to_plan    VARCHAR(30) NULL,
    status     VARCHAR(30) NULL,
    data_json  JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sublogs_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transacciones reales (separado de subscription_logs para no ensuciar metricas de ingresos)
CREATE TABLE IF NOT EXISTS payments (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT UNSIGNED NOT NULL,
    provider            VARCHAR(30) NOT NULL,
    provider_payment_id VARCHAR(120) NULL,
    amount              DECIMAL(10,2) NOT NULL,
    currency            CHAR(3) NOT NULL DEFAULT 'USD',
    status              VARCHAR(30) NOT NULL,
    plan_code           VARCHAR(30) NOT NULL,
    billing_cycle       ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
