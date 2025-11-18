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
            client.release();
            console.log("Database connection established");
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

    public async addTask(task_id: string, flag: string){
        const query = `INSERT INTO tasks (id, flag) VALUES ($1, $2)`;

        try{
            await this.pool.query(query, [task_id, flag]);
            console.log(`Task ${task_id} inserted.`);
        } catch (error){
            console.error(`Failed to insert task ${task_id}:`, error);
            throw error;
        }
    }

    public async addTaskWithMetadata(taskData: {
        id: string;
        flag: string;
        has_container: boolean;
        has_files: boolean;
        internal_port: number | null;
    }){
        const query = `
            INSERT INTO tasks (id, flag, has_container, has_files, internal_port)
            VALUES ($1, $2, $3, $4, $5)
        `;

        try{
            await this.pool.query(query, [
                taskData.id,
                taskData.flag,
                taskData.has_container,
                taskData.has_files,
                taskData.internal_port
            ]);
            console.log(`Task ${taskData.id} inserted with metadata.`);
        } catch (error){
            console.error(`Failed to insert task ${taskData.id}:`, error);
            throw error;
        }
    }

    public async getTaskMetadata(task_id: string){
        const query = `SELECT * FROM tasks WHERE id = $1 LIMIT 1`;

        try {
            const result = await this.pool.query(query, [task_id]);
            if (result.rowCount === 0) {
                return null;
            }
            return result.rows[0];
        } catch (error) {
            console.error("Failed to retrieve task metadata:", error);
            return null;
        }
    }

    public async deleteTask(task_id: string){
        const query = `DELETE FROM tasks WHERE id = $1`;

        try{
            await this.pool.query(query, [task_id]);
            console.log(`Task ${task_id} deleted.`);
        } catch (error){
            console.error(`Failed to delete task ${task_id}:`, error);
            throw error;
        }
    }

    public async updateTask(task_id: string, flag: string){
        const query = `UPDATE tasks SET flag = $2 WHERE id = $1`;

        try{
            const result = await this.pool.query(query, [task_id, flag]);
            if (result.rowCount === 0) {
                throw new Error(`Task with id "${task_id}" not found`);
            }
            console.log(`Task ${task_id} updated.`);
        } catch (error){
            console.error(`Failed to update task ${task_id}:`, error);
            throw error;
        }
    }


    public async getUserContainer(user_id: string, task_id: string){
        const query = `SELECT * FROM user_containers WHERE user_id = $1 AND task_id = $2 LIMIT 1`;

        try {
            const result = await this.pool.query(query, [user_id, task_id]);
            if (result.rowCount === 0) {
                return null;
            }
            return result.rows[0];
        } catch (err) {
            console.error("Failed to retrieve user container:", err);
            return null;
        }
    }

    public async createUserContainer(containerData: {
        user_id: string;
        task_id: string;
        container_id: string;
        container_name: string;
        host_port: number;
        url: string;
        expires_at: Date;
    }){
        const query = `
            INSERT INTO user_containers (user_id, task_id, container_id, container_name, host_port, url, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        try {
            const result = await this.pool.query(query, [
                containerData.user_id,
                containerData.task_id,
                containerData.container_id,
                containerData.container_name,
                containerData.host_port,
                containerData.url,
                containerData.expires_at
            ]);
            console.log(`Container ${containerData.container_name} created for user ${containerData.user_id}`);
            return result.rows[0];
        } catch (error) {
            console.error("Failed to create user container:", error);
            throw error;
        }
    }

    public async deleteUserContainer(user_id: string, task_id: string){
        const query = `DELETE FROM user_containers WHERE user_id = $1 AND task_id = $2`;

        try {
            await this.pool.query(query, [user_id, task_id]);
            console.log(`Container for user ${user_id} and task ${task_id} deleted.`);
        } catch (error) {
            console.error("Failed to delete user container:", error);
            throw error;
        }
    }

    public async updateContainerStatus(user_id: string, task_id: string, status: string){
        const query = `UPDATE user_containers SET status = $3 WHERE user_id = $1 AND task_id = $2`;

        try {
            await this.pool.query(query, [user_id, task_id, status]);
            console.log(`Container status updated to ${status}`);
        } catch (error) {
            console.error("Failed to update container status:", error);
            throw error;
        }
    }

    public async getUsedPorts(){
        const query = `SELECT host_port FROM user_containers WHERE status = 'running'`;

        try {
            const result = await this.pool.query(query);
            return result.rows.map(row => row.host_port);
        } catch (error) {
            console.error("Failed to get used ports:", error);
            return [];
        }
    }

    public async getExpiredContainers(){
        const query = `SELECT * FROM user_containers WHERE expires_at < NOW() AND status = 'running'`;

        try {
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error("Failed to get expired containers:", error);
            return [];
        }
    }
}

export default DatabaseService;