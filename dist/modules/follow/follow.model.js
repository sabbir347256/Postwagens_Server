"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Follow = void 0;
const mongoose_1 = require("mongoose");
const followSchema = new mongoose_1.Schema({
    follower: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    following: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
}, {
    timestamps: true,
});
followSchema.index({ follower: 1, following: 1 }, { unique: true });
exports.Follow = (0, mongoose_1.model)('Follow', followSchema);
