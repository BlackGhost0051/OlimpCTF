import { Pool } from 'pg';
import {config} from "../../config";
import * as process from "node:process";

import CryptographyService from "./cryptography.service";

class DatabaseService{
    private pool: Pool;

    constructor(cryptographyService: CryptographyService) {
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

            await this.createTasksTable();
        } catch (error){
            console.log("Database connection failed: ", error);
            process.exit(1);
        }
    }

    public async getFlagByTaskId(id: string): Promise<string | null> {
        const query = `SELECT flag FROM tasks WHERE id = $1 LIMIT 1`;

        try {
            const result = await this.pool.query(query, [id]);
            if (result.rowCount === 0) {
                return null;
            }
            return result.rows[0].flag;
        } catch (err) {
            console.error("Failed to retrieve flag:", err);
            return null;
        }
    }


    private async createTasksTable(){
        const query =`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT NOT NULL,
                flag TEXT NOT NULL
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