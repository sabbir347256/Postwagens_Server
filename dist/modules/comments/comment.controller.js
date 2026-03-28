"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const CatchAsync_1 = require("../../utils/CatchAsync");
const comment_service_1 = require("./comment.service");
const SendResponse_1 = require("../../utils/SendResponse");
const createComment = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    const { text, parentId } = req.body;
    const payload = {
        postId: id,
        userId,
        text,
        parentId: parentId || null,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await comment_service_1.CommentService.createComment(payload);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Comment created successfully',
        data: result,
    });
});
const getCommentsForPost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await comment_service_1.CommentService.getCommentsForPost(id, req.query);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comments for the post retrieved successfully',
        data: result.result,
    });
});
const updateComment = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { commentId } = req.params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    const result = await comment_service_1.CommentService.updateComment(
    // @ts-ignore
    commentId, userId, req.body);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comment updated successfully',
        data: result,
    });
});
const deleteComment = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { commentId } = req.params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    // @ts-ignore
    await comment_service_1.CommentService.deleteComment(commentId, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: null,
    });
});
const getCommentReplies = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { commentId } = req.params;
    const result = await comment_service_1.CommentService.getCommentReplies(commentId, req.query);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Replies for the comment retrieved successfully',
        data: result.result,
    });
});
exports.CommentController = {
    createComment,
    getCommentsForPost,
    getCommentReplies,
    updateComment,
    deleteComment,
};
