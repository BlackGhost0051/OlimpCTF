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

    public async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
        return this.pool.query(text, params);
    }


    public async getUser(identifier: string): Promise<any | null> {
        const query = `SELECT * FROM users WHERE login = $1 OR email = $1`;
        const result = await this.query(query, [identifier]);

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        return null;
    }


    public async addUser(login: string, email: string, hashedPassword:string): Promise<any>{
        const query = `
            INSERT INTO users (login, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, login, email, isAdmin, created_at
        `;

        const result = await this.query(query, [login, email, hashedPassword]);
        return result.rows[0];
    }

    public async updateUserPassword(login: string, newHashedPassword: string): Promise<void> {
        const query = `UPDATE users SET password = $1 WHERE login = $2`;
        await this.query(query, [newHashedPassword, login]);
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