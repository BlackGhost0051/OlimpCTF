import DatabaseService from "./database.service";
import CryptographyService from "./cryptography.service";

class TaskService {
    private databaseService: DatabaseService;
    private cryptographyService: CryptographyService;

    constructor(databaseService: DatabaseService,
                cryptographyService: CryptographyService) {}


    public async verify_flag(task_id: string, flag: string): Promise<boolean> {
        const dbFlag = await this.databaseService.getFlagByTaskId(task_id);

        if (!dbFlag) {
            console.warn(`Task with id "${task_id}" not found.`);
            return false;
        }

        const decryptedFlag = this.cryptographyService.decryptFlag(dbFlag);
        return decryptedFlag === flag;
    }

    public async addTask(task_id: string, flag: string){
        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.addTask(task_id, encryptedFlag);
    }

    public async updateTask(task_id: string, flag: string){
        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.updateTask(task_id, encryptedFlag);
    }

}

export default TaskService;