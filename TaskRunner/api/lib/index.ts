import App from './app';
import ChallengeController from "./controllers/challenge.controller";

const app: App = new App([
    new ChallengeController()
]);

app.listen();