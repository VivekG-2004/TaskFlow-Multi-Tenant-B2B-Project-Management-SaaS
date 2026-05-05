CREATE TABLE IF NOT EXISTS tasks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id  BIGINT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    priority    ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
    status      ENUM('TODO','IN_PROGRESS','IN_REVIEW','DONE') DEFAULT 'TODO',
    assignee_id BIGINT,
    due_date    DATE,
    parent_id   BIGINT NULL,
    created_by  BIGINT NOT NULL,
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME,
    FOREIGN KEY (project_id)  REFERENCES projects(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id),
    FOREIGN KEY (parent_id)   REFERENCES tasks(id),
    INDEX idx_project_status (project_id, status)
    );