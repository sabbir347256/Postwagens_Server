"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
const follow_model_1 = require("./follow.model");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_interface_1 = require("../notifications/notifications.interface");
const mongoose_1 = require("mongoose");
const toggleFollow = async (followerId, followingId) => {
    const isFollowing = await follow_model_1.Follow.findOne({ follower: followerId, following: followingId });
    if (isFollowing) {
        await follow_model_1.Follow.findOneAndDelete({ follower: followerId, following: followingId });
        return { following: false };
    }
    else {
        const follow = await follow_model_1.Follow.create({ follower: followerId, following: followingId });
        // Create notification
        await notifications_service_1.NotificationService.createNotification({
            userId: new mongoose_1.Types.ObjectId(followingId),
            actorId: new mongoose_1.Types.ObjectId(followerId),
            type: notifications_interface_1.NotificationType.FOLLOW,
            entity: {
                followId: follow._id,
            },
            isRead: false,
        });
        return { following: true };
    }
};
const getFollowers = async (userId) => {
    return await follow_model_1.Follow.find({ following: userId }).populate('follower');
};
const getFollowing = async (userId) => {
    return await follow_model_1.Follow.find({ follower: userId }).populate('following');
};
const isFollowing = async (follower, following) => {
    return !!(await follow_model_1.Follow.findOne({ follower, following }));
};
exports.FollowService = {
    toggleFollow,
    getFollowers,
    getFollowing,
    isFollowing,
};
