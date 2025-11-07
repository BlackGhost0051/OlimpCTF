import DatabaseService from "./database.service";
import PasswordService from "./password.service";

class AdminService{
    private dbService: DatabaseService;
    private passwordService: PasswordService;

    constructor() {
        this.dbService = new DatabaseService();
        this.passwordService = new PasswordService();
    }

    public async checkIfUserIsAdmin(login: string): Promise<boolean> {
        return await this.dbService.isAdmin(login);
    }

    public async login(login: string, password: string) {
        const user = await this.dbService.getUser(login);

        if (!user) {
            throw new Error("Access denied.");
        }

        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Access denied.");
        }

        const isAdmin = await this.dbService.isAdmin(login);

        if (!isAdmin) {
            throw new Error("Access denied.");
        }

        return {
            id: user.id,
            login: user.login,
            email: user.email,
            isAdmin: user.isadmin,
        };
    }
}

export default AdminService;