import * as crypto from 'crypto';

class CryptographyService{
    constructor() {}

    public encryptFlag(flag: string): string {
        const encryptedFlag = flag;
        return encryptedFlag;
    }

    public decryptFlag(encryptedFlag: string): string {
        const decryptedFlag = encryptedFlag;
        return decryptedFlag;
    }
}

export default CryptographyService;