# Project: Node.js Messaging Microservice

## Goal

A standalone Node.js service handling 1-to-1 chat/messaging (like WhatsApp DMs, no group chat), integrated with an existing FastAPI backend. Exposed to the frontend via a `/inbox` path.

---

# Architecture decisions

- Two databases, two services, no shared DB access.
- FastAPI + PostgreSQL owns all user data (source of truth).
- Node.js + MongoDB owns all messaging data.
- Node.js never connects directly to PostgreSQL.

## User IDs

Users have UUIDs assigned in PostgreSQL.

Node.js stores these same UUIDs as plain string references (`senderId`, `participantIds`) in MongoDB — no foreign key, just an application-level reference.

---

# Auth flow (this is the actual integration point)

- FastAPI issues a JWT at login.
- Frontend sends that same JWT directly to the Node.js service on every request — FastAPI is never a per-request relay.
- Node.js verifies the JWT independently using a shared secret (or FastAPI's public key if moving to RS256 later) — no FastAPI call needed just to verify.
- FastAPI needs to add one internal endpoint: something like `GET /internal/users/{id}` that Node.js calls occasionally to fetch fresh display info (username, avatar) for denormalized caching — not on every message, just when the cache is stale/missing.
- Open question for the FastAPI side: what does the JWT payload look like — specifically, what's the claim name holding the user's UUID (`sub` vs a custom `user_id` field)? Needs to be decided/confirmed so Node's auth middleware reads the right key.

---

# Routing `/inbox` to Node.js

Decided on Nginx as a reverse proxy in front of both services.

- Routes `/inbox/*` to Node.js.
- Everything else goes to FastAPI.
- Nginx must forward the `Authorization` header through untouched to both backends.

---

# Node.js service — tech stack

| Component | Choice |
|-----------|--------|
| Language | Plain JavaScript, ES Modules (`"type": "module"` in `package.json`) — not TypeScript |
| Runtime / Framework | Express |
| Database | MongoDB Atlas (cloud, already connected) via Mongoose |
| Auth | `jsonwebtoken` (verifies FastAPI-issued JWTs) |
| Env config | `dotenv` |
| Internal API calls to FastAPI | `axios` |
| Real-time (planned, not yet built) | `socket.io` |
| Validation | `zod` |
| Security / Misc | `helmet`, `cors` |
| Dev tooling | `nodemon` (replaces `ts-node-dev` since no TypeScript) |

---

# `.env`

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/messaging-service?retryWrites=true&w=majority
PORT=5000
```

> `.env` confirmed in `.gitignore` before first commit — learned from a prior API-key leak on another project.

---

# Folder structure (finalized)

```text
message-service/
  src/
    core/
      config.js       -> reads/validates env vars (port, mongoUri), single source instead of raw process.env everywhere
      db.js           -> connectDB() using mongoose.connect(), exits process on failure

    models/
      Conversation.js
      Message.js
      UserCache.js    -> (optional, not yet built) cached username/avatar from FastAPI

    routes/
      inboxRoutes.js  -> (not yet built) maps /inbox endpoints to controllers

    controllers/
      inboxController.js -> (not yet built) request handling logic

    middleware/
      authMiddleware.js -> (currently being built) verifies JWT, sets req.userId
      errorHandler.js   -> (not yet built) catch-all error middleware, formats ApiError responses

    services/
      userService.js   -> (not yet built) calls FastAPI's /internal/users/:id, checks UserCache first

    sockets/           -> (planned for later, after REST works)
      index.js
      authSocket.js
      messageSocket.js

    utils/
      ApiError.js
      ApiResponse.js
      asyncHandler.js

    server.js          -> thin entry point: load config, connectDB, mount middleware/routes, listen

  .env
  .gitignore
  package.json
```

---

# Models (finalized schema decisions)

## `Conversation.js`

Strictly 1-to-1, no groups.

- `participantIds`: array of exactly 2 UUID strings, must be stored in sorted order (e.g. always `[smaller_id, larger_id]`) so a pair never gets two separate conversation documents.
- Unique index on `participantIds` to enforce no-duplicate-pairs at the DB level.
- `lastMessageAt`, `lastMessagePreview`: denormalized onto the conversation so the inbox list query never has to touch the `Message` collection — just read conversations sorted by `lastMessageAt`.
- `timestamps: true` for auto `createdAt` / `updatedAt`.

---

## `Message.js`

- `conversationId`: ref to `Conversation`, indexed (queried constantly).
- `senderId`: UUID string (no separate `receiverId` — the other participant is derived from the conversation's `participantIds`).
- `content`: text only for now (attachments/images deferred).
- `isRead`: Boolean, default `false` (not an array — only two participants, so just tracks whether the other person has seen it; sender obviously has).
- `timestamps: true`.

### Noted for later (not built yet)

A per-conversation "last read" pointer on `Conversation` (e.g. `lastReadBy: { userId: timestamp }`) would be needed for efficient unread-count badges, separate from per-message `isRead` which is more for showing read receipts/ticks on individual messages.

---

# Naming convention

- `xSchema` for the new `mongoose.Schema({...})` variable.
- `X` (PascalCase, no suffix) for the exported model.

Example:

```js
Conversation.findOne(...)
```

Not:

```js
conversationModel.findOne(...)
```

---

# Currently in progress

Building `middleware/authMiddleware.js`.

Responsibilities:

- Reads `Authorization: Bearer <token>` header.
- Verifies via `jsonwebtoken` against the shared secret.
- Extracts the `userId` claim.
- Sets `req.userId`.
- Calls `next()`.
- Rejects with `401` (via `ApiError`) on missing/invalid/expired tokens.

---

# Not yet built (in planned order)

1. Finish `authMiddleware.js` (blocked on knowing FastAPI's JWT claim name)
2. `errorHandler.js`
3. `inboxRoutes.js` + `inboxController.js` (find-or-create conversation logic, send/fetch messages)
4. `services/userService.js` (calls FastAPI's internal endpoint)
5. `models/UserCache.js`
6. `sockets/` folder for real-time delivery, once REST is working end-to-end