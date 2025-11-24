import fs from 'fs';
import path from 'path';
import {Request} from "express";

class LoggerService {
    // TODO: logger maybe add Winston library

    private logFilePath: string;

    constructor(){
        this.logFilePath = path.join(__dirname, '../../logs/app.log');

        const logDir = path.dirname(this.logFilePath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    public logToFile(request: Request){
        const timestamp = new Date().toISOString();
        const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || request.ip;
        const userAgent = request.headers['user-agent'] || 'Unknown';
        const method = request.method;
        const url = request.url;

        const fullMessage = `[${timestamp}] ${ip} ${method} ${url} ${userAgent}\n`;


        fs.appendFileSync(this.logFilePath, fullMessage, 'utf8');
    }

}

export default LoggerService;