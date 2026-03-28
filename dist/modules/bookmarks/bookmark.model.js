"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bookmark = void 0;
const mongoose_1 = require("mongoose");
const bookmarkSchema = new mongoose_1.Schema({
    listingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
// Ensure that a user can only bookmark a listing once
bookmarkSchema.index({ listingId: 1, userId: 1 }, { unique: true });
exports.Bookmark = (0, mongoose_1.model)('Bookmark', bookmarkSchema);
