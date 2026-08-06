import 'dotenv/config';
import express from 'express';
import { connectDB } from './core/db.js';
import { config } from './core/config.js';

const app = express();

connectDB().then(() => {
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});