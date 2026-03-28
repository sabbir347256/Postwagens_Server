"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = void 0;
const mongoose_1 = require("mongoose");
const likeSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'post',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
likeSchema.statics.isLikedByUser = async function (postId, userId) {
    return await exports.Like.findOne({ postId, userId });
};
// Ensure that a user can only like a post once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });
exports.Like = (0, mongoose_1.model)('Like', likeSchema);
