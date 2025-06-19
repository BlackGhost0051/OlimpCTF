import databaseService from "./database.service";
import PasswordService from "./password.service";

class UserService{
    private passwordService: PasswordService;

    constructor() {
        this.passwordService = new PasswordService();
    }

    async login(login: string, password: string ){

    }

    async register(login: string, password: string, email: string){

    }

    async change_password(login: string, password: string, new_password: string){

    }
}

export default UserService;