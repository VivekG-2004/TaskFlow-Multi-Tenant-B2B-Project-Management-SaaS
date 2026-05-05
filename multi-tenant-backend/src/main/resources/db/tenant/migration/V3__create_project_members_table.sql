CREATE TABLE IF NOT EXISTS project_members (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    added_at   DATETIME NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id)    REFERENCES users(id),
    UNIQUE KEY uq_project_user (project_id, user_id)
    );