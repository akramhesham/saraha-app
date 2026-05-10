import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
import { BadRequestException } from "../common/index.js";

export const fileValidation = async (req, res, next) => {
    // get the file path
    const filePath = req.file.path;
    console.log(req.file)
    // read the file and return buffer
    const buffer = fs.readFileSync(filePath);
    // get the file type
    const type = await fileTypeFromBuffer(buffer);
    // validate
    const allowedTypes = ["image/jpeg", "image/png","image/gif"];
    if (!type || !allowedTypes.includes(type.mime)){
      fs.unlinkSync(filePath);  
      throw new BadRequestException("Invalid file type");
    }
    return next();
};