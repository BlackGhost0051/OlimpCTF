import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";
import UserService from "../modules/services/user.service";
import JwtService from "../modules/services/jwt.service";


class UserController implements Controller{
    public path: string = '/api/user';
    public router: Router = Router();

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

        try{
            const user = await this.userService.login(login, password);

            const token = this.jwtService.generateToken(user.login);

            return response.status(200).json({ token });
        } catch (error){
            return response.status(401).json({ error: error.message });
        }

    }

    private async register(request: Request, response: Response){
        const { login, password, email } = request.body;

        if(!login || !password || !email ){
            return response.status(400).json({ error: "Login, password and email are required." });
        }

        try{
            const user = await this.userService.register(login, email, password);

            const token = this.jwtService.generateToken(user.login);

            return response.status(201).json({ token });

        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }
}


export default UserController;