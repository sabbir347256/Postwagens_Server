"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const http_status_codes_1 = require("http-status-codes");
const CatchAsync_1 = require("../../utils/CatchAsync");
const conversation_service_1 = require("./conversation.service");
const SendResponse_1 = require("../../utils/SendResponse");
const sendMessage = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { participantBId, text, listingId } = req.body;
    // @ts-ignore
    const senderId = req.user.userId;
    const file = req.file;
    const result = await conversation_service_1.ConversationService.sendMessage(senderId, participantBId, text, listingId, file);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
});
const getConversationsForUser = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    // @ts-ignore
    const userId = req.user.userId;
    const { search } = req.query;
    const result = await conversation_service_1.ConversationService.getConversationsForUser(userId, search);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Conversations retrieved successfully',
        data: result,
    });
});
const getMessagesForConversation = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { conversationId } = req.params;
    // @ts-ignore
    const userId = req.user.userId;
    const { page, limit } = req.query;
    // @ts-ignore
    const result = await conversation_service_1.ConversationService.getMessagesForConversation(conversationId, userId, { page: Number(page) || 1, limit: Number(limit) || 20 });
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Messages retrieved successfully',
        data: result,
    });
});
const findOrCreateConversation = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { participantBId } = req.body;
    // @ts-ignore
    const participantAId = req.user.userId;
    const { page, limit } = req.query;
    const result = await conversation_service_1.ConversationService.findOrCreateConversation(participantAId, participantBId, { page: Number(page) || 1, limit: Number(limit) || 20 });
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Conversation found or created successfully',
        data: result,
    });
});
exports.ConversationController = {
    sendMessage,
    getConversationsForUser,
    getMessagesForConversation,
    findOrCreateConversation,
};
