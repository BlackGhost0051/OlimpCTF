CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    lastname TEXT,
    login VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    last_login TIMESTAMP,
    email VARCHAR(150) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    isAdmin BOOLEAN DEFAULT FALSE,
    isPrivate BOOLEAN DEFAULT FALSE,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);