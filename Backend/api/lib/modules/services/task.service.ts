import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.service';

class TaskService {
    private databaseService: DatabaseService;
    gatTaskInfo(){
        return "title, if WEB ip, description, link to file...";
    }
}

export default TaskService;