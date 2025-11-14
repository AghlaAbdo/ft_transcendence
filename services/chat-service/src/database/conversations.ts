import Database from "better-sqlite3";

export function getMessages(db: Database.Database, chatId: number) {
  try {
    const stmt = db.prepare(`
      SELECT c.id, c.chat_id, c.sender, c.receiver, c.content, c.created_at
      FROM messages c
      WHERE c.chat_id = ?
    `);
    const result = stmt.all(chatId);

    if (!result){
      return {
        status: false,
        messages: [],
      };
    }
    return {
      status:  true,
      messages: result,
    }
  } catch (error) {
    console.log('getMessages error:', error);
    return {
      status: false,
      messages: [],
    };
  }
}

export function create_new_chat(
  db: Database.Database,
  sender: number,
  receiver: number,
  message: string
) {
  try {
    const stmt = db.prepare(
      `INSERT INTO chats (sender, receiver, last_message_content) VALUES (?, ?, ?)`
    );
    const result = stmt.run(sender, receiver, message);
    return result.lastInsertRowid;
  } catch (error) {
    console.log("some thing went wrong: ", error);
    return null;
  }
}

export function insert_message(db: Database.Database, chat_id: number, sender: number, receiver: number, content: string) {
  try {
    const updateChatStmt = db.prepare(`
      UPDATE chats
      SET last_message_content = ?,
      last_message_timestamp = CURRENT_TIMESTAMP
      WHERE chat_id = ?`);

    const insertStmt = db.prepare(`
      INSERT INTO messages (chat_id, sender, receiver, content)
      VALUES (?, ?, ?, ?)
      `);

    const selectStmt = db.prepare("SELECT * FROM messages WHERE id = ?");
    const info = insertStmt.run(chat_id, sender, receiver, content);
    const newMessageId = info.lastInsertRowid as number;
    updateChatStmt.run(content, chat_id);
    const last_msg = selectStmt.get(newMessageId);
    return last_msg;
  } catch (error) {
    console.log('something went wrong: ', error);
    return null;
  }
}

export function get_existing_chat(
  db: Database.Database,
  user1: number,
  user2: number
) {
  try {
    const stmt = db.prepare(`
      SELECT chat_id 
      FROM chats 
      WHERE (sender = ? AND receiver = ?) 
         OR (sender = ? AND receiver = ?)
      LIMIT 1
    `);
    const result = stmt.get(user1, user2, user2, user1);
    return result ? (result as any).chat_id : null;
  } catch (error) {
    console.error('get_existing_chat error:', error);
    return null;
  }
}