"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const env_1 = __importDefault(require("./env"));
exports.redisClient = (0, redis_1.createClient)({
    username: env_1.default.REDIS_USERNAME,
    password: env_1.default.REDIS_PASSWORD,
    socket: {
        host: env_1.default.REDIS_HOST,
        port: Number(env_1.default.REDIS_PORT),
    },
});
exports.redisClient.on('error', (error) => console.log('Redis client error', error));
const connectRedis = async () => {
    if (!exports.redisClient.isOpen) {
        await exports.redisClient.connect();
        console.log('Redis connected');
    }
};
exports.connectRedis = connectRedis;
