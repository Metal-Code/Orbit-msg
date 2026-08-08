export const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  fastapiInternalUrl: process.env.FASTAPI_INTERNAL_URL,
  internalApiSecret: process.env.INTERNAL_API_SECRET,
};