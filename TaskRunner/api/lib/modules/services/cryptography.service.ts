import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const KEY_HEX = process.env.AES_SECRET_KEY!;
if (!KEY_HEX || Buffer.from(KEY_HEX, 'hex').length !== 32) {
    throw new Error("AES_SECRET_KEY must be a 64-character hex string (32 bytes)");
}

const KEY = Buffer.from(KEY_HEX, 'hex');

class CryptographyService{
    constructor() {}

    public encryptFlag(flag: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);

        const encrypted = Buffer.concat([
            cipher.update(flag, 'utf8'),
            cipher.final()
        ]);

        const tag = cipher.getAuthTag();

        return [
            iv.toString('hex'),
            encrypted.toString('hex'),
            tag.toString('hex')
        ].join(':');
    }

    public decryptFlag(encryptedFlag: string): string {
        const [ivHex, encryptedHex, tagHex] = encryptedFlag.split(':');

        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        return decrypted.toString('utf8');
    }
}

export default CryptographyService;