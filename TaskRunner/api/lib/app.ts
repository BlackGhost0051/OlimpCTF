import express from 'express';

import { config } from './config'
import Controller from "./interfaces/controller.interface";

import bodyParser from "body-parser";
import cors from "cors"
import DockerService from './modules/services/docker.service';

class App {
    public app: express.Application;


    constructor(controllers: Controller[]) {
        this.app = express();

        this.initializeMiddlewares();
        this.initializeControllers(controllers);

        this.startTest();
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private initializeMiddlewares(): void{
        this.app.use(cors());
        this.app.use(bodyParser.json());

    }


    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }

    private startTest(){
        const dockerService = new DockerService();
        dockerService.startExampleWebTask();

    }
}
export default App;
