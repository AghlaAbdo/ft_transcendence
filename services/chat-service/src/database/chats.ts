import Database from "better-sqlite3";

type ChatRow = {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id: number;
};

export function getChats(db: Database.Database, userId: number): ChatRow[] {
  try {
    const stmt = db.prepare(`
      SELECT c.chat_id, c.sender, c.receiver, c.last_message_content, c.last_message_timestamp, c.last_message_id
      FROM chats c
      WHERE c.sender = ? OR c.receiver = ?
      ORDER BY c.last_message_timestamp DESC
    `);
    return stmt.all(userId, userId) as ChatRow[];
  } catch (error) {
    console.error("Failed to get chats:", error);
    return [];
  }
}
