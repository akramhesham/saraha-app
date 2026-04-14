import express from 'express';
import { connectDB } from './DB/connection.js';
import { authRouter, userRouter } from './modules/index.js';

const app = express();
const port = 3000;
connectDB();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/user',userRouter);
app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({ message: error.message, success: false });
})
app.listen(port, () => {
    console.log("app is running on port", port);
})