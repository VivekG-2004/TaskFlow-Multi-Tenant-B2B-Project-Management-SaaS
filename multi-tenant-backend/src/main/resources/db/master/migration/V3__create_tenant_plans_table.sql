CREATE TABLE IF NOT EXISTS tenant_plans (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan         ENUM('FREE', 'PRO') NOT NULL UNIQUE,
    max_projects INT NOT NULL,
    max_members  INT NOT NULL,
    created_at   DATETIME NOT NULL
    );

INSERT INTO tenant_plans (plan, max_projects, max_members, created_at) VALUES
        ('FREE', 3, 5, NOW()),
        ('PRO', -1, -1, NOW());