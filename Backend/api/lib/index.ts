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

// TODO: RSA or another algorithm to communicate with TASK_RUNNER
// TODO: LOGGER SERVICE ??? how realise
// TODO: input filters ONLY WHITE LIST SYMBOLS
// TODO: STATISTICS GRAPHICS UI LIBRARY


// TODO: All system need firewall