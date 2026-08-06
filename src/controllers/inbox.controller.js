import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { findOrCreateConversation } from "../services/conversation.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participantIds: req.userId,
  }).sort({ lastMessageAt: -1 });

  res.status(200).json(
    new ApiResponse(200, conversations, "Conversations fetched")
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

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
    }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!conversation.participantIds.includes(req.userId)) {
    throw new ApiError(403, "You are not part of this conversation");
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(200, messages, "Messages fetched")
  );
});


export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content cannot be empty");
  }

  if(!mongoose.Types.ObjectId.isValid(conversationId))
    {
        throw new ApiError(400, "Invalid conversation ID");
    }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!conversation.participantIds.includes(req.userId)) {
    throw new ApiError(403, "You are not part of this conversation");
  }

  const message = await Message.create({
    conversationId,
    senderId: req.userId,
    content: content.trim(),
  });

  conversation.lastMessageAt = message.createdAt;
  conversation.lastPreview = content.trim().slice(0, 100);
  await conversation.save();

  res.status(201).json(
    new ApiResponse(201, message, "Message sent")
  );
});