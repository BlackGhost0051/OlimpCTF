import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.service';
import {Task} from '../models/task.model';
import TaskRunnerService from './task.runner.service';

class ChallengeService {
    private taskRunnerService: TaskRunnerService;
    private databaseService: DatabaseService;

    constructor() {
        this.databaseService = new DatabaseService();
    }

    getTaskInfo(id: string){
        const task: Task = {
            id: "a32q33r3qw2r2q33r2",
            category: "WEB",
            title: "TITLE",
            icon: "ICON CLASS",
            difficulty: "EASY",
            points: 100,
            description: "HACK WEB"
        };
        return task;
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

    async verifyFlag(login: string, task_id: string, flag: string ): Promise<boolean>{
        return await this.taskRunnerService.verifyFlag(task_id, flag);
    }

    async getCategories(){
        return await this.databaseService.getCategories();
    }
    async getCategoryTasks(category: string){
        // const tasks: any[]= await this.databaseService.getTasksByCategory(category);
        // return tasks;
        return await this.databaseService.getTasksByCategory(category);
    }
}

export default ChallengeService;