import Database from "better-sqlite3";

export function getChats(db: Database.Database, userId: number) {
  try {
    const stmt = db.prepare(`
      SELECT c.chat_id, c.sender, c.receiver, c.last_message_content, c.last_message_timestamp
      FROM chats c
      WHERE c.sender = ? OR c.receiver = ?
      ORDER BY c.last_message_timestamp DESC
    `);
    const  result = stmt.all(userId, userId);
    return {
      status: true,
      result: result }
  } catch (error) {
    console.error("Failed to get chats:", error);
    return {status: false, result:[]};
  }
}
