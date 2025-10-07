import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

type ChatRow = {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// try

  const db = new Database(path.join(__dirname, "../database/chat.db"));



export function getChats(userId: number) : ChatRow[]{
  const stmt = db.prepare(`
    SELECT c.chat_id, c.sender, c.receiver, c.last_message_content, c.last_message_timestamp, c.last_message_id
    FROM chats c
    WHERE c.sender = ? OR c.receiver = ?
    ORDER BY c.last_message_timestamp DESC
  `);
  return  stmt.all(userId, userId) as ChatRow[];
}