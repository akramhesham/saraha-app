import multer, { diskStorage } from "multer";
import fs from 'node:fs';
import { BadRequestException } from "./error.utils.js";

export const fileUpload = (allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg", "image/jfif"]) => {
    return multer({
        fileFilter: (req, file, cb) => {
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new BadRequestException("invalid file format"), false);
            } else {
                cb(null, true);
            }
        },
        limits: { fileSize: 500000 }
        , storage: diskStorage({
            destination: (req, file, cb) => {
                const folder = req.user ?
                    `uploads/${req.user._id}`
                    : `uploads/${req.params.receiverId}/message`;
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder, { recursive: true });
                }
                cb(null, folder);
            },
            filename: (req, file, cb) => {
                console.log(file);
                cb(null, Date.now() + Math.random() + '--' + file.originalname);
            }
        })
    });
};