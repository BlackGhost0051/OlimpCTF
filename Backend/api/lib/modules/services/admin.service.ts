import DatabaseService from "./database.service";

class AdminService{
    private dbService: DatabaseService;
    constructor() {
        this.dbService = new DatabaseService();
    }

    public async checkIfUserIsAdmin(login: string): Promise<boolean> {
        return await this.dbService.isAdmin(login);
    }
}

export default AdminService;