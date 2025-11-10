import express from 'express';

import { config } from './config'
import Controller from "./interfaces/controller.interface";

import bodyParser from "body-parser";
import cors from "cors"
import loggerMiddleware from './middlewares/logger.middleware';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

class App {
    public app: express.Application;


    constructor(controllers: Controller[]) {
        this.app = express();

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private initializeMiddlewares(): void{
        this.app.use(loggerMiddleware);
        this.app.use(cors());
        this.app.use(bodyParser.json({ limit: '7mb' }));
        this.connectSwagger();
    }

    private connectSwagger(){
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'OlimpCTF API',
                    version: '1.0.0',
                    description: 'API documentation for OlimpCTF Backend',
                },
                servers: [{ url: `http://localhost:${config.port}` }],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        }
                    }
                }
            },
            apis: [__dirname + '/controllers/*.ts'],
        };

        const swaggerSpec = swaggerJsdoc(swaggerOptions);
        this.app.use('/swagpag', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }


    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
}
export default App;
