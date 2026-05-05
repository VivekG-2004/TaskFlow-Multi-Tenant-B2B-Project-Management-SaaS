CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    action      ENUM('CREATE','UPDATE','DELETE'),
    entity_type VARCHAR(50),
    entity_id   BIGINT,
    old_value   JSON,
    new_value   JSON,
    created_at  DATETIME NOT NULL,
    INDEX idx_entity    (entity_type, entity_id),
    INDEX idx_user_date (user_id, created_at)
    );