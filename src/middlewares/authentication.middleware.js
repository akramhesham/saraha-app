import { BadRequestException, SYS_MESSAGE, verifyToken } from "../common/index.js";
import { userRepository } from "../DB/index.js";
import { tokenRepository } from "../DB/models/token/token.repository.js";
import { redisClient } from "../DB/redis.js";

export const isAuthenticate=async(req,res,next)=>{
    const {authorization} = req.headers;
    const payload=verifyToken(authorization,'sdsfdsfddfsfsdffdsfds');
    const user=await userRepository.getOne({_id:payload.sub});
    if(!user){
        throw new NotFoundException(SYS_MESSAGE.user.notFound);
    }
    // console.log({
    //     credentialsUpdatedAt:new Date(user.credentialsUpdatedAt).getTime(),
    //     tokensIssuedAt:payload.iat*1000  
    // })
    if(new Date(user.credentialsUpdatedAt).getTime()>payload.iat*1000 ){
        throw new BadRequestException('invalid token');
    }
    // const tokenexist=await tokenRepository.getOne({token:payload.jti});
    const tokenexist=await redisClient.get(`bl_${payload.jti}`)
    if(tokenexist){
        throw new BadRequestException('revoked token');
    }
    req.user=user;
    req.payload=payload;
    next();
}