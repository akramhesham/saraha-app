import { Router } from "express";
import { getProfile } from "./user.service.js";
import { NotFoundException, SYS_MESSAGE } from "../../common/index.js";
import { decryption } from "../../common/utils/encryption.utils.js";

const router=Router();

router.get('/:id',async(req,res,next)=>{
    const {id}=req.params;
    const user=await getProfile({_id:id});
    if(!user){
        throw new NotFoundException(SYS_MESSAGE.user.notFound);
    }
    if(user.phoneNumber){
        user.phoneNumber=decryption(user.phoneNumber);
    }
    return res.status(200).json({message:'done',success:true,data:{user}});
})

export default router;