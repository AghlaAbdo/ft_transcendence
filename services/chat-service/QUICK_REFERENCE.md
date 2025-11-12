# Quick Reference Guide

## Server Startup Flow

```typescript
// 1. Import dependencies
import Fastify from "fastify";
import dbPlugin from "./plugins/db.js";
import chatsRoutes from "./routes/chats.js";

// 2. Create Fastify instance
const fastify = Fastify();

// 3. Register plugins (ORDER MATTERS!)
await fastify.register(cors, { origin: "*" });
await fastify.register(dbPlugin);      // DB first
await fastify.register(chatsRoutes);   // Routes second (can access db)

// 4. Add error handler
fastify.setErrorHandler((error, request, reply) => {
  console.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

// 5. Start server
await fastify.listen({ port: 4545, host: "0.0.0.0" });
```

---

## Database Access Pattern

### In Controllers
```typescript
export async function getMessagesHandler(req: any, reply: any) {
  // 1. Get DB from Fastify instance
  const db = req.server.db;
  
  // 2. Validate input
  const chatId = parseInt(req.params.chatId);
  if (isNaN(chatId)) {
    return reply.status(400).send({ error: "Invalid chatId" });
  }
  
  // 3. Call database function (pass db explicitly)
  const messages = getMessages(db, chatId);
  
  // 4. Return data (Fastify auto-serializes)
  return messages;
}
```

### In Database Layer
```typescript
export function getMessages(db: Database.Database, chatId: number) {
  // Prepared statement (safe from SQL injection)
  const stmt = db.prepare(`
    SELECT id, chat_id, sender, receiver, content, created_at
    FROM messages
    WHERE chat_id = ?
  `);
  
  return stmt.all(chatId);  // Returns array
}
```

### In Socket Handlers
```typescript
export function initSocket(server: any, db: Database.Database) {
  const io = new Server(server);
  
  io.on("connection", (socket) => {
    socket.on("ChatMessage", async (data) => {
      // Use the same DB instance passed from server.ts
      const newMessage = insert_message(db, data.chatId, data.sender, data.receiver, data.message);
      
      socket.emit("ChatMessage", newMessage);
    });
  });
  
  return io;
}
```

---

## Common Patterns

### Validate Request Parameters
```typescript
// Parse and validate
const id = parseInt(req.params.id);
if (isNaN(id)) {
  return reply.status(400).send({ error: "Invalid ID" });
}

// Type guard
if (!data.message || typeof data.message !== "string") {
  return reply.status(400).send({ error: "Invalid message" });
}
```

### Error Handling
```typescript
try {
  const result = await someOperation();
  return result;
} catch (err) {
  console.error("Operation failed:", err);
  return reply.status(500).send({ error: "Operation failed" });
}
```

### Transactions
```typescript
// For multiple related DB operations
export function createChatWithMessage(db: Database.Database, userId1: number, userId2: number, message: string) {
  const transaction = db.transaction(() => {
    // 1. Create chat
    const chatInfo = db.prepare("INSERT INTO chats (sender, receiver) VALUES (?, ?)").run(userId1, userId2);
    const chatId = chatInfo.lastInsertRowid as number;
    
    // 2. Insert first message
    db.prepare("INSERT INTO messages (chat_id, sender, receiver, content) VALUES (?, ?, ?, ?)").run(chatId, userId1, userId2, message);
    
    return chatId;
  });
  
  return transaction();  // Execute atomically
}
```

---

## File Checklist

### When Adding a New Route

1. **Create handler in controller** (`controllers/`)
```typescript
export async function myHandler(req: any, reply: any) {
  const db = req.server.db;
  // ... logic
}
```

2. **Register route** (`routes/chats.ts`)
```typescript
fastify.get("/api/chat/my-endpoint", myHandler);
```

3. **Create DB function** (`database/`)
```typescript
export function myQuery(db: Database.Database, param: any) {
  return db.prepare("SELECT ...").all(param);
}
```

---

## Debugging Tips

### Check if DB is Available
```typescript
export async function handler(req: any, reply: any) {
  const db = req.server.db;
  
  if (!db) {
    console.error("DB not available!");
    return reply.status(500).send({ error: "Database not initialized" });
  }
  
  // ... rest of logic
}
```

### Log Request Details
```typescript
fastify.addHook("onRequest", async (req, reply) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Params:", req.params);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
});
```

### Test DB Connection
```typescript
// In dbPlugin after opening DB
try {
  const result = db.prepare("SELECT 1 as test").get();
  console.log("DB connection test:", result);
} catch (err) {
  console.error("DB connection failed:", err);
}
```

---

## Performance Optimization

### Use Indexes
```sql
-- In your schema
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_chats_user_ids ON chats(sender, receiver);
```

### Limit Results
```typescript
// Don't return all messages
const stmt = db.prepare(`
  SELECT * FROM messages 
  WHERE chat_id = ? 
  ORDER BY created_at DESC 
  LIMIT 50
`);
```

### Pagination
```typescript
export function getMessages(db: Database.Database, chatId: number, limit = 50, offset = 0) {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE chat_id = ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  
  return stmt.all(chatId, limit, offset);
}
```

---

## Security Checklist

-  Use parameterized queries (prepared statements)
-  Validate all inputs (parse, check types, ranges)
-  Don't expose raw error messages to clients
-  Use CORS correctly (don't use `*` in production)
-  Authenticate socket connections
-  Rate limit endpoints
-  Sanitize user-generated content
-  Enable SQLite foreign keys

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read properties of undefined (reading 'prepare')` | `db` is undefined | Check plugin registration order, ensure `fp()` wrapper |
| `SQLITE_BUSY: database is locked` | Concurrent writes | Enable WAL mode, use transactions |
| `column X does not exist` | Schema mismatch | Check table schema, run migrations |
| `no such table: X` | DB not initialized | Ensure DB file exists, check path |
| `fastify.db is not a function` | Wrong access pattern | Use `req.server.db`, not `req.db` |

---

## Environment Variables

Create `.env` file:
```env
CHAT_DB_PATH=/app/data/chat.db
PORT=4545
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
```

Use in plugin:
```typescript
const dbPath = process.env.CHAT_DB_PATH || path.join(__dirname, "../database/chat.db");
```

---

## Testing Snippets

### Test Route
```typescript
import { test } from "tap";
import { build } from "./helper.js";

test("GET /api/chat/messages/:chatId", async (t) => {
  const app = await build(t);
  
  const res = await app.inject({
    method: "GET",
    url: "/api/chat/messages/1"
  });
  
  t.equal(res.statusCode, 200);
  const data = res.json();
  t.ok(Array.isArray(data));
});
```

### Test Database Function
```typescript
import { test } from "tap";
import Database from "better-sqlite3";
import { getMessages } from "../database/conversations.js";

test("getMessages returns messages for chat", (t) => {
  const db = new Database(":memory:");
  db.exec("CREATE TABLE messages (id INTEGER PRIMARY KEY, chat_id INTEGER, content TEXT)");
  db.prepare("INSERT INTO messages (chat_id, content) VALUES (?, ?)").run(1, "Hello");
  
  const messages = getMessages(db, 1);
  
  t.equal(messages.length, 1);
  t.equal(messages[0].content, "Hello");
  t.end();
});
```

---

## Docker Integration

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Ensure DB directory exists
RUN mkdir -p /app/src/database

# Expose port
EXPOSE 4545

# Start server
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
services:
  chat-service:
    build: ./services/chat-service
    ports:
      - "4545:4545"
    volumes:
      - ./data/chat.db:/app/src/database/chat.db
    environment:
      - NODE_ENV=production
      - CHAT_DB_PATH=/app/src/database/chat.db
```

---

## Migration Strategy

When updating the database schema:

```typescript
// migrations/001_add_read_status.ts
export function up(db: Database.Database) {
  db.exec(`
    ALTER TABLE messages 
    ADD COLUMN read_status INTEGER DEFAULT 0
  `);
  
  db.exec(`
    CREATE INDEX idx_messages_read_status 
    ON messages(read_status)
  `);
}

export function down(db: Database.Database) {
  // SQLite doesn't support DROP COLUMN easily
  // Create new table without column, copy data, swap
}
```

Run migrations in plugin:
```typescript
// In dbPlugin
import { runMigrations } from "./migrations/index.js";

async function dbPlugin(fastify, opts) {
  const db = new Database(dbPath);
  
  // Run migrations on startup
  runMigrations(db);
  
  fastify.decorate("db", db);
}
```

---

## Production Checklist

- [ ] Enable WAL mode for SQLite
- [ ] Set `busy_timeout` to handle locks
- [ ] Use environment variables for config
- [ ] Add health check endpoint
- [ ] Implement graceful shutdown
- [ ] Add request logging
- [ ] Set up monitoring/metrics
- [ ] Use HTTPS in production
- [ ] Restrict CORS origins
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Handle errors gracefully
- [ ] Set up automated backups for DB
- [ ] Add integration tests
- [ ] Document all endpoints

---

## Resources

- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [fastify-plugin](https://github.com/fastify/fastify-plugin)
- [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [SQLite PRAGMA Statements](https://www.sqlite.org/pragma.html)
