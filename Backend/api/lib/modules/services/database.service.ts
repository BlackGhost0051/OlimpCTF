import PasswordService from "./password.service";
import { Pool } from 'pg';
import {config} from "../../config";

class DatabaseService{
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: config.db_host,
            port: config.db_port,
            user: config.db_user,
            password: config.db_password,
            database: config.db_database,
        });

        this.pool.on('connect', () => {
            console.log('Connected to PostgreSQL');
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });

        this.init();
    }


    async init(){
        await this.createUsersTable();
    }





    private async createUsersTable() {
        const query =`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                login VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(150) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                isAdmin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;

        try {
            await this.pool.query(query);
            console.log("Users table exists");
        } catch (err) {
            console.error("Failed to create users table:", err);
        }
    }
}

export default DatabaseService;