import DatabaseService from "./database.service";
import CryptographyService from "./cryptography.service";

import path from "path";
import fs from "fs";

class ChallengeService {
    private baseTaskFolder = path.resolve(__dirname, "../../../tasks");

    private databaseService: DatabaseService;
    private cryptographyService: CryptographyService;

    constructor() {
        this.databaseService = new DatabaseService();
        this.cryptographyService = new CryptographyService();


        const folderPath = path.join(this.baseTaskFolder);
        console.log(folderPath);
    }


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
        const existingFlag = await this.databaseService.getFlagByTaskId(task_id);
        if (existingFlag !== null) {
            throw new Error(`Task already exists.`);
        }

        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.addTask(task_id, encryptedFlag);

        // make folder with id task
        const folderPath = path.join(this.baseTaskFolder, task_id);
        fs.mkdirSync(folderPath, { recursive: true });
    }

    public async updateTask(task_id: string, flag: string){
        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.updateTask(task_id, encryptedFlag);
    }


    public getTaskResource(task_id: string){

    }

    public runTaskServer(task_id: string) {
        const folderPath = path.join(this.baseTaskFolder, task_id);

    }


}

export default ChallengeService;