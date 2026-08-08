import jwt from "jsonwebtoken";
import { config } from "../core/config.js";

export const authSocket = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  
  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }

  if (payload.type !== "access") {
    return next(new Error("Invalid token type"));
  }

  socket.userId = payload.sub;
  next();
};