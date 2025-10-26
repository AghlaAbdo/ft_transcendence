import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fp from "fastify-plugin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dbPlugin(fastify: any, opts: any) {
  const dbPath = path.join(__dirname, "../database/chat.db");
  const schemaPath = path.join(__dirname, "../database/schema.sql");

  let db: Database.Database;
  try {
    db = new Database(dbPath);
  } catch (err) {
    console.error("Failed to open database:", err);
    throw err;
  }

  try {
    db.pragma("foreign_keys = ON");
  } catch (err) {
    console.warn("Failed to apply PRAGMAs:", err);
  }

  // Initialize database schema if tables don't exist
  try {
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);
    console.log("Database schema initialized successfully");
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
    throw err;
  }

  fastify.decorate("db", db);
  console.log("Database plugin registered successfully");

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

export default fp(dbPlugin);
