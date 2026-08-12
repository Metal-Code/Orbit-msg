import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { connectDB } from "./core/db.js";
import { config } from "./core/config.js";
import inboxRoutes from "./routes/inbox.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { initSocket } from "./sockets/index.socket.js";

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: "https://orbit-new-frontend.vercel.app",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "orbitmsg is running" });
});

app.use("/inbox", inboxRoutes);
app.use(errorMiddleware);

connectDB().then(() => {
  initSocket(httpServer);
  httpServer.listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  );
});