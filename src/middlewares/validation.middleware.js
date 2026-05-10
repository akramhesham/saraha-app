import { BadRequestException, SYS_GEND, SYS_ROLE } from "../common/index.js";
import joi from "joi";

export const isValid = (schema) => {
    return (req, res, next) => {
        const validateResult = schema.validate(req.body, { abortEarly: false })
        if (validateResult.error) {
            let errorMessage = validateResult.error.details.map((err) => {
                return { message: err.message, path: err.path[0] }
            });
            throw new BadRequestException("validation error", { errorMessage })
        }
        next();
    }
}

export const generalVariables={
        userName:joi.string().min(2).max(20).trim().required().messages({
            "any.required":"userName is required"
        }),
        email:joi.string().when("phoneNumber",{
            is:joi.exist(),
            then:joi.optional(),
            otherwise:joi.required()
        }).pattern(/^\w{1,100}@(gmail|yahoo|hotmail|icloud){1}(.com|.org|.eg|.edu|.su){1,3}$/).messages({
            "string.pattern.base":"email must be valid mail"
        }),
        phoneNumber:joi.string().pattern(/(\+020|01|002)[0-25]{1}[0-9]{8}$/).messages({
            "string.pattern.base":"phoneNumber must be egypt form"
        }),
        gender:joi.number().valid(...Object.values(SYS_GEND)).default(0),
        role:joi.number().valid(...Object.values(SYS_ROLE)).default(0),
        password:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
            "string.pattern.base":
            "password must contain at least 8 characters having at least one uppercase and one lowercase and number and special character"
        }),
        rePassword:joi.string().valid(joi.ref("password")).required().messages({
            "any.only":"rePassword must be same as password"
        })
}