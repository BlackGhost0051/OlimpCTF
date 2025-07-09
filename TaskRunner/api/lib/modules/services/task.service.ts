import DatabaseService from "./database.service";
import CryptographyService from "./cryptography.service";

class TaskService {
    private databaseService: DatabaseService;

    constructor(databaseService: DatabaseService) {}


    public async verify_flag(task_id: string, submittedFlag: string): Promise<boolean> {
        const storedFlag = await this.databaseService.getFlagByTaskId(task_id);

        if (!storedFlag) {
            console.warn(`Task with id "${task_id}" not found.`);
            return false;
        }

        return storedFlag === submittedFlag;
    }

    public async addTask(task_id: string, flag: string){
        await this.databaseService.addTask(task_id, flag);
    }

    public async updateTask(task_id: string, flag: string){
        await this.databaseService.updateTask(task_id, flag);
    }

}

export default TaskService;