import "dotenv/config";
import { connectDB } from "./src/core/db.js";
import { getUserInfo } from "./src/services/user.service.js";

const testUserId = "ea937503-a2c8-4fcc-b59e-b9994886849b";

connectDB().then(async () => {
  try {
    const user = await getUserInfo(testUserId);
    console.log("Fetched user info:", user);
  } catch (err) {
    console.error("getUserInfo failed:", err.message);
  }
  process.exit(0);
});