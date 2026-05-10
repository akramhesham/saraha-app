import { Router } from "express";
import { SYS_MESSAGE } from "../../common/constant/message.constant.js";
import { getAllMessages, getSpecificMessage, sendMessage } from "./message.service.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { isAuthenticate } from "../../middlewares/authentication.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();

const limit=rateLimit({
    windowMs:1*60*60*1000,
    limit:40
});

router.use(limit);

router.post('/:receiverId/anonymous'
    ,fileUpload().array('attachments',2)
    ,async(req,res,next)=>{
    const {content}=req.body;
    const {receiverId}=req.params;
    const files=req.files;
    const createdMessage=await sendMessage(content,files,receiverId);
    return res.status(201).json({
        message:SYS_MESSAGE.message.created
        ,success:true
        ,data:{createdMessage}})
})

router.post('/:receiverId/public'
    ,isAuthenticate
    ,fileUpload().array('attachments',2)
    ,async(req,res,next)=>{
      const {content}=req.body;
      const {receiverId}=req.params;
      const files=req.files;
      const senderId=req.user._id;
      const createdMessage=await sendMessage(content,files,receiverId,senderId);
      return res.status(201).json({
        message:SYS_MESSAGE.message.created,
        success:true,
        data:{createdMessage}
      })
})

router.get('/:id',isAuthenticate,async(req,res,next)=>{
    const {id}=req.params;
    const message=await getSpecificMessage(id,req.user._id);
    return res.status(201).json({message:'done',success:true,data:{message}});
})

router.get('/',isAuthenticate,async(req,res,next)=>{
    const messages=await getAllMessages(req.user._id);
    return res.status(201).json({message:'done',success:true,data:{messages}})
})

export default router;