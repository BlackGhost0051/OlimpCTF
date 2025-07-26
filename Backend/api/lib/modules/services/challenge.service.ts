import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.service';
import {Task} from '../models/task.model';
import TaskRunnerService from './task.runner.service';

class ChallengeService {
    private databaseService: DatabaseService;
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

    async addTask(flag: string){

    }

    async verifyFlag(login: string, task_id: string, flag: string ): Promise<boolean>{
        return true;
    }

    async getCategories(){}
    async getCategoryTasks(category: string){
        const tasks: Task[] = await this.databaseService.getTasksByCategory(category);
        return tasks;
        // return await this.databaseService.getTasksByCategory(category);
    }
}

export default ChallengeService;