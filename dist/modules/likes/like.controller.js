"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeController = void 0;
const http_status_codes_1 = require("http-status-codes");
const CatchAsync_1 = require("../../utils/CatchAsync");
const like_service_1 = require("./like.service");
const SendResponse_1 = require("../../utils/SendResponse");
const likePost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId; // Assuming user is available in the request
    const result = await like_service_1.LikeService.likePost(id, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Post liked successfully',
        data: result,
    });
});
const unlikePost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId; // Assuming user is available in the request
    await like_service_1.LikeService.unlikePost(id, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post unliked successfully',
        data: null,
    });
});
const getLikesForPost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await like_service_1.LikeService.getLikesForPost(id);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Likes for the post retrieved successfully',
        data: result,
    });
});
exports.LikeController = {
    likePost,
    unlikePost,
    getLikesForPost,
};
