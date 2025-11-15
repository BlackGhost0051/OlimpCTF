CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    flag TEXT NOT NULL,
    has_container BOOLEAN DEFAULT false,
    has_files BOOLEAN DEFAULT false,
    internal_port INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);