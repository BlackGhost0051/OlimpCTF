import Controller from "../interfaces/controller.interface";
import { Router, Request, Response } from "express";

import ChallengeService from "../modules/services/challenge.service";
import JwtMiddleware from "../middlewares/jwt.middleware";
import {Task} from "../modules/models/task.model";

/**
 * @swagger
 * tags:
 *   name: Challenge
 *   description: Challenge management API
 */
class ChallengeController implements Controller{
    public path: string = '/api/challenge';
    public router: Router = Router();

    private challengeService: ChallengeService;

    constructor() {
        this.challengeService = new ChallengeService();
 
        this.initializeRoutes();
    }

    private initializeRoutes(){
        /**
         * @swagger
         * /api/challenge/verify_flag:
         *   post:
         *     summary: Verify a challenge flag
         *     tags: [Challenge]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - flag
         *               - task_id
         *             properties:
         *               flag:
         *                 type: string
         *                 description: The flag to verify
         *               task_id:
         *                 type: string
         *                 description: The task ID
         *     responses:
         *       200:
         *         description: Flag verification result
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *                 message:
         *                   type: string
         *       400:
         *         description: Missing required fields
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/verify_flag`, JwtMiddleware , this.verifyFlag.bind(this));

        /**
         * @swagger
         * /api/challenge/category_tasks:
         *   post:
         *     summary: Get tasks for a specific category
         *     tags: [Challenge]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - category
         *             properties:
         *               category:
         *                 type: string
         *                 description: Category name
         *     responses:
         *       200:
         *         description: List of tasks in the category
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
         *       404:
         *         description: Category not found
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/category_tasks`, JwtMiddleware , this.getCategoryTasks.bind(this));

        /**
         * @swagger
         * /api/challenge/categories:
         *   post:
         *     summary: Get all challenge categories
         *     tags: [Challenge]
         *     responses:
         *       200:
         *         description: List of all categories
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *                 categories:
         *                   type: array
         *                   items:
         *                     type: object
         *                 message:
         *                   type: string
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/categories`, this.getCategories.bind(this));

        /**
         * @swagger
         * /api/challenge/category:
         *   post:
         *     summary: Get information about a specific category
         *     tags: [Challenge]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - nicename
         *             properties:
         *               nicename:
         *                 type: string
         *                 description: Category nicename
         *     responses:
         *       200:
         *         description: Category information
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: boolean
         *                 category:
         *                   type: object
         *                 message:
         *                   type: string
         *       400:
         *         description: Missing nicename
         *       404:
         *         description: Category not found
         *       500:
         *         description: Server error
         */
        this.router.post(`${this.path}/category`, this.getCategory.bind(this));

        // TODO: verify maybe dont need ???
        // this.router.post(`${this.path}/task/:id`, JwtMiddleware , this.getTaskInfo.bind(this));
    }


    

    private async getCategory(request: Request, response: Response){
        const { nicename } = request.body;

        if(!nicename){
            return response.status(400).json({ status: false, message : "Must be nicename." });
        }

        try{
            const category = await this.challengeService.getCategory(nicename);

            if(!category){
                return response.status(404).json({ status: false, message: "Category not found." });
            }

            return response.status(200).json({ status: true, category, message: "Category info." });
        } catch (error) {
            return response.status(500).json({ status: false, message: "Failed to get category." });
        }
    }


    // private async getTaskInfo(request: Request, response: Response){
    //     const { id } = request.body;

    //     if(!id){
    //         return response.status(400).json({ status: false, message : "Must be id." });
    //     }

    //     try{
    //         const user = (request as any).user;
    //         const task = await this.challengeService.getTaskInfo(id, user?.id);

    //         if(!task){
    //             return response.status(404).json({ status: false, message: "Task not found." });
    //         }

    //         return response.status(200).json({ status: true, task, message: "Task info." });
    //     } catch (error){
    //         return response.status(500).json({ status: false, message: "Failed to get task info." });
    //     }
    // }

    private async verifyFlag(request: Request, response: Response){
        const { flag, task_id } = request.body;

        if(!flag || !task_id){
            return response.status(400).json({ status: false, message : "Must be flag and task_id." });
        }

        try{
            const user = (request as any).user;

            const status: boolean = await this.challengeService.verifyFlag(user.login, task_id, flag);

            if(status){
                return response.status(200).json({ status: true, message: "Flag verified successfully." });
            } else {
                return response.status(200).json({ status: false, message: "Flag not verified." });
            }
        } catch (error) {
            return response.status(500).json({ status: false, message: "Failed to verify flag." });
        }
    }

    private async getCategoryTasks(request: Request, response: Response){
        const { category } = request.body;

        if(!category){
            return response.status(400).json({ status: false, message : "Must be category." });
        }

        try{
            const user = (request as any).user;

            if(!user.login){
                return response.status(500).json({ status: false, message: "Fix page!!!" });
            }

            const tasks = await this.challengeService.getCategoryTasks(category, user.login);

            if(tasks.length === 0){
                return response.status(404).json({ status: false, message: "Category not found." });
            }

            return response.status(200).json({ status: true, tasks, message: "Category tasks." });
        } catch (error) {
            return response.status(500).json({ status: false, message: "Failed to get category tasks." });
        }
    }

    private async getCategories(request: Request, response: Response){
        try{
            const categories = await this.challengeService.getCategories();

            return response.status(200).json({ status: true, categories, message: "Categories." });
        } catch (error) {
            return response.status(500).json({ status: false, message: "Failed to get categories." });
        }
    }
}


export default ChallengeController;