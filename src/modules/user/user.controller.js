import { Router } from "express";
import { decryption } from "../../common/utils/encryption.utils.js";
import { isAuthenticate } from "../../middlewares/authentication.middleware.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { fileValidation } from "../../middlewares/file-validation.middleware.js";
import { uploadProfilePicture } from "./user.service.js";
import rateLimit from "express-rate-limit";

const router = Router();

const limit=rateLimit({
    windowMs:1*60*60*1000,
    limit:40
});

router.use(limit);

router.get('/', isAuthenticate, async (req, res, next) => {
    const { user } = req;
    if (user.phoneNumber) {
        user.phoneNumber = decryption(user.phoneNumber);
    }
    return res.status(200).json({ message: 'done', success: true, data: { user } });
})

router.patch('/upload-profile-picture', 
    isAuthenticate, 
    fileUpload().single('pp'), 
    fileValidation, 
    async(req, res, next) => {
      const updatedData= await uploadProfilePicture(req.user,req.file);
    return res.json({ message: 'done uploaded',success:true,data:{updatedData} })
})

export default router;