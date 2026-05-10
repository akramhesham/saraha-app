import express from 'express';
import { connectDB } from './DB/connection.js';
import { authRouter, messageRouter, userRouter } from './modules/index.js';
import cors from 'cors';
import { redisConnect } from './DB/redis.js';
import helmet from 'helmet';

const app = express();
const port = 3000;
redisConnect();
connectDB();
app.use(cors('*'));
app.use("/uploads",express.static("uploads"));
app.use(helmet());
app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({
         message: error.message,
         stack:error.stack,
         details:error.details?.length==0?undefined:error.details,
         success: false });
})
app.use(express.json());
app.use('/auth', authRouter);
app.use('/user',userRouter);
app.use('/message',messageRouter);
app.use('/',(req,res,next)=>{
    res.send('done')
})
app.listen(port, () => {
    console.log("app is running on port", port);
})