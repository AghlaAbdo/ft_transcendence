# Chat Service Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Request Flow](#request-flow)
5. [Database Plugin Deep Dive](#database-plugin-deep-dive)
6. [Socket.IO Integration](#socketio-integration)
7. [Best Practices](#best-practices)

---

## Overview

The **chat-service** is a microservice built with **Fastify** (HTTP framework) and **Socket.IO** (real-time WebSocket communication). It handles:
- RESTful HTTP endpoints for chat history and metadata
- Real-time message delivery via WebSockets
- SQLite database for message/chat persistence

### Tech Stack
- **Runtime**: Node.js with ESM modules
- **Framework**: Fastify (high-performance HTTP)
- **Real-time**: Socket.IO
- **Database**: SQLite (via `better-sqlite3`)
- **Language**: TypeScript

---

## Project Structure
`
```
services/chat-service/
├── src/
│   ├── server.ts                 # Main entry point, server bootstrap
│   ├── plugins/
│   │   └── db.ts                 # Database plugin (singleton DB instance)
│   ├── routes/
│   │   └── chats.ts              # Route registration (HTTP endpoints)
│   ├── controllers/
│   │   └── chatsController.ts    # Request handlers (business logic)
│   ├── database/
│   │   ├── conversations.ts      # Message queries
│   │   ├── chats.ts              # Chat list queries
│   │   └── user.ts               # User queries (cross-service DB access)
│   ├── socket/
│   │   └── index.ts              # Socket.IO handlers and connection logic
│   └── database/
│       ├── chat.db               # SQLite database file
│       └── user-service.db       # User service DB (read-only access)
├── package.json
└── tsconfig.json
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `server.ts` | Bootstrap: register plugins, routes, error handlers, start HTTP & Socket.IO |
| `plugins/db.ts` | Centralized DB connection with lifecycle management |
| `routes/chats.ts` | Map HTTP routes to controller functions |
| `controllers/chatsController.ts` | Handle requests, call DB functions, return responses |
| `database/*.ts` | Raw SQL query functions (repository layer) |
| `socket/index.ts` | Real-time message handlers and connection lifecycle |

---

## Core Concepts

### 1. **Microservice Isolation**
This service is **self-contained** and communicates with other services (like `user-service`) via:
- HTTP API calls (for enriching data with user info)
- Independent database files (SQLite per service)

### 2. **Separation of Concerns**
```
HTTP Request → Route → Controller → Database Function → SQLite
                ↓
         (Validation, Error Handling)
```

**Why?**
- **Routes**: Define endpoints only (no logic)
- **Controllers**: Orchestrate (validate input, call DB, format response)
- **Database layer**: Pure SQL queries (no HTTP logic)
- **Testability**: Mock DB functions, test controllers independently

### 3. **Plugin System (Fastify)**
Fastify uses **plugins** to modularize setup:
- Plugins can decorate the Fastify instance (add properties)
- Plugins run during server initialization
- **`fastify-plugin`** wrapper ensures decorations propagate to child contexts (routes)

---

## Request Flow

### Example: `GET /api/chat/messages/:chatId`

```
1. Client Request
   ↓
2. Fastify Router (routes/chats.ts)
   → Matches `/api/chat/messages/:chatId`
   → Calls `getMessagesHandler`
   ↓
3. Controller (controllers/chatsController.ts)
   → Extracts `chatId` from params
   → Validates input (parseInt, isNaN check)
   → Gets DB instance from `req.server.db`
   → Calls `getMessages(db, chatId)`
   ↓
4. Database Layer (database/conversations.ts)
   → Prepares SQL statement
   → Executes query
   → Returns raw rows
   ↓
5. Controller
   → Returns rows to client (Fastify auto-serializes JSON)
   ↓
6. Client receives response
```

### Code Walkthrough

**Route Registration** (`routes/chats.ts`):
```typescript
fastify.get("/api/chat/messages/:chatId", getMessagesHandler);
```
- Maps HTTP GET to handler function
- `:chatId` is a route parameter (dynamic)

**Controller** (`controllers/chatsController.ts`):
```typescript
export async function getMessagesHandler(req: any, reply: any) {
  const chatId = parseInt(req.params.chatId);  // Extract param
  if (isNaN(chatId)) return reply.status(400).send({ error: "Invalid chatId" });

  const db = req.server.db;  // Get DB from Fastify instance
  return getMessages(db, chatId);  // Call DB function
}
```
- `req.server.db` → DB instance decorated by plugin
- Returns data directly (Fastify handles serialization)

**Database Function** (`database/conversations.ts`):
```typescript
export function getMessages(db: Database.Database, chatId: number) {
  const stmt = db.prepare(`SELECT * FROM messages WHERE chat_id = ?`);
  return stmt.all(chatId);  // Returns array of rows
}
```
- Pure SQL logic
- No HTTP awareness
- Receives DB instance as dependency (injection pattern)

---

## Database Plugin Deep Dive

### Why Use a Plugin?

**Problem**: Multiple files need DB access. Options:
1. ❌ Each file opens its own DB connection → resource waste, inconsistent state
2. ❌ Global variable → hard to test, hidden dependencies
3. ✅ **Plugin**: Centralized, lifecycle-managed, injectable

### Plugin Implementation (`plugins/db.ts`)

```typescript
import fp from "fastify-plugin";
import Database from "better-sqlite3";

async function dbPlugin(fastify: any, opts: any) {
  // 1. Open database
  const db = new Database(path.join(__dirname, "../database/chat.db"));

  // 2. Configure SQLite
  db.pragma("foreign_keys = ON");  // Enforce FK constraints

  // 3. Decorate Fastify instance
  fastify.decorate("db", db);
  // Now: fastify.db and req.server.db are available

  // 4. Cleanup on shutdown
  fastify.addHook("onClose", async (instance, done) => {
    db.close();
    console.log("Database connection closed");
    done();
  });
}

// Wrap with fastify-plugin to propagate decoration
export default fp(dbPlugin);
```

### Key Concepts

#### 1. **`fastify.decorate("db", db)`**
Adds a new property `db` to the Fastify instance.

**Access patterns**:
- In route handlers: `req.server.db` or `reply.server.db`
- In plugins: `fastify.db`
- In server.ts: `(fastify as any).db`

#### 2. **`fastify-plugin` Wrapper**
```typescript
export default fp(dbPlugin);
```

**Without `fp`**:
- Decoration is scoped to the encapsulation context
- Child plugins (routes) won't see `db`

**With `fp`**:
- Decoration propagates to all contexts
- Routes registered later can access `db`

#### 3. **Lifecycle Hook (`onClose`)**
```typescript
fastify.addHook("onClose", async (instance, done) => {
  db.close();
  done();
});
```
- Runs when `fastify.close()` is called
- Ensures DB connection closes gracefully
- Prevents resource leaks

### Low-Level: How `decorate` Works

```typescript
// Simplified internal implementation
Fastify.prototype.decorate = function(name, value) {
  this[name] = value;  // Add property to instance
  
  // Make available on request/reply via getter
  Object.defineProperty(Request.prototype, name, {
    get() { return this.server[name]; }
  });
}
```

**Result**:
```typescript
const fastify = Fastify();
fastify.decorate("db", myDatabase);

// Now accessible as:
fastify.db              // ✅
req.server.db           // ✅ (in route handlers)
reply.server.db         // ✅
```

### Registration Order Matters

```typescript
// server.ts
await fastify.register(dbPlugin);      // 1. DB plugin first
await fastify.register(chatsRoutes);   // 2. Routes second (can access db)
```

Routes registered **before** the plugin won't see the decoration.

---

## Socket.IO Integration

### Architecture

Socket.IO runs on the same HTTP server as Fastify but handles WebSocket connections independently.

```typescript
// server.ts
const start = async () => {
  await fastify.listen({ port: 4545, host: "0.0.0.0" });
  const io = initSocket(fastify.server, fastify.db);  // Pass DB to sockets
};
```

### Socket Handler (`socket/index.ts`)

```typescript
export function initSocket(server: any, db: Database.Database) {
  const io = new Server(server, { cors: { origin: "*" } });
  
  io.on("connection", (socket) => {
    // 1. Authenticate user from handshake
    const userId = parseInt(socket.handshake.auth.user_id);
    if (isNaN(userId)) return socket.disconnect();

    // 2. Track online users
    onlineUsers.set(userId, socket);

    // 3. Handle incoming messages
    socket.on("ChatMessage", async (data) => {
      const { chatId, sender, receiver, message } = data;
      
      // Save to DB
      const newMessage = insert_message(db, chatId, sender, receiver, message);
      
      // Emit to sender
      socket.emit("ChatMessage", newMessage);
      
      // Emit to receiver (if online)
      const receiverSocket = onlineUsers.get(receiver);
      if (receiverSocket) receiverSocket.emit("ChatMessage", newMessage);
    });

    // 4. Cleanup on disconnect
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
    });
  });

  return io;
}
```

### Why Pass `db` to Socket Handler?

Sockets need to persist messages. Instead of opening a new DB connection:
- Use the same DB instance from the plugin
- Consistent with HTTP handlers
- Single connection pool

### Online User Tracking

```typescript
const onlineUsers: Map<number, Socket> = new Map();
```

**Purpose**: Know which users are connected to deliver real-time messages.

**Flow**:
1. User connects → `onlineUsers.set(userId, socket)`
2. Message arrives → Check `onlineUsers.get(receiverId)`
3. If online → emit to their socket
4. User disconnects → `onlineUsers.delete(userId)`

---

## Best Practices

### 1. **Dependency Injection**
❌ **Bad**: Global DB variable
```typescript
// database.ts
const db = new Database("chat.db");  // Global
export function getMessages(chatId) {
  return db.prepare("...").all(chatId);
}
```

✅ **Good**: Inject DB as parameter
```typescript
export function getMessages(db: Database.Database, chatId: number) {
  return db.prepare("...").all(chatId);
}
```

**Benefits**: Testable, flexible, no hidden dependencies

### 2. **Use Prepared Statements**
❌ **Dangerous**: String concatenation (SQL injection risk)
```typescript
db.exec(`SELECT * FROM messages WHERE id = ${messageId}`);
```

✅ **Safe**: Parameterized queries
```typescript
db.prepare("SELECT * FROM messages WHERE id = ?").get(messageId);
```

### 3. **Validate All Input**
```typescript
const chatId = parseInt(req.params.chatId);
if (isNaN(chatId)) return reply.status(400).send({ error: "Invalid chatId" });
```

Never trust client input. Validate before DB queries.

### 4. **Single Responsibility**
Each layer has one job:
- **Routes**: Map URLs to handlers
- **Controllers**: Orchestrate and validate
- **Database**: Execute queries
- **Socket handlers**: Manage real-time events

### 5. **Error Handling**
```typescript
fastify.setErrorHandler((error, request, reply) => {
  console.error("Fastify error:", error);
  reply.status(500).send({ error: "Internal Server Error" });
});
```

Centralized error handler catches unhandled exceptions.

### 6. **Graceful Shutdown**
```typescript
fastify.addHook("onClose", async () => {
  db.close();
  io.close();
});
```

Close resources properly on shutdown (SIGTERM/SIGINT).

---

## Summary

### Key Takeaways
1. **Plugin system** provides centralized, lifecycle-managed resources (DB)
2. **`fastify-plugin`** ensures decorations propagate to all contexts
3. **Separation of concerns** keeps code maintainable (routes → controllers → DB)
4. **Dependency injection** (passing `db`) enables testing and flexibility
5. **Socket.IO integration** shares the same HTTP server and DB instance

### Request Path Recap
```
Client → Fastify Router → Controller (gets db from req.server.db) 
       → Database Function (receives db as param) → SQLite → Response
```

### Plugin Lifecycle
```
1. server.ts registers plugin
2. dbPlugin opens DB, decorates fastify
3. Routes registered (can access fastify.db via req.server.db)
4. Handlers execute, use DB
5. On shutdown, onClose hook closes DB
```

---

**Next Steps**: See `DATABASE.md` for SQLite optimization and `SOCKET.md` for Socket.IO patterns.
