"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowController = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const follow_service_1 = require("./follow.service");
const SendResponse_1 = require("../../utils/SendResponse");
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const toggleFollow = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    // @ts-ignore
    const followerId = req.user?.userId;
    if (userId === followerId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You cannot follow/unfollow yourself');
    }
    const result = await follow_service_1.FollowService.toggleFollow(followerId, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.following ? 'User followed successfully' : 'User unfollowed successfully',
        data: result,
    });
});
const getFollowers = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    const result = await follow_service_1.FollowService.getFollowers(userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Followers retrieved successfully',
        data: result,
    });
});
const getFollowing = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    const result = await follow_service_1.FollowService.getFollowing(userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Following retrieved successfully',
        data: result,
    });
});
exports.FollowController = {
    toggleFollow,
    getFollowers,
    getFollowing,
};
