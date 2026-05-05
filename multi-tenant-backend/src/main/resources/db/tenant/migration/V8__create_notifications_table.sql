CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    title      VARCHAR(255),
    body       TEXT,
    is_read    TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL,
    INDEX idx_user_read (user_id, is_read)
    );