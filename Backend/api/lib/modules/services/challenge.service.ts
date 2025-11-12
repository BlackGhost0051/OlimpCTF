import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.service';
import {Task} from '../models/task.model';
import TaskRunnerService from './task.runner.service';

class ChallengeService {
    private taskRunnerService: TaskRunnerService;
    private databaseService: DatabaseService;

    constructor() {
        this.databaseService = new DatabaseService();
        this.taskRunnerService = new TaskRunnerService();
    }

    // async getTaskInfo(id: string, userId?: number){
    //     return await this.databaseService.getTaskById(id, userId);
    // }

    async getCategory(nicename: string){
        return await this.databaseService.getCategoryByNicename(nicename);
    }

    // TODO: test logic
    async addTask(task: Task, flag: string ){
        try{
            task.id = uuidv4();
            await this.databaseService.addTask(task);

            await this.taskRunnerService.addTask(task.id, flag);

        } catch (error){
            console.error(`Failed to add task ${task.id}:`, error);
        }
    }

    async deleteTask(task_id: string){
        try{
            await this.databaseService.deleteTask(task_id);
            await this.taskRunnerService.deleteTask(task_id);
        } catch (error) {
            console.error(`Failed to delete task ${task_id}:`, error);
        }
    }

    // TODO: NEED TEST
    // TODO: NEED RATE-LIMIT
    async verifyFlag(login: string, task_id: string, flag: string ): Promise<boolean>{

        // TODO: add verification if user is making too many requests
        // TODO: add verify task was already solved by user ???

        const isValid = await this.taskRunnerService.verifyFlag(task_id, flag);

        if (isValid) {
            const userCompleted = await this.databaseService.hasUserCompletedTask(login, task_id);

            const user = await this.databaseService.getUser(login);
            if (user && !userCompleted) {
                await this.databaseService.saveUserTaskCompletion(user.id, task_id);
            }
        }

        return isValid;
    }

    async getCategories(){
        return await this.databaseService.getCategories();
    }

    async createCategory(name: string, nicename: string, details: string, url: string, icon: string) {
        return await this.databaseService.createCategory(name, nicename, details, url, icon);
    }

    async updateCategory(id: number, name: string, nicename: string, details: string, url: string, icon: string) {
        return await this.databaseService.updateCategory(id, name, nicename, details, url, icon);
    }

    async getCategoryTasks(category: string, login: string){
        const user = await this.databaseService.getUser(login);

        if (!user) {
            throw new Error("User not found");
        }

        return await this.databaseService.getTasksByCategory(category, user.id);
    }

    async getAllTasks(){
        return await this.databaseService.getAllTasks();
    }
}

export default ChallengeService;