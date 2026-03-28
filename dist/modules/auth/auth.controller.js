"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const passport_1 = __importDefault(require("passport"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importStar(require("http-status-codes"));
const user_tokens_1 = require("../../utils/user.tokens");
const SendResponse_1 = require("../../utils/SendResponse");
const auth_service_1 = require("./auth.service");
const env_1 = __importDefault(require("../../config/env"));
// Login User
const credentialsLogin = (0, CatchAsync_1.CatchAsync)(async (req, res, next) => {
    passport_1.default.authenticate('local', async (err, user, info) => {
        if (err)
            next(err);
        if (!user) {
            return next(new AppError_1.default(http_status_codes_1.default.FORBIDDEN, info.message));
        }
        const userTokens = await (0, user_tokens_1.createUserTokens)(user);
        (0, SendResponse_1.SendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: 'Login success',
            data: userTokens,
        });
    })(req, res, next);
});
// GET NEW ACCESS TOKEN
const getNeAccessToken = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await auth_service_1.authService.getNewAccessTokenService(refreshToken);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'New accessToken generated!',
        data: result,
    });
});
// CHANGE PASSWORD
const changePassword = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    const { oldPassword, newPassword } = req.body;
    const result = await auth_service_1.authService.changePasswordService(userId, {
        oldPassword,
        newPassword,
    });
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password has been changed!',
        data: result,
    });
});
// FORGET PASSWORD
const forgetPassword = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { email } = req.params;
    const result = await auth_service_1.authService.forgetPasswrodService(email);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password reset OTP send to your email!',
        data: result,
    });
});
// RESET PASSWORD
const verifyOTP = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { email, otp } = req.params;
    const result = await auth_service_1.authService.verifyOTPService(email, otp);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'OTP verified success!',
        data: result,
    });
});
// RESET PASSWORD
const resetPassword = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from
    const { newPassword } = req.body;
    const result = await auth_service_1.authService.resetPasswordService(token, newPassword);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password reset success!',
        data: result,
    });
});
// GOOGLE LOGIN HANDLING
const googleLogin = (0, CatchAsync_1.CatchAsync)(async (req, res, next) => {
    passport_1.default.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'consent select_account',
    })(req, res, next);
});
const googleCallback = (0, CatchAsync_1.CatchAsync)(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    const { refreshToken, accessToken } = await (0, user_tokens_1.createUserTokens)(user);
    res.redirect(`${env_1.default.FRONTEND_URL}?refresh=${refreshToken}&access=${accessToken}`);
});
const appleLogin = (0, CatchAsync_1.CatchAsync)(async (req, res, next) => {
    passport_1.default.authenticate('apple', {
        scope: ['name', 'email'],
    })(req, res, next);
});
const appleCallback = (0, CatchAsync_1.CatchAsync)(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    const { refreshToken, accessToken } = await (0, user_tokens_1.createUserTokens)(user);
    res.redirect(`${env_1.default.FRONTEND_URL}?refresh=${refreshToken}&access=${accessToken}`);
});
// GOOGLE TOKEN LOGIN
const googleTokenLogin = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Google token is required');
    }
    const result = await auth_service_1.authService.googleTokenLoginService(token);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Login success!',
        data: result,
    });
});
exports.authController = {
    credentialsLogin,
    getNeAccessToken,
    changePassword,
    forgetPassword,
    verifyOTP,
    resetPassword,
    googleCallback,
    googleLogin,
    appleLogin,
    appleCallback,
    googleTokenLogin,
};
