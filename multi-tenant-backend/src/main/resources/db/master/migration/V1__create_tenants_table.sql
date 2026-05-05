CREATE TABLE IF NOT EXISTS tenants (
                                       id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       company_name VARCHAR(100) NOT NULL,
    slug         VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    plan         ENUM('FREE', 'PRO') DEFAULT 'FREE',
    is_active    TINYINT(1) DEFAULT 1,
    schema_name  VARCHAR(60)  NOT NULL,
    created_at   DATETIME NOT NULL,
    updated_at   DATETIME,
    suspended_at DATETIME NULL,
    INDEX idx_slug (slug)
    );