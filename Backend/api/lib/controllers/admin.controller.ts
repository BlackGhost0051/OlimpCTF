import Controller from "../interfaces/controller.interface";
import { Router, Request, Response} from "express";
import AdminService from "../modules/services/admin.service";
import AdminMiddleware from "../middlewares/admin.middleware";
import ChallengeService from "../modules/services/challenge.service";

class AdminController implements Controller{
    public path: string =  '/api/admin';
    public router: Router = Router();

    constructor(private challengeService: ChallengeService,
                private adminService: AdminService) {
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.post(`${this.path}`, AdminMiddleware ,this.isAdmin.bind(this));
    }


    private async addTask(request: Request, response: Response) {

        try{

        } catch (error){
            return response.status(500).json({ status: false });
        }
    }

    private async getUsers(request: Request, response: Response) {
        return response.status(200).json({ status: true });
    }

    private async getLogs(request: Request, response: Response) {
        return response.status(200).json({ status: true });
    }


    private async isAdmin(request: Request, response: Response) {
        return response.status(200).json({ status: true });
    }
}

export default AdminController;