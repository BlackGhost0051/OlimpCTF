import Controller from "../interfaces/controller.interface";
import e, { Router, Request, Response } from "express";
import UserService from "../modules/services/user.service";
import JwtService from "../modules/services/jwt.service";


class UserController implements Controller{
    public path = '/api/user';
    public router = Router();

    private userService: UserService;
    private jwtService: JwtService;

    constructor() {
        this.userService = new UserService();
        this.jwtService = new JwtService();

        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.post(`${this.path}/login`, this.login.bind(this));
        this.router.post(`${this.path}/register`, this.register.bind(this));
    }

    private async login(request: Request, response: Response){
        const { login, password } = request.body;

        if(!login || !password){
            return response.status(400).json({ error: "Login and password are required." });
        }

        const status = this.userService.login(login,password);

    }

    private async register(request: Request, response: Response){
        const { login, password, email } = request.body;

        if(!login || !password || !email ){
            return response.status(400).json({ error: "Login, password and email are required." });
        }

        const status = this.userService.register(login, password, email);
    }
}


export default UserController;