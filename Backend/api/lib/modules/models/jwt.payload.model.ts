export interface JwtPayload{
    login: string;
    iat?: number;
    exp?: number;
}