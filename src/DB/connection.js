import mongoose from "mongoose";

export function connectDB(){
    mongoose.connect("mongodb://127.0.0.1:27017/sarapa-app").then(()=>{
        console.log('Db connected successfully');
    }).catch((err)=>{
        console.log('fail connecting to DB because',err);
    })
}