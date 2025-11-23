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
        } catch (error){
            console.log("Database connection failed: ", error);
            process.exit(1);
        }


    }

    public async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
        return this.pool.query(text, params);
    }


    public async getCategoryByNicename(nicename: string): Promise<any | null> {
        const query = `SELECT * FROM categories WHERE nicename = $1`;
        const result = await this.query(query, [nicename]);

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        return null;
    }

    public async getUser(identifier: string): Promise<any | null> {
        const query = `SELECT * FROM users WHERE login = $1 OR email = $1`;
        const result = await this.query(query, [identifier]);

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        return null;
    }

    public async getUsers(limit?: number, offset?: number, search?: string){
        let query = `SELECT id, login, email, email_verified, isadmin, isprivate, created_at FROM users`;
        const params: any[] = [];
        let paramIndex = 1;

        if (search && search.trim()) {
            query += ` WHERE login ILIKE $${paramIndex} OR email ILIKE $${paramIndex}`;
            params.push(`%${search.trim()}%`);
            paramIndex++;
        }

        query += ` ORDER BY id ASC`;

        if (limit !== undefined && offset !== undefined) {
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);
        }

        const result = await this.pool.query(query, params);
        return result.rows;
    }

    public async getUsersCount(search?: string): Promise<number> {
        let query = `SELECT COUNT(*) as count FROM users`;
        const params: any[] = [];

        if (search && search.trim()) {
            query += ` WHERE login ILIKE $1 OR email ILIKE $1`;
            params.push(`%${search.trim()}%`);
        }

        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
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

    public async updateUserPrivacy(login: string, isPrivate: boolean): Promise<void> {
        const query = `UPDATE users SET isPrivate = $1 WHERE login = $2`;
        await this.query(query, [isPrivate, login]);
    }

    public async updateUserIcon(login: string, icon: string): Promise<void> {
        const query = `UPDATE users SET icon = $1 WHERE login = $2`;
        await this.query(query, [icon, login]);
    }

    // TODO: VERIFY and TEST
    public async updateUserProfile(login: string, data: { name?: string, lastname?: string, bio?: string, email?: string }): Promise<void> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${paramIndex}`);
            values.push(data.name);
            paramIndex++;
        }

        if (data.lastname !== undefined) {
            fields.push(`lastname = $${paramIndex}`);
            values.push(data.lastname);
            paramIndex++;
        }

        if (data.bio !== undefined) {
            fields.push(`bio = $${paramIndex}`);
            values.push(data.bio);
            paramIndex++;
        }

        if (data.email !== undefined) {
            fields.push(`email = $${paramIndex}`);
            values.push(data.email);
            paramIndex++;
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(login);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE login = $${paramIndex}`;
        await this.query(query, values);
    }

    public async isAdmin(login: string): Promise<boolean> {
        const query = `SELECT isAdmin FROM users WHERE login = $1`;
        const result = await this.query<{ isadmin: boolean }>(query, [login]);

        if (result.rows.length > 0) {
            return result.rows[0].isadmin;
        }

        return false;
    }

    async addTask(task: Task) {
        const query = `
            INSERT INTO tasks (id, category, title, author, icon, difficulty, points, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        await this.pool.query(query, [
            task.id,
            task.category || null,
            task.title || null,
            task.author || null,
            task.icon || null,
            task.difficulty || null,
            task.points || null,
            task.description || null
        ]);

        console.log(`Task added with id ${task.id}`);
    }

    async deleteTask(task_id: string){
        const checkQuery = `SELECT 1 FROM tasks WHERE id = $1 LIMIT 1`;
        const result = await this.pool.query(checkQuery, [task_id]);
        const exist = result.rows.length > 0;

        if(exist){
            const query = `DELETE FROM tasks WHERE id = $1`;
            await this.pool.query(query, [task_id]);
            console.log(`Task deleted with id ${task_id}`);
        } else {
            console.error(`Task not exist.`);
        }
    }

    // async getTaskById(id: string, userId?: number) {
    //     if (userId) {
    //         const query = `  
    //             SELECT
    //                 t.*,
    //                 COALESCE(ut.completed, false) AS completed
    //             FROM tasks t
    //             LEFT JOIN user_tasks ut
    //             ON t.id = ut.task_id AND ut.user_id = $1 
    //             WHERE t.id = $2
    //         `;
    //         const result = await this.pool.query(query, [userId, id]);
    //         return result.rows[0] || null;
    //     } else {
    //         const query = `SELECT * FROM tasks WHERE id = $1`;
    //         const result = await this.pool.query(query, [id]);
    //         return result.rows[0] || null;
    //     }
    // }

    async getTasksByCategory(category: string, userId: number) {
        const query = `
            SELECT
            t.*,
            COALESCE(ut.completed, false) AS completed
            FROM tasks t
            LEFT JOIN user_tasks ut
            ON t.id = ut.task_id AND ut.user_id = $1
            WHERE t.category = $2
        `;
        const result = await this.pool.query(query, [userId, category]);
        return result.rows;
    }

    async getAllTasks() {
        const query = `SELECT * FROM tasks ORDER BY created_at DESC`;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async getCategories() {
        const query = `SELECT * FROM categories`;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async createCategory(name: string, nicename: string, details: string, url: string, icon: string) {
        const query = `
            INSERT INTO categories (name, nicename, details, url, icon)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await this.pool.query(query, [name, nicename, details, url, icon]);
        return result.rows[0];
    }

    async updateCategory(id: number, name: string, nicename: string, details: string, url: string, icon: string) {
        const query = `
            UPDATE categories
            SET name = $1, nicename = $2, details = $3, url = $4, icon = $5
            WHERE id = $6
            RETURNING *
        `;
        const result = await this.pool.query(query, [name, nicename, details, url, icon, id]);
        return result.rows[0];
    }

    async saveUserTaskCompletion(userId: number, taskId: string): Promise<void> {
        const query = `
            INSERT INTO user_tasks (user_id, task_id, completed, completed_at)
            VALUES ($1, $2, true, NOW())
            ON CONFLICT (user_id, task_id)
            DO UPDATE SET completed = true, completed_at = NOW()
        `;
        await this.query(query, [userId, taskId]);
    }

    async hasUserCompletedTask(login: string, taskId: string) {
        const query = `
            SELECT ut.completed
            FROM user_tasks ut
            JOIN users u ON ut.user_id = u.id
            WHERE u.login = $1 AND ut.task_id = $2
        `;
        const result = await this.query(query, [login, taskId]);

        if (result.rows.length > 0) {
            return result.rows[0].completed;
        }

        return false;
    }
}

export default DatabaseService;