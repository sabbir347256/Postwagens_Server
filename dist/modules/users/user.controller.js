"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const SendResponse_1 = require("../../utils/SendResponse");
const user_service_1 = require("./user.service");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const user_interface_1 = require("./user.interface");
const user_model_1 = __importDefault(require("./user.model"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
// REGISTER ACCOUNT
const registerUser = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await user_service_1.userServices.createUserService(req.body);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Users created successful!',
        data: result,
    });
});
// GET ME
const getMe = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    const result = await user_service_1.userServices.getMeService(userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'User fetched successful!',
        data: result,
    });
});
// GET ME
const getAllUser = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const query = req.query;
    const { userId } = req.user;
    const result = await user_service_1.userServices.getAllUserService(query, userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Users fetched successful!',
        data: result,
    });
});
// Get Profile
const getProfile = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    const loggedInUser = req.user;
    const result = await user_service_1.userServices.getProfileService(userId, loggedInUser?.userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Profile fetched successful!',
        data: result,
    });
});
// USER UPDATE
const userUpdate = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const body = req.body;
    const decodedToken = req.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = {
        ...body,
    };
    if (req.file) {
        const avatar = await (0, cloudinary_config_1.uploadBufferToCloudinary)(req.file.buffer, req.file.originalname);
        payload.avatar = avatar?.secure_url;
    }
    const result = await user_service_1.userServices.userUpdateService(decodedToken.userId, payload, decodedToken);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'User updated successful!',
        data: result,
    });
});
// USER UPDATE
const userDelete = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const userId = req.params.userId;
    const decodedToken = req.user;
    const result = await user_service_1.userServices.userDeleteService(userId, decodedToken);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'User deleted successful!',
        data: result,
    });
});
// VERIFY USER
const userVefification = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const user = req.user;
    const result = await user_service_1.userServices.verifyUserService(user.userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'OTP has been sent!',
        data: result,
    });
});
// RESEND OTP
const verifyOTP = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { phoneNumber, otp } = req.body;
    await user_service_1.userServices.verifyOTPService(phoneNumber, otp);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Your are verified!',
        data: null,
    });
});
const purchaseBadge = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    const result = await user_service_1.userServices.purchaseBadgeService(userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Badge purchased successfully!',
        data: result,
    });
});
const updateSuspendStatus = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    const decodedToken = req.user;
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    const newIsActiveStatus = user.isActive === user_interface_1.IsActive.ACTIVE ? user_interface_1.IsActive.BLOCKED : user_interface_1.IsActive.ACTIVE;
    // @ts-ignore
    const result = await user_service_1.userServices.updateSuspendStatusService(userId, newIsActiveStatus, decodedToken);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'User suspended successfully!',
        data: result,
    });
});
// EXPORT ALL CONTROLLERS
exports.userControllers = {
    registerUser,
    userVefification,
    verifyOTP,
    getMe,
    userUpdate,
    userDelete,
    getAllUser,
    purchaseBadge,
    updateSuspendStatus,
    getProfile,
};
