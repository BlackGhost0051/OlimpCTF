import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";

import TaskService from "../modules/services/task.service";

class TaskController implements Controller{
    public path: string = '/api/task';
    public router: Router = Router();

    constructor(taskService: TaskService) {
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.post(`${this.path}/:id`, this.getTaskInfo.bind(this));
        this.router.post(`${this.path}/verify_flag`, this.verifyFlag.bind(this));
    }



    private async getTaskInfo(request: Request, response: Response){

    }

    private async verifyFlag(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ message : "Must be flag and task_id." });
        }
    }
}


export default TaskController;