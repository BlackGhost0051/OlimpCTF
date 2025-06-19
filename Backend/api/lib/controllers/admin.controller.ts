import Controller from "../interfaces/controller.interface";
import { Router, Request, Response} from "express";
import AdminService from "../modules/services/admin.service";

class AdminController implements Controller{
    public path: string =  '/api/admin';
    public router: Router = Router();

    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();

        this.initializeRoutes();
    }

    private initializeRoutes(){

    }
}

export default AdminController;