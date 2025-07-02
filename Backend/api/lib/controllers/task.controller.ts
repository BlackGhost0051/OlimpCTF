import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";

class TaskController implements Controller{
    public path: string = '/api/task';
    public router: Router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get(`${this.path}/:id`);
    }
}


export default TaskController;