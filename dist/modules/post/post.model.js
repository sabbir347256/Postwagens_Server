"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
    text: { type: String, required: true },
    imagesAndVideos: [
        {
            type: {
                type: String,
            },
            url: {
                type: String,
            },
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            // 🔁 rename userId -> user
            ret.user = ret.userId;
            delete ret.userId;
            return ret;
        },
    },
});
const Post = (0, mongoose_1.model)('Post', postSchema);
exports.default = Post;
