import 'dotenv/config';
import express from 'express';
import { connectDB } from './core/db.js';
import { config } from './core/config.js';
import inboxRoutes from "./routes/inbox.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

connectDB().then(() => {
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});


app.use(express.json()); 
app.use("/inbox", inboxRoutes);

app.use(errorMiddleware); 