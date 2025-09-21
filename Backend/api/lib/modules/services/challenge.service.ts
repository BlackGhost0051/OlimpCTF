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

    async getCategory(id: string){
        return await this.databaseService.getCategoryById(id);
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

    // make modal task method
    async getTask( filter: {
        byCategory?: string,
        byDifficulty?: string,
        byId?: string
    } ) {

    }
}

export default ChallengeService;