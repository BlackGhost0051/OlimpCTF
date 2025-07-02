import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";

class TaskController implements Controller{
    public path: string = '/api/task';
    public router: Router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(){
    }
}


export default TaskController;