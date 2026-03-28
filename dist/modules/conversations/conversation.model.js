"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    participantAId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    participantBId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
}, {
    timestamps: true,
});
conversationSchema.index({ participantAId: 1, participantBId: 1 }, { unique: true });
exports.Conversation = (0, mongoose_1.model)('Conversation', conversationSchema);
