export const config = {
    port: process.env.PORT || 5001,

    JWT_SECRET_KEY: "secret-key_1234567890_1234567890_1234567890_1234567890_1234567890_1234567890",

    db_host: process.env.DB_HOST || 'localhost',
    db_port: parseInt(process.env.DB_PORT || '5432'),
    db_user: process.env.DB_USER || 'user',
    db_password: process.env.DB_PASSWORD || 'password',
    db_database: process.env.DB_NAME || 'db',
};