"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jwt_1 = require("../utils/jwt");
const user_interface_1 = require("../modules/users/user.interface");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = __importDefault(require("../config/env"));
const user_model_1 = __importDefault(require("../modules/users/user.model"));
const checkAuth = (...restRole) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; // GET TOKEN
        const accessToken = authHeader.split(' ')[1];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, 'Token not provided!');
        }
        if (!accessToken) {
            throw new AppError_1.default(401, 'Unauthorized! token must required.');
        }
        // VERIFY ACCESS TOKEN
        const verifyUser = (0, jwt_1.verifyToken)(accessToken, env_1.default.JWT_ACCESS_SECRET);
        // CHECK Verified
        if (!verifyUser) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, 'Invalid token!');
        }
        const isUser = await user_model_1.default.findById(verifyUser?.userId); // IS USER EXISTS
        if (!isUser) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, 'No user found!');
        }
        if (isUser.isActive === user_interface_1.IsActive.INACTIVE ||
            isUser.isActive === user_interface_1.IsActive.BLOCKED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'User is Blocked or Inactive!');
        }
        if (isUser.isDeleted) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'The user was deleted!');
        }
        if (restRole.length && !restRole.includes(verifyUser.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'You are not permitted to access this route!');
        }
        // @ts-ignore
        req.user = verifyUser; // Set an global type for this line see on: interface > intex.d.ts
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAuth = checkAuth;
