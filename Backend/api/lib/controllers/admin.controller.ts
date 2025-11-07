import Controller from "../interfaces/controller.interface";
import { Router, Request, Response} from "express";
import AdminService from "../modules/services/admin.service";
import AdminMiddleware from "../middlewares/admin.middleware";
import ChallengeService from "../modules/services/challenge.service";
import UserService from "../modules/services/user.service";
import { Task } from "../modules/models/task.model";
import JwtService from "../modules/services/jwt.service";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */
class AdminController implements Controller{
    public path: string =  '/api/admin';
    public router: Router = Router();

    private challengeService: ChallengeService;
    private adminService: AdminService;
    private userService: UserService;
    private jwtService: JwtService;

    constructor() {
        this.challengeService = new ChallengeService();
        this.adminService = new AdminService();
        this.userService = new UserService();
        this.jwtService = new JwtService();

        this.initializeRoutes();
    }

    private initializeRoutes(){
        /**
         * @swagger
         * /api/admin/login:
         *   post:
         *     summary: Admin login
         *     tags: [Admin]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - login
         *               - password
         *             properties:
         *               login:
         *                 type: string
         *                 description: Admin username
         *               password:
         *                 type: string
         *                 format: password
         *                 description: Admin password
         *     responses:
         *       200:
         *         description: Login successful
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 token:
         *                   type: string
         *                 message:
         *                   type: string
         *       400:
         *         description: Missing credentials
         *       401:
         *         description: Invalid credentials or not an admin
         */
        this.router.post(`${this.path}/login`, this.login.bind(this));

        /**
         * @swagger
         * /api/admin:
         *   post:
         *     summary: Check if user is admin
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: User is admin
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *       401:
         *         description: Unauthorized
         */
        // TODO: after test need add Middleware
        this.router.post(`${this.path}`, AdminMiddleware ,this.isAdmin.bind(this));

        /**
         * @swagger
         * /api/admin/task:
         *   post:
         *     summary: Add a new challenge task
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - task
         *               - flag
         *             properties:
         *               task:
         *                 type: object
         *                 required:
         *                   - title
         *                   - category
         *                   - difficulty
         *                   - points
         *                   - description
         *                 properties:
         *                   title:
         *                     type: string
         *                   category:
         *                     type: string
         *                   icon:
         *                     type: string
         *                   difficulty:
         *                     type: string
         *                     enum: [easy, medium, hard]
         *                   points:
         *                     type: number
         *                   description:
         *                     type: string
         *               flag:
         *                 type: string
         *                 description: The flag for the task
         *     responses:
         *       200:
         *         description: Task added successfully
         *       400:
         *         description: Invalid input
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/task`, this.addTask.bind(this));

        /**
         * @swagger
         * /api/admin/task:
         *   delete:
         *     summary: Delete a challenge task
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - task_id
         *             properties:
         *               task_id:
         *                 type: string
         *                 description: Task ID to delete
         *     responses:
         *       200:
         *         description: Task deleted successfully
         *       400:
         *         description: Missing task_id
         *       500:
         *         description: Server error
         */
        this.router.delete(`${this.path}/task`, AdminMiddleware , this.deleteTask.bind(this));

        /**
         * @swagger
         * /api/admin/users:
         *   get:
         *     summary: Get all users
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of all users
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *                 users:
         *                   type: array
         *                   items:
         *                     type: object
         *                 message:
         *                   type: string
         *       500:
         *         description: Server error
         */
        this.router.get(`${this.path}/users`, this.getUsers.bind(this));

        /**
         * @swagger
         * /api/admin/logs:
         *   get:
         *     summary: Get system logs
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: System logs
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *       500:
         *         description: Server error
         */
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

        if (task.difficulty !== "easy" &&
            task.difficulty !== "medium" &&
            task.difficulty !== "hard"
        ){
            return response.status(400).json({
                status: false,
                message: "Difficulty must be easy, medium or hard."
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

    private async login(request: Request, response: Response) {
        const { login, password } = request.body;

        if(!login || !password){
            return response.status(400).json({ error: "Login and password are required." });
        }

        try{
            const user = await this.adminService.login(login, password);

            const token = this.jwtService.generateToken(user.login);

            return response.status(200).json({ token: token, message: "Admin is logged." });
        } catch (error){
            return response.status(401).json({ message: error.message });
        }
    }
}

export default AdminController;