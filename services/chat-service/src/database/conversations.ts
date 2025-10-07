import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../database/chat.db"));

export function getMessages(chatId: number) {
  const stmt = db.prepare(`
    SELECT c.id, c.chat_id, c.sender, c.receiver, c.content, c.created_at
    FROM messages c
    WHERE c.chat_id = ?
  `);
  return stmt.all(chatId);
}

const updateChatStmt = db.prepare(`
  UPDATE chats
  SET last_message_content = ?,
      last_message_timestamp = CURRENT_TIMESTAMP
  WHERE chat_id = ?`
);

const insertStmt = db.prepare(`
  INSERT INTO messages (chat_id, sender, receiver, content)
  VALUES (?, ?, ?, ?)
`);

const selectStmt = db.prepare('SELECT * FROM messages WHERE id = ?');

export const getMessage = (MessageId: number) =>
{
  return selectStmt.get(MessageId)
}

export function insert_message(chat_id: number, sender: number, receiver: number, content: string) {
  console.log("chat : " + chat_id + ", sender: " + sender + " reciver: " + receiver + " content: " + content);
  const info = insertStmt.run(chat_id, sender, receiver, content);
  const newMessageId = info.lastInsertRowid as number;
  updateChatStmt.run(content, chat_id);
  const last_msg = selectStmt.get(newMessageId); // fetch the full inserted row
  return last_msg;
}