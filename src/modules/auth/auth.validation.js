import joi from "joi";
import { generalVariables } from "../../middlewares/validation.middleware.js";

export const signupSchema=joi.object({
    userName:generalVariables.userName,
    email:generalVariables.email,
    phoneNumber:generalVariables.phoneNumber,
    gender:generalVariables.gender,
    role:generalVariables.role,
    password:generalVariables.password,
    rePassword:generalVariables.rePassword
}).required();

export const loginSchema=joi.object({
    email:generalVariables.email,
    password:generalVariables.password
}).required();