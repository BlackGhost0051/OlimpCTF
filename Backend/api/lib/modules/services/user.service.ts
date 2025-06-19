import databaseService from "./database.service";
import PasswordService from "./password.service";
import DatabaseService from "./database.service";

class UserService{
    private databaseService: DatabaseService;
    private passwordService: PasswordService;

    constructor() {
        this.databaseService = new DatabaseService();
        this.passwordService = new PasswordService();
    }

    async login(login: string, password: string ){
        const user = await this.databaseService.getUser(login);

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        return {
            id: user.id,
            login: user.login,
            email: user.email,
            isAdmin: user.isadmin,
        };
    }

    async register(login: string, email: string, password: string){
        const existingUser = await this.databaseService.getUser(login);

        if (existingUser) {
            throw new Error("Login or email already in use");
        }

        const hashedPassword = await this.passwordService.hashPassword(password);

        const newUser = await this.databaseService.addUser(login, email, hashedPassword);

        return newUser;
    }

    async change_password(login: string, password: string, new_password: string){
        const user = await this.databaseService.getUser(login);
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        const hashedPassword = await this.passwordService.hashPassword(new_password);
        await this.databaseService.updateUserPassword(user.login, hashedPassword);
    }
}

export default UserService;