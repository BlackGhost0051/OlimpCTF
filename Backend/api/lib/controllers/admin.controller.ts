import Controller from "../interfaces/controller.interface";
import { Router, Request, Response} from "express";
import AdminService from "../modules/services/admin.service";
import AdminMiddleware from "../middlewares/admin.middleware";
import ChallengeService from "../modules/services/challenge.service";
import UserService from "../modules/services/user.service";
import { Task } from "../modules/models/task.model";

class AdminController implements Controller{
    public path: string =  '/api/admin';
    public router: Router = Router();

    private challengeService: ChallengeService;
    private adminService: AdminService;
    private userService: UserService;

    constructor() {
        this.challengeService = new ChallengeService();
        this.adminService = new AdminService();
        this.userService = new UserService();

        this.initializeRoutes();
    }

    private initializeRoutes(){
        // TODO: after test need add Middleware
        this.router.post(`${this.path}`, AdminMiddleware ,this.isAdmin.bind(this));

        this.router.post(`${this.path}/task`, this.addTask.bind(this));
        this.router.delete(`${this.path}/task`, AdminMiddleware , this.deleteTask.bind(this));

        this.router.get(`${this.path}/users`, this.getUsers.bind(this));
        this.router.get(`${this.path}/logs`, AdminMiddleware , this.getLogs.bind(this));
    }


    // TODO: it verified but need add in front
    // POST http://localhost:5000/api/admin/task
    // {
    //     "task": {
    //         "title": "Test title",
    //         "category": "WEB",
    //         "icon": "icon",
    //         "difficulty": "hard",
    //         "points": 100,
    //         "description": "Test description"
    //     },
    //     "flag":"FLAG"
    // }


    // TODO: verify if it add to task-runner-db
    // NOTE: It add to backend-db OK
    private async addTask(request: Request, response: Response) {
        const { task, flag } : {task: Task, flag: string} = request.body;

        if (!task.title || task.title === "" ||
            !task.category || task.category === "" ||
            !task.difficulty || task.difficulty === "" ||
            !task.points ||
            !task.description || task.description === "" ||
            !flag || flag === ""
        ) {

            return response.status(400).json({
                status: false,
                message: "Task must have title, category, flag, difficulty, points and description."
            });
        }

        try{
            await this.challengeService.addTask(task, flag);
            return response.status(200).json({ status: true, message: "Task added." });
        } catch (error){
            return response.status(500).json({ status: false });
        }
    }

    private async deleteTask(request: Request, response: Response){
        const { task_id } = request.body;

        if(!task_id){
            return response.status(400).json({ status: false, message : "Must be id." });
        }

        try{
            await this.challengeService.deleteTask(task_id);
            return response.status(200).json({ status: true, message: "Task deleted." });
        } catch (error) {
            return response.status(500).json({ status: false });
        }
    }

    private async getUsers(request: Request, response: Response) {
        try{
            const users = await this.userService.getUsers();
            return response.status(200).json({ status: true, users:users, message: "Users." });
        } catch (error){
            return response.status(500).json({ status: false });
        }
    }

    private async getLogs(request: Request, response: Response) {
        return response.status(200).json({ status: true });
    }


    private async isAdmin(request: Request, response: Response) {
        return response.status(200).json({ status: true });
    }
}

export default AdminController;