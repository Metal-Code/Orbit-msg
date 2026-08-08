import mongoose from "mongoose";

const userCacheSchema = new mongoose.Schema({
  userId: {
    type: String, // matches the Postgres public_id/UUID
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
  cachedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("UserCache", userCacheSchema);