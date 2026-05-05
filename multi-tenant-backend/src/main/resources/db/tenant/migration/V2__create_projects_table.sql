CREATE TABLE IF NOT EXISTS projects (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    status      ENUM('PLANNING','ACTIVE','ON_HOLD','COMPLETED') DEFAULT 'PLANNING',
    start_date  DATE,
    due_date    DATE,
    is_archived TINYINT(1) DEFAULT 0,
    created_by  BIGINT NOT NULL,
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME,
    FOREIGN KEY (created_by) REFERENCES users(id)
    );