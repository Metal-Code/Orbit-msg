import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getConversations,
  openConversation,
  getMessages,
  sendMessage,
} from "../controllers/inbox.controller.js";

const router = Router();

router.use(authMiddleware); 

router.get("/", getConversations);
router.post("/conversations", openConversation);
router.get("/:conversationId/messages", getMessages);
router.post("/:conversationId/messages", sendMessage);

export default router;