import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export function signToken(payload,secretKey,options){
    payload.jti=crypto.randomBytes(10).toString('hex');
    return jwt.sign(payload,secretKey,options)
}
export function verifyToken(token,secret='dsfsdfdsffds'){
    return jwt.verify(token,secret)
}
export function generateTokens(payload){
        const accessToken=signToken(payload,'sdsfdsfddfsfsdffdsfds',{
            expiresIn:1200
        });
        const refreshToken=signToken(payload,'vcxvfddfgdbvfdfdgbfdbfdfbvfd',{
            expiresIn:"1y"
        });
    return {accessToken,refreshToken};    
}