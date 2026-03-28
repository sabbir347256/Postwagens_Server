"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
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
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.userId;
            delete ret.parentId;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
    },
});
commentSchema.virtual('user', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
commentSchema.virtual('parentComment', {
    ref: 'Comment',
    localField: 'parentId',
    foreignField: '_id',
    justOne: true,
});
exports.Comment = (0, mongoose_1.model)('Comment', commentSchema);
