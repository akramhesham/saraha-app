import { Router } from "express";
import { SYS_MESSAGE } from "../../common/index.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { login, loginWithGoole, logout, logOutAllDevices, refreshTokenService, sendOTP, signUp, verifyAccount } from "./auth.service.js";
import { isAuthenticate } from "../../middlewares/authentication.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();

const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 4
});

router.use(limit);

router.post('/signup', fileUpload().none(), isValid(signupSchema), async (req, res, next) => {
    const createdUser = await signUp(req.body);
    return res.status(201).json({ message: SYS_MESSAGE.user.created, success: true, data: { createdUser } })
})

router.post('/login', fileUpload().none(), isValid(loginSchema), async (req, res, next) => {
    const { accessToken, refreshToken } = await login(req.body);
    return res.status(201).json({ message: SYS_MESSAGE.user.login, success: true, data: { accessToken, refreshToken } })
})

router.get('/refresh-token', async (req, res, next) => {
    const { authorization } = req.headers;
    const { accessToken, refreshToken } = await refreshTokenService(authorization);
    return res.status(200).json({ message: 'refresh token successfully', success: true, data: { accessToken, refreshToken } })
})

router.patch('/verify-account', async (req, res, next) => {
    await verifyAccount(req.body);
    return res.status(200).json({ message: 'Email is verififed', success: true });
})

router.post('/send-otp', async (req, res, next) => {
    await sendOTP(req.body);
    return res.status(200).json({ message: 'otp is sent successfully to your mail', success: true });
})

router.patch('/logout-from-all-devices', isAuthenticate, async (req, res, next) => {
    await logOutAllDevices(req.user);
    return res.status(200).json({ message: 'logout from all devices', success: true })
})

router.post('/logout', isAuthenticate, async (req, res, next) => {
    await logout(req.payload, req.user);
    return res.status(200).json({ message: 'logout successfully', success: true });
})

router.post('/signup-with-google', async (req, res, next) => {
    const { idToken } = req.body;
    const { accessToken, refreshToken } = await loginWithGoole(idToken);
    return res.status(200).json({ message: 'login successfully', success: true, data: { accessToken, refreshToken } })
})

export default router;