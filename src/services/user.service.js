import axios from "axios";
import UserCache from "../models/cache.model.js";
import { config } from "../core/config.js";

const CACHE_TTL_MS = 60 * 60 * 1000; 

export const getUserInfo = async (userId) => {
  const cached = await UserCache.findOne({ userId });

  const isStale =
    !cached || Date.now() - cached.cachedAt.getTime() > CACHE_TTL_MS;

  if (!isStale) {
    return {
      userId: cached.userId,
      fullName: cached.fullName,
      avatarUrl: cached.avatarUrl,
    };
  }

  try {
    const response = await axios.get(
      `${config.fastapiInternalUrl}/internal/users/${userId}`,
      { headers: { "X-Internal-Api-Key": config.internalApiSecret } }
    );

    const { public_id, full_name, avatar_url } = response.data;

    const updated = await UserCache.findOneAndUpdate(
      { userId: public_id },
      { userId: public_id, fullName: full_name, avatarUrl: avatar_url, cachedAt: new Date() },
      { upsert: true, returnDocument: "after" }
    );

    return { userId: updated.userId, fullName: updated.fullName, avatarUrl: updated.avatarUrl };
  } catch (err) {
    console.error(`getUserInfo failed for ${userId}:`, err.message);
    return { userId, fullName: "Unknown user", avatarUrl: null };
  }
};