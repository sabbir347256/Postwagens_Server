"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notifications_interface_1 = require("./notifications.interface");
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    targetRole: {
        type: String,
        enum: Object.values(notifications_interface_1.NotificationTargetRole),
    },
    actorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(notifications_interface_1.NotificationType),
        required: true,
    },
    entity: {
        paymentId: {
            type: mongoose_1.Schema.Types.ObjectId,
        },
        amount: {
            type: Number,
        },
        userId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'user',
        },
        postId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Post',
        },
        commentId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        likeId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Like',
        },
        listingId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Listing',
        },
        followId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Follow',
        },
        conversationId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Conversation',
        },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
