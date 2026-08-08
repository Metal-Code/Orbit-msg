import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getConversationOrFail = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!conversation.participantIds.includes(userId)) {
    throw new ApiError(403, "You are not part of this conversation");
  }

  return conversation;
};