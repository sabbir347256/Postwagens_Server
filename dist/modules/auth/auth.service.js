"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const jwt_1 = require("../../utils/jwt");
const env_1 = __importDefault(require("../../config/env"));
const user_model_1 = __importDefault(require("../users/user.model"));
const user_interface_1 = require("../users/user.interface");
const user_tokens_1 = require("../../utils/user.tokens");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendMail_1 = require("../../utils/sendMail");
const randomOTPGenerator_1 = require("../../utils/randomOTPGenerator");
const redis_config_1 = require("../../config/redis.config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(env_1.default.GOOGLE_OAUTH_ID);
// GET NEW ACCESS TOKEN
const getNewAccessTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Refresh token needed!');
    }
    const tokenVerify = (0, jwt_1.verifyToken)(refreshToken, env_1.default.JWT_REFRESH_SECRET); // VERIFY TOKEN
    const isUserExists = await user_model_1.default.findById(tokenVerify.userId); // FIND USER BY ID
    if (!isUserExists) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User Doesn't Exist");
    }
    if (isUserExists.isActive === user_interface_1.IsActive.BLOCKED ||
        isUserExists.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The User "blocked" or "inactive"');
    }
    if (isUserExists.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The user was "deleted"');
    }
    const jwtPayload = {
        _id: isUserExists?._id,
        email: isUserExists?.email,
        role: isUserExists?.role,
    };
    const userToken = await (0, user_tokens_1.createUserTokens)(jwtPayload); // Jsonwebtoken
    return {
        newAccessToken: userToken.accessToken,
        newRefreshToken: userToken.refreshToken,
    };
};
// CHANGE PASSWORD
const changePasswordService = async (userId, payload) => {
    const user = await user_model_1.default.findById(userId).select('+password');
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    if (!payload.oldPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide your old password!');
    }
    if (!payload.newPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide your new password!');
    }
    const matchPassword = await bcrypt_1.default.compare(payload.oldPassword, user.password);
    if (!matchPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password doesn't matched!");
    }
    user.password = payload.newPassword;
    await user.save();
    return null;
};
// FORGET PASSWORD
const forgetPasswrodService = async (email) => {
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User was deleted!');
    }
    if (user.isActive === user_interface_1.IsActive.INACTIVE ||
        user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `User is ${user.isActive}`);
    }
    const otp = (0, randomOTPGenerator_1.randomOTPGenerator)(100000, 999999).toString(); // Generate OTP
    const hashedOTP = await bcrypt_1.default.hash(otp, Number(env_1.default.BCRYPT_SALT_ROUND)); // Hashed OTP
    // CACHED OTP TO REDIS
    await redis_config_1.redisClient.set(`otp:${user.email}`, hashedOTP, { EX: 120 }); // 2 min
    // SENDING OTP TO EMAIL
    await (0, sendMail_1.sendEmail)({
        to: user.email,
        subject: 'LinkUp:Password Reset OTP',
        templateName: 'resetPassword',
        templateData: {
            name: user.fullName,
            otp,
        },
    });
    return null;
};
// VERIFY RESET PASSWORD OTP
const verifyOTPService = async (email, otp) => {
    if (!email) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email required!');
    }
    // CHECK USER
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No user found!');
    }
    if (!otp || otp.length < 6) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Wrong OTP!');
    }
    // OTP MATCHING PART
    const getOTP = await redis_config_1.redisClient.get(`otp:${email}`);
    if (!getOTP) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP has expired!');
    }
    const isOTPMatched = await bcrypt_1.default.compare(otp, getOTP); // COMPARE WITH OTP
    if (!isOTPMatched) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP is not matched!');
    }
    const jwtPayload = { email, verified: true };
    const jwtToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.default.OTP_JWT_ACCESS_SECRET, {
        expiresIn: env_1.default.OTP_JWT_ACCESS_EXPIRATION,
    });
    // DELETED OTP AFTER USED
    await redis_config_1.redisClient.del(`otp:${email}`);
    return jwtToken;
};
// RESET PASSWORD
const resetPasswordService = async (token, newPassword) => {
    if (!token) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token must required!');
    }
    const verifyToken = jsonwebtoken_1.default.verify(token, env_1.default.OTP_JWT_ACCESS_SECRET);
    if (!verifyToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid token or expired!');
    }
    if (!verifyToken?.verified) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "OTP wasn't verfied yet");
    }
    // CHECK USER
    const user = await user_model_1.default.findOne({ email: verifyToken?.email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No user found!');
    }
    // SET NEW PASSWORD
    user.password = newPassword;
    await user.save();
    return null;
};
const googleTokenLoginService = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: env_1.default.GOOGLE_OAUTH_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Google token');
    }
    const { email, name, picture } = payload;
    console.log('Google token payload:', payload);
    if (!email) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email not found in Google token');
    }
    let user = await user_model_1.default.findOne({ email });
    if (user) {
        if (user.isActive === user_interface_1.IsActive.BLOCKED || user.isActive === user_interface_1.IsActive.INACTIVE) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `User is ${user.isActive}`);
        }
    }
    else {
        user = await user_model_1.default.create({
            email,
            fullName: name,
            // @ts-ignore
            profileImage: picture,
            isVerified: true, // Users from Google are considered verified
            auth: {
                provider: 'google',
                providerId: payload.sub,
            }
        });
    }
    const userTokens = await (0, user_tokens_1.createUserTokens)(user);
    return {
        user,
        ...userTokens,
    };
};
exports.authService = {
    getNewAccessTokenService,
    changePasswordService,
    forgetPasswrodService,
    verifyOTPService,
    resetPasswordService,
    googleTokenLoginService,
};
