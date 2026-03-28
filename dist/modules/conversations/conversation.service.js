"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const conversation_model_1 = require("./conversation.model");
const socket_1 = require("../../socket/socket");
const message_model_1 = require("./message.model");
const mongoose_1 = __importDefault(require("mongoose"));
const listing_model_1 = __importDefault(require("../listing/listing.model"));
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_interface_1 = require("../notifications/notifications.interface");
const sendMessage = async (senderId, participantBId, text, listingId, file) => {
    let conversation = await conversation_model_1.Conversation.findOne({
        $or: [
            { participantAId: senderId, participantBId: participantBId },
            { participantAId: participantBId, participantBId: senderId },
        ],
    });
    if (!conversation) {
        conversation = await conversation_model_1.Conversation.create({
            participantAId: senderId,
            participantBId: participantBId,
        });
    }
    if (!text && !file) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Message text or media is required');
    }
    if (listingId) {
        await listing_model_1.default.findByIdAndUpdate(listingId, {
            $inc: { inquiryCount: 1 },
        });
    }
    let mediaUrl;
    if (file) {
        const uploadResult = await (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, file.originalname);
        mediaUrl = uploadResult?.secure_url;
    }
    let message = await message_model_1.Message.create({
        conversationId: conversation._id,
        senderId,
        text,
        mediaUrl,
        listing: listingId,
    });
    message = await message.populate(['senderId', 'listing']);
    const io = (0, socket_1.getSocketIo)();
    const recipientId = conversation.participantAId.toString() === senderId
        ? conversation.participantBId.toString()
        : conversation.participantAId.toString();
    io.to(recipientId).emit('newMessage', message);
    await notifications_service_1.NotificationService.createNotification({
        userId: new mongoose_1.default.Types.ObjectId(recipientId),
        actorId: new mongoose_1.default.Types.ObjectId(senderId),
        type: notifications_interface_1.NotificationType.MESSAGE,
        entity: {
            userId: new mongoose_1.default.Types.ObjectId(senderId),
            conversationId: conversation._id,
        },
        isRead: false,
    });
    return message;
};
const getConversationsForUser = async (userId, searchTerm) => {
    const userIdObj = new mongoose_1.default.Types.ObjectId(userId);
    const aggregation = [
        // Match conversations for the user
        {
            $match: {
                $or: [{ participantAId: userIdObj }, { participantBId: userIdObj }],
            },
        },
        // Populate participants
        {
            $lookup: {
                from: 'users',
                localField: 'participantAId',
                foreignField: '_id',
                as: 'participantADetails',
            },
        },
        { $unwind: '$participantADetails' },
        {
            $lookup: {
                from: 'users',
                localField: 'participantBId',
                foreignField: '_id',
                as: 'participantBDetails',
            },
        },
        { $unwind: '$participantBDetails' },
        // Add a field for the other participant
        {
            $addFields: {
                otherParticipant: {
                    $cond: {
                        if: { $eq: ['$participantADetails._id', userIdObj] },
                        then: '$participantBDetails',
                        else: '$participantADetails',
                    },
                },
            },
        },
    ];
    // Filter by search term
    if (searchTerm) {
        aggregation.push({
            $match: {
                'otherParticipant.fullName': { $regex: searchTerm, $options: 'i' },
            },
        });
    }
    // Restore original participant fields and clean up
    aggregation.push({
        $addFields: {
            participantAId: '$participantADetails',
            participantBId: '$participantBDetails',
        },
    }, {
        $project: {
            participantADetails: 0,
            participantBDetails: 0,
            otherParticipant: 0,
        },
    });
    const conversations = await conversation_model_1.Conversation.aggregate(aggregation);
    const conversationsWithDetails = await Promise.all(conversations.map(async (conversation) => {
        const unreadMessagesCount = await message_model_1.Message.countDocuments({
            conversationId: conversation._id,
            senderId: { $ne: userId },
            isRead: false,
        });
        const lastMessage = await message_model_1.Message.findOne({
            conversationId: conversation._id,
        })
            .sort({ sentAt: -1 })
            .populate('senderId')
            .populate('listing');
        return {
            ...conversation,
            hasUnreadMessages: unreadMessagesCount > 0,
            lastMessage,
        };
    }));
    return conversationsWithDetails;
};
const getMessagesForConversation = async (conversationId, userId, options) => {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const conversation = await conversation_model_1.Conversation.findById(conversationId)
        .populate('participantAId')
        .populate('participantBId');
    if (!conversation) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Conversation not found');
    }
    if (conversation.participantAId._id.toString() !== userId &&
        conversation.participantBId._id.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not a participant in this conversation');
    }
    // Mark messages as read for the current user.
    // This will only update messages where the sender is not the current user.
    await message_model_1.Message.updateMany({ conversationId, senderId: { $ne: userId }, isRead: false }, { isRead: true });
    const messages = await message_model_1.Message.find({ conversationId }).sort({ sentAt: -1 }).skip(skip).limit(limit).populate('senderId').populate('listing');
    const totalMessages = await message_model_1.Message.countDocuments({ conversationId });
    const totalPages = Math.ceil(totalMessages / limit);
    return { conversation, messages, totalPages, currentPage: page };
};
const findOrCreateConversation = async (participantAId, participantBId, options) => {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    let conversation = await conversation_model_1.Conversation.findOne({
        $or: [
            { participantAId, participantBId },
            { participantAId: participantBId, participantBId: participantAId },
        ],
    })
        .populate('participantAId')
        .populate('participantBId');
    if (!conversation) {
        const newConversation = await conversation_model_1.Conversation.create({
            participantAId,
            participantBId,
        });
        conversation = await conversation_model_1.Conversation.findById(newConversation._id)
            .populate('participantAId')
            .populate('participantBId');
    }
    if (!conversation) {
        // This should not happen, but as a safeguard
        throw new AppError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Could not create or find conversation');
    }
    // Mark messages as read for the current user (participantAId).
    await message_model_1.Message.updateMany({ conversationId: conversation._id, senderId: { $ne: participantAId }, isRead: false }, { isRead: true });
    const messages = await message_model_1.Message.find({ conversationId: conversation._id }).sort({ sentAt: -1 }).skip(skip).limit(limit).populate('senderId').populate('listing');
    const totalMessages = await message_model_1.Message.countDocuments({ conversationId: conversation._id });
    const totalPages = Math.ceil(totalMessages / limit);
    return { conversation, messages, totalPages, currentPage: page };
};
exports.ConversationService = {
    sendMessage,
    getConversationsForUser,
    getMessagesForConversation,
    findOrCreateConversation,
};
