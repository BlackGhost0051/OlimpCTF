import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.service';
import TaskRunnerService from './task.runner.service';

class TaskService {
    private databaseService: DatabaseService;
    gatTaskInfo(){
        return "title, if WEB ip, description, link to file...";
    }

    async addTask(flag: string){

    }
}

export default TaskService;