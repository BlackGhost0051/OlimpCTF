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

    // TODO: need verify
    async getUsers(){
        const users: any[] = await this.databaseService.getUsers();

        return users;
    }

    async getUser(identifier: string) {
        const user = await this.databaseService.getUser(identifier);

        if (!user) {
            throw new Error("User not found");
        }

        return {
            id: user.id,
            login: user.login,
            email: user.email,
            isAdmin: user.isadmin,
            created_at: user.created_at,
        };
    }

    async getProfile(identifier: string, requestingUserLogin?: string){
        const user = await this.databaseService.getUser(identifier);

        if (!user) {
            throw new Error("User not found");
        }

        // Check if profile is private and if the requesting user is not the profile owner
        if (user.isprivate && requestingUserLogin !== user.login) {
            throw new Error("This profile is private");
        }

        return {
            name: user.name,
            lastname: user.lastname,
            login: user.login,
            email: user.email,
            email_verified: user.email_verified,
            created_at: user.created_at,
            bio: user.bio,
            isPrivate: user.isprivate,
        };
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

    async updatePrivacy(login: string, isPrivate: boolean){
        const user = await this.databaseService.getUser(login);
        if (!user) {
            throw new Error("User not found");
        }

        await this.databaseService.updateUserPrivacy(login, isPrivate);
    }
}

export default UserService;