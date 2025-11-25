import jwt, {verify} from 'jsonwebtoken';
import {JwtPayload} from "../models/jwt.payload.model";
import {config} from "../../config";

class AdminJwtService{
    generateToken(login:string){
        const payload: JwtPayload = { login };

        return jwt.sign(payload, config.ADMIN_JWT_SECRET_KEY,
            { expiresIn: '3h' , algorithm: 'HS512' }
        );

    }
    verifyToken(token:string): JwtPayload{
        try{
            if(token.startsWith('token=')){
                token = token.slice(6, token.length);
            }

            return jwt.verify(token, config.ADMIN_JWT_SECRET_KEY, { algorithms: ['HS512'] }) as JwtPayload;
        } catch (error){
            throw new Error('Invalid or expired token');
        }
    }
}

export default AdminJwtService;