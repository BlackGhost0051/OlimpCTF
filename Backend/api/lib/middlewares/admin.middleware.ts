import { Request, Response, NextFunction} from "express";
import JwtService from "../modules/services/jwt.service";
import DatabaseService from "../modules/services/database.service";
import AdminService from "../modules/services/admin.service";
import UserService from "../modules/services/user.service";

const jwtService = new JwtService();
const adminService = new AdminService();
const userService = new UserService();

const verifyToken = async (request: Request, response: Response, next: NextFunction) => {
    let token = request.headers['x-auth-token'] || request.headers['authorization'];

    if (!token) {
        token = request.cookies?.token;
    }

    if(token && typeof token === 'string'){
        if (token.startsWith('Bearer ')){
            token = token.slice(7, token.length);
        }

        try{
            const decoded = jwtService.verifyToken(token);
            const dbUser = await userService.getUser(decoded.login);

            if(!dbUser){
                return response.status(403).json({ status: false });
            }


            const isAdmin = await adminService.checkIfUserIsAdmin(decoded.login);

            if (!isAdmin) {
                return response.status(403).json({ status: false });
            }

            (request as any).user = dbUser;

            next();
        } catch (ex){
            return response.status(400).json({ error: 'Invalid token.' });
        }

    } else {
        return response.status(401).json({ error: 'Access denied. No token provided.' });
    }
}

export default verifyToken;