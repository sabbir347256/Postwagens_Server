"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const listing_model_1 = __importDefault(require("./listing.model"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const mongoose_1 = __importDefault(require("mongoose"));
const follow_model_1 = require("../follow/follow.model");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_interface_1 = require("../notifications/notifications.interface");
// Create Listing
const createListingService = async (payload, user, files) => {
    payload.sellerId = user.userId;
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
    const listing = await listing_model_1.default.create(payload);
    const followers = await follow_model_1.Follow.find({ following: user.userId });
    for (const follow of followers) {
        await notifications_service_1.NotificationService.createNotification({
            userId: follow.follower,
            actorId: user.userId,
            type: notifications_interface_1.NotificationType.LISTING,
            entity: {
                listingId: listing._id,
            },
            isRead: false,
        });
    }
    return listing;
};
// Get My Listings
const getMyListingsService = async (user) => {
    const listings = await listing_model_1.default.find({ sellerId: user.userId }).populate({
        path: 'seller',
        select: 'fullName email avatar',
    });
    return listings;
};
// Get Listings By User Id
const getListingsByUserIdService = async (userId) => {
    const listings = await listing_model_1.default.find({ sellerId: userId }).populate({
        path: 'seller',
        select: 'fullName email avatar',
    });
    return listings;
};
// Get All Listings
const getAllListingsService = async (query, user) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sort = query.sort || '-createdAt';
    const searchTerm = query.searchTerm;
    const pipeline = [];
    // Text search
    if (searchTerm) {
        pipeline.push({
            $match: {
                $text: { $search: searchTerm },
            },
        });
    }
    // Other filters
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
    // Join with users
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller',
        },
    });
    pipeline.push({
        $unwind: '$seller',
    });
    if (user) {
        // Join with bookmarks
        pipeline.push({
            $lookup: {
                from: 'bookmarks',
                let: { listingId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$listingId', '$$listingId'] },
                                    {
                                        $eq: [
                                            '$userId',
                                            new mongoose_1.default.Types.ObjectId(user.userId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: 'userBookmark',
            },
        });
        // Add isBookmarked field
        pipeline.push({
            $addFields: {
                isBookmarked: { $gt: [{ $size: '$userBookmark' }, 0] },
            },
        });
    }
    else {
        pipeline.push({
            $addFields: {
                isBookmarked: false,
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
            userBookmark: 0,
            'seller.password': 0,
        },
    });
    const result = await listing_model_1.default.aggregate(pipeline);
    const total = await listing_model_1.default.countDocuments(filter);
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
// Get Single Listing
const getSingleListingService = async (id, user) => {
    const pipeline = [
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'sellerId',
                foreignField: '_id',
                as: 'seller',
            },
        },
        {
            $unwind: '$seller',
        },
    ];
    if (user) {
        pipeline.push({
            $lookup: {
                from: 'bookmarks',
                let: { listingId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$listingId', '$$listingId'] },
                                    {
                                        $eq: [
                                            '$userId',
                                            new mongoose_1.default.Types.ObjectId(user.userId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: 'userBookmark',
            },
        });
        pipeline.push({
            $addFields: {
                isBookmarked: { $gt: [{ $size: '$userBookmark' }, 0] },
            },
        });
    }
    else {
        pipeline.push({
            $addFields: {
                isBookmarked: false,
            },
        });
    }
    // Add view count
    await listing_model_1.default.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    pipeline.push({
        $project: {
            userBookmark: 0,
            'seller.password': 0,
        },
    });
    const result = await listing_model_1.default.aggregate(pipeline);
    if (result.length === 0) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    return result[0];
};
// Update Listing
const updateListingService = async (id, payload, user, files) => {
    const listing = await listing_model_1.default.findById(id);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    if (listing.sellerId.toString() !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to update this listing');
    }
    // Update fields from payload
    Object.assign(listing, payload);
    if (files && files.length > 0) {
        if (!listing.imagesAndVideos) {
            listing.imagesAndVideos = [];
        }
        for (const file of files) {
            const uploadedFile = await (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, file.originalname);
            if (uploadedFile) {
                listing.imagesAndVideos.push({
                    type: file.mimetype.startsWith('image') ? 'image' : 'video',
                    url: uploadedFile.secure_url,
                });
            }
        }
    }
    const updatedListing = await listing.save();
    return updatedListing;
};
// Delete Listing
const deleteListingService = async (id, user) => {
    const listing = await listing_model_1.default.findById(id);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    if (listing.sellerId.toString() !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete this listing');
    }
    // Delete images from Cloudinary before deleting the listing
    if (listing.imagesAndVideos && listing.imagesAndVideos.length > 0) {
        for (const image of listing.imagesAndVideos) {
            await (0, cloudinary_config_1.deleteImageFromCLoudinary)(image.url);
        }
    }
    await listing_model_1.default.findByIdAndDelete(id);
    return null;
};
// delete listing media service
const deleteListingMediaService = async (listingId, mediaUrl, user) => {
    const listing = await listing_model_1.default.findById(listingId);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    if (listing.sellerId.toString() !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete media from this listing');
    }
    // Delete image from Cloudinary
    await (0, cloudinary_config_1.deleteImageFromCLoudinary)(mediaUrl);
    // Remove media from post
    const updatedImagesAndVideos = (listing.imagesAndVideos || []).filter((media) => decodeURIComponent(media.url) !== mediaUrl);
    const updatedListing = await listing_model_1.default.findByIdAndUpdate(listingId, { imagesAndVideos: updatedImagesAndVideos }, { new: true, runValidators: true });
    return updatedListing;
};
// get listing analytics service
const getListingAnalyticsService = async (id) => {
    const listing = await listing_model_1.default.findById(id);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    // engagement analytics for last 7 days, last 1 month
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    // engagement analytics = view count + inquiry count for last 7 days, last 1 month, last 1 year
    const engagementResult = await listing_model_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(id),
            },
        },
        {
            $project: {
                viewCount: 1,
                inquiryCount: 1,
                engagementLast7Days: {
                    $cond: [
                        { $gte: ['$createdAt', oneWeekAgo] },
                        { $add: ['$viewCount', '$inquiryCount'] },
                        0,
                    ],
                },
                engagementLast1Month: {
                    $cond: [
                        { $gte: ['$createdAt', oneMonthAgo] },
                        { $add: ['$viewCount', '$inquiryCount'] },
                        0,
                    ],
                },
                engagementLast1Year: {
                    $cond: [
                        { $gte: ['$createdAt', oneYearAgo] },
                        { $add: ['$viewCount', '$inquiryCount'] },
                        0,
                    ],
                },
            },
        },
    ]);
    return {
        ...engagementResult[0],
    };
};
exports.listingServices = {
    createListingService,
    getMyListingsService,
    getAllListingsService,
    getSingleListingService,
    updateListingService,
    deleteListingService,
    getListingsByUserIdService,
    deleteListingMediaService,
    getListingAnalyticsService,
};
