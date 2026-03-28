"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const post_model_1 = __importDefault(require("./post.model"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
require("../users/user.model");
const boost_service_1 = require("../boosts/boost.service");
const mongoose_1 = __importDefault(require("mongoose"));
// Create Post
const createPostService = async (payload, user, files) => {
    payload.userId = user.userId;
    if (files && files.length > 0) {
        const imagesAndVideos = [];
        for (const file of files) {
            const uploadedFile = await (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, file.originalname);
            if (uploadedFile) {
                imagesAndVideos.push({
                    type: file.mimetype.startsWith('image') ? 'image' : 'video',
                    url: uploadedFile.secure_url,
                });
            }
        }
        payload.imagesAndVideos = imagesAndVideos;
    }
    const post = await post_model_1.default.create(payload);
    return post;
};
// Get My Posts
const getMyPostsService = async (user) => {
    const posts = await post_model_1.default.find({ userId: user.userId }).populate('userId', 'fullName email');
    return posts;
};
// Get Posts By User Id
const getPostsByUserIdService = async (userId) => {
    const posts = await post_model_1.default.find({ userId: userId }).populate('userId', 'fullName email');
    return posts;
};
// Get All Posts
const getAllPostsService = async (query, user) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sort = query.sort || '-createdAt';
    const searchTerm = query.searchTerm;
    const pipeline = [];
    // Join with users
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
        },
    });
    // Deconstruct user array
    pipeline.push({
        $unwind: '$user',
    });
    // Text search
    if (searchTerm) {
        pipeline.push({
            $match: {
                $or: [
                    { text: { $regex: searchTerm, $options: 'i' } },
                    { 'user.fullName': { $regex: searchTerm, $options: 'i' } },
                ],
            },
        });
    }
    // Other filters (excluding reserved keywords)
    const excludeField = ['page', 'limit', 'sort', 'fields', 'searchTerm'];
    const filter = {};
    for (const key in query) {
        if (!excludeField.includes(key)) {
            filter[key] = query[key];
        }
    }
    if (Object.keys(filter).length > 0) {
        pipeline.push({ $match: filter });
    }
    // Join with likes to count
    pipeline.push({
        $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            as: 'likes',
        },
    });
    // Join with comments to count
    pipeline.push({
        $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'postId',
            as: 'comments',
        },
    });
    if (user) {
        // Join with user's like
        pipeline.push({
            $lookup: {
                from: 'likes',
                let: { postId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$postId', '$$postId'] },
                                    {
                                        $eq: ['$userId', new mongoose_1.default.Types.ObjectId(user.userId)],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: 'userLike',
            },
        });
        // Add isLiked, likeCount, commentCount fields
        pipeline.push({
            $addFields: {
                isLiked: { $gt: [{ $size: '$userLike' }, 0] },
                likeCount: { $size: '$likes' },
                commentCount: { $size: '$comments' },
            },
        });
    }
    else {
        pipeline.push({
            $addFields: {
                isLiked: false,
                likeCount: { $size: '$likes' },
                commentCount: { $size: '$comments' },
            },
        });
    }
    // Sorting
    const sortStage = {};
    if (sort) {
        const [field, order] = sort.startsWith('-')
            ? [sort.slice(1), -1]
            : [sort, 1];
        sortStage[field] = order;
        pipeline.push({ $sort: sortStage });
    }
    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    // Projection
    pipeline.push({
        $project: {
            userLike: 0,
            likes: 0,
            comments: 0,
            'user.password': 0,
            userId: 0,
        },
    });
    const result = await post_model_1.default.aggregate(pipeline);
    const total = await post_model_1.default.countDocuments(filter);
    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
    // --- Improved Algorithm for Boost Injection ---
    let activeBoosts = await boost_service_1.BoostService.getActiveBoosts();
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    activeBoosts = shuffleArray(activeBoosts);
    const combinedFeed = [];
    const injectionInterval = 1;
    const boostsPerPage = Math.floor(limit / injectionInterval);
    const startBoostIndex = (page - 1) * boostsPerPage;
    const endBoostIndex = startBoostIndex + boostsPerPage;
    const boostsForThisPage = activeBoosts.slice(startBoostIndex, endBoostIndex);
    let boostIndex = 0;
    result.forEach((post, index) => {
        combinedFeed.push({ type: 'post', data: post });
        if ((index + 1) % injectionInterval === 0 &&
            boostIndex < boostsForThisPage.length) {
            combinedFeed.push({ type: 'boost', data: boostsForThisPage[boostIndex] });
            boostIndex++;
        }
    });
    return {
        meta,
        result: combinedFeed,
    };
};
// Get Single Post
const getSinglePostService = async (id, user) => {
    const pipeline = [
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(id),
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
                from: 'likes',
                localField: '_id',
                foreignField: 'postId',
                as: 'likes',
            },
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'postId',
                as: 'comments',
            },
        },
    ];
    if (user) {
        pipeline.push({
            $lookup: {
                from: 'likes',
                let: { postId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$postId', '$$postId'] },
                                    { $eq: ['$userId', new mongoose_1.default.Types.ObjectId(user.userId)] },
                                ],
                            },
                        },
                    },
                ],
                as: 'userLike',
            },
        });
        pipeline.push({
            $addFields: {
                isLiked: { $gt: [{ $size: '$userLike' }, 0] },
                likeCount: { $size: '$likes' },
                commentCount: { $size: '$comments' },
            },
        });
    }
    else {
        pipeline.push({
            $addFields: {
                isLiked: false,
                likeCount: { $size: '$likes' },
                commentCount: { $size: '$comments' },
            },
        });
    }
    pipeline.push({
        $project: {
            userLike: 0,
            likes: 0,
            comments: 0,
            'user.password': 0,
            userId: 0,
        },
    });
    const result = await post_model_1.default.aggregate(pipeline);
    if (result.length === 0) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    return result[0];
};
// Update Post
const updatePostService = async (id, payload, user, files) => {
    const post = await post_model_1.default.findById(id);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.userId.toString() !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to update this post');
    }
    // Update text fields from payload
    if (payload.text) {
        post.text = payload.text;
    }
    if (files && files.length > 0) {
        if (!post.imagesAndVideos) {
            post.imagesAndVideos = [];
        }
        for (const file of files) {
            const uploadedFile = await (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, file.originalname);
            if (uploadedFile) {
                post.imagesAndVideos.push({
                    type: file.mimetype.startsWith('image') ? 'image' : 'video',
                    url: uploadedFile.secure_url,
                });
            }
        }
    }
    const updatedPost = await post.save();
    return updatedPost;
};
// Delete Post
const deletePostService = async (id, user) => {
    const post = await post_model_1.default.findById(id);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.userId.toString() !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete this post');
    }
    // Delete images from Cloudinary before deleting the post
    if (post.imagesAndVideos && post.imagesAndVideos.length > 0) {
        for (const imageUrl of post.imagesAndVideos) {
            await (0, cloudinary_config_1.deleteImageFromCLoudinary)(imageUrl.url);
        }
    }
    await post_model_1.default.findByIdAndDelete(id);
    return null;
};
// delete post media service
const deletePostMediaService = async (postId, mediaUrl, user) => {
    const post = await post_model_1.default.findById(postId);
    if (!post) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.userId.toString() !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete media from this post');
    }
    // Delete image from Cloudinary
    await (0, cloudinary_config_1.deleteImageFromCLoudinary)(mediaUrl);
    // Remove media from post
    const updatedImagesAndVideos = (post.imagesAndVideos || []).filter((media) => decodeURIComponent(media.url) !== mediaUrl);
    const updatedPost = await post_model_1.default.findByIdAndUpdate(postId, { imagesAndVideos: updatedImagesAndVideos }, { new: true, runValidators: true });
    return updatedPost;
};
exports.postServices = {
    createPostService,
    getMyPostsService,
    getAllPostsService,
    getSinglePostService,
    updatePostService,
    deletePostService,
    getPostsByUserIdService,
    deletePostMediaService,
};
