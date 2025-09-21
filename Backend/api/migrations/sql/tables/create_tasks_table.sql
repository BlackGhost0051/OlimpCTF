CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    category INTEGER NOT NULL,
    title TEXT,
    author INTEGER,
    icon TEXT,
    difficulty TEXT,
    points INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    hints TEXT[],
    CONSTRAINT fk_author FOREIGN KEY (author) REFERENCES users(id),
    CONSTRAINT fk_category FOREIGN KEY (category) REFERENCES categories(id)
);