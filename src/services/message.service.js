import Message from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getConversationOrFail } from "./conversationAccess.service.js";

export const createMessage = async (conversationId, senderId, content) => {
  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content cannot be empty");
  }

  if (content.trim().length > 2000) {
    throw new ApiError(400, "Message content exceeds maximum length");
  }

  const conversation = await getConversationOrFail(conversationId, senderId);

  const message = await Message.create({
    conversationId,
    senderId,
    content: content.trim(),
  });

  conversation.lastMessageAt = message.createdAt;
  conversation.lastPreview = content.trim().slice(0, 100);
  await conversation.save();

  return { message, conversation };
};


export const markMessagesAsRead = async (conversationId, userId) => {
  const conversation = await getConversationOrFail(conversationId, userId);

  await Message.updateMany(
    { conversationId, senderId: { $ne: userId }, isRead: false },
    { $set: { isRead: true } }
  );

  return conversation;
};