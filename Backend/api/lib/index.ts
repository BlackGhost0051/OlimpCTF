import App from './app';
import UserController from "./controllers/user.controller";
import AdminController from "./controllers/admin.controller";

const app: App = new App([
    new UserController(),
    new AdminController()
]);

app.listen();