"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boost = void 0;
const mongoose_1 = require("mongoose");
const boostSchema = new mongoose_1.Schema({
    listingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            // 🔁 rename populated fields
            ret.user = ret.userId;
            ret.listing = ret.listingId;
            // ❌ remove raw ids
            delete ret.userId;
            delete ret.listingId;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
    },
});
exports.Boost = (0, mongoose_1.model)('Boost', boostSchema);
