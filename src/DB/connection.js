import mongoose from "mongoose";
import { DB_URL } from "../config/env.config.js";

export function connectDB(){
    mongoose.connect(DB_URL).then(()=>{
        console.log('Db connected successfully');
    }).catch((err)=>{
        console.log('fail connecting to DB because',err);
    })
}