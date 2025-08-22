import {NextFunction, Request, Response} from "express";
import LoggerService from "../modules/services/logger.service";

const loggerMiddleware = (request: Request, response: Response, next: NextFunction)=> {
    const logService = new LoggerService();

    logService.logToFile(request);

    next();
}

export default loggerMiddleware;