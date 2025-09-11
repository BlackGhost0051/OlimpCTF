CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT,
    details TEXT,
    url TEXT,
    icon TEXT
);