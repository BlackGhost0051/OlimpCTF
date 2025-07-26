import App from './app';
import UserController from "./controllers/user.controller";
import AdminController from "./controllers/admin.controller";
import ChallengeController from "./controllers/challenge.controller";

const app: App = new App([
    new UserController(),
    new AdminController(),
    new ChallengeController()
]);

app.listen();