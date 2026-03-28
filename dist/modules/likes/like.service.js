"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const like_model_1 = require("./like.model");
const post_model_1 = __importDefault(require("../post/post.model"));
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_interface_1 = require("../notifications/notifications.interface");
const mongoose_1 = require("mongoose");
const likePost = async (postId, userId) => {
    const post = await post_model_1.default.findById(postId);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    const alreadyLiked = await like_model_1.Like.isLikedByUser(postId, userId);
    if (alreadyLiked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Post already liked');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const like = await like_model_1.Like.create({ postId, userId });
    // Create notification
    if (post.userId.toString() !== userId) { // Do not notify if you like your own post
        await notifications_service_1.NotificationService.createNotification({
            userId: post.userId, // author of the post
            actorId: new mongoose_1.Types.ObjectId(userId),
            type: notifications_interface_1.NotificationType.LIKE,
            entity: {
                postId: post._id,
                likeId: like._id,
            },
            isRead: false,
        });
    }
    return like;
};
const unlikePost = async (postId, userId) => {
    const post = await post_model_1.default.findById(postId);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    const liked = await like_model_1.Like.isLikedByUser(postId, userId);
    if (!liked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not liked yet');
    }
    // @ts-ignore
    await like_model_1.Like.findByIdAndDelete(liked._id);
    return null;
};
const getLikesForPost = async (postId) => {
    const post = await post_model_1.default.findById(postId);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    const result = await like_model_1.Like.find({ postId }).populate('userId');
    return result;
};
exports.LikeService = {
    likePost,
    unlikePost,
    getLikesForPost,
};
