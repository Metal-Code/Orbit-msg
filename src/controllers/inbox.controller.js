import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { findOrCreateConversation } from "../services/conversation.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {getUserInfo} from "../services/user.service.js"
import { getConversationOrFail } from "../services/conversationAccess.service.js";
import { createMessage, markMessagesAsRead } from "../services/message.service.js";

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participantIds: req.userId,
  }).sort({ lastMessageAt: -1 });

  const enriched = await Promise.all(
    conversations.map(async (conversation) => {
      const otherUserId =
        conversation.participantOneId === req.userId
          ? conversation.participantTwoId
          : conversation.participantOneId;

      const otherUser = await getUserInfo(otherUserId);

      return {
        ...conversation.toObject(),
        otherUser,
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, enriched, "Conversations fetched")
  );
});


export const openConversation = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body;

  if (!otherUserId) {
    throw new ApiError(400, "otherUserId is required");
  }

  const conversation = await findOrCreateConversation(req.userId, otherUserId);

  res.status(200).json(
    new ApiResponse(200, conversation, "Conversation ready")
  );
});


export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await getConversationOrFail(conversationId, req.userId);

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(200, messages, "Messages fetched")
  );
});


export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  const { message } = await createMessage(conversationId, req.userId, content);

  res.status(201).json(
    new ApiResponse(201, message, "Message sent")
  );
});


export const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await markMessagesAsRead(conversationId, req.userId);

  res.status(200).json(
    new ApiResponse(200, null, "Messages marked as read")
  );
});