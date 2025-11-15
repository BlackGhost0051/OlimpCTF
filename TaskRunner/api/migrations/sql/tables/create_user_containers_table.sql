CREATE TABLE IF NOT EXISTS user_containers (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    container_id TEXT NOT NULL,
    container_name TEXT UNIQUE NOT NULL,
    host_port INTEGER NOT NULL,
    status TEXT DEFAULT 'running',
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(user_id, task_id),
    CONSTRAINT fk_task
        FOREIGN KEY(task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_containers_status ON user_containers(status);
CREATE INDEX IF NOT EXISTS idx_user_containers_expires ON user_containers(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_containers_user_task ON user_containers(user_id, task_id);
