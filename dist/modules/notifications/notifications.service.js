"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const socket_1 = require("../../socket/socket");
const notifications_model_1 = require("./notifications.model");
const user_model_1 = __importDefault(require("../users/user.model"));
const firebase_config_1 = __importDefault(require("../../config/firebase.config"));
const notification_helper_1 = require("./notification.helper");
const createNotification = async (payload) => {
    const notification = await notifications_model_1.Notification.create(payload);
    if (!notification.userId) {
        return notification;
    }
    const userId = notification.userId.toString();
    await notification.populate([
        {
            path: 'userId',
            select: 'fullName avatar',
        },
        {
            path: 'actorId',
            select: 'fullName avatar',
        },
        {
            path: 'entity.postId',
        },
        {
            path: 'entity.commentId',
        },
        {
            path: 'entity.likeId',
        },
        {
            path: 'entity.listingId',
        },
        {
            path: 'entity.followId',
        },
        {
            path: 'entity.conversationId',
        },
    ]);
    const message = await notification_helper_1.NotificationHelper.generateNotificationMessage(notification);
    if ((0, socket_1.isUserOnline)(userId)) {
        const io = (0, socket_1.getSocketIo)();
        io.to(userId).emit('new_notification', {
            ...notification.toObject(),
            message,
        });
    }
    else {
        const user = await user_model_1.default.findById(userId);
        if (user && user.fcmToken) {
            const fcmMessage = {
                notification: {
                    title: 'New Notification',
                    body: message,
                },
                token: user.fcmToken,
                data: {
                    notification: JSON.stringify(notification),
                },
            };
            try {
                // @ts-ignore
                await firebase_config_1.default.send(fcmMessage);
            }
            catch (error) {
                console.error('Error sending FCM message:', error);
            }
        }
    }
    return notification;
};
const getNotificationsForUser = async (userId, query) => {
    const { type, page = 1, limit = 10 } = query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findQuery = { userId };
    if (type) {
        findQuery.type = type;
    }
    const notifications = await notifications_model_1.Notification.find(findQuery)
        .populate({
        path: 'userId',
        select: 'fullName avatar',
    })
        .populate({
        path: 'actorId',
        select: 'fullName avatar',
    })
        .populate({
        path: 'entity.postId',
    })
        .populate({
        path: 'entity.commentId',
    })
        .populate({
        path: 'entity.likeId',
    })
        .populate({
        path: 'entity.listingId',
    })
        .populate({
        path: 'entity.followId',
    })
        .populate({
        path: 'entity.conversationId',
    })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    const total = await notifications_model_1.Notification.countDocuments(findQuery);
    const totalPages = Math.ceil(total / limit);
    const notificationsWithMessages = await Promise.all(notifications.map(async (notification) => {
        const message = await notification_helper_1.NotificationHelper.generateNotificationMessage(notification);
        return {
            ...notification,
            message,
        };
    }));
    return {
        data: notificationsWithMessages,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};
const markAsRead = async (notificationId) => {
    return await notifications_model_1.Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};
const markAllAsRead = async (userId) => {
    return await notifications_model_1.Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
exports.NotificationService = {
    createNotification,
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
};
