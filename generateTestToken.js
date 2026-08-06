import jwt from "jsonwebtoken";
import "dotenv/config";

const token = jwt.sign(
  { sub: "totally-different-uuid-9999", type: "access" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

console.log(token);