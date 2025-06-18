import bcrypt from 'bcrypt';

class PasswordService{
    async hashPassword(password: string): Promise<string>{
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>{
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

export default PasswordService;