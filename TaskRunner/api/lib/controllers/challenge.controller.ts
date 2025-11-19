import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";
import multer from "multer";

import ChallengeService from "../modules/services/challenge.service";

class ChallengeController implements Controller{
    public path: string = '/api/challenge';
    public router: Router = Router();
    private taskService: ChallengeService;
    private upload: multer.Multer;

    constructor() {
        this.taskService = new ChallengeService();

        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
        });

        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.post(`${this.path}/verify_flag`, this.verifyFlag.bind(this));
        this.router.post(`${this.path}/task`, this.addTask.bind(this));
        this.router.delete(`${this.path}/task`, this.deleteTask.bind(this));
        this.router.put(`${this.path}/task`, this.updateTask.bind(this));

        this.router.post(`${this.path}/upload_task`, this.upload.single('task_zip'), this.uploadTask.bind(this));

        this.router.post(`${this.path}/start_container`, this.startContainer.bind(this));
        this.router.post(`${this.path}/stop_container`, this.stopContainer.bind(this));

        this.router.get(`${this.path}/task_details/:task_id/:user_id`, this.getTaskDetails.bind(this))
        this.router.get(`${this.path}/download/:task_id/:filename`, this.downloadFile.bind(this));
    }




    private async verifyFlag(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ status: false, message : "Must be flag and task_id." });
        }

        const status: boolean = await this.taskService.verify_flag(task_id, flag);

        return response.status(200).json({ status: status });
    }

    private async addTask(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ status: false, message : "Must be flag and task_id." });
        }

        try{
            await this.taskService.addTask(task_id, flag);
            return response.status(201).json({ status: true, message: "Task added successfully." });
        } catch (error){
            return response.status(500).json({ status: false, message: "Failed to add task." });
        }
    }

    private async deleteTask(request: Request, response: Response){
        const { task_id } = request.body;

        if(!task_id){
            return response.status(400).json({ status: false, message : "Must be task_id." });
        }

        try{
            await this.taskService.deleteTask(task_id);
            return response.status(201).json({ status: true, message: "Task deleted successfully." });
        } catch (error) {
            return response.status(500).json({ status: false, message: "Failed to delete task." });
        }
    }

    private async updateTask(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ status: false, message : "Must be flag and task_id." });
        }

        try {
            await this.taskService.updateTask(task_id, flag);
            return response.status(200).json({ status: true, message: "Task updated successfully." });
        } catch (err: any) {
            return response.status(500).json({ status: false, message: "Failed to update task." });
        }
    }

    private async uploadTask(request: Request, response: Response){
        const { task_id, flag } = request.body;
        const file = request.file;

        if (!task_id || !flag || !file) {
            return response.status(400).json({
                status: false,
                message: "Missing required fields (task_id, flag, task_zip)"
            });
        }

        try {
            await this.taskService.uploadTask(task_id, flag, file.buffer);
            return response.status(201).json({
                status: true,
                message: "Task uploaded successfully"
            });
        } catch (error: any) {
            return response.status(500).json({
                status: false,
                message: error.message || "Failed to upload task"
            });
        }
    }

    private async startContainer(request: Request, response: Response){
        const { user_id, task_id } = request.body;

        if (!user_id || !task_id) {
            return response.status(400).json({
                status: false,
                message: "Must provide user_id and task_id"
            });
        }

        try {
            const result = await this.taskService.startContainer(user_id, task_id);
            return response.status(200).json({
                status: true,
                url: result.url,
                expires_at: result.expires_at,
                host_port: result.host_port
            });
        } catch (error: any) {
            return response.status(500).json({
                status: false,
                message: error.message || "Failed to start container"
            });
        }
    }

    private async stopContainer(request: Request, response: Response){
        const { user_id, task_id } = request.body;

        if (!user_id || !task_id) {
            return response.status(400).json({
                status: false,
                message: "Must provide user_id and task_id"
            });
        }

        try {
            await this.taskService.stopContainer(user_id, task_id);
            return response.status(200).json({
                status: true,
                message: "Container stopped successfully"
            });
        } catch (error: any) {
            return response.status(500).json({
                status: false,
                message: error.message || "Failed to stop container"
            });
        }
    }

    private async getTaskDetails(request: Request, response: Response){
        const { user_id, task_id } = request.params;

        if (!user_id || !task_id) {
            return response.status(400).json({
                status: false,
                message: "Must provide user_id and task_id"
            });
        }


        try{
            const result = await this.taskService.getContainerStatus(user_id, task_id);
            const files = await this.taskService.getTaskFiles(task_id);


            return response.status(200).json({
                status: true,
                files: files,
                container: result
            });
        } catch (error){
            return response.status(500).json({
                status: false,
                message: error.message || "Failed to get task details"
            });
        }
    }

    private async downloadFile(request: Request, response: Response){
        const { task_id, filename } = request.params;

        if (!task_id || !filename) {
            return response.status(400).json({
                status: false,
                message: "Must provide task_id and filename"
            });
        }

        try {
            const fileBuffer = await this.taskService.downloadTaskFile(task_id, filename);

            response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            response.setHeader('Content-Type', 'application/octet-stream');
            return response.send(fileBuffer);
        } catch (error: any) {
            return response.status(404).json({
                status: false,
                message: error.message || "File not found"
            });
        }
    }
}


export default ChallengeController;