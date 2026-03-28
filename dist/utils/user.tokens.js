"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserTokens = void 0;
const env_1 = __importDefault(require("../config/env"));
const jwt_1 = require("./jwt");
const createUserTokens = async (user) => {
    const jwtPayload = {
        userId: user?._id,
        email: user?.email,
        role: user?.role,
        isVerified: user?.isVerified,
    };
    // Jsonwebtoken
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.default?.JWT_ACCESS_SECRET, env_1.default?.JWT_ACCESS_EXPIRATION);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, env_1.default?.JWT_REFRESH_SECRET, // ! is used to assert that the value is not undefined or null
    env_1.default?.JWT_REFRESH_EXPIRATION);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createUserTokens = createUserTokens;
