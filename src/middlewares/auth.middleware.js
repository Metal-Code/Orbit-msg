import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {config} from "../core/config.js"
import jwt from "jsonwebtoken";


export const authMiddleware = asyncHandler(async(req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer "))
        throw new ApiError(401, `Authorization token is missing or malformed`);

    const token = authHeader.split(" ")[1];

    let payload;
    try {
        payload = jwt.verify(token, config.jwtSecret);
    } catch (err) {
        console.error("JWT verify failed:", err.message); // temporary debug line
        throw new ApiError(401, "Invalid or expired token");
    }

    if (payload.type !== `access`)
        throw new ApiError(401, `Invalid token type`)

    if(!payload.sub)
        throw new ApiError(401, `Token payload missing subject`)

    req.userId = payload.sub;
    next()
});