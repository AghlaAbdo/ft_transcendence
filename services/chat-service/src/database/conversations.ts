import Database from "better-sqlite3";

export function getMessages(db: Database.Database, chatId: number) {
  const stmt = db.prepare(`
    SELECT c.id, c.chat_id, c.sender, c.receiver, c.content, c.created_at
    FROM messages c
    WHERE c.chat_id = ?
  `);
  return stmt.all(chatId);
}

export function getMessage(db: Database.Database, MessageId: number) {
  const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
  return stmt.get(MessageId);
}

export function insert_message(db: Database.Database, chat_id: number, sender: number, receiver: number, content: string) {
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

  const info = insertStmt.run(chat_id, sender, receiver, content);
  const newMessageId = info.lastInsertRowid as number;
  updateChatStmt.run(content, chat_id);
  const last_msg = selectStmt.get(newMessageId);
  return last_msg;
}