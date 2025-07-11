import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";

import TaskService from "../modules/services/task.service";

class TaskController implements Controller{
    public path: string = '/api/task';
    public router: Router = Router();
    private taskService: TaskService;


    constructor() {
        this.taskService = new TaskService();
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.post(`${this.path}/verify_flag`, this.verifyFlag.bind(this));
        this.router.post(`${this.path}/add`, this.addTask.bind(this));

        this.router.put(`${this.path}/add`, this.updateTask.bind(this));
    }




    private async verifyFlag(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ message : "Must be flag and task_id." });
        }

        const status: boolean = await this.taskService.verify_flag(task_id, flag);

        return response.status(200).json({ status: status});
    }

    private async addTask(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ message : "Must be flag and task_id." });
        }

        try{
            await this.taskService.addTask(task_id, flag);
            return response.status(201).json({ message: "Task added successfully." });
        } catch (error){
            return response.status(500).json({ message: error.message || "Failed to add task." });
        }
    }

    private async updateTask(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ message : "Must be flag and task_id." });
        }

        try {
            await this.taskService.updateTask(task_id, flag);
            return response.status(200).json({ message: "Task updated successfully." });
        } catch (err: any) {
            return response.status(500).json({ message: err.message || "Failed to update task." });
        }
    }
}


export default TaskController;