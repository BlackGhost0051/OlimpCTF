import express from 'express';

import { config } from './config'
import DatabaseService from "./modules/services/database.service";

class App {
    public app: express.Application;


    constructor() {
        this.app = express();
        const databaseService = new DatabaseService();
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
}
export default App;
