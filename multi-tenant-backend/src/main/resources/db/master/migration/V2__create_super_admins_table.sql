CREATE TABLE IF NOT EXISTS super_admins (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
    );