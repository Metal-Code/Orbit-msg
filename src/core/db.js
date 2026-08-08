import mongoose from "mongoose";
import { config } from './config.js';

export const connectDB = async () => {
    try
    {   
        await mongoose.connect(config.mongoUri);
        console.log(`MongoDB connected from db.js`)
    }
    catch(err)
    {
        console.log(`DB connection failed from db.js : `, err);
        process.exit(1);
    }
}