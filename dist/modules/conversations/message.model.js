"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    listing: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Listing',
    },
    text: {
        type: String,
    },
    mediaUrl: {
        type: String,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: { createdAt: 'sentAt', updatedAt: false },
});
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
