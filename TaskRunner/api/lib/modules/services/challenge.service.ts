import DatabaseService from "./database.service";
import CryptographyService from "./cryptography.service";
import ContainerService from "./container.service";

import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

class ChallengeService {
    private baseTaskFolder = path.resolve(__dirname, "../../../tasks");

    private databaseService: DatabaseService;
    private cryptographyService: CryptographyService;
    private containerService: ContainerService;

    constructor() {
        this.databaseService = new DatabaseService();
        this.cryptographyService = new CryptographyService();
        this.containerService = new ContainerService();

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

    public async uploadTask(taskId: string, flag: string, zipBuffer: Buffer): Promise<void> {

        const existingTask = await this.databaseService.getFlagByTaskId(taskId);
        if (existingTask) {
            throw new Error('Task with this ID already exists');
        }
        const taskFolder = path.join(this.baseTaskFolder, taskId);
        if (fs.existsSync(taskFolder)) {
            fs.rmSync(taskFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(taskFolder, { recursive: true });

        const zip = new AdmZip(zipBuffer);
        zip.extractAllTo(taskFolder, true);

        const webPath = path.join(taskFolder, 'web');
        const filesPath = path.join(taskFolder, 'files');

        const has_container = fs.existsSync(webPath);
        const has_files = fs.existsSync(filesPath);

        let internal_port: number | null = null;
        if (has_container) {
            const dockerfilePath = path.join(webPath, 'Dockerfile');
            if (fs.existsSync(dockerfilePath)) {
                const dockerfile = fs.readFileSync(dockerfilePath, 'utf-8');
                const match = dockerfile.match(/EXPOSE\s+(\d+)/);
                if (match) {
                    internal_port = parseInt(match[1]);
                }
            }
        }

        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.addTaskWithMetadata({
            id: taskId,
            flag: encryptedFlag,
            has_container,
            has_files,
            internal_port
        });

        console.log(`Task ${taskId} uploaded successfully (container: ${has_container}, files: ${has_files}, port: ${internal_port})`);
    }

    public async addTask(task_id: string, flag: string){
        const existingFlag = await this.databaseService.getFlagByTaskId(task_id);
        if (existingFlag !== null) {
            throw new Error(`Task already exists.`);
        }

        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.addTask(task_id, encryptedFlag);
    }

    public async deleteTask(task_id: string){
        const existingFlag = await this.databaseService.getFlagByTaskId(task_id);
        if (existingFlag !== null) {
            await this.databaseService.deleteTask(task_id);

            const folderPath = path.join(this.baseTaskFolder, task_id);
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    }

    public async updateTask(task_id: string, flag: string){
        const encryptedFlag = this.cryptographyService.encryptFlag(flag);
        await this.databaseService.updateTask(task_id, encryptedFlag);
    }


    public async getTaskFiles(task_id: string): Promise<string[]> {
        const filesPath = path.join(this.baseTaskFolder, task_id, 'files');

        if (!fs.existsSync(filesPath)) {
            return [];
        }

        return fs.readdirSync(filesPath).filter(f => !f.startsWith('.') && f !== 'README.md');
    }

    public async downloadTaskFile(task_id: string, filename: string): Promise<Buffer> {
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            throw new Error('Invalid filename');
        }

        const filePath = path.join(this.baseTaskFolder, task_id, 'files', filename);

        const resolvedPath = path.resolve(filePath);
        const baseFolder = path.resolve(this.baseTaskFolder, task_id, 'files');

        if (!resolvedPath.startsWith(baseFolder)) {
            throw new Error('Invalid file path');
        }

        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        return fs.readFileSync(filePath);
    }

    public async startContainer(user_id: string, task_id: string) {
        return await this.containerService.startUserContainer(user_id, task_id);
    }

    public async stopContainer(user_id: string, task_id: string) {
        return await this.containerService.stopUserContainer(user_id, task_id);
    }

    public async getContainerStatus(user_id: string, task_id: string) {
        const taskMeta = await this.databaseService.getTaskMetadata(task_id);
        if (!taskMeta || !taskMeta.has_container) {
            return false;
        }

        const containerStatus = await this.containerService.getContainerStatus(user_id, task_id);

        if (containerStatus === null) {
            return true;
        }

        return containerStatus;
    }


}

export default ChallengeService;