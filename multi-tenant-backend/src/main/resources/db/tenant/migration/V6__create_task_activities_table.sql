CREATE TABLE IF NOT EXISTS task_activities (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    action     VARCHAR(100) NOT NULL,
    field_name VARCHAR(50),
    old_value  VARCHAR(255),
    new_value  VARCHAR(255),
    created_at DATETIME NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_task (task_id)
    );