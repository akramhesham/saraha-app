import { OAuth2Client } from "google-auth-library";
import { BadRequestException, compare, ConflictException, generateTokens, hash, SYS_MESSAGE, SYS_ROLE, Unauthorized, verifyToken } from "../../common/index.js";
import { sendMail } from "../../common/utils/email.utils.js";
import { encryption } from "../../common/utils/encryption.utils.js";
import { userRepository } from "../../DB/index.js";
import { checkUserExist, createUser } from "../user/user.service.js";
import { redisClient } from "../../DB/redis.js";

export const sendOTP = async (body) => {
    const { email } = body;
    const otpDoc = await redisClient.exists(`${email}:otp`);
    if (otpDoc) {
        throw new BadRequestException('cannot send OTP, you still have a valid one')
    } else {
        const otp = Math.floor(100000 + Math.random() * 900000);
        await redisClient.set(`${email}:otp`, otp, { EX: 2 * 60 });
        await sendMail({
            to: email,
            subject: 'verify your otp',
            html: `<p>your otp is ${otp}</p>`
        });
    }
}

export const signUp = async (body) => {
    const { email, phoneNumber } = body;
    const userCheck = await checkUserExist({
        $or: [{
            email: { $eq: email, $exists: true, $ne: null }
        }, {
            phoneNumber: { $eq: phoneNumber, $exists: true, $ne: null }
        }]
    })
    if (userCheck) {
        throw new ConflictException(SYS_MESSAGE.user.alreadyExist);
    }

    body.role = SYS_ROLE.user;
    body.password = await hash(body.password);
    if (body.phoneNumber) {
        body.phoneNumber = encryption(body.phoneNumber);
    }
    await sendOTP(body);
    await redisClient.set(email, JSON.stringify(body), { EX: 2 * 24 * 60 * 60 });
}

export const login = async (body) => {
    const { email, password } = body;
    const userExist = await checkUserExist({ email: { $eq: email, $exists: true, $ne: null } });
    const match = await compare(password, userExist?.password || 'dfsfsdfdsfdsfdsfsd');
    if (!userExist) {
        throw new BadRequestException("invalid credentials");
    }
    if (!match) {
        throw new BadRequestException("invalid credentials");
    }
    const { accessToken, refreshToken } = generateTokens({ sub: userExist._id, role: userExist.role });
    const refreshPayload=await verifyToken(refreshToken,'vcxvfddfgdbvfdfdgbfdbfdfbvfd');
    await redisClient.set(`refreshToken:${refreshPayload.jti}`,refreshToken,{
        EX:60*60*24*365
    })
    const userData = JSON.parse(JSON.stringify(userExist));
    delete userData.password;
    return { accessToken, refreshToken };
}

export const verifyAccount = async (body) => {
    const { otp, email } = body;
    const otpDoc = await redisClient.get(`${email}:otp`)
    if (!otpDoc) {
        throw new BadRequestException('expired otp');
    };
    if (otp != otpDoc) {
        throw new BadRequestException('invalid otp');
    };
    let data = await redisClient.get(email);
    data = JSON.parse(data);
    await userRepository.create(data);
    await redisClient.del(email);
    await redisClient.del(`${email}:otp`)
    return true;
}

export const logOutAllDevices = async (user) => {
    await userRepository.update(
        { _id: user._id },
        { credentialsUpdatedAt: Date.now() })
    return true;
}

export const logout = async (tokenPayload, user) => {
    await redisClient.set(`bl_${tokenPayload.jti}`, tokenPayload.jti, {
        EX: Math.floor(
            (new Date(tokenPayload.exp * 1000).getTime() - Date.now()) / 1000
        )
    })
}

export const googleVerifyAccount = async (idToken) => {
    const client = new OAuth2Client("1050567519710-fvn7o0bu0kmuqlpqqjtcepmistr1gaug.apps.googleusercontent.com");
    const ticket = await client.verifyIdToken({ idToken });
    return ticket.getPayload();
}

export const loginWithGoole = async (idToken) => {
    const payload = await googleVerifyAccount(idToken);
    if (payload.email_verified == false) {
        throw new BadRequestException('refused from google')
    } else {
        const userExist = userRepository.getOne({ email: payload.email });
        if (!userExist) {
            const createdUser = await userRepository.create({
                email: payload.email,
                profilePicture: payload.picture,
                userName: payload.name,
                isEmailVerified: true,
                provider: 'google'
            })
            return generateTokens({
                sub: createdUser._id,
                role: createdUser.role,
                provider: createdUser.provider
            })
        } else {
            return generateTokens({
                sub: userExist._id,
                role: userExist.role,
                provider: userExist.provider
            })
        }
    }
}

export const refreshTokenService = async(authorization) => {
    const payload = verifyToken(authorization, 'vcxvfddfgdbvfdfdgbfdbfdfbvfd');
    const cashedRefreshToken=await redisClient.get(`refreshToken:${payload.jti}`);
    if(cashedRefreshToken!=authorization){
        await logOutAllDevices({_id:payload.sub})
        await redisClient.del(`refreshToken:${payload.sub}`)
        throw new Unauthorized("you are not authorized to login");
    }
    delete payload.iat;
    delete payload.exp;
    const { accessToken, refreshToken } = generateTokens(payload);
    await redisClient.set(`refreshToken:${payload.sub}`,refreshToken)
    return { accessToken, refreshToken };
}