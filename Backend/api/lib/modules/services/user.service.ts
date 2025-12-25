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

    async getUsers(page: number = 1, limit: number = 10, search: string = '') {
        const offset = (page - 1) * limit;

        const users: any[] = await this.databaseService.getUsers(limit, offset, search);
        const totalUsers = await this.databaseService.getUsersCount(search);

        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit
            }
        };
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

        const statistics = await this.databaseService.getUserStatistics(user.login);
        const rank = await this.databaseService.getUserRank(user.login);

        return {
            name: user.name,
            lastname: user.lastname,
            login: user.login,
            email: user.email,
            email_verified: user.email_verified,
            created_at: user.created_at,
            bio: user.bio,
            isPrivate: user.isprivate,
            statistics: statistics,
            rank: rank,
            icon: user.icon,
        };

    //     TODO: verify if more data in ne request is good idea? | icon in big
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

    async updateIcon(login: string, iconBase64: string){
        const user = await this.databaseService.getUser(login);
        if (!user) {
            throw new Error("User not found");
        }

        if (!iconBase64 || !iconBase64.startsWith('data:image/')) {
            throw new Error("Invalid image format. Must be a base64 encoded image.");
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (iconBase64.length > maxSize) {
            throw new Error("Image too large. Maximum size is 5MB.");
        }

        await this.databaseService.updateUserIcon(login, iconBase64);
    }

    // TODO: VERIFY and TEST
    async updateProfile(login: string, data: { name?: string, lastname?: string, bio?: string, email?: string }){
        const user = await this.databaseService.getUser(login);
        if (!user) {
            throw new Error("User not found");
        }

        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error("Invalid email format");
            }

            if (data.email !== user.email) {
                const existingUser = await this.databaseService.getUser(data.email);
                if (existingUser && existingUser.login !== login) {
                    throw new Error("Email already in use");
                }
            }
        }

        if (data.name !== undefined && data.name.length < 2) {
            throw new Error("Name must be at least 2 characters");
        }

        if (data.lastname !== undefined && data.lastname.length < 2) {
            throw new Error("Lastname must be at least 2 characters");
        }

        if (data.bio !== undefined && data.bio.length > 500) {
            throw new Error("Bio must not exceed 500 characters");
        }

        await this.databaseService.updateUserProfile(login, data);
    }

    async getLeaderboard(limit: number = 100) {
        const leaderboardData = await this.databaseService.getLeaderboard(limit);

        return leaderboardData.map((user, index) => ({
            rank: index + 1,
            login: user.login,
            name: user.name,
            lastname: user.lastname,
            icon: user.icon,
            totalPoints: parseInt(user.total_points),
            completedTasks: parseInt(user.completed_tasks),
            createdAt: user.created_at
        }));
    }
}

export default UserService;