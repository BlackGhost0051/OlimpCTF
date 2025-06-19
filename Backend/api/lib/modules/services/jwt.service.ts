import jwt, {verify} from 'jsonwebtoken';
import {JwtPayload} from "../models/jwt.payload.model";
import {config} from "../../config";

class JwtService{
    generateToken(login:string){
        const payload: JwtPayload = { login };

        return jwt.sign(payload, config.JWT_SECRET_KEY,
            { expiresIn: '3d' }
        );

    }
    verifyToken(token:string): JwtPayload{
        try{
            if(token.startsWith('token=')){
                token = token.slice(6, token.length);
            }

            return jwt.verify(token, config.JWT_SECRET_KEY) as JwtPayload;
        } catch (error){
            throw new Error('Invalid or expired token');
        }
    }
}

export default JwtService;