"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreference = void 0;
const mongoose_1 = require("mongoose");
const notificationPreferenceSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    preferences: {
        type: Map,
        of: new mongoose_1.Schema({
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
        }, { _id: false }),
    },
}, {
    timestamps: true,
});
exports.NotificationPreference = (0, mongoose_1.model)('NotificationPreference', notificationPreferenceSchema);
