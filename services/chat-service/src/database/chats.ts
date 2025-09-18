import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../database/chat.db"));

export function getChats(userId: number) {
  const stmt = db.prepare(`
    SELECT c.chat_id, c.sender, c.receiver, c.last_message_content, c.last_message_timestamp, c.last_message_id
    FROM chats c
    WHERE c.sender = ? OR c.receiver = ?
    ORDER BY c.last_message_timestamp DESC
  `);
  return stmt.all(userId, userId);
}