import crypto from 'node:crypto';

export function encryption(plainText){
    const iv=crypto.randomBytes(16);
    const cipher=crypto.createCipheriv('aes-256-cbc',Buffer.from('12345678123456781234567812345678'),iv);
    let encryptedData=cipher.update(plainText,'utf-8','hex');
    encryptedData+=cipher.final('hex');
    return `${iv.toString('hex')}:${encryptedData}`;
}

export function decryption(encrptedData){
    const [iv,encryptedValue]=encrptedData.split(':');
    const ivBufferLike=Buffer.from(iv,'hex');
    const decipher=crypto.createDecipheriv('aes-256-cbc','12345678123456781234567812345678',ivBufferLike);
    let decryptedData=decipher.update(encryptedValue,'hex','utf-8');
    decryptedData+=decipher.final('utf-8');
    return decryptedData;
}