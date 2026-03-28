"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const post_model_1 = __importDefault(require("../post/post.model"));
const comment_model_1 = require("./comment.model");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_interface_1 = require("../notifications/notifications.interface");
const mongoose_1 = require("mongoose");
const createComment = async (payload) => {
    const post = await post_model_1.default.findById(payload.postId);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (payload.parentId) {
        const parentComment = await comment_model_1.Comment.findById(payload.parentId);
        if (!parentComment) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parent comment not found');
        }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const comment = await comment_model_1.Comment.create(payload);
    // Create notification for the post author
    if (post.userId.toString() !== payload.userId.toString()) {
        await notifications_service_1.NotificationService.createNotification({
            userId: post.userId,
            actorId: new mongoose_1.Types.ObjectId(payload.userId),
            type: notifications_interface_1.NotificationType.COMMENT,
            entity: {
                postId: post._id,
                commentId: comment._id,
            },
            isRead: false,
        });
    }
    // Create notification for the parent comment author
    if (payload.parentId) {
        const parentComment = await comment_model_1.Comment.findById(payload.parentId);
        if (parentComment && parentComment.userId.toString() !== payload.userId.toString()) {
            await notifications_service_1.NotificationService.createNotification({
                userId: parentComment.userId,
                actorId: new mongoose_1.Types.ObjectId(payload.userId),
                type: notifications_interface_1.NotificationType.COMMENT, // Or a new type like 'reply'
                entity: {
                    postId: post._id,
                    commentId: comment._id,
                },
                isRead: false,
            });
        }
    }
    return comment;
};
const getCommentsForPost = async (postId, query) => {
    const post = await post_model_1.default.findById(postId);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sort = query.sort || '-createdAt';
    const pipeline = [
        {
            $match: {
                postId: new mongoose_1.Types.ObjectId(postId),
                parentId: null,
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: '$user',
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'parentId',
                as: 'replies',
            },
        },
        {
            $addFields: {
                replyCount: { $size: '$replies' },
            },
        },
        {
            $project: {
                replies: 0,
                'user.password': 0,
            },
        },
    ];
    const sortStage = {};
    if (sort) {
        const [field, order] = sort.startsWith('-')
            ? [sort.slice(1), -1]
            : [sort, 1];
        sortStage[field] = order;
        pipeline.push({ $sort: sortStage });
    }
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    const result = await comment_model_1.Comment.aggregate(pipeline);
    const total = await comment_model_1.Comment.countDocuments({
        postId,
        parentId: null,
    });
    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
    return {
        meta,
        result,
    };
};
const updateComment = async (commentId, userId, payload) => {
    const comment = await comment_model_1.Comment.findById(commentId);
    if (!comment) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found');
    }
    if (comment.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to update this comment');
    }
    const result = await comment_model_1.Comment.findByIdAndUpdate(commentId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};
const deleteComment = async (commentId, userId) => {
    const comment = await comment_model_1.Comment.findById(commentId);
    if (!comment) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found');
    }
    if (comment.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete this comment');
    }
    await comment_model_1.Comment.findByIdAndDelete(commentId);
    return null;
};
const getCommentReplies = async (commentId, query) => {
    const parentComment = await comment_model_1.Comment.findById(commentId);
    if (!parentComment) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parent comment not found');
    }
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sort = query.sort || '-createdAt';
    const pipeline = [
        {
            $match: {
                parentId: new mongoose_1.Types.ObjectId(commentId),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: '$user',
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'parentId',
                as: 'replies',
            },
        },
        {
            $addFields: {
                replyCount: { $size: '$replies' },
            },
        },
        {
            $project: {
                replies: 0,
                'user.password': 0,
            },
        },
    ];
    const sortStage = {};
    if (sort) {
        const [field, order] = sort.startsWith('-')
            ? [sort.slice(1), -1]
            : [sort, 1];
        sortStage[field] = order;
        pipeline.push({ $sort: sortStage });
    }
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    const result = await comment_model_1.Comment.aggregate(pipeline);
    const total = await comment_model_1.Comment.countDocuments({
        parentId: commentId,
    });
    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
    return {
        meta,
        result,
    };
};
exports.CommentService = {
    createComment,
    getCommentsForPost,
    getCommentReplies,
    updateComment,
    deleteComment,
};
