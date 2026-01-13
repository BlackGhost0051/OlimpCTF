import Controller from "../interfaces/controller.interface";
import { Router, Request, Response} from "express";
import AdminService from "../modules/services/admin.service";
import AdminMiddleware from "../middlewares/admin.middleware";
import ChallengeService from "../modules/services/challenge.service";
import UserService from "../modules/services/user.service";
import { Task } from "../modules/models/task.model";
import AdminJwtService from "../modules/services/admin.jwt.service";
import TaskRunnerService from "../modules/services/task.runner.service";
import multer from "multer";
import fs from "fs";
import path from "path";

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
    private adminJwtService: AdminJwtService;
    private taskRunnerService: TaskRunnerService;
    private upload: multer.Multer;

    constructor() {
        this.challengeService = new ChallengeService();
        this.adminService = new AdminService();
        this.userService = new UserService();
        this.adminJwtService = new AdminJwtService();
        this.taskRunnerService = new TaskRunnerService();

        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
        });

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
        this.router.post(`${this.path}/task`, AdminMiddleware, this.addTask.bind(this));

        /**
         * @swagger
         * /api/admin/upload_task:
         *   post:
         *     summary: Upload task with ZIP file (Docker containers/files)
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         multipart/form-data:
         *           schema:
         *             type: object
         *             required:
         *               - task_id
         *               - flag
         *               - task_zip
         *             properties:
         *               task_id:
         *                 type: string
         *               flag:
         *                 type: string
         *               task_zip:
         *                 type: string
         *                 format: binary
         *     responses:
         *       200:
         *         description: Task uploaded successfully
         *       400:
         *         description: Invalid input
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/upload_task`, AdminMiddleware, this.upload.single('task_zip'), this.uploadTask.bind(this));

        /**
         * @swagger
         * /api/admin/task:
         *   put:
         *     summary: Update an existing task
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
         *                 description: Task ID to update
         *               updates:
         *                 type: object
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
         *     responses:
         *       200:
         *         description: Task updated successfully
         *       400:
         *         description: Invalid input or missing task_id
         *       500:
         *         description: Server error
         */
        this.router.put(`${this.path}/task`, AdminMiddleware, this.updateTask.bind(this));

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
         * /api/admin/tasks:
         *   get:
         *     summary: Get all challenge tasks
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of all tasks
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *                 tasks:
         *                   type: array
         *                   items:
         *                     type: object
         *                 message:
         *                   type: string
         *       500:
         *         description: Server error
         */
        this.router.get(`${this.path}/tasks`, AdminMiddleware , this.getAllTasks.bind(this));

        /**
         * @swagger
         * /api/admin/users:
         *   get:
         *     summary: Get paginated list of users
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *           minimum: 1
         *           default: 1
         *         description: Page number
         *       - in: query
         *         name: limit
         *         schema:
         *           type: integer
         *           minimum: 1
         *           maximum: 100
         *           default: 10
         *         description: Number of users per page
         *       - in: query
         *         name: search
         *         schema:
         *           type: string
         *         description: Search term for login or email
         *     responses:
         *       200:
         *         description: Paginated list of users
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
         *                 pagination:
         *                   type: object
         *                   properties:
         *                     currentPage:
         *                       type: integer
         *                     totalPages:
         *                       type: integer
         *                     totalUsers:
         *                       type: integer
         *                     limit:
         *                       type: integer
         *                 message:
         *                   type: string
         *       400:
         *         description: Invalid pagination parameters
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
         *     parameters:
         *       - in: query
         *         name: lines
         *         schema:
         *           type: integer
         *           minimum: 1
         *           maximum: 10000
         *           default: 100
         *         description: Number of most recent log lines to retrieve
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
         *                 logs:
         *                   type: array
         *                   items:
         *                     type: string
         *                 totalLines:
         *                   type: integer
         *       500:
         *         description: Server error
         */
        this.router.get(`${this.path}/logs`, AdminMiddleware , this.getLogs.bind(this));

        /**
         * @swagger
         * /api/admin/categories:
         *   get:
         *     summary: Get all categories
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of all categories
         *       500:
         *         description: Server error
         */
        this.router.get(`${this.path}/categories`, AdminMiddleware, this.getCategories.bind(this));

        /**
         * @swagger
         * /api/admin/categories:
         *   post:
         *     summary: Create a new category
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
         *               - name
         *               - nicename
         *             properties:
         *               name:
         *                 type: string
         *               nicename:
         *                 type: string
         *               details:
         *                 type: string
         *               url:
         *                 type: string
         *               icon:
         *                 type: string
         *     responses:
         *       200:
         *         description: Category created successfully
         *       400:
         *         description: Invalid input
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/categories`, AdminMiddleware, this.createCategory.bind(this));

        /**
         * @swagger
         * /api/admin/categories/:id:
         *   put:
         *     summary: Update a category
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               name:
         *                 type: string
         *               nicename:
         *                 type: string
         *               details:
         *                 type: string
         *               url:
         *                 type: string
         *               icon:
         *                 type: string
         *     responses:
         *       200:
         *         description: Category updated successfully
         *       400:
         *         description: Invalid input
         *       404:
         *         description: Category not found
         *       500:
         *         description: Server error
         */
        this.router.put(`${this.path}/categories/:id`, AdminMiddleware, this.updateCategory.bind(this));
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
            const userLogin = (request as any).user?.login;
            if (userLogin) {
                const user = await this.userService.getUser(userLogin);
                if (user) {
                    task.author = user.id;
                }
            }

            await this.challengeService.addTask(task, flag);
            return response.status(200).json({ status: true, message: "Task added." });
        } catch (error){
            return response.status(500).json({ status: false });
        }
    }

    private async uploadTask(request: Request, response: Response) {
        const { task, flag } = request.body;
        const file = request.file;

        if (!task || !flag || !file) {
            return response.status(400).json({
                status: false,
                message: "Missing required fields (task, flag, task_zip)"
            });
        }

        try {
            const taskData = typeof task === 'string' ? JSON.parse(task) : task;

            if (!taskData.title || !taskData.category || !taskData.difficulty ||
                !taskData.points || !taskData.description) {
                return response.status(400).json({
                    status: false,
                    message: "Task must have title, category, difficulty, points and description."
                });
            }

            if (taskData.difficulty !== "easy" &&
                taskData.difficulty !== "medium" &&
                taskData.difficulty !== "hard") {
                return response.status(400).json({
                    status: false,
                    message: "Difficulty must be easy, medium or hard."
                });
            }

            const { v4: uuidv4 } = require('uuid');
            taskData.id = uuidv4();

            // Extract user login from JWT token and get user ID
            const userLogin = (request as any).user?.login;
            if (userLogin) {
                const user = await this.userService.getUser(userLogin);
                if (user) {
                    taskData.author = user.id;
                }
            }

            await this.challengeService.addTaskToBackendOnly(taskData as Task);

            await this.taskRunnerService.uploadTask(taskData.id, flag, file.buffer);

            return response.status(200).json({
                status: true,
                message: "Task uploaded successfully",
                task_id: taskData.id
            });
        } catch (error: any) {
            console.error('Error uploading task:', error);
            return response.status(500).json({
                status: false,
                message: error.message || "Failed to upload task"
            });
        }
    }

    private async updateTask(request: Request, response: Response) {
        const { task_id, updates } = request.body;

        if (!task_id) {
            return response.status(400).json({
                status: false,
                message: "Task ID is required."
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return response.status(400).json({
                status: false,
                message: "No updates provided."
            });
        }

        // Validate difficulty if it's being updated
        if (updates.difficulty &&
            updates.difficulty !== "easy" &&
            updates.difficulty !== "medium" &&
            updates.difficulty !== "hard") {
            return response.status(400).json({
                status: false,
                message: "Difficulty must be easy, medium or hard."
            });
        }

        try {
            await this.challengeService.updateTask(task_id, updates);
            return response.status(200).json({
                status: true,
                message: "Task updated successfully."
            });
        } catch (error: any) {
            console.error('Error updating task:', error);
            return response.status(500).json({
                status: false,
                message: error.message || "Failed to update task"
            });
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

    private async getAllTasks(request: Request, response: Response) {
        try{
            const tasks = await this.challengeService.getAllTasks();
            return response.status(200).json({
                status: true,
                message: "Tasks retrieved successfully.",
                tasks: tasks
            });
        } catch (error) {
            return response.status(500).json({ status: false, message: "Internal server error" });
        }
    }

    private async getUsers(request: Request, response: Response) {
        try{
            const page = parseInt(request.query.page as string) || 1;
            const limit = parseInt(request.query.limit as string) || 10;
            const search = request.query.search as string || '';

            if (page < 1 || limit < 1 || limit > 100) {
                return response.status(400).json({
                    status: false,
                    message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100."
                });
            }

            const result = await this.userService.getUsers(page, limit, search);
            return response.status(200).json({
                status: true,
                message: "Users retrieved successfully.",
                limit: result.pagination.limit,
                currentPage: result.pagination.currentPage,
                totalUsers: result.pagination.totalUsers,
                totalPages: result.pagination.totalPages,
                users: result.users
            });
        } catch (error){
            return response.status(500).json({ status: false, message: "Internal server error" });
        }
    }

    private async getLogs(request: Request, response: Response) {
        try {
            const lines = parseInt(request.query.lines as string) || 100;

            if (lines < 1 || lines > 10000) {
                return response.status(400).json({
                    status: false,
                    message: "Lines must be between 1 and 10000"
                });
            }

            const logFilePath = path.join(__dirname, '../logs/app.log');

            if (!fs.existsSync(logFilePath)) {
                return response.status(200).json({
                    status: true,
                    logs: [],
                    totalLines: 0,
                    message: "Log file not found"
                });
            }

            const fileContent = fs.readFileSync(logFilePath, 'utf8');
            const allLines = fileContent.split('\n').filter(line => line.trim() !== '');
            const totalLines = allLines.length;

            const recentLogs = allLines.slice(-lines);

            return response.status(200).json({
                status: true,
                logs: recentLogs,
                totalLines: totalLines,
                message: `Retrieved ${recentLogs.length} log entries`
            });
        } catch (error) {
            console.error('Error reading logs:', error);
            return response.status(500).json({
                status: false,
                message: "Error reading log file"
            });
        }
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

            const token = this.adminJwtService.generateToken(user.login);

            return response.status(200).json({ token: token, message: "Admin is logged." });
        } catch (error){
            return response.status(401).json({ message: error.message });
        }
    }

    private async getCategories(request: Request, response: Response) {
        try {
            const categories = await this.challengeService.getCategories();
            return response.status(200).json(categories);
        } catch (error) {
            return response.status(500).json({ status: false, message: "Error fetching categories" });
        }
    }

    private async createCategory(request: Request, response: Response) {
        const { name, nicename, details, url, icon } = request.body;

        if (!name || !nicename) {
            return response.status(400).json({
                status: false,
                message: "Name and nicename are required"
            });
        }

        try {
            const category = await this.challengeService.createCategory(
                name,
                nicename,
                details || '',
                url || '',
                icon || ''
            );
            return response.status(200).json(category);
        } catch (error) {
            return response.status(500).json({ status: false, message: "Error creating category" });
        }
    }

    private async updateCategory(request: Request, response: Response) {
        const { id } = request.params;
        const { name, nicename, details, url, icon } = request.body;

        if (!name || !nicename) {
            return response.status(400).json({
                status: false,
                message: "Name and nicename are required"
            });
        }

        try {
            const category = await this.challengeService.updateCategory(
                parseInt(id),
                name,
                nicename,
                details || '',
                url || '',
                icon || ''
            );

            if (!category) {
                return response.status(404).json({ status: false, message: "Category not found" });
            }

            return response.status(200).json(category);
        } catch (error) {
            return response.status(500).json({ status: false, message: "Error updating category" });
        }
    }
}

export default AdminController;