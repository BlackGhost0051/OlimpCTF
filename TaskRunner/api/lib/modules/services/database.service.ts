import { Pool } from 'pg';
import {config} from "../../config";
import * as process from "node:process";

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
        } catch (error){
            console.log("Database connection failed: ", error);
            process.exit(1);
        }


    }

    public async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
        return this.pool.query(text, params);
    }
}

export default DatabaseService;