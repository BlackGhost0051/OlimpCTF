import { Pool } from 'pg';
import {config} from "../../config";
import * as process from "node:process";
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../models/task.model';

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
        try{
            const client = await this.pool.connect();
            await this.createUsersTable();
        } catch (error){
            console.log("Database connection failed: ", error);
            process.exit(1);
        }


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

    public async isAdmin(login: string): Promise<boolean> {
        const query = `SELECT isAdmin FROM users WHERE login = $1`;
        const result = await this.query<{ isadmin: boolean }>(query, [login]);

        if (result.rows.length > 0) {
            return result.rows[0].isadmin;
        }

        return false;
    }



    private async createUsersTable() {
        const query =`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                login VARCHAR(50) NOT NULL UNIQUE,
                last_login TIMESTAMP,
                email VARCHAR(150) NOT NULL UNIQUE,
                email_verified BOOLEAN DEFAULT FALSE,
                password TEXT NOT NULL,
                isAdmin BOOLEAN DEFAULT FALSE,
                bio TEXT,
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

    async addTask(task: Task & { flag: string }) {
        let id: string;
        let exists = true;

        if(exists){
            id = uuidv4();
            const checkQuery = `SELECT 1 FROM tasks WHERE id = ? LIMIT 1`;
            const result = await this.pool.query(checkQuery, [id]);
            exists = result.rows.length > 0;
            if (exists) id = uuidv4();
        }

        const query = `
            INSERT INTO tasks (id, category, title, icon, difficulty, points, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await this.pool.query(query, [
            id,
            task.category,
            task.title,
            task.icon || null,
            task.difficulty || null,
            task.points || 0,
            task.description || ''
        ]);

        console.log(`Task added with id ${id}`);
    }

    private async createTasksTable(){
        const query =`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT,
                icon TEXT,
                difficulty TEXT,
                points INTEGER,
                description TEXT
            )
        `;

        try {
            await this.pool.query(query);
            console.log("Tasks table exists");
        } catch (err) {
            console.error("Failed to create tasks table:", err);
        }
    }
}

export default DatabaseService;