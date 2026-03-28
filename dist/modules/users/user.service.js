"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = __importDefault(require("./user.model"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
// import axios from 'axios';
const redis_config_1 = require("../../config/redis.config");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const follow_model_1 = require("../follow/follow.model");
// CREATE USER
const createUserService = async (payload) => {
    const { email, ...rest } = payload;
    const isUser = await user_model_1.default.findOne({ email });
    if (isUser) {
        throw new AppError_1.default(400, 'User aleready exist. Please login!');
    }
    // Save User Auth
    const authUser = {
        provider: 'credentials',
        providerId: payload.email,
    };
    const userPayload = {
        email,
        auths: [authUser],
        ...rest,
    };
    const creatUser = await user_model_1.default.create(userPayload); // Create user
    // Notification preference setup can be added here in future
    //   await NotificationPreference.create({
    //     user: new mongoose.Types.ObjectId(creatUser?._id),
    //     channel: {
    //       push: true,
    //       email: true,
    //       inApp: true,
    //     },
    //     directmsg: true,
    //     app: {
    //       product_updates: true,
    //       special_offers: true,
    //     },
    //     event: {
    //       event_invitations: true,
    //       event_changes: true,
    //       event_reminders: true,
    //     },
    //   });
    return creatUser;
};
// GET ALL USERS
const getAllUserService = async (query, userId) => {
    //   const getBlockList = await BlockedUser.find({ user: userId }).select(
    //     'blockedUser'
    //   );
    //   const blockedUsersIds = getBlockList.map((block) => block.blockedUser);
    //   const filter = { _id: { $nin: blockedUsersIds } };
    const filter = {};
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.default.find(filter), query);
    const users = await queryBuilder
        .filter()
        .textSearch()
        .select()
        .sort()
        .paginate()
        .build();
    const meta = await queryBuilder.getMeta();
    return {
        meta,
        users,
    };
};
// GET ME
const getMeService = async (userId) => {
    const user = await user_model_1.default.aggregate([
        // Stage 1: Matching
        { $match: { _id: new mongoose_1.Types.ObjectId(userId) } },
        // Stage 2: Lookup for people the user is following
        {
            $lookup: {
                from: 'follows',
                localField: '_id',
                foreignField: 'follower',
                as: 'following',
            },
        },
        // Stage 3: Lookup for people following the user
        {
            $lookup: {
                from: 'follows',
                localField: '_id',
                foreignField: 'following',
                as: 'followers',
            },
        },
        // Lookup for user's listings
        {
            $lookup: {
                from: 'listings',
                localField: '_id',
                foreignField: 'sellerId',
                as: 'listings',
            },
        },
        // Stage 4: Add counts
        {
            $addFields: {
                followingCount: { $size: '$following' },
                followerCount: { $size: '$followers' },
                listingCount: { $size: '$listings' },
            },
        },
        // Projection
        {
            $project: {
                password: 0,
                interests: 0,
                following: 0, // remove the array
                followers: 0, // remove the array
                listings: 0, // remove the array
            },
        },
    ]);
    if (!user || user.length === 0) {
        throw new AppError_1.default(404, 'User not found');
    }
    // Normalize the date to remove time part
    const normalizeDate = (date) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0); // Set time to midnight
        return normalizedDate;
    };
    const todayNormalized = normalizeDate(new Date());
    // Update user activity for the day
    //   await UserActivity.updateOne(
    //     { user: new Types.ObjectId(userId), date: todayNormalized }, // match user + normalized date
    //     { $setOnInsert: { createdAt: new Date() } }, // insert only if missing
    //     { upsert: true } // create if missing
    //   );
    return user[0];
};
// GET PROFILE
const getProfileService = async (profileUserId, currentUserId) => {
    if (!profileUserId) {
        throw new AppError_1.default(400, 'User ID is required');
    }
    const _user = await user_model_1.default.aggregate([
        // Stage 1: Matching
        { $match: { _id: new mongoose_1.Types.ObjectId(profileUserId) } },
        // Stage 2: Lookup for people the user is following
        {
            $lookup: {
                from: 'follows',
                localField: '_id',
                foreignField: 'follower',
                as: 'following',
            },
        },
        // Stage 3: Lookup for people following the user
        {
            $lookup: {
                from: 'follows',
                localField: '_id',
                foreignField: 'following',
                as: 'followers',
            },
        },
        // Stage 4: Lookup for user's posts
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
                foreignField: 'userId',
                as: 'posts',
            },
        },
        // Lookup for users's listing
        {
            $lookup: {
                from: 'listings',
                localField: '_id',
                foreignField: 'sellerId',
                as: 'listings',
            },
        },
        // Stage 5: Add counts
        {
            $addFields: {
                followingCount: { $size: '$following' },
                followerCount: { $size: '$followers' },
                postCount: { $size: '$posts' },
                listingCount: { $size: '$listings' },
            },
        },
        // Projection
        {
            $project: {
                password: 0,
                following: 0, // remove the array
                followers: 0, // remove the array
                posts: 0, // remove the array
                listings: 0, // remove the array
            },
        },
    ]);
    const user = _user[0];
    if (!user) {
        throw new AppError_1.default(404, 'User not found');
    }
    // Check if the current user is following this user
    if (currentUserId) {
        const isFollowing = await follow_model_1.Follow.findOne({
            follower: currentUserId,
            following: profileUserId,
        });
        user.isFollowing = !!isFollowing;
    }
    else {
        user.isFollowing = false;
    }
    return user;
};
// USER UPDATE
const userUpdateService = async (userId, payload, decodedToken) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    // USER & ORGANIZER can ONLY update their own profile - Only admin can update others
    // if (
    //   (decodedToken.role === Role.USER || decodedToken.role === Role.ORGANIZER) &&
    //   decodedToken.userId !== userId
    // ) {
    //   throw new AppError(
    //     StatusCodes.FORBIDDEN,
    //     'You can only update your own profile'
    //   );
    // }
    // Delete previous avatar from cloudinary
    if (payload.avatar && user.avatar) {
        (0, cloudinary_config_1.deleteImageFromCLoudinary)(user?.avatar);
    }
    // Block password update from this route
    if (payload.password) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You can't update your password from this route!");
    }
    // Role update protection
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER ||
            decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not allowed to update roles!');
        }
    }
    // USER & ORGANIZER cannot update isActive, isDeleted, isVerified
    if (payload?.isActive !== undefined ||
        payload?.isDeleted !== undefined ||
        payload?.isVerified !== undefined) {
        if (decodedToken.role === user_interface_1.Role.USER ||
            decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not allowed to update account status!');
        }
    }
    // PREVENT BLOCKED - INACTIVE, IF USER IS ADMIN
    if (payload.isActive === user_interface_1.IsActive.INACTIVE ||
        payload.isActive === user_interface_1.IsActive.BLOCKED ||
        payload.isDeleted === true) {
        if (user.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Admin can't disabled himself!");
        }
    }
    // Update Locations
    if (payload.location) {
        user.location = payload.location;
    }
    // FIELD WHITELISTING for USER & ORGANIZER
    if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.ADMIN) {
        const allowedUpdates = [
            'fullName',
            'avatar',
            'fcmToken',
            'bio',
            'location',
        ];
        Object.keys(payload).forEach((key) => {
            if (!allowedUpdates.includes(key)) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, `You are not allowed to update: ${key}`);
            }
        });
    }
    // Update User
    const updatedUser = await user_model_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(userId), payload, {
        new: true,
        runValidators: true,
    });
    return updatedUser;
};
// DELETE USER
const userDeleteService = async (userId, decodedToken) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User already deleted!');
    }
    const allowedRoles = [user_interface_1.Role.ADMIN];
    if (!allowedRoles.includes(decodedToken.role)) {
        if (decodedToken.userId !== userId) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You can't delete others!");
        }
    }
    user.isDeleted = true;
    await user.save();
    return null;
};
// SEND VERIFICATION OTP
const verifyUserService = async (userId) => {
    const findUser = await user_model_1.default.findOne({ _id: userId });
    if (!findUser) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User not found!');
    }
    //   const phoneNumber = findUser.phone;
    //   const otp = randomOTPGenerator(100000, 999999);
    //   await redisClient.set(`${phoneNumber}`, otp, {
    //     EX: 300,
    //   });
    //    await twilio.messages.create({
    //       to: findUser.phone as string,
    //       body: `Your verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`
    //   });
    return null;
};
// VERIFY OTP AND VERIFY USER
const verifyOTPService = async (phoneNumber, otp) => {
    const findUser = await user_model_1.default.findOne({ phone: phoneNumber });
    if (!findUser) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found by this phone number!');
    }
    if (otp.length !== 6) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid OTP!');
    }
    const getOTP = await redis_config_1.redisClient.get(`${phoneNumber}`);
    if (!getOTP) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP has expired or invalid!');
    }
    if (getOTP !== otp) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid isn't matched!");
    }
    if (findUser.isVerified) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are already verified!');
    }
    findUser.isVerified = true;
    await findUser.save();
    return null;
};
const purchaseBadgeService = async (userId) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    // Here you would implement the payment logic.
    // For now, we simulate a successful payment.
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    user.verifiedBadge = true;
    user.verifiedBadgeExpiration = expirationDate;
    await user.save();
    return user;
};
const updateSuspendStatusService = async (userId, isActive, decodedToken) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    if (user.role === user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Admins cannot be suspended!');
    }
    user.isActive = isActive;
    await user.save();
    return user;
};
// EXPORT ALL SERVICE
exports.userServices = {
    createUserService,
    verifyOTPService,
    verifyUserService,
    getMeService,
    userUpdateService,
    userDeleteService,
    getAllUserService,
    purchaseBadgeService,
    updateSuspendStatusService,
    getProfileService,
};
