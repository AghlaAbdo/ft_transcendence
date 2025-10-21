import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (fastify: any, opts: any) {
  const dbPath = path.join(__dirname, "../database/chat.db");

  let db: Database.Database;
  try {
    db = new Database(dbPath);
  } catch (err) {
    console.error("Failed to open database:", err);
    // fail fast
    throw err;
  }

  // Pragmas for SQLite stability under concurrency
  try {
    db.pragma("foreign_keys = ON");
  } catch (err) {
    console.warn("Failed to apply PRAGMAs:", err);
  }

  // expose db on fastify instance
  fastify.decorate("db", db);

  fastify.addHook("onClose", async (instance: any, done: any) => {
    try {
      db.close();
      console.log("Database connection closed");
    } catch (err) {
      console.error("Error closing database:", err);
    }
    done();
  });
}
