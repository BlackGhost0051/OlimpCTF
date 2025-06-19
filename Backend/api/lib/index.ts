import App from './app';
import UserController from "./controllers/user.controller";

const app: App = new App([
    new UserController()
]);

app.listen();