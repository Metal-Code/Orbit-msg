import { createMessage, markMessagesAsRead } from "../services/message.service.js";

export const registerMessageHandlers = (io, socket) => {
  socket.join(socket.userId);

  socket.on("sendMessage", async (payload, callback) => {
    const data = typeof payload === "string" ? JSON.parse(payload) : payload;
    const { conversationId, content } = data;

    try {
      const { message, conversation } = await createMessage(
        conversationId,
        socket.userId,
        content
      );

      const otherUserId =
        conversation.participantOneId === socket.userId
          ? conversation.participantTwoId
          : conversation.participantOneId;

      io.to(otherUserId).emit("newMessage", message);

      if (callback) callback({ success: true, message });
    } catch (err) {
      console.error("sendMessage socket handler failed:", err.message);
      if (callback) {
        callback({ success: false, error: err.message });
      }
    }
  });



  socket.on("markAsRead", async (payload, callback) => {
    const data = typeof payload === "string" ? JSON.parse(payload) : payload;
    const { conversationId } = data;

    try {
      const conversation = await markMessagesAsRead(conversationId, socket.userId);

      const otherUserId =
        conversation.participantOneId === socket.userId
          ? conversation.participantTwoId
          : conversation.participantOneId;

      io.to(otherUserId).emit("messagesRead", {
        conversationId,
        readBy: socket.userId,
      });

      if (callback) callback({ success: true });
    } catch (err) {
      console.error("markAsRead socket handler failed:", err.message);
      if (callback) {
        callback({ success: false, error: err.message });
      }
    }
  });


  socket.on("disconnect", () => {
    console.log(`Socket disconnected: userId ${socket.userId}`);
  });
};