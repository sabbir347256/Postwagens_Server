"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postControllers = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const SendResponse_1 = require("../../utils/SendResponse");
const post_service_1 = require("./post.service");
const http_status_codes_1 = require("http-status-codes");
// Create Post
const createPost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await post_service_1.postServices.createPostService(req.body, req.user, req.files);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Post created successfully!',
        data: result,
    });
});
// Get My Posts
const getMyPosts = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await post_service_1.postServices.getMyPostsService(req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'My posts fetched successfully!',
        data: result,
    });
});
// Get All Posts
const getAllPosts = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const sanitizedQuery = {};
    for (const key in req.query) {
        const value = req.query[key];
        if (typeof value === 'string') {
            sanitizedQuery[key] = value;
        }
        else if (Array.isArray(value)) {
            sanitizedQuery[key] = value.join(',');
        }
    }
    const { meta, result } = await post_service_1.postServices.getAllPostsService(sanitizedQuery, req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Posts fetched successfully!',
        meta,
        data: result,
    });
});
// Get Single Post
const getSinglePost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await post_service_1.postServices.getSinglePostService(id, user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Post fetched successfully!',
        data: result,
    });
});
// Update Post
const updatePost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await post_service_1.postServices.updatePostService(id, req.body, req.user, req.files);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Post updated successfully!',
        data: result,
    });
});
// Get Posts By User Id
const getPostsByUserId = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    const result = await post_service_1.postServices.getPostsByUserIdService(userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Posts fetched successfully!',
        data: result,
    });
});
// Delete Post
const deletePost = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    await post_service_1.postServices.deletePostService(id, req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Post deleted successfully!',
        data: null,
    });
});
// Delete Post Media
const deletePostMedia = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { postId, mediaUrl } = req.query;
    const result = await post_service_1.postServices.deletePostMediaService(postId, mediaUrl, req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Post media deleted successfully!',
        data: result,
    });
});
exports.postControllers = {
    createPost,
    getMyPosts,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    getPostsByUserId,
    deletePostMedia,
};
