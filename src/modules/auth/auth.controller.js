import { Router } from "express";
import { checkUserExist, createUser } from "../user/user.service.js";
import { BadRequestException, compare, ConflictException, hash, SYS_MESSAGE, SYS_ROLE } from "../../common/index.js";
import { encryption } from "../../common/utils/encryption.utils.js";

const router = Router();

router.post('/signup', async(req, res, next) => {
    const { email, phoneNumber } = req.body;
    const userCheck=await checkUserExist({
        $or: [{
            email: { $eq: email, $exists: true, $ne: null }
        }, {
            phoneNumber: { $eq: phoneNumber, $exists: true, $ne: null }
        }]
    })
    if(userCheck){
        throw new ConflictException(SYS_MESSAGE.user.alreadyExist);
    }
    req.body.role=SYS_ROLE.user;
    req.body.password=await hash(req.body.password);
    if(req.body.phoneNumber){
        req.body.phoneNumber=encryption(req.body.phoneNumber);
    }
        const createdUser=await createUser(req.body);
    return res.status(201).json({message:SYS_MESSAGE.user.created,success:true,data:{createdUser}})
})

router.post('/login',async(req,res,next)=>{
    const {email,password}=req.body;
    const userExist=await checkUserExist({email:{$eq:email,$exists:true,$ne:null}});
    const match=await compare(password,userExist?.password||'dfsfsdfdsfdsfdsfsd');
    if(!userExist){
        throw new BadRequestException("invalid credentials");
    }
    if(!match){
        throw new BadRequestException("invalid credentials");
    }
    const userData=JSON.parse(JSON.stringify(userExist));
    delete userData.password;
    return res.status(201).json({message:SYS_MESSAGE.user.created,success:true,data:{userData}})
})
export default router;