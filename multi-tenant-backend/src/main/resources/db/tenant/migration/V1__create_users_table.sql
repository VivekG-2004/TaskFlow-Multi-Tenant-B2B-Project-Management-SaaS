CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    full_name  VARCHAR(100),
    role       ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL,
    is_active  TINYINT(1) DEFAULT 1,
    invited_by BIGINT NULL,
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL
    );