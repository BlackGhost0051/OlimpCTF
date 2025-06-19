import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";
import UserService from "../modules/services/user.service";
import JwtService from "../modules/services/jwt.service";
import JwtMiddleware from "../middlewares/jwt.middleware";


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

        this.router.patch(`${this.path}/change_password`, JwtMiddleware, this.change_password.bind(this));
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return response.status(400).json({ error: "Invalid email format." });
        }

        try{
            const user = await this.userService.register(login, email, password);

            const token = this.jwtService.generateToken(user.login);

            return response.status(201).json({ token });

        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }

    private async change_password(request: Request, response: Response){
        const {password, new_password} = request.body;

        if(!password || !new_password){
            return response.status(400).json({ error: "Password and new password are required." });
        }

        try{
            const user = (request as any).user;

            if (!user || !user.login) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            await this.userService.change_password(user.login, password, new_password);

            return response.status(200).json({ message: "Password changed successfully" });
        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }
}


export default UserController;