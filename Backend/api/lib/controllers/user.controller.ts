import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";
import UserService from "../modules/services/user.service";
import JwtService from "../modules/services/jwt.service";
import JwtMiddleware from "../middlewares/jwt.middleware";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User authentication and profile management
 */
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
        /**
         * @swagger
         * /api/user/login:
         *   post:
         *     summary: User login
         *     tags: [User]
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
         *                 description: Username
         *               password:
         *                 type: string
         *                 format: password
         *                 description: User password
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
         *         description: Invalid credentials
         */
        this.router.post(`${this.path}/login`, this.login.bind(this));

        /**
         * @swagger
         * /api/user/register:
         *   post:
         *     summary: Register a new user
         *     tags: [User]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - login
         *               - password
         *               - email
         *             properties:
         *               login:
         *                 type: string
         *                 description: Username
         *               password:
         *                 type: string
         *                 format: password
         *                 description: User password
         *               email:
         *                 type: string
         *                 format: email
         *                 description: User email
         *     responses:
         *       201:
         *         description: User registered successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 token:
         *                   type: string
         *       400:
         *         description: Invalid input or user already exists
         */
        this.router.post(`${this.path}/register`, this.register.bind(this));

        /**
         * @swagger
         * /api/user/profile:
         *   get:
         *     summary: Get current user profile
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: User profile information
         *       401:
         *         description: Unauthorized
         */
        this.router.get(`${this.path}/profile`, JwtMiddleware, this.profile.bind(this));

        /**
         * @swagger
         * /api/user/profile/{login}:
         *   get:
         *     summary: Get user profile by login
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: login
         *         required: true
         *         schema:
         *           type: string
         *         description: Username to fetch
         *     responses:
         *       200:
         *         description: User profile information
         *       400:
         *         description: Login is required
         *       404:
         *         description: User not found
         */
        this.router.get(`${this.path}/profile/:login`, JwtMiddleware, this.getUserProfile.bind(this));

        /**
         * @swagger
         * /api/user/change_password:
         *   patch:
         *     summary: Change user password
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - password
         *               - new_password
         *             properties:
         *               password:
         *                 type: string
         *                 format: password
         *                 description: Current password
         *               new_password:
         *                 type: string
         *                 format: password
         *                 description: New password
         *     responses:
         *       200:
         *         description: Password changed successfully
         *       400:
         *         description: Invalid input
         *       401:
         *         description: Unauthorized
         */
        this.router.patch(`${this.path}/change_password`, JwtMiddleware, this.change_password.bind(this));

        /**
         * @swagger
         * /api/user/privacy:
         *   patch:
         *     summary: Update user privacy settings
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - isPrivate
         *             properties:
         *               isPrivate:
         *                 type: boolean
         *                 description: Privacy setting
         *     responses:
         *       200:
         *         description: Privacy settings updated
         *       400:
         *         description: Invalid input
         *       401:
         *         description: Unauthorized
         */
        this.router.patch(`${this.path}/privacy`, JwtMiddleware, this.updatePrivacy.bind(this));

        /**
         * @swagger
         * /api/user/icon:
         *   patch:
         *     summary: Update user profile icon
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - icon
         *             properties:
         *               icon:
         *                 type: string
         *                 description: Base64 encoded image (data:image/png;base64,...)
         *     responses:
         *       200:
         *         description: Icon updated successfully
         *       400:
         *         description: Invalid input
         *       401:
         *         description: Unauthorized
         */
        this.router.patch(`${this.path}/icon`, JwtMiddleware, this.updateIcon.bind(this));

        /**
         * @swagger
         * /api/user/profile:
         *   patch:
         *     summary: Update user profile information
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               name:
         *                 type: string
         *                 minLength: 2
         *               lastname:
         *                 type: string
         *                 minLength: 2
         *               bio:
         *                 type: string
         *                 maxLength: 500
         *               email:
         *                 type: string
         *                 format: email
         *     responses:
         *       200:
         *         description: Profile updated successfully
         *       400:
         *         description: Invalid input
         *       401:
         *         description: Unauthorized
         */
        // TODO: VERIFY and TEST
        this.router.patch(`${this.path}/profile`, JwtMiddleware, this.updateProfile.bind(this));
    }

    private async login(request: Request, response: Response){
        const { login, password } = request.body;

        if(!login || !password){
            return response.status(400).json({ error: "Login and password are required." });
        }

        try{
            const user = await this.userService.login(login, password);

            const token = this.jwtService.generateToken(user.login);

            // TODO: need verify in frontend
            return response.status(200).json({ token: token, message: "User is logged." });
        } catch (error){
            return response.status(401).json({ message: error.message });
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

    private async profile(request: Request, response: Response){
        try{
            const user = (request as any).user;

            if (!user || !user.login) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            const userInfo = await this.userService.getProfile(user.login, user.login);

            return response.status(200).json(userInfo);
        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }

    private async getUserProfile(request: Request, response: Response){
        try{
            const { login } = request.params;
            const requestingUser = (request as any).user;

            if (!login) {
                return response.status(400).json({ error: "Login is required" });
            }

            const userInfo = await this.userService.getProfile(login, requestingUser?.login);

            return response.status(200).json(userInfo);
        } catch (error){
            return response.status(404).json({ error: error.message });
        }
    }

    private async updatePrivacy(request: Request, response: Response){
        try{
            const user = (request as any).user;
            const { isPrivate } = request.body;

            if (!user || !user.login) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            if (typeof isPrivate !== 'boolean') {
                return response.status(400).json({ error: "isPrivate must be a boolean" });
            }

            await this.userService.updatePrivacy(user.login, isPrivate);

            return response.status(200).json({ message: "Privacy settings updated successfully" });
        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }

    private async updateIcon(request: Request, response: Response){
        try{
            const user = (request as any).user;
            const { icon } = request.body;

            if (!user || !user.login) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            if (!icon || typeof icon !== 'string') {
                return response.status(400).json({ error: "Icon is required." });
            }

            await this.userService.updateIcon(user.login, icon);

            return response.status(200).json({ message: "Icon updated successfully" });
        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }
    // TODO: VERIFY and TEST
    private async updateProfile(request: Request, response: Response){
        try{
            const user = (request as any).user;
            const { name, lastname, bio, email } = request.body;

            if (!user || !user.login) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            const updateData: { name?: string, lastname?: string, bio?: string, email?: string } = {};

            if (name !== undefined) updateData.name = name;
            if (lastname !== undefined) updateData.lastname = lastname;
            if (bio !== undefined) updateData.bio = bio;
            if (email !== undefined) updateData.email = email;

            if (Object.keys(updateData).length === 0) {
                return response.status(400).json({ error: "No fields to update" });
            }

            await this.userService.updateProfile(user.login, updateData);

            return response.status(200).json({ message: "Profile updated successfully" });
        } catch (error){
            return response.status(400).json({ error: error.message });
        }
    }
}


export default UserController;