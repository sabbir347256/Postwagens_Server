import { StatusCodes } from "http-status-codes";
import { CatchAsync } from "../../utils/CatchAsync";
import { ConversationService } from "./conversation.service";
import { SendResponse } from "../../utils/SendResponse";

const sendMessage = CatchAsync(async (req, res) => {
  console.log('sensdlakfj')
  const { participantBId, text, listingId } = req.body;
  // @ts-ignore
  const senderId = req.user.userId;
  const file = req.file;
//   console.log('only req',req);
//   console.log("adf", req.body);

  const result = await ConversationService.sendMessage(
    senderId,
    participantBId,
    text,
    listingId,
    file,
  );
  SendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const getConversationsForUser = CatchAsync(async (req, res) => {
  // @ts-ignore
  const userId = req.user.userId;
  const { search } = req.query;
  const result = await ConversationService.getConversationsForUser(
    userId,
    search as string,
  );
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result,
  });
});

const getMessagesForConversation = CatchAsync(async (req, res) => {
  const { conversationId } = req.params;
  // @ts-ignore
  const userId = req.user.userId;
  const { page, limit } = req.query;
  // @ts-ignore
  const result = await ConversationService.getMessagesForConversation(
    conversationId as string,
    userId,
    { page: Number(page) || 1, limit: Number(limit) || 20 },
  );
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result,
  });
});

const findOrCreateConversation = CatchAsync(async (req, res) => {
  const { participantBId } = req.body;
  // @ts-ignore
  const participantAId = req.user.userId;
  const { page, limit } = req.query;

  const result = await ConversationService.findOrCreateConversation(
    participantAId,
    participantBId,
    { page: Number(page) || 1, limit: Number(limit) || 20 },
  );

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Conversation found or created successfully",
    data: result,
  });
});

export const ConversationController = {
  sendMessage,
  getConversationsForUser,
  getMessagesForConversation,
  findOrCreateConversation,
};
