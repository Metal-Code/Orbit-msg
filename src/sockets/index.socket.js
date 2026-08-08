import { Server } from "socket.io";
import { authSocket } from "./auth.socket.js";
import { registerMessageHandlers } from "./message.socket.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // tighten this later once Nginx/production origin is known
    },
  });

  io.use(authSocket);

  io.on("connection", (socket) => {
    console.log(`Socket connected: userId ${socket.userId}`);
    registerMessageHandlers(io, socket);
  });

  return io;
};