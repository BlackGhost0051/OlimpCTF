import Controller from "../interfaces/controller.interface";
import { Router, Request, Response} from "express";
import AdminService from "../modules/services/admin.service";
import AdminMiddleware from "../middlewares/admin.middleware";

class AdminController implements Controller{
    public path: string =  '/api/admin';
    public router: Router = Router();

    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();

        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.post(`${this.path}`, AdminMiddleware ,this.isAdmin.bind(this));
    }


    private async isAdmin(request: Request, response: Response) {
        return response.status(200).json({ status: true });
    }
}

export default AdminController;