import {NextFunction, Request, Response} from "express";
import LogService from "../modules/services/log.service";

const loggerMiddleware = (request: Request, response: Response, next: NextFunction)=> {
    const logService = new LogService();
    logService.connect();
    logService.log(request.method + " " + request.url);

    next();
}

export default loggerMiddleware;