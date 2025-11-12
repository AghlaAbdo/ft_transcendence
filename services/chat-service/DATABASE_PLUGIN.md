# Database Plugin - Deep Dive

## What is a Fastify Plugin?

A **plugin** in Fastify is a reusable module that encapsulates functionality and can modify the Fastify instance.

### Plugin Anatomy

```typescript
async function myPlugin(fastify, options) {
  // Setup code runs once during registration
  
  // You can:
  // 1. Add routes
  fastify.get('/endpoint', handler);
  
  // 2. Decorate (add properties)
  fastify.decorate('myProperty', value);
  
  // 3. Add hooks (middleware)
  fastify.addHook('onRequest', async (req, reply) => {});
  
  // 4. Register other plugins
  await fastify.register(anotherPlugin);
}

// Use it
fastify.register(myPlugin, { /* options */ });
```

---

## The Database Plugin Explained

### Full Code with Annotations

```typescript
import fp from "fastify-plugin";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main plugin function
async function dbPlugin(fastify: any, opts: any) {
  // ===== STEP 1: Open Database Connection =====
  const dbPath = path.join(__dirname, "../database/chat.db");
  
  let db: Database.Database;
  try {
    db = new Database(dbPath);
    // better-sqlite3 opens DB synchronously
    // DB is now ready for queries
  } catch (err) {
    console.error("Failed to open database:", err);
    throw err;  // Fail fast if DB can't open
  }

  // ===== STEP 2: Configure SQLite =====
  try {
    // Enable foreign key constraints
    // Default: OFF in SQLite (for backwards compatibility)
    db.pragma("foreign_keys = ON");
    
    // Optional: WAL mode for better concurrency
    // db.pragma("journal_mode = WAL");
    
    // Optional: Set busy timeout (wait if DB locked)
    // db.pragma("busy_timeout = 5000");
  } catch (err) {
    console.warn("Failed to apply PRAGMAs:", err);
  }

  // ===== STEP 3: Decorate Fastify Instance =====
  fastify.decorate("db", db);
  // This adds 'db' property to fastify object
  // Now accessible as: fastify.db, req.server.db, reply.server.db
  
  console.log("Database plugin registered successfully");

  // ===== STEP 4: Register Cleanup Hook =====
  fastify.addHook("onClose", async (instance: any, done: any) => {
    // This runs when fastify.close() is called
    // (e.g., on SIGTERM, SIGINT, or manual shutdown)
    
    try {
      db.close();
      console.log("Database connection closed");
    } catch (err) {
      console.error("Error closing database:", err);
    }
    done();  // Signal hook completion
  });
}

// ===== STEP 5: Wrap with fastify-plugin =====
export default fp(dbPlugin);
// This makes the plugin "global" - decorations propagate to all contexts
```

---

## Deep Dive: Key Concepts

### 1. `fastify.decorate(name, value)`

**What it does**: Adds a new property to the Fastify instance.

**Low-level implementation (simplified)**:
```typescript
Fastify.prototype.decorate = function(name, value) {
  if (this[name] !== undefined) {
    throw new Error(`Property '${name}' already exists`);
  }
  
  this[name] = value;  // Add to instance
  
  // Make accessible via request/reply
  this.decorateRequest(name, null);
  this.decorateReply(name, null);
};
```

**Accessibility**:
```typescript
// After: fastify.decorate("db", database)

fastify.db              // Direct access
req.server.db           // In route handlers
reply.server.db         // In route handlers
```

**Why `req.server`?**
- `req.server` is a reference to the Fastify instance
- All decorations on `fastify` are accessible via `server`

---

### 2. `fastify-plugin` Wrapper

**Problem without `fp`**:
```typescript
// server.ts
await fastify.register(dbPlugin);      // Creates encapsulated context
await fastify.register(routesPlugin);  // Different context - can't see 'db'!
```

Fastify uses **encapsulation** by default. Each plugin has its own scope.

**Solution with `fp`**:
```typescript
import fp from "fastify-plugin";
export default fp(dbPlugin);
```

Now `db` decoration is visible to ALL plugins registered after it.

**How it works (simplified)**:
```typescript
function fp(plugin) {
  plugin[Symbol.for('skip-override')] = true;  // Mark as "global"
  return plugin;
}
```

**Encapsulation Visual**:
```
Without fp:
┌─ fastify (root)
│  └─ dbPlugin → db (scoped)
│  └─ routesPlugin → can't see db

With fp:
┌─ fastify (root)
│  └─ dbPlugin → db  (propagates up)
└─ routesPlugin → can see db 
```

---

### 3. Lifecycle Hooks

Fastify has a request lifecycle with hooks at each stage:

```
onRequest → preParsing → preValidation → preHandler 
  → handler → preSerialization → onSend → onResponse
```

**Global hooks** run for every request.

**Plugin hooks**: `onClose`, `onReady`, `onRoute`, etc.

**`onClose` Hook**:
```typescript
fastify.addHook("onClose", async (instance, done) => {
  // Cleanup code
  db.close();
  done();  // Must call done() or return a promise
});
```

**When it runs**:
- `fastify.close()` is called
- Process receives SIGTERM/SIGINT
- Server is shutting down

**Why it matters**:
- Prevents orphaned DB connections
- Ensures data is flushed
- Clean shutdown for Docker/Kubernetes

---

## How Database Access Works in Handlers

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Server Startup                                              │
├─────────────────────────────────────────────────────────────┤
│ 1. fastify.register(dbPlugin)                               │
│    └─ Opens DB, decorates fastify.db                        │
│                                                              │
│ 2. fastify.register(routesPlugin)                           │
│    └─ Registers routes (handlers can access req.server.db)  │
│                                                              │
│ 3. await fastify.listen(...)                                │
│    └─ Server starts accepting requests                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Request Processing                                          │
├─────────────────────────────────────────────────────────────┤
│ Client Request                                              │
│   ↓                                                          │
│ Router matches /api/chat/messages/:chatId                   │
│   ↓                                                          │
│ Calls: getMessagesHandler(req, reply)                       │
│   ↓                                                          │
│ Handler: const db = req.server.db  ← Gets DB from instance  │
│   ↓                                                          │
│ Calls: getMessages(db, chatId)     ← Passes DB explicitly   │
│   ↓                                                          │
│ DB function executes query                                  │
│   ↓                                                          │
│ Returns rows to handler                                     │
│   ↓                                                          │
│ Handler returns data (Fastify serializes to JSON)           │
│   ↓                                                          │
│ Response sent to client                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Shutdown                                                    │
├─────────────────────────────────────────────────────────────┤
│ fastify.close() or process signal (SIGTERM)                │
│   ↓                                                          │
│ onClose hooks run                                           │
│   ↓                                                          │
│ dbPlugin onClose: db.close()                                │
│   ↓                                                          │
│ Server stops                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Alternative Approaches (and Why Plugin is Better)

### Approach 1: Global Variable

```typescript
// database.ts
export const db = new Database("chat.db");

// controller.ts
import { db } from "./database.js";
export function handler(req, reply) {
  return db.prepare("...").all();
}
```

**Problems**:
- Hidden dependency (not explicit in function signature)
- Hard to test (can't mock DB easily)
- No lifecycle management (when to close?)
- Module initialization order matters

---

### Approach 2: Open Connection per Request

```typescript
export function handler(req, reply) {
  const db = new Database("chat.db");  // Open fresh connection
  const result = db.prepare("...").all();
  db.close();
  return result;
}
```

**Problems**:
- Slow (opening DB is expensive)
- Resource waste (connection overhead)
- Can't use prepared statements effectively

---

###  Approach 3: Plugin (Current)

```typescript
// plugin opens DB once
fastify.decorate("db", db);

// handler uses shared instance
export function handler(req, reply) {
  const db = req.server.db;  // Explicit dependency
  return db.prepare("...").all();
}
```

**Benefits**:
- Single connection (efficient)
- Explicit dependency (testable)
- Lifecycle managed (closes on shutdown)
- Easy to mock in tests

---

## Testing with the Plugin

### Unit Test Example

```typescript
import { test } from "tap";
import { build } from "./helper.js";  // Helper to build Fastify app

test("GET /api/chat/messages/:chatId returns messages", async (t) => {
  const app = await build(t);  // Builds app with plugin
  
  const response = await app.inject({
    method: "GET",
    url: "/api/chat/messages/1"
  });
  
  t.equal(response.statusCode, 200);
  t.ok(Array.isArray(response.json()));
});
```

### Mock Database in Tests

```typescript
// test-helper.ts
export async function build(t) {
  const app = Fastify();
  
  // Use in-memory DB for tests
  const testDb = new Database(":memory:");
  testDb.exec("CREATE TABLE messages (...)");
  
  // Decorate with test DB
  app.decorate("db", testDb);
  
  // Register routes
  await app.register(routes);
  
  // Cleanup after test
  t.teardown(() => {
    testDb.close();
    app.close();
  });
  
  return app;
}
```

---

## Common Issues and Solutions

### Issue 1: `req.server.db` is undefined

**Symptom**: `Cannot read properties of undefined (reading 'prepare')`

**Causes**:
1. Plugin not registered: `await fastify.register(dbPlugin)` missing
2. Plugin not wrapped with `fp`: Decoration doesn't propagate
3. Routes registered before plugin: Order matters

**Solution**:
```typescript
// Correct order
await fastify.register(dbPlugin);    // 1. DB first
await fastify.register(routes);      // 2. Routes second

// Use fp in plugin
export default fp(dbPlugin);
```

---

### Issue 2: Database locked errors

**Symptom**: `SQLITE_BUSY: database is locked`

**Cause**: Multiple writes happening simultaneously (SQLite limitation)

**Solution**:
```typescript
// In plugin
db.pragma("journal_mode = WAL");     // Write-Ahead Logging
db.pragma("busy_timeout = 5000");    // Wait 5s if locked
```

**Alternative**: Use transactions for multi-statement operations
```typescript
const transaction = db.transaction((messages) => {
  for (const msg of messages) {
    insertStmt.run(msg);
  }
});

transaction(messageArray);  // Atomic
```

---

### Issue 3: DB not closing properly

**Symptom**: Process hangs on shutdown

**Cause**: `onClose` hook not registered or not calling `done()`

**Solution**:
```typescript
fastify.addHook("onClose", async (instance, done) => {
  db.close();
  done();  // MUST call done() or return promise
});
```

---

## Performance Considerations

### 1. Prepared Statements

**Slow** (parses SQL every time):
```typescript
for (let i = 0; i < 1000; i++) {
  db.prepare("INSERT INTO ...").run(data[i]);
}
```

**Fast** (parses once, reuses):
```typescript
const stmt = db.prepare("INSERT INTO ...");
for (let i = 0; i < 1000; i++) {
  stmt.run(data[i]);
}
```

### 2. Transactions

**Slow** (1000 separate writes):
```typescript
for (const row of rows) {
  db.prepare("INSERT ...").run(row);
}
```

**Fast** (single transaction):
```typescript
const insert = db.transaction((rows) => {
  for (const row of rows) {
    stmt.run(row);
  }
});

insert(rows);  // 100x faster
```

### 3. WAL Mode

```typescript
db.pragma("journal_mode = WAL");
```

**Benefits**:
- Readers don't block writers
- Writers don't block readers
- Better concurrency

**Trade-offs**:
- Additional file (`chat.db-wal`)
- Slightly more complex

---

## Summary

### Plugin Benefits
1. **Single connection**: Efficient resource usage
2. **Lifecycle management**: Auto-cleanup on shutdown
3. **Dependency injection**: Explicit, testable
4. **Encapsulation**: Self-contained setup logic
5. **Reusability**: Easy to share across projects

### Key Patterns
- Use `fastify.decorate()` to add properties
- Wrap with `fp()` to propagate decorations
- Access via `req.server.db` in handlers
- Register `onClose` hook for cleanup
- Pass `db` explicitly to functions

### Remember
- **Register order matters**: Plugin before routes
- **Always use `fp`**: Or decorations won't propagate
- **Call `done()` in hooks**: Or server won't shut down cleanly
- **Use prepared statements**: For performance and security
