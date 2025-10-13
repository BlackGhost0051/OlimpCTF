CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    nicename TEXT UNIQUE NOT NULL,
    details TEXT,
    url TEXT,
    icon TEXT
);