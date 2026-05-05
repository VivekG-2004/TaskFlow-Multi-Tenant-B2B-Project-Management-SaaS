CREATE TABLE IF NOT EXISTS task_comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    body       TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
    );